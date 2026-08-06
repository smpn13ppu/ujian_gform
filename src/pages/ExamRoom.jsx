import React, { useState, useEffect } from 'react';
import { useProctoring } from '../hooks/useProctoring';
import { ViolationOverlayModal } from '../components/ViolationOverlayModal';
import { FinishExamModal } from '../components/FinishExamModal';
import { ToastNotification } from '../components/ToastNotification';
import { storageEngine } from '../lib/storageEngine';
import {
  Shield,
  ShieldAlert,
  CheckCircle2,
  User,
  BookOpen,
  Wifi,
  WifiOff,
  Key,
  Maximize2,
  X,
  AlertTriangle,
  Monitor,
  RefreshCw
} from 'lucide-react';

export function ExamRoom({ student, exam, settings, onFinishExam }) {
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Google Form Iframe Refresh State
  const [iframeKey, setIframeKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshIframe = () => {
    setIsRefreshing(true);
    setIframeKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Network Bypass Modal & PIN State
  const [showNetworkBypassModal, setShowNetworkBypassModal] = useState(false);
  const [showReconnectFullscreenModal, setShowReconnectFullscreenModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isBypassActive, setIsBypassActive] = useState(false);

  // Real-time network listener with graceful Fullscreen restoration on reconnection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // When internet reconnects:
      // If browser is NOT currently in Fullscreen, prompt student with a clean Fullscreen Restore modal.
      // Using explicit user click gesture guarantees requestFullscreen() succeeds without browser security blocks.
      if (!document.fullscreenElement) {
        setShowReconnectFullscreenModal(true);
      } else {
        setShowReconnectFullscreenModal(false);
        setIsBypassActive(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRestoreFullscreenAfterReconnect = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Re-enter fullscreen error:', err);
    }
    setShowReconnectFullscreenModal(false);
    setIsBypassActive(false);
  };

  // Proctoring Lock is ENABLED ONLY WHEN:
  // 1. Student is Online
  // 2. Network Bypass PIN is NOT active
  // 3. Reconnect Fullscreen restore modal is NOT pending student click
  const isProctoringEnabled = isOnline && !isBypassActive && !showReconnectFullscreenModal;

  // Initialize anti-cheat proctoring hook
  const {
    isViolationActive,
    violationCount,
    violationReason,
    unlockProctoring,
  } = useProctoring({
    isActive: isProctoringEnabled,
    isOnline,
    studentInfo: student,
    activeExam: exam,
    secretKey: settings?.secret_key,
  });

  const handleConfirmFinish = async () => {
    // Exit Fullscreen if active
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Exit fullscreen error:', err);
    }

    // Mark log status as COMPLETED
    await storageEngine.createOrUpdateLog({
      nisn: student.nisn,
      studentName: student.nama,
      kelas: student.kelas,
      examId: exam.id,
      examTitle: exam.judul_soal,
      violationIncrement: 0,
      status: 'COMPLETED',
    });

    onFinishExam();
  };

  const handleVerifyBypassPin = (e) => {
    e.preventDefault();
    setPinError('');
    const targetPin = String(settings?.network_minimize_pin || '1234').trim();
    if (String(pinInput).trim() === targetPin) {
      setIsBypassActive(true);
      setShowNetworkBypassModal(false);
      setPinInput('');
      // Exit Fullscreen to allow Wi-Fi reconnection
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen();
        }
      } catch (err) {
        console.warn('Exit fullscreen for network bypass:', err);
      }
    } else {
      setPinError('Kode PIN Izin Minimize salah! Minta PIN rahasia kepada Pengawas.');
    }
  };

  const handleReenterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Re-enter fullscreen error:', err);
    }
    setIsBypassActive(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F3F3F3] overflow-hidden select-none relative">
      {/* Offline Toast Alert */}
      {!isOnline && !isBypassActive && (
        <ToastNotification
          message="Koneksi internet/LAN terputus! Klik tombol 'Terputus' di kanan atas untuk meminta PIN Izin Minimize."
          type="error"
          duration={10000}
        />
      )}

      {/* Persistent Banner when Network Bypass Mode is Active */}
      {isBypassActive && (
        <div className="bg-amber-600 text-white px-4 py-2.5 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs z-50 animate-fadeIn border-b-2 border-amber-700">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-white animate-pulse shrink-0" />
            <span className="font-bold">
              MODE PERBAIKAN JARINGAN: Sambungkan Wi-Fi Anda. Sistem akan OTOMATIS Fullscreen saat internet terhubung, atau klik tombol komputer di kanan jika ingin Maximize manual:
            </span>
          </div>

          <button
            onClick={handleReenterFullscreen}
            className="bg-white text-amber-950 hover:bg-amber-100 font-bold px-3.5 py-1.5 rounded-md shadow-md transition-all flex items-center gap-2 text-xs cursor-pointer border border-amber-300"
            title="Klik Ikon Komputer untuk Maximize Fullscreen Secara Manual"
          >
            <Monitor className="w-4 h-4 text-[#133E59]" />
            <span>Maximize Fullscreen Manual</span>
          </button>
        </div>
      )}

      {/* Sticky Top Bar Header */}
      <header className="h-[60px] bg-[#133E59] text-white px-4 sm:px-6 flex items-center justify-between shadow-md shrink-0 border-b border-[#1A936F]/40 z-30">
        {/* Left: Student & Exam Metadata */}
        <div className="flex items-center space-x-3 sm:space-x-6 min-w-0">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold truncate">
            <User className="w-4 h-4 text-[#1A936F] shrink-0" />
            <span className="truncate">{student.nama}</span>
            <span className="bg-[#1A936F] text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
              {student.kelas}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-300 border-l border-slate-700 pl-6 truncate">
            <BookOpen className="w-4 h-4 text-[#00ACED] shrink-0" />
            <span className="truncate font-medium">{exam.judul_soal}</span>
          </div>
        </div>

        {/* Right: Security Badge, Dynamic Connection Pulse, Manual Computer Icon Maximize, Finish Button */}
        <div className="flex items-center space-x-3 shrink-0">
          {violationCount > 0 ? (
            <div className="flex items-center space-x-1 bg-[#CC0001] text-white text-xs px-2.5 py-1 rounded-md font-bold animate-pulse">
              <ShieldAlert className="w-4 h-4" />
              <span>Pelanggaran: {violationCount}</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-1 bg-[#1A936F]/20 text-[#1A936F] border border-[#1A936F]/40 text-xs px-2.5 py-1 rounded-md font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Proctoring Aktif</span>
            </div>
          )}

          {/* Computer Icon Button for Manual Maximize (Only visible during minimize bypass) */}
          {isBypassActive && (
            <button
              onClick={handleReenterFullscreen}
              className="bg-amber-500 hover:bg-amber-400 text-[#133E59] font-bold px-2.5 py-1 rounded-md shadow-md transition-all flex items-center gap-1.5 text-xs cursor-pointer border border-amber-300 animate-pulse"
              title="Klik Ikon Komputer untuk Maximize Fullscreen Secara Manual"
            >
              <Monitor className="w-4 h-4 text-[#133E59]" />
              <span className="hidden md:inline text-[11px]">Maximize</span>
            </button>
          )}

          {/* Real-time Connection Status Indicator (Clickable ONLY when offline for PIN Minimize) */}
          {isOnline ? (
            <div
              className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md border border-slate-700 text-emerald-400 bg-slate-900/60"
              title="Koneksi terhubung aktif"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[11px] font-mono font-bold">Terhubung</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNetworkBypassModal(true)}
              className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md border border-red-700 text-red-300 bg-red-950/90 animate-pulse hover:bg-red-900 transition-all cursor-pointer shadow-md"
              title="Koneksi terputus! Klik untuk memasukkan PIN Izin Minimize"
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline text-[11px] font-mono font-bold">
                Terputus
              </span>
            </button>
          )}

          {/* Refresh Google Form Only Button (Icon Only) */}
          <button
            type="button"
            onClick={handleRefreshIframe}
            className="p-1.5 sm:p-2 text-slate-200 hover:text-white bg-slate-800/90 hover:bg-[#1A936F] border border-slate-700 hover:border-[#1A936F] rounded-md transition-all shadow-xs cursor-pointer flex items-center justify-center"
            title="Refresh Halaman Soal Google Form (Tanpa Memulai Ulang Halaman)"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Finish Button */}
          <button
            onClick={() => setShowFinishModal(true)}
            className="bg-[#1A936F] hover:bg-[#147C5D] active:bg-[#0F6B4F] text-white text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-[5px] shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Selesai Ujian</span>
          </button>
        </div>
      </header>

      {/* Main Body: Embedded Google Form */}
      <main className="flex-1 w-full relative bg-white">
        <iframe
          key={iframeKey}
          src={exam.google_form_url}
          title={exam.judul_soal}
          className="w-full h-full border-0"
          allow="autoplay"
        />
      </main>

      {/* Emergency Network Bypass PIN Modal */}
      {showNetworkBypassModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border-2 border-amber-500 rounded-[14px] max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-3">
              <h3 className="text-base font-bold text-[#133E59] flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                Izin Temporary Minimize Perbaikan Jaringan
              </h3>
              <button
                onClick={() => {
                  setShowNetworkBypassModal(false);
                  setPinError('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Mode Darurat Perbaikan Jaringan
              </p>
              <p className="text-[11px] text-amber-800">
                Minta Pengawas/Admin untuk memasukkan <strong>Kode PIN Izin Minimize</strong> agar Anda dapat meminimalkan browser dan menyambungkan kembali Wi-Fi tanpa memicu kunci layar pelanggaran.
              </p>
            </div>

            <form onSubmit={handleVerifyBypassPin} className="space-y-4 pt-1">
              <div>
                <label className="block font-bold text-[#133E59] mb-1">
                  Kode PIN Izin Minimize (dari Pengawas):
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Masukkan Kode PIN Izin Minimize"
                  className="cbt-input text-base font-mono tracking-widest text-center font-bold text-[#133E59]"
                  autoFocus
                  required
                />
              </div>

              {pinError && (
                <div className="bg-[#CC0001]/10 border border-[#CC0001]/30 rounded p-2.5 text-[#CC0001] font-semibold text-center text-[11px]">
                  {pinError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNetworkBypassModal(false);
                    setPinError('');
                  }}
                  className="btn-secondary w-full text-xs py-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary w-full text-xs py-2 bg-amber-600 hover:bg-amber-700"
                >
                  <Key className="w-4 h-4" />
                  <span>Verifikasi & Izinkan Minimize</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconnect Fullscreen Restore Modal (No Violation) */}
      {showReconnectFullscreenModal && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border-2 border-emerald-500 rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Wifi className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#133E59]">Koneksi Internet Terhubung Kembali! 🌐</h3>
              <p className="text-xs text-slate-500 mt-1">
                Sistem mendeteksi koneksi jaringan/Wi-Fi Anda telah terhubung aktif.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-900 leading-relaxed text-left text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Lanjutkan Ujian dengan Aman
              </p>
              <p className="text-[11px] text-emerald-700">
                Silakan klik tombol di bawah untuk masuk kembali ke <strong>Mode Fullscreen</strong> dan melanjutkan pengerjaan soal ujian secara aman.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleRestoreFullscreenAfterReconnect}
                className="btn-primary w-full text-xs py-3 bg-[#1A936F] hover:bg-[#147C5D] text-white flex items-center justify-center gap-2 font-bold shadow-lg text-sm rounded-xl cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Masuk Fullscreen & Lanjutkan Ujian</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Violation Overlay Modal */}
      {isViolationActive && (
        <ViolationOverlayModal
          reason={violationReason}
          violationCount={violationCount}
          onVerifyToken={unlockProctoring}
        />
      )}

      {/* Finish Confirmation Modal */}
      {showFinishModal && (
        <FinishExamModal
          examTitle={exam.judul_soal}
          onConfirmFinish={handleConfirmFinish}
          onCancel={() => setShowFinishModal(false)}
        />
      )}
    </div>
  );
}
