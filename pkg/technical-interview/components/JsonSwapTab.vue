<script setup lang="ts">
import { ref, computed, toRaw } from 'vue';
import FileSelector from '@shell/components/form/FileSelector.vue';
import JsonDisplay from './JsonDisplay.vue';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function isPrimitive(value: JsonValue): value is string | number | boolean | null {
  return value === null || typeof value !== 'object';
}

function swapKeysAndValues(obj: { [key: string]: JsonValue }): { [key: string]: JsonValue } {
  const result: { [key: string]: JsonValue } = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isPrimitive(value)) {
      result[String(value)] = key;
    } else {
      result[key] = structuredClone(toRaw(value));
    }
  }

  return result;
}

const parsedJson = ref<{ [key: string]: JsonValue } | null>(null);
const parseError = ref('');
const showSwapped = ref(false);

const swappedJson = computed(() => {
  if (!parsedJson.value) {
    return null;
  }

  return swapKeysAndValues(parsedJson.value);
});

const onFileSelected = (contents: string) => {
  showSwapped.value = false;
  parseError.value = '';

  try {
    const parsed = JSON.parse(contents);

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      parseError.value = 'JSON must be an object (not array or primitive).';
      parsedJson.value = null;

      return;
    }

    parsedJson.value = parsed;
  } catch {
    parseError.value = 'Invalid JSON file.';
    parsedJson.value = null;
  }
};

const onFileError = (error: string) => {
  parseError.value = error;
  parsedJson.value = null;
};

const doSwap = () => {
  showSwapped.value = true;
};
</script>

<template>
  <div class="json-swap-tab">
    <FileSelector
      label="Upload a JSON file"
      accept=".json,application/json"
      class="role-primary btn-sm"
      @selected="onFileSelected"
      @error="onFileError"
    />

    <div
      v-if="parseError"
      class="error-message"
    >
      {{ parseError }}
    </div>

    <template v-if="parsedJson">
      <JsonDisplay
        title="File Contents"
        :data="parsedJson"
      />

      <button
        class="btn role-primary"
        @click="doSwap"
      >
        Swap Keys &amp; Values
      </button>

      <JsonDisplay
        v-if="showSwapped"
        title="Swapped Result"
        :data="swappedJson"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.json-swap-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

::v-deep .file-selector {
  width: fit-content;
}

.error-message {
  color: var(--error);
}
</style>
