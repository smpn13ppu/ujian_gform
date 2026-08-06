import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export function FinishExamModal({ examTitle, onConfirmFinish, onCancel }) {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white border-2 border-[#1A936F] rounded-[10px] max-w-md w-full p-6 text-center space-y-6 shadow-elevation-large">
        <div className="w-16 h-16 bg-[#1A936F]/10 rounded-full flex items-center justify-center mx-auto text-[#1A936F]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#133E59] mb-2">
            Konfirmasi Selesai Ujian
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Apakah Anda yakin ingin mengakhiri sesi ujian untuk <strong>"{examTitle}"</strong>?
          </p>
        </div>

        <div className="bg-[#F3F3F3] p-3.5 rounded-md text-xs text-amber-800 border border-amber-200 flex items-start gap-2 text-left">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Pastikan Anda sudah menekan tombol <strong>"Kirim / Submit"</strong> pada formulir Google Form di dalam layar ujian sebelum mengonfirmasi selesai.
          </span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="btn-secondary w-full text-xs sm:text-sm py-2"
          >
            Kembali ke Soal
          </button>
          <button
            onClick={onConfirmFinish}
            className="btn-primary w-full text-xs sm:text-sm py-2"
          >
            Selesai Ujian
          </button>
        </div>
      </div>
    </div>
  );
}
