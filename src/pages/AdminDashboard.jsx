import React, { useState, useEffect, useMemo } from 'react';
import { useDynamicToken } from '../hooks/useDynamicToken';
import { storageEngine } from '../lib/storageEngine';
import { ToastNotification } from '../components/ToastNotification';
import * as XLSX from 'xlsx';
import {
  LayoutDashboard,
  KeyRound,
  Users,
  BookOpen,
  ShieldAlert,
  Settings,
  Upload,
  Plus,
  Trash2,
  Edit,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Download,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
  Building,
  Image,
  Key,
  Save,
  Shield,
  ExternalLink,
  PieChart,
  BarChart3,
  Activity,
  Check,
  Menu,
  X,
  LogOut,
  UserCheck,
  FileText,
  Eye
} from 'lucide-react';

export function AdminDashboard({ onSwitchToStudent, onSettingsUpdated, onOpenSupervisorPortal, onLogoutAdmin }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'token' | 'students' | 'exams' | 'proctor' | 'settings'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    school_name: '',
    school_subtext: 'CBT Online Assessment System',
    school_logo_url: '',
    hero_bg_url: '',
    secret_key: 'SMANDA_CBT_SECURE_TOKEN_SECRET_2026',
    enable_minimize_lock: true,
    network_minimize_pin: '1234',
  });

  const handleImageUpload = (e, fieldKey) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      notify('Ukuran file gambar terlalu besar! Maksimal 4MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      setSettings((prev) => ({ ...prev, [fieldKey]: base64Url }));
      notify(`Gambar ${fieldKey === 'school_logo_url' ? 'Logo' : 'Background Halaman Awal'} berhasil di-upload!`);
    };
    reader.readAsDataURL(file);
  };

  const { activeToken, secondsRemaining, formattedTime, manualRefresh } = useDynamicToken(settings.secret_key);

  // Data states
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [logs, setLogs] = useState([]);

  // UI Filter / Search states
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [searchProctorLog, setSearchProctorLog] = useState('');
  const [searchExamFilter, setSearchExamFilter] = useState('');
  const [showClearLogsConfirmModal, setShowClearLogsConfirmModal] = useState(false);

  // Bulk Selection State for Exams
  const [selectedExamIds, setSelectedExamIds] = useState([]);

  // Student Detail & Violation Modal state
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  // Modals / Forms
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({ nisn: '', nama: '', kelas: 'XII-MIPA 1', jenis_kelamin: 'Laki-laki', agama: 'Islam' });
  
  const [showAddExam, setShowAddExam] = useState(false);
  const [examForm, setExamForm] = useState({ id: '', judul_soal: '', target_kelas: ['XII-MIPA 1'], google_form_url: '', is_active: true });

  const [notification, setNotification] = useState('');

  // Load initial settings ONCE on mount
  useEffect(() => {
    async function loadSettingsOnMount() {
      try {
        const sett = await storageEngine.getSettings();
        if (sett) setSettings(sett);
      } catch (err) {
        console.error('Load settings error:', err);
      }
    }
    loadSettingsOnMount();
  }, []);

  // Load live students, exams, and proctor logs periodically (5s polling)
  const loadLiveLists = async () => {
    try {
      const st = await storageEngine.getStudents();
      const ex = await storageEngine.getExams();
      const lg = await storageEngine.getLogs();

      setStudents(Array.isArray(st) ? st : []);
      setExams(Array.isArray(ex) ? ex : []);
      setLogs(Array.isArray(lg) ? lg : []);
    } catch (err) {
      console.error('Load live data error:', err);
    }
  };

  useEffect(() => {
    loadLiveLists();
    const interval = setInterval(loadLiveLists, 5000); // Poll live lists every 5s
    return () => clearInterval(interval);
  }, []);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Save Settings Handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const updated = await storageEngine.saveSettings(settings);
      setSettings(updated);
      if (onSettingsUpdated) onSettingsUpdated(updated);
      notify('Pengaturan sekolah & sistem berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      notify('Gagal menyimpan pengaturan.');
    }
  };

  // === EXCEL IMPORT ===
  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { raw: false });

        const parsed = (data || []).map((row) => ({
          nisn: String(row.nisn || row.NISN || '').trim(),
          nama: String(row.nama || row.Nama || row.NAMA || '').trim(),
          kelas: String(row.kelas || row.Kelas || row.KELAS || 'X-1').trim(),
          jenis_kelamin: String(row['jenis kelamin'] || row.jenis_kelamin || row.Jenis_Kelamin || 'Laki-laki').trim(),
          agama: String(row.agama || row.Agama || 'Islam').trim(),
        })).filter((s) => s.nisn && s.nama);

        if (parsed.length === 0) {
          notify('Gagal mengimpor: Format kolom file Excel harus berisi [nisn, nama, kelas, jenis kelamin, agama].');
          return;
        }

        const updated = await storageEngine.bulkSaveStudents(parsed);
        setStudents(Array.isArray(updated) ? updated : []);
        notify(`Berhasil mengimpor ${parsed.length} data siswa baru!`);
      } catch (err) {
        console.error(err);
        notify('Terjadi kesalahan membaca file Excel.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // === STUDENT CRUD ===
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.nisn || !studentForm.nama) {
      notify('NISN dan Nama Wajib diisi!');
      return;
    }
    await storageEngine.saveStudent(studentForm);
    await loadLiveLists();
    setShowAddStudent(false);
    setStudentForm({ nisn: '', nama: '', kelas: 'XII-MIPA 1', jenis_kelamin: 'Laki-laki', agama: 'Islam' });
    notify('Data siswa berhasil disimpan!');
  };

  const handleDeleteStudent = async (nisn) => {
    if (confirm(`Hapus data siswa NISN: ${nisn}?`)) {
      await storageEngine.deleteStudent(nisn);
      await loadLiveLists();
      notify('Data siswa berhasil dihapus.');
    }
  };

  // === EXAM CRUD ===
  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!examForm.judul_soal || !examForm.google_form_url) {
      notify('Judul Soal dan Link Google Form Wajib diisi!');
      return;
    }
    await storageEngine.saveExam(examForm);
    await loadLiveLists();
    setShowAddExam(false);
    setExamForm({ id: '', judul_soal: '', target_kelas: ['XII-MIPA 1'], google_form_url: '', is_active: true });
    notify('Bank Soal berhasil disimpan!');
  };

  const handleDeleteExam = async (id) => {
    if (confirm('Hapus soal ini?')) {
      await storageEngine.deleteExam(id);
      await loadLiveLists();
      notify('Soal berhasil dihapus.');
    }
  };

  // === BULK EXAM SELECTION & ACTIONS ===
  const handleSelectAllExams = () => {
    if (selectedExamIds.length === safeExams.length) {
      setSelectedExamIds([]);
    } else {
      setSelectedExamIds(safeExams.map((e) => e.id));
    }
  };

  const handleToggleSelectExam = (id) => {
    setSelectedExamIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkActivateExams = async () => {
    if (selectedExamIds.length === 0) return;
    try {
      const updated = safeExams.map((e) =>
        selectedExamIds.includes(e.id) ? { ...e, is_active: true } : e
      );
      await storageEngine.saveExams(updated);
      setExams(updated);
      notify(`${selectedExamIds.length} bank soal berhasil diaktifkan!`);
    } catch (err) {
      console.error(err);
      notify('Gagal mengubah status soal.');
    }
  };

  const handleBulkDeactivateExams = async () => {
    if (selectedExamIds.length === 0) return;
    try {
      const updated = safeExams.map((e) =>
        selectedExamIds.includes(e.id) ? { ...e, is_active: false } : e
      );
      await storageEngine.saveExams(updated);
      setExams(updated);
      notify(`${selectedExamIds.length} bank soal berhasil dinonaktifkan!`);
    } catch (err) {
      console.error(err);
      notify('Gagal mengubah status soal.');
    }
  };

  const handleBulkDeleteExams = async () => {
    if (selectedExamIds.length === 0) return;
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedExamIds.length} bank soal terpilih?`
      )
    )
      return;

    try {
      const updated = safeExams.filter((e) => !selectedExamIds.includes(e.id));
      await storageEngine.saveExams(updated);
      setExams(updated);
      setSelectedExamIds([]);
      notify(`${selectedExamIds.length} bank soal berhasil dihapus!`);
    } catch (err) {
      console.error(err);
      notify('Gagal menghapus bank soal.');
    }
  };

  const handleResetSession = async (nisn, examId) => {
    if (confirm(`Reset sesi ujian untuk siswa NISN: ${nisn}?`)) {
      await storageEngine.resetStudentSession(nisn, examId);
      await loadLiveLists();
      notify('Sesi siswa berhasil di-reset. Siswa dapat login kembali.');
    }
  };

  const handleOpenSupervisorPortal = () => {
    if (onOpenSupervisorPortal) {
      onOpenSupervisorPortal();
    } else {
      window.open(window.location.origin + '?mode=supervisor', '_blank');
    }
  };

  // Safe Filtered Data
  const safeStudents = Array.isArray(students) ? students : [];
  const safeExams = Array.isArray(exams) ? exams : [];
  const safeLogs = Array.isArray(logs) ? logs : [];

  // Group logs by student NISN so each student appears ONCE with their latest exam & complete history
  const recappedLogs = useMemo(() => {
    const grouped = {};

    safeLogs.forEach((lg) => {
      if (!lg || !lg.nisn) return;
      const key = String(lg.nisn);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(lg);
    });

    return Object.keys(grouped).map((nisn) => {
      const studentLogs = grouped[nisn].sort((a, b) => {
        const timeA = new Date(a.updated_at || a.last_violation_at || 0).getTime();
        const timeB = new Date(b.updated_at || b.last_violation_at || 0).getTime();
        return timeB - timeA;
      });

      const latestLog = studentLogs[0];
      const totalViolations = studentLogs.reduce((sum, l) => sum + (l.violation_count || 0), 0);
      const completedCount = studentLogs.filter((l) => l.status === 'COMPLETED').length;

      return {
        ...latestLog,
        total_violations: totalViolations,
        total_exams: studentLogs.length,
        completed_count: completedCount,
        all_student_logs: studentLogs,
      };
    });
  }, [safeLogs]);

  const handleClearAllLogs = async () => {
    try {
      await storageEngine.clearAllLogs();
      await loadLiveLists();
      setShowClearLogsConfirmModal(false);
      notify('Seluruh data log monitoring live berhasil dibersihkan!');
    } catch (err) {
      console.error(err);
      notify('Gagal membersihkan data log.');
    }
  };

  const filteredRecappedLogs = useMemo(() => {
    if (!searchProctorLog) return recappedLogs;
    const query = searchProctorLog.toLowerCase().trim();
    return recappedLogs.filter(
      (l) =>
        (l.nama_siswa || '').toLowerCase().includes(query) ||
        String(l.nisn || '').toLowerCase().includes(query) ||
        (l.kelas || '').toLowerCase().includes(query) ||
        (l.judul_soal || '').toLowerCase().includes(query)
    );
  }, [recappedLogs, searchProctorLog]);

  const filteredExams = useMemo(() => {
    if (!searchExamFilter) return safeExams;
    const query = searchExamFilter.toLowerCase().trim();
    return safeExams.filter((e) => {
      const targetClasses = Array.isArray(e.target_kelas) ? e.target_kelas.join(' ') : String(e.target_kelas || '');
      return (
        (e.judul_soal || '').toLowerCase().includes(query) ||
        targetClasses.toLowerCase().includes(query)
      );
    });
  }, [safeExams, searchExamFilter]);

  const filteredStudents = safeStudents.filter((s) => {
    if (!s) return false;
    const matchSearch =
      (s.nama || '').toLowerCase().includes((searchStudent || '').toLowerCase()) ||
      String(s.nisn || '').includes(searchStudent || '');
    const matchClass = selectedClassFilter ? s.kelas === selectedClassFilter : true;
    return matchSearch && matchClass;
  });

  const availableClasses = Array.from(new Set(safeStudents.map((s) => s?.kelas).filter(Boolean))).sort();
  const violationCountTotal = safeLogs.reduce((acc, l) => acc + (l.violation_count || 0), 0);

  // Statistics calculation for Dashboard
  const activeExamsCount = safeExams.filter((e) => e.is_active).length;
  const completedSessionsCount = safeLogs.filter((l) => l.status === 'COMPLETED').length;
  const activeSessionsCount = safeLogs.filter((l) => l.status === 'IN_PROGRESS').length;

  // Class distribution calculation
  const classDistribution = availableClasses.map((cls) => {
    const count = safeStudents.filter((s) => s.kelas === cls).length;
    const percentage = safeStudents.length > 0 ? Math.round((count / safeStudents.length) * 100) : 0;
    return { class: cls, count, percentage };
  });

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard Statistik', icon: LayoutDashboard, badge: null },
    { id: 'token', label: 'Dynamic Token Engine', icon: KeyRound, badge: null },
    { id: 'students', label: 'Manajemen Siswa', icon: Users, badge: safeStudents.length },
    { id: 'exams', label: 'Bank Soal & Forms', icon: BookOpen, badge: safeExams.length },
    { id: 'proctor', label: 'Live Monitoring Log', icon: ShieldAlert, badge: violationCountTotal > 0 ? `${violationCountTotal} Alert` : null, isDanger: violationCountTotal > 0 },
    { id: 'settings', label: 'Pengaturan Sekolah', icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F3F3F3]">
      {/* Mobile Sidebar Toggle Header */}
      <div className="md:hidden bg-[#133E59] text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {settings.school_logo_url ? (
            <img src={settings.school_logo_url} alt="Logo" className="w-7 h-7 object-contain" />
          ) : (
            <GraduationCap className="w-6 h-6 text-[#1A936F]" />
          )}
          <span className="font-bold text-sm truncate">{settings.school_name}</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-md hover:bg-white/10"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* LEFT SIDEBAR MENU */}
      <aside
        className={`w-full md:w-64 bg-[#133E59] text-white flex-shrink-0 flex flex-col justify-between p-4 border-r border-[#1A936F]/30 ${
          mobileSidebarOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="space-y-6">
          {/* Sidebar Top Branding */}
          <div className="pb-4 border-b border-white/10 flex items-center space-x-3">
            {settings.school_logo_url ? (
              <img src={settings.school_logo_url} alt="School Logo" className="w-10 h-10 object-contain shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center p-1.5 border border-white/20 shrink-0">
                <GraduationCap className="w-6 h-6 text-[#1A936F]" />
              </div>
            )}
            <div className="min-w-0">
              <span className="bg-[#1A936F] text-[10px] font-bold px-2 py-0.5 rounded text-white uppercase tracking-wider block w-max mb-0.5">
                CBT Admin
              </span>
              <h2 className="text-sm font-bold truncate text-white leading-snug">
                {settings.school_name}
              </h2>
            </div>
          </div>

          {/* Vertical Menu Links */}
          <nav className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5CA08E] px-3 block mb-2">
              Menu Utama Panel
            </span>
            {navigationItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1A936F] text-white shadow-sm'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#5CA08E]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                        item.isDanger
                          ? 'bg-[#CC0001] text-white animate-pulse'
                          : isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Token Live Widget & Back Button (Displayed on ALL Admin Menus) */}
        <div className="pt-4 mt-6 border-t border-white/15 space-y-3">
          {/* Dynamic Token Widget Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-3.5 rounded-xl text-center font-mono space-y-1 shadow-inner">
            <div className="flex items-center justify-between text-[10px] uppercase text-slate-300 tracking-wider font-semibold">
              <span>Token Aktif (3-Huruf)</span>
              <span className="bg-[#1A936F] text-white font-bold text-[9px] px-1.5 py-0.5 rounded">LIVE</span>
            </div>
            <div className="text-2xl font-black text-white tracking-[0.2em] my-1">
              {activeToken}
            </div>
            <div className="text-[11px] font-semibold text-amber-300 flex items-center justify-center gap-1.5 pt-1 border-t border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Rotasi: <strong className="text-white font-bold">{formattedTime}</strong></span>
            </div>
          </div>

          {/* Back to Student Portal & Logout Admin Buttons */}
          <div className="space-y-2">
            <button
              onClick={onSwitchToStudent}
              className="w-full btn-secondary bg-white/10 hover:bg-[#1A936F] text-white border-white/20 hover:border-[#1A936F] text-xs py-2.5 justify-center rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Portal Siswa</span>
            </button>

            {onLogoutAdmin && (
              <button
                type="button"
                onClick={onLogoutAdmin}
                className="w-full bg-[#CC0001]/80 hover:bg-[#CC0001] text-white border border-red-500/30 text-xs py-2 justify-center rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                title="Keluar dari Akses Sesi Admin Guru"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Admin</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Toast Notification Top Right */}
        <ToastNotification message={notification} type="success" onClose={() => setNotification('')} />

        {/* ================= MODULE 0: DASHBOARD STATISTIK & INFOGRAFIS ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-container bg-white p-5 space-y-2 border-l-4 border-l-[#133E59]">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-semibold">Total Siswa Terdaftar</span>
                  <Users className="w-5 h-5 text-[#133E59]" />
                </div>
                <div className="text-3xl font-extrabold text-[#133E59]">{safeStudents.length}</div>
                <p className="text-[11px] text-[#5CA08E]">{availableClasses.length} Kelas Terdata</p>
              </div>

              <div className="card-container bg-white p-5 space-y-2 border-l-4 border-l-[#1A936F]">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-semibold">Bank Soal Ujian</span>
                  <BookOpen className="w-5 h-5 text-[#1A936F]" />
                </div>
                <div className="text-3xl font-extrabold text-[#1A936F]">{safeExams.length}</div>
                <p className="text-[11px] text-[#1A936F] font-medium">{activeExamsCount} Soal Berstatus Aktif</p>
              </div>

              <div className="card-container bg-white p-5 space-y-2 border-l-4 border-l-[#CC0001]">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-semibold">Total Pelanggaran Ujian</span>
                  <ShieldAlert className="w-5 h-5 text-[#CC0001]" />
                </div>
                <div className="text-3xl font-extrabold text-[#CC0001]">{violationCountTotal}</div>
                <p className="text-[11px] text-[#CC0001]">Terekam di Proctor Log</p>
              </div>

              <div className="card-container bg-white p-5 space-y-2 border-l-4 border-l-[#00ACED]">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-semibold">Token Aktif Saat Ini</span>
                  <KeyRound className="w-5 h-5 text-[#00ACED]" />
                </div>
                <div className="text-3xl font-black font-mono text-[#133E59] tracking-widest">{activeToken}</div>
                <p className="text-[11px] text-amber-600 font-mono">Rotasi: {formattedTime}</p>
              </div>
            </div>

            {/* Live Session Status Breakdown (Full-Width Top Card) */}
            <div className="card-container bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-3">
                <h3 className="text-sm font-bold text-[#133E59] flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#00ACED]" />
                  Status Sesi Ujian Live
                </h3>
                <button
                  onClick={handleOpenSupervisorPortal}
                  className="btn-secondary text-xs py-1 px-3 flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#1A936F]" />
                  <span>Standalone Portal Token Pengawas</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-[#1A936F]/8 rounded-xl border border-[#1A936F]/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs">
                    <CheckCircle className="w-5 h-5 text-[#1A936F] shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700 block">Sesi Selesai</span>
                      <span className="text-[10px] text-slate-500">Completed Submit</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#1A936F] text-xl">{completedSessionsCount}</span>
                </div>

                <div className="p-3.5 bg-[#00ACED]/8 rounded-xl border border-[#00ACED]/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs">
                    <Activity className="w-5 h-5 text-[#00ACED] shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700 block">Sedang Mengerjakan</span>
                      <span className="text-[10px] text-slate-500">In Progress Active</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#00ACED] text-xl">{activeSessionsCount}</span>
                </div>

                <div className="p-3.5 bg-[#CC0001]/8 rounded-xl border border-[#CC0001]/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs">
                    <ShieldAlert className="w-5 h-5 text-[#CC0001] shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700 block">Terindikasi Pelanggaran</span>
                      <span className="text-[10px] text-slate-500">Hilang fokus / keluar layar</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#CC0001] text-xl">
                    {safeLogs.filter((l) => (l.violation_count || 0) > 0).length}
                  </span>
                </div>
              </div>
            </div>

            {/* ================= COMPACT & SCALABLE DETAIL STATUS LIVE PER MATA SOAL UJIAN ================= */}
            <div className="card-container bg-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DDDDDD] pb-3.5 gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#133E59] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#1A936F]" />
                    Detail Status Live per Mata Soal Ujian
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pemantauan statistik pengerjaan, siswa aktif, selesai, & indikasi pelanggaran per soal.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Quick Search for Exam */}
                  <div className="relative sm:w-56 min-w-[180px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchExamFilter}
                      onChange={(e) => setSearchExamFilter(e.target.value)}
                      placeholder="Cari mata ujian..."
                      className="cbt-input text-xs pl-9 py-1.5 border-[#DDDDDD] rounded-md shadow-xs w-full"
                    />
                    {searchExamFilter && (
                      <button
                        onClick={() => setSearchExamFilter('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <span className="text-xs font-bold px-3 py-1 bg-[#1A936F]/10 text-[#1A936F] rounded-full border border-[#1A936F]/30">
                    {safeExams.filter((e) => e.is_active).length} Aktif
                  </span>
                  <span className="text-xs font-bold px-3 py-1 bg-[#00ACED]/10 text-[#00ACED] rounded-full border border-[#00ACED]/30">
                    {safeExams.length} Total Bank Soal
                  </span>
                </div>
              </div>

              {/* Compact Multi-Column Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => {
                    const targetClasses = Array.isArray(exam.target_kelas) ? exam.target_kelas : [exam.target_kelas];
                    const targetStudents = safeStudents.filter((s) => targetClasses.includes(s.kelas));
                    const totalTargetCount = targetStudents.length;

                    const examLogs = safeLogs.filter((l) => String(l.exam_id) === String(exam.id));
                    const inProgressCount = examLogs.filter((l) => l.status === 'IN_PROGRESS').length;
                    const completedCount = examLogs.filter((l) => l.status === 'COMPLETED').length;
                    const violationCount = examLogs.filter((l) => (l.violation_count || 0) > 0).length;

                    const completionPercentage = totalTargetCount > 0
                      ? Math.round((completedCount / totalTargetCount) * 100)
                      : (completedCount > 0 ? 100 : 0);

                    return (
                      <div
                        key={exam.id}
                        className={`border rounded-xl p-3.5 space-y-3 transition-all ${
                          exam.is_active
                            ? 'bg-white border-[#DDDDDD] hover:border-[#1A936F] shadow-xs'
                            : 'bg-[#F9FAFB] border-[#DDDDDD] opacity-75'
                        }`}
                      >
                        {/* Title & Status Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#133E59] truncate" title={exam.judul_soal}>
                              {exam.judul_soal}
                            </h4>
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              <span className="text-[10px] text-slate-500 font-semibold">Kelas:</span>
                              {targetClasses.map((cls) => (
                                <span
                                  key={cls}
                                  className="bg-slate-100 text-[#133E59] text-[9px] font-bold px-1.5 py-0.2 rounded border border-slate-200"
                                >
                                  {cls}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                exam.is_active
                                  ? 'bg-[#1A936F]/10 text-[#1A936F] border border-[#1A936F]/30'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {exam.is_active ? 'AKTIF' : 'OFF'}
                            </span>
                            <a
                              href={exam.google_form_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-slate-500 hover:text-[#1A936F] hover:bg-slate-100 rounded cursor-pointer"
                              title="Pratinjau Google Form"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        {/* Compact 3-Metric Chips */}
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                          <div className="bg-[#1A936F]/8 border border-[#1A936F]/20 p-1.5 rounded-md">
                            <span className="text-slate-500 block text-[9px]">Selesai</span>
                            <strong className="text-[#1A936F] font-extrabold text-xs">{completedCount}/{totalTargetCount}</strong>
                          </div>

                          <div className="bg-[#00ACED]/8 border border-[#00ACED]/20 p-1.5 rounded-md">
                            <span className="text-slate-500 block text-[9px]">Proses</span>
                            <strong className="text-[#00ACED] font-extrabold text-xs">{inProgressCount} Siswa</strong>
                          </div>

                          <div className={`p-1.5 rounded-md border ${
                            violationCount > 0 ? 'bg-[#CC0001]/10 border-[#CC0001]/30 text-[#CC0001]' : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            <span className="block text-[9px]">Alert</span>
                            <strong className="font-extrabold text-xs">{violationCount}x</strong>
                          </div>
                        </div>

                        {/* Streamlined Mini Progress Bar */}
                        <div className="space-y-1 pt-0.5">
                          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                            <span>Penyelesaian:</span>
                            <span className="font-bold text-[#133E59]">{completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-[#F3F3F3] h-1.5 rounded-full overflow-hidden border border-[#DDDDDD] flex">
                            <div
                              className="bg-[#1A936F] h-full"
                              style={{ width: `${totalTargetCount > 0 ? (completedCount / totalTargetCount) * 100 : 0}%` }}
                              title={`Selesai: ${completedCount}`}
                            />
                            <div
                              className="bg-[#00ACED] h-full"
                              style={{ width: `${totalTargetCount > 0 ? (inProgressCount / totalTargetCount) * 100 : 0}%` }}
                              title={`Proses: ${inProgressCount}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full p-8 text-center bg-[#F3F3F3] rounded-lg border border-[#DDDDDD] text-slate-500 text-xs">
                    Belum ada bank soal yang cocok. Silakan tambahkan soal di tab <strong>Bank Soal</strong>.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= MODULE 1: DYNAMIC TOKEN ENGINE ================= */}
        {activeTab === 'token' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Active Token Card */}
              <div className="card-bordered bg-white text-center space-y-3 p-6 border-l-4 border-l-[#1A936F]">
                <span className="text-xs font-bold text-[#5CA08E] uppercase tracking-wider block">
                  Token Aktif Saat Ini (3 Huruf)
                </span>
                <div className="text-5xl font-black font-mono text-[#133E59] tracking-[0.2em] my-2">
                  {activeToken}
                </div>
                <div className="text-xs font-medium text-slate-500 flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1A936F]" />
                  <span>Rotasi Otomatis: <strong className="text-[#133E59] font-mono">{formattedTime}</strong></span>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-[#1A936F]/10 text-[#1A936F] rounded-full border border-[#1A936F]/30">
                    STRICT ACTIVE (ROTASI 5 MENIT)
                  </span>
                </div>
              </div>

              {/* Kontrol Token Pengawas */}
              <div className="card-container bg-white space-y-3 p-6">
                <span className="text-xs font-bold text-[#133E59] uppercase tracking-wider block">
                  Kontrol Token Pengawas
                </span>
                
                <button
                  onClick={() => {
                    manualRefresh();
                    notify('Token 3-huruf baru berhasil di-refresh!');
                  }}
                  className="btn-primary w-full text-xs py-2.5 bg-[#133E59] hover:bg-[#0e2d42]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Acak / Refresh Token Manual</span>
                </button>

                <button
                  onClick={handleOpenSupervisorPortal}
                  className="btn-secondary w-full text-xs py-2.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Portal Display Token Pengawas</span>
                </button>
              </div>

              {/* Security & Secret Key */}
              <div className="card-container bg-white space-y-3 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#133E59] uppercase tracking-wider block mb-2">
                    Keamanan Token & Secret Key
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Enkripsi HMAC berbasis <strong className="font-mono text-[#133E59]">{settings.secret_key}</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="btn-secondary text-xs py-2.5 w-full flex items-center justify-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Ubah Master Secret Key</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#DDDDDD] p-5 rounded-[10px] text-xs text-slate-600 space-y-3 shadow-sm">
              <h4 className="font-bold text-[#133E59] text-sm flex items-center gap-2 border-b border-[#DDDDDD] pb-2">
                <AlertCircle className="w-4 h-4 text-[#1A936F]" />
                Cara Kerja Dynamic Global Token Engine (Sistem Terbaru):
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#1A936F] mt-0.5 shrink-0" />
                  <span><strong>Strict 3 Huruf Kapital (A-Z):</strong> Token di-generate berupa 3 huruf acak yang sangat ringkas dan mudah di-input oleh siswa di HP maupun Laptop.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#1A936F] mt-0.5 shrink-0" />
                  <span><strong>Rotasi Otomatis 5 Menit:</strong> Token otomatis berganti setiap 5 menit (300 detik) berdasarkan algoritma TimeBlock server secara sinkron.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#1A936F] mt-0.5 shrink-0" />
                  <span><strong>Tanpa Grace Period:</strong> Hanya token aktif saat ini yang valid. Menjamin keamanan penuh sehingga token tidak bisa disalahgunakan setelah masa waktunya habis.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#1A936F] mt-0.5 shrink-0" />
                  <span><strong>Standalone Display Portal:</strong> Pengawas ruang ujian dapat membuka layar khusus display token di LCD Proyektor tanpa perlu login ke dashboard admin full.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ================= MODULE 2: MANAJEMEN SISWA ================= */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-[10px] border border-[#DDDDDD]">
              {/* Search & Filter */}
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#5CA08E] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan NISN / Nama..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="cbt-input text-xs pl-9 py-2"
                  />
                </div>

                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="cbt-select text-xs py-2 w-40"
                >
                  <option value="">Semua Kelas</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Buttons: Import & Add */}
              <div className="flex items-center gap-2">
                <label className="btn-secondary text-xs py-2 px-3 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Import Excel</span>
                  <input type="file" accept=".xlsx, .csv" onChange={handleExcelImport} className="hidden" />
                </label>

                <button
                  onClick={() => setShowAddStudent(true)}
                  className="btn-primary text-xs py-2 px-3"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Siswa</span>
                </button>
              </div>
            </div>

            {/* Add Student Modal */}
            {showAddStudent && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white border-2 border-[#1A936F] rounded-[10px] max-w-md w-full p-6 space-y-4 shadow-xl">
                  <h3 className="text-lg font-bold text-[#133E59]">Tambah / Edit Data Siswa</h3>
                  <form onSubmit={handleSaveStudent} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#133E59] mb-1">NISN</label>
                      <input
                        type="text"
                        value={studentForm.nisn}
                        onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                        placeholder="Masukkan NISN"
                        className="cbt-input text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#133E59] mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={studentForm.nama}
                        onChange={(e) => setStudentForm({ ...studentForm, nama: e.target.value })}
                        placeholder="Masukkan Nama Siswa"
                        className="cbt-input text-xs"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#133E59] mb-1">Kelas</label>
                        <input
                          type="text"
                          value={studentForm.kelas}
                          onChange={(e) => setStudentForm({ ...studentForm, kelas: e.target.value })}
                          placeholder="Contoh: XII-MIPA 1"
                          className="cbt-input text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#133E59] mb-1">Agama</label>
                        <input
                          type="text"
                          value={studentForm.agama}
                          onChange={(e) => setStudentForm({ ...studentForm, agama: e.target.value })}
                          placeholder="Islam/Kristen/..."
                          className="cbt-input text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#133E59] mb-1">Jenis Kelamin</label>
                      <select
                        value={studentForm.jenis_kelamin}
                        onChange={(e) => setStudentForm({ ...studentForm, jenis_kelamin: e.target.value })}
                        className="cbt-select text-xs"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAddStudent(false)}
                        className="btn-secondary w-full text-xs py-2"
                      >
                        Batal
                      </button>
                      <button type="submit" className="btn-primary w-full text-xs py-2">
                        Simpan Data
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Student Table */}
            <div className="bg-white border border-[#DDDDDD] rounded-[10px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#133E59] text-white font-semibold">
                      <th className="p-3 border-b">No</th>
                      <th className="p-3 border-b">NISN</th>
                      <th className="p-3 border-b">Nama Lengkap</th>
                      <th className="p-3 border-b">Kelas</th>
                      <th className="p-3 border-b">L/P</th>
                      <th className="p-3 border-b">Agama</th>
                      <th className="p-3 border-b text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDDDDD]">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((st, idx) => (
                        <tr key={st.nisn} className="hover:bg-[#F3F3F3]">
                          <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-[#133E59]">{st.nisn}</td>
                          <td className="p-3 font-semibold">{st.nama}</td>
                          <td className="p-3">
                            <span className="bg-[#1A936F]/10 text-[#1A936F] font-bold px-2 py-0.5 rounded-full">
                              {st.kelas}
                            </span>
                          </td>
                          <td className="p-3">{st.jenis_kelamin}</td>
                          <td className="p-3">{st.agama}</td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => {
                                setStudentForm(st);
                                setShowAddStudent(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit Siswa"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(st.nisn)}
                              className="p-1.5 text-[#CC0001] hover:bg-red-50 rounded"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-500">
                          Tidak ada data siswa ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODULE 3: BANK SOAL & LINK FORM ================= */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-[10px] border border-[#DDDDDD]">
              <div>
                <h3 className="text-sm font-bold text-[#133E59]">Daftar Bank Soal Ujian</h3>
                <p className="text-xs text-slate-500">Kelola tautan Google Form dan target kelas yang berhak mengakses.</p>
              </div>
              <button
                onClick={() => {
                  setExamForm({ id: '', judul_soal: '', target_kelas: ['XII-MIPA 1'], google_form_url: '', is_active: true });
                  setShowAddExam(true);
                }}
                className="btn-primary text-xs py-2 px-3"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Bank Soal Baru</span>
              </button>
            </div>

            {/* Add Exam Modal */}
            {showAddExam && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white border-2 border-[#1A936F] rounded-[10px] max-w-lg w-full p-6 space-y-4 shadow-xl">
                  <h3 className="text-lg font-bold text-[#133E59]">Formulir Bank Soal Google Form</h3>
                  <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#133E59] mb-1">Judul Mata Ujian</label>
                      <input
                        type="text"
                        value={examForm.judul_soal}
                        onChange={(e) => setExamForm({ ...examForm, judul_soal: e.target.value })}
                        placeholder="Contoh: Penilaian Akhir Semester - Fisika XII"
                        className="cbt-input text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#133E59] mb-2">Target Kelas</label>
                      {availableClasses.length > 0 ? (
                        <div className="border border-[#DDDDDD] rounded-md p-3 bg-[#F3F3F3] max-h-44 overflow-y-auto space-y-2">
                          {/* Select All toggle */}
                          <label className="flex items-center gap-2 text-xs font-bold text-[#1A936F] border-b border-[#DDDDDD] pb-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 accent-[#1A936F]"
                              checked={availableClasses.every(cls =>
                                (Array.isArray(examForm.target_kelas) ? examForm.target_kelas : []).includes(cls)
                              )}
                              onChange={(e) => {
                                setExamForm({
                                  ...examForm,
                                  target_kelas: e.target.checked ? [...availableClasses] : [],
                                });
                              }}
                            />
                            Pilih Semua Kelas
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {availableClasses.map((cls) => {
                              const isChecked = (Array.isArray(examForm.target_kelas) ? examForm.target_kelas : []).includes(cls);
                              return (
                                <label key={cls} className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md cursor-pointer border transition-all ${
                                  isChecked
                                    ? 'bg-[#1A936F]/10 border-[#1A936F] text-[#133E59] font-semibold'
                                    : 'bg-white border-[#DDDDDD] text-slate-600 hover:border-[#1A936F]/50'
                                }`}>
                                  <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 accent-[#1A936F] shrink-0"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const current = Array.isArray(examForm.target_kelas) ? examForm.target_kelas : [];
                                      const updated = e.target.checked
                                        ? [...current, cls]
                                        : current.filter((k) => k !== cls);
                                      setExamForm({ ...examForm, target_kelas: updated });
                                    }}
                                  />
                                  <span className="truncate">{cls}</span>
                                </label>
                              );
                            })}
                          </div>
                          {/* Selected summary */}
                          <p className="text-[10px] text-slate-400 pt-1 border-t border-[#DDDDDD]">
                            Dipilih: <strong className="text-[#133E59]">
                              {(Array.isArray(examForm.target_kelas) ? examForm.target_kelas : []).length} kelas
                            </strong>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={Array.isArray(examForm.target_kelas) ? examForm.target_kelas.join(', ') : examForm.target_kelas}
                            onChange={(e) =>
                              setExamForm({
                                ...examForm,
                                target_kelas: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                              })
                            }
                            placeholder="Contoh: XII-MIPA 1, XII-MIPA 2, XII-IPS 1"
                            className="cbt-input text-xs"
                          />
                          <p className="flex items-center gap-1.5 text-[10px] text-amber-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                              Belum ada data kelas dari siswa. Tambah data siswa terlebih dahulu agar tersedia pilihan kelas.
                            </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block font-semibold text-[#133E59] mb-1">Link Embed Google Form URL</label>
                      <input
                        type="url"
                        value={examForm.google_form_url}
                        onChange={(e) => setExamForm({ ...examForm, google_form_url: e.target.value })}
                        placeholder="https://docs.google.com/forms/d/e/.../viewform?embedded=true"
                        className="cbt-input text-xs font-mono"
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={examForm.is_active}
                        onChange={(e) => setExamForm({ ...examForm, is_active: e.target.checked })}
                        className="w-4 h-4 accent-[#1A936F]"
                      />
                      <label htmlFor="is_active" className="font-semibold text-[#133E59]">
                        Aktifkan Soal Ini (Siswa dapat mengakses)
                      </label>
                    </div>

                    <div className="flex gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAddExam(false)}
                        className="btn-secondary w-full text-xs py-2"
                      >
                        Batal
                      </button>
                      <button type="submit" className="btn-primary w-full text-xs py-2">
                        Simpan Bank Soal
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Bulk Actions Floating Bar */}
            {selectedExamIds.length > 0 && (
              <div className="bg-[#133E59] text-white p-3.5 rounded-[10px] flex flex-wrap items-center justify-between gap-3 animate-fadeIn text-xs shadow-md">
                <div className="flex items-center gap-2">
                  <span className="font-bold bg-[#1A936F] text-white px-3 py-1 rounded-full text-xs">
                    {selectedExamIds.length} Soal Terpilih
                  </span>
                  <button
                    onClick={() => setSelectedExamIds([])}
                    className="text-slate-300 hover:text-white underline text-xs"
                  >
                    Batal Seleksi
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-300 text-[11px]">Aksi Massal:</span>
                  <button
                    onClick={handleBulkActivateExams}
                    className="bg-[#1A936F] hover:bg-[#147C5D] text-white px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Aktifkan</span>
                  </button>

                  <button
                    onClick={handleBulkDeactivateExams}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Nonaktifkan</span>
                  </button>

                  <button
                    onClick={handleBulkDeleteExams}
                    className="bg-[#CC0001] hover:bg-red-700 text-white px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            )}

            {/* Exams Table */}
            <div className="bg-white border border-[#DDDDDD] rounded-[10px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#133E59] text-white font-semibold">
                      <th className="p-3 border-b w-10 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#1A936F] cursor-pointer"
                          checked={safeExams.length > 0 && selectedExamIds.length === safeExams.length}
                          onChange={handleSelectAllExams}
                          title="Pilih Semua Soal"
                        />
                      </th>
                      <th className="p-3 border-b">No</th>
                      <th className="p-3 border-b">Judul Mata Ujian</th>
                      <th className="p-3 border-b">Target Kelas</th>
                      <th className="p-3 border-b text-center">Status</th>
                      <th className="p-3 border-b">Link Google Form</th>
                      <th className="p-3 border-b text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDDDDD]">
                    {safeExams.length > 0 ? (
                      safeExams.map((ex, idx) => (
                        <tr
                          key={ex.id}
                          className={`hover:bg-[#F3F3F3] transition-colors ${
                            selectedExamIds.includes(ex.id) ? 'bg-[#1A936F]/5' : ''
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-[#1A936F] cursor-pointer"
                              checked={selectedExamIds.includes(ex.id)}
                              onChange={() => handleToggleSelectExam(ex.id)}
                            />
                          </td>
                          <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-semibold text-[#133E59] max-w-[200px]">
                            {ex.judul_soal}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {(Array.isArray(ex.target_kelas) ? ex.target_kelas : [ex.target_kelas]).map((cls) => (
                                <span key={cls} className="bg-[#133E59]/10 text-[#133E59] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {cls}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ex.is_active ? 'bg-[#1A936F]/10 text-[#1A936F]' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {ex.is_active ? 'AKTIF' : 'NONAKTIF'}
                            </span>
                          </td>
                          <td className="p-3 max-w-[220px]">
                            <span className="font-mono text-[10px] text-slate-500 bg-[#F3F3F3] px-2 py-1 rounded border border-[#DDDDDD] block truncate">
                              {ex.google_form_url}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setExamForm(ex);
                                setShowAddExam(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit Bank Soal"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExam(ex.id)}
                              className="p-1.5 text-[#CC0001] hover:bg-red-50 rounded"
                              title="Hapus Bank Soal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-500">
                          Belum ada bank soal ujian yang ditambahkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODULE 4: REALTIME PROCTOR LOG ================= */}
        {activeTab === 'proctor' && (
          <div className="space-y-6">
            {/* Action Bar & Search Input */}
            <div className="bg-white p-4 rounded-[10px] border border-[#DDDDDD] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 shadow-xs">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-6 h-6 text-[#1A936F] shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-[#133E59]">Audit & Monitoring Sesi Ujian Live</h3>
                  <p className="text-xs text-slate-500">
                    Total {filteredRecappedLogs.length} siswa terpantau live.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Input for NISN, Name, or Class */}
                <div className="relative flex-1 sm:w-64 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchProctorLog}
                    onChange={(e) => setSearchProctorLog(e.target.value)}
                    placeholder="Cari NISN, Nama, atau Kelas..."
                    className="cbt-input text-xs pl-9 py-1.5 border-[#DDDDDD] rounded-md shadow-xs w-full"
                  />
                  {searchProctorLog && (
                    <button
                      onClick={() => setSearchProctorLog('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button onClick={loadLiveLists} className="btn-secondary text-xs py-1.5 px-3 cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Log</span>
                </button>

                {/* Hapus Semua Data Log Button */}
                <button
                  type="button"
                  onClick={() => setShowClearLogsConfirmModal(true)}
                  className="bg-[#CC0001] hover:bg-[#a80001] text-white text-xs font-bold py-1.5 px-3 rounded-md shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Hapus Semua Data Log Monitoring Live"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua Data</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#DDDDDD] rounded-[10px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#133E59] text-white font-semibold">
                      <th className="p-3 border-b">NISN</th>
                      <th className="p-3 border-b">Nama Siswa</th>
                      <th className="p-3 border-b">Kelas</th>
                      <th className="p-3 border-b">Mata Ujian</th>
                      <th className="p-3 border-b text-center">Pelanggaran</th>
                      <th className="p-3 border-b">Status Sesi</th>
                      <th className="p-3 border-b">Waktu Pelanggaran</th>
                      <th className="p-3 border-b text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDDDDD]">
                    {filteredRecappedLogs.length > 0 ? (
                      filteredRecappedLogs.map((lg) => (
                        <tr key={lg.nisn} className="hover:bg-[#F3F3F3]">
                          <td className="p-3 font-mono font-bold text-[#133E59]">{lg.nisn}</td>
                          <td className="p-3 font-semibold">{lg.nama_siswa}</td>
                          <td className="p-3">{lg.kelas}</td>
                          <td className="p-3 font-medium text-slate-700">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-[#133E59]">{lg.judul_soal}</span>
                              {lg.total_exams > 1 && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ({lg.total_exams} Soal Ujian Dikerjakan)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                                lg.total_violations > 0 ? 'bg-[#CC0001] text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {lg.total_violations}x
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                lg.status === 'COMPLETED'
                                  ? 'bg-[#1A936F] text-white'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {lg.status === 'COMPLETED' ? 'Selesai Ujian' : 'Sedang Mengerjakan'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {lg.last_violation_at ? new Date(lg.last_violation_at).toLocaleTimeString('id-ID') : '-'}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Detail Eye Button */}
                              <button
                                onClick={() => setSelectedStudentDetail(lg)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                                title="Lihat Rekap Sesi Ujian & Audit Pelanggaran"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                <span className="hidden sm:inline">Detail</span>
                              </button>

                              {/* Reset Recovery Refresh Button */}
                              <button
                                onClick={() => handleResetSession(lg.nisn, lg.exam_id)}
                                className="p-1.5 text-amber-700 hover:bg-amber-50 border border-amber-300 rounded-md transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                                title="Reset Sesi Ujian Terbaru (Recovery)"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                                <span className="hidden sm:inline">Reset Sesi</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-500">
                          Belum ada aktivitas sesi ujian yang tercatat.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Student Detail & Violation Modal */}
            {selectedStudentDetail && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div className="bg-white border-2 border-[#1A936F] rounded-[14px] max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-3 sticky top-0 bg-white z-10">
                    <h3 className="text-base font-bold text-[#133E59] flex items-center gap-2">
                      <Eye className="w-5 h-5 text-[#1A936F]" />
                      Rekap Sesi Ujian & Detail Siswa
                    </h3>
                    <button
                      onClick={() => setSelectedStudentDetail(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Student Details Card */}
                  <div className="bg-[#F8FAFC] border border-[#DDDDDD] p-4 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Nama Siswa:</span>
                      <span className="font-bold text-[#133E59] text-sm">{selectedStudentDetail.nama_siswa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">NISN:</span>
                      <span className="font-bold font-mono text-[#133E59]">{selectedStudentDetail.nisn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Kelas Target:</span>
                      <span className="font-bold bg-[#1A936F]/10 text-[#1A936F] px-2 py-0.5 rounded">{selectedStudentDetail.kelas}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#DDDDDD] pt-2 mt-2">
                      <span className="text-slate-500 font-medium">Total Ujian Diikuti:</span>
                      <span className="font-bold text-[#133E59]">{selectedStudentDetail.total_exams || 1} Soal Ujian</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Akumulasi Pelanggaran:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        (selectedStudentDetail.total_violations || selectedStudentDetail.violation_count) > 0
                          ? 'bg-[#CC0001] text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {selectedStudentDetail.total_violations || selectedStudentDetail.violation_count || 0}x Pelanggaran
                      </span>
                    </div>
                  </div>

                  {/* List of All Exams Attempted by Student */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#133E59] flex items-center justify-between">
                      <span>Daftar Soal / Mata Ujian yang Dikerjakan:</span>
                      <span className="text-[10px] text-slate-500 font-normal font-mono">
                        ({selectedStudentDetail.all_student_logs?.length || 1} Mata Ujian)
                      </span>
                    </h4>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {selectedStudentDetail.all_student_logs && selectedStudentDetail.all_student_logs.length > 0 ? (
                        selectedStudentDetail.all_student_logs.map((logItem, idx) => (
                          <div
                            key={logItem.id || idx}
                            className="bg-white border border-[#DDDDDD] p-3 rounded-lg flex items-center justify-between text-xs hover:border-[#1A936F]/50 transition-all shadow-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#133E59]">{logItem.judul_soal}</span>
                                {idx === 0 && (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                    Terbaru
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  logItem.status === 'COMPLETED' ? 'bg-[#1A936F] text-white' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {logItem.status === 'COMPLETED' ? 'Selesai' : 'Sedang Dikerjakan'}
                                </span>
                                <span>• Pelanggaran: <strong className={logItem.violation_count > 0 ? 'text-[#CC0001]' : 'text-emerald-700'}>{logItem.violation_count || 0}x</strong></span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                handleResetSession(selectedStudentDetail.nisn, logItem.exam_id);
                                setSelectedStudentDetail(null);
                              }}
                              className="p-1.5 text-amber-800 hover:bg-amber-100 bg-amber-50 border border-amber-300 rounded text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                              title="Reset Sesi Ujian Ini"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                              <span>Reset Sesi</span>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white border border-[#DDDDDD] p-3 rounded-lg text-xs text-slate-700">
                          <span className="font-bold text-[#133E59]">{selectedStudentDetail.judul_soal}</span>
                          <div className="mt-1 flex justify-between items-center text-[11px]">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">{selectedStudentDetail.status}</span>
                            <span>Pelanggaran: {selectedStudentDetail.violation_count || 0}x</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Violation Breakdown Notice */}
                  <div className="space-y-2 pt-2 border-t border-[#DDDDDD]">
                    <h4 className="text-xs font-bold text-[#133E59]">Catatan Sistem Pengawasan:</h4>
                    {(selectedStudentDetail.total_violations || selectedStudentDetail.violation_count) > 0 ? (
                      <div className="bg-[#CC0001]/5 border border-[#CC0001]/20 rounded-lg p-3 space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 text-[#CC0001] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-[#CC0001]">Terdeteksi Hilang Fokus / Keluar Fullscreen</p>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Sistem mencatat riwayat siswa ini pernah meminimalkan browser atau keluar dari mode fullscreen saat mengerjakan ujian.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Siswa ini tertib dan belum pernah terdeteksi melakukan pelanggaran.</span>
                      </div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentDetail(null)}
                      className="btn-secondary w-full text-xs py-2 cursor-pointer"
                    >
                      Tutup Detail
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Clear All Logs Modal */}
            {showClearLogsConfirmModal && (
              <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div className="bg-white border-2 border-[#CC0001] rounded-[14px] max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs">
                  <div className="flex items-center space-x-3 text-[#CC0001]">
                    <div className="p-2.5 bg-red-100 rounded-full shrink-0">
                      <Trash2 className="w-6 h-6 text-[#CC0001]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#133E59]">Hapus Semua Data Log Live?</h3>
                      <p className="text-xs text-slate-500">Konfirmasi Pembersihan Log Monitoring</p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 p-3.5 rounded-lg text-slate-700 leading-relaxed space-y-1">
                    <p className="font-bold text-[#CC0001]">⚠️ PERINGATAN KERAS:</p>
                    <p className="text-[11px] text-slate-600">
                      Tindakan ini akan menghapus <strong>SELURUH data log sesi ujian & riwayat pelanggaran live</strong> secara permanen. Data yang telah dihapus tidak dapat dikembalikan lagi.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowClearLogsConfirmModal(false)}
                      className="btn-secondary w-full text-xs py-2 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllLogs}
                      className="btn-primary w-full text-xs py-2 bg-[#CC0001] hover:bg-[#a80001] text-white flex items-center justify-center gap-1.5 cursor-pointer font-bold shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Ya, Hapus Semua Data</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= MODULE 5: PENGATURAN SEKOLAH & SYSTEM ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="card-container bg-white space-y-6">
              <div className="flex items-center space-x-3 border-b border-[#DDDDDD] pb-4">
                <Building className="w-6 h-6 text-[#1A936F]" />
                <div>
                  <h3 className="text-base font-bold text-[#133E59]">Identitas Sekolah & System Configuration</h3>
                  <p className="text-xs text-slate-500">Ubah nama sekolah, logo, dan master secret key token engine.</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-bold text-[#133E59] mb-1.5 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-[#1A936F]" />
                      <span>Nama Sekolah (Header Brand)</span>
                    </label>
                    <input
                      type="text"
                      value={settings.school_name}
                      onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                      placeholder="Contoh: SMA Negeri 2 Kebumen"
                      className="cbt-input text-sm font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#133E59] mb-1.5 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#1A936F]" />
                      <span>Sub-Judul Aplikasi</span>
                    </label>
                    <input
                      type="text"
                      value={settings.school_subtext}
                      onChange={(e) => setSettings({ ...settings, school_subtext: e.target.value })}
                      placeholder="Contoh: CBT Online Assessment System"
                      className="cbt-input text-sm font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Logo Settings Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#133E59] flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-[#1A936F]" />
                      <span>Logo Sekolah (Upload File atau Tautan URL)</span>
                    </label>
                    <label className="btn-secondary text-[11px] py-1 px-3 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'school_logo_url')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={settings.school_logo_url || ''}
                    onChange={(e) => setSettings({ ...settings, school_logo_url: e.target.value })}
                    placeholder="Klik 'Upload File Logo' atau tempelkan URL gambar (https://...)"
                    className="cbt-input text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    Upload file gambar logo (.png/.svg/.jpg) dari komputer Anda atau tempelkan tautan URL gambar.
                  </p>
                </div>

                {/* Hero Background Image Settings Section */}
                <div className="space-y-2 pt-3 border-t border-[#DDDDDD]">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#133E59] flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-[#1A936F]" />
                      <span>Gambar Background Halaman Awal / Login (Upload File atau Tautan URL)</span>
                    </label>
                    <label className="btn-secondary text-[11px] py-1 px-3 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File Background</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'hero_bg_url')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={settings.hero_bg_url || ''}
                    onChange={(e) => setSettings({ ...settings, hero_bg_url: e.target.value })}
                    placeholder="Klik 'Upload File Background' atau tempelkan URL gambar foto/ilustrasi sekolah"
                    className="cbt-input text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    Upload gambar foto/ilustrasi gedung sekolah untuk latar belakang panel kiri halaman login siswa.
                  </p>
                </div>

                {/* Combined Live Preview Box */}
                <div className="bg-[#F3F3F3] p-4 rounded-lg border border-[#DDDDDD] space-y-3">
                  <span className="text-xs font-bold text-[#133E59] block">Live Preview Tampilan Halaman Ujian:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Logo Preview */}
                    <div className="flex items-center space-x-3 bg-white p-3 rounded-md border border-[#DDDDDD]">
                      <div className="w-10 h-10 rounded bg-[#133E59] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {settings.school_logo_url ? (
                          <img src={settings.school_logo_url} alt="Logo Preview" className="w-full h-full object-contain" />
                        ) : (
                          <GraduationCap className="w-6 h-6 text-[#1A936F]" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-xs text-[#133E59] block truncate">{settings.school_name || 'Nama Sekolah'}</span>
                        <span className="text-[10px] text-[#5CA08E] block truncate">{settings.school_subtext}</span>
                      </div>
                    </div>

                    {/* Hero Background Preview */}
                    <div className="relative h-16 rounded-md overflow-hidden border border-[#DDDDDD] bg-slate-800 flex items-center justify-center text-white text-[11px] font-bold">
                      <img
                        src={settings.hero_bg_url || '/hero-login.png'}
                        alt="Hero Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                        onError={(e) => { e.target.src = '/hero-login.png'; }}
                      />
                      <span className="relative z-10 bg-black/60 px-2.5 py-1 rounded text-[10px]">
                        {settings.hero_bg_url ? 'Background Custom Terpasang' : 'Background Default'}
                      </span>
                    </div>
                  </div>
                </div>



                {/* PIN Izin Minimize Jaringan (Bypass Internet Disconnect) */}
                <div className="pt-3 border-t border-[#DDDDDD] space-y-2">
                  <label className="block font-bold text-[#133E59] flex items-center gap-1.5 text-xs">
                    <Key className="w-4 h-4 text-[#1A936F]" />
                    <span>Kode PIN Izin Minimize Jaringan (Emergency Network Bypass PIN)</span>
                  </label>
                  <input
                    type="text"
                    value={settings.network_minimize_pin || '1234'}
                    onChange={(e) => setSettings({ ...settings, network_minimize_pin: e.target.value })}
                    placeholder="Contoh: 1234 atau PIN Rahasia Pengawas"
                    className="cbt-input text-xs font-mono font-bold text-[#133E59]"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    PIN khusus pengawas yang digunakan saat internet siswa terputus. Siswa mengklik tombol <strong>Terputus</strong> di layar ujian dan memasukkan PIN ini untuk meminimalkan browser tanpa memicu kunci layar pelanggaran.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DDDDDD]">
                  <label className="block font-bold text-[#133E59] mb-1.5 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[#E95950]" />
                    <span>Master Secret Key Dynamic Token Engine</span>
                  </label>
                  <input
                    type="text"
                    value={settings.secret_key}
                    onChange={(e) => setSettings({ ...settings, secret_key: e.target.value })}
                    className="cbt-input text-xs font-mono text-[#CC0001] font-bold"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Kunci enkripsi rahasia untuk algoritma token 5-menit. Mengubah nilai ini akan langsung memutar ulang semua token global.
                  </p>
                </div>

                <button type="submit" className="btn-primary py-2.5 px-6 text-xs">
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan Sekolah</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
