<template>
  <div>
    <p class="atomic-docs-note">
      <strong>Note:</strong> {{ content }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  content: string,
}>()
</script>

<style scoped lang="scss">
.atomic-docs-note {
  font-size: 14px;
  color: #555;
  margin: 16px 0;
  padding: 8px;
  border-left: 4px solid #2196F3;
  background-color: var(--atomic-docs-surface-color, #f9f9f9);
}

</style>