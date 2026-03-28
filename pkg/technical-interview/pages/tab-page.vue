<script lang="ts">
import { defineComponent } from 'vue';
import Tabbed from '@shell/components/Tabbed/index.vue';
import Tab from '@shell/components/Tabbed/Tab.vue';
import CounterTab from '../components/CounterTab.vue';

export default defineComponent({
  name: 'TabPage',

  layout: 'plain',

  components: {
    Tabbed,
    Tab,
    CounterTab,
  },
});
</script>

<template>
  <div>
    <h1>{{ t('interview.tabPage.title') }}</h1>

    <Tabbed>
      <Tab
        name="counter"
        label="Counter"
        :weight="4"
      >
        <CounterTab />
      </Tab>
    </Tabbed>
  </div>
</template>
