# Panduan Deployment ke Vercel

## Prerequisites

1. Akun Vercel (https://vercel.com)
2. Akun Supabase dengan project yang sudah dibuat
3. API Keys untuk StarSender dan Pakasir (opsional)

## Langkah-langkah Deployment

### 1. Setup Supabase

1. Login ke Supabase Dashboard
2. Buat project baru atau gunakan yang sudah ada
3. Jalankan migrations:
   - Copy semua file dari `/supabase/migrations/`
   - Paste dan jalankan di SQL Editor Supabase

### 2. Environment Variables di Vercel

Setelah import project dari GitHub, tambahkan environment variables berikut di Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy ke Vercel

#### Option A: Deploy via Vercel Dashboard
1. Login ke https://vercel.com
2. Click "New Project"
3. Import repository dari GitHub
4. Add environment variables
5. Click "Deploy"

#### Option B: Deploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

### 4. Post-Deployment Setup

1. **Update Supabase URL di Authentication**:
   - Di Supabase Dashboard → Authentication → URL Configuration
   - Add Vercel URL ke Redirect URLs

2. **Configure API Keys di App**:
   - Login ke aplikasi
   - Pergi ke Settings → Integrasi
   - Masukkan API Keys untuk StarSender dan Pakasir

## Troubleshooting

### Build Failed
- Pastikan semua dependencies terinstall: `npm install`
- Cek TypeScript errors: `npm run typecheck`
- Cek build locally: `npm run build`

### Database Connection Error
- Pastikan environment variables sudah benar
- Cek apakah migrations sudah dijalankan
- Pastikan RLS policies sudah aktif

### WhatsApp/Payment Gateway Error
- API Keys bisa diset via Settings page setelah deployment
- Tidak perlu hardcode di environment variables

## Environment Variables Reference

### Required:
- `NEXT_PUBLIC_SUPABASE_URL` - URL project Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key dari Supabase

### Optional (bisa diset via Settings):
- `STARSENDER_API_KEY` - API key StarSender
- `PAKASIR_API_KEY` - API key Pakasir
- `PAKASIR_SLUG` - Slug untuk Pakasir

## Build Configuration

Project sudah dikonfigurasi dengan:
- Framework: Next.js 14
- Node version: 18.x (auto-detected)
- Build command: `npm run build`
- Output directory: `.next`

File `vercel.json` sudah disediakan dengan konfigurasi optimal.