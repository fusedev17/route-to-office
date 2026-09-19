function mapGeolocationError(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'คุณไม่ได้อนุญาตให้เข้าถึงตำแหน่ง กรุณาอนุญาตการเข้าถึงตำแหน่งแล้วลองใหม่'
    case err.POSITION_UNAVAILABLE:
      return 'ไม่สามารถระบุตำแหน่งของคุณได้ในขณะนี้'
    case err.TIMEOUT:
      return 'การขอตำแหน่งใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง'
    default:
      return 'เกิดข้อผิดพลาดในการขอตำแหน่ง'
  }
}

export function useGeolocation() {
  const lat = ref<number | null>(null)
  const lng = ref<number | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  function locate() {
    if (!import.meta.client || !('geolocation' in navigator)) {
      error.value = 'เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง'
      return
    }

    loading.value = true
    error.value = null

    navigator.geolocation.getCurrentPosition(
      (position) => {
        lat.value = position.coords.latitude
        lng.value = position.coords.longitude
        loading.value = false
      },
      (err) => {
        error.value = mapGeolocationError(err)
        loading.value = false
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return { lat, lng, error, loading, locate }
}
