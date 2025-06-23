<template>
  <div class="typography-view">
    <h2 class="typography-title">Typography System</h2>
    <p class="typography-description">
      These are the typography styles defined in your design system.
    </p>

    <div class="typography-examples">
      <div class="typography-example">
        <h1>Heading 1</h1>
        <div class="typography-details">
          <span>Font size: var(--atomic-docs-font-size-xxl, 32px)</span>
          <span>Font weight: 500</span>
        </div>
      </div>

      <div class="typography-example">
        <h2>Heading 2</h2>
        <div class="typography-details">
          <span>Font size: var(--atomic-docs-font-size-xl, 24px)</span>
          <span>Font weight: 500</span>
        </div>
      </div>

      <div class="typography-example">
        <h3>Heading 3</h3>
        <div class="typography-details">
          <span>Font size: var(--atomic-docs-font-size-lg, 20px)</span>
          <span>Font weight: 500</span>
        </div>
      </div>

      <div class="typography-example">
        <p>Body text</p>
        <div class="typography-details">
          <span>Font size: var(--atomic-docs-font-size-md, 16px)</span>
          <span>Font weight: 400</span>
        </div>
      </div>

      <div class="typography-example">
        <p class="small-text">Small text</p>
        <div class="typography-details">
          <span>Font size: var(--atomic-docs-font-size-sm, 14px)</span>
          <span>Font weight: 400</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No special functionality needed
</script>

<style scoped lang="scss">
.typography-view {
  width: 100%;
}

.typography-title {
  font-size: var(--atomic-docs-font-size-xl, 24px);
  font-weight: 500;
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
}

.typography-description {
  margin-bottom: var(--atomic-docs-spacing-lg, 24px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}

.typography-examples {
  display: flex;
  flex-direction: column;
  gap: var(--atomic-docs-spacing-md, 16px);
}

.typography-example {
  padding: var(--atomic-docs-spacing-md, 16px);
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
}

.typography-details {
  margin-top: var(--atomic-docs-spacing-sm, 8px);
  font-size: var(--atomic-docs-font-size-sm, 14px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.small-text {
  font-size: var(--atomic-docs-font-size-sm, 14px);
}
</style>