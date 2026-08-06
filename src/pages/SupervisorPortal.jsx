import React, { useState } from 'react';
import { useDynamicToken } from '../hooks/useDynamicToken';
import {
  KeyRound,
  RefreshCw,
  Clock,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Info,
  CheckCircle2,
  Copy,
  ArrowLeft,
  Key
} from 'lucide-react';

import { ToastNotification } from '../components/ToastNotification';

export function SupervisorPortal({ settings, onBackToAdmin }) {
  const secretKey = settings?.secret_key || 'SMANDA_CBT_SECURE_TOKEN_SECRET_2026';
  const schoolName = settings?.school_name || '';
  const schoolSubtext = settings?.school_subtext || 'CBT Online Assessment System';
  const logoUrl = settings?.school_logo_url || '';

  const { activeToken, secondsRemaining, formattedTime, manualRefresh } =
    useDynamicToken(secretKey);

  const [notification, setNotification] = useState('');

  const handleManualRefresh = () => {
    manualRefresh();
    setNotification('Token 3-huruf baru berhasil di-refresh!');
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(activeToken);
    setCopied(true);
    setNotification(`Kode token ${activeToken} berhasil disalin!`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate percentage of 300 seconds remaining
  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / 300) * 100));

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      {/* Toast Notification Top Right */}
      <ToastNotification message={notification} type="success" onClose={() => setNotification('')} />

      <div className="w-full max-w-2xl space-y-6">
        {/* Top Header Card */}
        <div className="bg-[#133E59] text-white p-6 rounded-[10px] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center p-2 border border-white/20 shrink-0">
                <GraduationCap className="w-8 h-8 text-[#1A936F]" />
              </div>
            )}
            <div>
              <span className="bg-[#1A936F] text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                Portal Token Pengawas
              </span>
              <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white">
                {schoolName}
              </h1>
              <p className="text-xs text-slate-300">{schoolSubtext}</p>
            </div>
          </div>

          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="btn-secondary py-1.5 px-3 text-xs bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Masuk Admin</span>
            </button>
          )}
        </div>

        {/* Link Token URL Share Banner */}
        <div className="bg-white border border-[#DDDDDD] p-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-700 min-w-0 truncate">
            <Sparkles className="w-4 h-4 text-[#1A936F] shrink-0" />
            <span className="font-semibold text-slate-500 shrink-0">Alamat Halaman Token:</span>
            <span className="font-mono font-bold text-[#133E59] truncate bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {window.location.origin}/token
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/token`);
              setNotification(`Link ${window.location.origin}/token berhasil disalin!`);
            }}
            className="btn-secondary text-[11px] py-1.5 px-3 bg-slate-100 hover:bg-[#1A936F] hover:text-white border-slate-300 rounded-lg shrink-0 flex items-center gap-1.5 font-semibold cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Link Halaman Token</span>
          </button>
        </div>

        {/* Emergency Network Bypass PIN Card */}
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl text-amber-900 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-950 text-xs">PIN Izin Minimize Jaringan (Bypass Emergency):</p>
              <p className="text-[11px] text-amber-800">Berikan PIN ini ke siswa jika Wi-Fi terputus & butuh minimalkan browser.</p>
            </div>
          </div>
          <div className="text-xl font-black font-mono tracking-widest bg-white border-2 border-amber-400 px-4 py-1.5 rounded-xl text-amber-950 shadow-inner shrink-0">
            {settings?.network_minimize_pin || '1234'}
          </div>
        </div>

        {/* Giant Active Token Display Card */}
        <div className="bg-white border-4 border-[#1A936F] rounded-[12px] p-6 sm:p-10 shadow-elevation-large text-center space-y-6 relative overflow-hidden">
          {/* Top Decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#133E59] via-[#1A936F] to-[#00ACED]" />

          <div className="space-y-1">
            <span className="text-xs sm:text-sm font-bold text-[#5CA08E] uppercase tracking-widest block">
              TOKEN UJIAN AKTIF (3 HURUF)
            </span>
            <p className="text-xs text-slate-500">
              Tuliskan kode 3 huruf ini di papan tulis kelas atau berikan ke siswa.
            </p>
          </div>

          {/* Giant Token Display */}
          <div className="relative inline-block my-4">
            <div className="text-6xl sm:text-8xl font-black font-mono text-[#133E59] tracking-[0.25em] bg-[#F3F3F3] px-8 py-4 sm:px-12 sm:py-6 rounded-2xl border-2 border-[#1A936F] shadow-inner select-all">
              {activeToken}
            </div>

            <button
              onClick={handleCopy}
              className="mt-3 inline-flex items-center space-x-1.5 text-xs text-[#1A936F] hover:text-[#147C5D] font-semibold bg-[#1A936F]/10 hover:bg-[#1A936F]/20 px-3 py-1.5 rounded-full transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Tersalin!' : 'Salin Kode Token'}</span>
            </button>
          </div>

          {/* Automatic 5-Minute Progress Bar & Timer */}
          <div className="space-y-2 max-w-md mx-auto pt-2">
            <div className="flex justify-between items-center text-xs font-semibold text-[#133E59]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1A936F]" />
                Rotasi Otomatis (5 Menit)
              </span>
              <span className="font-mono text-sm font-bold text-[#1A936F]">
                {formattedTime}
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-[#DDDDDD] h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#1A936F] to-[#00ACED] h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Manual Refresh Button */}
          <div className="pt-6 border-t border-[#DDDDDD] flex justify-end">
            <button
              onClick={handleManualRefresh}
              className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold bg-[#133E59] hover:bg-[#0e2d42]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Acak / Refresh Token Manual</span>
            </button>
          </div>
        </div>

        {/* Teacher Instructions Box */}
        <div className="bg-white border border-[#DDDDDD] p-5 rounded-[10px] text-xs text-slate-700 shadow-sm">
          <h3 className="font-bold text-[#133E59] text-sm flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-[#1A936F]" />
            Petunjuk Pengawas Ruang Ujian:
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1A936F] mt-0.5 shrink-0" />
              <span>Token terdiri dari <strong>3 huruf kapital acak (A-Z)</strong> agar mudah diinput oleh siswa di HP/Laptop.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1A936F] mt-0.5 shrink-0" />
              <span>Token <strong>berotasi otomatis setiap 5 menit</strong>. Pastikan siswa memasukkan token sebelum batas waktu rotasi.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1A936F] mt-0.5 shrink-0" />
              <span>Tekan tombol <strong>"Acak / Refresh Token Manual"</strong> jika Anda ingin langsung membuat kode 3 huruf baru saat itu juga.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
