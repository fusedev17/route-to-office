<script setup lang="ts">
const { lat, lng, error: geoError, loading: geoLoading, locate } = useGeolocation()
const { data: route, error: routeError, pending: routePending } = useCompanyRoute(lat, lng)

const config = useRuntimeConfig()

const isLoading = computed(() => geoLoading.value || routePending.value)
const errorMessage = computed(() => geoError.value ?? routeError.value)

const loadingText = computed(() => {
  if (geoLoading.value) return 'กำลังขอตำแหน่งของคุณ...'
  if (routePending.value) return 'กำลังคำนวณเส้นทางไปบริษัท...'
  return 'กำลังโหลด...'
})

onMounted(() => {
  locate()
})
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
    <header>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        เส้นทางไปบริษัท
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">สำนักงานใหญ่ของ SCG (บริษัท ปูนซิเมนต์ไทย จำกัด มหาชน) <br> ตั้งอยู่ที่ เลขที่ 1 ถนนปูนซิเมนต์ไทย แขวงบางซื่อ เขตบางซื่อ กรุงเทพมหานคร 10800</p>
    </header>

    <StateBanner :loading="isLoading" :error="errorMessage" :loading-text="loadingText" />

    <RouteSummaryCard :route="route" />

    <GoogleMapView
      v-if="route"
      :api-key="config.public.googleMapsApiKey"
      :origin-lat="route.originLat"
      :origin-lng="route.originLng"
      :dest-lat="route.destLat"
      :dest-lng="route.destLng"
    />

    <button
      v-if="errorMessage"
      type="button"
      class="self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      @click="locate"
    >
      ลองอีกครั้ง
    </button>
  </main>
</template>
