Tolong buatkan aplikasi web lengkap untuk mengelola uang kas kelas 1 SD dan file halaman utaman sudah ada tinggal kamu lanjutkan file yang belum ada, dengan spesifikasi berikut:

## 🎯 **Konteks & Peran**
- Saya adalah koordinator kelas (korlas) dan bendahara kelas 1 SD
- Mengelola uang kas dari 25-30 siswa
- Perlu sistem yang mudah digunakan dan otomatis
- Orang tua siswa bisa melihat laporan transparan

## 🔧 **Tech Stack & Deployment**
- **Backend**: **Supabase** (Database + Auth + Edge Functions + Real-time)
- **Frontend**: **Next.js 14** dengan Tailwind CSS
- **Authentication**: Supabase Auth dengan Row Level Security (RLS)
- **Payment Gateway**: **Pakasir API** (credentials provided)
- **WhatsApp Gateway**: **Wapanels API** (credentials provided)
- **Frontend Deployment**: **Vercel** (optimal untuk Next.js)
- **Backend**: **Supabase Edge Functions** untuk webhook handling
- **Database**: **Supabase PostgreSQL** dengan real-time subscriptions
- **Cron Jobs**: Supabase Edge Functions dengan cron triggers

## 📋 **Fitur Utama yang Dibutuhkan**

### 1. **Dashboard Bendahara**
- Overview total saldo kas
- Grafik pemasukan vs pengeluaran bulanan
- Ringkasan siswa yang belum bayar
- Notifikasi pembayaran mendekati deadline

### 2. **Manajemen Siswa**
- Input data siswa (nama, nomor absen, nomor HP orang tua)
- Status pembayaran per siswa
- Histori pembayaran masing-masing siswa
- Export data siswa ke Excel/PDF

### 3. **Pemasukan (Income)**
- Input iuran bulanan otomatis
- Input pemasukan lain-lain (sumbangan, dll)
- Set nominal iuran dan tanggal jatuh tempo
- Status pembayaran (Lunas/Belum/Terlambat)
- **Penagihan otomatis via WhatsApp** dengan template pesan yang bisa disesuaikan

### 4. **Pengeluaran (Expense)**
- Kategori pengeluaran (ATK, kebersihan, snack, acara kelas, dll)
- Input pengeluaran dengan bukti foto
- Approval system untuk pengeluaran besar
- Tracking budget per kategori

### 5. **Laporan Keuangan**
- Laporan bulanan otomatis
- Laporan tahunan
- Laporan per kategori pengeluaran
- Export ke PDF yang rapi untuk dibagikan ke orang tua
- Grafik dan visualisasi yang mudah dipahami

### 6. **Portal Orang Tua**
- Login dengan nomor HP atau kode unik
- Melihat status pembayaran anak
- History pembayaran dan pengeluaran
- Download laporan keuangan
- Notifikasi pembayaran

### 7. **Fitur Otomatisasi**
- Auto-generate tagihan bulanan
- Reminder pembayaran otomatis
- Backup data otomatis
- Generate laporan bulanan otomatis
- Kalkulasi saldo real-time

## 🎨 **Design Requirements**
- **Warna**: Tema ramah anak (biru muda, hijau, atau orange lembut)
- **Layout**: Responsive untuk desktop dan mobile
- **UX**: Sederhana dan intuitif untuk orang tua yang tidak tech-savvy
- **Icons**: Gunakan icons yang jelas dan mudah dipahami

## 🔐 **Keamanan & Role Management**
- **Admin/Bendahara**: Full access semua fitur
- **Orang Tua**: Read-only access untuk data anak mereka
- **Guest**: Hanya bisa lihat laporan umum (tanpa detail siswa)
- Password reset via email/WhatsApp
- Session timeout untuk keamanan

## 💳 **Payment Gateway Integration - Pakasir (CREDENTIALS PROVIDED)**

### 🔑 **Pakasir Configuration**
```javascript
const PAKASIR_CONFIG = {
  slug: "uangkasalhusna",
  api_key: "u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg",
  base_url: "https://pakasir.zone.id",
  redirect_url: "https://berbagiakun.com"
}
```

### 💰 **Payment URL Generation**
- **Format**: `https://pakasir.zone.id/pay/{slug}/{amount}?order_id={order_id}&redirect={redirect_url}`
- **Example**: `https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS240801001&redirect=https://berbagiakun.com/payment-success`
- **QRIS Only**: Tambahkan `&qris_only=1` jika ingin QRIS saja
- **Auto-generate** unique order_id untuk setiap tagihan (format: KAS + YYYYMMDD + counter)

### 🔄 **Webhook Handling (Supabase Edge Function)**
Buat Edge Function untuk menerima webhook dari Pakasir:
```javascript
// Webhook payload structure:
{
  "amount": 25000,
  "order_id": "KAS240801001", 
  "project": "uangkasalhusna",
  "status": "completed",
  "payment_method": "qris",
  "completed_at": "2024-08-01T10:30:00.000+07:00"
}
```

### ✅ **Transaction Verification API**
```javascript
// Verify payment status
GET https://pakasir.zone.id/api/transactiondetail?project=uangkasalhusna&amount={amount}&order_id={order_id}&api_key=u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg
```

### 🎯 **Payment Flow Integration**
1. **Generate Payment URL** dengan order_id unik
2. **Store pending transaction** di Supabase
3. **Kirim WhatsApp** dengan payment link via Wapanels
4. **Receive webhook** di Supabase Edge Function
5. **Verify payment** dengan Transaction Detail API
6. **Update database** dan kirim konfirmasi WhatsApp
7. **Redirect user** ke halaman sukses di berbagiakun.com
## 🗄️ **Supabase Database Schema**

### 📊 **Required Tables**
```sql
-- Students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nomor_absen INTEGER NOT NULL,
  nomor_hp_ortu VARCHAR(20) NOT NULL,
  nama_ortu VARCHAR(100),
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  amount INTEGER NOT NULL,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  payment_method VARCHAR(50),
  pakasir_response JSONB,
  due_date DATE NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Expenses table  
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kategori VARCHAR(100) NOT NULL,
  deskripsi TEXT NOT NULL,
  amount INTEGER NOT NULL,
  bukti_foto_url VARCHAR(500),
  tanggal DATE NOT NULL,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- WhatsApp logs table
CREATE TABLE whatsapp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  phone_number VARCHAR(20) NOT NULL,
  message_type VARCHAR(50), -- tagihan, reminder, konfirmasi
  message_content TEXT NOT NULL,
  wapanels_response JSONB,
  status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, failed
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 🔐 **Row Level Security (RLS)**
```sql
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only access for now)
CREATE POLICY "Admin full access" ON students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON whatsapp_logs FOR ALL USING (auth.role() = 'authenticated');
```
- **Penagihan Otomatis**: Kirim tagihan bulanan via WhatsApp dengan payment link
- **Template Pesan**: Template yang bisa disesuaikan untuk berbagai jenis tagihan
- **Reminder Bertingkat**: 
  - 3 hari sebelum jatuh tempo
  - Hari H jatuh tempo
  - 3 hari setelah terlambat
  - 7 hari setelah terlambat
- **Konfirmasi Pembayaran**: Otomatis update dari webhook Pakasir
- **Broadcast Message**: Kirim pengumuman atau laporan ke semua orang tua sekaligus
- **Status Delivery**: Tracking status terkirim/terbaca/gagal via Wapanels
- **Format Pesan dengan Payment Link**:
  ```
  🏫 *KAS KELAS 1A - SD INDONESIA*
  
  Yth. Orang Tua *[Nama Siswa]*
  
  📋 Tagihan Bulan: [Bulan Tahun]
  💰 Nominal: Rp [Jumlah]
  📅 Jatuh Tempo: [Tanggal]
  
  💳 *BAYAR SEKARANG (MUDAH & AMAN)*
  👆 Klik link di bawah untuk bayar:
  🔗 [Payment Link Pakasir]
  
  ✅ *Tersedia pembayaran via:*
  🏦 Transfer Bank (BCA, Mandiri, BNI, BRI)
  💳 E-Wallet (GoPay, OVO, DANA, ShopeePay)
  📱 QRIS (Scan & Bayar)
  
  ⚡ *Pembayaran otomatis dikonfirmasi*
  ✍️ *Atau transfer manual ke:*
  🏦 BCA: 1234567890 a.n [Nama Bendahara]
  
  Info: [link website kas kelas]
  
  Terima kasih 🙏
  ```

## 📱 **WhatsApp Integration - Wapanels (CREDENTIALS PROVIDED)**

### 🔑 **Wapanels Configuration**
```javascript
const WAPANELS_CONFIG = {
  api_url: "https://app.wapanels.com/api/create-message",
  appkey: "2c1b9df7-8ae4-4dc7-a50e-e16f78af0509",
  authkey: "9hoO4xHDJjW0BmvGGhvU2s6JiKuN76D7QU1n0JIYQ194VbKXzp"
}
```

### 📤 **Send Message Function (Supabase Edge Function)**
```javascript
// Wapanels API Call Structure:
const sendWhatsApp = async (phoneNumber, message) => {
  const formData = new FormData();
  formData.append('appkey', '2c1b9df7-8ae4-4dc7-a50e-e16f78af0509');
  formData.append('authkey', '9hoO4xHDJjW0BmvGGhvU2s6JiKuN76D7QU1n0JIYQ194VbKXzp');
  formData.append('to', phoneNumber); // Format: 628123456789
  formData.append('message', message);
  
  const response = await fetch('https://app.wapanels.com/api/create-message', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}

// Expected Success Response:
{
  "message_status": "Success",
  "data": {
    "from": "SENDER_NUMBER",
    "to": "RECEIVER_NUMBER", 
    "status_code": 200
  }
}
```

### 💬 **WhatsApp Message Templates**
- **Tagihan Bulanan dengan Payment Link**:
```
🏫 *KAS KELAS 1A - SD INDONESIA*

Yth. Orang Tua *{nama_siswa}*

📋 Tagihan Bulan: {bulan_tahun}
💰 Nominal: Rp {nominal}
📅 Jatuh Tempo: {tanggal}

💳 *BAYAR MUDAH & AMAN*
Klik link berikut untuk bayar:
👆 https://pakasir.zone.id/pay/uangkasalhusna/{amount}?order_id={order_id}&redirect=https://berbagiakun.com/payment-success

✅ *Metode Pembayaran:*
🏦 Transfer Bank | 💳 E-Wallet | 📱 QRIS

⚡ *Pembayaran otomatis terkonfirmasi*

Info lengkap: https://berbagiakun.com
Terima kasih 🙏
```

- **Konfirmasi Pembayaran Berhasil**:
```
✅ *PEMBAYARAN BERHASIL*

Terima kasih {nama_siswa}!

💰 Jumlah: Rp {amount}
📅 Tanggal: {completed_at}
💳 Via: {payment_method}
🆔 ID: {order_id}

Status kas: https://berbagiakun.com
```

### 🔄 **WhatsApp Automation Features**
- **Bulk Messaging**: Kirim ke multiple nomor sekaligus
- **Scheduled Messages**: Reminder bertingkat otomatis
- **Dynamic Templates**: Replace variables dari database
- **Delivery Tracking**: Log semua pengiriman di Supabase
- **Error Handling**: Retry mechanism untuk gagal kirim

## 🚀 **Deployment Requirements**
- Setup Railway deployment yang mudah
- Environment variables untuk production
- Database seeding dengan data sample
- Documentation untuk maintenance
- Auto-deploy dari GitHub

## 📊 **Sample Data Structure & Integration Examples**

### 👥 **Sample Students Data (25 siswa)**
```javascript
const sampleStudents = [
  {
    nama: "Ahmad Rizki",
    nomor_absen: 1,
    nomor_hp_ortu: "628123456789", // Format international
    nama_ortu: "Budi Santoso"
  },
  {
    nama: "Siti Nurhaliza", 
    nomor_absen: 2,
    nomor_hp_ortu: "628234567890",
    nama_ortu: "Sari Dewi"
  },
  // ... 23 students more
];
```

### 💳 **Sample Payment Data dengan Pakasir Integration**
```javascript
const samplePayments = [
  {
    student_id: "uuid-student-1",
    amount: 25000,
    order_id: "KAS20240801001", // Generated format
    status: "completed",
    payment_method: "qris",
    pakasir_response: {
      "amount": 25000,
      "order_id": "KAS20240801001",
      "project": "uangkasalhusna", 
      "status": "completed",
      "payment_method": "qris",
      "completed_at": "2024-08-01T10:30:00.000+07:00"
    },
    due_date: "2024-08-05",
    completed_at: "2024-08-01T10:30:00.000+07:00"
  }
];
```

### 📱 **Sample WhatsApp Campaign Data**
```javascript
const sampleWhatsAppLogs = [
  {
    student_id: "uuid-student-1",
    phone_number: "628123456789",
    message_type: "tagihan",
    message_content: "🏫 *KAS KELAS 1A*\n\nYth. Orang Tua *Ahmad Rizki*...",
    wapanels_response: {
      "message_status": "Success",
      "data": {
        "from": "SENDER_NUMBER",
        "to": "628123456789",
        "status_code": 200
      }
    },
    status: "sent"
  }
];
```

### 🔗 **Integration URLs & Redirects**
- **Payment Success Redirect**: `https://berbagiakun.com/payment-success?order_id={order_id}`
- **Payment Failed Redirect**: `https://berbagiakun.com/payment-failed?order_id={order_id}`
- **Webhook Endpoint**: `https://your-supabase-project.supabase.co/functions/v1/pakasir-webhook`
- **Dashboard URL**: `https://berbagiakun.com/dashboard`

### 📄 **Template Pesan WhatsApp Lengkap**
```javascript
// 1. Tagihan Bulanan (dengan Payment Link Pakasir)
const tagihanTemplate = (data) => `🏫 *KAS KELAS 1A - SD INDONESIA*

Yth. Orang Tua *${data.nama_siswa}*

📋 Tagihan Bulan: ${data.bulan_tahun}
💰 Nominal: Rp ${data.nominal.toLocaleString('id-ID')}
📅 Jatuh Tempo: ${data.jatuh_tempo}

🔗 *BAYAR SEKARANG (KLIK LINK)*
https://pakasir.zone.id/pay/uangkasalhusna/${data.amount}?order_id=${data.order_id}&redirect=https://berbagiakun.com/payment-success

✅ *Metode Pembayaran:*
🏦 Transfer Bank | 💳 E-Wallet | 📱 QRIS

⚡ *Otomatis terkonfirmasi setelah bayar*

📊 Cek status: https://berbagiakun.com
Terima kasih 🙏`;

// 2. Reminder Terlambat
const reminderTemplate = (data) => `⏰ *REMINDER PEMBAYARAN*

Yth. Orang Tua *${data.nama_siswa}*

💳 Tagihan: Rp ${data.nominal.toLocaleString('id-ID')}
📅 Telat: ${data.hari_telat} hari
🔗 Bayar: https://pakasir.zone.id/pay/uangkasalhusna/${data.amount}?order_id=${data.order_id}&redirect=https://berbagiakun.com

Mohon segera diselesaikan 🙏`;

// 3. Konfirmasi Pembayaran Berhasil
const confirmTemplate = (data) => `✅ *PEMBAYARAN BERHASIL*

Terima kasih *${data.nama_siswa}*!

💰 Jumlah: Rp ${data.amount.toLocaleString('id-ID')}
📅 Tanggal: ${data.completed_at}
💳 Via: ${data.payment_method.toUpperCase()}
🆔 ID: ${data.order_id}

📊 Status kas: https://berbagiakun.com
Terima kasih 🙏`;
```

### 🎯 **Keuntungan Sistem Terintegrasi (Supabase + Pakasir + Wapanels)**
- ✅ **100% Otomatis**: Dari tagihan sampai konfirmasi tanpa manual work
- ✅ **Real-time Updates**: Supabase realtime untuk dashboard live
- ✅ **Multiple Payment Options**: Bank, E-Wallet, QRIS dalam satu link Pakasir
- ✅ **Instant Confirmation**: Webhook Pakasir langsung update Supabase
- ✅ **WhatsApp Automation**: Wapanels handle semua komunikasi otomatis
- ✅ **Scalable Architecture**: Supabase + Vercel untuk performa optimal
- ✅ **Professional Experience**: UX seperti fintech modern
- ✅ **Cost Effective**: Semua tools sudah ter-setup dengan credentials provided

## 🔄 **Complete Integration Flow (Supabase + Pakasir + Wapanels)**

### 🎯 **Monthly Billing Automation (Supabase Cron)**
```javascript
// Edge Function: monthly-billing-cron
1. **Cron Trigger** (tanggal 1 setiap bulan)
2. **Query students** dari Supabase yang aktif
3. **Generate order_id** unik (KAS + YYYYMM + student_id)
4. **Create payment records** dengan status 'pending'
5. **Generate Pakasir URLs** untuk setiap siswa
6. **Bulk WhatsApp** via Wapanels dengan payment links
7. **Log activities** ke whatsapp_logs table
```

### 💳 **Payment Processing Flow**
```javascript
// Edge Function: pakasir-webhook
1. **Receive webhook** dari Pakasir di /api/webhook/pakasir
2. **Validate payload** (amount, order_id, project)
3. **Verify transaction** dengan Pakasir Transaction Detail API
4. **Update payment status** di Supabase (pending → completed)
5. **Send confirmation WhatsApp** via Wapanels
6. **Update real-time dashboard** via Supabase realtime
7. **Log successful payment** untuk audit trail
```

### ⏰ **Reminder System (Supabase Cron)**
```javascript
// Edge Function: payment-reminder-cron (daily)
1. **Query overdue payments** dari Supabase
2. **Check reminder rules** (3 hari sebelum, H-0, +3 hari, +7 hari)
3. **Generate reminder messages** dengan payment links fresh
4. **Send WhatsApp reminders** via Wapanels
5. **Update reminder logs** untuk tracking
```

### 📊 **Real-time Dashboard Updates**
```javascript
// Next.js Client dengan Supabase Realtime
1. **Subscribe** ke payment table changes
2. **Auto-update** dashboard saat ada pembayaran
3. **Show notifications** untuk pembayaran baru
4. **Update statistics** real-time (total kas, siswa belum bayar)
```

## 📝 **Output yang Diharapkan**
1. **Kode lengkap** backend dan frontend
2. **Database schema** dan seeding
3. **Railway deployment config**
4. **README** dengan petunjuk setup
5. **User manual** sederhana untuk korlas dan orang tua
6. **Sample screenshots** atau mockup tampilan

## 🎯 **Prioritas Pengembangan**
1. **High**: CRUD siswa, input pemasukan/pengeluaran, **WhatsApp penagihan otomatis**, laporan dasar
2. **Medium**: Portal orang tua, export PDF, reminder bertingkat WhatsApp
3. **Low**: QR payment, advanced analytics, dark mode

## 📱 **Fitur Tambahan (Nice to Have)**
- QR Code untuk pembayaran
- Integration dengan e-wallet (QRIS)  
- Export data untuk backup
- Dark/Light mode toggle
- Print receipt pembayaran
- Voice note untuk pengumuman via WhatsApp

-- ===============================================
-- DATABASE SCHEMA - UANG KAS KELAS 1 SD
-- Supabase PostgreSQL dengan RLS
-- ===============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ===============================================
-- TABLES CREATION
-- ===============================================

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'bendahara' CHECK (role IN ('bendahara', 'korlas', 'ortu')),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Students table
CREATE TABLE public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nomor_absen INTEGER NOT NULL UNIQUE,
  nomor_hp_ortu VARCHAR(20) NOT NULL,
  nama_ortu VARCHAR(100),
  email_ortu VARCHAR(255),
  alamat TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Payment categories table
CREATE TABLE public.payment_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  default_amount INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Payments table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  category_id UUID REFERENCES payment_categories(id),
  amount INTEGER NOT NULL,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
  payment_method VARCHAR(50),
  pakasir_payment_url TEXT,
  pakasir_response JSONB,
  due_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Expense categories table
CREATE TABLE public.expense_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Expenses table  
CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES expense_categories(id),
  deskripsi TEXT NOT NULL,
  amount INTEGER NOT NULL,
  bukti_foto_url TEXT,
  tanggal DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. WhatsApp logs table
CREATE TABLE public.whatsapp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  phone_number VARCHAR(20) NOT NULL,
  message_type VARCHAR(50) NOT NULL, -- tagihan, reminder, konfirmasi, broadcast
  message_content TEXT NOT NULL,
  wapanels_response JSONB,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'pending')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT
);

-- 8. Payment reminders table
CREATE TABLE public.payment_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  reminder_type VARCHAR(20) NOT NULL, -- before_due, on_due, after_due_3, after_due_7
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  whatsapp_log_id UUID REFERENCES whatsapp_logs(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Settings table
CREATE TABLE public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'number', 'boolean', 'json')),
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Audit logs table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- Students indexes
CREATE INDEX idx_students_nomor_absen ON students(nomor_absen);
CREATE INDEX idx_students_nomor_hp ON students(nomor_hp_ortu);
CREATE INDEX idx_students_active ON students(is_active) WHERE is_active = true;

-- Payments indexes
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_completed_at ON payments(completed_at);

-- Expenses indexes
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_tanggal ON expenses(tanggal);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_created_by ON expenses(created_by);

-- WhatsApp logs indexes
CREATE INDEX idx_whatsapp_logs_student_id ON whatsapp_logs(student_id);
CREATE INDEX idx_whatsapp_logs_payment_id ON whatsapp_logs(payment_id);
CREATE INDEX idx_whatsapp_logs_message_type ON whatsapp_logs(message_type);
CREATE INDEX idx_whatsapp_logs_sent_at ON whatsapp_logs(sent_at);

-- Payment reminders indexes
CREATE INDEX idx_payment_reminders_payment_id ON payment_reminders(payment_id);
CREATE INDEX idx_payment_reminders_scheduled_at ON payment_reminders(scheduled_at);
CREATE INDEX idx_payment_reminders_status ON payment_reminders(status);

-- ===============================================
-- FUNCTIONS AND TRIGGERS
-- ===============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate order_id function
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
DECLARE
    prefix TEXT := 'KAS';
    date_part TEXT := TO_CHAR(NOW(), 'YYYYMM');
    counter INTEGER;
    order_id TEXT;
BEGIN
    -- Get next counter for this month
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_id FROM 'KAS\d{6}(\d+)$') AS INTEGER)
    ), 0) + 1 INTO counter
    FROM payments 
    WHERE order_id LIKE prefix || date_part || '%';
    
    -- Format with leading zeros (3 digits)
    order_id := prefix || date_part || LPAD(counter::TEXT, 3, '0');
    
    RETURN order_id;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate order_id trigger
CREATE OR REPLACE FUNCTION set_payment_order_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_id IS NULL OR NEW.order_id = '' THEN
        NEW.order_id := generate_order_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_payment_order_id_trigger 
    BEFORE INSERT ON payments 
    FOR EACH ROW EXECUTE FUNCTION set_payment_order_id();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        table_name, record_id, action, old_data, new_data, user_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END,
        auth.uid()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_expenses AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ===============================================
-- ROW LEVEL SECURITY (RLS)
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admin/Bendahara full access policies
CREATE POLICY "Admin full access to students" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('bendahara', 'korlas')
        )
    );

CREATE POLICY "Admin full access to payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('bendahara', 'korlas')
        )
    );

CREATE POLICY "Admin full access to expenses" ON expenses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('bendahara', 'korlas')
        )
    );

CREATE POLICY "Admin full access to whatsapp_logs" ON whatsapp_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('bendahara', 'korlas')
        )
    );

CREATE POLICY "Admin full access to payment_reminders" ON payment_reminders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('bendahara', 'korlas')
        )
    );

CREATE POLICY "Admin full access to settings" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('bendahara', 'korlas')
        )
    );

CREATE POLICY "Admin read access to audit_logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('bendahara', 'korlas')
        )
    );

-- Read-only access for categories
CREATE POLICY "Everyone can read payment_categories" ON payment_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Everyone can read expense_categories" ON expense_categories
    FOR SELECT USING (is_active = true);

-- Parent access policies (untuk portal orang tua)
CREATE POLICY "Parents can view own child payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN students s ON s.email_ortu = u.email
            WHERE u.id = auth.uid() 
            AND s.id = payments.student_id
            AND u.role = 'ortu'
        )
    );

-- ===============================================
-- VIEWS FOR COMMON QUERIES
-- ===============================================

-- Payment summary view
CREATE VIEW payment_summary AS
SELECT 
    s.id as student_id,
    s.nama as student_name,
    s.nomor_absen,
    s.nomor_hp_ortu,
    s.nama_ortu,
    COUNT(p.id) as total_payments,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_payments,
    COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_payments,
    COUNT(CASE WHEN p.status = 'pending' AND p.due_date < CURRENT_DATE THEN 1 END) as overdue_payments,
    COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.amount END), 0) as total_pending
FROM students s
LEFT JOIN payments p ON s.id = p.student_id
WHERE s.is_active = true
GROUP BY s.id, s.nama, s.nomor_absen, s.nomor_hp_ortu, s.nama_ortu
ORDER BY s.nomor_absen;

-- Monthly cash flow view
CREATE VIEW monthly_cashflow AS
SELECT 
    DATE_TRUNC('month', date_col) as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_cashflow
FROM (
    SELECT completed_at::date as date_col, amount, 'income' as type
    FROM payments WHERE status = 'completed'
    UNION ALL
    SELECT tanggal as date_col, amount, 'expense' as type  
    FROM expenses WHERE status = 'approved'
) combined
GROUP BY DATE_TRUNC('month', date_col)
ORDER BY month DESC;

-- ===============================================
-- INITIAL DATA SEEDING
-- ===============================================

-- Insert default payment categories
INSERT INTO payment_categories (name, description, default_amount) VALUES
('Kas Bulanan', 'Iuran kas bulanan siswa', 25000),
('Kas Tambahan', 'Iuran tambahan untuk kegiatan khusus', 50000),
('Denda Terlambat', 'Denda keterlambatan pembayaran', 5000);

-- Insert expense categories
INSERT INTO expense_categories (name, description, color) VALUES
('ATK', 'Alat Tulis Kantor dan keperluan kelas', '#3B82F6'),
('Kebersihan', 'Sabun, tissue, pembersih kelas', '#10B981'),
('Snack', 'Snack untuk acara kelas', '#F59E0B'),
('Acara Kelas', 'Perayaan ulang tahun, wisuda, dll', '#EF4444'),
('Dekorasi', 'Hiasan kelas dan papan tulis', '#8B5CF6'),
('Lain-lain', 'Pengeluaran lainnya', '#6B7280');

-- Insert default settings
INSERT INTO settings (key, value, description, type) VALUES
('school_name', 'SD INDONESIA', 'Nama sekolah', 'text'),
('class_name', 'Kelas 1A', 'Nama kelas', 'text'),
('monthly_due_amount', '25000', 'Jumlah iuran bulanan default', 'number'),
('due_date_each_month', '5', 'Tanggal jatuh tempo setiap bulan', 'number'),
('late_fee_amount', '5000', 'Denda keterlambatan', 'number'),
('bendahara_name', 'Ibu Sari', 'Nama bendahara kelas', 'text'),
('bendahara_phone', '628123456789', 'Nomor HP bendahara', 'text'),
('bank_account', 'BCA 1234567890 a.n Ibu Sari', 'Rekening bank untuk transfer manual', 'text'),
('reminder_days_before', '3', 'Hari sebelum jatuh tempo untuk kirim reminder', 'number'),
('reminder_days_after', '3,7', 'Hari setelah jatuh tempo untuk kirim reminder (comma separated)', 'text'),
('whatsapp_footer', 'Tim Kas Kelas 1A - SD Indonesia', 'Footer pesan WhatsApp', 'text');

-- Sample students data (25 siswa)
INSERT INTO students (nama, nomor_absen, nomor_hp_ortu, nama_ortu, email_ortu) VALUES
('Ahmad Rizki Pratama', 1, '628123456789', 'Budi Santoso', 'budi.santoso@email.com'),
('Siti Nurhaliza', 2, '628234567890', 'Sari Dewi', 'sari.dewi@email.com'),
('Muhammad Fajar', 3, '628345678901', 'Andi Wijaya', 'andi.wijaya@email.com'),
('Aisyah Putri', 4, '628456789012', 'Indah Permata', 'indah.permata@email.com'),
('Rizky Ramadhan', 5, '628567890123', 'Agus Setiawan', 'agus.setiawan@email.com'),
('Fatimah Zahra', 6, '628678901234', 'Rina Marlina', 'rina.marlina@email.com'),
('Bayu Aji', 7, '628789012345', 'Dedi Kurniawan', 'dedi.kurniawan@email.com'),
('Nabila Azzahra', 8, '628890123456', 'Maya Sari', 'maya.sari@email.com'),
('Arief Budiman', 9, '628901234567', 'Hendra Pratama', 'hendra.pratama@email.com'),
('Zahra Aulia', 10, '628012345678', 'Dewi Lestari', 'dewi.lestari@email.com'),
('Kevin Alamsyah', 11, '628123456780', 'Bambang Sutopo', 'bambang.sutopo@email.com'),
('Putri Maharani', 12, '628234567891', 'Siska Wulandari', 'siska.wulandari@email.com'),
('Dimas Pratama', 13, '628345678902', 'Rudi Hartono', 'rudi.hartono@email.com'),
('Ayu Lestari', 14, '628456789013', 'Lia Amelia', 'lia.amelia@email.com'),
('Farhan Maulana', 15, '628567890124', 'Iwan Setiadi', 'iwan.setiadi@email.com'),
('Salma Alayya', 16, '628678901235', 'Nita Anggraini', 'nita.anggraini@email.com'),
('Rian Kurniawan', 17, '628789012346', 'Joko Susilo', 'joko.susilo@email.com'),
('Kirana Dewi', 18, '628890123457', 'Fitri Handayani', 'fitri.handayani@email.com'),
('Galang Pratama', 19, '628901234568', 'Eko Prasetyo', 'eko.prasetyo@email.com'),
('Intan Permata', 20, '628012345679', 'Yuni Astuti', 'yuni.astuti@email.com'),
('Hafiz Abdullah', 21, '628123456781', 'Ahmad Fauzi', 'ahmad.fauzi@email.com'),
('Khaira Annisa', 22, '628234567892', 'Ratna Sari', 'ratna.sari@email.com'),
('Alif Rahman', 23, '628345678903', 'Dani Ramadhan', 'dani.ramadhan@email.com'),
('Mawar Sari', 24, '628456789014', 'Evi Susanti', 'evi.susanti@email.com'),
('Naufal Akbar', 25, '628567890125', 'Benny Wijaya', 'benny.wijaya@email.com');

-- ===============================================
-- USEFUL FUNCTIONS FOR APPLICATION
-- ===============================================

-- Function to get current month cash balance
CREATE OR REPLACE FUNCTION get_current_balance()
RETURNS INTEGER AS $$
DECLARE
    total_income INTEGER;
    total_expense INTEGER;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_income
    FROM payments 
    WHERE status = 'completed';
    
    SELECT COALESCE(SUM(amount), 0) INTO total_expense  
    FROM expenses
    WHERE status = 'approved';
    
    RETURN total_income - total_expense;
END;
$$ LANGUAGE plpgsql;

-- Function to get overdue payments
CREATE OR REPLACE FUNCTION get_overdue_payments()
RETURNS TABLE (
    student_id UUID,
    student_name VARCHAR,
    amount INTEGER,
    days_overdue INTEGER,
    phone_number VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.nama,
        p.amount,
        (CURRENT_DATE - p.due_date)::INTEGER,
        s.nomor_hp_ortu
    FROM payments p
    JOIN students s ON p.student_id = s.id
    WHERE p.status = 'pending' 
    AND p.due_date < CURRENT_DATE
    AND s.is_active = true
    ORDER BY p.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to create monthly payments for all active students
CREATE OR REPLACE FUNCTION create_monthly_payments(
    target_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE),
    payment_amount INTEGER DEFAULT 25000
)
RETURNS INTEGER AS $$
DECLARE
    student_record RECORD;
    due_date DATE;
    created_count INTEGER := 0;
    payment_category_id UUID;
BEGIN
    -- Get payment category ID
    SELECT id INTO payment_category_id 
    FROM payment_categories 
    WHERE name = 'Kas Bulanan' 
    LIMIT 1;
    
    -- Calculate due date (5th of the month by default)
    due_date := target_month + INTERVAL '4 days';
    
    -- Create payments for all active students
    FOR student_record IN 
        SELECT id FROM students WHERE is_active = true
    LOOP
        -- Check if payment already exists for this month
        IF NOT EXISTS (
            SELECT 1 FROM payments 
            WHERE student_id = student_record.id 
            AND DATE_TRUNC('month', due_date) = DATE_TRUNC('month', payments.due_date)
        ) THEN
            INSERT INTO payments (
                student_id, 
                category_id,
                amount, 
                due_date,
                status
            ) VALUES (
                student_record.id,
                payment_category_id,
                payment_amount,
                due_date,
                'pending'
            );
            created_count := created_count + 1;
        END IF;
    END LOOP;
    
    RETURN created_count;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- COMMENTS AND DOCUMENTATION
-- ===============================================

COMMENT ON TABLE students IS 'Data siswa kelas dengan informasi orang tua';
COMMENT ON TABLE payments IS 'Transaksi pembayaran kas dengan integrasi Pakasir';
COMMENT ON TABLE expenses IS 'Pengeluaran kas kelas dengan kategori';
COMMENT ON TABLE whatsapp_logs IS 'Log pengiriman pesan WhatsApp via Wapanels';
COMMENT ON TABLE payment_reminders IS 'Jadwal reminder pembayaran otomatis';
COMMENT ON TABLE settings IS 'Konfigurasi aplikasi yang dapat diubah';
COMMENT ON TABLE audit_logs IS 'Log audit untuk tracking perubahan data';

COMMENT ON FUNCTION generate_order_id() IS 'Generate unique order ID format: KAS + YYYYMM + counter';
COMMENT ON FUNCTION get_current_balance() IS 'Hitung saldo kas saat ini (pemasukan - pengeluaran)';
COMMENT ON FUNCTION get_overdue_payments() IS 'Ambil daftar pembayaran yang sudah terlambat';
COMMENT ON FUNCTION create_monthly_payments() IS 'Buat tagihan bulanan untuk semua siswa aktif';

-- ===============================================
-- GRANTS (Optional - for specific user roles)
-- ===============================================

-- Grant usage on sequences to authenticated users
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant execute on functions to authenticated users  
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

Tolong buatkan aplikasi yang benar-benar siap pakai dan mudah di-maintain oleh korlas yang tidak terlalu teknis. Fokus pada kemudahan penggunaan dan transparansi untuk orang tua siswa.
