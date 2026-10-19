# 1. Repository Assessment (Holat Tahlili)

## 1.1. Kontekst va Boshlang‘ich Holat
Loyiha O‘zbekiston Respublikasidagi **"Muhammad al-Xorazmiy Vorislari"** davlat dasturi (8–11-sinf iqtidorli o‘quvchilari, IT va til mentorlari, o‘quv guruhlari va dars jadvallari) uchun raqamli ta’lim ekotizimi (**AXM Nexus**) sifatida rejalashtirilgan.

Boshlang‘ich holatda repositoryda tezkor prototip kodlari mavjud edi:
1. **Backend**:
   - `com.student.backend` paketi ostida monolit prototip mavjud edi.
   - Spring Initializr orqali loyihaga kerak-nokerak ko‘plab kutubxonalar (`spring-boot-starter-amqp`, `elasticsearch`, `mail`, `session-data-redis`, `thymeleaf`) qo‘shilgan, ammo ular biznes mantiqda ishlatilmagan.
   - Spring Boot 4.1.1 versiyasida `ObjectMapper` bean avtomatik ro‘yxatga olinmagani tufayli testlar va servislarning inyeksiyasi (`AiImportService`) to‘xtab qolgan edi.
   - Test kontekstida PostgreSQL ulanishi majburiy bo‘lib, docker/bazasiz testlarni tezkor ishga tushirish imkoni yo‘q edi.
   - `User` modelida rollar bitta ustunda (`role VARCHAR`) saqlangan, bu esa bir foydalanuvchiga bir nechta rol biriktirish talabiga zid edi.
   - Parollar va tokenlar uchun soxta JWT generator (`"jwt." + UUID.randomUUID()`) ishlatilgan.
   - `hibernate.ddl-auto: update` holatida edi, bu esa Liquibase bilan ziddiyat keltirib chiqarishi mumkin.

2. **Frontend**:
   - React 19 + TypeScript + Vite + Tailwind CSS v4 arxitekturasi yaratilgan.
   - FSD (Feature-Sliced Design) talab qilingan bo‘lsa-da, barcha komponentlar bitta `src/components/` papkasiga jamlangan edi.
   - TanStack React Query o‘rnatilmagan edi.
   - ESLint tekshiruvlarida 11 ta xatolik (`react-hooks/set-state-in-effect`, `any` turlari, ishlatilmagan xato o‘zgaruvchilari) mavjud edi.
   - `baseUrl` TypeScript 6+ talablariga mos kelmay qolgan edi.

## 1.2. Texnik Qarzlar va Xavflar (Technical Debt & Risks)
| Xavf / Texnik qarz | Daraja | Yechim |
|---|---|---|
| Bitta ustunli `role` (Single Role Anti-Pattern) | **Yuqori** | Multi-role RBAC: `users`, `user_roles`, `roles`, `role_permissions`, `permissions` jadvallariga o‘tish. |
| Soxta JWT va zaif autentifikatsiya | **Yuqori** | Spring Security + OAuth2 Resource Server + JWT asosidagi standart stateless arxitektura. |
| Keraksiz kutubxonalar (RabbitMQ, Elastic, Redis) | **O‘rta** | Gradle'dan chiqarib tashlandi, faqat kerak bo‘lganda qo‘shiladi. |
| Testlarning tashqi bazaga qaramligi | **O‘rta** | Birlik testlar uchun H2 (PostgreSQL rejimi), integratsion testlar uchun Testcontainers joriy qilindi. |
| FSD qoidalarining buzilishi | **O‘rta** | `shared`, `entities`, `features`, `widgets`, `pages`, `app` qatlamlariga bosqichma-bosqich o‘tkazish. |
| API xatolarining noizchilligi | **O‘rta** | Yagona `ApiResponse<T>` va `GlobalExceptionHandler` orqali standartlashtirildi. |

## 1.3. Amalga Oshirilgan Boshlang‘ich Optimallashtirish
- Gradle bog‘liqliklari tozalandi va barqarorlashtirildi.
- `JacksonConfig` orqali `ObjectMapper` beani va `JavaTimeModule` ro‘yxatdan o‘tkazildi.
- Actuator va `/api/v1/health` salomatlik tekshiruvi integratsiya qilindi.
- Frontendga `@tanstack/react-query`, `react-hook-form`, `clsx`, `tailwind-merge` ulandi.
- Frontend FSD tayanch qatlamlari (`shared/api`, `shared/config`, `shared/lib`, `app/providers`, `widgets/health-badge`) yaratildi.
- ESLint va TypeScript barcha xatoliklari to‘liq bartaraf etildi.
