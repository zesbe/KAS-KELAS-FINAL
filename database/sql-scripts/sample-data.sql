-- Sample Data for KasKelas Application
-- This file contains sample data for testing purposes

-- Clear existing data (be careful with this in production!)
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE expenses CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE payment_categories CASCADE;
TRUNCATE TABLE expense_categories CASCADE;
TRUNCATE TABLE users CASCADE;

-- Insert sample users
INSERT INTO public.users (id, email, role, full_name, phone, school_name, class_name, address, created_at) VALUES
('d7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'bendahara@sekolah.com', 'bendahara', 'Ibu Sari Wulandari', '628123456789', 'SD Negeri 01 Jakarta', 'Kelas 1A', 'Jl. Pendidikan No. 123, Jakarta Selatan', NOW() - INTERVAL '6 months'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'guru@sekolah.com', 'guru', 'Pak Ahmad Hidayat', '628234567890', 'SD Negeri 01 Jakarta', 'Kelas 1A', 'Jl. Guru No. 45, Jakarta Selatan', NOW() - INTERVAL '5 months');

-- Insert payment categories
INSERT INTO public.payment_categories (id, name, description, default_amount, is_monthly, is_active) VALUES
('cat-001', 'Kas Bulanan', 'Iuran kas bulanan untuk kegiatan kelas', 25000, true, true),
('cat-002', 'Kegiatan Ekstrakurikuler', 'Biaya untuk kegiatan ekstrakurikuler', 50000, false, true),
('cat-003', 'Study Tour', 'Biaya untuk study tour tahunan', 150000, false, true),
('cat-004', 'Buku Paket', 'Pembelian buku paket semester', 75000, false, true);

-- Insert expense categories
INSERT INTO public.expense_categories (id, name, description, is_active) VALUES
('exp-001', 'Alat Tulis', 'Pembelian alat tulis untuk kelas', true),
('exp-002', 'Dekorasi Kelas', 'Biaya dekorasi dan hiasan kelas', true),
('exp-003', 'Konsumsi', 'Makanan dan minuman untuk acara kelas', true),
('exp-004', 'Hadiah', 'Hadiah untuk siswa berprestasi', true),
('exp-005', 'Kebersihan', 'Peralatan kebersihan kelas', true),
('exp-006', 'Fotokopi', 'Biaya fotokopi materi pembelajaran', true);

-- Insert sample students
INSERT INTO public.students (id, nama, nomor_absen, nomor_hp_ortu, nama_ortu, email_ortu, alamat, kelas, is_active, created_at) VALUES
('std-001', 'Ahmad Rizki Pratama', 1, '628123456789', 'Budi Santoso', 'budi.santoso@email.com', 'Jl. Merdeka No. 123, Jakarta Selatan', '1A', true, NOW() - INTERVAL '6 months'),
('std-002', 'Siti Nurhaliza', 2, '628234567890', 'Sari Dewi', 'sari.dewi@email.com', 'Jl. Kebon Jeruk No. 45, Jakarta Barat', '1A', true, NOW() - INTERVAL '6 months'),
('std-003', 'Muhammad Fajar Alamsyah', 3, '628345678901', 'Andi Wijaya', 'andi.wijaya@email.com', 'Jl. Sudirman No. 67, Jakarta Pusat', '1A', true, NOW() - INTERVAL '6 months'),
('std-004', 'Aisyah Putri Ramadhani', 4, '628456789012', 'Indah Permata', 'indah.permata@email.com', 'Jl. Gatot Subroto No. 89, Jakarta Selatan', '1A', true, NOW() - INTERVAL '6 months'),
('std-005', 'Rizky Ramadhan', 5, '628567890123', 'Agus Setiawan', 'agus.setiawan@email.com', 'Jl. Kuningan No. 101, Jakarta Selatan', '1A', true, NOW() - INTERVAL '6 months'),
('std-006', 'Nabila Azzahra', 6, '628678901234', 'Ratna Sari', 'ratna.sari@email.com', 'Jl. Tebet No. 112, Jakarta Selatan', '1A', true, NOW() - INTERVAL '5 months'),
('std-007', 'Kevin Alamsyah', 7, '628789012345', 'Hendra Kusuma', 'hendra.kusuma@email.com', 'Jl. Kemang No. 134, Jakarta Selatan', '1A', true, NOW() - INTERVAL '5 months'),
('std-008', 'Zahra Amelia', 8, '628890123456', 'Diana Putri', 'diana.putri@email.com', 'Jl. Pondok Indah No. 156, Jakarta Selatan', '1A', true, NOW() - INTERVAL '5 months'),
('std-009', 'Farhan Abdullah', 9, '628901234567', 'Abdullah Rahman', 'abdullah.rahman@email.com', 'Jl. Cilandak No. 178, Jakarta Selatan', '1A', true, NOW() - INTERVAL '4 months'),
('std-010', 'Alya Safitri', 10, '628012345678', 'Safitri Handayani', 'safitri.handayani@email.com', 'Jl. Fatmawati No. 190, Jakarta Selatan', '1A', true, NOW() - INTERVAL '4 months');

-- Insert sample payments (mix of paid and pending)
-- January payments
INSERT INTO public.payments (id, student_id, category_id, amount, order_id, status, payment_method, pakasir_payment_url, due_date, completed_at, created_at) VALUES
('pay-001', 'std-001', 'cat-001', 25000, 'KAS202401001', 'paid', 'qris', 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202401001', '2024-01-05', '2024-01-03 10:30:00', '2024-01-01'),
('pay-002', 'std-002', 'cat-001', 25000, 'KAS202401002', 'paid', 'bank_transfer', 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202401002', '2024-01-05', '2024-01-04 14:20:00', '2024-01-01'),
('pay-003', 'std-003', 'cat-001', 25000, 'KAS202401003', 'paid', 'qris', 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202401003', '2024-01-05', '2024-01-05 09:15:00', '2024-01-01'),
('pay-004', 'std-004', 'cat-001', 25000, 'KAS202401004', 'paid', 'qris', 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202401004', '2024-01-05', '2024-01-02 11:45:00', '2024-01-01'),
('pay-005', 'std-005', 'cat-001', 25000, 'KAS202401005', 'pending', NULL, 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202401005', '2024-01-05', NULL, '2024-01-01'),
('pay-006', 'std-006', 'cat-001', 25000, 'KAS202401006', 'paid', 'bank_transfer', 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202401006', '2024-01-05', '2024-01-04 16:30:00', '2024-01-01'),
('pay-007', 'std-007', 'cat-001', 25000, 'KAS202401007', 'paid', 'qris', 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202401007', '2024-01-05', '2024-01-03 13:20:00', '2024-01-01'),
('pay-008', 'std-008', 'cat-001', 25000, 'KAS202401008', 'pending', NULL, 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202401008', '2024-01-05', NULL, '2024-01-01'),
('pay-009', 'std-009', 'cat-001', 25000, 'KAS202401009', 'paid', 'qris', 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202401009', '2024-01-05', '2024-01-05 15:10:00', '2024-01-01'),
('pay-010', 'std-010', 'cat-001', 25000, 'KAS202401010', 'paid', 'bank_transfer', 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202401010', '2024-01-05', '2024-01-04 10:00:00', '2024-01-01');

-- February payments (current month)
INSERT INTO public.payments (id, student_id, category_id, amount, order_id, status, payment_method, pakasir_payment_url, due_date, completed_at, created_at) VALUES
('pay-011', 'std-001', 'cat-001', 25000, 'KAS202402001', 'paid', 'qris', 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202402001', '2024-02-05', '2024-02-02 09:30:00', '2024-02-01'),
('pay-012', 'std-002', 'cat-001', 25000, 'KAS202402002', 'pending', NULL, 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202402002', '2024-02-05', NULL, '2024-02-01'),
('pay-013', 'std-003', 'cat-001', 25000, 'KAS202402003', 'pending', NULL, 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202402003', '2024-02-05', NULL, '2024-02-01'),
('pay-014', 'std-004', 'cat-001', 25000, 'KAS202402004', 'paid', 'bank_transfer', 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202402004', '2024-02-05', '2024-02-03 14:20:00', '2024-02-01'),
('pay-015', 'std-005', 'cat-001', 25000, 'KAS202402005', 'pending', NULL, 'https://pakasir.zone.id/pay/uangkasalhusna/25000?order_id=KAS202402005', '2024-02-05', NULL, '2024-02-01');

-- Special payments (Study Tour)
INSERT INTO public.payments (id, student_id, category_id, amount, order_id, status, payment_method, pakasir_payment_url, due_date, completed_at, created_at) VALUES
('pay-016', 'std-001', 'cat-003', 150000, 'ST202402001', 'paid', 'bank_transfer', 'https://pakasir.zone.id/pay/uangkasalhusna/150000?order_id=ST202402001', '2024-02-15', '2024-02-10 10:00:00', '2024-02-01'),
('pay-017', 'std-002', 'cat-003', 150000, 'ST202402002', 'pending', NULL, 'https://pakasir.zone.id/pay/uangkasalhusna/150000?order_id=ST202402002', '2024-02-15', NULL, '2024-02-01'),
('pay-018', 'std-003', 'cat-003', 150000, 'ST202402003', 'paid', 'qris', 'https://pakasir.zone.id/pay/uangkasalhusna/150000?order_id=ST202402003', '2024-02-15', '2024-02-08 11:30:00', '2024-02-01');

-- Insert sample expenses
INSERT INTO public.expenses (id, description, amount, category_id, date, receipt_url, created_by, approved_by, status, notes, created_at) VALUES
('exp-001', 'Pembelian alat tulis kelas (pensil, penghapus, spidol)', 125000, 'exp-001', '2024-01-15', NULL, 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'approved', 'Untuk kebutuhan kegiatan belajar mengajar', '2024-01-15'),
('exp-002', 'Dekorasi kelas tema "Cinta Lingkungan"', 75000, 'exp-002', '2024-01-12', NULL, 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'approved', 'Dekorasi untuk bulan Januari', '2024-01-12'),
('exp-003', 'Snack untuk acara perpisahan semester', 200000, 'exp-003', '2024-01-20', NULL, 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', NULL, 'pending', 'Menunggu persetujuan komite orang tua', '2024-01-20'),
('exp-004', 'Hadiah untuk juara lomba kebersihan kelas', 50000, 'exp-004', '2024-01-08', NULL, 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'approved', 'Hadiah berupa alat tulis', '2024-01-08'),
('exp-005', 'Pembelian sapu dan pel untuk kelas', 45000, 'exp-005', '2024-02-01', NULL, 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'approved', 'Peralatan kebersihan bulanan', '2024-02-01'),
('exp-006', 'Fotokopi materi ujian tengah semester', 35000, 'exp-006', '2024-02-05', NULL, 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', NULL, 'pending', '100 lembar x 10 siswa', '2024-02-05'),
('exp-007', 'Pembelian kertas HVS untuk kegiatan', 60000, 'exp-001', '2024-02-03', NULL, 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'approved', '3 rim kertas HVS A4', '2024-02-03');

-- Update settings with actual data
UPDATE public.settings SET value = 'KasKelas 1A - SD Negeri 01 Jakarta' WHERE key = 'app_name';
UPDATE public.settings SET value = 'Kelas 1A - SD Negeri 01 Jakarta' WHERE key = 'class_name';
UPDATE public.settings SET value = 'Ibu Sari Wulandari' WHERE key = 'treasurer_name';
UPDATE public.settings SET value = '628123456789' WHERE key = 'treasurer_phone';

-- Add some WhatsApp broadcast history
INSERT INTO public.whatsapp_broadcasts (id, type, total_recipients, successful_sends, failed_sends, message_template, created_by, created_at) VALUES
('wb-001', 'payment_reminder', 5, 4, 1, 'default', 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', '2024-02-01 10:00:00'),
('wb-002', 'custom_message', 10, 10, 0, 'custom', 'd7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', '2024-01-15 14:30:00');

-- Add activity logs
INSERT INTO public.activity_logs (user_id, action, description, ip_address, user_agent, created_at) VALUES
('d7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'login', 'User logged in', '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL '1 hour'),
('d7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'create_payment', 'Created payment for February', '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL '2 hours'),
('d7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'approve_expense', 'Approved expense for stationery', '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL '3 hours');

-- Calculate and update balance
UPDATE public.balance SET 
    total_income = (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'paid'),
    total_expenses = (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE status = 'approved'),
    last_updated = NOW()
WHERE id = 1;

-- Update current balance
UPDATE public.balance SET 
    current_balance = total_income - total_expenses
WHERE id = 1;

COMMIT;