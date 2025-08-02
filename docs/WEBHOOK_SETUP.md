# Webhook Setup Guide

## Pakasir Payment Gateway Webhook

### 1. Webhook URL
Setelah deploy aplikasi ke Vercel, webhook URL Anda adalah:
```
https://kas-kelas-final.vercel.app/api/webhook/pakasir
```

### 2. Setup di Pakasir
1. Login ke dashboard Pakasir
2. Masuk ke halaman proyek "uangkasalhusna"
3. Klik "Edit Proyek"
4. Isi field "Webhook URL" dengan URL di atas
5. Simpan perubahan

### 3. Cara Kerja Webhook
Ketika pembayaran berhasil, Pakasir akan:
1. Mengirim POST request ke webhook URL
2. Aplikasi akan memverifikasi pembayaran
3. Update status payment menjadi "paid"
4. Kirim notifikasi WhatsApp ke orang tua siswa

### 4. Testing Webhook
Untuk test webhook di local development:

```bash
# Install ngrok
npm install -g ngrok

# Run your app
npm run dev

# In another terminal, expose your local server
ngrok http 3000

# Use the ngrok URL for webhook testing
# Example: https://abc123.ngrok.io/api/webhook/pakasir
```

### 5. Webhook Payload
Contoh payload yang dikirim Pakasir:
```json
{
  "amount": 25000,
  "order_id": "KAS202412123456",
  "project": "uangkasalhusna",
  "status": "completed",
  "payment_method": "qris",
  "completed_at": "2024-12-10T08:07:02.819+07:00"
}
```

### 6. Security
- Webhook akan memverifikasi setiap payment dengan Pakasir API
- Hanya payment dengan status "completed" yang diproses
- Order ID harus sesuai dengan payment di database

### 7. Troubleshooting
- Check Vercel logs untuk melihat webhook requests
- Pastikan environment variables sudah di-set di Vercel
- Test dengan amount kecil terlebih dahulu

## StarSender WhatsApp Integration

### 1. API Key
Dapatkan API key dari dashboard StarSender dan set di environment variable:
```
STARSENDER_API_KEY=your_api_key_here
```

### 2. Format Nomor
- Nomor HP harus dalam format internasional (62xxx)
- Aplikasi akan otomatis convert dari 08xxx ke 62xxx

### 3. Rate Limiting
- Aplikasi mengirim pesan dengan delay 2 detik antar pesan
- Hindari mengirim terlalu banyak pesan sekaligus

### 4. Template Pesan
Template pesan sudah tersedia untuk:
- Tagihan bulanan
- Reminder pembayaran
- Konfirmasi pembayaran berhasil
- Broadcast pengumuman
- Laporan bulanan