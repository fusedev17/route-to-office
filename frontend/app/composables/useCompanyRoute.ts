import type { MaybeRefOrGetter } from 'vue'
import type { RouteResult } from '~/types/route'

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { message?: string | string[] } }).data
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : data.message
    }
  }
  if (err instanceof Error) return err.message
  return 'เกิดข้อผิดพลาดในการเรียกข้อมูลเส้นทาง'
}

export function useCompanyRoute(
  lat: MaybeRefOrGetter<number | null>,
  lng: MaybeRefOrGetter<number | null>,
) {
  const data = ref<RouteResult | null>(null)
  const error = ref<string | null>(null)
  const pending = ref(false)

  async function fetchRoute() {
    const latValue = toValue(lat)
    const lngValue = toValue(lng)
    if (latValue == null || lngValue == null) return

    pending.value = true
    error.value = null

    try {
      const config = useRuntimeConfig()
      data.value = await $fetch<RouteResult>('/maps/route', {
        baseURL: config.public.apiBase,
        params: { lat: latValue, lng: lngValue },
      })
    } catch (err) {
      data.value = null
      error.value = extractErrorMessage(err)
    } finally {
      pending.value = false
    }
  }

  watch(
    [() => toValue(lat), () => toValue(lng)],
    ([newLat, newLng]) => {
      if (newLat != null && newLng != null) {
        fetchRoute()
      }
    },
    { immediate: true },
  )

  return { data, error, pending, refresh: fetchRoute }
}
