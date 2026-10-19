import React, { useState } from 'react'
import {
  Button,
  Input,
  Textarea,
  FormField,
  Select,
  Checkbox,
  Switch,
  Dialog,
  ConfirmDialog,
  DropdownMenu,
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
  Badge,
  Tooltip,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Skeleton,
  EmptyState,
  ErrorState,
  useToast,
  Breadcrumbs,
  ThemeToggle,
  ChartContainer,
  SummaryCard,
} from '@/shared/ui'
import {
  Sparkles,
  Download,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Users,
  Calendar,
  Award,
  Layers,
  Search,
  BookOpen,
} from 'lucide-react'

export const DesignSystemShowcase: React.FC = () => {
  const toast = useToast()

  // Form states
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState(false)
  const [selectValue, setSelectValue] = useState('react')
  const [checkboxChecked, setCheckboxChecked] = useState(true)
  const [checkboxIndeterminate, setCheckboxIndeterminate] = useState(false)
  const [switchChecked, setSwitchChecked] = useState(true)
  const [textareaValue, setTextareaValue] = useState('')

  // Modals
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  // Loading toggles
  const [isBtnLoading, setIsBtnLoading] = useState(false)

  const selectOptions = [
    { value: 'react', label: 'React 19 & TypeScript', description: 'Zamonaviy frontend stek' },
    { value: 'spring', label: 'Spring Boot 4 & Java 21', description: 'Keng ko‘lamli backend arxitektura' },
    { value: 'postgres', label: 'PostgreSQL 16 & Liquibase', description: 'Ishonchli relyatsion ma’lumotlar bazasi' },
    { value: 'docker', label: 'Docker & Microservices', description: 'Konteynerlashtirilgan infratuzilma' },
  ]

  const dropdownItems = [
    { id: '1', label: 'Tahrirlash', icon: <Sparkles className="w-4 h-4" />, onClick: () => toast.info('Tahrirlash bosildi') },
    { id: '2', label: 'Eksport qilish', icon: <Download className="w-4 h-4" />, onClick: () => toast.success('Eksport boshlandi') },
    { id: '3', label: '', divider: true },
    { id: '4', label: 'O‘chirish', icon: <Trash2 className="w-4 h-4" />, destructive: true, onClick: () => setIsConfirmOpen(true) },
  ]

  const showcaseBreadcrumbs = [
    { label: 'Boshqaruv paneli', onClick: () => toast.info('Boshqaruv paneli bosildi') },
    { label: 'Dizayn Tizimi', onClick: () => toast.info('Dizayn Tizimi bosildi') },
    { label: 'Showcase Preview', current: true },
  ]

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-6">
        <div>
          <Breadcrumbs
            items={showcaseBreadcrumbs}
            onHomeClick={() => toast.info('Bosh sahifa bosildi')}
            className="mb-2"
          />
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">Modul 02</Badge>
            <span className="text-xs text-[var(--text-muted)] font-mono">Design System v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mt-1.5">
            AXM Nexus Visual Foundation & UI Showcase
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-3xl">
            Muhammad Al-Xorazmiy Vorislari ta’lim ekotizimi uchun mo‘ljallangan toza, sokin, o‘qituvchi va o‘quvchilar uchun qulay WCAG 2.2 AA talablariga mos dizayn tizimi komponentlari.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="segmented" />
        </div>
      </div>

      {/* Tabs for Showcase Categories */}
      <Tabs defaultValue="components">
        <TabList className="mb-6">
          <TabTrigger value="components" icon={<Layers className="w-4 h-4" />}>
            UI Komponentlar
          </TabTrigger>
          <TabTrigger value="forms" icon={<Search className="w-4 h-4" />}>
            Formalar & Maydonlar
          </TabTrigger>
          <TabTrigger value="feedback" icon={<CheckCircle2 className="w-4 h-4" />}>
            Modallar & Xabarlar
          </TabTrigger>
          <TabTrigger value="data" icon={<Calendar className="w-4 h-4" />}>
            Jadvallar & KPI Dashboard
          </TabTrigger>
          <TabTrigger value="tokens" icon={<Sparkles className="w-4 h-4" />}>
            Ranglar & Tipografiya
          </TabTrigger>
        </TabList>

        {/* 1. BUTTONS & UI COMPONENTS */}
        <TabContent value="components" className="space-y-8">
          {/* Button Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Tugmalar (Button Variants & Sizes)</CardTitle>
              <CardDescription>
                Turli maqsadlar uchun 6 xil variant, 4 xil o‘lcham hamda yuklanish holatlari.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Variantlar
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary (Asosiy)</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Havola (Link)</Button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  O‘lchamlar & Ikonkalar
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="primary" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                    Kichik (sm)
                  </Button>
                  <Button size="md" variant="primary" leftIcon={<Users className="w-4 h-4" />}>
                    Standart (md)
                  </Button>
                  <Button size="lg" variant="primary" rightIcon={<Award className="w-5 h-5" />}>
                    Katta (lg)
                  </Button>
                  <Button size="icon" variant="outline" aria-label="Yuklash">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Holatlar: Yuklanish (Loading) & O‘chirilgan (Disabled)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    isLoading={isBtnLoading}
                    onClick={() => {
                      setIsBtnLoading(true)
                      setTimeout(() => setIsBtnLoading(false), 2000)
                    }}
                  >
                    {isBtnLoading ? 'Yuklanmoqda...' : 'Yuklanishni sinash (2s)'}
                  </Button>
                  <Button variant="secondary" disabled>
                    Nofaol tugma
                  </Button>
                  <Button variant="destructive" isLoading loadingText="O‘chirilmoqda..." />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges & Tooltips */}
          <Card>
            <CardHeader>
              <CardTitle>Nishonlar (Badges) & Maslahat oynalari (Tooltips)</CardTitle>
              <CardDescription>
                Ranglar bilan birga semantik holatlarni ifodalovchi badglar va hover/focusda chiquvchi yordamchi matnlar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Semantik Badglar
                </h4>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="neutral">Neytral</Badge>
                  <Badge variant="primary">Brand / Asosiy</Badge>
                  <Badge variant="success" dot>Faol (Dot)</Badge>
                  <Badge variant="warning" dot dotPulse>Kutilmoqda (Pulse)</Badge>
                  <Badge variant="destructive" dot>Xatolik</Badge>
                  <Badge variant="info">Axborot</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="primary" size="sm">Kichik (sm)</Badge>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Tooltips (Hover & Focus)
                </h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Tooltip content="Dars jadvali parametrlarini ko‘rish" position="top">
                    <Button variant="outline" size="sm">Yuqori Tooltip</Button>
                  </Tooltip>
                  <Tooltip content="O‘quvchilar ro‘yxatini yuklab olish" position="bottom">
                    <Button variant="outline" size="sm">Pastki Tooltip</Button>
                  </Tooltip>
                  <Tooltip content="Tezkor amallar menyusi" position="right">
                    <Button variant="secondary" size="sm">O‘ng Tooltip</Button>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabContent>

        {/* 2. FORMS & INPUTS */}
        <TabContent value="forms" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Formalar, Kiritish Maydonlari va Tanlovlar</CardTitle>
              <CardDescription>
                Foydalanuvchi ma’lumotlarini xavfsiz va qulay to‘plash uchun to‘liq kiritish vositalari.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
              {/* FormField + Input */}
              <FormField
                label="F.I.Sh (Mentor yoki O‘quvchi)"
                htmlFor="full-name"
                required
                description="Rasmiy hujjatdagi to‘liq ism-familiya kiritilishi shart."
                error={inputError ? 'Ushbu maydonni to‘ldirish majburiy!' : undefined}
              >
                <Input
                  id="full-name"
                  placeholder="Masalan: Abdurasharipov Izzatbek"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onClear={() => setInputValue('')}
                  leftIcon={<Users className="w-4 h-4" />}
                  error={inputError}
                />
              </FormField>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInputError(!inputError)}
                >
                  {inputError ? 'Xatolik holatini yechish' : 'Xatolik holatini yoqish'}
                </Button>
              </div>

              {/* Password Input */}
              <FormField
                label="Maxfiy Parol"
                htmlFor="password"
                required
                description="Kamida 8 ta belgi, raqam va harflar birikmasi."
              >
                <Input
                  id="password"
                  type="password"
                  showPasswordToggle
                  placeholder="Parolni kiriting..."
                  defaultValue="MaxfiyParol123"
                />
              </FormField>

              {/* Select */}
              <FormField
                label="Ta’lim yo‘nalishi va moduli"
                description="Qidiruv va tavsifli accessible select komponenti."
              >
                <Select
                  options={selectOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                  searchable
                />
              </FormField>

              {/* Textarea */}
              <FormField
                label="Qo‘shimcha izoh va dars tavsifi"
                description="80 daqiqalik dars mazmuni va topshiriqlari."
              >
                <Textarea
                  placeholder="Dars bosqichlari haqida qisqacha ma’lumot..."
                  maxLength={200}
                  currentLength={textareaValue.length}
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                />
              </FormField>

              {/* Checkboxes & Switches */}
              <div className="space-y-4 pt-2 border-t border-[var(--border-subtle)]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Tanlov va Slayderlar
                </h4>

                <div className="flex flex-col gap-3">
                  <Checkbox
                    id="cb-1"
                    label="O‘quvchi faol holatda"
                    description="O‘quvchi portalga kirishi va dars materiallaridan foydalanishi mumkin"
                    checked={checkboxChecked}
                    onChange={(e) => setCheckboxChecked(e.target.checked)}
                  />

                  <Checkbox
                    id="cb-2"
                    label="Guruhlarning bir qismi tanlangan (Indeterminate)"
                    indeterminate={checkboxIndeterminate}
                    onChange={() => setCheckboxIndeterminate(!checkboxIndeterminate)}
                  />

                  <Switch
                    id="sw-1"
                    label="Avtomatik SMS xabarnomalar"
                    description="Dars jadvali o‘zgarganda ota-onalarga xabar yuborish"
                    checked={switchChecked}
                    onChange={(e) => setSwitchChecked(e.target.checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabContent>

        {/* 3. FEEDBACK, MODALS & TOAST */}
        <TabContent value="feedback" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Modallar, Tasdiqlash oynalari & Xabarnomalar</CardTitle>
              <CardDescription>
                Foydalanuvchi harakatlarini tasdiqlash, dialog oynalari va bildirishnomalar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Dialoglar
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
                    Standart Dialogni ochish
                  </Button>
                  <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
                    Tasdiqlash Dialogi (Confirm)
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Dropdown Harakatlar Menyusi
                </h4>
                <DropdownMenu
                  trigger={
                    <Button variant="outline" size="sm" rightIcon={<MoreVertical className="w-4 h-4 ml-1" />}>
                      Amallar menyusi
                    </Button>
                  }
                  items={dropdownItems}
                />
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Toast Xabarnomalar (WCAG aria-live)
                </h4>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toast.success('Muvaffaqiyatli saqlandi', 'Dars jadvali yangilandi va barcha guruhlarga yuborildi.')}
                  >
                    Muvaffaqiyat (Success)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toast.error('Xatolik yuz berdi', 'Server bilan aloqa uzildi. Qayta urinib ko‘ring.')}
                  >
                    Xatolik (Error)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toast.warning('Ogohlantirish', 'Ushbu xonada soat 14:00 da boshqa dars rejalashtirilgan.')}
                  >
                    Ogohlantirish (Warning)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toast.info('Yangi bildirishnoma', 'O‘quv dasturi yangi 8-sinf standartlariga muvofiq yangilandi.')}
                  >
                    Axborot (Info)
                  </Button>
                </div>
              </div>

              {/* Empty & Error States */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-subtle)]">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                    Empty State (Bo‘sh holat)
                  </h4>
                  <EmptyState
                    title="Dars jadvali mavjud emas"
                    description="Ushbu filial uchun hali haftalik darslar taqsimoti kiritilmagan."
                    action={
                      <Button size="sm" variant="primary" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                        AI orqali import qilish
                      </Button>
                    }
                  />
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                    Error State (Xatolik holati)
                  </h4>
                  <ErrorState
                    title="Ma’lumotlarni yuklab bo‘lmadi"
                    message="Tarmoq so‘rovi 500 xatosi bilan yakunlandi."
                    onRetry={() => toast.info('Qayta yuklash so‘rovi yuborildi')}
                    errorDetails="HttpRequestException: 500 Internal Server Error at fetchSchedules (api.ts:42)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabContent>

        {/* 4. TABLES & DASHBOARD KPI */}
        <TabContent value="data" className="space-y-8">
          {/* Summary Cards */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Dashboard KPI Kartalari (Summary Cards)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                label="Jami o‘quvchilar"
                value="284 nafar"
                trend={{ direction: 'up', value: '+12.4% oylik' }}
                icon={<Users className="w-5 h-5" />}
                helperText="8–11-sinf iqtidorli o‘quvchilari"
              />
              <SummaryCard
                label="Haftalik dars soatlari"
                value="96 soat"
                trend={{ direction: 'neutral', value: 'Reja asosida' }}
                icon={<Calendar className="w-5 h-5" />}
                helperText="80 daqiqalik intensiv darslar"
              />
              <SummaryCard
                label="Faol mentorlar"
                value="14 nafar"
                trend={{ direction: 'up', value: '2 nafar yangi' }}
                icon={<Award className="w-5 h-5" />}
                helperText="IT va chet tili mutaxassislari"
              />
              <SummaryCard
                label="O‘rtacha o‘zlashtirish"
                value="88.5%"
                trend={{ direction: 'up', value: '+3.1%' }}
                icon={<BookOpen className="w-5 h-5" />}
                helperText="Amaliy loyihalar va testlar bo‘yicha"
              />
            </div>
          </div>

          {/* Chart Container Example */}
          <ChartContainer
            title="O‘quvchilar Davomati va Dars Rejalari Dinamikasi"
            description="Oxirgi 30 kunlik darslar davomati va o‘zlashtirish tahlili"
            action={
              <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                Hisobotni yuklash
              </Button>
            }
            height={220}
          >
            <div className="flex flex-col items-center justify-center h-full border border-dashed border-[var(--border-default)] rounded-lg p-6 bg-[var(--bg-subtle)]/40">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Reusable Chart Container (WCAG mos grafik o‘rni)
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 text-center max-w-md">
                Ushbu konteyner ma’lumotlarni vizualizatsiya qilish, yuklanish holatlari va bo‘sh/xatolik holatlarini avtomatlashtiradi.
              </p>
            </div>
          </ChartContainer>

          {/* Responsive Table */}
          <Card>
            <CardHeader>
              <CardTitle>Responsiv Dars Jadvali (Accessible Table)</CardTitle>
              <CardDescription>
                Gorizontal siljishdan saqlovchi va mobil ekranlarga moslashuvchan jadval ko‘rinishi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guruh kodi</TableHead>
                    <TableHead>Sinf</TableHead>
                    <TableHead>Yo‘nalish</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Dars vaqti</TableHead>
                    <TableHead>Xona</TableHead>
                    <TableHead>Holat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono font-bold text-[var(--brand-primary)]">
                      YA-26I0804
                    </TableCell>
                    <TableCell>8-sinf</TableCell>
                    <TableCell className="font-medium">Web Full-Stack</TableCell>
                    <TableCell>Izzatbek Abdurasharipov</TableCell>
                    <TableCell>Dush-Chor-Juma 14:00</TableCell>
                    <TableCell>IT Lab 1</TableCell>
                    <TableCell>
                      <Badge variant="success" dot size="sm">Faol</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold text-[var(--brand-primary)]">
                      YA-26I0902
                    </TableCell>
                    <TableCell>9-sinf</TableCell>
                    <TableCell className="font-medium">Computer Science</TableCell>
                    <TableCell>Dilnoza Raximova</TableCell>
                    <TableCell>Sesh-Pay-Shan 15:30</TableCell>
                    <TableCell>Room 204</TableCell>
                    <TableCell>
                      <Badge variant="success" dot size="sm">Faol</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono font-bold text-[var(--brand-primary)]">
                      YA-26I1001
                    </TableCell>
                    <TableCell>10-sinf</TableCell>
                    <TableCell className="font-medium">Cyber Security</TableCell>
                    <TableCell>Jasur Bekchanov</TableCell>
                    <TableCell>Dush-Chor-Juma 16:00</TableCell>
                    <TableCell>Lab 3</TableCell>
                    <TableCell>
                      <Badge variant="warning" dot size="sm">Tayyorgarlik</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Skeleton Loaders */}
          <Card>
            <CardHeader>
              <CardTitle>Yuklanish Skeletlari (Skeleton Loaders)</CardTitle>
              <CardDescription>
                Sekin tarmoq holatida foydalanuvchiga kontent shaklini ko‘rsatuvchi sokin to‘lqinlar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="space-y-1.5 flex-1">
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="60%" />
                </div>
              </div>
              <Skeleton variant="rectangular" height={60} className="w-full" />
            </CardContent>
          </Card>
        </TabContent>

        {/* 5. TOKENS & TYPOGRAPHY */}
        <TabContent value="tokens" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Semantik Rang Palitrasi (Design Tokens)</CardTitle>
              <CardDescription>
                Har ikkala (Light va Dark) rejim uchun o‘zaro moslashtirilgan vazmin ranglar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)]">
                  <span className="text-xs font-mono font-semibold">--bg-canvas</span>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">Sahifa asosiy foni</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs">
                  <span className="text-xs font-mono font-semibold">--bg-surface</span>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">Kartalar va panellar</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)]">
                  <span className="text-xs font-mono font-semibold">--bg-subtle</span>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">Inputlar va nofaol tablar</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--brand-primary)] text-white">
                  <span className="text-xs font-mono font-semibold">--brand-primary</span>
                  <p className="text-[11px] text-white/80 mt-1">Asosiy EdTech indigo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipografiya Ko‘lami (Typography Scale)</CardTitle>
              <CardDescription>
                Inter shriftlar oilasi asosida sarlavha va matn ierarxiyasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b border-[var(--border-subtle)] pb-3">
                <span className="text-xs text-[var(--text-muted)] font-mono">Display 1 (30px / 36px)</span>
                <p className="text-3xl font-extrabold tracking-tight">Har bir dars — reja asosida.</p>
              </div>
              <div className="border-b border-[var(--border-subtle)] pb-3">
                <span className="text-xs text-[var(--text-muted)] font-mono">Heading 1 (24px / 32px)</span>
                <p className="text-2xl font-bold tracking-tight">Har bir natija — o‘lchov asosida.</p>
              </div>
              <div className="border-b border-[var(--border-subtle)] pb-3">
                <span className="text-xs text-[var(--text-muted)] font-mono">Heading 2 (20px / 28px)</span>
                <p className="text-xl font-semibold">Har bir o‘quvchi — rivojlanish yo‘lida.</p>
              </div>
              <div className="border-b border-[var(--border-subtle)] pb-3">
                <span className="text-xs text-[var(--text-muted)] font-mono">Body Regular (14px / 20px)</span>
                <p className="text-sm text-[var(--text-secondary)]">
                  AXM Nexus Muhammad Al-Xorazmiy Vorislari dasturi bo‘yicha ta’lim boshqaruvini markazlashtiradi.
                </p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)] font-mono">Code / Mono (12px / 16px)</span>
                <p className="font-mono text-xs text-[var(--brand-primary)]">
                  STUDENT_ID: 2026-YA-0492 | PINFL: 51203086410029
                </p>
              </div>
            </CardContent>
          </Card>
        </TabContent>
      </Tabs>

      {/* Interactive Dialog Demo */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Dars Jadvali Tafsilotlari"
        description="Muhammad Al-Xorazmiy Vorislari 80 daqiqalik intensiv dars formati."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsDialogOpen(false)}>
              Yopish
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsDialogOpen(false)
                toast.success('Amal muvaffaqiyatli saqlandi')
              }}
            >
              Saqlash
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p>
            Dars davomiyligi 4 bosqichga taqsimlanadi:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[var(--text-secondary)]">
            <li><strong>15–20 daqiqa:</strong> Tushunish (Nazariya va sodda misollar)</li>
            <li><strong>25–30 daqiqa:</strong> Amaliyot (Mentor bilan kod yozish)</li>
            <li><strong>20–25 daqiqa:</strong> Loyiha (Kichik web-mahsulot yaratish)</li>
            <li><strong>10–15 daqiqa:</strong> Natija (Tekshirish va xatolar tahlili)</li>
          </ul>
        </div>
      </Dialog>

      {/* Confirmation Dialog Demo */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false)
          toast.error('Element o‘chirildi')
        }}
        variant="destructive"
        title="Elementni o‘chirishni tasdiqlaysizmi?"
        description="Ushbu amalni ortga qaytarib bo‘lmaydi. Guruh va unga biriktirilgan darslar tizimdan o‘chiriladi."
        confirmText="Ha, o‘chirilsin"
        cancelText="Bekor qilish"
      />
    </div>
  )
}
