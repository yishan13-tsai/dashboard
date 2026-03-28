<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import day from 'dayjs';

export default defineComponent({
  name: 'DateTimeTab',

  setup() {
    const now = ref(new Date());
    let timer: ReturnType<typeof setInterval> | null = null;

    const inputHours = ref(0);
    const inputMinutes = ref(0);
    const inputSeconds = ref(0);

    const currentDisplay = computed(() => day(now.value).format('YYYY-MM-DD HH:mm'));

    const updatedDate = computed(() => {
      const d = new Date(now.value.getTime());

      d.setHours(d.getHours() + inputHours.value);
      d.setMinutes(d.getMinutes() + inputMinutes.value);
      d.setSeconds(d.getSeconds() + inputSeconds.value);

      return d;
    });

    const updatedDisplay = computed(() => day(updatedDate.value).format('YYYY-MM-DD HH:mm:ss'));

    const comparison = computed(() => {
      const nowMs = now.value.getTime();
      const updatedMs = updatedDate.value.getTime();

      if (nowMs < updatedMs) {
        return 'before';
      } else if (nowMs > updatedMs) {
        return 'after';
      }

      return 'the same as';
    });

    function updateNow() {
      now.value = new Date();
    }

    function onVisibilityChange() {
      if (!document.hidden) {
        updateNow();
      }
    }

    onMounted(() => {
      timer = setInterval(updateNow, 1000);
      document.addEventListener('visibilitychange', onVisibilityChange);
    });

    onBeforeUnmount(() => {
      if (timer) {
        clearInterval(timer);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
    });

    return {
      currentDisplay,
      updatedDisplay,
      comparison,
      inputHours,
      inputMinutes,
      inputSeconds,
    };
  },
});
</script>

<template>
  <div class="datetime-tab">
    <div class="current-time">
      <h3>Current Date &amp; Time</h3>
      <p class="time-display">
        {{ currentDisplay }}
      </p>
    </div>

    <div class="time-adjuster">
      <h3>Adjust Time</h3>
      <div class="input-row">
        <label>
          Hours
          <input
            v-model.number="inputHours"
            type="number"
            class="input-sm"
          >
        </label>
        <label>
          Minutes
          <input
            v-model.number="inputMinutes"
            type="number"
            class="input-sm"
          >
        </label>
        <label>
          Seconds
          <input
            v-model.number="inputSeconds"
            type="number"
            class="input-sm"
          >
        </label>
      </div>
    </div>

    <div class="updated-time">
      <h3>Updated Date &amp; Time</h3>
      <p class="time-display">
        {{ updatedDisplay }}
      </p>
    </div>

    <div class="comparison-result">
      <p>
        The current date and time is <strong>{{ comparison }}</strong> the updated date and time.
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.datetime-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.time-display {
  font-size: 24px;
  font-weight: bold;
  font-family: monospace;
}

.input-row {
  display: flex;
  gap: 16px;

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
  }

  .input-sm {
    width: 100px;
    padding: 6px 8px;
    border: 1px solid var(--border);
    border-radius: var(--border-radius);
    background: var(--input-bg);
    color: var(--input-text);
  }
}

.comparison-result {
  padding: 12px 16px;
  background: var(--body-bg);
  border: 1px solid var(--border);
  border-radius: var(--border-radius);

  p {
    margin: 0;
  }
}
</style>
