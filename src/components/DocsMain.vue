<template>
  <main class="docs-main">
    <slot />
  </main>
</template>

<script setup lang="ts">
// No props or special functionality needed
</script>

<style scoped lang="scss">
.docs-main {
  flex: 1 1 auto;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 18px;
  transition: padding-top 0.2s ease-in-out;

  .docs-navigation-drawer--open + & {
    padding-left: 256px;
    transition: padding-left 0.3s ease;
  }

  // Adjust for the rail mode
  .docs-navigation-drawer--rail + & {
    padding-left: 56px;
    transition: padding-left 0.3s ease;
  }
}
</style>