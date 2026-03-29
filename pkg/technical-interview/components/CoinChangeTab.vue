<script setup lang="ts">
import { ref, computed } from 'vue';
import { Banner } from '@components/Banner';

/**
 * Classic coin change problem using dynamic programming.
 * Returns the minimum set of coins that sum to the amount, or null if impossible.
 */
const solve = (coins: number[], amount: number): number[] | null => {
  if (amount === 0) {
    return [];
  }

  const dp = new Array(amount + 1).fill(Infinity);
  const parent = new Array(amount + 1).fill(-1);

  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
        parent[i] = coin;
      }
    }
  }

  if (dp[amount] === Infinity) {
    return null;
  }

  const result: number[] = [];
  let remaining = amount;

  while (remaining > 0) {
    result.push(parent[remaining]);
    remaining -= parent[remaining];
  }

  return result.sort((a, b) => b - a);
};

const coinsInput = ref('1, 2, 5');
const amountInput = ref(11);
const result = ref<number[] | null | undefined>(undefined);
const hasCalculated = ref(false);

const parsedCoins = computed(() => {
  const coins = coinsInput.value
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !isNaN(n));

  return [...new Set(coins)];
});

const hasDuplicates = computed(() => {
  const raw = coinsInput.value
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !isNaN(n));

  return raw.length !== new Set(raw).size;
});

const errors = computed(() => {
  if (!hasCalculated.value) {
    return [];
  }

  const errs: string[] = [];

  if (coinsInput.value.trim() === '') {
    errs.push('Coin denominations cannot be empty.');
  } else if (parsedCoins.value.length === 0) {
    errs.push('Please enter valid numbers for coin denominations.');
  } else if (parsedCoins.value.some((n) => n <= 0 || !Number.isInteger(n))) {
    errs.push('All coin denominations must be positive integers.');
  }

  if (amountInput.value === '' || amountInput.value === null) {
    errs.push('Amount cannot be empty.');
  } else if (!Number.isInteger(amountInput.value) || amountInput.value < 0) {
    errs.push('Amount must be a non-negative integer.');
  }

  return errs;
});

const isValid = computed(() => errors.value.length === 0);

const calculate = () => {
  hasCalculated.value = true;
  result.value = undefined;

  if (!isValid.value) {
    return;
  }

  result.value = solve(parsedCoins.value, amountInput.value);
};
</script>

<template>
  <div class="coin-change-tab">
    <div class="input-group">
      <label>
        Coin Denominations (comma-separated)
        <input
          v-model="coinsInput"
          type="text"
          class="input-field"
          :class="{ 'input-error': hasCalculated && errors.some((e) => e.includes('coin') || e.includes('Coin')) }"
          placeholder="e.g. 1, 2, 5"
        >
      </label>
    </div>

    <div class="input-group">
      <label>
        Target Amount
        <input
          v-model.number="amountInput"
          type="number"
          class="input-field"
          :class="{ 'input-error': hasCalculated && errors.some((e) => e.includes('Amount')) }"
          min="0"
        >
      </label>
    </div>

    <button
      class="btn role-primary"
      @click="calculate"
    >
      Calculate
    </button>

    <Banner
      v-if="hasDuplicates"
      color="info"
      label="Duplicate coin denominations were removed."
    />

    <Banner
      v-for="(err, i) in errors"
      :key="i"
      color="error"
      :label="err"
    />

    <div
      v-if="result !== undefined"
      class="result"
    >
      <h3>Result</h3>
      <Banner
        v-if="result === null"
        color="warning"
        label="null — no valid combination of coins can match this amount."
      />
      <pre v-else>{{ JSON.stringify(result) }}</pre>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.coin-change-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
  }

  .input-field {
    width: 300px;
    padding: 6px 8px;
    border: 1px solid var(--border);
    border-radius: var(--border-radius);
    background: var(--input-bg);
    color: var(--input-text);

    &.input-error {
      border-color: var(--error);
    }
  }
}

.result {
  h3 {
    margin: 0 0 8px;
  }

  pre {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: var(--border-radius);
    padding: 12px;
    margin: 0;
    width: fit-content;
  }
}
</style>
