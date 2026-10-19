# 11. Creative Design System & UX (AXM Nexus Design System)

## 1. Design Direction & Philosophy

**AXM Nexus** — bu shunchaki oddiy admin panel emas, balki Muhammad Al-Xorazmiy Vorislari dasturi doirasida 8–11-sinf iqtidorli o‘quvchilari, ularning IT va xorijiy til mentorlari hamda administratorlar har kuni faol foydalanadigan premium EdTech platformasi.

### Asosiy Tamoyillar:
1. **Calm, Intelligent & Professional:** Shovqinli va chalg‘ituvchi sun’iy gradientlar, neon yaltiroqlar va o‘rinsiz bezaklardan xoli, aql va diqqatni jamlashga xizmat qiluvchi toza visual muhit.
2. **Accessible by Default (WCAG 2.2 AA):** Har bir interaktiv element (tugmalar, formalar, havolalar) kamida 4.5:1 kontrastga ega, klaviatura orqali boshqariladi (`focus-visible`) va ekran o‘quvchi dasturlar (Screen Readers) bilan to‘liq mos.
3. **Dual Theme Harmony (Light & Dark):** Yorug‘ va qorong‘i muhitda birdek ko‘zni toliqtirmaydigan, o‘lchovli va tabiiy soyalar, slate/zinc asosidagi neytral ohanglar hamda vazmin indigo/ko‘k aksentlar.
4. **Information Architecture & Density:** O‘quvchilar uchun sodda va tushunarli, mentorlar va ma’murlar uchun esa dars jadvali, davomat va tahlillarni tezkor boshqarish imkonini beruvchi qulay axborot zichligi.
5. **No Color-Only State:** Holatlar (muvaffaqiyat, ogohlantirish, xatolik, neytral) faqat rang bilan emas, balki semantik piktogrammalar va aniq matnli tushuntirishlar bilan birgalikda taqdim etiladi.

---

## 2. Design Tokens & Visual Scales

### 2.1. Spacing Scale (4px Base Grid)
| Token | Qiymat (rem) | Piksellarda | Qo‘llanilishi |
| :--- | :--- | :--- | :--- |
| `space-1` | 0.25rem | 4px | Kichik oraliqlar, badge padding |
| `space-2` | 0.5rem | 8px | Tugma ichki padding, piktogramma va matn oralig‘i |
| `space-3` | 0.75rem | 12px | Input va form maydonlari ichki oraliqlari |
| `space-4` | 1.0rem | 16px | Standart komponentlar oralig‘i, karta padding |
| `space-6` | 1.5rem | 24px | Bloklar va bo‘limlararo oraliq |
| `space-8` | 2.0rem | 32px | Katta konteynerlar va grid oralig‘i |
| `space-12` | 3.0rem | 48px | Sahifa bo‘limlari va asosiy layout |

### 2.2. Typography Scale (Inter Font Family)
- **Font Sans:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Display 1:** `text-3xl font-extrabold tracking-tight` (30px / 36px) — Faqat asosiy sarlavha
- **Heading 1:** `text-2xl font-bold tracking-tight` (24px / 32px) — Sahifa sarlavhalari
- **Heading 2:** `text-xl font-semibold` (20px / 28px) — Modul va karta sarlavhalari
- **Heading 3:** `text-lg font-medium` (18px / 24px) — Ichki blok sarlavhalari
- **Body Large:** `text-base font-normal` (16px / 24px) — Asosiy matnlar, intro
- **Body Regular:** `text-sm font-normal` (14px / 20px) — Form maydonlari, jadvallar, ro‘yxatlar
- **Caption / Meta:** `text-xs font-medium` (12px / 16px) — Badglar, yordamchi izohlar, dars soatlari
- **Code / Mono:** `font-mono text-xs` (12px / 16px) — PINFL, guruh kodlari, ID raqamlar

### 2.3. Semantic Color Tokens

```css
/* CSS Variables for Light / Dark Mode */
:root {
  --bg-canvas: #f8fafc;        /* Sahifaning umumiy foni (Slate-50) */
  --bg-surface: #ffffff;       /* Kartalar, modallar, panellar (White) */
  --bg-subtle: #f1f5f9;        /* Input foni, faol bo'lmagan tablar (Slate-100) */
  --bg-muted: #e2e8f0;         /* Ajratgichlar, disabled holatlar (Slate-200) */
  
  --text-primary: #0f172a;     /* Asosiy o'qish matni (Slate-900) */
  --text-secondary: #475569;   /* Yordamchi matn va yo'riqnomalar (Slate-600) */
  --text-muted: #94a3b8;       /* Placeholders, metadata (Slate-400) */
  
  --border-default: #e2e8f0;   /* Standart karta va chiziq chegaralari */
  --border-subtle: #f1f5f9;    /* Nozik chiziqlar */
  --border-strong: #cbd5e1;    /* Input chegaralari */
  
  --brand-primary: #4f46e5;    /* Vazmin indigo (Indigo-600) */
  --brand-primary-hover: #4338ca;
  --brand-accent: #0284c7;     /* Sky/Cyan aksenti */
  --brand-subtle: #eef2ff;     /* Indigo-50 */
  
  --status-success: #059669;   /* Emerald-600 */
  --status-warning: #d97706;   /* Amber-600 */
  --status-error: #dc2626;     /* Red-600 */
  --status-info: #0284c7;      /* Sky-600 */
}

.dark {
  --bg-canvas: #090d16;        /* Tungi chuqur fon */
  --bg-surface: #111827;       /* Tungi kartalar va panellar (Gray-900) */
  --bg-subtle: #1e293b;        /* Tungi inputlar va faol bo'lmagan tablar */
  --bg-muted: #334155;         /* Tungi ajratgichlar */
  
  --text-primary: #f8fafc;     /* Tungi yorug' matn */
  --text-secondary: #94a3b8;   /* Tungi yordamchi matn */
  --text-muted: #64748b;       /* Tungi metadata */
  
  --border-default: #1e293b;   /* Tungi chegaralar */
  --border-subtle: #0f172a;    
  --border-strong: #334155;    
  
  --brand-primary: #6366f1;    /* Indigo-500 */
  --brand-primary-hover: #818cf8;
  --brand-accent: #38bdf8;     
  --brand-subtle: #1e1b4b;     
  
  --status-success: #10b981;   
  --status-warning: #f59e0b;   
  --status-error: #ef4444;     
  --status-info: #38bdf8;      
}
```

---

## 3. Component Architecture (shared/ui & widgets)

Modul 02 doirasida Feature-Sliced Design (FSD) tamoyiliga qat’iy rioya qilingan:
- **`shared/ui`** — Biznes mantig‘idan 100% xoli, parametrlashtirilgan, har qanday loyiha modulida qayta ishlatiluvchi atomik va molekulyar komponentlar:
  1. `Button` — 6 xil variant (`primary`, `secondary`, `outline`, `ghost`, `destructive`, `link`), 4 xil hajm, yuklanish spinniri.
  2. `Input` — Matn, email, parol (toggle ko‘rsatish), qidiruv ikonkasi, tozalash tugmasi bilan.
  3. `Textarea` — Hajmi moslashuvchan, xatolik holatlari va belgi hisoblagichli maydon.
  4. `FormField` — Label, yordamchi izoh, xatolik xabari va majburiy yulduzcha (`*`) bilan qoplama.
  5. `Select` — Klaviatura bilan boshqariluvchi, qidiruvli va toza tanlov ro‘yxati.
  6. `Checkbox` — Toza tanlov, chala tanlangan (indeterminate) holat va klaviatura fokusi.
  7. `Switch` — Holatni faollashtirish/o‘chirish slayderi.
  8. `Dialog` & `ConfirmDialog` — Modal oyna, fon xiralashishi, ESC tugmasi orqali yopilish, fokus tuzog‘i (focus trap).
  9. `DropdownMenu` — Tugma bosilganda chiquvchi harakatlar menyusi, ajratgichlar va xavfli amallar.
  10. `Tabs` — Klaviatura o‘qlari bilan yurish, faol indikator va kontekstli kontent.
  11. `Badge` — 7 xil rang varianti, ixtiyoriy status nuqtasi (pulse yoki statik).
  12. `Tooltip` — Hover va fokusda paydo bo‘luvchi tushuntirish ko‘rsatkichi.
  13. `Table` — Sarlavhalar, qatorlar, kataklar, responsive gorizontal skroll va mobil stacked karta ko‘rinishi.
  14. `Card` — `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
  15. `Skeleton` — Ma’lumot yuklanayotganda qismlar shaklini ko‘rsatuvchi to‘lqinsimon bloklar.
  16. `EmptyState` — Ma’lumot bo‘lmaganda tushunarli belgi, sarlavha va yangi qo‘shish harakati.
  17. `ErrorState` — Xatolik yuz berganda qayta urinish tugmasi va texnik xatolik tafsilotlari.
  18. `Toast` — Tizimli xabarnomalar (Muvaffaqiyat, Xatolik, Ogohlantirish, Axborot) provayderi va `useToast()` hooki.
  19. `Breadcrumbs` — Ierarxik navigatsiya yo‘li (`Bosh sahifa > Dars jadvallari > Guruh`).
  20. `ThemeToggle` — Yorug‘ / Qorong‘i / Tizimli rejim tugmasi.
  21. `ChartContainer` — Grafiklar uchun tayyor sarlavha, vaqt filtri va bo‘sh/yuklanish holatlari konteyneri.
  22. `SummaryCard` — KPI ko‘rsatkich kartasi (qiymat, dinamika, o‘sish/pasayish badgi, ikonka).

- **`widgets/`** — Ilova miqyosidagi navigatsiya va layout bloklari:
  - `AppHeader` — Yuqori panel: breadcrumb, tezkor qidiruv, filial ma’lumoti, backend salomatlik ko‘rsatkichi, tema o‘zgartirgich va foydalanuvchi menyusi.
  - `Sidebar` — Chap navigatsiya: desktopda yig‘iluvchi (collapsed/expanded), mobilda chiquvchi (drawer), faol marshrut nishoni.
  - `AppShell` — Barcha sahifalarni o‘rab turuvchi, responsiv, "skip-to-content" xavfsiz o‘tish tugmasiga ega bosh freymvork.

---

## 4. Accessibility & Mobile Responsiveness

- **Accessibility (A11y):**
  - Har bir form elementi va tugmasi `aria-label`, `aria-describedby`, `aria-invalid` parametrlariga ega.
  - Dialoglar ochilganda fokus modal ichida saqlanadi (`inert` / `focus trap`).
  - `@media (prefers-reduced-motion: reduce)` holatida barcha animatsiyalar va spinnerlar o‘chiriladi.
- **Mobile First & Responsive Layout:**
  - Jadvallar kichik ekranlarda (sm < 640px) buzilib ketmasligi uchun gorizontal skroll yoki stacked card ko‘rinishini qo‘llab-quvvatlaydi.
  - Sidebar planshet va mobil qurilmalarda avtomatik yashirinadi va gamburger menyu orqali boshqariladi.
  - Hech qanday ekranda gorizontal oqish (horizontal overflow) vujudga kelmaydi.
