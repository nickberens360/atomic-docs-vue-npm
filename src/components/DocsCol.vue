<template>
  <div 
    class="docs-col" 
    :class="[
      cols && `docs-col-${cols}`,
      sm && `docs-col-sm-${sm}`,
      md && `docs-col-md-${md}`,
      lg && `docs-col-lg-${lg}`,
      xl && `docs-col-xl-${xl}`,
      offset && `docs-offset-${offset}`,
      order && `docs-order-${order}`,
      align && `align-${align}`
    ]"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  cols?: string | number;
  sm?: string | number;
  md?: string | number;
  lg?: string | number;
  xl?: string | number;
  offset?: string | number;
  order?: string | number;
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
}

defineProps<Props>();
</script>

<style scoped lang="scss">
// Breakpoints
$breakpoint-sm: 600px;
$breakpoint-md: 960px;
$breakpoint-lg: 1264px;
$breakpoint-xl: 1904px;

// Column base styles
.docs-col {
  padding: 12px;
  width: 100%;
  flex-basis: 0;
  flex-grow: 1;
  max-width: 100%;
}

// Generate column classes for different sizes
@for $i from 1 through 12 {
  .docs-col-#{$i} {
    flex: 0 0 calc(#{$i} / 12 * 100%);
    max-width: calc(#{$i} / 12 * 100%);
  }
  
  .docs-offset-#{$i} {
    margin-left: calc(#{$i} / 12 * 100%);
  }
  
  .docs-order-#{$i} {
    order: $i;
  }
}

// Responsive breakpoints
@media (min-width: $breakpoint-sm) {
  @for $i from 1 through 12 {
    .docs-col-sm-#{$i} {
      flex: 0 0 calc(#{$i} / 12 * 100%);
      max-width: calc(#{$i} / 12 * 100%);
    }
  }
}

@media (min-width: $breakpoint-md) {
  @for $i from 1 through 12 {
    .docs-col-md-#{$i} {
      flex: 0 0 calc(#{$i} / 12 * 100%);
      max-width: calc(#{$i} / 12 * 100%);
    }
  }
}

@media (min-width: $breakpoint-lg) {
  @for $i from 1 through 12 {
    .docs-col-lg-#{$i} {
      flex: 0 0 calc(#{$i} / 12 * 100%);
      max-width: calc(#{$i} / 12 * 100%);
    }
  }
}

@media (min-width: $breakpoint-xl) {
  @for $i from 1 through 12 {
    .docs-col-xl-#{$i} {
      flex: 0 0 calc(#{$i} / 12 * 100%);
      max-width: calc(#{$i} / 12 * 100%);
    }
  }
}

// Alignment
.docs-col {
  &.align-start {
    align-self: flex-start;
  }
  
  &.align-end {
    align-self: flex-end;
  }
  
  &.align-center {
    align-self: center;
  }
  
  &.align-baseline {
    align-self: baseline;
  }
  
  &.align-stretch {
    align-self: stretch;
  }
}

// Padding utility classes
.px-6 {
  padding-left: 24px !important;
  padding-right: 24px !important;
}
</style>