# PRODUCT REQUIREMENT DOCUMENT (PRD)

**Project Name:** CBT Online Assessment System (Google Form Based)  
**Target File Name:** `PRD.md`  
**Deployment Target:** GitHub + Domainesia (Custom Domain / Hosting)  
**Backend & Database:** Supabase (PostgreSQL + RLS)  
**Concurrent Users:** 350+ Students (Lightweight & Scalable)

---

## 1. Executive Summary & Core Concept

Sistem Ujian Online berbasis Google Form ini dirancang untuk memfasilitasi pelaksanaan evaluasi pembelajaran secara terstruktur, aman, dan ringan. Sistem mengintegrasikan iframe Google Form dengan layer pengawasan ketat (*browser lock & proctoring*) berbasis event tracking di sisi client dan integrasi Supabase di sisi backend.

---

## 2. Tech Stack & Infrastructure Architecture

*   **Frontend Framework:** React (Vite) / Next.js (App Router)
*   **Styling Engine:** Tailwind CSS
*   **Typography & Icons:** Font Poppins, Lucide React Icons
*   **Backend & Database:** Supabase (PostgreSQL, Realtime Subscriptions, Row Level Security)
*   **Hosting & Deployment:** GitHub Actions CI/CD to Domainesia (Static Export / Node Server)
*   **Design System:** Inspired by SMA Negeri 2 Kebumen Design System

---

## 3. UI/UX Design System Guidelines

Sesuai dengan panduan visual SMA Negeri 2 Kebumen:
*   **Primary Color:** Institutional Navy (`#133E59`) — Topbar, Header Nav, Heading
*   **Interactive Color:** Forest Green (`#1A936F`) — Primary Buttons, Active States, Success Icons
*   **Accent Colors:** Muted Teal (`#5CA08E`), Sky Blue (`#00ACED`), Coral Red (`#E95950` - Warning), Error Red (`#CC0001` - Violation)
*   **Backgrounds:** Pure White (`#FFFFFF`) & Light Gray (`#F3F3F3`)
*   **Font Family:** Poppins (`sans-serif`)
*   **Border Radius:** `5px` untuk tombol, `10px` untuk container/card, `0px` untuk form inputs

---

## 4. User Workflow & Detailed Functional Requirements

```
[ Page 1: Student Login (NISN) ]
               │
               ▼
[ Page 2: Student Data + Rules + Select Exam + Token Input ]
               │
               ▼
[ Modal 1: Fullscreen Agreement Modal ]
               │
               ▼
[ Page 3: Active Exam Room (Google Form Iframe + Proctoring) ]
               │
      ┌────────┴────────────────────────┐
      ▼                                 ▼
[ Anti-Cheat Triggered ]      [ Exam Completed ]
      │                                 │
[ Modal 2: Token Overlay ]    [ Modal 3: Confirmation ]
      │                                 │
[ Resume Fullscreen ]         [ Redirect Login ]
```

### 4.1 Halaman 1: Login Siswa
*   **Form Input:** NISN (Number input, validasi minimal numerik).
*   **Action:** Tombol "Masuk Ujian" (`#1A936F`). Memeriksa keberadaan NISN pada tabel `students` di Supabase.

### 4.2 Halaman 2: Verifikasi Data, Tata Tertib & Pilih Soal
*   **Layout Splitting (2 Kolom):**
    *   **Sisi Kiri (Tata Tertib Ujian):** Card container (`10px` radius, border `#DDDDDD`) berisi daftar aturan: Dilarang keluar fullscreen, dilarang pindah tab/aplikasi, dilarang membuka taskbar, dilarang copy-paste/klik kanan.
    *   **Sisi Kanan (Data Siswa & Pilih Soal):**
        *   Menampilkan data siswa yang diambil dari Supabase: **NISN, Nama, Kelas, Jenis Kelamin, Agama**.
        *   **Dropdown / List Pilih Soal:** Hanya menampilkan daftar soal yang terdaftar di kelas siswa tersebut dan berstatus `active = true`.
        *   **Input Token Ujian:** Input field khusus token sebelum masuk.
*   **Validasi:** Jika token yang dimasukkan tidak cocok dengan *Dynamic Global Token* yang berlaku pada detik tersebut, sistem menolak akses.

### 4.3 Modal Persetujuan Fullscreen
*   Setelah data valid, tombol "Mulai Kerjakan" memicu Pop-up Modal.
*   Instruksi: "Aplikasi membutuhkan mode Fullscreen untuk menjaga integritas ujian. Klik 'Setuju & Lanjutkan' untuk mengaktifkan Fullscreen."
*   Ketika diklik `OK`, aplikasi memanggil HTML5 Fullscreen API (`document.documentElement.requestFullscreen()`) dan mengarahkan ke **Halaman Ujian**.

### 4.4 Halaman 3: Ruang Ujian (Active Exam Engine & Security Layer)
*   **Top Bar Sticky:**
    *   Sisi Kiri: Nama Siswa | Kelas | Judul Soal.
    *   Sisi Kanan: Indikator Status Koneksi & Tombol "Selesai Ujian".
*   **Main Body:** Google Form Embed via `iframe` (Width: 100%, Height: Calc(100vh - TopBar)).
*   **Anti-Cheat System (Proctoring Enforcement):**
    1.  **Fullscreen Exit Detection:** Mendeteksi event `fullscreenchange`. Jika keluar dari mode fullscreen -> pemicu pelanggaran.
    2.  **Tab / Window Switching (Focus Blur):** Mendeteksi `visibilitychange` (`document.hidden`) dan `window.onblur` -> pemicu pelanggaran.
    3.  **Keyboard & Mouse Lock:**
        *   Disable Right-Click (`contextmenu` event blocked).
        *   Disable Text Selection & Copy-Paste (`copy`, `cut`, `paste`, `selectstart` events blocked).
        *   Disable Key Combinations: `Ctrl+C`, `Ctrl+V`, `Ctrl+T`, `Ctrl+N`, `Ctrl+W`, `F12`, `Alt+Tab`, `Meta/Windows Key`.
    4.  **Floating App / OS Taskbar Open Detection:** Kehilangan fokus window akibat floating app/taskbar didefinisikan sebagai event `blur` -> pemicu pelanggaran.
*   **Handling Pelanggaran (Popup Lock & Token Pengawas):**
    *   Layar langsung tertutup Modal Overlay Blocker (Z-Index tinggi).
    *   Siswa diwajibkan memasukkan **Token Pengawas** yang sedang aktif saat itu.
    *   Setelah token diverifikasi benar, sistem **otomatis** memicu perintah `requestFullscreen()` kembali dan membuka kuncian modal.
*   **Deteksi Selesai Ujian:**
    *   Siswa mengeklik tombol "Selesai Ujian" di Top Bar atau mengonfirmasi pengiriman pada modal konfirmasi yang disediakan.
    *   Sistem menampilkan Modal Konfirmasi Selesai Ujian, membersihkan session storage, dan mengarahkan kembali ke Halaman Login.

### 4.5 Halaman 4: Admin Dashboard (Manajemen Terpusat)
Dashboard admin terbagi menjadi beberapa modul lengkap:

1.  **Dynamic Global Token Engine:**
    *   Menggunakan algoritma berbasis waktu (Time-based Token Generator) yang diperbarui otomatis setiap **5 menit sekali** tanpa perlu refresh halaman manual (Realtime Subscription / Interval Timer).
    *   Token ini berlaku serentak secara global untuk:
        *   Input token awal sebelum masuk ujian.
        *   Unlocking modal jika siswa terkena pelanggaran.
    *   Admin dapat melihat token aktif saat ini, hitung mundur menuju rotasi token berikutnya, atau memicu manual regenerate jika diperlukan.
2.  **Manajemen Data Siswa (Import Excel):**
    *   Fitur Upload / Import File Excel (`.xlsx` / `.csv`).
    *   Format kolom wajib: `nisn` | `nama` | `kelas` | `jenis kelamin` | `agama`.
    *   Tabel interaktif untuk melihat, mencari (search), memfilter per kelas, serta menambah/edit/hapus data siswa individu.
3.  **Manajemen Bank Soal & Link Google Form:**
    *   Form Tambah/Edit Soal:
        *   **Judul Soal** (text)
        *   **Kelas Target** (Multi-select Checkbox, contoh: X-1, X-2, XI-IPA 1)
        *   **Link Google Form** (URL iframe / viewform)
        *   **Status Soal** (Toggle Active / Inactive)
4.  **Monitoring & Reset Sesi Ujian (Realtime Proctor Log):**
    *   Live monitoring siswa yang sedang mengerjakan ujian.
    *   Menampilkan jumlah pelanggaran per siswa.
    *   Tombol "Reset Sesi" jika siswa membutuhkan login ulang dari awal.

---

## 5. Dynamic Token Generation Algorithm

Token berotasi otomatis setiap 300 detik (5 menit) berbasis epoch time server agar sinkron antara server dan client:

$$\text{TimeBlock} = \left\lfloor \frac{\text{CurrentTimestampSeconds}}{300} \right\rfloor$$

$$\text{Token} = \text{Upper}(\text{SubString}(\text{HMAC\_SHA256}(\text{TimeBlock}, \text{SecretKey}), 0, 6))$$

---

## 6. Database Schema (Supabase PostgreSQL)

```sql
-- 1. TABEL STUDENTS
CREATE TABLE students (
    nisn VARCHAR(20) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kelas VARCHAR(20) NOT NULL,
    jenis_kelamin VARCHAR(20) NOT NULL,
    agama VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL EXAMS (BANK SOAL)
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul_soal VARCHAR(150) NOT NULL,
    target_kelas TEXT[] NOT NULL, -- Array string kelas: ['X-1', 'X-2']
    google_form_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL SYSTEM_SETTINGS (GLOBAL TOKEN CONFIG)
CREATE TABLE system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL EXAM_LOGS (PROCTORING AUDIT LOG)
CREATE TABLE exam_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) REFERENCES students(nisn) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    violation_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED'
    last_violation_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 7. Non-Functional Requirements & Performance Target

*   **Concurrency:** Mampu menangani **350+ siswa bersamaan** tanpa latency spike. Karena Google Form di-embed via iframe, beban rendering soal sepenuhnya ditangani infrastruktur Google. Backend Supabase hanya menerima payload ringan untuk eksekusi auth, token verification, dan event logging.
*   **Security & RLS:** Seluruh tabel di Supabase dilindungi dengan Row Level Security (RLS) untuk mencegah peretasan data dari konsol browser client.
*   **Responsif & Light-weight:** Ukuran bundle JavaScript dioptimalkan (< 200KB gzipped) agar pemuatan halaman di jaringan sekolah tetap cepat dan stabil.
