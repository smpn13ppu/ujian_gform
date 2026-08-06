import React, { useState } from 'react';
import { ShieldCheck, User, Lock, KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { storageEngine } from '../lib/storageEngine';

export function AdminAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await storageEngine.verifyAdminCredentials(username.trim(), password.trim());
      if (result.success) {
        onAuthSuccess(result.user);
        setUsername('');
        setPassword('');
      } else {
        setErrorMsg(result.message || 'Username atau Password Admin salah!');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal melakukan verifikasi login admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
      <div className="bg-white border-2 border-[#133E59] rounded-[20px] max-w-md w-full p-6 space-y-5 shadow-2xl relative text-xs">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#133E59] text-white rounded-xl shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#1A936F]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#133E59]">Otentikasi Login Admin</h3>
              <p className="text-xs text-slate-500">Panel Kontrol CBT Online System</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-[#133E59]/5 border border-[#133E59]/15 p-3 rounded-xl text-slate-700 leading-relaxed text-xs">
          <p className="font-bold text-[#133E59] flex items-center gap-1.5 mb-0.5">
            <Lock className="w-4 h-4 text-[#1A936F]" />
            Akses Terbatas Khusus Guru / Admin
          </p>
          <p className="text-[11px] text-slate-600">
            Masukkan kredensial akun admin Anda (Default Username: <strong>guru</strong>, Password: <strong>guru</strong>).
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block font-bold text-[#133E59] mb-1.5">
              Username Admin:
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Masukkan username (contoh: guru)"
                className="cbt-input text-xs font-semibold pl-9 py-2.5 border-[#DDDDDD] rounded-xl shadow-xs w-full focus:border-[#1A936F]"
                autoFocus
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#133E59] mb-1.5">
              Password Admin:
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Masukkan password (contoh: guru)"
                className="cbt-input text-xs font-semibold pl-9 py-2.5 border-[#DDDDDD] rounded-xl shadow-xs w-full focus:border-[#1A936F]"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {errorMsg && (
            <div className="bg-[#CC0001]/10 border border-[#CC0001]/30 rounded-xl p-3 text-[#CC0001] font-semibold text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full text-xs py-2.5 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2.5 bg-[#133E59] hover:bg-[#0D2E42] text-white flex items-center justify-center gap-1.5 font-bold shadow-md rounded-xl cursor-pointer"
            >
              {loading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#1A936F]" />
                  <span>Verifikasi & Masuk Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
