<script setup lang="ts">
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'

const props = defineProps<{
  apiKey: string
  originLat: number
  originLng: number
  destLat: number
  destLng: number
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const mapError = ref<string | null>(null)

let optionsSet = false

async function renderMap() {
  if (!mapContainer.value) return

  if (!props.apiKey) {
    mapError.value = 'ยังไม่ได้ตั้งค่า Google Maps API key ฝั่ง frontend'
    return
  }

  mapError.value = null

  try {
    if (!optionsSet) {
      setOptions({ key: props.apiKey, v: 'weekly' })
      optionsSet = true
    }

    const { Map } = await importLibrary('maps')
    const { Marker } = await importLibrary('marker')
    const { LatLngBounds } = await importLibrary('core')
    const { DirectionsService, DirectionsRenderer, TravelMode } = await importLibrary('routes')

    const origin = { lat: props.originLat, lng: props.originLng }
    const destination = { lat: props.destLat, lng: props.destLng }

    const bounds = new LatLngBounds()
    bounds.extend(origin)
    bounds.extend(destination)

    const map = new Map(mapContainer.value, {
      center: origin,
      zoom: 13,
    })
    map.fitBounds(bounds, 64)

    new Marker({ map, position: origin, title: 'ตำแน่งปัจจุบัน', label: 'Me' })
    new Marker({ map, position: destination, title: 'Office', label: 'Office' })

    const directionsRenderer = new DirectionsRenderer({ map, suppressMarkers: true })
    const directionsService = new DirectionsService()

    const result = await directionsService.route({
      origin,
      destination,
      travelMode: TravelMode.DRIVING,
    })

    directionsRenderer.setDirections(result)
  } catch (err) {
    console.error('[GoogleMapView] failed to render map', err)
    mapError.value = 'ไม่สามารถโหลดแผนที่หรือคำนวณเส้นทางบนแผนที่ได้ในขณะนี้'
  }
}

onMounted(renderMap)

watch(
  () => [props.apiKey, props.originLat, props.originLng, props.destLat, props.destLng],
  renderMap,
)
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-800">
    <div ref="mapContainer" class="h-72 w-full sm:h-96" />
    <p
      v-if="mapError"
      class="bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
    >
      {{ mapError }}
    </p>
  </div>
</template>
