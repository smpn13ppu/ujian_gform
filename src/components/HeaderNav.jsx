import React from 'react';
import { ShieldCheck, GraduationCap, UserCheck, LayoutDashboard } from 'lucide-react';

export function HeaderNav({ currentMode, onSwitchMode, activeStudent, settings }) {
  const schoolName = settings?.school_name || '';
  const schoolSubtext = settings?.school_subtext || 'CBT Online Assessment System';
  const logoUrl = settings?.school_logo_url || '';

  return (
    <header className="bg-white border-b border-[#DDDDDD] shadow-sm sticky top-0 z-40">
      {/* Top Banner Accent */}
      <div className="h-1.5 bg-gradient-to-r from-[#133E59] via-[#1A936F] to-[#00ACED]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#133E59] flex items-center justify-center text-white shadow-sm overflow-hidden p-1">
            {logoUrl ? (
              <img src={logoUrl} alt="School Logo" className="w-full h-full object-contain" />
            ) : (
              <GraduationCap className="w-6 h-6 text-[#1A936F]" />
            )}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#133E59] leading-tight tracking-tight">
              {schoolName}
            </h1>
            <p className="text-xs text-[#5CA08E] font-medium hidden sm:block">
              {schoolSubtext}
            </p>
          </div>
        </div>

        {/* Right: Actions / Mode Switcher */}
        <div className="flex items-center space-x-3">
          {activeStudent && (
            <div className="hidden md:flex items-center space-x-2 bg-[#F3F3F3] px-3 py-1.5 rounded-full border border-[#DDDDDD] text-xs font-medium text-[#133E59]">
              <UserCheck className="w-4 h-4 text-[#1A936F]" />
              <span>{activeStudent.nama} ({activeStudent.kelas})</span>
            </div>
          )}

          <div className="bg-[#F3F3F3] p-1 rounded-lg border border-[#DDDDDD] flex items-center space-x-1">
            <button
              onClick={() => onSwitchMode('student')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                currentMode === 'student'
                  ? 'bg-[#1A936F] text-white shadow-sm'
                  : 'text-[#133E59] hover:text-[#1A936F]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Siswa</span>
            </button>

            <button
              onClick={() => onSwitchMode('admin')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                currentMode === 'admin'
                  ? 'bg-[#133E59] text-white shadow-sm'
                  : 'text-[#133E59] hover:text-[#1A936F]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin CBT</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
