-- =================================================================
-- KAS KELAS - DATABASE SETUP SCRIPT
-- =================================================================
-- Jalankan script ini di Supabase SQL Editor atau PostgreSQL

-- Enable Row Level Security (RLS) extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- 1. STUDENTS TABLE - Data Siswa
-- =================================================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    nomor_absen INTEGER NOT NULL UNIQUE,
    nomor_hp_ortu VARCHAR(20) NOT NULL,
    nama_ortu VARCHAR(100) NOT NULL,
    email_ortu VARCHAR(100),
    alamat TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk optimasi
CREATE INDEX IF NOT EXISTS idx_students_nomor_absen ON public.students(nomor_absen);
CREATE INDEX IF NOT EXISTS idx_students_is_active ON public.students(is_active);
CREATE INDEX IF NOT EXISTS idx_students_nama ON public.students(nama);

-- =================================================================
-- 2. PAYMENT CATEGORIES TABLE - Kategori Pembayaran
-- =================================================================
CREATE TABLE IF NOT EXISTS public.payment_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_amount DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default payment categories
INSERT INTO public.payment_categories (name, description, default_amount) VALUES 
('Kas Kelas Bulanan', 'Iuran kas kelas per bulan', 25000),
('Kas Kegiatan', 'Kas untuk kegiatan kelas khusus', 50000),
('Kas Ulang Tahun', 'Kas untuk perayaan ulang tahun teman sekelas', 15000)
ON CONFLICT DO NOTHING;

-- =================================================================
-- 3. PAYMENTS TABLE - Data Pembayaran
-- =================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.payment_categories(id),
    amount DECIMAL(10,2) NOT NULL,
    order_id VARCHAR(100) UNIQUE NOT NULL,
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

-- Index untuk optimasi
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- =================================================================
-- 4. EXPENSE CATEGORIES TABLE - Kategori Pengeluaran
-- =================================================================
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description, color) VALUES 
('Alat Tulis', 'Pembelian alat tulis untuk kelas', '#EF4444'),
('Snack & Minuman', 'Konsumsi untuk kegiatan kelas', '#F59E0B'),
('Dekorasi Kelas', 'Hiasan dan dekorasi ruang kelas', '#10B981'),
('Hadiah & Reward', 'Hadiah untuk siswa berprestasi', '#8B5CF6'),
('Administrasi', 'Biaya administrasi dan cetak', '#6B7280')
ON CONFLICT DO NOTHING;

-- =================================================================
-- 5. EXPENSES TABLE - Data Pengeluaran
-- =================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES public.expense_categories(id),
    deskripsi TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    bukti_foto_url TEXT,
    tanggal DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by VARCHAR(100) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk optimasi
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tanggal ON public.expenses(tanggal);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);

-- =================================================================
-- 6. WHATSAPP_LOGS TABLE - Log Pesan WhatsApp
-- =================================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    phone_number VARCHAR(20) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    message_content TEXT NOT NULL,
    wapanels_response JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('sent', 'delivered', 'failed', 'pending')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_reason TEXT
);

-- Index untuk optimasi
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_student_id ON public.whatsapp_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON public.whatsapp_logs(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_sent_at ON public.whatsapp_logs(sent_at);

-- =================================================================
-- 7. PAYMENT_REMINDERS TABLE - Reminder Pembayaran
-- =================================================================
CREATE TABLE IF NOT EXISTS public.payment_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20) CHECK (reminder_type IN ('before_due', 'on_due', 'after_due_3', 'after_due_7')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    whatsapp_log_id UUID REFERENCES public.whatsapp_logs(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk optimasi
CREATE INDEX IF NOT EXISTS idx_payment_reminders_payment_id ON public.payment_reminders(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_scheduled_at ON public.payment_reminders(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_status ON public.payment_reminders(status);

-- =================================================================
-- 8. SETTINGS TABLE - Pengaturan Aplikasi
-- =================================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'number', 'boolean', 'json')),
    updated_by VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.settings (key, value, description, type) VALUES 
('app_name', 'KasKelas 1A', 'Nama aplikasi kas kelas', 'text'),
('class_name', 'Kelas 1A - SD Indonesia', 'Nama kelas lengkap', 'text'),
('monthly_fee', '25000', 'Iuran kas bulanan default', 'number'),
('whatsapp_api_enabled', 'true', 'Enable/disable WhatsApp integration', 'boolean'),
('reminder_before_due', '3', 'Hari sebelum jatuh tempo untuk reminder', 'number'),
('reminder_after_due', '7', 'Hari setelah jatuh tempo untuk reminder kedua', 'number'),
('treasurer_name', 'Ibu Sari', 'Nama bendahara kelas', 'text'),
('treasurer_phone', '628123456789', 'Nomor HP bendahara', 'text')
ON CONFLICT (key) DO NOTHING;

-- =================================================================
-- 9. FUNCTIONS & TRIGGERS
-- =================================================================

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers untuk auto-update timestamp
DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON public.students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON public.payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at 
    BEFORE UPDATE ON public.expenses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (untuk development)
-- Dalam production, buat policy yang lebih spesifik
CREATE POLICY "Allow all for authenticated users" ON public.students FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.payment_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.payments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.expense_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.expenses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.whatsapp_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.payment_reminders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.settings FOR ALL TO authenticated USING (true);

-- Allow full access for anon users (karena app menggunakan anon key)
CREATE POLICY "Allow all for anon" ON public.students FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON public.payment_categories FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON public.payments FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON public.expense_categories FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON public.expenses FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON public.whatsapp_logs FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON public.payment_reminders FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON public.settings FOR ALL TO anon USING (true);

-- =================================================================
-- 11. SAMPLE DATA INSERT
-- =================================================================

-- Insert sample students data
INSERT INTO public.students (id, nama, nomor_absen, nomor_hp_ortu, nama_ortu, email_ortu, alamat, is_active) VALUES 
('5b92ea20-ed51-4042-bebb-c0462d4243ce', 'Ahmad Rizki Pratama', 1, '628123456789', 'Budi Santoso', 'budi.santoso@email.com', null, true),
('8a91a83c-6016-4d3e-b804-43f2e88a071a', 'Siti Nurhaliza', 2, '628234567890', 'Sari Dewi', 'sari.dewi@email.com', null, true),
('b84f562d-25d9-4402-a7cd-3a97acc82ca5', 'Muhammad Fajar', 3, '628345678901', 'Andi Wijaya', 'andi.wijaya@email.com', null, true),
('640bfb26-5d13-4206-9ac2-a70f6399a482', 'Aisyah Putri', 4, '628456789012', 'Indah Permata', 'indah.permata@email.com', null, true),
('ce9cf45f-e426-4dc3-864c-2dfef04cd565', 'Rizky Ramadhan', 5, '628567890123', 'Agus Setiawan', 'agus.setiawan@email.com', null, true),
('a3fbf3df-29c7-4d0b-8cea-f4cb5875796a', 'Fatimah Zahra', 6, '628678901234', 'Rina Marlina', 'rina.marlina@email.com', null, true),
('4cf12dd9-60c0-40e9-969a-1a6d41d1ade3', 'Bayu Aji', 7, '628789012345', 'Dedi Kurniawan', 'dedi.kurniawan@email.com', null, true),
('8b6c71a9-4178-47be-bdd0-f8428bf02e25', 'Nabila Azzahra', 8, '628890123456', 'Maya Sari', 'maya.sari@email.com', null, true),
('d82428b2-067f-41eb-877e-57e2f8a96fc5', 'Arief Budiman', 9, '628901234567', 'Hendra Pratama', 'hendra.pratama@email.com', null, true),
('f8377d8f-38d3-49b8-b1ae-8b8dac37d703', 'Zahra Aulia', 10, '628012345678', 'Dewi Lestari', 'dewi.lestari@email.com', null, true),
('743fca0d-dccd-4db6-892a-6169c431b41c', 'Kevin Alamsyah', 11, '628123456780', 'Bambang Sutopo', 'bambang.sutopo@email.com', null, true),
('d4bc6e72-16bf-4870-ba26-a22351e988d5', 'Putri Maharani', 12, '628234567891', 'Siska Wulandari', 'siska.wulandari@email.com', null, true),
('f8f00a03-d5bf-4528-b58a-47a21c451d1a', 'Dimas Pratama', 13, '628345678902', 'Rudi Hartono', 'rudi.hartono@email.com', null, true),
('62f7b5b8-9f2a-480c-a2ba-62d137d42551', 'Ayu Lestari', 14, '628456789013', 'Lia Amelia', 'lia.amelia@email.com', null, true),
('aa966e1d-ebe5-419c-bbb1-d1bcd342829f', 'Farhan Maulana', 15, '628567890124', 'Iwan Setiadi', 'iwan.setiadi@email.com', null, true),
('56e40b2f-8abd-4943-a28f-ab8aaca7fabc', 'Salma Alayya', 16, '628678901235', 'Nita Anggraini', 'nita.anggraini@email.com', null, true),
('9e92da93-fc2d-40da-9b22-d28082e735b6', 'Rian Kurniawan', 17, '628789012346', 'Joko Susilo', 'joko.susilo@email.com', null, true),
('5194c2af-0181-4241-b882-42360624f806', 'Kirana Dewi', 18, '628890123457', 'Fitri Handayani', 'fitri.handayani@email.com', null, true),
('f535bae2-7d98-4543-b1b0-178d17eda377', 'Galang Pratama', 19, '628901234568', 'Eko Prasetyo', 'eko.prasetyo@email.com', null, true),
('f05b6447-03c6-4826-8f6c-295c5448068c', 'Intan Permata', 20, '628012345679', 'Yuni Astuti', 'yuni.astuti@email.com', null, true),
('aa1942bb-784a-4e66-b497-ada8b9bc9284', 'Hafiz Abdullah', 21, '628123456781', 'Ahmad Fauzi', 'ahmad.fauzi@email.com', null, true),
('f673e41b-c99c-46e0-bf0b-23229b9af59f', 'Khaira Annisa', 22, '628234567892', 'Ratna Sari', 'ratna.sari@email.com', null, true),
('a2b64568-3fb8-4cac-ab59-0799285f0304', 'Alif Rahman', 23, '628345678903', 'Dani Ramadhan', 'dani.ramadhan@email.com', null, true),
('d89f5426-3ae2-452b-8008-7aeefd482776', 'Mawar Sari', 24, '628456789014', 'Evi Susanti', 'evi.susanti@email.com', null, true),
('41d0b256-0a07-40e0-9e8d-afb95fab989c', 'Naufal Akbar', 25, '628567890125', 'Benny Wijaya', 'benny.wijaya@email.com', null, true)
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- SETUP COMPLETE!
-- =================================================================

-- Tampilkan summary
DO $$ 
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'KAS KELAS DATABASE SETUP COMPLETED!';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '✅ students (% rows)', (SELECT COUNT(*) FROM public.students);
    RAISE NOTICE '✅ payment_categories (% rows)', (SELECT COUNT(*) FROM public.payment_categories);
    RAISE NOTICE '✅ payments (% rows)', (SELECT COUNT(*) FROM public.payments);
    RAISE NOTICE '✅ expense_categories (% rows)', (SELECT COUNT(*) FROM public.expense_categories);
    RAISE NOTICE '✅ expenses (% rows)', (SELECT COUNT(*) FROM public.expenses);
    RAISE NOTICE '✅ whatsapp_logs (% rows)', (SELECT COUNT(*) FROM public.whatsapp_logs);
    RAISE NOTICE '✅ payment_reminders (% rows)', (SELECT COUNT(*) FROM public.payment_reminders);
    RAISE NOTICE '✅ settings (% rows)', (SELECT COUNT(*) FROM public.settings);
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Verify tables in Supabase Dashboard';
    RAISE NOTICE '2. Test connection from your Next.js app';
    RAISE NOTICE '3. Start using the KasKelas application!';
    RAISE NOTICE '=================================================================';
END $$;