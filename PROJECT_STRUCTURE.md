# Project Structure - Kas Kelas

## Overview
Aplikasi manajemen kas kelas menggunakan Next.js 14, Supabase, dan TypeScript.

## Directory Structure

```
kas-kelas-final/
├── app/                      # Next.js 14 app directory
│   ├── api/                  # API routes
│   │   └── webhook/          # Webhook endpoints
│   ├── dashboard/            # Dashboard pages
│   │   ├── activities/       # Activity logs
│   │   ├── broadcast-tagihan/# WhatsApp broadcast
│   │   ├── expenses/         # Expense management
│   │   ├── laporan-keuangan/ # Financial reports
│   │   ├── payments/         # Payment management
│   │   ├── profile/          # User profile
│   │   ├── settings/         # App settings
│   │   ├── students/         # Student management
│   │   └── whatsapp/         # WhatsApp templates
│   ├── login/                # Login page
│   ├── payment-success/      # Payment success page
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── dashboard/            # Dashboard components
│   ├── layout/               # Layout components
│   ├── payments/             # Payment components
│   ├── providers/            # Context providers
│   ├── reports/              # Report components
│   ├── students/             # Student components
│   ├── ui/                   # UI components
│   └── whatsapp/             # WhatsApp components
├── lib/                      # Utility functions & services
│   ├── activity-service.ts   # Activity logging
│   ├── balanceService.ts     # Balance calculations
│   ├── constants.ts          # App constants
│   ├── date-utils.ts         # Date utilities
│   ├── expense-service.ts    # Expense management
│   ├── pakasir.ts            # Payment gateway
│   ├── reportTemplates.ts    # Report templates
│   ├── settings-service.ts   # Settings management
│   ├── starsender-service.ts # WhatsApp service
│   ├── starsender.ts         # WhatsApp gateway
│   ├── student-service.ts    # Student management
│   ├── supabase-auth.ts      # Authentication
│   ├── supabase.ts           # Database client
│   └── utils.ts              # General utilities
├── types/                    # TypeScript types
│   └── index.ts              # Centralized types
├── database/                 # Database scripts
│   ├── sql-scripts/          # SQL files
│   └── README.md             # Database docs
├── docs/                     # Documentation
├── public/                   # Static assets
│   └── robots.txt            # SEO robots file
├── .env.example              # Environment template
├── .env.local.example        # Local env template
├── .eslintrc.json            # ESLint config
├── .gitignore                # Git ignore
├── BUG_TRACKER.md            # Bug tracking
├── middleware.ts             # Auth middleware
├── next.config.js            # Next.js config
├── package.json              # Dependencies
├── README.md                 # Project readme
├── SUPABASE_SETUP.md         # Supabase guide
├── tailwind.config.js        # Tailwind config
├── test-supabase.js          # Connection test
├── tsconfig.json             # TypeScript config
└── vercel.json               # Vercel config
```

## Key Features

### 1. Authentication & Authorization
- Custom authentication using `app_users` table
- Session management with `user_sessions` table
- Role-based access (admin, bendahara, user)
- Middleware protection for routes

### 2. Student Management
- CRUD operations for students
- Active/inactive status
- Parent contact information

### 3. Payment Management
- Create individual/bulk payments
- Integration with Pakasir payment gateway
- Payment status tracking
- Payment history

### 4. Expense Management
- Record expenses with categories
- Upload receipts
- Approval workflow
- Expense reports

### 5. WhatsApp Integration
- Send payment reminders
- Broadcast messages
- Message templates
- Delivery tracking

### 6. Financial Reports
- Monthly reports
- Income vs expense charts
- Balance tracking
- Export to PDF

### 7. Activity Logging
- Track all user actions
- Audit trail
- Activity timeline

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom auth with Supabase
- **Payment Gateway**: Pakasir
- **WhatsApp**: StarSender API
- **Deployment**: Vercel

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STARSENDER_API_KEY` (optional)
- `PAKASIR_SLUG` (optional)
- `PAKASIR_API_KEY` (optional)

## Getting Started

1. Clone repository
2. Install dependencies: `npm install`
3. Setup environment variables
4. Run database scripts in Supabase
5. Start development: `npm run dev`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript

## Deployment

The app is configured for deployment on Vercel. Push to main branch for automatic deployment.