<script setup lang="ts">
import { computed } from "vue";
import { cellsOf } from "../render";
import type { Row } from "../types";

const props = defineProps<{ row: Row; dated: boolean }>();
const cells = computed(() => cellsOf(props.row, props.dated).slice(0, -1));
</script>

<template>
  <tr :class="{ critical: row.critical }" :data-slack="row.slack">
    <td v-for="(cell, index) in cells" :key="index">{{ cell }}</td>
  </tr>
</template>
