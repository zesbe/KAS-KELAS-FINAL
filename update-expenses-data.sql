-- =================================================================
-- UPDATE EXPENSES WITH REALISTIC DATA
-- =================================================================
-- Jalankan script ini di Supabase SQL Editor untuk mengganti data dummy dengan data realistis

-- Hapus semua data expenses lama
DELETE FROM public.expenses;

-- Insert realistic expense examples for school class fund
INSERT INTO public.expenses (
    category_id, 
    title, 
    deskripsi, 
    amount, 
    tanggal, 
    toko_tempat, 
    metode_pembayaran, 
    status, 
    created_by_user_id
) VALUES 
-- Alat Tulis (Office Supplies)
(
    (SELECT id FROM public.expense_categories WHERE name = 'Alat Tulis' LIMIT 1),
    'Kertas A4 dan Spidol Board Marker',
    'Pembelian 2 rim kertas A4 80gr dan 6 buah spidol board marker berbagai warna untuk keperluan pembelajaran harian dan membuat materi kelas',
    87500,
    '2024-12-15',
    'Toko ATK Gramedia',
    'transfer',
    'approved',
    (SELECT id FROM public.app_users WHERE username = 'bendahara' LIMIT 1)
),
(
    (SELECT id FROM public.expense_categories WHERE name = 'Alat Tulis' LIMIT 1),
    'Pensil, Penghapus, dan Penggaris',
    'Stok alat tulis cadangan untuk siswa yang lupa membawa: 20 pensil 2B, 15 penghapus, 10 penggaris 30cm',
    52000,
    '2025-01-10',
    'Toko Mandiri Stationery',
    'cash',
    'approved',
    (SELECT id FROM public.app_users WHERE username = 'bendahara' LIMIT 1)
),

-- Snack & Minuman
(
    (SELECT id FROM public.expense_categories WHERE name = 'Snack & Minuman' LIMIT 1),
    'Perayaan Ulang Tahun Siti Nurhaliza',
    'Kue tart ulang tahun ukuran sedang, minuman kotak, dan permen untuk merayakan ulang tahun Siti bersama teman-teman sekelas',
    125000,
    '2024-12-20',
    'Toko Kue Sari Roti',
    'qris',
    'approved',
    (SELECT id FROM public.app_users WHERE username = 'bendahara' LIMIT 1)
),
(
    (SELECT id FROM public.expense_categories WHERE name = 'Snack & Minuman' LIMIT 1),
    'Snack Kegiatan Belajar Kelompok',
    'Biskuit, wafer, dan minuman untuk kegiatan belajar kelompok matematika dan bahasa Indonesia',
    65000,
    '2025-01-08',
    'Indomaret',
    'cash',
    'approved',
    (SELECT id FROM public.app_users WHERE username = 'guru' LIMIT 1)
),

-- Dekorasi Kelas
(
    (SELECT id FROM public.expense_categories WHERE name = 'Dekorasi Kelas' LIMIT 1),
    'Poster Edukasi dan Hiasan Dinding',
    'Poster perkalian, peta Indonesia, alfabet, dan border hiasan untuk mempercantik dan mengedukasi ruang kelas',
    78000,
    '2025-01-05',
    'Toko Pendidikan Cerdas',
    'cash',
    'pending',
    (SELECT id FROM public.app_users WHERE username = 'admin' LIMIT 1)
),
(
    (SELECT id FROM public.expense_categories WHERE name = 'Dekorasi Kelas' LIMIT 1),
    'Gorden dan Tirai Jendela',
    'Gorden biru muda untuk jendela kelas agar ruangan lebih nyaman dan tidak silau saat belajar',
    150000,
    '2024-12-28',
    'Toko Gorden Indah',
    'transfer',
    'approved',
    (SELECT id FROM public.app_users WHERE username = 'bendahara' LIMIT 1)
),

-- Hadiah & Reward
(
    (SELECT id FROM public.expense_categories WHERE name = 'Hadiah & Reward' LIMIT 1),
    'Hadiah Siswa Ranking 1-3 Semester',
    'Buku cerita anak, alat tulis premium, dan sertifikat untuk 3 siswa dengan nilai terbaik semester ini',
    180000,
    '2024-12-22',
    'Gramedia',
    'transfer',
    'approved',
    (SELECT id FROM public.app_users WHERE username = 'bendahara' LIMIT 1)
),
(
    (SELECT id FROM public.expense_categories WHERE name = 'Hadiah & Reward' LIMIT 1),
    'Stiker dan Stamp Motivasi',
    'Stiker bintang, smile, dan good job untuk memberikan reward kepada siswa yang aktif dan berprestasi',
    35000,
    '2025-01-12',
    'Toko ATK Online',
    'qris',
    'pending',
    (SELECT id FROM public.app_users WHERE username = 'guru' LIMIT 1)
),

-- Administrasi
(
    (SELECT id FROM public.expense_categories WHERE name = 'Administrasi' LIMIT 1),
    'Fotocopy Soal Ulangan dan LKS',
    'Fotocopy soal ulangan tengah semester untuk 25 siswa dan lembar kerja siswa (LKS) matematika dan bahasa Indonesia',
    45000,
    '2025-01-15',
    'Fotocopy Bu Ani',
    'cash',
    'approved',
    (SELECT id FROM public.app_users WHERE username = 'bendahara' LIMIT 1)
),
(
    (SELECT id FROM public.expense_categories WHERE name = 'Administrasi' LIMIT 1),
    'Amplop dan Map Raport',
    'Amplop coklat untuk surat menyurat dan map plastik untuk menyimpan raport dan dokumen penting siswa',
    28000,
    '2024-12-30',
    'Toko Wijaya',
    'cash',
    'approved',
    (SELECT id FROM public.app_users WHERE username = 'admin' LIMIT 1)
),

-- Additional realistic expenses
(
    (SELECT id FROM public.expense_categories WHERE name = 'Alat Tulis' LIMIT 1),
    'Double Tape dan Lem Stick',
    'Double tape besar 2 buah dan lem stick 5 buah untuk kegiatan prakarya dan menempel hasil karya siswa',
    32000,
    '2025-01-20',
    'Toko Serba Ada',
    'cash',
    'pending',
    (SELECT id FROM public.app_users WHERE username = 'guru' LIMIT 1)
),
(
    (SELECT id FROM public.expense_categories WHERE name = 'Snack & Minuman' LIMIT 1),
    'Perayaan Prestasi Lomba Cerdas Cermat',
    'Pizza dan minuman untuk merayakan juara 2 lomba cerdas cermat tingkat kecamatan yang diraih oleh tim kelas 1A',
    200000,
    '2025-01-18',
    'Pizza Hut',
    'transfer',
    'approved',
    (SELECT id FROM public.app_users WHERE username = 'bendahara' LIMIT 1)
),

-- Pengeluaran bulan Januari 2025 (terbaru)
(
    (SELECT id FROM public.expense_categories WHERE name = 'Alat Tulis' LIMIT 1),
    'Tinta Printer dan Kertas Photo',
    'Tinta printer Canon hitam dan warna, kertas photo untuk mencetak foto kegiatan dan sertifikat siswa',
    95000,
    '2025-01-25',
    'Toko Komputer Jaya',
    'transfer',
    'approved',
    (SELECT id FROM public.app_users WHERE username = 'bendahara' LIMIT 1)
),
(
    (SELECT id FROM public.expense_categories WHERE name = 'Dekorasi Kelas' LIMIT 1),
    'Papan Tulis Kecil dan Spons',
    'Papan tulis kecil 3 buah untuk belajar kelompok dan spons pembersih papan tulis',
    45000,
    '2025-01-28',
    'Toko Pendidikan Maju',
    'cash',
    'pending',
    (SELECT id FROM public.app_users WHERE username = 'admin' LIMIT 1)
),
(
    (SELECT id FROM public.expense_categories WHERE name = 'Snack & Minuman' LIMIT 1),
    'Snack Rapat Orang Tua',
    'Konsumsi untuk rapat orang tua murid: air mineral, kue kering, dan permen',
    120000,
    '2025-01-30',
    'Catering Ibu Sari',
    'cash',
    'approved',
    (SELECT id FROM public.app_users WHERE username = 'bendahara' LIMIT 1)
);

-- Tampilkan ringkasan data yang baru diinsert
DO $$ 
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'DATA PENGELUARAN BERHASIL DIPERBARUI!';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Total pengeluaran: % record', (SELECT COUNT(*) FROM public.expenses);
    RAISE NOTICE 'Status Approved: % record', (SELECT COUNT(*) FROM public.expenses WHERE status = 'approved');
    RAISE NOTICE 'Status Pending: % record', (SELECT COUNT(*) FROM public.expenses WHERE status = 'pending');
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Ringkasan per kategori:';
    RAISE NOTICE 'Alat Tulis: % record', (SELECT COUNT(*) FROM public.expenses e JOIN public.expense_categories c ON e.category_id = c.id WHERE c.name = 'Alat Tulis');
    RAISE NOTICE 'Snack & Minuman: % record', (SELECT COUNT(*) FROM public.expenses e JOIN public.expense_categories c ON e.category_id = c.id WHERE c.name = 'Snack & Minuman');
    RAISE NOTICE 'Dekorasi Kelas: % record', (SELECT COUNT(*) FROM public.expenses e JOIN public.expense_categories c ON e.category_id = c.id WHERE c.name = 'Dekorasi Kelas');
    RAISE NOTICE 'Hadiah & Reward: % record', (SELECT COUNT(*) FROM public.expenses e JOIN public.expense_categories c ON e.category_id = c.id WHERE c.name = 'Hadiah & Reward');
    RAISE NOTICE 'Administrasi: % record', (SELECT COUNT(*) FROM public.expenses e JOIN public.expense_categories c ON e.category_id = c.id WHERE c.name = 'Administrasi');
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Total pengeluaran: Rp %', (SELECT SUM(amount) FROM public.expenses WHERE status = 'approved');
    RAISE NOTICE 'Pengeluaran pending: Rp %', (SELECT COALESCE(SUM(amount), 0) FROM public.expenses WHERE status = 'pending');
    RAISE NOTICE '=================================================================';
END $$;