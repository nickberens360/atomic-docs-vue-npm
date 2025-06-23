<template>
  <div class="atomic-docs-slider">
    <div v-if="label" class="atomic-docs-slider-label">
      {{ label }}
      <span v-if="thumbLabel && isDragging" class="atomic-docs-slider-thumb-label">{{ modelValue }}</span>
    </div>
    <div class="atomic-docs-slider-track-container">
      <div class="atomic-docs-slider-track"></div>
      <div
        class="atomic-docs-slider-track-fill"
        :style="{ width: `${calculateFillWidth()}%` }"
      ></div>
      <div
        class="atomic-docs-slider-thumb"
        :style="{ left: `${calculateThumbPosition()}%` }"
        @mousedown="startDrag"
        @touchstart="startDrag"
      ></div>
    </div>
    <div v-if="!hideDetails" class="atomic-docs-slider-details">
      <div class="atomic-docs-slider-min-value">{{ min }}</div>
      <div class="atomic-docs-slider-max-value">{{ max }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Props {
  modelValue: number;
  label?: string;
  thumbLabel?: boolean;
  max?: number | string;
  min?: number | string;
  hideDetails?: boolean;
  step?: number;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  hideDetails: false,
  thumbLabel: false
});

const emit = defineEmits(['update:modelValue']);

// Convert string props to numbers if needed
const minValue = computed(() => typeof props.min === 'string' ? parseInt(props.min) : props.min);
const maxValue = computed(() => typeof props.max === 'string' ? parseInt(props.max) : props.max);

// Track dragging state
const isDragging = ref(false);

// Calculate the width of the fill track as a percentage
const calculateFillWidth = () => {
  const range = maxValue.value - minValue.value;
  const fillPercentage = ((props.modelValue - minValue.value) / range) * 100;
  return Math.max(0, Math.min(100, fillPercentage));
};

// Calculate the position of the thumb as a percentage
const calculateThumbPosition = () => {
  return calculateFillWidth();
};

// Handle slider track click
const handleTrackClick = (event: MouseEvent) => {
  const trackElement = event.currentTarget as HTMLElement;
  const rect = trackElement.getBoundingClientRect();
  const clickPosition = event.clientX - rect.left;
  const trackWidth = rect.width;
  const percentage = clickPosition / trackWidth;

  const range = maxValue.value - minValue.value;
  let newValue = minValue.value + (percentage * range);

  // Apply step if provided
  if (props.step > 0) {
    newValue = Math.round(newValue / props.step) * props.step;
  }

  // Ensure value is within bounds
  newValue = Math.max(minValue.value, Math.min(maxValue.value, newValue));

  emit('update:modelValue', newValue);
};

// Drag handling
const startDrag = (event: MouseEvent | TouchEvent) => {
  isDragging.value = true;

  // Prevent default to avoid text selection during drag
  event.preventDefault();

  // Add event listeners for drag and end events
  if (event.type === 'mousedown') {
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', endDrag);
  } else if (event.type === 'touchstart') {
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('touchend', endDrag);
  }
};

const handleDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return;

  // Get the track element
  const trackElement = document.querySelector('.atomic-docs-slider-track-container') as HTMLElement;
  if (!trackElement) return;

  const rect = trackElement.getBoundingClientRect();

  // Get client X position based on event type
  let clientX: number;
  if ('touches' in event) {
    clientX = event.touches[0].clientX;
  } else {
    clientX = event.clientX;
  }

  // Calculate position and value
  const position = clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, position / rect.width));

  const range = maxValue.value - minValue.value;
  let newValue = minValue.value + (percentage * range);

  // Apply step if provided
  if (props.step > 0) {
    newValue = Math.round(newValue / props.step) * props.step;
  }

  // Ensure value is within bounds
  newValue = Math.max(minValue.value, Math.min(maxValue.value, newValue));

  emit('update:modelValue', newValue);
};

const endDrag = () => {
  isDragging.value = false;

  // Remove event listeners
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', handleDrag);
  document.removeEventListener('touchend', endDrag);
};

// Add click handler to track container
onMounted(() => {
  const trackContainer = document.querySelector('.atomic-docs-slider-track-container');
  if (trackContainer) {
    trackContainer.addEventListener('click', handleTrackClick as EventListener);
  }
});

// Clean up event listeners
onUnmounted(() => {
  const trackContainer = document.querySelector('.atomic-docs-slider-track-container');
  if (trackContainer) {
    trackContainer.removeEventListener('click', handleTrackClick as EventListener);
  }

  // Remove any lingering drag handlers
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', handleDrag);
  document.removeEventListener('touchend', endDrag);
});
</script>

<style lang="scss" scoped>
.atomic-docs-slider {
  width: 100%;
  padding: 8px 0;

  &-label {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 8px;
  }

  &-thumb-label {
    background-color: #1976d2;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }

  &-track-container {
    position: relative;
    height: 4px;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    cursor: pointer;
  }

  &-track {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 2px;
  }

  &-track-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #1976d2;
    border-radius: 2px;
  }

  &-thumb {
    position: absolute;
    top: 50%;
    width: 16px;
    height: 16px;
    background-color: #1976d2;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: grab;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    &:active {
      cursor: grabbing;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
    }
  }

  &-details {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    margin-top: 4px;
  }
}
</style>
