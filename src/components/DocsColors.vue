<template>
  <div class="docs-colors">
    <h2 class="docs-colors-title">Color System</h2>
    <p class="docs-colors-description">
      These are the colors defined in your design system.
    </p>
    
    <div class="docs-colors-grid">
      <div 
        v-for="(colorItem, index) in colors" 
        :key="index"
        class="docs-color-card"
      >
        <div 
          class="docs-color-preview" 
          :style="{ backgroundColor: colorItem.color }"
        ></div>
        <div class="docs-color-info">
          <div class="docs-color-name">{{ colorItem.name }}</div>
          <div class="docs-color-value">{{ colorItem.color }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue';
import { ComponentDocPlugin } from '../types';

// Inject the component doc plugin
const componentDocPlugin = inject<ComponentDocPlugin>('componentDocPlugin');

// Get colors from plugin options
const colors = computed(() => {
  return componentDocPlugin?.options?.colors || [];
});
</script>

<style scoped lang="scss">
.docs-colors {
  padding: 24px;
}

.docs-colors-title {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 16px;
}

.docs-colors-description {
  margin-bottom: 24px;
  color: rgba(0, 0, 0, 0.6);
}

.docs-colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.docs-color-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.docs-color-preview {
  height: 120px;
  width: 100%;
}

.docs-color-info {
  padding: 16px;
  background-color: white;
}

.docs-color-name {
  font-weight: 500;
  text-transform: capitalize;
  margin-bottom: 4px;
}

.docs-color-value {
  font-family: monospace;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}
</style>