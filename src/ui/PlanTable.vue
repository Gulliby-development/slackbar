<script setup lang="ts">
import { computed } from "vue";
import { headerNames } from "../render";
import type { Schedule } from "../types";
import PlanRow from "./PlanRow.vue";

const props = defineProps<{ schedule: Schedule; summary: string }>();
const headers = computed(() =>
  headerNames(props.schedule.dated)
    .slice(0, -1)
    .map((h) => h.toLowerCase()),
);
</script>

<template>
  <table class="plan">
    <thead>
      <tr>
        <th v-for="name in headers" :key="name">{{ name }}</th>
      </tr>
    </thead>
    <tbody>
      <PlanRow v-for="row in schedule.rows" :key="row.id" :row="row" :dated="schedule.dated" />
    </tbody>
    <tfoot>
      <tr>
        <td :colspan="headers.length">{{ summary }}</td>
      </tr>
    </tfoot>
  </table>
</template>
