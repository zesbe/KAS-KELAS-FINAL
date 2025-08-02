# Bug Tracker - Kas Kelas Application

## Overview
Dokumen ini melacak semua bug yang diketahui dan status penyelesaiannya. Kita akan memperbaiki satu per satu secara sistematis.

## Bug Categories
- 🔴 **Critical**: Bug yang membuat aplikasi tidak bisa digunakan
- 🟡 **Major**: Fitur tidak berfungsi dengan benar
- 🟢 **Minor**: Masalah UI/UX atau inkonsistensi kecil

## Active Bugs

### 🔴 Critical Bugs
1. **[BUG-001]** Koneksi Supabase
   - **Deskripsi**: Aplikasi mungkin belum terhubung dengan benar ke Supabase
   - **Status**: ⏳ Pending
   - **Langkah Reproduksi**: 
     1. Jalankan aplikasi
     2. Cek console untuk error koneksi
   - **Solusi**: Pastikan environment variables sudah benar di `.env.local`

2. **[BUG-007]** Infinite Loop Toast "Data berhasil dimuat"
   - **Deskripsi**: Popup toast muncul terus menerus di dashboard
   - **Status**: ✅ FIXED
   - **Penyebab**: useEffect dengan dependency array yang salah menyebabkan infinite loop
   - **Solusi**: 
     - Menghapus `dashboardData` dari dependency array useEffect
     - Menghapus toast success yang tidak perlu

### 🟡 Major Bugs
1. **[BUG-002]** Sistem Autentikasi
   - **Deskripsi**: Login menggunakan tabel `app_users` custom, bukan Supabase Auth
   - **Status**: ⏳ Pending
   - **Solusi**: Implementasi autentikasi custom dengan `app_users` table

2. **[BUG-003]** Session Management
   - **Deskripsi**: Session mungkin tidak persist dengan benar
   - **Status**: ⏳ Pending
   - **Solusi**: Implementasi session handling dengan `user_sessions` table

3. **[BUG-004]** Data Fetching
   - **Deskripsi**: Query data mungkin error atau tidak optimal
   - **Status**: ⏳ Pending
   - **Solusi**: Review dan perbaiki semua query Supabase

### 🟢 Minor Bugs
1. **[BUG-005]** UI Responsiveness
   - **Deskripsi**: Beberapa halaman mungkin tidak fully responsive
   - **Status**: ⏳ Pending
   - **Solusi**: Review dan fix Tailwind CSS classes

2. **[BUG-006]** Error Handling
   - **Deskripsi**: Error messages mungkin tidak user-friendly
   - **Status**: ⏳ Pending
   - **Solusi**: Implementasi proper error handling dan toast notifications

## Fixed Bugs

### ✅ Resolved
1. **[BUG-007]** Infinite Loop Toast "Data berhasil dimuat" - *Fixed on 02/08/2025*
   - **Masalah**: useEffect dengan dependency yang salah menyebabkan infinite render loop
   - **Solusi**: Menghapus dashboardData dari dependency array dan menghapus toast yang tidak perlu

## Bug Resolution Process

1. **Identifikasi**: Jalankan aplikasi dan identifikasi bug
2. **Dokumentasi**: Tambahkan bug ke tracker dengan detail
3. **Prioritas**: Tentukan tingkat severity
4. **Debug**: Gunakan console logs dan Supabase Dashboard
5. **Fix**: Implementasi solusi
6. **Test**: Verifikasi fix berfungsi dengan benar
7. **Update**: Pindahkan bug ke bagian "Resolved"

## Debugging Commands

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Check TypeScript errors
npm run typecheck

# Run linter
npm run lint
```

## Supabase Debugging Tips

### Melihat Logs di Supabase Dashboard
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Pergi ke **Logs** > **API Logs** untuk melihat request
4. Pergi ke **Logs** > **Postgres Logs** untuk melihat query database

### Test Koneksi Database
Buat file `test-supabase.js`:
```javascript
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testConnection() {
  // Test query ke app_users
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Connection successful!')
    console.log('Sample data:', data)
  }
}

testConnection()
```

Jalankan: `node test-supabase.js`

## Common Issues & Solutions

### Error: relation "table_name" does not exist
- Pastikan sudah menjalankan semua script SQL di Supabase SQL Editor
- Cek nama tabel sudah benar (case sensitive)

### Error: Invalid API key
- Periksa API keys di Supabase Dashboard > Settings > API
- Pastikan menggunakan key yang benar:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` untuk client-side
  - `SUPABASE_SERVICE_ROLE_KEY` untuk server-side

### Error: CORS
- Tambahkan `http://localhost:3000` di Supabase Dashboard > Authentication > URL Configuration

### Error: JWT expired
- Session token expired, user perlu login ulang
- Implementasi auto-refresh token jika diperlukan

## Environment Variables Checklist
Pastikan semua environment variables sudah diset di `.env.local`:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL` (jika diperlukan untuk migrations)

## Next Steps
1. Setup environment variables di `.env.local`
2. Jalankan semua SQL scripts di Supabase
3. Test koneksi dengan `test-supabase.js`
4. Jalankan aplikasi dengan `npm run dev`
5. Identifikasi dan fix bugs satu per satu