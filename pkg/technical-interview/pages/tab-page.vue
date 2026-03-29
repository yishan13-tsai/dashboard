<script lang="ts">
import { defineComponent } from 'vue';
import Tabbed from '@shell/components/Tabbed/index.vue';
import Tab from '@shell/components/Tabbed/Tab.vue';
import CounterTab from '../components/CounterTab.vue';
import DateTimeTab from '../components/DateTimeTab.vue';
import JsonSwapTab from '../components/JsonSwapTab.vue';

const TABS = [
  { name: 'counter', label: 'Counter', component: 'CounterTab' },
  { name: 'datetime', label: 'Date & Time', component: 'DateTimeTab' },
  { name: 'json-swap', label: 'JSON Swap', component: 'JsonSwapTab' },
];

export default defineComponent({
  name: 'TabPage',

  layout: 'plain',

  components: {
    Tabbed,
    Tab,
    CounterTab,
    DateTimeTab,
    JsonSwapTab,
  },

  setup() {
    return { tabs: TABS };
  },
});
</script>

<template>
  <div>
    <h1>{{ t('interview.tabPage.title') }}</h1>

    <Tabbed>
      <Tab
        v-for="(tab, index) in tabs"
        :key="tab.name"
        :name="tab.name"
        :label="tab.label"
        :weight="tabs.length - index"
      >
        <component :is="tab.component" />
      </Tab>
    </Tabbed>
  </div>
</template>
