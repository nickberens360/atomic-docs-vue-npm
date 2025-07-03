<template>
  <div>
    <p class="docs-note">
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
.docs-note {
  font-size: 14px;
  color: #555;
  margin: 16px 0;
  padding: 8px;
  border-left: 4px solid #2196F3;
  background-color: #f9f9f9;
}

</style>