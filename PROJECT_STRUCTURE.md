# โครงสร้างโปรเจกต์ — Route to Office

ระบบ Web แบ่งเป็น Backend (NestJS) + Frontend (Nuxt 4 + Tailwind) สำหรับแสดงเส้นทาง, ระยะทาง, เวลาเดินทาง และ Google Map จากตำแหน่งผู้ใช้ไปยังบริษัท

## จุดหมายปลายทาง (บริษัท)

- **สถานที่**: อาคารสำนักงานใหญ่ 2 เอสซีจี
- **Latitude**: `13.805432`
- **Longitude**: `100.5377344`
- ที่มา: ดึงจากลิงก์ Google Maps ที่ผู้ใช้ให้มา (พิกัดตัว place ไม่ใช่พิกัดกล้อง)

```
route-office/
├── backend/                          # NestJS API
│   ├── src/
│   │   ├── main.ts                   # Bootstrap, เปิด CORS
│   │   ├── app.module.ts             # Root module
│   │   ├── config/
│   │   │   └── configuration.ts      # โหลด env: GOOGLE_MAPS_API_KEY, COMPANY_LAT, COMPANY_LNG
│   │   └── maps/
│   │       ├── maps.module.ts
│   │       ├── maps.controller.ts    # GET /maps/route?lat=&lng=
│   │       ├── maps.service.ts       # เรียก Google Distance Matrix / Directions API
│   │       ├── dto/
│   │       │   └── get-route.dto.ts  # Validate lat, lng ด้วย class-validator
│   │       └── interfaces/
│   │           └── route-result.interface.ts  # { distanceText, durationText, distanceValue, durationValue, polyline }
│   ├── test/
│   │   └── maps.service.spec.ts      # Unit test mock Google API response
│   ├── .env.example                  # GOOGLE_MAPS_API_KEY=, COMPANY_LAT=13.805432, COMPANY_LNG=100.5377344, PORT=
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                         # Nuxt 4
│   ├── app/
│   │   ├── app.vue
│   │   ├── pages/
│   │   │   └── index.vue             # หน้าเดียว: ขอ location -> เรียก backend -> แสดงผล
│   │   ├── components/
│   │   │   ├── RouteSummaryCard.vue  # แสดงระยะทาง + เวลาเดินทาง
│   │   │   ├── GoogleMapView.vue     # แสดง Google Map + เส้นทาง (polyline)
│   │   │   └── StateBanner.vue       # Loading / Error (ปฏิเสธ location, API ล่ม)
│   │   └── composables/
│   │       ├── useGeolocation.ts     # ขอพิกัดผู้ใช้จาก navigator.geolocation
│   │       └── useCompanyRoute.ts    # เรียก backend GET /maps/route
│   ├── assets/
│   │   └── css/
│   │       └── main.css              # @import "tailwindcss";  (Tailwind CSS เวอร์ชันล่าสุด)
│   ├── public/
│   ├── nuxt.config.ts                # runtimeConfig: googleMapsApiKey (public), apiBase
│   ├── .env.example                  # NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=, NUXT_PUBLIC_API_BASE=
│   ├── tsconfig.json
│   └── package.json                  # ติดตั้ง tailwindcss @tailwindcss/vite เวอร์ชันล่าสุดตาม official guide
│
├── .gitignore                        # .env, node_modules, .nuxt, dist
└── README.md                         # วิธีรันโปรเจกต์ทั้งสองฝั่ง
```

## หมายเหตุสำคัญ

- **Backend ถือ API Key จริง**: เรียก Google Distance Matrix/Directions API จากฝั่ง server เท่านั้น เพื่อไม่ให้ key ที่มีสิทธิ์กว้างหลุดไปฝั่ง client
- **Frontend ใช้ Key แยกต่างหาก**: สำหรับ Maps JavaScript API (แสดงแผนที่) เท่านั้น จำกัดด้วย HTTP referrer
- **พิกัดบริษัท**: กำหนดเป็นค่าคงที่ใน backend `.env` (`COMPANY_LAT=13.805432`, `COMPANY_LNG=100.5377344`) ไม่ต้องรับจาก client
- **การคำนวณเวลาเดินทาง**: อิงจากวันเวลาปัจจุบัน (`departure_time=now`) ผ่าน Google Distance Matrix API เพื่อให้ได้ `duration_in_traffic` ที่แม่นยำ
- **CORS**: backend ต้องเปิดให้ origin ของ frontend เรียกได้ (dev: `http://localhost:3000`)
