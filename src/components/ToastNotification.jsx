import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export function ToastNotification({ message, type = 'error', onClose, duration = 4000 }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!message) return;
    setIsExiting(false);

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // 300ms matches exit animation duration
  };

  if (!message) return null;

  const styles = {
    error: {
      border: 'border-l-4 border-[#CC0001]',
      bgIcon: 'bg-[#CC0001]/10 text-[#CC0001]',
      titleColor: 'text-[#CC0001]',
      title: 'Peringatan System',
      icon: AlertCircle,
    },
    success: {
      border: 'border-l-4 border-[#1A936F]',
      bgIcon: 'bg-[#1A936F]/10 text-[#1A936F]',
      titleColor: 'text-[#1A936F]',
      title: 'Berhasil',
      icon: CheckCircle,
    },
    warning: {
      border: 'border-l-4 border-amber-500',
      bgIcon: 'bg-amber-500/10 text-amber-600',
      titleColor: 'text-amber-600',
      title: 'Perhatian',
      icon: AlertTriangle,
    },
    info: {
      border: 'border-l-4 border-blue-500',
      bgIcon: 'bg-blue-500/10 text-blue-600',
      titleColor: 'text-blue-600',
      title: 'Informasi',
      icon: Info,
    },
  };

  const currentStyle = styles[type] || styles.error;
  const IconComp = currentStyle.icon;

  return (
    <div
      className={`fixed top-5 right-5 z-[99999] max-w-sm w-[90vw] sm:w-auto bg-white rounded-r-xl shadow-2xl p-4 flex items-start gap-3 border border-slate-200 transition-all duration-300 transform ${
        isExiting
          ? 'translate-x-full opacity-0 scale-95'
          : 'translate-x-0 opacity-100 scale-100 animate-slideInRight'
      } ${currentStyle.border}`}
      style={{
        animation: isExiting ? 'none' : undefined,
      }}
    >
      <div className={`p-2 rounded-full shrink-0 ${currentStyle.bgIcon}`}>
        <IconComp className="w-5 h-5" />
      </div>
      <div className="flex-1 pr-1 min-w-0">
        <p className={`font-bold text-xs uppercase tracking-wider mb-0.5 ${currentStyle.titleColor}`}>
          {currentStyle.title}
        </p>
        <p className="text-xs text-slate-700 leading-relaxed font-medium break-words">
          {message}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md shrink-0"
        title="Tutup Notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
