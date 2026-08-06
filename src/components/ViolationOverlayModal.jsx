import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, AlertTriangle } from 'lucide-react';

export function ViolationOverlayModal({ reason, violationCount, onVerifyToken }) {
  const [tokenInput, setTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!tokenInput.trim()) {
      setErrorMsg('Silakan masukkan Token Pengawas.');
      return;
    }

    setLoading(true);
    try {
      const success = await onVerifyToken(tokenInput.trim());
      if (!success) {
        setErrorMsg('Token Pengawas tidak sah! Minta pengawas untuk token aktif saat ini.');
      } else {
        setTokenInput('');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memverifikasi token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4 modal-proctor select-none animate-fadeIn">
      <div className="bg-white border-4 border-[#CC0001] rounded-[10px] max-w-lg w-full p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Violation Icon */}
        <div className="w-20 h-20 bg-[#CC0001]/10 rounded-full flex items-center justify-center mx-auto text-[#CC0001]">
          <Lock className="w-10 h-10 animate-bounce" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 bg-[#CC0001] text-white font-bold text-xs rounded-full uppercase tracking-wider mb-2">
            Pelanggaran Terdeteksi #{violationCount}
          </span>
          <h3 className="text-2xl font-bold text-[#CC0001] mt-1">
            Ujian Terkunci!
          </h3>
          <p className="text-sm font-semibold text-slate-800 mt-2 bg-red-50 p-3 rounded-md border border-red-200 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#CC0001] shrink-0" />
            <span>{reason || 'Terjadi indikasi pelanggaran aturan ujian.'}</span>
          </p>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <p>Sistem merekam event ini dalam log pengawasan server.</p>
          <p>
            Panggil <strong>Pengawas Ruang Ujian</strong> untuk memasukkan <strong>Token Pengawas Aktif</strong> agar sistem dapat dibuka kembali.
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left">
          <div>
            <label className="block text-xs font-bold text-[#133E59] mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#1A936F]" />
              <span>Token Pengawas (Dynamic Token 5 Menit)</span>
            </label>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
              placeholder="Ketik 3 Huruf Token"
              maxLength={3}
              className="cbt-input text-2xl font-mono text-center tracking-[0.2em] uppercase border-2 border-[#133E59] rounded-md font-bold"
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="bg-[#CC0001]/10 border border-[#CC0001]/30 rounded-md p-2.5 text-xs text-[#CC0001] font-medium text-center">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full bg-[#133E59] hover:bg-[#0e2d42] text-sm font-bold"
          >
            {loading ? 'Memverifikasi...' : 'Buka Kuncian & Lanjutkan Ujian'}
          </button>
        </form>
      </div>
    </div>
  );
}
