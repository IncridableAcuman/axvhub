import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/shared/ui/toast/ToastContext';
import { Breadcrumbs } from '@/shared/ui/breadcrumbs/Breadcrumbs';
import { ThemeToggle } from '@/shared/ui/theme-toggle/ThemeToggle';
import { Tooltip } from '@/shared/ui/tooltip/Tooltip';
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
  AlertCircle,
  Info,
  AlertTriangle,
  Eye,
  EyeOff,
  TrendingUp,
  RefreshCw,
  FolderPlus,
  Palette,
} from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  const toast = useToast();

  // Form states
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState(false);
  const [selectValue, setSelectValue] = useState('react');
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [textareaValue, setTextareaValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Modals
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Loading toggles
  const [isBtnLoading, setIsBtnLoading] = useState(false);

  // Progress demo
  const [progressVal, setProgressVal] = useState(68);

  const showcaseBreadcrumbs = [
    { label: 'Boshqaruv paneli', onClick: () => toast.info('Boshqaruv paneli bosildi') },
    { label: 'Dizayn Tizimi', onClick: () => toast.info('Dizayn Tizimi bosildi') },
    { label: 'Showcase Preview', current: true },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header Banner */}
      <Card className="rounded-3xl p-6 sm:p-7 border-border/30 bg-card/60 backdrop-blur-md shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <Breadcrumbs
              items={showcaseBreadcrumbs}
              onHomeClick={() => toast.info('Bosh sahifa bosildi')}
              className="mb-1"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" className="font-semibold text-xs">
                Modul 02
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                Shadcn UI v2.0
              </Badge>
              <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              AXM Nexus Visual Foundation & UI Showcase
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Muhammad Al-Xorazmiy Vorislari ta’lim ekotizimi uchun mo‘ljallangan toza, sokin, o‘qituvchi va o‘quvchilar uchun qulay WCAG 2.2 AA talablariga mos dizayn tizimi komponentlari.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            <ThemeToggle variant="segmented" />
          </div>
        </div>
      </Card>

      {/* Tabs for Showcase Categories */}
      <Tabs defaultValue="components" className="space-y-6">
        <TabsList className="bg-muted/70 p-1 rounded-2xl h-11 flex flex-wrap max-w-full">
          <TabsTrigger
            value="components"
            className="rounded-xl text-xs sm:text-sm font-semibold px-4 py-2 flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
          >
            <Layers className="w-4 h-4" />
            <span>UI Komponentlar</span>
          </TabsTrigger>
          <TabsTrigger
            value="forms"
            className="rounded-xl text-xs sm:text-sm font-semibold px-4 py-2 flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>Formalar & Maydonlar</span>
          </TabsTrigger>
          <TabsTrigger
            value="feedback"
            className="rounded-xl text-xs sm:text-sm font-semibold px-4 py-2 flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Modallar & Xabarlar</span>
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="rounded-xl text-xs sm:text-sm font-semibold px-4 py-2 flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>Jadvallar & KPI Dashboard</span>
          </TabsTrigger>
          <TabsTrigger
            value="tokens"
            className="rounded-xl text-xs sm:text-sm font-semibold px-4 py-2 flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
          >
            <Palette className="w-4 h-4" />
            <span>Ranglar & Tipografiya</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. BUTTONS & UI COMPONENTS */}
        <TabsContent value="components" className="space-y-6">
          {/* Button Variants */}
          <Card className="rounded-3xl border-border/30 bg-card shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Tugmalar (Button Variants & Sizes)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Turli maqsadlar uchun 6 xil variant, 4 xil o‘lcham hamda yuklanish holatlari.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Variantlar
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default">Primary (Asosiy)</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Havola (Link)</Button>
                </div>
              </div>

              <Separator className="bg-border/30" />

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  O‘lchamlar & Ikonkalar
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="default" className="gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Kichik (sm)</span>
                  </Button>
                  <Button size="default" variant="default" className="gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Standart (md)</span>
                  </Button>
                  <Button size="lg" variant="default" className="gap-2">
                    <span>Katta (lg)</span>
                    <Award className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="outline" aria-label="Yuklash">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/30" />

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Holatlar: Yuklanish (Loading) & O‘chirilgan (Disabled)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="default"
                    disabled={isBtnLoading}
                    onClick={() => {
                      setIsBtnLoading(true);
                      setTimeout(() => setIsBtnLoading(false), 2000);
                    }}
                    className="gap-2"
                  >
                    {isBtnLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{isBtnLoading ? 'Yuklanmoqda...' : 'Yuklanishni sinash (2s)'}</span>
                  </Button>
                  <Button variant="secondary" disabled>
                    Nofaol tugma
                  </Button>
                  <Button variant="destructive" disabled className="gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>O‘chirilmoqda...</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges & Avatars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-3xl border-border/30 bg-card shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-foreground">
                  Nishonlar (Badges) & Statuslar
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Ranglar bilan birga semantik holatlarni ifodalovchi nishonlar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="success">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                    Faol (Success)
                  </Badge>
                  <Badge variant="warning">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 beacon-pulse mr-1.5" />
                    Kutilmoqda (Warning)
                  </Badge>
                  <Badge variant="destructive">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                    Xatolik
                  </Badge>
                  <Badge variant="neutral">Neytral</Badge>
                  <Badge variant="info">Axborot (Info)</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/30 bg-card shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-foreground">
                  Avatarlar & Tooltiplar
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Foydalanuvchi profillari va hover yordamchi matnlari.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 rounded-xl shadow-2xs">
                    <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="w-10 h-10 rounded-2xl shadow-xs">
                    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" />
                    <AvatarFallback className="rounded-2xl bg-indigo-600 text-white font-bold text-sm">
                      BM
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="w-12 h-12 rounded-2xl shadow-sm">
                    <AvatarFallback className="rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold">
                      XR
                    </AvatarFallback>
                  </Avatar>
                </div>

                <Separator className="bg-border/30" />

                <div className="flex flex-wrap items-center gap-3">
                  <Tooltip content="Dars jadvali parametrlarini ko‘rish" position="top">
                    <Button variant="outline" size="sm" className="text-xs">
                      Yuqori Tooltip
                    </Button>
                  </Tooltip>
                  <Tooltip content="O‘quvchilar ro‘yxatini yuklab olish" position="bottom">
                    <Button variant="outline" size="sm" className="text-xs">
                      Pastki Tooltip
                    </Button>
                  </Tooltip>
                  <Tooltip content="Tezkor amallar menyusi" position="right">
                    <Button variant="secondary" size="sm" className="text-xs">
                      O‘ng Tooltip
                    </Button>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Callouts */}
          <Card className="rounded-3xl border-border/30 bg-card shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Xabarnomalar (Alert Callouts)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Foydalanuvchini ogohlantirish yoki axborot yetkazish uchun alert komponentlari.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Alert variant="default" className="rounded-2xl">
                <Info className="w-4 h-4" />
                <AlertTitle className="text-xs font-bold">Standart bildirishnoma</AlertTitle>
                <AlertDescription className="text-xs">
                  Tizimda yangi 8-sinf o‘quv rejasi tasdiqlandi va guruhlarga biriktirildi.
                </AlertDescription>
              </Alert>

              <Alert variant="success" className="rounded-2xl">
                <CheckCircle2 className="w-4 h-4" />
                <AlertTitle className="text-xs font-bold">Muvaffaqiyatli saqlandi</AlertTitle>
                <AlertDescription className="text-xs">
                  Mentorlik profili tekshiruvdan o‘tdi va ommaviy katalogda faollashtirildi.
                </AlertDescription>
              </Alert>

              <Alert variant="warning" className="rounded-2xl">
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle className="text-xs font-bold">Diqqat talab holat</AlertTitle>
                <AlertDescription className="text-xs">
                  Bugungi soat 16:30 dagi dars uchun 2 nafar o‘quvchi davomat belgilanmagan.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive" className="rounded-2xl">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle className="text-xs font-bold">Xatolik yuz berdi</AlertTitle>
                <AlertDescription className="text-xs">
                  Server bilan aloqa o‘rnatilmadi. Qayta urinib ko‘ring.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. FORMS & INPUTS */}
        <TabsContent value="forms" className="space-y-6">
          <Card className="rounded-3xl border-border/30 bg-card shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Formalar, Kiritish Maydonlari va Tanlovlar
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Foydalanuvchi ma’lumotlarini xavfsiz va qulay to‘plash uchun to‘liq kiritish vositalari.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 max-w-2xl">
              {/* FormField + Input with Left Icon */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="full-name" className="text-xs font-semibold text-foreground">
                    F.I.Sh (Mentor yoki O‘quvchi) *
                  </Label>
                  {inputError && (
                    <span className="text-[11px] font-medium text-destructive">
                      Ushbu maydonni to‘ldirish majburiy!
                    </span>
                  )}
                </div>
                <Input
                  id="full-name"
                  placeholder="Masalan: Abdurasharipov Izzatbek"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  leftIcon={<Users className="w-4 h-4 text-muted-foreground" />}
                  error={inputError}
                  className="text-xs h-10 rounded-xl"
                />
                <p className="text-[11px] text-muted-foreground">
                  Rasmiy hujjatdagi to‘liq ism-familiya kiritilishi shart.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInputError(!inputError)}
                  className="rounded-xl text-xs"
                >
                  {inputError ? 'Xatolik holatini yechish' : 'Xatolik holatini yoqish'}
                </Button>
              </div>

              {/* Password Input with eye toggle */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                  Maxfiy Parol *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Parolni kiriting..."
                    defaultValue="MaxfiyParol123"
                    className="text-xs h-10 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Parolni ko'rsatish"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Kamida 8 ta belgi, raqam va harflar birikmasi.
                </p>
              </div>

              {/* Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Ta’lim yo‘nalishi va moduli
                </Label>
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger className="text-xs h-10 rounded-xl">
                    <SelectValue placeholder="Yo'nalishni tanlang" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/30 bg-card text-card-foreground shadow-lg">
                    <SelectItem value="react" className="text-xs">React 19 & TypeScript (Frontend)</SelectItem>
                    <SelectItem value="spring" className="text-xs">Spring Boot 4 & Java 21 (Backend)</SelectItem>
                    <SelectItem value="postgres" className="text-xs">PostgreSQL 16 & Liquibase (Database)</SelectItem>
                    <SelectItem value="docker" className="text-xs">Docker & DevOps (Infratuzilma)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Accessible shadcn select komponenti.
                </p>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio-notes" className="text-xs font-semibold text-foreground">
                    Qo‘shimcha izoh va dars tavsifi
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    {textareaValue.length} / 200
                  </span>
                </div>
                <Textarea
                  id="bio-notes"
                  placeholder="Dars bosqichlari haqida qisqacha ma’lumot..."
                  maxLength={200}
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  className="text-xs resize-none rounded-xl"
                  rows={3}
                />
              </div>

              <Separator className="bg-border/30" />

              {/* Toggles and checkboxes without harsh borders */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tanlov va Slayderlar
                </h4>

                <div className="p-4 rounded-2xl bg-muted/40 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkboxChecked}
                      onChange={(e) => setCheckboxChecked(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-semibold text-foreground">O‘quvchi faol holatda</div>
                      <div className="text-[11px] text-muted-foreground">
                        O‘quvchi portalga kirishi va dars materiallaridan foydalanishi mumkin
                      </div>
                    </div>
                  </label>

                  <Separator className="bg-border/20" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-semibold text-foreground">Avtomatik SMS xabarnomalar</div>
                      <div className="text-[11px] text-muted-foreground">
                        Dars jadvali o‘zgarganda ota-onalarga xabar yuborish
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={switchChecked}
                      onChange={(e) => setSwitchChecked(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. FEEDBACK, MODALS & TOAST */}
        <TabsContent value="feedback" className="space-y-6">
          <Card className="rounded-3xl border-border/30 bg-card shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Modallar, Tasdiqlash oynalari & Xabarnomalar
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Foydalanuvchi harakatlarini tasdiqlash, dialog oynalari va bildirishnomalar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Dialoglar
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default" onClick={() => setIsDialogOpen(true)} className="rounded-xl">
                    Standart Dialogni ochish
                  </Button>
                  <Button variant="destructive" onClick={() => setIsConfirmOpen(true)} className="rounded-xl">
                    Tasdiqlash Dialogi (Confirm)
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/30" />

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Dropdown Harakatlar Menyusi
                </h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                      <span>Amallar menyusi</span>
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-2xl border-border/30 bg-card text-card-foreground shadow-xl p-1.5 min-w-[180px]">
                    <DropdownMenuItem
                      onClick={() => toast.info('Tahrirlash bosildi')}
                      className="rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>Tahrirlash</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast.success('Eksport boshlandi')}
                      className="rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Eksport qilish</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/20 my-1" />
                    <DropdownMenuItem
                      onClick={() => setIsConfirmOpen(true)}
                      className="rounded-xl text-xs flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>O‘chirish</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Separator className="bg-border/30" />

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Toast Xabarnomalar (WCAG mos)
                </h4>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      toast.success(
                        'Muvaffaqiyatli saqlandi',
                        'Dars jadvali yangilandi va barcha guruhlarga yuborildi.'
                      )
                    }
                    className="rounded-xl text-xs"
                  >
                    Muvaffaqiyat (Success)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      toast.error(
                        'Xatolik yuz berdi',
                        'Server bilan aloqa uzildi. Qayta urinib ko‘ring.'
                      )
                    }
                    className="rounded-xl text-xs"
                  >
                    Xatolik (Error)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      toast.warning(
                        'Ogohlantirish',
                        'Ushbu xonada soat 14:00 da boshqa dars rejalashtirilgan.'
                      )
                    }
                    className="rounded-xl text-xs"
                  >
                    Ogohlantirish (Warning)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      toast.info(
                        'Yangi bildirishnoma',
                        'O‘quv dasturi yangi 8-sinf standartlariga muvofiq yangilandi.'
                      )
                    }
                    className="rounded-xl text-xs"
                  >
                    Axborot (Info)
                  </Button>
                </div>
              </div>

              {/* Empty & Error States */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <Card className="rounded-2xl border-border/30 bg-muted/30 p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                    <FolderPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-foreground">Dars jadvali mavjud emas</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ushbu filial uchun hali haftalik darslar taqsimoti kiritilmagan.
                    </p>
                  </div>
                  <Button size="sm" variant="default" className="rounded-xl text-xs gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI orqali import qilish</span>
                  </Button>
                </Card>

                <Card className="rounded-2xl border-border/30 bg-muted/30 p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-foreground">Ma’lumotlarni yuklab bo‘lmadi</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tarmoq so‘rovi 500 xatosi bilan yakunlandi.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info('Qayta yuklash so‘rovi yuborildi')}
                    className="rounded-xl text-xs"
                  >
                    Qayta urinish
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. TABLES & DASHBOARD KPI */}
        <TabsContent value="data" className="space-y-6">
          {/* Summary Cards */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Dashboard KPI Kartalari (Summary Cards)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-3xl border-border/30 bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <Badge variant="success" className="text-[10px] font-bold">
                    +12.4% oylik
                  </Badge>
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">284 nafar</div>
                  <div className="text-xs font-semibold text-muted-foreground mt-0.5">Jami o‘quvchilar</div>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/10">
                  8–11-sinf iqtidorli o‘quvchilari
                </p>
              </Card>

              <Card className="rounded-3xl border-border/30 bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    Reja asosida
                  </Badge>
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">96 soat</div>
                  <div className="text-xs font-semibold text-muted-foreground mt-0.5">Haftalik dars soatlari</div>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/10">
                  80 daqiqalik intensiv darslar
                </p>
              </Card>

              <Card className="rounded-3xl border-border/30 bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <Badge variant="success" className="text-[10px] font-bold">
                    2 nafar yangi
                  </Badge>
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">14 nafar</div>
                  <div className="text-xs font-semibold text-muted-foreground mt-0.5">Faol mentorlar</div>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/10">
                  IT va chet tili mutaxassislari
                </p>
              </Card>

              <Card className="rounded-3xl border-border/30 bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <Badge variant="success" className="text-[10px] font-bold">
                    +3.1%
                  </Badge>
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">88.5%</div>
                  <div className="text-xs font-semibold text-muted-foreground mt-0.5">O‘rtacha o‘zlashtirish</div>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/10">
                  Amaliy loyihalar va testlar bo‘yicha
                </p>
              </Card>
            </div>
          </div>

          {/* Progress Indicators Showcase */}
          <Card className="rounded-3xl border-border/30 bg-card shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Progress Indikatorlari (Shadcn Progress)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    O‘quv kursi yakunlanishi va dars rejasi bajarilish darajasi.
                  </CardDescription>
                </div>
                <span className="text-sm font-bold font-mono text-primary">{progressVal}%</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progressVal} className="h-2.5 rounded-full" />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setProgressVal(Math.max(10, progressVal - 15))}
                  className="rounded-xl text-xs"
                >
                  -15%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setProgressVal(Math.min(100, progressVal + 15))}
                  className="rounded-xl text-xs"
                >
                  +15%
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Responsive Accessible Table */}
          <Card className="rounded-3xl border-border/30 bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Responsiv Dars Jadvali (Shadcn Table)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Gorizontal siljishdan saqlovchi va mobil ekranlarga moslashuvchan jadval ko‘rinishi.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/20 bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs font-bold text-foreground">Guruh kodi</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Sinf</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Yo‘nalish</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Mentor</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Dars vaqti</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Xona</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Holat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-border/10 hover:bg-muted/20">
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      YA-26I0804
                    </TableCell>
                    <TableCell className="text-xs">8-sinf</TableCell>
                    <TableCell className="text-xs font-medium">Web Full-Stack</TableCell>
                    <TableCell className="text-xs">Izzatbek Abdurasharipov</TableCell>
                    <TableCell className="text-xs text-muted-foreground">Dush-Chor-Juma 14:00</TableCell>
                    <TableCell className="text-xs">IT Lab 1</TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-[10px]">Faol</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/10 hover:bg-muted/20">
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      YA-26I0902
                    </TableCell>
                    <TableCell className="text-xs">9-sinf</TableCell>
                    <TableCell className="text-xs font-medium">Computer Science</TableCell>
                    <TableCell className="text-xs">Dilnoza Raximova</TableCell>
                    <TableCell className="text-xs text-muted-foreground">Sesh-Pay-Shan 15:30</TableCell>
                    <TableCell className="text-xs">Room 204</TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-[10px]">Faol</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/10 hover:bg-muted/20">
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      YA-26I1001
                    </TableCell>
                    <TableCell className="text-xs">10-sinf</TableCell>
                    <TableCell className="text-xs font-medium">Cyber Security</TableCell>
                    <TableCell className="text-xs">Jasur Bekchanov</TableCell>
                    <TableCell className="text-xs text-muted-foreground">Dush-Chor-Juma 16:00</TableCell>
                    <TableCell className="text-xs">Lab 3</TableCell>
                    <TableCell>
                      <Badge variant="warning" className="text-[10px]">Tayyorgarlik</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Skeleton Loaders */}
          <Card className="rounded-3xl border-border/30 bg-card shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Yuklanish Skeletlari (Shadcn Skeleton)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Sekin tarmoq holatida foydalanuvchiga kontent shaklini ko‘rsatuvchi sokin to‘lqinlar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-2xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-48 rounded-md" />
                  <Skeleton className="h-3 w-72 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-2xl" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. TOKENS & TYPOGRAPHY */}
        <TabsContent value="tokens" className="space-y-6">
          <Card className="rounded-3xl border-border/30 bg-card shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Semantik Rang Palitrasi (Design Tokens)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Har ikkala (Light va Dark) rejim uchun o‘zaro moslashtirilgan vazmin ranglar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-background border border-border/40 space-y-1">
                  <span className="text-xs font-mono font-bold text-foreground">--background</span>
                  <p className="text-[11px] text-muted-foreground">Sahifa asosiy foni</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-1">
                  <span className="text-xs font-mono font-bold text-foreground">--card</span>
                  <p className="text-[11px] text-muted-foreground">Kartalar va panellar</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted border border-border/40 space-y-1">
                  <span className="text-xs font-mono font-bold text-foreground">--muted</span>
                  <p className="text-[11px] text-muted-foreground">Inputlar va nofaol tablar</p>
                </div>
                <div className="p-4 rounded-2xl bg-primary text-primary-foreground space-y-1 shadow-xs">
                  <span className="text-xs font-mono font-bold">--primary</span>
                  <p className="text-[11px] text-primary-foreground/80">Asosiy EdTech indigo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/30 bg-card shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Tipografiya Ko‘lami (Typography Scale)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Inter shriftlar oilasi asosida sarlavha va matn iyerarxiyasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pb-3 border-b border-border/20">
                <span className="text-[11px] text-muted-foreground font-mono">Display 1 (30px / 36px)</span>
                <p className="text-3xl font-extrabold tracking-tight text-foreground mt-0.5">
                  Har bir dars — reja asosida.
                </p>
              </div>
              <div className="pb-3 border-b border-border/20">
                <span className="text-[11px] text-muted-foreground font-mono">Heading 1 (24px / 32px)</span>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                  Har bir natija — o‘lchov asosida.
                </p>
              </div>
              <div className="pb-3 border-b border-border/20">
                <span className="text-[11px] text-muted-foreground font-mono">Heading 2 (20px / 28px)</span>
                <p className="text-xl font-semibold text-foreground mt-0.5">
                  Har bir o‘quvchi — rivojlanish yo‘lida.
                </p>
              </div>
              <div className="pb-3 border-b border-border/20">
                <span className="text-[11px] text-muted-foreground font-mono">Body Regular (14px / 20px)</span>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  AXM Nexus Muhammad Al-Xorazmiy Vorislari dasturi bo‘yicha ta’lim boshqaruvini markazlashtiradi.
                </p>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground font-mono">Code / Mono (12px / 16px)</span>
                <p className="font-mono text-xs text-primary font-bold mt-0.5">
                  STUDENT_ID: 2026-YA-0492 | PINFL: 51203086410029
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Interactive Dialog Demo using Shadcn Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground border-border/30 rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-base font-bold text-foreground">
              Dars Jadvali Tafsilotlari
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Muhammad Al-Xorazmiy Vorislari 80 daqiqalik intensiv dars formati
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs text-foreground p-3.5 rounded-2xl bg-muted/30">
            <p className="font-semibold text-foreground">
              Dars davomiyligi 4 bosqichga taqsimlanadi:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">15–20 daqiqa:</strong> Tushunish (Nazariya va sodda misollar)</li>
              <li><strong className="text-foreground">25–30 daqiqa:</strong> Amaliyot (Mentor bilan kod yozish)</li>
              <li><strong className="text-foreground">20–25 daqiqa:</strong> Loyiha (Kichik web-mahsulot yaratish)</li>
              <li><strong className="text-foreground">10–15 daqiqa:</strong> Natija (Tekshirish va xatolar tahlili)</li>
            </ul>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl text-xs"
            >
              Yopish
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setIsDialogOpen(false);
                toast.success('Amal muvaffaqiyatli saqlandi');
              }}
              className="rounded-xl text-xs font-semibold"
            >
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Demo using Shadcn Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground border-border/30 rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-1.5 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Elementni o‘chirishni tasdiqlaysizmi?
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Ushbu amalni ortga qaytarib bo‘lmaydi. Guruh va darslar o‘chiriladi.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
              className="rounded-xl text-xs"
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setIsConfirmOpen(false);
                toast.error('Element o‘chirildi');
              }}
              className="rounded-xl text-xs font-bold"
            >
              Ha, o‘chirilsin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
