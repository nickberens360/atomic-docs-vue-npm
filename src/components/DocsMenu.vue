<template>
  <div class="docs-menu-container">
    <!-- Activator slot -->
    <div 
      ref="activatorEl" 
      class="docs-menu-activator"
      @click="activator === 'parent' ? toggleMenu() : null"
      @mouseenter="openOnHover ? showMenu() : null"
      @mouseleave="openOnHover ? hideMenu() : null"
      @focus="openOnFocus ? showMenu() : null"
      @blur="openOnFocus ? hideMenu() : null"
    >
      <slot
        name="activator"
        :props="activatorProps"
      />
    </div>

    <!-- Menu content -->
    <div 
      v-if="isOpen" 
      ref="menuEl"
      class="docs-menu-content" 
      :class="{ 'docs-menu-content--open': isOpen }"
      @click="closeOnContentClick ? hideMenu() : null"
      @mouseenter="openOnHover ? clearHideTimeout() : null"
      @mouseleave="openOnHover ? hideMenu() : null"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, computed, nextTick } from 'vue';

interface Props {
  activator?: 'parent' | null;
  openOnHover?: boolean;
  openOnFocus?: boolean;
  closeOnContentClick?: boolean;
  offsetY?: boolean;
  offsetX?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  activator: null,
  openOnHover: false,
  openOnFocus: false,
  closeOnContentClick: true,
  offsetY: false,
  offsetX: false,
});

const isOpen = ref(false);
const activatorEl = ref<HTMLElement | null>(null);
const menuEl = ref<HTMLElement | null>(null);
let hideTimeout: number | null = null;

// Computed props to pass to the activator slot
const activatorProps = computed(() => ({
  'aria-expanded': isOpen.value,
  'aria-haspopup': true,
  onClick: toggleMenu,
}));

// Toggle menu visibility
function toggleMenu() {
  if (isOpen.value) {
    hideMenu();
  } else {
    showMenu();
  }
}

// Show the menu
function showMenu() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  isOpen.value = true;

  // Position the menu after it's rendered
  nextTick(() => {
    positionMenu();
  });

  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
}

// Hide the menu
function hideMenu() {
  if (props.openOnHover) {
    // Add a small delay for hover to allow moving to the menu
    hideTimeout = window.setTimeout(() => {
      isOpen.value = false;
      hideTimeout = null;
    }, 150);
  } else {
    isOpen.value = false;
  }
}

// Clear hide timeout
function clearHideTimeout() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

// Position the menu relative to the activator
function positionMenu() {
  if (!activatorEl.value || !menuEl.value) return;

  const activatorRect = activatorEl.value.getBoundingClientRect();
  const menuElement = menuEl.value;

  // Default position (below and aligned with left edge)
  let top = activatorRect.bottom;
  let left = activatorRect.left;

  // Apply offset Y if needed
  if (props.offsetY) {
    top += 8; // Add some spacing
  }

  // Apply offset X if needed
  if (props.offsetX) {
    left += 8; // Add some spacing
  }

  // Set the position
  menuElement.style.position = 'fixed';
  menuElement.style.top = `${top}px`;
  menuElement.style.left = `${left}px`;

  // Ensure menu stays within viewport
  const menuRect = menuElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Adjust if menu extends beyond right edge
  if (menuRect.right > viewportWidth) {
    menuElement.style.left = `${viewportWidth - menuRect.width - 8}px`;
  }

  // Adjust if menu extends beyond bottom edge
  if (menuRect.bottom > viewportHeight) {
    menuElement.style.top = `${activatorRect.top - menuRect.height}px`;
  }
}

// Handle click outside to close menu
function handleClickOutside(event: MouseEvent) {
  if (
    isOpen.value && 
    activatorEl.value && 
    menuEl.value && 
    !activatorEl.value.contains(event.target as Node) && 
    !menuEl.value.contains(event.target as Node)
  ) {
    hideMenu();
  }
}

// Clean up event listeners
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }
});
</script>

<style lang="scss" scoped>
.docs-menu-container {
  position: relative;
  display: inline-block;
}

.docs-menu-activator {
  cursor: pointer;
  display: inline-flex;
}

.docs-menu-content {
  position: fixed;
  z-index: var(--atomic-docs-z-index-modal, 1000);
  background-color: var(--atomic-docs-surface-color, white);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  box-shadow: var(--atomic-docs-shadow-md, 0 5px 15px rgba(0, 0, 0, 0.15));
  min-width: 200px;
  max-width: 80vw;
  max-height: 80vh;
  overflow-y: auto;
  transform-origin: top left;
  animation: menu-open 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
}

@keyframes menu-open {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
