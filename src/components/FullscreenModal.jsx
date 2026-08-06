import React from 'react';
import { Maximize2, ShieldCheck, AlertCircle, Check } from 'lucide-react';

export function FullscreenModal({ exam, onConfirm, onCancel }) {
  const handleActivateFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request bypassed or denied:', err);
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white border-2 border-[#1A936F] rounded-[10px] max-w-lg w-full p-6 sm:p-8 shadow-elevation-large text-center space-y-6">
        <div className="w-16 h-16 bg-[#1A936F]/10 rounded-full flex items-center justify-center mx-auto text-[#1A936F]">
          <Maximize2 className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#133E59] mb-2">
            Persetujuan Mode Fullscreen
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Aplikasi membutuhkan <strong>Mode Layar Penuh (Fullscreen)</strong> untuk menjaga integritas ujian <strong>"{exam?.judul_soal}"</strong>.
          </p>
        </div>

        <div className="bg-[#F3F3F3] p-4 rounded-md text-left text-xs space-y-2 border border-[#DDDDDD] text-slate-700">
          <p className="font-semibold text-[#133E59] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1A936F]" />
            Catatan Integritas:
          </p>
          <ul className="space-y-1.5">
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-[#1A936F] mt-0.5 shrink-0" />
              <span>Layar browser Anda akan dikunci secara otomatis.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-[#1A936F] mt-0.5 shrink-0" />
              <span>Jika Anda menghentikan mode Fullscreen, ujian akan diblokir.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onCancel}
            className="btn-secondary w-full text-xs sm:text-sm py-2.5"
          >
            Batal
          </button>
          <button
            onClick={handleActivateFullscreen}
            className="btn-primary w-full text-xs sm:text-sm py-2.5"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Setuju & Aktifkan Fullscreen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
