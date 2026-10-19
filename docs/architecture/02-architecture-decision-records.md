# 2. Architecture Decision Records (ADRs)

## ADR-001: Tanlov — Modular Monolith (Mikroservislar emas)
* **Holat:** Qabul qilindi
* **Kontekst:** Loyihaning dastlabki bosqichida jamoa resurslari, infratuzilma xarajatlari, taqsimlangan tranzaksiyalar (distributed transactions), monitoring va xizmatlararo tarmoq kechikishlari (network latency) mikroservislarni noo‘rin murakkablashtiradi.
* **Qaror:** Tizim **DDD + Modular Monolith** tamoyilida yagona deployment birligi sifatida quriladi. Har bir biznes modul (masalan, `identity`, `classrooms`, `scheduling`, `assessments`, `grading`) o‘zining mustaqil domen va dastur chegarasiga ega bo‘ladi.
* **Oqibatlar:**
  - Bitta JVM jarayoni ichida ishlaydi, deployment va monitoring soddalashadi.
  - Modullar o‘rtasida to‘g‘ridan-to‘g‘ri JPA repository chaqirish taqiqlanadi; faqat application service yoki ichki domen voqealari (Spring ApplicationEventPublisher) orqali muloqot qilinadi.
  - Kelgusida ma’lum bir modulga yuklama oshsa, uni minimal o‘zgarish bilan alohida mikroservisga ajratish oson bo‘ladi.

---

## ADR-002: DDD Qatlamlari va Paketlar Strukturasi
* **Holat:** Qabul qilindi
* **Kontekst:** Biznes mantig‘ini framework va tashqi texnologiyalardan ajratish zarur.
* **Qaror:** Har bir modul quyidagi 4 ta qatlamga bo‘linadi (zaruratiga ko‘ra):
  - `domain`: Biznes ob’ektlari (Entities, Value Objects, Domain Events, Enums). Frameworklardan maksimal darajada xoli.
  - `application`: Use-caselar, DTOlar, xizmat interfeyslari (Service interfaces), tranzaksiya chegaralari (`@Transactional`).
  - `infrastructure`: Ma’lumotlar bazasi (Spring Data JPA Repositories), tashqi integratsiyalar (AI klientlar, fayl saqlash).
  - `presentation`: REST Controllerlar, OpenAPI annotatsiyalari, HTTP parametrlar validatsiyasi.
* **Oqibatlar:** Kod toza, testlash oson va barqaror bo‘ladi.

---

## ADR-003: Ko‘p Rolli RBAC (Multi-Role RBAC Model)
* **Holat:** Qabul qilindi
* **Kontekst:** Bir shaxs tizimda bir vaqtning o‘zida ham Mentor, ham Content Manager yoki Observer bo‘lishi mumkin. Bitta ustunli `role VARCHAR` tizimi talabni qondirmaydi.
* **Qaror:** Quyidagi relyatsion model joriy qilinadi:
  - `users` (asosiy hisob ma’lumotlari)
  - `roles` (tizimdagi rollar: `SUPER_ADMIN`, `PROGRAM_ADMIN`, `REGIONAL_COORDINATOR`, `MENTOR`, `STUDENT`, `CONTENT_MANAGER`, `OBSERVER`)
  - `user_roles` (ko‘pdan-ko‘pga bog‘liqlik)
  - `permissions` (modul va amal bo‘yicha atomik huquqlar, masalan: `LESSON_WRITE`, `GRADE_READ`)
  - `role_permissions` (rollarga ruxsatlarni biriktirish)
* **Oqibatlar:** Ruxsatlar server tomonda `@PreAuthorize("hasAuthority('...')")` orqali qat’iy tekshiriladi.

---

## ADR-004: Ma’lumotlar Bazasi Migratsiyasi va Liquibase
* **Holat:** Qabul qilindi
* **Kontekst:** Production muhitida avtomatik schema o‘zgarishlari (`hibernate.ddl-auto: update` yoki `create`) ma’lumotlarning yo‘qolishi yoki schema buzilishiga olib keladi.
* **Qaror:**
  - PostgreSQL yagona haqiqat manbai (Single Source of Truth).
  - Barcha o‘zgarishlar faqat **Liquibase** versiyalangan changeloglari orqali amalga oshiriladi (`db.changelog-master.yaml` va `changes/*.sql`).
  - `spring.jpa.hibernate.ddl-auto: validate` holatida ishlatiladi.
  - Vaqt maydonlari qat’iy ravishda UTC formatida (`TIMESTAMP WITH TIME ZONE` yoki `TIMESTAMP WITHOUT TIME ZONE` UTCda) saqlanadi.

---

## ADR-005: Token Asosidagi Xavfsizlik (Spring Security + JWT)
* **Holat:** Qabul qilindi
* **Kontekst:** REST API uchun server holatini saqlamaydigan (stateless) autentifikatsiya modeli zarur.
* **Qaror:**
  - BCrypt shifrlash algoritmi (parollar uchun).
  - Spring Security Filter Chain orqali har bir so‘rovda JWT tekshiriladi.
  - Token ichida `userId`, `username`, `roles` va `authorities` saqlanadi.
  - Maxfiy kalitlar faqat muhit o‘zgaruvchilaridan (`JWT_SECRET`) olinadi, hech qachon kodga yozilmaydi.

---

## ADR-006: Frontend — Feature-Sliced Design (FSD)
* **Holat:** Qabul qilindi
* **Kontekst:** Loyiha kengaygan sari UI kodining chalkashib ketishining oldini olish.
* **Qaror:** Frontend 6 ta qat’iy darajaga bo‘linadi:
  1. `app` (provayderlar, global stillar, routing)
  2. `pages` (to‘liq sahifalar)
  3. `widgets` (yirik bloklar: Navbar, Sidebar, DashboardOverview)
  4. `features` (foydalanuvchi harakatlari: AuthLogin, AiImport, ManualSchedule)
  5. `entities` (biznes sub’ektlari: User, Student, Mentor, Schedule)
  6. `shared` (qayta ishlatiluvchi UI, API klient, yordamchi funksiyalar)
* **Qoida:** Yuqori qatlam pastkisiga bog‘lanishi mumkin, ammo pastki qatlam yuqorisiga hech qachon import qila olmaydi.

---

## ADR-007: TanStack React Query — Server Holati Boshqaruvi
* **Holat:** Qabul qilindi
* **Kontekst:** `useEffect` va `useState` orqali qo‘lda API keshini boshqarish ortiqcha re-renderlar va race condition keltirib chiqaradi.
* **Qaror:** Serverdan keladigan barcha ma’lumotlar `@tanstack/react-query` orqali keshlanadi, fon rejimida yangilanadi (stale-while-revalidate) va xatoliklar avtomatik boshqariladi.

---

## ADR-008: Redis Kesh Boshqaruvi Siyosati
* **Holat:** Qabul qilindi
* **Kontekst:** Erta bosqichda Redisga majburiy qaramlik monitoring va lokal muhitni og‘irlashtiradi.
* **Qaror:** Redis faqat oqlangan hollarda (masalan, API so‘rovlarini cheklash — Rate Limiting, token blocklist, og‘ir statistik hisobotlar keshlanishi) ishlatiladi. Dastlabki asosiy tranzaksion ma’lumotlar to‘g‘ridan-to‘g‘ri PostgreSQL orqali olinadi.
