<script setup lang="ts">
import type { RouteResult } from '~/types/route'

defineProps<{
  route: RouteResult | null
}>()
</script>

<template>
  <div
    v-if="route"
    class="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
  >
    <div>
      <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        ระยะทาง
      </p>
      <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
        {{ route.distanceText }}
      </p>
    </div>
    <div>
      <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        เวลาเดินทาง (ตามสภาพจราจรปัจจุบัน)
      </p>
      <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
        {{ route.durationText }}
      </p>
    </div>
  </div>
</template>
