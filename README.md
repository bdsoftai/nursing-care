# 📋 Nurse Helping Home

> জরুরি প্রয়োজনে সরাসরি নার্স বেছে নিন — A complete healthcare marketplace connecting customers with verified nurses in Bangladesh.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🎯 Overview

Nurse Helping Home একটি full-stack web application যেখানে:

- 🏥 **Customers** সরাসরি নার্স বুক করতে পারে
- 🧑‍⚕️ **Nurses** নিজে register করে admin approval-এর পর কাজ করতে পারে
- 🔐 **Admins** সম্পূর্ণ system manage করতে পারে

---

## ✨ Features

### 👤 Customer Features

- ✅ Phone-based silent login (no password required)
- ✅ Optional email + password for recovery
- ✅ Browse approved nurses from database
- ✅ Filter by area, category, hospital
- ✅ Quick booking with auto-fill form
- ✅ View booking history
- ✅ Personal dashboard with stats
- ✅ WhatsApp direct contact with nurses

### 🧑‍⚕️ Nurse Features

- ✅ Self-registration with file upload
- ✅ Email + password authentication
- ✅ Admin approval workflow
- ✅ Personal dashboard with assignments
- ✅ Booking history (own)
- ✅ Profile management
- ✅ Available/Busy status toggle

### 🔐 Admin Features

- ✅ Email + password + admin code login
- ✅ Single-page dashboard with sidebar
- ✅ Nurse management (approve/edit/delete)
- ✅ Hospital CRUD operations
- ✅ Booking status management
- ✅ Customer list view
- ✅ Role-based access (Super Admin / Operations Admin)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router) + Turbopack |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS 4 + Dark Mode |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Supabase Storage (nurses bucket) |
| **Auth** | Custom session-based (3 roles) |
| **Password** | bcryptjs |
| **State** | React Context + Hooks |
| **Notifications** | Custom Toast system |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
nursing-care/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx       # Single-page admin panel
│   │   │   ├── login/page.tsx           # Admin login
│   │   │   └── admins/new/page.tsx      # Create new admin (super only)
│   │   ├── api/                          # 30+ REST API routes
│   │   │   ├── admin/
│   │   │   │   ├── admins/route.ts
│   │   │   │   ├── bookings/[id]/route.ts
│   │   │   │   ├── customers/route.ts
│   │   │   │   ├── hospitals/[id]/route.ts
│   │   │   │   ├── hospitals/route.ts
│   │   │   │   ├── nurses/[id]/approve/route.ts
│   │   │   │   ├── nurses/[id]/route.ts
│   │   │   │   └── nurses/route.ts
│   │   │   ├── auth/
│   │   │   │   ├── admin/route.ts
│   │   │   │   ├── customer/route.ts
│   │   │   │   ├── login/route.ts
│   │   │   │   └── nurse/route.ts
│   │   │   ├── bookings/[id]/route.ts
│   │   │   ├── bookings/route.ts
│   │   │   ├── categories/route.ts
│   │   │   ├── customers/route.ts
│   │   │   ├── hospitals/[id]/toggle/route.ts
│   │   │   ├── hospitals/route.ts
│   │   │   ├── nurse/bookings/route.ts
│   │   │   ├── nurses/register/route.ts
│   │   │   ├── nurses/route.ts
│   │   │   └── upload/route.ts
│   │   ├── nurse/
│   │   │   ├── [id]/page.tsx             # Public nurse profile
│   │   │   ├── bookings/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── booking/[id]/page.tsx
│   │   ├── dashboard/page.tsx            # Customer dashboard
│   │   ├── login/page.tsx                # Customer login
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx                      # Home page
│   ├── components/
│   │   ├── AdminGuard.tsx
│   │   ├── CustomerGuard.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── NurseGuard.tsx
│   │   ├── NurseLoginModal.tsx           # Login + Signup modal
│   │   ├── QuickBookingModal.tsx
│   │   ├── SaveToast.tsx
│   │   └── ThemeToggle.tsx
│   ├── context/
│   │   ├── AdminContext.tsx
│   │   ├── CustomerContext.tsx
│   │   └── NurseContext.tsx
│   ├── data/
│   │   └── nurses.ts                     # Static fallback data
│   ├── lib/
│   │   ├── auth/
│   │   │   └── password.ts               # bcrypt wrapper
│   │   └── db/
│   │       ├── index.ts                  # Adapter selector
│   │       ├── supabase.ts               # Supabase adapter
│   │       └── types.ts                  # IDatabaseAdapter interface
│   ├── services/
│   │   ├── adminService.ts
│   │   ├── bookingService.ts
│   │   ├── customerService.ts
│   │   └── nurseService.ts
│   └── types/
│       └── index.ts                      # All TypeScript types
├── public/
├── .env.local.example
├── .gitignore
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org))
- **pnpm** 9+ (`npm install -g pnpm`)
- **Supabase** account ([Sign up free](https://supabase.com))

### Installation

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/nurse-helping-home.git
cd nurse-helping-home

# 2. Install dependencies
pnpm install

# 3. Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### Environment Variables

`.env.local` ফাইলে যোগ করুন:

```bash
# ═══════════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════════
DATABASE_PROVIDER=supabase

# ═══════════════════════════════════════════
# SUPABASE
# ═══════════════════════════════════════════
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**কোথায় পাবেন:**

- Supabase Dashboard → **Settings** → **API**
- `Project URL` → `SUPABASE_URL`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Database Setup

Supabase SQL Editor-এ চালান:

```sql
-- ═══════════════════════════════════════════
-- CUSTOMERS
-- ═══════════════════════════════════════════
create table customers (
  id uuid primary key default gen_random_uuid(),
  customer_code text unique,
  name text not null,
  phone text unique not null,
  address text,
  email text,
  password_hash text,
  email_verified boolean default false,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- NURSES
-- ═══════════════════════════════════════════
create table nurses (
  id uuid primary key default gen_random_uuid(),
  nurse_code text unique not null,
  name text not null,
  phone text unique not null,
  email text unique not null,
  password_hash text not null,
  category_code text,
  hospital_id uuid,
  area text,
  address text,
  rating numeric default 0,
  image_url text,
  is_approved boolean default false,
  approved_by uuid,
  approved_at timestamptz,
  is_available boolean default true,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- HOSPITALS
-- ═══════════════════════════════════════════
create table hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  location text,
  address text,
  phone text,
  email text,
  website text,
  is_active boolean default true,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- BOOKINGS
-- ═══════════════════════════════════════════
create table bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text unique,
  customer_id uuid not null references customers(id),
  customer_name text,
  customer_phone text,
  customer_address text,
  nurse_id text not null,
  nurse_name text,
  nurse_image text,
  nurse_phone text,
  booking_date timestamptz default now(),
  status text default 'pending',
  price numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- ADMINS
-- ═══════════════════════════════════════════
create table admins (
  id uuid primary key default gen_random_uuid(),
  admin_code text unique not null,
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('operations_admin', 'super_admin')),
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- CATEGORIES
-- ═══════════════════════════════════════════
create table categories (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_en text not null,
  name_bn text not null,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- STORAGE BUCKET
-- ═══════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('nurses', 'nurses', true)
on conflict (id) do nothing;

create policy "Public read nurses"
on storage.objects for select
using (bucket_id = 'nurses');

-- ═══════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════

-- Categories
insert into categories (code, name_en, name_bn, sort_order) values
  ('hospital-affiliated', 'Hospital-Affiliated', 'হাসপাতাল-সংযুক্ত', 1),
  ('independent', 'Independent', 'স্বাধীন', 2),
  ('hospital-exclusive', 'Hospital-Exclusive', 'হাসপাতাল-এক্সক্লুসিভ', 3)
on conflict (code) do nothing;

-- Hospitals
insert into hospitals (name, name_en, location) values
  ('আপন হাসপাতাল', 'Apon Hospital', 'Dhanmondi'),
  ('ইউনাইটেড হাসপাতাল', 'United Hospital', 'Gulshan'),
  ('উত্তরা আধুনিক হাসপাতাল', 'Uttara Modern Hospital', 'Uttara'),
  ('উত্তরা সেন্ট্রাল হাসপাতাল', 'Uttara Central Hospital', 'Uttara'),
  ('এভারকেয়ার হাসপাতাল', 'Evercare Hospital', 'Bashundhara'),
  ('ল্যাবএইড হাসপাতাল', 'LabAid Hospital', 'Dhanmondi'),
  ('স্কয়ার হাসপাতাল', 'Square Hospital', 'Dhanmondi')
on conflict do nothing;

-- First Super Admin (password: admin123)
insert into admins (admin_code, name, email, password_hash, role)
values (
  'ADM1001',
  'Super Admin',
  'admin@nursehelp.com',
  '$2b$10$napQmmghZSVi.MtZ0IPEHOxu6ceX3psH19oQ29p3Vuf6Y/ctqMkqq',
  'super_admin'
)
on conflict (admin_code) do nothing;
```

### Run Development Server

```bash
pnpm run dev
```

Browser-এ খুলুন: **http://localhost:3000**

---

## 🔑 Default Credentials

### Admin Login

```
URL:       http://localhost:3000/admin/login
Email:     admin@nursehelp.com
Password:  admin123
Code:      ADM1001
```

### Customer Login

```
URL:       http://localhost:3000/login
Type:      Phone (silent login, no password)
Example:   01712345678
```

### Nurse Login

```
URL:       Home page → 🧑‍⚕️ নার্স লগইন button → Modal
Type:      Email + Password
Note:      Admin approval required
```

---

## 🔌 API Endpoints

### Auth (4)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/customer` | Customer silent login |
| POST | `/api/auth/nurse` | Nurse email/password login |
| POST | `/api/auth/admin` | Admin email+password+code login |
| POST | `/api/auth/login` | Legacy customer login |

### Customer (4)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers?id=xxx` | Get customer info |
| GET | `/api/bookings?customerId=xxx` | Customer's bookings |
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings/[id]` | Single booking |

### Nurse (3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/nurses` | All approved nurses |
| POST | `/api/nurses/register` | Nurse self-registration |
| GET | `/api/nurse/bookings?nurseId=xxx` | Nurse's bookings |

### Admin (10)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/nurses` | List/Create nurses |
| PATCH/DELETE | `/api/admin/nurses/[id]` | Update/Delete nurse |
| POST | `/api/admin/nurses/[id]/approve` | Approve nurse |
| GET/POST | `/api/admin/hospitals` | List/Create hospitals |
| PATCH/DELETE | `/api/admin/hospitals/[id]` | Update/Delete hospital |
| GET | `/api/admin/customers` | All customers |
| GET | `/api/admin/bookings` | All bookings |
| PATCH | `/api/admin/bookings/[id]` | Update booking status |
| POST | `/api/admin/admins` | Create new admin |

### Utility (4)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Public categories |
| GET/POST | `/api/hospitals` | Public hospitals |
| POST | `/api/hospitals/[id]/toggle` | Toggle active |
| POST | `/api/upload` | File upload to storage |

---

## 🎨 Design System

### Color Scheme

| Role | Color | Usage |
|------|-------|-------|
| Customer | 🔵 Blue | Login, dashboard |
| Nurse | 🟢 Teal | Login, dashboard |
| Admin | ⚫ Slate | Login, dashboard |
| Success | 🟢 Green | Available, confirmed |
| Warning | 🟡 Amber | Pending |
| Error | 🔴 Red | Busy, cancelled |

### Dark Mode

- ✅ Full dark mode support
- ✅ Toggle in header
- ✅ LocalStorage persistence
- ✅ System preference detection

---

## 🔒 Security

| Feature | Implementation |
|---------|---------------|
| **Password hashing** | bcryptjs (10 rounds) |
| **Admin verification** | Email + Password + Admin Code |
| **Nurse approval** | Admin must approve before login |
| **Session storage** | localStorage (browser-only) |
| **API authentication** | Server-side validation |
| **File upload** | Type + size validation (5MB, image only) |
| **CORS** | Vercel handles |
| **RLS** | Supabase Row-Level Security ready |

---

## 🧪 Testing Flow

### Customer Test

```
1. Home page → Click "📋 বুক" on any nurse
2. Fill form (name, phone, address)
3. Submit → Auto-register + booking
4. Redirect to /dashboard
5. View booking history
```

### Nurse Test

```
1. Home page → Click "🧑‍⚕️ নার্স লগইন"
2. Click "📝 রেজিস্ট্রেশন" tab
3. Fill form + upload image
4. Submit → Success message
5. Admin approves → Login with password
6. View dashboard
```

### Admin Test

```
1. Visit /admin/login
2. Enter email + password + admin code
3. Dashboard → Sidebar navigation
4. Manage nurses, hospitals, bookings
5. View customers
```

---

## 🚀 Deployment

### Vercel Deploy

1. **Push to GitHub:**

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. **Connect to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Add environment variables:
     - `DATABASE_PROVIDER`
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Deploy

3. **Custom Domain (Optional):**
   - Vercel Dashboard → Settings → Domains
   - Add your domain

---

## 🛠️ Scripts

```bash
pnpm run dev      # Start dev server
pnpm run build    # Production build
pnpm run start    # Start production server
pnpm run lint     # Run ESLint
```

---

## 🗺️ Roadmap

### ✅ Done

- [x] Customer authentication
- [x] Nurse registration + approval
- [x] Admin dashboard
- [x] Booking system
- [x] Image upload
- [x] 3-way auth

### 🔜 Upcoming

- [ ] Payment integration (bKash/Nagad)
- [ ] SMS notifications
- [ ] Rating & review system
- [ ] Mobile app (React Native)
- [ ] Nurse verification
- [ ] Advanced analytics

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**BdSoft Project**

- GitHub: [@your-username](https://github.com/your-username)
- Email: your-email@example.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel](https://vercel.com)

---

## 📞 Support

For support, email contact.bdsoft.org@gmail.com
 open an issue.

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ in Bangladesh 🇧🇩

</div>