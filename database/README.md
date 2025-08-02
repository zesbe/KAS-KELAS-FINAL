# Database Scripts

Folder ini berisi semua script SQL yang diperlukan untuk setup database Kas Kelas di Supabase.

## Urutan Eksekusi

Jalankan script SQL berikut secara berurutan di Supabase SQL Editor:

1. **database-setup.sql** - Setup tabel utama dan struktur database
2. **users-table.sql** - Tabel user authentication custom
3. **expense-categories.sql** - Kategori pengeluaran default
4. **sample-data.sql** - Data sample untuk testing
5. **update-expenses-data.sql** - Update data pengeluaran
6. **cleanup-sessions.sql** - Script untuk cleanup session expired

## Cara Menjalankan

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Pergi ke SQL Editor
4. Copy paste isi setiap file SQL dan jalankan secara berurutan
5. Pastikan tidak ada error sebelum lanjut ke file berikutnya

## Catatan Penting

- Pastikan menjalankan `database-setup.sql` terlebih dahulu karena berisi struktur tabel utama
- Script `sample-data.sql` opsional, hanya untuk testing
- Script `cleanup-sessions.sql` bisa dijalankan berkala untuk membersihkan session expired

## Default Users

Setelah menjalankan script, tersedia user default:

| Username | Password | Role |
|----------|----------|------|
| bendahara | kaskelas123 | bendahara |
| admin | admin123 | admin |
| guru | guru123 | user |

**⚠️ PENTING**: Ganti password default ini di production!