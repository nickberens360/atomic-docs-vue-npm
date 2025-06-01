<template>
  <div 
    class="docs-row" 
    :class="[
      justify && `justify-${justify}`,
      align && `align-${align}`,
      dense && 'docs-row--dense',
      noGutters && 'docs-row--no-gutters'
    ]"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  justify?: 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  dense?: boolean;
  noGutters?: boolean;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.docs-row {
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 auto;
  margin: -12px;
  
  &--dense {
    margin: -4px;
  }
  
  &--no-gutters {
    margin: 0;
    
    > * {
      padding: 0 !important;
    }
  }
  
  // Justify content
  &.justify-start {
    justify-content: flex-start;
  }
  
  &.justify-end {
    justify-content: flex-end;
  }
  
  &.justify-center {
    justify-content: center;
  }
  
  &.justify-space-between {
    justify-content: space-between;
  }
  
  &.justify-space-around {
    justify-content: space-around;
  }
  
  &.justify-space-evenly {
    justify-content: space-evenly;
  }
  
  // Align items
  &.align-start {
    align-items: flex-start;
  }
  
  &.align-end {
    align-items: flex-end;
  }
  
  &.align-center {
    align-items: center;
  }
  
  &.align-baseline {
    align-items: baseline;
  }
  
  &.align-stretch {
    align-items: stretch;
  }
}

// Height utility
.h-100 {
  height: 100%;
}
</style>