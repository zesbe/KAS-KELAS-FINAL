-- Expense Categories Table and Sample Data

-- Create expense_categories table if not exists
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_expense_categories_is_active ON public.expense_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_expense_categories_name ON public.expense_categories(name);

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description, is_active) VALUES
('Alat Tulis', 'Pembelian alat tulis untuk kegiatan belajar mengajar', true),
('Dekorasi Kelas', 'Biaya untuk dekorasi dan hiasan kelas', true),
('Konsumsi', 'Makanan dan minuman untuk acara kelas', true),
('Hadiah', 'Hadiah untuk siswa berprestasi atau acara tertentu', true),
('Kebersihan', 'Peralatan kebersihan kelas', true),
('Fotokopi', 'Biaya fotokopi materi pembelajaran', true),
('Transportasi', 'Biaya transportasi untuk kegiatan kelas', true),
('Peralatan Kelas', 'Pembelian peralatan kelas (papan tulis, penghapus, dll)', true),
('Kegiatan Sosial', 'Biaya untuk kegiatan sosial kelas', true),
('Lain-lain', 'Pengeluaran lainnya yang tidak termasuk kategori di atas', true)
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT ALL ON public.expense_categories TO authenticated;
GRANT SELECT ON public.expense_categories TO anon;