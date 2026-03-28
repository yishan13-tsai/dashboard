<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useHoverPopover } from '../composables/useHoverPopover';

const INITIAL_COUNTER = 42;

export default defineComponent({
  name: 'CounterTab',

  setup() {
    const counter = ref(INITIAL_COUNTER);
    const {
      showPopover, popoverStyle, hide, triggerEvents, popoverEvents
    } = useHoverPopover();

    function decrement() {
      counter.value--;
    }

    function resetToDefault() {
      counter.value = INITIAL_COUNTER;
      hide();
    }

    return {
      counter,
      showPopover,
      popoverStyle,
      triggerEvents,
      popoverEvents,
      decrement,
      resetToDefault,
    };
  },
});
</script>

<template>
  <div class="counter-tab">
    <p class="counter-display">
      Counter: <strong>{{ counter }}</strong>
    </p>
    <button
      class="btn role-primary"
      v-on="triggerEvents"
      @click="decrement"
    >
      Decrement
    </button>

    <div
      v-if="showPopover"
      class="popover-box"
      :style="popoverStyle"
      v-on="popoverEvents"
    >
      <p>Current counter: <strong>{{ counter }}</strong></p>
      <a
        href="#"
        @click.prevent="resetToDefault"
      >reset everything to default</a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.counter-display {
  font-size: 18px;
  margin-bottom: 16px;
}

.popover-box {
  background: var(--body-bg);
  border: 1px solid var(--border);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px var(--shadow);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 1000;

  p {
    margin: 0 0 8px;
  }

  a {
    color: var(--link);
    cursor: pointer;
  }
}
</style>
