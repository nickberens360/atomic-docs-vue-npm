<template>
  <div class="docs-color-picker">
    <!-- Color display and input -->
    <div class="docs-color-picker-header">
      <div 
        class="docs-color-preview" 
        :style="{ backgroundColor: modelValue }"
      ></div>
      <input 
        v-model="colorValue" 
        class="docs-color-input"
        @change="updateColor"
      />
    </div>

    <!-- Color canvas -->
    <div class="docs-color-canvas-container">
      <canvas 
        ref="saturationCanvas" 
        class="docs-saturation-canvas"
        @mousedown="startSaturationDrag"
        @touchstart="startSaturationDrag"
      ></canvas>
      <div 
        class="docs-saturation-pointer" 
        :style="{ 
          left: `${saturationPointerPosition.x}%`, 
          top: `${saturationPointerPosition.y}%` 
        }"
      ></div>
    </div>

    <!-- Hue slider -->
    <div class="docs-hue-container">
      <div 
        class="docs-hue-track"
        ref="hueTrack"
        @mousedown="startHueDrag"
        @touchstart="startHueDrag"
      ></div>
      <div 
        class="docs-hue-thumb" 
        :style="{ left: `${huePosition}%` }"
      ></div>
    </div>

    <!-- Alpha slider (optional) -->
    <div v-if="showAlpha" class="docs-alpha-container">
      <div 
        class="docs-alpha-track"
        ref="alphaTrack"
        @mousedown="startAlphaDrag"
        @touchstart="startAlphaDrag"
      >
        <div 
          class="docs-alpha-gradient"
          :style="{ 
            backgroundImage: `linear-gradient(to right, transparent, ${getRgbaColor(currentHue, 1, 1, 1)})` 
          }"
        ></div>
      </div>
      <div 
        class="docs-alpha-thumb" 
        :style="{ left: `${alphaPosition}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

interface Props {
  modelValue: string;
  label?: string;
  showAlpha?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showAlpha: false
});

const emit = defineEmits(['update:modelValue']);

// Internal state
const colorValue = ref(props.modelValue);
const currentHue = ref(0);
const currentSaturation = ref(1);
const currentValue = ref(1);
const currentAlpha = ref(1);

// Canvas references
const saturationCanvas = ref<HTMLCanvasElement | null>(null);
const hueTrack = ref<HTMLElement | null>(null);
const alphaTrack = ref<HTMLElement | null>(null);

// Pointer positions
const saturationPointerPosition = ref({ x: 100, y: 0 });
const huePosition = ref(0);
const alphaPosition = ref(100);

// Dragging state
let isDraggingSaturation = false;
let isDraggingHue = false;
let isDraggingAlpha = false;

// Helper functions for color conversion
function hexToHsv(hex: string): { h: number, s: number, v: number, a: number } {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse alpha if present
  let alpha = 1;
  if (hex.length === 8) {
    alpha = parseInt(hex.slice(6, 8), 16) / 255;
    hex = hex.slice(0, 6);
  }

  // Convert hex to RGB
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  // Calculate HSV
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta === 0) {
    h = 0;
  } else if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  return { h, s, v, a: alpha };
}

function hsvToHex(h: number, s: number, v: number, a: number = 1): string {
  // Convert HSV to RGB
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  // Adjust for value
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  // Convert to hex
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  // Add alpha if needed
  let alphaHex = '';
  if (a < 1) {
    alphaHex = toHex(Math.round(a * 255));
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`;
}

function getRgbaColor(h: number, s: number, v: number, a: number): string {
  // Convert HSV to RGB
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  // Adjust for value
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Initialize canvas
function initCanvas() {
  if (!saturationCanvas.value) return;

  const canvas = saturationCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // Draw saturation-value gradient
  const gradientH = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradientH.addColorStop(0, '#fff');
  gradientH.addColorStop(1, `hsl(${currentHue.value}, 100%, 50%)`);

  ctx.fillStyle = gradientH;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradientV = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradientV.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradientV.addColorStop(1, '#000');

  ctx.fillStyle = gradientV;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Update canvas when hue changes
watch(currentHue, () => {
  initCanvas();
});

// Update internal state when model value changes
watch(() => props.modelValue, (newValue) => {
  colorValue.value = newValue;
  updateFromHex(newValue);
});

// Update color from hex input
function updateColor() {
  // Validate hex format
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
  if (!hexRegex.test(colorValue.value)) {
    // Reset to current value if invalid
    colorValue.value = props.modelValue;
    return;
  }

  // Update internal state
  updateFromHex(colorValue.value);

  // Emit update event
  emit('update:modelValue', colorValue.value);
}

// Update internal state from hex value
function updateFromHex(hex: string) {
  const { h, s, v, a } = hexToHsv(hex);

  currentHue.value = h;
  currentSaturation.value = s;
  currentValue.value = v;
  currentAlpha.value = a;

  // Update positions
  saturationPointerPosition.value = {
    x: s * 100,
    y: (1 - v) * 100
  };

  huePosition.value = (h / 360) * 100;
  alphaPosition.value = a * 100;

  // Update canvas
  initCanvas();
}

// Saturation-value drag handlers
function startSaturationDrag(event: MouseEvent | TouchEvent) {
  event.preventDefault();
  isDraggingSaturation = true;

  if (event instanceof MouseEvent) {
    handleSaturationDrag(event);
    document.addEventListener('mousemove', handleSaturationDrag);
    document.addEventListener('mouseup', endSaturationDrag);
  } else {
    handleSaturationDrag(event.touches[0]);
    document.addEventListener('touchmove', handleSaturationTouchDrag);
    document.addEventListener('touchend', endSaturationDrag);
  }
}

function handleSaturationDrag(event: MouseEvent | Touch) {
  if (!isDraggingSaturation || !saturationCanvas.value) return;

  const rect = saturationCanvas.value.getBoundingClientRect();

  // Calculate position as percentage
  let x = ((event.clientX - rect.left) / rect.width) * 100;
  let y = ((event.clientY - rect.top) / rect.height) * 100;

  // Clamp values
  x = Math.max(0, Math.min(100, x));
  y = Math.max(0, Math.min(100, y));

  // Update pointer position
  saturationPointerPosition.value = { x, y };

  // Update saturation and value
  currentSaturation.value = x / 100;
  currentValue.value = 1 - (y / 100);

  // Update color
  colorValue.value = hsvToHex(
    currentHue.value, 
    currentSaturation.value, 
    currentValue.value,
    currentAlpha.value
  );

  // Emit update
  emit('update:modelValue', colorValue.value);
}

function handleSaturationTouchDrag(event: TouchEvent) {
  handleSaturationDrag(event.touches[0]);
}

function endSaturationDrag() {
  isDraggingSaturation = false;
  document.removeEventListener('mousemove', handleSaturationDrag);
  document.removeEventListener('mouseup', endSaturationDrag);
  document.removeEventListener('touchmove', handleSaturationTouchDrag);
  document.removeEventListener('touchend', endSaturationDrag);
}

// Hue drag handlers
function startHueDrag(event: MouseEvent | TouchEvent) {
  event.preventDefault();
  isDraggingHue = true;

  if (event instanceof MouseEvent) {
    handleHueDrag(event);
    document.addEventListener('mousemove', handleHueDrag);
    document.addEventListener('mouseup', endHueDrag);
  } else {
    handleHueDrag(event.touches[0]);
    document.addEventListener('touchmove', handleHueTouchDrag);
    document.addEventListener('touchend', endHueDrag);
  }
}

function handleHueDrag(event: MouseEvent | Touch) {
  if (!isDraggingHue || !hueTrack.value) return;

  const rect = hueTrack.value.getBoundingClientRect();

  // Calculate position as percentage
  let x = ((event.clientX - rect.left) / rect.width) * 100;

  // Clamp values
  x = Math.max(0, Math.min(100, x));

  // Update hue position
  huePosition.value = x;

  // Update hue value (0-360)
  currentHue.value = Math.round((x / 100) * 360);

  // Update color
  colorValue.value = hsvToHex(
    currentHue.value, 
    currentSaturation.value, 
    currentValue.value,
    currentAlpha.value
  );

  // Emit update
  emit('update:modelValue', colorValue.value);
}

function handleHueTouchDrag(event: TouchEvent) {
  handleHueDrag(event.touches[0]);
}

function endHueDrag() {
  isDraggingHue = false;
  document.removeEventListener('mousemove', handleHueDrag);
  document.removeEventListener('mouseup', endHueDrag);
  document.removeEventListener('touchmove', handleHueTouchDrag);
  document.removeEventListener('touchend', endHueDrag);
}

// Alpha drag handlers
function startAlphaDrag(event: MouseEvent | TouchEvent) {
  if (!props.showAlpha) return;

  event.preventDefault();
  isDraggingAlpha = true;

  if (event instanceof MouseEvent) {
    handleAlphaDrag(event);
    document.addEventListener('mousemove', handleAlphaDrag);
    document.addEventListener('mouseup', endAlphaDrag);
  } else {
    handleAlphaDrag(event.touches[0]);
    document.addEventListener('touchmove', handleAlphaTouchDrag);
    document.addEventListener('touchend', endAlphaDrag);
  }
}

function handleAlphaDrag(event: MouseEvent | Touch) {
  if (!isDraggingAlpha || !alphaTrack.value) return;

  const rect = alphaTrack.value.getBoundingClientRect();

  // Calculate position as percentage
  let x = ((event.clientX - rect.left) / rect.width) * 100;

  // Clamp values
  x = Math.max(0, Math.min(100, x));

  // Update alpha position
  alphaPosition.value = x;

  // Update alpha value (0-1)
  currentAlpha.value = x / 100;

  // Update color
  colorValue.value = hsvToHex(
    currentHue.value, 
    currentSaturation.value, 
    currentValue.value,
    currentAlpha.value
  );

  // Emit update
  emit('update:modelValue', colorValue.value);
}

function handleAlphaTouchDrag(event: TouchEvent) {
  handleAlphaDrag(event.touches[0]);
}

function endAlphaDrag() {
  isDraggingAlpha = false;
  document.removeEventListener('mousemove', handleAlphaDrag);
  document.removeEventListener('mouseup', endAlphaDrag);
  document.removeEventListener('touchmove', handleAlphaTouchDrag);
  document.removeEventListener('touchend', endAlphaDrag);
}

// Initialize component
onMounted(() => {
  // Initialize from props
  updateFromHex(props.modelValue);

  // Initialize canvas
  initCanvas();

  // Handle window resize
  window.addEventListener('resize', initCanvas);
});

// Clean up
onUnmounted(() => {
  window.removeEventListener('resize', initCanvas);
});
</script>

<style scoped lang="scss">
.docs-color-picker {
  width: 300px;
  padding: 16px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.docs-color-picker-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.docs-color-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  margin-right: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.docs-color-input {
  flex: 1;
  height: 32px;
  padding: 0 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-family: monospace;
}

.docs-color-canvas-container {
  position: relative;
  width: 100%;
  height: 150px;
  margin-bottom: 16px;
  border-radius: 4px;
  overflow: hidden;
}

.docs-saturation-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.docs-saturation-pointer {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.docs-hue-container {
  position: relative;
  width: 100%;
  height: 12px;
  margin-bottom: 16px;
}

.docs-hue-track {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(
    to right,
    #f00 0%,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    #f00 100%
  );
  cursor: pointer;
}

.docs-hue-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.docs-alpha-container {
  position: relative;
  width: 100%;
  height: 12px;
}

.docs-alpha-track {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  cursor: pointer;
  overflow: hidden;
}

.docs-alpha-gradient {
  width: 100%;
  height: 100%;
}

.docs-alpha-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

// Dark theme support
.docs-app-theme--dark .docs-color-picker {
  background-color: #1e1e1e;
  color: white;
}

.docs-app-theme--dark .docs-color-input {
  background-color: #333;
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
