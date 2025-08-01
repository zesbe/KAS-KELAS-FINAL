# 🏫 KasKelas - Sistem Manajemen Kas Kelas Modern

> Platform otomatis untuk mengelola kas kelas 1 SD dengan fitur WhatsApp, pembayaran digital, dan laporan transparan

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-green?style=flat-square&logo=supabase)](https://supabase.com/)

## 🎯 **Overview**

KasKelas adalah aplikasi web lengkap yang dirancang khusus untuk mengelola uang kas kelas 1 SD dengan sistem yang 100% otomatis. Aplikasi ini mengintegrasikan **Pakasir** untuk pembayaran digital dan **Wapanels** untuk notifikasi WhatsApp otomatis.

### ✨ **Fitur Utama**
- 🤖 **100% Otomatis** - Tagihan, reminder, dan konfirmasi otomatis
- 💳 **Pembayaran Digital** - Integrasi Pakasir (Bank, E-Wallet, QRIS)  
- 📱 **WhatsApp Otomatis** - Notifikasi langsung ke orang tua
- 📊 **Dashboard Real-time** - Overview kas dan statistik live
- 👥 **Manajemen Siswa** - CRUD lengkap dengan bulk operations
- 📈 **Laporan Transparan** - Export PDF untuk orang tua
- 🔐 **Keamanan Tinggi** - RLS Supabase + Input validation

---

## 🏗️ **Tech Stack**

### **Frontend**
- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Recharts** - Interactive charts

### **Backend & Integration**
- **Supabase** - Database, Auth, Real-time
- **Pakasir API** - Payment gateway
- **Wapanels API** - WhatsApp messaging
- **React Hook Form** - Form handling
- **Zod** - Schema validation

---

## 🚀 **Quick Start**

### **1. Clone Repository**
```bash
git clone https://github.com/zesbe/KAS-KELAS-FINAL.git
cd KAS-KELAS-FINAL
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
```bash
# Copy environment variables
cp .env.example .env.local

# Edit .env.local dengan credentials yang disediakan
```

### **4. Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

---

## 🔧 **Configuration**

### **Environment Variables**
File `.env.local` sudah dikonfigurasi dengan credentials:

```bash
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://snrjuiwipgnbcxgggeiq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Pakasir Payment Gateway  
PAKASIR_SLUG=uangkasalhusna
PAKASIR_API_KEY=u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg

# Wapanels WhatsApp Gateway
WAPANELS_APPKEY=2c1b9df7-8ae4-4dc7-a50e-e16f78af0509
WAPANELS_AUTHKEY=9hoO4xHDJjW0BmvGGhvU2s6JiKuN76D7QU1n0JIYQ194VbKXzp
```

---

## 📱 **Fitur Lengkap**

### 🏠 **Dashboard Bendahara**
- Overview saldo kas real-time
- Grafik pemasukan vs pengeluaran
- Recent activities timeline
- Quick actions untuk fitur utama
- Alert system untuk pembayaran terlambat

### 👥 **Manajemen Siswa**
- CRUD lengkap dengan validation
- Search & filter advanced
- Bulk WhatsApp messaging
- Import/Export data Excel
- Parent contact management

### 💳 **Sistem Pembayaran**
- Multi-step payment creation wizard
- Auto-generate Pakasir payment URLs
- Real-time payment status tracking
- Bulk reminder system
- Payment method tracking (QRIS, Bank, E-Wallet)

### 📱 **WhatsApp Automation**
- **Tagihan Bulanan** dengan payment link
- **Reminder Bertingkat** (H-3, H-0, H+3, H+7)
- **Konfirmasi Otomatis** saat pembayaran masuk
- **Broadcast** pengumuman ke semua orang tua
- **Template Customizable** untuk berbagai occasion

### 📊 **Laporan & Analytics**
- Monthly cashflow reports
- Payment completion statistics
- Expense categorization
- Export to PDF/Excel
- Real-time dashboard updates

---

## 🎨 **User Interface**

### **Design System**
- **Mobile-First** responsive design
- **Child-Friendly** color scheme (Blue-Green gradient)
- **Intuitive** navigation with clear iconography
- **Accessible** with proper ARIA labels
- **Loading States** untuk better UX

### **Component Library**
```tsx
// Example usage
import { Button, Card, Badge } from '@/components/ui'

<Button variant="primary" loading={isLoading}>
  Buat Tagihan
</Button>

<Card>
  <CardHeader>
    <CardTitle>Student Data</CardTitle>
  </CardHeader>
  <CardContent>
    Content here...
  </CardContent>
</Card>

<Badge variant="success">Lunas</Badge>
```

---

## 🔄 **Payment Flow Integration**

### **1. Pakasir Integration**
```typescript
// Auto-generate payment URL
const paymentUrl = generatePaymentUrl(25000, 'KAS202408001')
// Result: https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202408001

// Webhook handling
const webhook = validateWebhookPayload(request.body)
if (webhook.status === 'completed') {
  // Update payment status
  await updatePaymentStatus(webhook.order_id, 'completed')
}
```

### **2. WhatsApp Automation**
```typescript
// Send payment notification
const message = tagihanTemplate({
  nama_siswa: 'Ahmad Rizki',
  nominal: 25000,
  jatuh_tempo: '5 Agustus 2024',
  payment_link: paymentUrl
})

await sendWhatsAppMessage('628123456789', message)
```

---

## 📋 **API Routes**

### **Payment Management**
```typescript
// Create bulk payments
POST /api/payments/bulk
{
  "student_ids": ["1", "2", "3"],
  "amount": 25000,
  "due_date": "2024-08-05",
  "send_whatsapp": true
}

// Pakasir webhook
POST /api/webhooks/pakasir
{
  "order_id": "KAS202408001",
  "status": "completed",
  "amount": 25000,
  "payment_method": "qris"
}
```

### **WhatsApp Integration**
```typescript
// Send bulk reminders
POST /api/whatsapp/reminder
{
  "student_ids": ["1", "2"],
  "message_type": "overdue"
}

// Broadcast message
POST /api/whatsapp/broadcast  
{
  "message": "Rapat orang tua besok pukul 19.00",
  "recipients": "all_parents"
}
```

---

## 🗂️ **Project Structure**

```
KAS-KELAS-FINAL/
├── 📄 README.md                    # Documentation
├── 📁 app/                         # Next.js App Router
│   ├── 📄 layout.tsx               # Root layout
│   ├── 📄 page.tsx                 # Landing page
│   └── 📁 dashboard/               # Dashboard routes
│       ├── 📄 page.tsx             # Main dashboard  
│       ├── 📁 students/            # Student management
│       └── 📁 payments/            # Payment management
├── 📁 components/                  # Reusable components
│   ├── 📁 ui/                      # Base UI components
│   ├── 📁 layout/                  # Layout components
│   ├── 📁 dashboard/               # Dashboard components
│   ├── 📁 students/                # Student components
│   └── 📁 payments/                # Payment components
└── 📁 lib/                        # Utilities & integrations
    ├── 📄 supabase.ts              # Database client
    ├── 📄 pakasir.ts               # Payment gateway
    ├── 📄 wapanels.ts              # WhatsApp gateway
    └── 📄 utils.ts                 # Common utilities
```

---

## 🧪 **Sample Data**

Aplikasi dilengkapi dengan 25 data siswa sample dan berbagai skenario pembayaran:

```typescript
// Sample students dengan data lengkap
const students = [
  {
    nama: "Ahmad Rizki Pratama",
    nomor_absen: 1,
    nomor_hp_ortu: "628123456789",
    nama_ortu: "Budi Santoso",
    email_ortu: "budi.santoso@email.com"
  }
  // ... 24 more students
]

// Sample payments dengan berbagai status
const payments = [
  {
    order_id: "KAS202408001",
    amount: 25000,
    status: "completed", // lunas
    payment_method: "qris"
  },
  {
    order_id: "KAS202408002", 
    amount: 25000,
    status: "pending", // belum bayar
    due_date: "2024-08-05"
  }
  // ... more payment scenarios
]
```

---

## 🛠️ **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

### **Code Quality**
- **ESLint** untuk code linting
- **TypeScript** untuk type safety
- **Prettier** untuk code formatting
- **Conventional Commits** untuk commit messages

---

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Environment Variables (Production)**
Pastikan semua environment variables telah dikonfigurasi di platform deployment:
- Supabase credentials
- Pakasir API settings  
- Wapanels WhatsApp credentials

---

## 📚 **Documentation**

- 📖 **[Project Explorer](PROJECT_EXPLORER.md)** - Detailed project structure
- 🐛 **[Bug Fixes & Troubleshooting](BUGFIXES_AND_TROUBLESHOOTING.md)** - Common issues & solutions
- 🎨 **[Design System](docs/design-system.md)** - UI components guide
- 🔧 **[API Reference](docs/api-reference.md)** - API endpoints documentation

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 **Team**

- **Developer**: Claude (Anthropic AI)
- **For**: Kelas 1A - SD Indonesia
- **Contact**: bendahara@sd-indonesia.sch.id

---

## 🙏 **Acknowledgments**

- **Next.js Team** untuk framework yang luar biasa
- **Supabase** untuk backend-as-a-service yang powerful
- **Pakasir** untuk payment gateway integration
- **Wapanels** untuk WhatsApp API service
- **Tailwind CSS** untuk utility-first CSS framework

---

## 📞 **Support**

Jika mengalami kendala atau butuh bantuan:

1. 📖 Baca [Troubleshooting Guide](BUGFIXES_AND_TROUBLESHOOTING.md)
2. 🔍 Check [Project Explorer](PROJECT_EXPLORER.md) untuk navigasi
3. 💬 Hubungi tim development
4. 📧 Email: support@kas-kelas.app

---

**Dibuat dengan ❤️ untuk pendidikan Indonesia**