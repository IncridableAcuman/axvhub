# 8. Frontend Feature-Sliced Design (FSD) Architecture

Frontend arxitekturasi **Feature-Sliced Design (FSD 2.1)** standartiga asoslangan bo‘lib, modullarning ajralishi va loyihaning oson kengayishini ta’minlaydi.

```text
frontend/src/
├── app/                  # Ilova sozlamalari, provayderlar va global stillar
│   ├── providers/        # QueryClientProvider, RouterProvider, ThemeProvider
│   ├── styles/           # Tailwind CSS va shrift sozlamalari
│   └── App.tsx           # Asosiy ildiz komponent
│
├── pages/                # Marshrutlar bilan bog'langan to'liq sahifalar
│   ├── landing/          # Bosh sahifa (Landing)
│   ├── dashboard/        # Umumiy boshqaruv paneli
│   ├── timetable/        # Dars jadvallari sahifasi
│   ├── students/         # O'quvchilar reyestri
│   ├── mentors/          # Mentorlar katalogi
│   ├── curriculum/       # 8-11 sinf o'quv dasturi
│   └── settings/         # Tizim va shaxsiy sozlamalar
│
├── widgets/              # Bir nechta feature va entityni birlashtiruvchi mustaqil UI bloklar
│   ├── navbar/           # Asosiy navigatsiya va status paneli
│   ├── health-badge/     # Jonli backend holatini ko'rsatuvchi vidjet
│   ├── sidebar/          # Yon boshqaruv paneli
│   └── dashboard-stats/  # Ta'lim ko'rsatkichlari kartalari
│
├── features/             # Foydalanuvchi biznes harakatlari (Interactions)
│   ├── auth/             # Login, logout, parolni tiklash formasi
│   ├── manual-schedule/  # Dars jadvalini qo'lda kiritish formasi
│   └── ai-import/        # Excel/PDF jadvalini AI orqali import qilish
│
├── entities/             # Biznes sub'ektlari (Model, Karta, Kichik UI)
│   ├── user/             # User turi, profil vidjeti, avatar
│   ├── student/          # Student turi, kartasi, qisqacha ma'lumoti
│   ├── mentor/           # Mentor turi, tajribasi, unvoni
│   └── schedule/         # Dars jadvali katagi, vaqt oralig'i
│
└── shared/               # Biznes mantig'idan xoli umumiy resurslar
    ├── api/              # Axios instansiyasi, umumiy so'rovlar, health check
    ├── config/           # O'zgarmas parametrlar va muhit konstantalari
    ├── lib/              # Yordamchi util funksiyalar (cn, formatting)
    ├── ui/               # Boshlang'ich UI komponentlar (Button, Card, Input)
    └── types/            # Umumiy TypeScript interfeyslari
```

## 8.1. Bog‘liqlik Qoidalari (Import Rules)
- **app** $\rightarrow$ pages, widgets, features, entities, shared
- **pages** $\rightarrow$ widgets, features, entities, shared
- **widgets** $\rightarrow$ features, entities, shared
- **features** $\rightarrow$ entities, shared
- **entities** $\rightarrow$ shared
- **shared** $\rightarrow$ faqat shared ichidagi boshqa modullar yoki tashqi kutubxonalarga bog‘lana oladi.
- Bir qatlam ichidagi modullar bir-birini to‘g‘ridan-to‘g‘ri import qilishi taqiqlanadi (No Cross-Imports at the same layer).

## 8.2. Holat Boshqaruvi (State Management)
- **Server State:** `@tanstack/react-query` orqali keshlanadi, fon rejimida yangilanadi (`staleTime: 5 min`).
- **Client State:** UI holatlari (ochiq modal, faol filtrlar, til tanlovi) uchun `Zustand` va `useState`.
- **Formlar va Validatsiya:** `react-hook-form` va `zod` sxemalari orqali xavfsiz boshqariladi.
