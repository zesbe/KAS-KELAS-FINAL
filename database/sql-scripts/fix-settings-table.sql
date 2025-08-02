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