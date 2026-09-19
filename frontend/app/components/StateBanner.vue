<script setup lang="ts">
withDefaults(
  defineProps<{
    loading?: boolean
    error?: string | null
    loadingText?: string
  }>(),
  {
    loading: false,
    error: null,
    loadingText: 'กำลังโหลด...',
  },
)
</script>

<template>
  <div
    v-if="loading"
    class="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300"
  >
    <span
      class="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"
    />
    <span class="text-sm font-medium">{{ loadingText }}</span>
  </div>

  <div
    v-else-if="error"
    class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
  >
    <svg
      class="mt-0.5 h-4 w-4 flex-shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.28 11.19c.75 1.336-.213 2.987-1.743 2.987H3.72c-1.53 0-2.492-1.651-1.743-2.987l6.28-11.19zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clip-rule="evenodd"
      />
    </svg>
    <span class="text-sm font-medium">{{ error }}</span>
  </div>
</template>
