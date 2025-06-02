<template>
  <main class="docs-main">
    <slot></slot>
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
  padding-top: 0;
  transition: padding-top 0.2s ease-in-out;
  
  // Add padding when the app bar is fixed on mobile
  @media (max-width: 768px) {
    padding-top: 64px; // Height of the app bar
  }
  
  // Adjust for the navigation drawer
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