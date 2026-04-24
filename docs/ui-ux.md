# Tài liệu Thiết kế UI/UX — Hệ thống Quản lý Nhà hàng
**Phiên bản 2.0 · Production Final · Web-only**
*Dựa trên API: auth-core v4.0 · restaurant v1.1 · menu v1.0 · table v1.0 · staff v2.0 · order v1.1 · payment v1.0*

---

## MỤC LỤC

**PHẦN I — HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM)**
1. [Triết lý thiết kế & Phân vùng giao diện](#1-triết-lý-thiết-kế--phân-vùng-giao-diện)
2. [Hệ màu sắc (Color System)](#2-hệ-màu-sắc-color-system)
3. [Kiểu chữ (Typography)](#3-kiểu-chữ-typography)
4. [Khoảng cách & Lưới (Spacing & Grid)](#4-khoảng-cách--lưới-spacing--grid)
5. [Bộ component nền tảng](#5-bộ-component-nền-tảng)
6. [Animation & Micro-interaction](#6-animation--micro-interaction)

**PHẦN II — KIẾN TRÚC ROUTE**
7. [Sơ đồ Route URL đầy đủ](#7-sơ-đồ-route-url-đầy-đủ)

**PHẦN III — THEME TỐI (ADMIN DASHBOARD)**
8. [Khu vực Auth](#8-khu-vực-auth)
9. [Dashboard Owner — Tổng quan](#9-dashboard-owner--tổng-quan)
10. [Quản lý Nhà hàng](#10-quản-lý-nhà-hàng)
11. [Quản lý Menu](#11-quản-lý-menu)
12. [Quản lý Bàn ăn](#12-quản-lý-bàn-ăn)
13. [Quản lý Nhân viên](#13-quản-lý-nhân-viên)
14. [Quản lý Đơn hàng (Dashboard)](#14-quản-lý-đơn-hàng-dashboard)
15. [Tài khoản & Bảo mật](#15-tài-khoản--bảo-mật)

**PHẦN IV — THEME SÁNG (POS & KHÁCH HÀNG)**
16. [Màn hình POS cho Staff](#16-màn-hình-pos-cho-staff)
17. [Màn hình menu & đặt món (Customer-facing)](#17-màn-hình-menu--đặt-món-customer-facing)
18. [Màn hình Thanh toán](#18-màn-hình-thanh-toán)
19. [Màn hình Bếp (Kitchen Display)](#19-màn-hình-bếp-kitchen-display)

**PHẦN V — HÀNH VI & LOGIC**
20. [Luồng người dùng (User Flows)](#20-luồng-người-dùng-user-flows)
21. [Phân quyền hiển thị theo Role](#21-phân-quyền-hiển-thị-theo-role)
22. [Xử lý trạng thái & lỗi](#22-xử-lý-trạng-thái--lỗi)
23. [Bảng ánh xạ Route ↔ API](#23-bảng-ánh-xạ-route--api)

---

# PHẦN I — HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM)

## 1. Triết lý thiết kế & Phân vùng giao diện

### 1.1 Hai thế giới — Hai ngôn ngữ thiết kế

Hệ thống này phục vụ **hai nhóm người dùng với tâm lý hoàn toàn khác nhau**, vì vậy áp dụng hai ngôn ngữ thị giác riêng biệt nhưng đồng nhất về token thiết kế:

| | **Theme Tối — Admin Shell** | **Theme Sáng — POS & Customer** |
|---|---|---|
| **Đối tượng** | Owner, Staff quản lý | Staff bán hàng, Khách đặt món |
| **Mục tiêu** | Kiểm soát, phân tích, cấu hình | Nhanh, rõ, không nhầm lẫn |
| **Cảm xúc** | Chuyên nghiệp, tĩnh lặng, tập trung | Tươi sáng, hứng khởi, tin cậy |
| **Tham chiếu** | Claude.ai, Linear, Vercel | Rasa, Toast POS, Square |
| **Background** | `#1A1A1A` → `#0D0D0D` | `#F8F6F0` → `#FFFFFF` |
| **Accent** | `#D97757` (terra cotta ấm) | `#E85D26` (cam sống động) |

### 1.2 Nguyên tắc chung (cả hai theme)

- **Thứ bậc rõ ràng:** Mọi màn hình chỉ có 1 hành động chính (Primary CTA), tối đa 2 hành động phụ.
- **Mật độ thông tin có chủ đích:** Admin shell được phép dense, POS/Customer ưu tiên whitespace.
- **Màu là ngôn ngữ:** Trạng thái (status) luôn mã màu nhất quán toàn hệ thống.
- **Motion có lý do:** Không animation thuần trang trí; mọi chuyển động phản ánh quan hệ dữ liệu.
- **Responsive tối thiểu:** Desktop-first; POS tối ưu cho tablet 1024px; Customer-facing hỗ trợ mobile 375px+.

---

## 2. Hệ màu sắc (Color System)

### 2.1 Token màu nền tảng (dùng chung)

```css
/* ── SEMANTIC TOKENS ── */

/* Trạng thái đơn hàng & bàn */
--color-status-available:    #22C55E;   /* Xanh lá — sẵn sàng, đã thanh toán, active */
--color-status-pending:      #94A3B8;   /* Xám xanh — chờ xử lý, nháp */
--color-status-occupied:     #F97316;   /* Cam — đang dùng, đang chế biến */
--color-status-reserved:     #EAB308;   /* Vàng — đặt trước, một phần */
--color-status-cleaning:     #A855F7;   /* Tím — đang dọn, đang giao */
--color-status-error:        #EF4444;   /* Đỏ — huỷ, lỗi, terminated */

/* Feedback */
--color-success:             #16A34A;
--color-warning:             #D97706;
--color-error:               #DC2626;
--color-info:                #2563EB;
```

### 2.2 Theme Tối — Admin Shell

```css
/* ══ DARK THEME (Admin Dashboard) ══ */

/* Nền — lớp từ thấp đến cao */
--bg-base:        #0D0D0D;   /* Nền sâu nhất — body */
--bg-surface:     #141414;   /* Card, sidebar */
--bg-elevated:    #1C1C1C;   /* Input, hover state */
--bg-overlay:     #252525;   /* Dropdown, tooltip */
--bg-highlight:   #2A2A2A;   /* Selected row, active item */

/* Viền */
--border-subtle:  #2A2A2A;   /* Viền nhẹ giữa các section */
--border-default: #383838;   /* Viền input, card */
--border-strong:  #4A4A4A;   /* Viền focus, hover */

/* Chữ */
--text-primary:   #EDEDEC;   /* Tiêu đề, nội dung chính */
--text-secondary: #9B9B98;   /* Nhãn, caption, placeholder */
--text-tertiary:  #6B6B68;   /* Disabled, watermark */
--text-inverse:   #0D0D0D;   /* Chữ trên nền sáng */

/* Accent — Terra Cotta */
--accent-primary:   #D97757;   /* Brand chính */
--accent-hover:     #C86645;   /* Hover state */
--accent-subtle:    rgba(217, 119, 87, 0.12);  /* Background nhẹ */
--accent-border:    rgba(217, 119, 87, 0.30);  /* Viền nhấn */

/* Button */
--btn-primary-bg:      #D97757;
--btn-primary-text:    #0D0D0D;
--btn-primary-hover:   #C86645;
--btn-secondary-bg:    #252525;
--btn-secondary-text:  #EDEDEC;
--btn-secondary-hover: #2F2F2F;
--btn-ghost-hover:     rgba(255,255,255,0.06);
--btn-danger-bg:       #991B1B;
--btn-danger-text:     #FEE2E2;
--btn-danger-hover:    #B91C1C;
```

### 2.3 Theme Sáng — POS & Customer

```css
/* ══ LIGHT THEME (POS & Customer) ══ */

/* Nền */
--bg-base:        #F8F6F0;   /* Kem nhẹ — body, tổng thể */
--bg-surface:     #FFFFFF;   /* Card, panel, input */
--bg-elevated:    #F1EFE8;   /* Header, sidebar nhạt */
--bg-overlay:     #FFFFFF;   /* Dialog, dropdown */
--bg-highlight:   #FFF7F3;   /* Hover row, selected item */

/* Viền */
--border-subtle:  #EDE9E0;   /* Viền nhẹ nhàng */
--border-default: #D9D4C7;   /* Viền input, card */
--border-strong:  #B8B2A3;   /* Viền focus */

/* Chữ */
--text-primary:   #1A1714;   /* Đen ấm — không thuần đen */
--text-secondary: #6B6359;   /* Nâu trung — nhãn, caption */
--text-tertiary:  #9E9689;   /* Ghi chú, placeholder */
--text-inverse:   #FFFFFF;   /* Chữ trên nền đậm */

/* Accent — Cam sống động */
--accent-primary:   #E85D26;   /* Cam đậm — POS CTA */
--accent-hover:     #D14D1A;   /* Hover */
--accent-subtle:    #FFF3EE;   /* Nền nhẹ cam */
--accent-border:    #F5C4AE;   /* Viền nhấn */

/* Button */
--btn-primary-bg:      #E85D26;
--btn-primary-text:    #FFFFFF;
--btn-primary-hover:   #D14D1A;
--btn-secondary-bg:    #FFFFFF;
--btn-secondary-text:  #1A1714;
--btn-secondary-hover: #F1EFE8;
--btn-ghost-hover:     rgba(0,0,0,0.04);
--btn-danger-bg:       #EF4444;
--btn-danger-text:     #FFFFFF;

/* POS riêng — màu bàn */
--table-available:  #DCFCE7;   /* Nền bàn trống */
--table-occupied:   #FEF3C7;   /* Nền bàn đang dùng */
--table-reserved:   #DBEAFE;   /* Nền bàn đặt trước */
--table-cleaning:   #F3E8FF;   /* Nền bàn đang dọn */
--table-inactive:   #F1F5F9;   /* Nền bàn tắt */
```

### 2.4 Bảng màu trạng thái — Badge

| Trạng thái | Dark Theme | Light Theme | Text |
|---|---|---|---|
| active / available / paid | `#14532D` bg + `#4ADE80` text | `#DCFCE7` bg + `#15803D` text | Xanh |
| pending / unpaid / draft | `#1E293B` bg + `#94A3B8` text | `#F1F5F9` bg + `#64748B` text | Xám |
| occupied / preparing / partial | `#431407` bg + `#FB923C` text | `#FFF7ED` bg + `#C2410C` text | Cam |
| reserved / on_leave | `#422006` bg + `#FBBF24` text | `#FFFBEB` bg + `#B45309` text | Vàng |
| cleaning / delivering | `#3B0764` bg + `#C084FC` text | `#FAF5FF` bg + `#7E22CE` text | Tím |
| cancelled / error / terminated | `#450A0A` bg + `#F87171` text | `#FEF2F2` bg + `#B91C1C` text | Đỏ |
| completed / confirmed | `#052E16` bg + `#34D399` text | `#ECFDF5` bg + `#047857` text | Xanh đậm |

---

## 3. Kiểu chữ (Typography)

### 3.1 Font stack

```css
/* ── ADMIN THEME ── */
--font-display:  'Geist', 'DM Sans', sans-serif;      /* Tiêu đề lớn */
--font-body:     'Geist', 'DM Sans', sans-serif;       /* Nội dung */
--font-mono:     'Geist Mono', 'Fira Code', monospace; /* Code, số liệu kỹ thuật */

/* ── POS / CUSTOMER THEME ── */
--font-display:  'Plus Jakarta Sans', sans-serif;      /* Tiêu đề, số bàn */
--font-body:     'Plus Jakarta Sans', sans-serif;      /* Nội dung */
--font-price:    'DM Mono', monospace;                 /* Hiển thị giá tiền */
```

*Lý do chọn:* Geist (font của Vercel) mang cảm giác kỹ thuật, sạch — đồng điệu với claude.ai. Plus Jakarta Sans tươi mới, đọc tốt ở mọi kích cỡ — phù hợp POS cần đọc nhanh.

### 3.2 Thang kiểu chữ

```css
/* Thang kích cỡ — 1.25 Major Third scale */
--text-xs:   0.75rem;    /* 12px — caption, label nhỏ */
--text-sm:   0.875rem;   /* 14px — body nhỏ, metadata */
--text-base: 1rem;       /* 16px — body chính */
--text-lg:   1.125rem;   /* 18px — body nhấn mạnh */
--text-xl:   1.25rem;    /* 20px — subheading */
--text-2xl:  1.5rem;     /* 24px — heading nhỏ */
--text-3xl:  1.875rem;   /* 30px — heading section */
--text-4xl:  2.25rem;    /* 36px — heading trang */
--text-5xl:  3rem;       /* 48px — hero, số liệu lớn POS */

/* Font weight */
--weight-regular:  400;
--weight-medium:   500;
--weight-semibold: 600;
--weight-bold:     700;

/* Line height */
--leading-tight:  1.25;   /* Tiêu đề */
--leading-snug:   1.375;  /* Subheading */
--leading-normal: 1.5;    /* Body */
--leading-relaxed:1.625;  /* Text dài */

/* Letter spacing */
--tracking-tight:  -0.025em;  /* Tiêu đề lớn */
--tracking-normal:  0em;
--tracking-wide:   0.025em;   /* Label, caption */
--tracking-wider:  0.05em;    /* Badge, tag uppercase */
```

### 3.3 Quy tắc sử dụng

```
ADMIN THEME:
H1 (Tên trang)   → text-3xl / semibold / tracking-tight / text-primary
H2 (Section)     → text-xl  / semibold / text-primary
H3 (Card title)  → text-base / semibold / text-primary
Body             → text-sm  / regular  / text-secondary
Caption          → text-xs  / regular  / text-tertiary / tracking-wide
Label            → text-xs  / medium   / text-secondary / uppercase / tracking-wider

POS THEME:
Số bàn           → text-5xl / bold / accent
Tên món          → text-lg  / semibold / text-primary
Giá              → text-xl  / bold / font-price / accent
Tổng tiền        → text-4xl / bold / font-price / text-primary
```

---

## 4. Khoảng cách & Lưới (Spacing & Grid)

### 4.1 Spacing scale (4px base)

```css
--space-1:  0.25rem;   /*  4px */
--space-2:  0.5rem;    /*  8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

### 4.2 Border Radius

```css
--radius-sm:   4px;   /* Input nhỏ, badge */
--radius-md:   8px;   /* Button, input thường */
--radius-lg:   12px;  /* Card */
--radius-xl:   16px;  /* Panel, dialog */
--radius-2xl:  24px;  /* Sheet, drawer */
--radius-full: 9999px;/* Pill badge, avatar */
```

### 4.3 Shadow

```css
/* Admin Dark */
--shadow-sm:  0 1px 2px rgba(0,0,0,0.4);
--shadow-md:  0 4px 12px rgba(0,0,0,0.5);
--shadow-lg:  0 12px 32px rgba(0,0,0,0.6);
--shadow-xl:  0 24px 64px rgba(0,0,0,0.7);

/* POS Light */
--shadow-sm:  0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md:  0 4px 12px rgba(0,0,0,0.08);
--shadow-lg:  0 12px 32px rgba(0,0,0,0.10);
--shadow-xl:  0 24px 64px rgba(0,0,0,0.12);

/* Accent glow (POS CTA) */
--shadow-accent: 0 4px 20px rgba(232, 93, 38, 0.35);
```

### 4.4 Layout Grid

#### Admin Dashboard
```
Sidebar:     240px (collapsible → 60px icon-only)
Main:        calc(100vw - 240px)
Content max: 1280px (centered)
Gutter:      32px (page padding)
Column gap:  24px
```

#### POS Layout
```
Sidebar orders: 280px
Center (tables/menu): flex-1
Right panel: 380px
Gutter: 16px
```

#### Customer / Public
```
Max width:   640px (mobile-first, centered)
Gutter:      16px mobile / 24px desktop
```

---

## 5. Bộ component nền tảng

### 5.1 Button

#### Anatomy
```
[Icon?] [Label] [Icon?]
```

#### Variants — Admin (Dark)

```
PRIMARY     bg=#D97757  text=#0D0D0D  → Hành động chính duy nhất mỗi trang
SECONDARY   bg=#252525  text=#EDEDEC  border=#383838 → Hành động phụ
GHOST       bg=transparent  text=#9B9B98  → Link-like, ít nhấn mạnh
DANGER      bg=#991B1B  text=#FEE2E2  → Xoá, terminate
OUTLINE     border=#383838  text=#EDEDEC  bg=transparent → Tùy chọn thứ 3
```

#### Variants — POS/Customer (Light)

```
PRIMARY     bg=#E85D26  text=#FFF  shadow=--shadow-accent → Thêm món, đặt đơn
SECONDARY   bg=#FFF  text=#1A1714  border=#D9D4C7 → Hành động bổ sung
GHOST       bg=transparent  text=#6B6359 → Huỷ, đóng
DANGER      bg=#EF4444  text=#FFF → Huỷ đơn
SUCCESS     bg=#16A34A  text=#FFF → Xác nhận thanh toán
```

#### Kích cỡ

```
SM   height=32px  px=12px  text-sm   radius=6px    → Hành động inline, trong bảng
MD   height=40px  px=16px  text-sm   radius=8px    → Mặc định
LG   height=48px  px=24px  text-base radius=10px   → CTA quan trọng
XL   height=56px  px=32px  text-lg   radius=12px   → CTA POS, landing
ICON height=36px  w=36px             radius=8px    → Icon-only button
```

#### States

```
Default    → như trên
Hover      → bg sáng hơn 10%, transition 150ms ease
Active     → scale(0.98), bg tối hơn 5%
Disabled   → opacity: 0.4, cursor: not-allowed
Loading    → replace label bằng spinner 16px, không thay đổi kích cỡ
Focus      → outline: 2px solid var(--accent-primary), outline-offset: 2px
```

---

### 5.2 Input / Form Field

#### Anatomy
```
[Label]
[Icon?] [Placeholder / Value] [Clear/Action icon?]
[Helper text / Error message]
```

#### Admin (Dark)

```css
.input {
  height: 40px;
  padding: 0 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: border-color 150ms, box-shadow 150ms;
}
.input:hover { border-color: var(--border-strong); }
.input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-subtle);
  outline: none;
}
.input.error { border-color: var(--color-error); }
.input.error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.15); }
```

#### Quy tắc Label

```
- Label: text-xs / medium / text-secondary / uppercase / tracking-wider
- Khoảng cách label → input: 6px
- Helper: text-xs / text-tertiary / margin-top: 4px
- Error: text-xs / color-error / margin-top: 4px (thay helper)
- Required: dấu * màu accent sau label
```

#### Special inputs

**Slug Input:**
- Prefix cố định `app.com/` màu text-tertiary
- Realtime check với debounce 500ms
- Badge inline bên phải: `🔄 Đang kiểm tra` / `✓ Khả dụng` / `✗ Đã dùng`

**OTP Input (6 ô):**
- Mỗi ô: 48×56px, text-2xl / bold / text-center
- Viền riêng từng ô; focus highlight rõ
- Auto-advance khi nhập; backspace lùi ô

**Price Input:**
- Hậu tố đơn vị tiền `VND` cố định bên phải
- Format: `100,000` (auto dấu phẩy ngàn)
- Chỉ nhập số, không âm

**Time Picker:**
- 2 dropdown: giờ (00–23) + phút (00, 15, 30, 45)
- Hoặc input text `HH:MM` với mask

---

### 5.3 Card

#### Admin Card
```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}
.card:hover { border-color: var(--border-default); }
```

#### POS Card (Bàn ăn)
```css
.table-card {
  background: var(--table-[status]);
  border: 2px solid transparent;
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  cursor: pointer;
  transition: all 200ms ease;
}
.table-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.table-card.selected {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}
```

#### POS Card (Món ăn)
```css
.menu-item-card {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 200ms ease;
}
.menu-item-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
```

---

### 5.4 Modal / Dialog

```
Backdrop: rgba(0,0,0,0.7) + blur(4px) [dark] / rgba(0,0,0,0.4) + blur(2px) [light]
Container: bg-surface, radius-xl, shadow-xl
Max-width: 480px (small), 640px (medium), 800px (large)
Animation:
  Enter: scale(0.95) opacity(0) → scale(1) opacity(1) / 200ms ease-out
  Exit:  scale(1) opacity(1) → scale(0.97) opacity(0) / 150ms ease-in

Header:  padding: 24px 24px 0
Body:    padding: 20px 24px
Footer:  padding: 16px 24px / border-top / flex justify-end gap-12px
```

**Confirm Delete Dialog:**
- Icon cảnh báo ⚠️ màu warning lớn (32px)
- Title đỏ (danger)
- Nếu hành động nguy hiểm: thêm input xác nhận gõ tên/từ khóa
- Button order: [Huỷ (secondary)] [Xoá (danger)]

---

### 5.5 Toast / Notification

```
Vị trí: góc dưới bên phải (16px margin)
Chiều rộng: 360px
Khoảng cách giữa các toast: 8px
Stack tối đa: 3 toast

Anatomy:
[Icon 20px] [Title (text-sm/semibold)] [Close ×]
            [Message (text-sm/regular)]
            [Action link? (text-sm/accent)]

Animation:
  Enter: slideInRight (200ms) + fadeIn
  Exit:  slideOutRight (150ms) + fadeOut
  Auto-dismiss: 4000ms (success/info), 6000ms (warning), manual (error)

Variants:
  success: icon=✓ / bg=#052E16+border=#14532D (dark) / bg=#DCFCE7+border=#16A34A (light)
  error:   icon=✕ / bg=#450A0A+border=#7F1D1D        / bg=#FEF2F2+border=#DC2626
  warning: icon=⚠ / bg=#1C1407+border=#78350F        / bg=#FFFBEB+border=#B45309
  info:    icon=ℹ / bg=#0C1A3D+border=#1E3A8A        / bg=#EFF6FF+border=#2563EB
```

---

### 5.6 Badge / Tag

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-wide);
  white-space: nowrap;
}
/* Dot indicator */
.badge::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
}
```

---

### 5.7 Table (Bảng dữ liệu) — Admin only

```
Header: bg-elevated, text-xs/medium/uppercase/tracking-wider/text-secondary
Row:    bg-surface, border-bottom=border-subtle, height=52px
Row hover: bg-highlight, transition 100ms
Selected: bg-accent-subtle, border-left: 3px solid accent-primary

Column types:
  Text:    text-sm/regular/text-primary
  Number:  font-mono/text-sm/text-right
  Badge:   component badge
  Date:    text-sm/text-secondary/tabular-nums
  Actions: icon buttons, hiện khi hover row
  Checkbox: 16×16px, accent color khi checked

Pagination:
  [← Trước] [1] [2] ... [10] [Sau →]
  text-sm / button ghost / current = accent
```

---

### 5.8 Skeleton Loader

```
Admin: bg-elevated → bg-overlay animated shimmer (gradient sweep 1.5s)
Light: bg-border-subtle → bg-elevated animated shimmer

Shapes:
  Text line: height=16px, border-radius=4px
  Avatar:    width=height, border-radius=full
  Card:      match card dimensions
  Image:     match image dimensions
```

---

### 5.9 Empty State

```
Centered vertically + horizontally trong container
Icon: SVG minh họa 80×80px (không dùng emoji)
Title: text-xl/semibold/text-primary
Description: text-sm/text-secondary/max-width=320px/text-center
CTA: Button primary / margin-top: 24px

Ví dụ:
  Chưa có nhà hàng  → [icon nhà hàng] "Tạo nhà hàng đầu tiên" → [Tạo nhà hàng]
  Chưa có món ăn    → [icon tô phở]   "Menu đang trống"        → [Thêm món đầu tiên]
  Không có đơn nào  → [icon hóa đơn]  "Chưa có đơn hàng hôm nay"
```

---

### 5.10 Sidebar Navigation (Admin)

```
Chiều rộng: 240px (expanded) / 60px (collapsed)
Transition: 250ms ease-in-out
Position: fixed left-0 top-0 bottom-0

Logo area: height=56px, padding=16px
  Logo + tên app + toggle collapse button

Nav Item:
  height: 36px
  padding: 0 12px
  border-radius: 8px
  margin: 2px 8px
  display: flex; align-items: center; gap: 10px

  Icon: 18×18px
  Label: text-sm/medium
  Badge (count): bg-accent-subtle/text-accent/text-xs/pill

  Default: text-tertiary
  Hover:   bg-highlight, text-primary
  Active:  bg-accent-subtle, text-accent-primary, font-semibold

Section label:
  text-xs / uppercase / tracking-wider / text-tertiary
  padding: 16px 20px 4px
  margin-top: 8px

Bottom area: avatar + tên user + logout icon
```

---

## 6. Animation & Micro-interaction

### 6.1 Easing functions

```css
--ease-in:      cubic-bezier(0.4, 0, 1, 1);
--ease-out:     cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1); /* Bounce nhẹ */
--ease-smooth:  cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### 6.2 Duration

```css
--duration-instant: 50ms;   /* Hover tức thì */
--duration-fast:   100ms;   /* Hover state */
--duration-normal: 200ms;   /* Transition thường */
--duration-slow:   350ms;   /* Modal, drawer */
--duration-slower: 500ms;   /* Page transition */
```

### 6.3 Quy tắc animation

```
Page enter:   fade-in + slideUp(8px), 200ms ease-out
Card appear:  stagger 50ms delay, fade + scale(0.97→1)
Modal open:   scale(0.95→1) + fade, 200ms ease-spring
Toast:        slideInRight + fade, 200ms ease-out
Sidebar:      width transition, 250ms ease-in-out
Button click: scale(0.97), 100ms ease-in → restore 150ms ease-spring
Data reload:  skeleton → content với fade-in 200ms

POS đặc biệt:
  Thêm món:   card scale(1.05) flash cam rồi về
  Giỏ hàng:   số lượng bounce khi tăng
  Thanh toán success: confetti nhẹ + checkmark animation
```

---

# PHẦN II — KIẾN TRÚC ROUTE

## 7. Sơ đồ Route URL đầy đủ

```
app.com/
│
├── (Landing page)                         → Public, no auth
│
├── auth/
│   ├── register                           → Đăng ký tài khoản
│   ├── verify-email                       → OTP xác minh email
│   ├── login                              → Đăng nhập
│   ├── 2fa                                → Xác thực 2 lớp OTP
│   ├── forgot-password                    → Quên mật khẩu
│   ├── reset-password/verify              → OTP đặt lại mật khẩu
│   └── reset-password                     → Nhập mật khẩu mới
│
├── public/
│   ├── restaurants                        → Tìm kiếm nhà hàng
│   ├── restaurants/:slug                  → Trang nhà hàng công khai
│   ├── restaurants/:slug/menu             → Menu công khai (UC-M16)
│   └── tables/:qrCode                     → Quét QR → thông tin bàn + menu
│
├── dashboard/                             → Require: JWT + owner/admin
│   ├── (Tổng quan chung)
│   │
│   ├── account/
│   │   ├── profile                        → Thông tin & avatar
│   │   ├── security                       → Mật khẩu, 2FA, OAuth
│   │   └── sessions                       → Phiên đăng nhập active
│   │
│   └── restaurants/
│       ├── (Danh sách nhà hàng của owner)
│       ├── new                            → Wizard tạo nhà hàng mới
│       │
│       └── :restaurantId/
│           ├── (Tổng quan nhà hàng)
│           │
│           ├── settings/
│           │   ├── general                → Thông tin cơ bản (UC-R03)
│           │   ├── hours                  → Giờ hoạt động (UC-R04)
│           │   ├── financial              → Tài chính (UC-R05A)
│           │   ├── system                 → Cài đặt JSON (UC-R05B)
│           │   ├── images                 → Logo, cover, gallery (UC-R06)
│           │   └── publish                → Xuất bản + online orders (UC-R07,R08)
│           │
│           ├── menu/
│           │   ├── (Tổng quan menu)
│           │   ├── categories/new
│           │   ├── categories/:catId
│           │   ├── items/new
│           │   └── items/:itemId
│           │
│           ├── tables/
│           │   ├── (Danh sách / sơ đồ bàn)
│           │   ├── new
│           │   └── :tableId
│           │
│           ├── staff/
│           │   ├── (Danh sách nhân viên)
│           │   ├── new
│           │   └── :staffId
│           │
│           └── orders/
│               ├── (Danh sách đơn hàng)
│               └── :orderId
│
└── pos/                                   → Require: JWT + staff/owner của nhà hàng
    └── :restaurantSlug/
        ├── (POS chính — sơ đồ bàn)
        ├── orders/                        → Tất cả đơn active hôm nay
        ├── orders/new                     → Tạo đơn takeaway/delivery
        ├── orders/:orderId                → Chi tiết + thêm món + thanh toán
        ├── tables/:tableId                → View đơn của bàn
        └── kitchen                        → Màn hình bếp (KDS)
```
Truy vết và triển khai POST   /restaurants/{id}/staff                          ← tạo hồ sơ nhân viên mới
GET    /restaurants/{id}/staff                          ← danh sách nhân viên (phân trang)
GET    /restaurants/{id}/staff/{staff_id}               ← chi tiết nhân viên
PATCH  /restaurants/{id}/staff/{staff_id}               ← cập nhật thông tin cơ bản
PATCH  /restaurants/{id}/staff/{staff_id}/status        ← cập nhật trạng thái
PATCH  /restaurants/{id}/staff/{staff_id}/link-account  ← đổi tài khoản liên kết
PATCH  /restaurants/{id}/staff/{staff_id}/permissions   ← cập nhật quyền hạn
PUT    /restaurants/{id}/staff/{staff_id}/avatar        ← cập nhật avatar
DELETE /restaurants/{id}/staff/{staff_id}               ← xoá nhân viên (soft delete) vài #file:staff. Nếu giao diện thiếu thì triển khai thêm giao diện mà vẫn giữ được sự đồng bộ và thống nhất giao diện pos hiên tại.
---

# PHẦN III — THEME TỐI (ADMIN DASHBOARD)

> Toàn bộ các trang trong phần này dùng **Dark Theme**. Nền ngoài cùng `#0D0D0D`.

## 8. Khu vực Auth

> Auth dùng nền tối nhưng tối giản hơn Dashboard. Không có sidebar.

### 8.1 Layout Auth chung

```
Background: #0D0D0D + subtle noise texture
Center panel: max-width=420px, bg=bg-surface, radius=radius-2xl, padding=40px
              shadow=shadow-xl
              Centered vertically + horizontally trên màn hình

Logo: Trên cùng, căn giữa, size=32px + tên app text-xl/semibold
Separator: divider mỏng border-subtle, margin 24px

Footer links: text-xs/text-tertiary, căn giữa dưới form
  Ví dụ: "Đã có tài khoản? Đăng nhập"
```

### 8.2 Trang đăng ký — `/auth/register`

**Tiêu đề:** "Tạo tài khoản mới" — text-2xl/semibold

**Form:**
```
[Email]              → blur → check-email API → badge realtime
[Họ và tên]
[Số điện thoại]      → optional, prefix flag VN
[Mật khẩu]          → toggle ẩn/hiện + thanh sức mạnh 4 mức
[Xác nhận mật khẩu] → validate khớp realtime

Thanh sức mạnh mật khẩu:
  4 segments, màu: đỏ / cam / vàng / xanh
  Text: Yếu / Trung bình / Tốt / Mạnh

[Button PRIMARY LG "Tạo tài khoản"] — full-width

Divider: "hoặc"
[Button OUTLINE "Tiếp tục với Google"] icon Google
[Button OUTLINE "Tiếp tục với Facebook"] icon Facebook

Footer: "Đã có tài khoản? Đăng nhập →"
```

**Trạng thái email check:**
- `available: true` → badge xanh "✓ Email có thể sử dụng"
- Email đang `pending_verification` → toast info + link "Gửi lại mã xác minh"
- Email đã `active` → badge đỏ "✗ Email đã được sử dụng — Đăng nhập?"

### 8.3 Trang xác minh email — `/auth/verify-email`

```
Icon: envelope animated (bounce nhẹ)
Title: "Kiểm tra email của bạn"
Sub: "Chúng tôi đã gửi mã 6 số đến {masked_email}"

OTP Input: 6 ô riêng biệt, auto-focus, auto-submit
Countdown: "Mã hết hạn sau 04:23" (đếm ngược)
Link "Gửi lại mã" → disabled trong 60s đầu, sau đó active

Error states:
  Sai OTP → các ô rung (shake animation 300ms) + border đỏ + "Sai mã, còn N lần"
  Hết 5 lần → thông báo khoá + nút "Gửi mã mới"
  OTP hết hạn → thông báo + nút "Gửi mã mới"
```

### 8.4 Trang đăng nhập — `/auth/login`

```
Title: "Chào mừng trở lại"

[Identifier]  placeholder="Email hoặc số điện thoại"
              → detect type on-the-fly (icon email/phone thay đổi)
[Mật khẩu]   toggle ẩn/hiện
[Checkbox]    "Ghi nhớ đăng nhập 30 ngày"
Link:         "Quên mật khẩu?" → phải alignment

[Button PRIMARY LG "Đăng nhập"] full-width

Divider: "hoặc đăng nhập với"
[Google] [Facebook] — 2 nút ngang nhau

Footer: "Chưa có tài khoản? Đăng ký miễn phí →"
```

**Error handling:**
```
401 sai mật khẩu → inline error dưới form: "Sai email/mật khẩu"
403 chưa verify  → banner info "Tài khoản chưa xác minh. [Gửi lại mã?]"
403 bị khoá      → banner warning "Tài khoản bị khoá sau N lần sai. Đặt lại mật khẩu?"
429 rate limit   → "Quá nhiều yêu cầu. Thử lại sau {X} giây"
```

### 8.5 Trang 2FA — `/auth/2fa`

```
Icon: shield animated
Title: "Xác thực 2 lớp"
Sub: "Nhập mã OTP gửi đến email của bạn"

[Button SECONDARY "Gửi mã OTP"] — click để request gửi OTP
→ Sau khi gửi: hiện 6 ô OTP + countdown 5 phút
→ "Gửi lại" sau 60s

Note nhỏ: "Không nhận được? Kiểm tra thư mục spam"
Link: "← Quay lại đăng nhập"
```

### 8.6 Luồng quên mật khẩu — 3 trang

**`/auth/forgot-password`**
```
Title: "Đặt lại mật khẩu"
[Email input]
[Button "Gửi mã OTP"] → POST /auth/forgot-password
Response: toast "Nếu email tồn tại, mã OTP đã được gửi"
(không tiết lộ email có tồn tại hay không)
```

**`/auth/reset-password/verify`**
```
Title: "Nhập mã xác minh"
6 ô OTP (giống UC-02)
```

**`/auth/reset-password`**
```
Title: "Tạo mật khẩu mới"
[Mật khẩu mới] + thanh sức mạnh
[Xác nhận mật khẩu mới]
[Button "Đặt lại mật khẩu"] → redirect login + toast success
```

---

## 9. Dashboard Owner — Tổng quan

### 9.1 Shell Layout (áp dụng toàn Dashboard)

```
┌────────────────────────────────────────────────────────┐
│  SIDEBAR 240px (fixed)    │   MAIN CONTENT             │
│  ─────────────────────    │   ──────────────────────── │
│  Logo + Toggle            │   Header bar (56px)        │
│  ─────────────────────    │     Breadcrumb             │
│  Nav items                │     Actions                │
│    ● Tổng quan            │   ─────────────────────    │
│    ● Nhà hàng ▾           │   Page content             │
│      └ [Danh sách]        │   (scroll độc lập)         │
│      └ [Tên nhà hàng]     │                            │
│    ─────                  │                            │
│    ● Tài khoản            │                            │
│  ─────────────────────    │                            │
│  [Avatar] Tên user        │                            │
└────────────────────────────────────────────────────────┘
```

**Header bar:**
```
Left: Breadcrumb (text-sm, separator "/", current = text-primary)
Right: [Notification bell] [Avatar dropdown]
  Avatar dropdown: Profile / Settings / Đăng xuất
```

### 9.2 Trang chủ Dashboard — `/dashboard`

**Grid widget 3 cột:**
```
[Tổng nhà hàng: N]    [Đã xuất bản: N]    [Nhận đơn online: N]
     ↓ big number         ↓ green             ↓ accent
```

**Danh sách nhà hàng gần đây:**
- Card grid 3 cột, mỗi card: logo thumbnail + tên + city + badges
- Nút "Xem tất cả"

**CTA nổi bật nếu chưa có nhà hàng:**
```
Empty state lớn:
[Icon nhà hàng 80px]
"Chưa có nhà hàng nào"
"Tạo nhà hàng đầu tiên để bắt đầu"
[Button PRIMARY LG "Tạo nhà hàng"]
```

---

### 9.3 Danh sách nhà hàng — `/dashboard/restaurants`

**Header:**
```
Left: "Nhà hàng của tôi" (h1) + "N nhà hàng" (badge)
Right: [+ Tạo nhà hàng] (button primary)
```

**Grid card 3 cột (desktop), 2 cột (tablet), 1 cột (mobile):**
```
┌────────────────────────────┐
│ [Cover image 160px height] │
├────────────────────────────┤
│ [Logo 40px] Tên nhà hàng  │
│ 📍 Thành phố              │
│                            │
│ [● Đã xuất bản] [📶 Online]│
│                            │
│ ──────────────────────     │
│ [Quản lý] [POS ↗] [⋮]     │
└────────────────────────────┘
```

**Menu ⋮ (context menu):**
- Chỉnh sửa cài đặt
- Xem menu
- Sao chép link
- Xoá (danger)

---

## 10. Quản lý Nhà hàng

### 10.1 Tạo nhà hàng — `/dashboard/restaurants/new`

**Wizard 2 bước với progress indicator:**
```
[● Thông tin cơ bản] ──── [○ Địa chỉ & Liên hệ]
      Bước 1                      Bước 2
```

**Bước 1 — Thông tin cơ bản:**
```
Tên nhà hàng *          → text input
Slug *                  → slug input với realtime check
  Prefix: "app.com/r/"  (text-tertiary)
  Suggestion: "Tự tạo từ tên"
Mô tả                   → textarea 4 rows
Loại ẩm thực            → text input (free-form hoặc combobox)
Mức giá                 → 4 nút toggle: [$] [$$] [$$$] [$$$$]
                           Active = bg-accent-subtle + border-accent

[Tiếp theo →] [Huỷ]
```

**Bước 2 — Địa chỉ & Liên hệ:**
```
Địa chỉ *               → textarea
Thành phố *             → text / combobox
Quận/Huyện              → text
Phường/Xã               → text
[Bản đồ mini]           → click để đặt tọa độ GPS
Điện thoại nhà hàng     → phone input
Email nhà hàng          → email input
Website                 → URL input

[← Quay lại] [Tạo nhà hàng →] (loading spinner khi submit)
```

**Sau khi tạo thành công:**
```
Toast success + redirect sang trang cài đặt nhà hàng
Checklist onboarding nổi lên (modal hoặc banner):
  ✓ Tạo nhà hàng
  ○ Thiết lập giờ mở cửa   → [Thiết lập ngay]
  ○ Thêm menu
  ○ Thêm bàn + tạo QR
  ○ Xuất bản nhà hàng
```

---

### 10.2 Tổng quan nhà hàng — `/dashboard/restaurants/:id`

**Header nhà hàng:**
```
[Cover image — chiều cao 200px, object-fit: cover]
Overlay gradient bottom: rgba(0,0,0,0.6) → transparent (reverse)

Overlay content:
  [Logo 64px circular] Tên nhà hàng (text-3xl/semibold)
  [● Đã xuất bản] [📶 Nhận đơn online]
  City / Cuisine type
  [Chỉnh sửa] [Xem trang công khai ↗] [Mở POS →]
```

**Tab navigation:**
```
[Tổng quan] [Menu] [Bàn] [Nhân viên] [Đơn hàng] [Cài đặt]
```
Tab active: border-bottom 2px accent, text accent

**Content tab Tổng quan:**
- Widget stats: Tổng bàn / Nhân viên active / Đơn hôm nay / Doanh thu hôm nay
- Quick actions nếu thiếu điều kiện publish: banner warning
- Preview giờ hoạt động tuần này

---

### 10.3 Settings — Sidebar phụ bên trong trang cài đặt

```
URL: /dashboard/restaurants/:id/settings/*

Layout: 2 cột
  Left:  Nav dọc 200px — menu các mục cài đặt
  Right: Form nội dung của mục đang chọn

Nav items:
  ● Thông tin cơ bản     /settings/general
  ● Giờ hoạt động        /settings/hours
  ● Tài chính            /settings/financial
  ● Cài đặt hệ thống     /settings/system
  ● Hình ảnh             /settings/images
  ── DANGER ZONE ──
  ● Xuất bản & Quyền     /settings/publish
```

#### /settings/general — Thông tin cơ bản

```
Form partial update (PATCH):
  Tên nhà hàng *
  Slug (chỉ sửa được khi is_published = 0, badge "Đã khoá" nếu published)
  Mô tả (textarea)
  Loại ẩm thực
  Mức giá (toggle nhóm)
  ── Địa chỉ ──
  Địa chỉ * / Thành phố * / Quận / Phường
  Bản đồ mini (click đặt pin)
  ── Liên hệ ──
  Điện thoại / Email / Website

[Lưu thay đổi] → loading state → toast success
Unsaved changes guard: dialog xác nhận khi navigate đi
```

#### /settings/hours — Giờ hoạt động

```
Grid 7 ngày:
┌──────────┬────────┬──────────┬──────────┐
│  Thứ     │ Nghỉ   │  Mở cửa  │  Đóng    │
├──────────┼────────┼──────────┼──────────┤
│ Thứ 2    │ [○]    │ [08:00▼] │ [22:00▼] │
│ Thứ 3    │ [○]    │ [08:00▼] │ [22:00▼] │
│ ...      │        │          │          │
│ Chủ nhật │ [●]    │  (grayed)│  (grayed)│
└──────────┴────────┴──────────┴──────────┘

Toggle "Nghỉ" → disable 2 time picker của hàng đó
"Sao chép từ thứ 2" button cho mỗi hàng (icon copy)
Validate realtime: open < close (highlight đỏ nếu sai)
Cảnh báo: "Midnight crossover chưa hỗ trợ"

[Lưu giờ hoạt động] → toast success
```

#### /settings/financial — Tài chính

```
Section "Tiền tệ & Thuế":
  Tiền tệ      → Dropdown: VND / USD / EUR
  Thuế suất (%) → Số 0-99.99 + suffix "%"
  Phí dịch vụ (%) → Số 0-99.99

Banner info: "Thuế suất và phí dịch vụ được snapshot vào từng đơn hàng khi tạo"

[Lưu cài đặt tài chính]
```

#### /settings/system — Cài đặt hệ thống

```
Mỗi setting là 1 card riêng:
┌─────────────────────────────────────────────┐
│ Tự động xác nhận đơn online     [Toggle ON] │
│ Tự động xác nhận khi đơn gửi qua QR/App     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Đơn tối thiểu                 [50,000 VND]  │
│ Áp dụng cho đơn đặt online                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Bán kính giao hàng       [━━━●──── 5 km]   │
│ Slider 1-50km                               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Đặt bàn trước tối đa        [30 ngày]       │
│ Khách có thể đặt trước tối đa N ngày        │
└─────────────────────────────────────────────┘

[Lưu cài đặt hệ thống]
```

#### /settings/images — Hình ảnh

```
Section "Logo":
  [Kéo thả hoặc click để upload]
  Khuyến nghị: 400×400px / PNG hoặc WebP / < 2MB
  Preview: circle 80px + tên file

Section "Ảnh bìa":
  [Upload zone — 400px height / tỷ lệ 16:9]
  Preview: chiều rộng đầy đủ

Section "Gallery" (tối đa 20 ảnh):
  Grid 4 cột, mỗi ảnh: 120×90px
  Hover: overlay đen 40% + nút X + icon kéo
  Sắp xếp bằng drag & drop
  Badge góc: "X/20"
  [+ Thêm ảnh] button (disabled khi đủ 20)
```

#### /settings/publish — Xuất bản

```
Section "Trạng thái nhà hàng":
  Card lớn:
  [Toggle lớn — Xuất bản nhà hàng]
  Mô tả: "Nhà hàng sẽ hiển thị trong kết quả tìm kiếm"

  Khi cố bật publish mà thiếu điều kiện:
  → Panel error:
    ✗ Chưa thiết lập giờ mở cửa → [Thiết lập ngay]
    ✗ Chưa có địa chỉ → [Cập nhật]
  → Không bật được cho đến khi đủ điều kiện

  Khi đã published:
  → Banner "🔒 Slug đã bị khoá sau khi xuất bản"
  → Hiển thị URL công khai: app.com/r/{slug} + nút copy

Section "Đơn hàng online":
  [Toggle — Nhận đơn đặt qua app và QR]
  Disabled nếu chưa published + tooltip "Xuất bản nhà hàng trước"

Section "DANGER ZONE":
  Card viền đỏ mờ:
  "Xoá nhà hàng"
  Mô tả: "Dữ liệu menu và bàn sẽ bị xoá vĩnh viễn. Lịch sử đơn hàng được giữ lại."
  [Xoá nhà hàng] → dialog confirm gõ tên nhà hàng
```

---

## 11. Quản lý Menu

### 11.1 Trang menu — `/dashboard/restaurants/:id/menu`

**Layout 2 cột:**
```
┌──────────────────┬─────────────────────────────────────┐
│ DANH MỤC (280px) │ MÓN ĂN                              │
│ ──────────────── │ ─────────────────────────────────────│
│ Kéo thả để sắp   │ Filter bar: [Tất cả] [Có sẵn]      │
│ xếp thứ tự       │             [Hết hàng] [Nổi bật]   │
│                  │                                      │
│ [Danh mục 1] ≡   │ Grid 3 cột card món ăn              │
│  icon mắt | edit │                                      │
│                  │                                      │
│ [Danh mục 2] ≡   │ (skeleton khi đang load)            │
│ inactive - grayed│                                      │
│                  │                                      │
│ ──────────────── │                                      │
│ [+ Thêm danh mục]│ [+ Thêm món]                        │
└──────────────────┴─────────────────────────────────────┘
```

**Danh mục item:**
```
[≡ drag handle] [icon] Tên danh mục   (N món)   [👁 toggle] [✏ edit]
```
Màu xám khi `is_active = false`, có strikethrough nhẹ trên tên

**Card món ăn (trong grid):**
```
┌──────────────────────┐
│ [Ảnh 160px] hoặc     │
│ [Placeholder icon]   │
├──────────────────────┤
│ Tên món (text-sm/sb) │
│ 85,000 ₫            │
│ [● Có sẵn] [★ Nổi bật│
│ [Sửa]                │
└──────────────────────┘
```

**Khi drag để reorder:** dashed border + opacity 0.5 + cursor grab

---

### 11.2 Tạo / Sửa danh mục — Dialog 480px

```
Title: "Thêm danh mục" / "Chỉnh sửa danh mục"

[Tên danh mục *]
[Mô tả] — textarea 2 rows
[Ảnh đại diện] — upload URL

Footer:
  [Xoá danh mục (danger, chỉ khi sửa)] ←flex-start
  [Huỷ] [Lưu →] ←flex-end
```

Khi xoá: check còn món không → hiện cảnh báo "Còn N món, chuyển hoặc xoá món trước"

---

### 11.3 Tạo / Sửa món ăn — Trang đầy đủ

**Layout 2 cột:**
```
Cột trái (60%):
  Danh mục *          → dropdown
  Tên món *           → text, counter "N/200"
  Mô tả               → textarea 4 rows
  Giá bán (VND) *     → price input
  ──────────────
  Ảnh món ăn:
    Grid upload tối đa 10 ảnh
    [+ Thêm ảnh] / Drag to reorder / [×] xoá

Cột phải (40%):
  Section "Trạng thái":
  ┌────────────────────────┐
  │ Có sẵn      [Toggle ●] │
  │ Nổi bật     [Toggle ○] │
  └────────────────────────┘

  Section "Vị trí":
  Thứ tự hiển thị: [auto]
  (tự động nếu không nhập)

  Preview card:
  ┌────────────────────┐
  │   [Ảnh preview]    │
  │   Tên món          │
  │   85,000 ₫         │
  └────────────────────┘

Footer (sticky):
  [Xoá món (danger)]  [Huỷ]  [Lưu & Thêm mới]  [Lưu]
```

---

## 12. Quản lý Bàn ăn

### 12.1 Trang bàn — `/dashboard/restaurants/:id/tables`

**Toggle view: [⊞ Sơ đồ] [≡ Danh sách]**

**View Sơ đồ:**
```
Filter bar: [Tất cả] [Trống] [Đang dùng] [Đặt trước] [Dọn] [Tắt]
Nút: [+ Thêm bàn] (góc phải)

Grid responsive bàn (auto-fill min 140px):
┌──────────┐ ┌──────────┐ ┌──────────┐
│    B01   │ │    B02   │ │    B03   │
│  ████    │ │  ▓▓▓▓    │ │  ░░░░    │
│ 4 chỗ   │ │ 6 chỗ   │ │ 2 chỗ   │
│ ● Trống │ │ ● Đang  │ │ ● Trống │
└──────────┘ └──────────┘ └──────────┘

Màu card theo trạng thái (xem Color System 2.3)
Click → mở panel detail bên phải (slide-in 300ms)
```

**View Danh sách:**
```
Bảng với cột: Số bàn / Tên / Sức chứa / Trạng thái / QR / Hoạt động / Hành động
Row hover → highlight + actions hiện (Edit / QR / Toggle / Delete)
```

---

### 12.2 Panel / Trang chi tiết bàn

**Khi click vào bàn (view sơ đồ):** Slide-in panel từ phải, width 380px
**Hoặc navigate:** `/tables/:tableId` → full page

```
Header panel:
  Số bàn "Bàn 05" (text-4xl/bold)
  Trạng thái badge
  [×] đóng panel (nếu slide-in)

Tab: [Thông tin] [QR Code] [Lịch sử]

── Tab Thông tin ──
Form:
  Số bàn *
  Tên gọi (VD: "Bàn VIP Phòng Riêng")
  Sức chứa (1–99)
  Ghi chú nội bộ (textarea)

Trạng thái thủ công (chỉ owner/admin):
  Dropdown: Trống / Đang dùng / Đặt trước / Đang dọn / Tắt
  → thay đổi gọi PATCH /status

Toggle:
  [Hoạt động] ON/OFF → PATCH /toggle

[Lưu] [Xoá bàn (danger)]

── Tab QR Code ──
Nếu chưa có QR:
  [Tạo mã QR ngay] → icon QR lớn grayed

Nếu đã có QR:
  [QR Code image 200×200px]
  URL: app.com/public/tables/{qr_code}
  [Sao chép link] [Tải xuống PNG] [In QR]

  [Làm mới mã QR] → button warning + tooltip:
    "QR cũ sẽ vô hiệu ngay lập tức. Tiếp tục?"

── Tab Lịch sử ──
Danh sách 5 đơn gần nhất của bàn này
  Ngày / Mã đơn / Tổng tiền / Trạng thái
```

---

## 13. Quản lý Nhân viên

### 13.1 Danh sách nhân viên — `/dashboard/restaurants/:id/staff`

**Header:**
```
Left: "Nhân viên" (h2) + badge "N người active"
Right: [+ Thêm nhân viên]
```

**Filter row:**
```
[Tìm theo tên...] [Vị trí ▾] [Trạng thái ▾]
```

**Danh sách card (grid 2-3 cột):**
```
┌───────────────────────────────┐
│ [Avatar 48px]  Tên nhân viên  │
│                MV-001         │
│                Waiter         │
│                               │
│ [● Active]    Từ 01/03/2025  │
│                               │
│ [Xem chi tiết]  [⋮]          │
└───────────────────────────────┘
```
Badge status theo màu hệ thống. Context menu ⋮: Chỉnh sửa / Đổi trạng thái / Xoá.

---

### 13.2 Thêm nhân viên — `/staff/new`

**2 bước:**

**Bước 1: Tìm tài khoản**
```
Search: [Email hoặc tên tài khoản]
→ Kết quả: avatar + tên + email
→ Click "Chọn" → sang bước 2
Note: "Nhân viên phải tự đăng ký tài khoản tại app.com/auth/register trước"
```

**Bước 2: Thông tin hồ sơ**
```
Tài khoản liên kết: [Avatar] Tên — email (readonly)

Mã nhân viên *        → text (tự đặt, unique trong nhà hàng)
Họ và tên *
Vị trí *              → Dropdown: Manager/Cashier/Waiter/Kitchen/Delivery
Ngày vào làm *        → Date picker (không tương lai)
Điện thoại HR         → optional
Email HR              → optional (khác email tài khoản)

[← Quay lại] [Tạo hồ sơ nhân viên]
```

---

### 13.3 Chi tiết nhân viên — `/staff/:staffId`

**Tabs: [Thông tin] [Quyền hạn] [Trạng thái] [Tài khoản]**

**Tab Thông tin:**
```
Cột trái (form):
  Mã nhân viên (readonly)
  Họ và tên *
  Vị trí *
  Ngày vào làm *
  Điện thoại / Email HR

Cột phải (avatar):
  Avatar 96px circular
  [Đổi ảnh] → upload URL

[Lưu thay đổi]
```

**Tab Quyền hạn** *(chỉ owner/admin thấy)*:
```
Section "Đơn hàng":
  [Toggle] Được giảm giá đơn hàng
  [Toggle] Được huỷ đơn hàng
  [Toggle] Được hoàn tiền

Section "Quản lý":
  [Toggle] Xem báo cáo doanh thu
  [Toggle] Quản lý bàn (đổi trạng thái)
  [Toggle] Chỉnh sửa menu

[Lưu quyền hạn]
Banner info: "Thay đổi có hiệu lực trong vòng 5 phút"
```

**Tab Trạng thái:**
```
Trạng thái hiện tại: [● Active] badge lớn

Lịch sử trạng thái (timeline nhỏ)

Chuyển trạng thái:
  Dropdown: Active / Nghỉ phép / Không hoạt động / Nghỉ việc
  Lý do: textarea (optional, bắt buộc khi Terminate)

Cảnh báo khi Terminate:
  "⚠ Nhân viên sẽ mất quyền truy cập ngay lập tức khi bạn xác nhận"
  [Xác nhận chuyển trạng thái]
```

**Tab Tài khoản:**
```
Tài khoản liên kết hiện tại:
[Avatar] Tên — email

[Đổi tài khoản liên kết] → tìm user mới
Cảnh báo: "Token của nhân viên cũ sẽ bị thu hồi ngay"
```

---

## 14. Quản lý Đơn hàng (Dashboard)

### 14.1 Danh sách đơn — `/dashboard/restaurants/:id/orders`

**Header:**
```
Left: "Đơn hàng" + date picker (mặc định hôm nay)
Right: [Xuất báo cáo ↓]
```

**Summary stats bar:**
```
[Tổng đơn: 42] [Hoàn thành: 35] [Đang xử lý: 5] [Đã huỷ: 2] [Doanh thu: 8,250,000 ₫]
```

**Filter row:**
```
[Tất cả trạng thái ▾] [Tất cả loại ▾] [Nguồn ▾] [Thanh toán ▾] [Tìm mã đơn...]
```

**Bảng đơn hàng:**
```
Cột: Mã đơn | Bàn | Khách | Loại | Nguồn | Trạng thái | Thanh toán | Tổng | Thời gian
Mặc định sort: created_at DESC
Click row → `/orders/:orderId`
```

---

### 14.2 Chi tiết đơn hàng — `/orders/:orderId`

**Layout 2 cột:**

```
Cột trái (60%):
  Header:
    Mã đơn #20250412-0023 (text-2xl/bold/mono)
    [Loại badge] [Nguồn badge] [Trạng thái badge]
    Tạo lúc: HH:mm DD/MM/YYYY

  Timeline trạng thái (horizontal stepper):
    Chờ → Đã xác nhận → Đang làm → Sẵn sàng → Hoàn thành
    (delivery thêm: Đang giao)
    Bước hiện tại highlight, bước đã qua grayed+checkmark

  Info grid:
    Bàn: B05 (hoặc — nếu takeaway)
    Khách: Tên / SĐT (nếu có)
    Nhân viên: Tên staff
    Ghi chú: (nội dung)
    Lý do huỷ: (nếu cancelled)

  Danh sách món:
  ┌─────────────────────────────────────────────┐
  │ Tên món             Trạng thái   SL   Giá  │
  │ Ghi chú khách       (badge)                 │
  ├─────────────────────────────────────────────┤
  │ Phở bò tái         ● Đã phục vụ  2   160k  │
  │ Không hành                                  │
  │ Gỏi cuốn          ● Đang làm    1    45k  │
  │ ─ bị huỷ ─        ✕ Đã huỷ     1    40k  │  ← strikethrough
  └─────────────────────────────────────────────┘

  Bảng tổng tiền:
    Tạm tính:          200,000 ₫
    Giảm giá (10%):   − 20,000 ₫
    Thuế (10%):       + 18,000 ₫
    ─────────────────────────────
    Tổng:              198,000 ₫

Cột phải (40%):
  Card "Hành động đơn hàng":
    [Chuyển trạng thái →] (dropdown phù hợp state machine)

  Card "Giảm giá":
    [Loại ▾] [Giá trị] [Áp dụng]
    (ẩn nếu không có quyền)

  Card "Thanh toán":
    Trạng thái: ● Chưa thanh toán
    Đã thu: 0 ₫ / 198,000 ₫
    [Xử lý thanh toán →]
    Lịch sử payment (accordion)

  Card "Hành động nguy hiểm":
    [Huỷ đơn hàng] (danger, chỉ khi cho phép)
```

---

## 15. Tài khoản & Bảo mật

### 15.1 `/dashboard/account/profile`
```
Avatar lớn (96px) + [Đổi ảnh]
Form: Họ tên / SĐT / Ngày sinh / Giới tính
[Lưu thông tin]
```

### 15.2 `/dashboard/account/security`

**Section: Mật khẩu**
```
[Mật khẩu hiện tại] [Mật khẩu mới] [Xác nhận]
[Đổi mật khẩu]
Lưu ý: "Đổi mật khẩu sẽ đăng xuất tất cả thiết bị khác"
```

**Section: Xác thực 2 lớp**
```
Trạng thái: [● 2FA đang bật / ○ 2FA tắt]
Phương thức: OTP Email

Khi tắt → dialog yêu cầu nhập mật khẩu
Khi bật → dialog yêu cầu nhập mật khẩu + điều kiện (phải có email verified)
```

**Section: Ứng dụng liên kết OAuth**
```
[Google icon] Google — Đã liên kết      [Huỷ liên kết]
[Facebook icon] Facebook — Chưa liên kết [Liên kết]
```

### 15.3 `/dashboard/account/sessions`

```
"Thiết bị này" (badge xanh) luôn ở đầu

Danh sách sessions:
┌──────────────────────────────────────────────┐
│ 🖥 Chrome / macOS — 192.168.1.1              │
│ Hoạt động 5 phút trước                      │
│                              [Đăng xuất]    │
├──────────────────────────────────────────────┤
│ 📱 Safari / iPhone — 10.0.0.1               │
│ Hoạt động 2 giờ trước                       │
│                              [Đăng xuất]    │
└──────────────────────────────────────────────┘

[Đăng xuất tất cả thiết bị khác] — button danger outline
```

---

# PHẦN IV — THEME SÁNG (POS & KHÁCH HÀNG)

> Toàn bộ phần này dùng **Light Theme**. Tông kem ấm `#F8F6F0`.

## 16. Màn hình POS cho Staff

### 16.1 POS Shell Layout — `/pos/:slug`

```
Background: #F8F6F0
Header: 60px, bg=#FFFFFF, shadow-sm
  Left:  Logo 28px + Tên nhà hàng (text-base/semibold)
  Center: Ngày giờ hiện tại (real-time)
  Right:  [Avatar nhân viên] Tên — Vị trí | [Đăng xuất]

Body: flex row, height=calc(100vh - 60px)
  Left sidebar: 280px
  Main:         flex-1
  Right panel:  380px (ẩn khi chưa chọn bàn/đơn)
```

### 16.2 Sidebar trái — Đơn hàng hôm nay

```
Background: #FFFFFF
Border-right: 1px solid #EDE9E0

Header: "Đơn hôm nay" (text-sm/semibold/text-secondary/uppercase/tracking-wider)
        Badge count tổng đơn

Tabs nhỏ: [Tất cả] [Đang xử lý] [Chờ TT]

Danh sách đơn (scroll):
┌─────────────────────────────┐
│ #0023    Bàn 05     15:42   │
│ Đang làm          198,000 ₫│
│ [━━━━━░░] 3/5 món xong     │
├─────────────────────────────┤
│ #0022    Mang về   15:30    │
│ Sẵn sàng           85,000 ₫│
└─────────────────────────────┘

Gutter bottom: [+ Đơn mang về] [+ Đơn giao hàng] — 2 nút
```

### 16.3 Main area — Sơ đồ bàn

```
Filter pills: [Tất cả] [● Trống] [● Đang dùng] [● Đặt trước] [● Dọn]
              (mỗi pill có màu dot tương ứng)

Grid bàn (auto-fill, min-width 140px, gap 12px):

┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   B01          │  │   B02          │  │   B03          │
│                │  │  [icon người]  │  │                │
│   4 chỗ        │  │   6 chỗ        │  │   2 chỗ        │
│                │  │   #0023        │  │                │
│   ──────────   │  │   198,000 ₫   │  │   ──────────   │
│   ● Trống      │  │   ● Đang dùng  │  │   ● Đang dọn   │
└────────────────┘  └────────────────┘  └────────────────┘
  bg: #DCFCE7         bg: #FEF3C7          bg: #F3E8FF
  border: #86EFAC     border: #FCD34D      border: #D8B4FE

Hover: transform translateY(-3px) + shadow-md (200ms ease-spring)
```

**Hành động click bàn:**
- `available` → Tạo đơn mới → right panel mở với menu chọn món
- `occupied` / `reserved` → Mở đơn đang có → right panel
- `cleaning` / `inactive` → Toast "Bàn chưa sẵn sàng"

---

### 16.4 Right Panel — Tạo / Xem đơn hàng

```
Background: #FFFFFF
Border-left: 1px solid #EDE9E0
Width: 380px
Overflow-y: auto

─── HEADER ───
Bàn 05               [× Đóng]
#20250412-0023       ● Đang làm

─── SEARCH MÓN (nếu đang tạo đơn) ───
[🔍 Tìm món...]  → filter danh sách menu bên dưới

─── MENU THEO DANH MỤC ───
[Tab] Khai vị  |  Món chính  |  Đồ uống  |  Tráng miệng

Danh sách món (dạng compact list):
┌────────────────────────────────────────┐
│ [Ảnh 48px] Phở bò tái        85,000 ₫│
│            Còn hàng       [  +  ]     │
├────────────────────────────────────────┤
│ [Ảnh 48px] Gỏi cuốn tôm     45,000 ₫│
│            Còn hàng       [  +  ]     │
├────────────────────────────────────────┤
│ [Ảnh 48px] Bún bò Huế       78,000 ₫│
│            HẾT HÀNG     [Hết hàng]    │  ← grayed
└────────────────────────────────────────┘

─── GIỎ HÀNG / ĐƠN HÀNG HIỆN TẠI ───
Separator có label "Đơn hàng"

┌────────────────────────────────────────┐
│ Phở bò tái          ● Chờ   2  170k  │
│ [Ghi chú...]                  [×]     │
├────────────────────────────────────────┤
│ Gỏi cuốn            ● Đang   1   45k  │
│                              [×admin] │
└────────────────────────────────────────┘

─── TỔNG TIỀN ───
Tạm tính:       215,000 ₫
Giảm giá:      − 0 ₫    [Áp dụng mã]
Thuế (10%):   + 21,500 ₫
─────────────────────────────
Tổng:           236,500 ₫

─── ACTIONS ───
[Ghi chú đơn]
[Trạng thái ▾ Đang làm]  → dropdown chuyển status

[THANH TOÁN  236,500 ₫]  ← Button XL primary cam, full-width
                             shadow-accent
```

**Quantity control trong cart:**
```
[ − ]  [2]  [ + ]   → min 1, nếu − từ 1 → confirm xoá
```

**Nút [×] xoá món:**
- Chỉ hiện khi item status = `pending`
- Admin: luôn hiện (kể cả preparing/ready)
- Click → confirm "Huỷ món này?" (inline confirm nhỏ)

---

### 16.5 Tạo đơn không có bàn

**Dialog "Đơn mang về / Giao hàng"** — 480px:
```
Title: "Tạo đơn mới"

Loại đơn:    [○ Mang về]  [○ Giao hàng]  [○ Điện thoại]

Thông tin khách (optional):
  Họ tên: [__________]
  SĐT:    [__________]

Ghi chú:  [textarea]

[Tiếp theo — Chọn món →]
```

---

### 16.6 Thanh toán POS — Full-screen overlay

```
Background: rgba(0,0,0,0.5) + blur(8px)
Dialog: bg=#FFFFFF, radius=24px, width=640px, padding=32px

─── HEADER ───
[× Đóng]
"Thanh toán đơn #0023"

Tóm tắt nhanh:
  Bàn 05 — 2 khách
  Phở bò tái ×2, Gỏi cuốn ×1

─── TỔNG TIỀN ───
Tổng cần thanh toán:    236,500 ₫  (text-4xl/bold)
Đã thu:                      0 ₫
Còn lại:                236,500 ₫  (accent color)

─── CHỌN PHƯƠNG THỨC ───
Grid 2×3 buttons:
┌──────────────────┐ ┌──────────────────┐
│ 💵 Tiền mặt      │ │ 💳 Thẻ ngân hàng │
├──────────────────┤ ├──────────────────┤
│ 📱 MoMo          │ │ 💙 ZaloPay       │
├──────────────────┤ ├──────────────────┤
│ 🔴 VNPay         │ │ 📊 QR Chuyển khoản│
└──────────────────┘ └──────────────────┘

Active: border-2px accent + bg-accent-subtle

─── FORM THEO PHƯƠNG THỨC ───
[Section thay đổi theo lựa chọn — xem chi tiết mục 18]

─── SPLIT BILL ───
Toggle: [○ Chia bill nhiều lần]
→ khi bật: hiện progress bar + nút "Thêm lần thanh toán"

─── LỊCH SỬ THANH TOÁN (nếu đã có) ───
(Compact list)

─── FOOTER ───
[Huỷ]  [Xác nhận thanh toán]

Khi paid đủ → button đổi sang [✓ Hoàn tất — In hoá đơn]
```

---

## 17. Màn hình menu & đặt món (Customer-facing)

> Dùng cho: `/public/restaurants/:slug/menu` và sau khi quét QR

### 17.1 Layout tổng thể

```
Mobile-first, max-width=640px, centered

─── STICKY HEADER (56px) ───
[← Back?] Logo nhà hàng  Tên  [🔍 Tìm]

─── HERO ───
Cover image 200px (lazy load)
Overlay bottom: gradient + tên + city + status open/closed

─── STICKY CATEGORY TABS ───
Cuộn ngang, không wrap
[Khai vị] [Món chính] [Đồ uống] [Tráng miệng]
Active tab: border-bottom 3px accent + text accent

─── DANH SÁCH MÓN THEO NHÓM ───
Section heading (sticky khi scroll):
  "Món chính" (text-lg/semibold)

Card món ăn (list vertical):
┌─────────────────────────────────────────┐
│ [Ảnh 88px]  Phở bò tái          85,000₫│
│             Phở bò với thịt tái...      │
│             [★ Nổi bật]        [  +  ] │
└─────────────────────────────────────────┘

Nút [+] → pulse animation 300ms khi nhấn
Nút [−] xuất hiện khi đã có món

─── FLOATING CART BUTTON ───
Position: fixed bottom=80px, right=16px (mobile) / bottom=32px (desktop)
Background: accent cam, shadow-accent
Kích cỡ: 56px pill → expand khi có món
Content: 🛒 N món — 236,500 ₫
Animation: bounce nhẹ khi số lượng tăng
```

### 17.2 Trang tìm kiếm món — `/menu/search`

```
Search input full-width, auto-focus
Kết quả real-time (debounce 300ms):
  Mỗi card: ảnh + tên + danh mục + giá + [+]
Empty: "Không tìm thấy món phù hợp với '{q}'"
```

### 17.3 Giỏ hàng & Đặt món

**Bottom Sheet (swipe up từ cart button):**
```
Handle bar (kéo lên/xuống)
Title: "Đơn hàng của bạn"

Danh sách món:
  [Ảnh 48px] Tên — Ghi chú
  [−] [N] [+]                    Giá
  [Thêm ghi chú...]             × xoá

Tổng:
  Tạm tính: X
  Phí dịch vụ: Y
  Thuế: Z
  Tổng: [số lớn]

Section thông tin khách (optional):
  [Tên của bạn]
  [Số điện thoại]
  [Ghi chú cho bếp]

[ĐẶT MÓN — 236,500 ₫] → Button XL accent full-width
```

**Sau khi đặt thành công:**
```
Animation: checkmark lớn (SVG stroke animation 600ms) + confetti nhẹ

"Đơn hàng đã gửi! 🎉"
Mã đơn: #20250412-0023
"Nhân viên sẽ xác nhận trong giây lát"

[Xem thực đơn lại]   [Theo dõi đơn hàng?]
```

---

## 18. Màn hình Thanh toán

### 18.1 Form Tiền mặt

```
[Số tiền cần thu]    → mặc định = remaining, có thể sửa (split)
[Tiền khách đưa]     → nhập số, validate >= amount

Hiển thị realtime:
"Tiền thối: 13,500 ₫"  (text-2xl/bold/green)

[Xác nhận thu tiền] → loading 500ms → toast success
```

### 18.2 Form Thẻ ngân hàng

```
Loại thẻ:  [○ Thẻ tín dụng]  [○ Thẻ ghi nợ]
Số tiền:   [236,500 ₫]  (sửa được nếu split)
Mã giao dịch: [REF-xxxxxxxx]  ← nhập từ máy POS terminal

Note: "Quẹt thẻ qua máy terminal trước, sau đó nhập mã giao dịch"

[Xác nhận thanh toán thẻ]
```

### 18.3 Form Ví điện tử (MoMo / ZaloPay / VNPay / ShopeePay)

```
Bước 1: Chọn số tiền → [Tạo link thanh toán]
  → Loading 1-2s (gọi gateway API)

Bước 2: Hiển thị QR gateway hoặc deeplink
  ┌─────────────────────┐
  │   [QR gateway 200px]│
  │                     │
  │   Hoặc mở app:      │
  │   [Mở MoMo]        │
  │                     │
  │   Hết hạn: 29:42   │
  └─────────────────────┘

Bước 3: Polling tự động mỗi 3s
  Indicator: "Đang chờ xác nhận thanh toán..."
  Loading spinner + pulsar effect

Kết quả:
  ✓ Thành công → green checkmark + toast
  ✗ Thất bại → đỏ + "Thử lại" / "Chọn phương thức khác"
  ⏰ Timeout (30s) → "Vẫn đang xử lý. Kiểm tra lại sau hoặc xác nhận thủ công"
```

### 18.4 Form QR / Chuyển khoản

```
[QR VietQR 200px]

Thông tin:
  Ngân hàng:  Techcombank
  Số TK:      1234567890
  Tên TK:     NGUYEN VAN A
  Nội dung:   PAY-20250412-3f7a2b  ← COPY button
  Số tiền:    236,500 ₫

Countdown: "QR hết hạn sau 14:23"

[Xác nhận đã nhận tiền] → dialog:
  Mã giao dịch ngân hàng: [__________]
  [Xác nhận]
```

### 18.5 Split Bill UI

```
Progress bar:
  [████████░░░░░░░░░░░░] 100,000 / 236,500 ₫  (42%)

Danh sách thanh toán đã thu:
  ✓ Tiền mặt        100,000 ₫   15:42

[+ Thêm lần thanh toán] → mở lại form chọn phương thức

Còn lại: 136,500 ₫ (highlighted)
```

---

## 19. Màn hình Bếp (Kitchen Display System)

URL: `/pos/:slug/kitchen`

### 19.1 Layout

```
Background: #F8F6F0
Header: 60px
  Left:  "Bếp — [Tên nhà hàng]"
  Center: Thời gian HH:mm:ss (live clock, monospace lớn)
  Right:  [🔔 Âm thanh ON/OFF]  [Màn hình tối]

Body: Kanban 4 cột, full-height scroll
```

### 19.2 Kanban Columns

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  CHỜ XỬ LÝ     │  ĐANG LÀM      │  XONG          │  ĐÃ PHỤC VỤ   │
│  (N items)      │  (N items)      │  (N items)      │  (N items)      │
│  bg: #FEF9C3    │  bg: #FFF7ED    │  bg: #DCFCE7    │  bg: #F1F5F9    │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│  ┌───────────┐  │  ┌───────────┐  │  ┌───────────┐  │  ┌───────────┐  │
│  │ 🕐 08:12  │  │  │ 🕐 08:15  │  │  │ ✓  08:20  │  │  │ ✓  08:25  │  │
│  │ Bàn 05   │  │  │ Bàn 03   │  │  │ Bàn 07   │  │  │ Bàn 02   │  │  │
│  │ #0023    │  │  │ #0021    │  │  │ #0019    │  │  │ #0018    │  │  │
│  │──────────│  │  │──────────│  │  │──────────│  │  │──────────│  │  │
│  │ Phở bò ×2│  │  │ Bún bò ×1│  │  │ Gỏi cuốn│  │  │ Cơm gà  │  │  │
│  │ !! Không │  │  │ ít cay  │  │  │ ×3       │  │  │ ×1       │  │  │
│  │    hành  │  │  │          │  │  │          │  │  │          │  │  │
│  │──────────│  │  │──────────│  │  │──────────│  │  │──────────│  │  │
│  │ [Bắt đầu]│  │  │ [Xong ✓] │  │  │ [Phục vụ]│  │  │ (done)   │  │  │
│  └───────────┘  │  └───────────┘  │  └───────────┘  │  └───────────┘  │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### 19.3 Card bếp

```
Header card:
  [Thời gian đặt] — [Bàn N / Takeaway] — [Mã đơn]
  Timer đếm ngược kể từ lúc đặt (đỏ nếu > 15 phút)

Body:
  Mỗi món: Tên — Số lượng
  Ghi chú: in đậm cam "!!" prefix nếu có ghi chú đặc biệt

Footer:
  [Bắt đầu làm] → pending → preparing (cột 2)
  [Xong] → preparing → ready (cột 3)
  [Đã phục vụ] → ready → served (cột 4)

Border-left: 4px màu theo thời gian chờ:
  < 10 min: xanh
  10-20 min: vàng
  > 20 min: đỏ (nhấp nháy nhẹ)
```

**Âm thanh thông báo:** Khi có đơn mới vào cột "Chờ xử lý" → ping âm thanh nhẹ

---

# PHẦN V — HÀNH VI & LOGIC

## 20. Luồng người dùng (User Flows)

### 20.1 Owner Onboarding (lần đầu)

```
Đăng ký → Verify email OTP
→ Dashboard (empty state)
→ "Tạo nhà hàng đầu tiên"
→ Wizard 2 bước (thông tin + địa chỉ)
→ Redirect → Settings/Hours → thiết lập giờ
→ Checklist: thêm menu → thêm bàn → tạo QR
→ Preview trang public
→ Bật "Xuất bản"
→ Bật "Nhận đơn online"
→ Chia sẻ link / in QR
```

### 20.2 Staff — Ca làm việc điển hình (Dine-in)

```
Login POS → Sơ đồ bàn (thấy bàn màu sắc live)

Khách đến bàn 05:
→ Click B05 (trống) → right panel mở
→ Chọn món: Phở ×2 + Gỏi cuốn ×1
→ [Gửi vào bếp] (status: confirmed)
→ B05 chuyển màu vàng "Đang dùng"
→ Bếp nhận → Item: preparing → ready
→ Staff phục vụ → Item: served
→ Khách thêm Đồ uống × 2
→ [+] thêm món vào đơn
→ Khách thanh toán: Tiền mặt
→ Thu tiền → "Tiền thối: 13,500 ₫"
→ Xác nhận → Đơn completed
→ B05 chuyển màu tím "Đang dọn"
→ Staff dọn xong → Đổi B05 → Trống
```

### 20.3 Khách tự đặt qua QR

```
Ngồi vào bàn → Quét QR
→ Trang splash "Bàn 05 — Nhà hàng ABC" (1.5s)
→ Redirect menu công khai
→ Duyệt danh mục (scroll + tabs)
→ [+] thêm Phở ×1 + Gỏi cuốn ×1
→ Cart button xuất hiện "2 món — 130,000 ₫"
→ Tap cart → bottom sheet
→ Nhập tên + ghi chú (optional)
→ [Đặt món] → POST /public/orders
→ Success screen "🎉 Đơn đã gửi!"
→ Staff nhận đơn trên POS
```

### 20.4 Luồng Thanh toán Split Bill

```
Bàn 3 người, tổng 300,000 ₫

POS → [Thanh toán] → dialog
→ [Chia bill] toggle ON

Người 1: [Tiền mặt] 100,000 → Xác nhận
  → progress: 100k/300k (33%)

Người 2: [Thẻ] 100,000 → Nhập REF → Xác nhận
  → progress: 200k/300k (67%)

Người 3: [MoMo] 100,000 → Tạo link → QR
  → Khách quét → Webhook → confirmed
  → progress: 300k/300k (100%) ✓
  → [Hoàn tất — In hoá đơn]
  → Đơn: payment_status = paid
  → Bàn → cleaning
```

---

## 21. Phân quyền hiển thị theo Role

### 21.1 Bảng phân quyền UI

| Thành phần | Owner | Staff | Admin | Khách |
|---|:---:|:---:|:---:|:---:|
| Dashboard Admin | ✓ | ✗ | ✓ | ✗ |
| Cài đặt nhà hàng | ✓ | ✗ | ✓ | ✗ |
| Tax rate, Settings JSON | ✓ | ✗ | ✓ | ✗ |
| Thêm/sửa/xoá menu | ✓ | ✗* | ✓ | ✗ |
| Thêm/sửa/xoá bàn | ✓ | ✗ | ✓ | ✗ |
| QR Code token đầy đủ | ✓ | ✗ | ✓ | ✗ |
| Quản lý nhân viên | ✓ | ✗ | ✓ | ✗ |
| Permissions của staff | ✓ | ✗ | ✓ | ✗ |
| POS — Tạo đơn | ✓ | ✓ | ✓ | ✗ |
| POS — Thêm món | ✓ | ✓ | ✓ | ✗ |
| POS — Giảm giá | ✓ | Nếu can_discount | ✓ | ✗ |
| POS — Huỷ đơn (pending) | ✓ | Nếu can_cancel | ✓ | ✗ |
| POS — Huỷ đơn (preparing) | ✓ | ✗ | ✓ | ✗ |
| POS — Huỷ item bất kỳ | ✓ | ✗ | ✓ | ✗ |
| Màn hình bếp | ✓ | ✓ | ✓ | ✗ |
| Menu công khai | ✓ | ✓ | ✓ | ✓ |
| Đặt món online | ✓ | ✓ | ✓ | ✓ |

*Nếu có `can_manage_menu = true`

### 21.2 UI điều chỉnh theo permission

**Staff không có can_discount:**
- Nút "Áp dụng mã giảm giá" bị ẩn hoàn toàn (không disable, không hiện tooltip)

**Staff không có can_cancel_order:**
- Nút "Huỷ đơn" ẩn

**Staff tại bếp:**
- Nút [×] xoá item chỉ hiện với item `pending`
- Item `preparing`/`ready` → không có nút xoá (admin mới xoá được)

**Field ẩn theo role trong response:**
- Tab "Quyền hạn" chỉ owner/admin thấy
- Cột "Thuế suất" trong bảng đơn chỉ owner/admin thấy

---

## 22. Xử lý trạng thái & lỗi

### 22.1 Loading States

```
Page load:         Skeleton theo layout trang (không spinner toàn trang)
Button action:     Spinner 16px thay text + disabled
Form submit:       Button loading + form disabled
Data fetch:        Skeleton grid/list
Polling:           Dots animation "Đang chờ..."
```

### 22.2 Error Handling

```
400 Bad Request:
  → Hiển thị lỗi inline gần field liên quan
  → Hoặc toast warning với thông điệp cụ thể

401 Unauthorized:
  → Redirect /auth/login với param ?redirect=current_url
  → Toast info "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại"

403 Forbidden:
  → Toast error "Bạn không có quyền thực hiện hành động này"
  → Không redirect

404 Not Found:
  → Trang 404 riêng: icon + "Trang không tìm thấy" + [Về trang chủ]

409 Conflict:
  → Toast warning + thông điệp cụ thể (VD: "Slug đã được sử dụng")

422 Unprocessable:
  → Highlight từng field bị lỗi (red border + error text)
  → Focus vào field lỗi đầu tiên

429 Rate Limit:
  → Toast warning "Quá nhiều yêu cầu. Thử lại sau {X} giây"
  → Button disabled với countdown

500 Server Error:
  → Toast error "Lỗi hệ thống. Vui lòng thử lại sau"
  → Option "Báo cáo lỗi"

Network offline:
  → Banner sticky top: "⚠ Mất kết nối — Đang thử kết nối lại..."
```

### 22.3 Unsaved Changes Guard

```
Khi user navigate ra khỏi form đang có thay đổi:
→ Dialog xác nhận:
  "Bạn có thay đổi chưa lưu"
  "Rời khỏi trang này sẽ mất các thay đổi"
  [Ở lại] [Rời khỏi trang]

Áp dụng cho: settings/general, settings/hours, settings/financial,
             staff/new, staff/:id, menu/items/:id
```

### 22.4 Optimistic Updates

```
Toggle is_active / is_available / is_featured:
  → Cập nhật UI ngay lập tức (không chờ API)
  → Nếu API lỗi → rollback + toast error

Cập nhật số lượng món trong cart POS:
  → UI cập nhật ngay
  → API gọi ngầm
  → Nếu lỗi → rollback + toast
```

---

## 23. Bảng ánh xạ Route ↔ API

| Route UI | Method | API Endpoint | Ghi chú |
|---|---|---|---|
| `/auth/register` | POST | `/auth/register` | |
| `/auth/register` (blur email) | POST | `/auth/check-email` | |
| `/auth/verify-email` | POST | `/auth/verify-otp` | |
| `/auth/verify-email` (resend) | POST | `/auth/resend-otp` | |
| `/auth/login` | POST | `/auth/login` | |
| `/auth/2fa` | POST | `/auth/2fa/send-otp`, `/auth/2fa/verify` | |
| `/auth/forgot-password` | POST | `/auth/forgot-password` | |
| `/auth/reset-password/verify` | POST | `/auth/reset-password/verify-otp` | |
| `/auth/reset-password` | POST | `/auth/reset-password` | |
| `/dashboard/account/security` (2FA) | POST | `/auth/2fa/enable`, `/auth/2fa/disable` | |
| `/dashboard/account/sessions` | GET/DELETE | `/auth/sessions`, `/auth/sessions/:id` | |
| `/public/restaurants` | GET | `/public/restaurants?city=...` | |
| `/public/restaurants/:slug` | GET | `/public/restaurants/:slug` | |
| `/public/restaurants/:slug/menu` | GET | `/public/restaurants/:slug/menu` | |
| `/public/restaurants/:slug/menu/search` | GET | `/public/restaurants/:slug/menu/search?q=` | |
| `/public/tables/:qrCode` | GET | `/public/tables/:qrCode` | |
| `/dashboard/restaurants` | GET | `/restaurants` | |
| `/dashboard/restaurants/new` (slug check) | POST | `/restaurants/check-slug` | |
| `/dashboard/restaurants/new` | POST | `/restaurants` | |
| `/dashboard/restaurants/:id` | GET | `/restaurants/:id` | |
| `/settings/general` | PATCH | `/restaurants/:id` | |
| `/settings/hours` | PATCH | `/restaurants/:id/hours` | |
| `/settings/financial` | PATCH | `/restaurants/:id/financial` | |
| `/settings/system` | PATCH | `/restaurants/:id/settings` | |
| `/settings/images` (logo) | PUT | `/restaurants/:id/logo` | |
| `/settings/images` (cover) | PUT | `/restaurants/:id/cover` | |
| `/settings/images` (gallery add) | POST | `/restaurants/:id/gallery` | |
| `/settings/images` (gallery del) | DELETE | `/restaurants/:id/gallery/:index` | |
| `/settings/publish` (toggle) | PATCH | `/restaurants/:id/publish` | |
| `/settings/publish` (online) | PATCH | `/restaurants/:id/online-orders` | |
| `/settings/publish` (delete) | DELETE | `/restaurants/:id` | |
| `menu/categories` | GET | `/restaurants/:id/menu/categories` | |
| `menu/categories/new` | POST | `/restaurants/:id/menu/categories` | |
| `menu/categories/:catId` | PATCH | `/restaurants/:id/menu/categories/:catId` | |
| `menu/categories/:catId` (toggle) | PATCH | `/restaurants/:id/menu/categories/:catId/toggle` | |
| `menu/categories/reorder` | PATCH | `/restaurants/:id/menu/categories/reorder` | |
| `menu/categories/:catId` (delete) | DELETE | `/restaurants/:id/menu/categories/:catId` | |
| `menu/items` | GET | `/restaurants/:id/menu/items` | |
| `menu/items/new` | POST | `/restaurants/:id/menu/items` | |
| `menu/items/:itemId` | PATCH | `/restaurants/:id/menu/items/:itemId` | |
| `menu/items/:itemId` (availability) | PATCH | `/restaurants/:id/menu/items/:itemId/availability` | |
| `menu/items/:itemId` (featured) | PATCH | `/restaurants/:id/menu/items/:itemId/featured` | |
| `menu/items/:itemId` (image add) | POST | `/restaurants/:id/menu/items/:itemId/images` | |
| `menu/items/:itemId` (image del) | DELETE | `/restaurants/:id/menu/items/:itemId/images/:index` | |
| `menu/items/reorder` | PATCH | `/restaurants/:id/menu/items/reorder` | |
| `menu/items/:itemId` (delete) | DELETE | `/restaurants/:id/menu/items/:itemId` | |
| `tables/` | GET | `/restaurants/:id/tables` | |
| `tables/new` | POST | `/restaurants/:id/tables` | |
| `tables/:tableId` | GET/PATCH | `/restaurants/:id/tables/:tableId` | |
| `tables/:tableId` (status) | PATCH | `/restaurants/:id/tables/:tableId/status` | |
| `tables/:tableId` (toggle) | PATCH | `/restaurants/:id/tables/:tableId/toggle` | |
| `tables/:tableId` (QR) | POST | `/restaurants/:id/tables/:tableId/qr` | |
| `tables/:tableId` (delete) | DELETE | `/restaurants/:id/tables/:tableId` | |
| `staff/` | GET | `/restaurants/:id/staff` | |
| `staff/new` | POST | `/restaurants/:id/staff` | |
| `staff/:staffId` | GET/PATCH | `/restaurants/:id/staff/:staffId` | |
| `staff/:staffId` (status) | PATCH | `/restaurants/:id/staff/:staffId/status` | |
| `staff/:staffId` (permissions) | PATCH | `/restaurants/:id/staff/:staffId/permissions` | |
| `staff/:staffId` (avatar) | PUT | `/restaurants/:id/staff/:staffId/avatar` | |
| `staff/:staffId` (link) | PATCH | `/restaurants/:id/staff/:staffId/link-account` | |
| `staff/:staffId` (delete) | DELETE | `/restaurants/:id/staff/:staffId` | |
| `orders/` | GET | `/restaurants/:id/orders` | |
| `orders/:orderId` | GET | `/restaurants/:id/orders/:orderId` | |
| `orders/:orderId` (status) | PATCH | `/restaurants/:id/orders/:orderId/status` | |
| `orders/:orderId` (discount) | PATCH | `/restaurants/:id/orders/:orderId/discount` | |
| `orders/:orderId` (cancel) | PATCH | `/restaurants/:id/orders/:orderId/cancel` | |
| POS — tạo đơn | POST | `/restaurants/:id/orders` | |
| POS — thêm món | POST | `/restaurants/:id/orders/:orderId/items` | |
| POS — sửa món | PATCH | `/restaurants/:id/orders/:orderId/items/:itemId` | |
| POS — huỷ món | DELETE | `/restaurants/:id/orders/:orderId/items/:itemId` | |
| POS — item status (bếp) | PATCH | `/restaurants/:id/orders/:orderId/items/:itemId/status` | |
| POS — active order | GET | `/restaurants/:id/tables/:tableId/active-order` | |
| Đặt món public | POST | `/public/orders` | |
| Thanh toán cash | POST | `/payments/cash` | |
| Thanh toán thẻ | POST | `/payments/card` | |
| Thanh toán QR | POST | `/payments/qr` | |
| Thanh toán QR (confirm) | POST | `/payments/:id/confirm` | |
| Gateway initiate | POST | `/payments/gateway/initiate` | |
| Gateway polling | GET | `/payments/:id/status` | |
| Hoàn tiền | POST | `/payments/:id/refund` | |
| Huỷ payment | POST | `/payments/:id/cancel` | |
| Lịch sử payment | GET | `/orders/:orderId/payments` | |

---

*Tài liệu thiết kế UI/UX v2.0 — Cập nhật: 2025*
*Duy trì đồng bộ với API Documentation. Mọi thay đổi API cần review lại phần tương ứng.*