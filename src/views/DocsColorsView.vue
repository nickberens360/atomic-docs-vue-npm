<template>
  <DocsContainer class="colors-view">
    <h1 class="colors-title">Colors</h1>
    <DocsColors />
  </DocsContainer>
</template>

<script setup lang="ts">
import DocsContainer from '../components/DocsContainer.vue';
import DocsColors from '../components/DocsColors.vue';
</script>

<style scoped lang="scss">
.colors-view {
  padding: 24px;
}

.colors-title {
  margin-bottom: 24px;
  font-size: 32px;
  font-weight: 500;
}
</style>