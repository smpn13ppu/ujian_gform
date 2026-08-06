import React, { useState, useEffect } from 'react';
import { storageEngine } from '../lib/storageEngine';
import { validateSubmittedToken } from '../lib/tokenEngine';
import { ToastNotification } from '../components/ToastNotification';
import {
  User,
  BookOpen,
  KeyRound,
  ShieldAlert,
  CheckCircle,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Maximize2
} from 'lucide-react';

export function StudentDashboard({ student, onStartExam, onLogout }) {
  const [activeExams, setActiveExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      setLoading(true);
      try {
        const exams = await storageEngine.getActiveExamsForClass(student.kelas);
        setActiveExams(exams);
        if (exams.length > 0) {
          setSelectedExamId(exams[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, [student.kelas]);

  const selectedExam = activeExams.find((e) => e.id === selectedExamId);

  const handleProceed = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedExam) {
      setErrorMsg('Silakan pilih mata ujian terlebih dahulu.');
      return;
    }

    if (!tokenInput.trim()) {
      setErrorMsg('Silakan masukkan Token Ujian yang diberikan pengawas.');
      return;
    }

    // Dynamic Token Validation with active secret key
    try {
      const sett = await storageEngine.getSettings();
      const secretKey = sett?.secret_key || 'SMANDA_CBT_SECURE_TOKEN_SECRET_2026';
      const isValid = validateSubmittedToken(tokenInput, secretKey);
      if (!isValid) {
        setErrorMsg('Token Ujian tidak valid atau telah kedaluwarsa. Tanya pengawas untuk token terbaru!');
        return;
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan sistem saat memverifikasi token.');
      return;
    }

    onStartExam({ student, exam: selectedExam });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <ToastNotification message={errorMsg} type="error" onClose={() => setErrorMsg('')} />
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border border-[#DDDDDD] p-6 rounded-[10px] shadow-sm">
        <div>
          <span className="inline-block px-3 py-1 bg-[#1A936F]/10 text-[#1A936F] font-semibold text-xs rounded-full mb-2">
            Status: Terverifikasi
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#133E59]">
            Selamat Datang, {student.nama}
          </h1>
          <p className="text-sm text-[#5CA08E] mt-1">
            Persiapkan diri Anda dan pastikan membaca Tata Tertib Ujian sebelum memulai.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="btn-secondary self-start sm:self-auto text-xs py-2 px-4"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Portal</span>
        </button>
      </div>

      {/* 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Tata Tertib Ujian */}
        <div className="lg:col-span-5">
          <div className="card-bordered bg-white h-full">
            <div className="flex items-center space-x-2.5 mb-4 text-[#133E59] pb-3 border-b border-[#DDDDDD]">
              <ShieldAlert className="w-6 h-6 text-[#E95950]" />
              <h3 className="text-lg font-bold">Tata Tertib & Integritas Ujian</h3>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start space-x-3">
                <Maximize2 className="w-5 h-5 text-[#1A936F] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#133E59]">Mode Fullscreen Wajib</strong>
                  Ujian dilaksanakan dalam mode Fullscreen. Dilarang menekan tombol `Esc` atau `F11`.
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-[#E95950] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#133E59]">Dilarang Pindah Tab / Aplikasi</strong>
                  Membuka tab baru, meminimalkan browser, atau membuka aplikasi floating akan memicu sistem pelanggaran (*Proctoring Blocker*).
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-[#1A936F] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#133E59]">Mouse & Keyboard Lock</strong>
                  Fitur Klik Kanan, Copy-Paste, serta kombinasi tombol shortcut terlarang dikunci secara otomatis.
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <KeyRound className="w-5 h-5 text-[#00ACED] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#133E59]">Token Pengawas Recovery</strong>
                  Jika terjadi pelanggaran, layar akan terkunci dan hanya dapat dibuka dengan meminta Token Pengawas aktif.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Data Siswa & Pilih Soal Form */}
        <div className="lg:col-span-7">
          <div className="card-container bg-white space-y-6">
            {/* Student Verified Info */}
            <div className="bg-[#F3F3F3] p-4 rounded-[8px] border border-[#DDDDDD]">
              <h4 className="text-sm font-bold text-[#133E59] mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#1A936F]" />
                Verifikasi Profil Peserta
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#5CA08E] block">NISN</span>
                  <span className="font-semibold text-[#133E59]">{student.nisn}</span>
                </div>
                <div>
                  <span className="text-[#5CA08E] block">Nama Lengkap</span>
                  <span className="font-semibold text-[#133E59]">{student.nama}</span>
                </div>
                <div>
                  <span className="text-[#5CA08E] block">Kelas Target</span>
                  <span className="font-semibold text-[#133E59]">{student.kelas}</span>
                </div>
                <div>
                  <span className="text-[#5CA08E] block">Jenis Kelamin</span>
                  <span className="font-semibold text-[#133E59]">{student.jenis_kelamin}</span>
                </div>
                <div>
                  <span className="text-[#5CA08E] block">Agama</span>
                  <span className="font-semibold text-[#133E59]">{student.agama}</span>
                </div>
              </div>
            </div>

            {/* Form Selection */}
            <form onSubmit={handleProceed} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#133E59] mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#1A936F]" />
                  <span>Pilih Mata Pelajaran / Soal Ujian</span>
                </label>
                {loading ? (
                  <div className="p-3 text-xs text-slate-500">Memuat bank soal...</div>
                ) : activeExams.length > 0 ? (
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="cbt-select font-medium text-sm"
                  >
                    {activeExams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.judul_soal}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 bg-[#E95950]/10 border border-[#E95950]/30 rounded-md text-xs text-[#E95950]">
                    Belum ada soal aktif yang ditugaskan untuk kelas <strong>{student.kelas}</strong>.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#133E59] mb-2 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#1A936F]" />
                  <span>Masukkan Token Ujian (Dynamic Token)</span>
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: KJT (3 Huruf dari Pengawas)"
                  maxLength={3}
                  className="cbt-input text-2xl tracking-[0.2em] font-mono uppercase font-bold text-[#133E59]"
                />
              </div>

              <button
                type="submit"
                disabled={activeExams.length === 0}
                className="btn-primary w-full"
              >
                <span>Mulai Kerjakan Soal</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
