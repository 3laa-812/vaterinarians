# UX Flows & Screen Specifications

## Core UX Principles

1. **Doctor opens app → answer is already visible** — no hunting
2. **Every action ≤ 3 taps** on mobile
3. **Never lose data** — autosave, offline queue, no accidental deletes
4. **Plain language errors** — never show technical messages
5. **Language toggle always reachable** — top bar, one tap

---

## Navigation Structure

### Mobile (Bottom Nav — 4 items max)
```
🏠 اليوم     🐾 المرضى     📅 المواعيد     👤 حسابي
Home        Animals       Appointments    Profile
```

### Desktop (Sidebar)
```
Collapsed (72px icons):         Expanded (240px):
  🏠                              🏠  اليوم / Today
  🐾                              🐾  المرضى / Animals
  📅                              📅  المواعيد / Appointments
  👥                              👥  المرافقون / Owners
  ⚙️  (admin only)               ⚙️  الإدارة / Admin
  ──                              ──
  AR|EN toggle                    AR | EN toggle (top bar)
```

---

## Screen 1: Home — Today's Schedule

### Purpose
The vet's daily command center. Open the app → know what's next immediately.

### Layout (Mobile)
```
┌──────────────────────────────────┐
│  مرحباً د. سارة                  │
│  الأربعاء، 18 يونيو              │
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │  التالي — بعد 20 دقيقة     │  │  ← Next appointment hero card
│  │  بيلو 🐕                   │  │
│  │  لابرادور · 3 سنوات        │  │
│  │  المرافق: أحمد محمد        │  │
│  │  10:30 ص                   │  │
│  │  [ ابدأ الكشف ]            │  │
│  └────────────────────────────┘  │
│                                  │
│  بقية اليوم (3)                  │
│  ┌────────────────────────────┐  │
│  │  🐈 ميمي  ·  11:30         │  │  ← Compact cards
│  │  المرافقة: منى سعيد  ●مجدول│  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  🐕 روكي  ·  02:00         │  │
│  │  المرافق: كريم عمر   ●مجدول│  │
│  └────────────────────────────┘  │
│                                  │
│                         [+]      │  ← FAB: إضافة حيوان جديد
└──────────────────────────────────┘
```

### States
- **No appointments today** → "لا مواعيد اليوم — استمتع بيومك ☀️"
- **All done** → "أنهيت كل مواعيد اليوم ✓"
- **Offline** → OfflineBanner at top, cached data shown with "محفوظ محلياً" label

### Interactions
- Tap appointment card → expand to show "ابدأ الكشف" + "تعديل الموعد"
- Tap "ابدأ الكشف" → navigate to `/animals/[id]/session/new?appointmentId=[id]`
- Long press appointment card → quick status change (حضر / غاب / مؤجل)

---

## Screen 2: Animal Profile

### Purpose
Everything about this animal in one scroll. No tabs, no sub-pages.

### Layout
```
┌──────────────────────────────────┐
│  ← رجوع                         │
│                                  │
│  بيلو                            │  ← Large animal name
│  🐕 لابرادور · ذكر · 3 سنوات    │  ← SpeciesTag
│                                  │
│  ┌── المرافق ──────────────────┐  │
│  │  أحمد محمد                  │  │  ← OwnerBlock (indigo tint)
│  │  📞 010xxxxxxxx  [اتصال]   │  │
│  └─────────────────────────────┘  │
│                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│
│  │ 32  │ │ 38  │ │↓ 6  │ │  7  ││  ← Stats row
│  │كجم  │ │كجم  │ │كجم  │ │جلسة ││
│  │حالي │ │بداية│ │خسر  │ │عدد  ││
│  └─────┘ └─────┘ └─────┘ └─────┘│
│                                  │
│  سجل الوزن                       │
│  ╭────────────────────────────╮  │
│  │  [Weight line chart]       │  │  ← Recharts, teal line
│  │  target: ── ── (amber)     │  │
│  ╰────────────────────────────╯  │
│                                  │
│  التاريخ الطبي                   │
│  كلب يعاني من زيادة وزن...      │
│                                  │
│  الجلسات السابقة                 │
│  ┌────────────────────────────┐  │
│  │  18 يونيو · 32 كجم ↓1.5   │  │
│  │  ملاحظات: تحسن ملحوظ في..  │  │
│  │  [ عرض التفاصيل ]          │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  4 يونيو · 33.5 كجم        │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │      [ كشف جديد ]          │  │  ← Sticky bottom CTA
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Interactions
- Tap session card → expand full notes + treatment plan
- Tap "اتصال" → native phone call to owner
- Tap "كشف جديد" → if open appointment exists, go to session form; else create new appointment first

---

## Screen 3: New Session Form

### Purpose
Fast, frictionless exam recording. Doctor should be done in under 2 minutes.

### Layout
```
┌──────────────────────────────────┐
│  ← إلغاء        جاري الحفظ... ✓ │  ← Autosave indicator
│                                  │
│  بيلو                            │
│  المرافق: أحمد محمد              │
│  18 يونيو 2024 · 10:30 ص        │
│                                  │
│  ─── الوزن ──────────────────── │
│                                  │
│         ┌─────────┐              │
│         │  32.5   │  كجم         │  ← Large weight input
│         └─────────┘              │
│    آخر وزن: 34 كجم               │
│    ┌────────────┐                │
│    │  ↓ 1.5 كجم │  (green badge) │  ← Auto-calculated delta
│    └────────────┘                │
│                                  │
│  ─── ملاحظات الكشف ────────────  │
│  ┌──────────────────────────────┐│
│  │                              ││  ← Large textarea
│  │  الحيوان يُظهر تحسناً...    ││
│  │                              ││
│  └──────────────────────────────┘│
│                                  │
│  ─── الخطة العلاجية ───────────  │
│  ┌──────────────────────────────┐│
│  │  تمارين: 20 دقيقة مشي...    ││
│  └──────────────────────────────┘│
│                                  │
│  ─── الموعد القادم ────────────  │
│  [ اختر تاريخ ]   [ اختر وقت ]  │
│                                  │
│  ─── الدفع ─────────────────── │
│  رسوم الكشف: 300 جنيه           │
│  المدفوع: [ 300 ] جنيه          │
│  ┌──────────┐                    │
│  │ مدفوع ✓ │  (green badge)     │
│  └──────────┘                    │
│                                  │
│  ┌────────────────────────────┐  │
│  │    حفظ وإنهاء الكشف ✓     │  │  ← Primary CTA
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Autosave Behavior
- Form autosaves to `localStorage` every 10 seconds
- On submit: POST to API → on success: clear local cache
- On offline submit: queue in background sync → show "محفوظ محلياً ✓"
- On reconnect: auto-sync → show "تمت المزامنة ✓"

### Payment Logic in Form
- Fee shown from appointment record
- Doctor enters amount paid now
- If paid < total → status = PARTIAL, remaining shown in red
- If paid = total → status = PAID, green badge
- If 0 paid → status = UNPAID

### After Save
- Appointment marked COMPLETED
- WeightRecord created
- If nextVisitDate set → new Appointment created
- Navigate back to Animal Profile
- Show success toast: "تم حفظ الكشف ✓"

---

## Screen 4: Appointments Calendar

### Layout
```
┌──────────────────────────────────┐
│  المواعيد                        │
│  [ أسبوعي ]  [ شهري ]           │
│                                  │
│  الأحد  الإثنين  الثلاثاء  ...   │
│  [ 16 ]  [ 17 ]  [ 18★ ]  ...   │  ← Day strip, today starred
│                                  │
│  الأربعاء 18 يونيو               │
│  ┌────────────────────────────┐  │
│  │ 10:30  بيلو 🐕             │  │
│  │        أحمد محمد  ●مجدول   │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ 11:30  ميمي 🐈             │  │
│  │        منى سعيد  ●حضر ✓   │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ 02:00  روكي 🐕             │  │
│  │        كريم عمر  ●مجدول   │  │
│  └────────────────────────────┘  │
│                                  │
│  [ + موعد جديد ]                 │
└──────────────────────────────────┘
```

---

## Flow: Add New Animal + Owner

```
Doctor taps [+] FAB
  │
  ▼
Step 1 — Animal Info (required)
  name, species, breed, gender, birthDate
  │
  ▼
Step 2 — Owner Info
  Search existing owners by phone first
  → Found? → select + confirm
  → Not found? → fill name + phone (minimal)
  │
  ▼
Step 3 — Book First Appointment (optional, skippable)
  date + time + fee
  │
  ▼
Saved → navigate to Animal Profile
```

**Rule:** Steps shown as a simple progress indicator (1 / 2 / 3). No wizards, no modals. Each step is a full screen section that scrolls naturally.

---

## Flow: Record Payment with Remaining Balance

```
Session form → Payment section
  Doctor enters: fee = 300, paid now = 200
  → Badge shows: "متبقي 100 جنيه" (red)
  → Status = PARTIAL

On Animal Profile:
  → Unpaid amount shown in stats row with red badge
  → Tap → opens payment modal → doctor records remaining amount

In Appointments list:
  → PaymentBadge shown on each card (مدفوع / جزئي / غير مدفوع)
```

---

## Error & Empty States

| State | Arabic Message | English Message |
|---|---|---|
| No appointments today | لا مواعيد اليوم | No appointments today |
| No animals found | لا يوجد مرضى مسجلون | No animals registered |
| Save failed | تعذر الحفظ، حاول مرة أخرى | Failed to save, please try again |
| No internet | أنت غير متصل — البيانات محفوظة محلياً | You're offline — data saved locally |
| Session already exists | هذا الموعد لديه كشف مسجل بالفعل | This appointment already has a session |
| Unauthorized | غير مصرح لك بهذا الإجراء | You are not authorized for this action |

---

## Language Toggle Behavior

- Toggle button always in TopBar (desktop) and accessible in Profile tab (mobile)
- Single tap → switches language + layout direction instantly
- PATCH `/api/auth/language` called in background → persists preference
- No page reload — `next-intl` handles client-side locale switching
- All dates reformat: Arabic uses `٢٠٢٤/٦/١٨` or `18 يونيو`; English uses `Jun 18, 2024`
- All numbers in Arabic mode use Eastern Arabic numerals for dates, Western for weights/fees (more readable for medical data)
