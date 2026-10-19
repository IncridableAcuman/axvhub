# 6. API Conventions & Standards (API Standartlari)

## 6.1. URL Tuzilishi va Marshrutlar
Barcha biznes API yo‘llari quyidagi formatga rioya qiladi:
```text
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{sub-resource}
```
Misollar:
- `GET /api/v1/health` — Tizim holati
- `GET /api/v1/students?page=0&size=20&sort=fullName,asc` — O‘quvchilar ro‘yxati
- `POST /api/v1/schedules/manual` — Dars jadvalini yaratish
- `POST /api/v1/auth/login` — Autentifikatsiya

## 6.2. Standart Javob Qobig‘i (Response Envelope)
Barcha REST javoblari `ApiResponse<T>` formati orqali yuboriladi:
```json
{
  "success": true,
  "message": "Amal muvaffaqiyatli bajarildi",
  "data": { ... },
  "timestamp": "2026-10-16T21:00:00"
}
```

Xatolik holatida (HTTP 4xx / 5xx):
```json
{
  "success": false,
  "message": "Validatsiya xatosi yuz berdi",
  "data": {
    "username": "Login kamida 3 belgidan iborat bo'lishi kerak",
    "pinfl": "PINFL 14 xonali bo'lishi shart"
  },
  "timestamp": "2026-10-16T21:00:00"
}
```

## 6.3. Sahifalash va Saralash (Pagination & Sorting)
Katta hajmdagi to‘plamlar uchun doim `PageResponse<T>` ishlatiladi:
- Query parametrlari: `page` (0 dan boshlanadi), `size` (default 20, max 100), `sort` (masalan, `createdAt,desc`).
- Metadata tarkibi: `content`, `pageNumber`, `pageSize`, `totalElements`, `totalPages`, `last`.

## 6.4. HTTP Holat Kodlari (Status Codes)
| Kod | Ma’nosi | Qo‘llanishi |
|---|---|---|
| `200 OK` | Muvaffaqiyat | Ma’lumotni o‘qish yoki yangilash muvaffaqiyatli yakunlanganda |
| `201 Created` | Yaratildi | Yangi resurs (`POST`) bazada yaratilganda |
| `204 No Content` | Tarkibsiz | Resurs o‘chirilganda (`DELETE`) |
| `400 Bad Request` | Noto‘g‘ri so‘rov | Biznes qoidalari yoki parametrlar buzilganda |
| `401 Unauthorized` | Autentifikatsiyasiz | Token yo‘q yoki muddati o‘tgan |
| `403 Forbidden` | Taqiqlangan | Foydalanuvchida bu resursga yetarli rol yoki huquq yo‘q |
| `404 Not Found` | Topilmadi | So‘ralgan ID bo‘yicha yozuv mavjud emas |
| `409 Conflict` | Ziddiyat | Unikal cheklov (masalan, mavjud login yoki PINFL) |
| `500 Internal Error` | Server xatosi | Kutilmagan ichki tizim xatosi |
