-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR CBT ONLINE ASSESSMENT SYSTEM
-- SMA NEGERI 2 KEBUMEN
-- ====================================================================

-- 1. TABEL STUDENTS (DATA SISWA)
CREATE TABLE IF NOT EXISTS public.students (
    nisn VARCHAR(20) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kelas VARCHAR(20) NOT NULL,
    jenis_kelamin VARCHAR(20) NOT NULL,
    agama VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index lookup untuk NISN dan Kelas
CREATE INDEX IF NOT EXISTS idx_students_kelas ON public.students(kelas);

-- 2. TABEL EXAMS (BANK SOAL & FORM)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul_soal VARCHAR(150) NOT NULL,
    target_kelas TEXT[] NOT NULL, -- Array string kelas contoh: ['X-1', 'X-2', 'XII-MIPA 1']
    google_form_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL SYSTEM_SETTINGS (DYNAMIC TOKEN & GLOBAL CONFIG)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default secret key
INSERT INTO public.system_settings (key, value)
VALUES ('token_secret_key', 'SMANDA_CBT_SECURE_TOKEN_SECRET_2026')
ON CONFLICT (key) DO NOTHING;

-- 4. TABEL EXAM_LOGS (PROCTORING AUDIT LOG)
CREATE TABLE IF NOT EXISTS public.exam_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) REFERENCES public.students(nisn) ON DELETE CASCADE,
    nama_siswa VARCHAR(100),
    kelas VARCHAR(20),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    judul_soal VARCHAR(150),
    violation_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED'
    last_violation_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_logs_nisn ON public.exam_logs(nisn);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo/client usage
CREATE POLICY "Allow public read access to students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public write access to students" ON public.students FOR ALL USING (true);

CREATE POLICY "Allow public read access to exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Allow public write access to exams" ON public.exams FOR ALL USING (true);

CREATE POLICY "Allow public read access to settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow public write access to settings" ON public.system_settings FOR ALL USING (true);

CREATE POLICY "Allow public read/write to logs" ON public.exam_logs FOR ALL USING (true);

-- 5. TABEL ADMIN_USERS (OTENTIKASI ADMIN GURU)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    nama_admin VARCHAR(100) DEFAULT 'Administrator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default admin user: guru / guru
INSERT INTO public.admin_users (username, password, nama_admin)
VALUES ('guru', 'guru', 'Admin Guru CBT')
ON CONFLICT (username) DO NOTHING;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read/write to admin_users" ON public.admin_users FOR ALL USING (true);

-- Seed Sample Data for initial testing
INSERT INTO public.students (nisn, nama, kelas, jenis_kelamin, agama) VALUES
('1234567890', 'Ahmad Rizky Pratama', 'XII-MIPA 1', 'Laki-laki', 'Islam'),
('9876543210', 'Siti Nurhaliza', 'XII-MIPA 1', 'Perempuan', 'Islam'),
('1122334455', 'Budi Santoso', 'XI-IPS 2', 'Laki-laki', 'Kristen')
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO public.exams (judul_soal, target_kelas, google_form_url, is_active) VALUES
('Ujian Akhir Semester - Matematika Wajib XII', ARRAY['XII-MIPA 1', 'XII-MIPA 2', 'XII-IPS 1'], 'https://docs.google.com/forms/d/e/1FAIpQLSe_ExampleMathFormForSMANDAKebumen/viewform?embedded=true', true),
('Penilaian Harian - Fisika Kuantum XI', ARRAY['XI-IPS 2', 'XI-IPA 1'], 'https://docs.google.com/forms/d/e/1FAIpQLSc_ExamplePhysicsFormSMANDA/viewform?embedded=true', true)
ON CONFLICT DO NOTHING;
