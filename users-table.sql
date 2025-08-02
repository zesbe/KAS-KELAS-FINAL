-- Users Table Schema for Supabase
-- Drop existing table if needed (be careful in production!)
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT auth.uid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'bendahara' CHECK (role IN ('admin', 'bendahara', 'guru', 'viewer')),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    school_name VARCHAR(255),
    class_name VARCHAR(100),
    address TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can manage all users
CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'bendahara'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample users (optional - remove in production)
INSERT INTO public.users (id, email, role, full_name, phone, school_name, class_name, address) VALUES
('d7c3f8a9-5b2e-4c1d-9e8f-3a2b1c4d5e6f', 'admin@sekolah.com', 'admin', 'Administrator', '628123456789', 'SD Negeri 01 Jakarta', 'Admin', 'Jl. Pendidikan No. 1, Jakarta', true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'bendahara@sekolah.com', 'bendahara', 'Ibu Sari Wulandari', '628123456789', 'SD Negeri 01 Jakarta', 'Kelas 1A', 'Jl. Pendidikan No. 123, Jakarta Selatan', true),
('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'guru@sekolah.com', 'guru', 'Pak Ahmad Hidayat', '628234567890', 'SD Negeri 01 Jakarta', 'Kelas 1A', 'Jl. Guru No. 45, Jakarta Selatan', true)
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;