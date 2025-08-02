# Instruksi Perbaikan Settings

## Langkah-langkah untuk memperbaiki masalah "Gagal menyimpan pengaturan":

### 1. Jalankan SQL Script di Supabase

Buka Supabase Dashboard, masuk ke SQL Editor, dan jalankan script berikut:

```sql
-- Fix Settings Table and Add Missing Columns
-- =============================================

-- Ensure settings table has all required columns
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing settings entries for the application
INSERT INTO public.settings (key, value, description, type, updated_by) VALUES 
-- System Settings
('school_name', 'SD Indonesia', 'Nama sekolah', 'text', 'system'),
('class_name', 'Kelas 1A', 'Nama kelas', 'text', 'system'),
('teacher_name', 'Bu Sari', 'Nama wali kelas', 'text', 'system'),
('phone_number', '628123456789', 'Nomor telepon wali kelas', 'text', 'system'),
('email', 'teacher@school.com', 'Email wali kelas', 'text', 'system'),
('default_payment_amount', '25000', 'Nominal pembayaran default', 'number', 'system'),
('payment_due_day', '5', 'Tanggal jatuh tempo pembayaran (hari)', 'number', 'system'),
('currency', 'IDR', 'Mata uang', 'text', 'system'),
('timezone', 'Asia/Jakarta', 'Zona waktu', 'text', 'system'),

-- Integration Settings
('pakasir_api_key', '', 'API Key Pakasir', 'text', 'system'),
('pakasir_slug', '', 'Slug Pakasir', 'text', 'system'),
('pakasir_base_url', 'https://pakasir.zone.id', 'Base URL Pakasir', 'text', 'system'),
('pakasir_redirect_url', 'https://berbagiakun.com', 'Redirect URL Pakasir', 'text', 'system'),
('starsender_account_key', '', 'StarSender Account API Key', 'text', 'system'),
('starsender_device_key', '', 'StarSender Device API Key', 'text', 'system'),

-- Notification Settings
('whatsapp_auto_reminders', 'false', 'Kirim reminder otomatis via WhatsApp', 'boolean', 'system'),
('whatsapp_auto_confirmations', 'false', 'Kirim konfirmasi pembayaran otomatis', 'boolean', 'system'),
('whatsapp_reminder_days_before', '3', 'Hari sebelum jatuh tempo untuk reminder', 'number', 'system'),
('email_notifications', 'false', 'Kirim notifikasi via email', 'boolean', 'system'),
('parent_portal_notifications', 'false', 'Tampilkan notifikasi di portal orang tua', 'boolean', 'system')
ON CONFLICT (key) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- Grant permissions
GRANT ALL ON public.settings TO authenticated;
GRANT ALL ON public.settings TO anon;
```

### 2. Verifikasi Tabel Settings

Setelah menjalankan script di atas, jalankan query berikut untuk memverifikasi:

```sql
-- Check if all settings are created
SELECT key, value, type FROM public.settings ORDER BY key;
```

### 3. Test Permissions

Jalankan query ini untuk memastikan permissions sudah benar:

```sql
-- Check table permissions
SELECT 
    tablename,
    tableowner,
    has_table_privilege('anon', tablename, 'SELECT') as anon_select,
    has_table_privilege('anon', tablename, 'INSERT') as anon_insert,
    has_table_privilege('anon', tablename, 'UPDATE') as anon_update,
    has_table_privilege('anon', tablename, 'DELETE') as anon_delete
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'settings';
```

### 4. Perubahan Code yang Sudah Dilakukan

1. **Fixed `settings-service.ts`**:
   - Method `getAllSettings()` sekarang mengembalikan object key-value pairs
   - Method `bulkUpdateSettings()` sekarang bisa create setting baru jika belum ada
   
2. **Fixed `starsender-service.ts`**:
   - Method `getApiKeys()` sekarang menggunakan `getSettingsAsObject()` yang benar

### 5. Clear Browser Cache

Setelah semua langkah di atas:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh halaman settings
3. Coba simpan pengaturan lagi

### 6. Troubleshooting

Jika masih ada masalah, cek:

1. **Browser Console** untuk error messages
2. **Network Tab** untuk melihat response dari API
3. **Supabase Dashboard** untuk melihat logs

### 7. Manual Update Settings (Optional)

Jika perlu update manual via SQL:

```sql
-- Update specific settings
UPDATE public.settings SET value = 'your-api-key' WHERE key = 'pakasir_api_key';
UPDATE public.settings SET value = 'your-slug' WHERE key = 'pakasir_slug';
UPDATE public.settings SET value = 'your-account-key' WHERE key = 'starsender_account_key';
UPDATE public.settings SET value = 'your-device-key' WHERE key = 'starsender_device_key';
```

## Catatan Penting

- Pastikan Supabase URL dan Anon Key di `.env.local` sudah benar
- Settings akan otomatis dibuat saat pertama kali save jika belum ada
- Semua settings disimpan sebagai string di database, konversi dilakukan di aplikasi