# AXM Nexus — Ishlab Chiqarishga Tayyorgarlik va Deployment Qo‘llanmasi (Module 17)

Ushbu hujjat **AXM Nexus** (Muhammad Al-Xorazmiy Vorislari platformasi) ta'lim axborot tizimini ishlab chiqarish (production) muhitiga ishonchli, xavfsiz va uzluksiz o‘rnatish, ma'lumotlar bazasi migratsiyalarini boshqarish, monitoring, zaxiralash va xavflarni bartaraf etish bo‘yicha to‘liq qo‘llanmadir.

---

## 1. Arxitektura va Muhit Konfiguratsiyasi

### 1.1. Konteynerlashtirish Tamoyillari
- **Multi-Stage Builds**: Ham backend (`eclipse-temurin:21-jdk-alpine` -> `eclipse-temurin:21-jre-alpine`), ham frontend (`node:22-alpine` -> `nginx:alpine`) tasvirlarida build va runtime ajratilgan.
- **Root-bo‘lmagan foydalanuvchi**:
  - Backend `spring:spring` foydalanuvchisi sifatida ishlaydi.
  - Frontend `nginx:nginx` unprivileged foydalanuvchisi sifatida ishlaydi.
- **Resurs Cheklovlari (Docker Compose / K8s)**:
  - Backend: `limits: cpus: '2.0', memory: 1536M`; `reservations: memory: 512M`.
  - Frontend: `limits: cpus: '0.5', memory: 256M`.
  - PostgreSQL: `limits: cpus: '2.0', memory: 2048M`.
  - Redis: `limits: cpus: '0.5', memory: 512M`.
- **Healthcheck & Graceful Shutdown**:
  - Backend `/actuator/health` endpointi orqali tekshiriladi; `server.shutdown: graceful` va `SIGTERM` bilan 30 soniyalik kutish oynasi mavjud.
  - Frontend `/healthz` orqali tekshiriladi; `SIGQUIT` bilan xizmat uzilishlarsiz to‘xtatiladi.

---

## 2. Muhit O‘zgaruvchilari Ma'lumotnomasi (Environment Variables)

| O‘zgaruvchi | Standart qiymat | Muhit | Tavsifi va Xavfsizlik Talabi |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `local` | Dev/Prod | `prod` (production sozlamalarini yuklaydi, Swagger va stack-trace o‘chiriladi) |
| `BACKEND_PORT` | `8080` | Barchasi | Backend server porti |
| `FRONTEND_PORT` | `5173` | Dev | Frontend ishlab chiqish porti |
| `HTTP_PORT` | `80` | Prod | Nginx kirish porti |
| `POSTGRES_DB` | `axvhub` | Barchasi | PostgreSQL ma'lumotlar bazasi nomi |
| `POSTGRES_USER` | `axm_admin` | Prod | Ma'lumotlar bazasi foydalanuvchisi (hech qachon `postgres` superadmin ishlatmang) |
| `POSTGRES_PASSWORD` | *(Majburiy)* | Prod | Kamida 24 belgili kuchli maxfiy parol |
| `REDIS_PASSWORD` | *(Majburiy)* | Prod | Redis ulanish paroli (`--requirepass`) |
| `APP_JWT_SECRET` | *(Majburiy)* | Prod | Kamida 256-bit (32+ bayt) HMAC-SHA256 maxfiy kaliti |
| `APP_BASE_URL` | `https://axm-nexus.uz` | Prod | Frontend domening to‘liq URL manzili |
| `CORS_ALLOWED_ORIGINS`| `https://axm-nexus.uz`| Prod | Vergul bilan ajratilgan ruxsat etilgan domenlar |
| `MAIL_HOST` | `smtp.gmail.com` | Prod | SMTP server xosti |
| `MAIL_PORT` | `587` | Prod | SMTP porti (TLS/STARTTLS) |
| `MAIL_USERNAME` | — | Prod | SMTP tizim pochtasi |
| `MAIL_PASSWORD` | — | Prod | SMTP ilova paroli (App Password) |
| `MAIL_FROM` | `noreply@axm-nexus.uz` | Prod | Xatlarda ko‘rsatiladigan jo‘natuvchi pochtasi |
| `GEMINI_API_KEY` | — | Opsional | Google Gemini 2.5 sun'iy intellekt kaliti |
| `GROQ_API_KEY` | — | Opsional | Groq Llama 3.3 inferensiya kaliti |

---

## 3. Lokal va Ishlab Chiqarish Muhitini Ishga Tushirish

### 3.1. Lokal Ishga Tushirish (Development)
```bash
# 1. Muhit faylini nusxalash
cp .env.example .env

# 2. Asosiy xizmatlarni (PostgreSQL, Redis, RabbitMQ) ishga tushirish
docker compose up -d postgres redis rabbitmq

# 3. Backendni ishga tushirish (Spring Boot)
cd backend
./gradlew bootRun

# 4. Frontendni ishga tushirish (React + Vite)
cd ../frontend
npm install
npm run dev
```

### 3.2. Ishlab Chiqarish Muhitida Ishga Tushirish (Production Docker Compose)
```bash
# 1. Serverda .env faylini yaratish va parollarni xavfsiz to'ldirish
cp .env.example .env
chmod 600 .env

# 2. Tasvirlarni qurish va xizmatlarni fonda ishga tushirish
docker compose -f docker-compose.prod.yml up -d --build

# 3. Konteynerlar holati va salomatligini tekshirish
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## 4. Ma'lumotlar Bazasi Migratsiyasi (Liquibase)

### 4.1. Tamoyillar
1. **Hech qachon Hibernate DDL avto-yangilanishini yoqmang**: Ishlab chiqarishda `spring.jpa.hibernate.ddl-auto=validate` qat'iy o‘rnatilgan.
2. **Liquibase avtomatik tekshiradi**: Ilova ishga tushganda `db.changelog-master.yaml` orqali yangi o‘zgarishlar tartib bilan qo‘llaniladi.
3. **Destruktiv o‘zgarishlar taqiqlanadi**: `DROP TABLE` yoki `DROP COLUMN` o‘zgarishlari oldindan zaxira olinmasdan va boshqaruv tasdiqlanmasdan bajarilmaydi.

### 4.2. Qo‘lda Migratsiya Tekshiruvi
```bash
# Migratsiya holatini tekshirish
cd backend
./gradlew liquibaseStatus

# Migratsiyalar SQL-skriptini tekshirish (quruq ishga tushirish / Dry Run)
./gradlew updateSQL
```

---

## 5. Zaxiralash va Qayta Tiklash (Backup & Restore)

### 5.1. Avtomatlashtirilgan Kundalik Zaxira Skripti
Serverda `/opt/nexus/scripts/backup-db.sh` sifatida saqlang:
```bash
#!/bin/bash
set -eo pipefail

BACKUP_DIR="/var/backups/nexus/postgres"
DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/axvhub_backup_$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

# Docker konteyneridan siqilgan SQL zaxira olish
docker exec -t nexus-prod-postgres pg_dump -U "${POSTGRES_USER:-axm_admin}" -d "${POSTGRES_DB:-axvhub}" -F p | gzip -9 > "$FILENAME"

# 14 kundan eski zaxiralarni tozalash
find "$BACKUP_DIR" -type f -name "axvhub_backup_*.sql.gz" -mtime +14 -delete

echo "Zaxira muvaffaqiyatli yaratildi: $FILENAME"
```

### 5.2. Qayta Tiklash Jarayoni (Restore Procedure)
> [!CAUTION]
> Qayta tiklash operatsiyasi joriy ma'lumotlarni o‘chirishi mumkin. Faqat tasdiqlangan hollarda va avval joriy holatdan tezkor zaxira olgandan so‘ng bajaring!

```bash
# 1. Backendni vaqtincha to'xtatish
docker compose -f docker-compose.prod.yml stop backend

# 2. Bazani tozalab qayta tiklash
gunzip -c /var/backups/nexus/postgres/axvhub_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i nexus-prod-postgres psql -U "${POSTGRES_USER:-axm_admin}" -d "${POSTGRES_DB:-axvhub}"

# 3. Backendni qayta ishga tushirish
docker compose -f docker-compose.prod.yml start backend
```

---

## 6. Jurnallashtirish va Monitoring (Logging & Observability)

### 6.1. Log Fayllarni Boshqarish
- Docker log-aylanmasi (Log Rotation) `json-file` drayveri orqali chegaralangan:
  - Backend: `max-size: 30m`, `max-file: 7` (jami 210MB dan oshmaydi).
  - Nginx & Redis: `max-size: 10m`, `max-file: 3`.

### 6.2. Salomatlik Endpoinlari
- **Ommaviy Salomatlik**: `GET /healthz` (Nginx) va `GET /actuator/health` (Spring Boot).
- **Ichki Tizim Diagnozi**: `GET /api/v1/admin/health-overview` faqat `ROLE_ADMIN` yoki `ROLE_SUPER_ADMIN` huquqiga ega foydalanuvchilar uchun ochiq. Parollar, ichki IP yoki maxfiy parametrlar hech qachon public endpointlarda ko‘rsatilmaydi.

---

## 7. Xatolik Yuz Berganda Qaytarish Rejasi (Rollback Procedure)

1. **Konteynerni oldingi versiyaga qaytarish**:
   ```bash
   docker tag axm-nexus-backend:previous axm-nexus-backend:latest
   docker tag axm-nexus-frontend:previous axm-nexus-frontend:latest
   docker compose -f docker-compose.prod.yml up -d --no-deps backend frontend
   ```
2. **Ma'lumotlar bazasi migratsiyasini orqaga qaytarish (Rollback)**:
   ```bash
   cd backend
   ./gradlew rollbackCount -PliquibaseCommandValue=1
   ```
3. **Qayta tiklashdan so‘ng tekshiruv**:
   ```bash
   curl -I http://localhost:80/healthz
   curl -I http://localhost:8080/actuator/health
   ```

---

## 8. Xavfsizlik Auditi va Prioritetli Xavflar Hisoboti (Security & Risk Report)

### 8.1. Aniqlangan va Bartaraf Etilgan Muhim Kamchiliklar
1. **[CRITICAL - BARTARAF ETILDI] Hardcoded Credentials Version Control'dan chiqarildi**:
   - `backend/src/main/resources/application.yml` ichidagi email va parollar tozalab olib tashlandi.
   - O‘rniga `${MAIL_USERNAME:}` va `${MAIL_PASSWORD:}` tashqi muhit o‘zgaruvchilariga o‘tkazildi.
   - **TAVSIYA**: Ilgari git tarixiga tushgan ilova parolini (Gmail App Password) zudlik bilan Google hisob boshqaruvida bekor qilish (Revoke) va yangisini faqat server `.env` faylida o‘rnatish kerak.
2. **[HIGH - BARTARAF ETILDI] Production Profilida Stack Trace Yashirildi**:
   - `application-prod.yml` yaratildi va unda `server.error.include-stacktrace: never` o‘rnatildi.
   - Swagger / OpenAPI endpointlari ishlab chiqarishda o‘chirildi (`springdoc.api-docs.enabled: false`).
3. **[HIGH - BARTARAF ETILDI] CORS Ruxsati Chegaralandi**:
   - Avvalgi `allowedOriginPatterns("*")` o‘rniga `SecurityConfig` va `WebConfig` parametrlariga `${app.cors.allowed-origins}` ulandi. Ishlab chiqarishda faqat belgilangan domendan so‘rovlar qabul qilinadi.
4. **[HIGH - BARTARAF ETILDI] Non-root Konteyner Xavfsizligi**:
   - Backend `spring:spring` va Frontend `nginx:nginx` tizim foydalanuvchilari huquqida cheklangan muhitda ishga tushadi.

### 8.2. Joriy Xavflar Ro‘yxati va Keyingi Qadamlar (Prioritized Risk Matrix)

| Xavf Darajasi | Komponent | Muammo | Tavsiya etilgan chora |
|---|---|---|---|
| **O‘RTA** | Fayl yuklash (Uploads) | 50MB gacha ruxsat etilgan | Yuklanayotgan fayl kengaytmasi va Magic Bytes (MIME) tekshiruvini qat'iylashtirish, fayl nomlarini UUID bilan saqlash. |
| **O‘RTA** | Rate Limiting | Brute-force hujumlari | Auth login endpointi uchun Redis asosidagi rate limiter (`Bucket4j` yoki Nginx `limit_req_zone`) qo‘llash. |
| **PAST** | HTTPS / TLS | SSL sertifikati | Docker Compose oldiga Cloudflare yoki Let's Encrypt (Certbot) bilan Nginx Reverse Proxy qo‘yish. |

---

## 9. CI/CD Konfiguratsiyasi (GitHub Actions)

`.github/workflows/ci.yml` quvuri orqali quyidagi 8 ta majburiy tekshiruv to‘liq avtomatlashtirilgan:
1. Java 21 da backend kompilyatsiyasi (`./gradlew assemble -x test`).
2. Backend testlari (`./gradlew test`) va hisobot artefaktini saqlash.
3. Frontend TypeScript statik tekshiruvi (`tsc -b`).
4. Frontend ESLint tekshiruvi (`npm run lint`).
5. Frontend Vitest to‘liq testlari (`npm test -- --run`).
6. Production frontend build yaratish (`npm run build`).
7. Gitleaks orqali maxfiy kalitlar va xavfsizlik skaneri (`gitleaks-action`).
8. Docker konteynerlari build sinovi (`docker build` backend & frontend).
