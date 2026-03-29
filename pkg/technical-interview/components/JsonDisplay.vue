<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  data: object | unknown[];
}>();

const formatted = computed(() => JSON.stringify(props.data, null, 2));
</script>

<template>
  <div class="json-display">
    <h3>{{ title }}</h3>
    <pre>{{ formatted }}</pre>
  </div>
</template>

<style lang="scss" scoped>
.json-display {
  h3 {
    margin: 0 0 8px;
  }

  pre {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: var(--border-radius);
    padding: 12px;
    overflow-x: auto;
    max-height: 400px;
    margin: 0;
  }
}
</style>
