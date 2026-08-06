import React, { useState, useEffect } from 'react';
import { useRive, useStateMachineInput, Alignment, Fit } from '@rive-app/react-canvas';
import { storageEngine } from '../lib/storageEngine';
import { UserCheck, AlertCircle, ArrowRight, Shield, BookOpen, Monitor, Award, Lock, ClipboardList, Clock, BarChart2, X, User } from 'lucide-react';

import { ToastNotification } from '../components/ToastNotification';

const STATE_MACHINE_NAME = 'Login Machine';

function RiveLoginCharacter({ nisnLength, isFocused, isError, isSuccess }) {
  const { rive, RiveComponent } = useRive({
    src: '/animated-login-character.riv',
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    alignment: Alignment.Center,
    fit: Fit.Contain,
  });

  const isCheckingInput = useStateMachineInput(rive, STATE_MACHINE_NAME, 'isChecking');
  const numLookInput = useStateMachineInput(rive, STATE_MACHINE_NAME, 'numLook');
  const isHandsUpInput = useStateMachineInput(rive, STATE_MACHINE_NAME, 'isHandsUp');
  const trigSuccessInput = useStateMachineInput(rive, STATE_MACHINE_NAME, 'trigSuccess');
  const trigFailInput = useStateMachineInput(rive, STATE_MACHINE_NAME, 'trigFail');

  useEffect(() => {
    if (isCheckingInput) {
      isCheckingInput.value = isFocused;
    }
  }, [isFocused, isCheckingInput]);

  useEffect(() => {
    if (numLookInput) {
      numLookInput.value = Math.min(nisnLength * 9, 100);
    }
  }, [nisnLength, numLookInput]);

  useEffect(() => {
    if (isHandsUpInput) {
      isHandsUpInput.value = false;
    }
  }, [isHandsUpInput]);

  useEffect(() => {
    if (isError && trigFailInput) {
      trigFailInput.fire();
    }
  }, [isError, trigFailInput]);

  useEffect(() => {
    if (isSuccess && trigSuccessInput) {
      trigSuccessInput.fire();
    }
  }, [isSuccess, trigSuccessInput]);

  if (!RiveComponent) {
    return (
      <div className="w-full h-44 sm:h-48 flex items-center justify-center overflow-hidden bg-[#D6E2E9] rounded-t-[20px]">
        <BookOpen className="w-16 h-16 text-[#133E59]" />
      </div>
    );
  }

  return (
    <div className="w-full h-44 sm:h-48 flex items-center justify-center overflow-hidden bg-[#D6E2E9] rounded-t-[20px]">
      <RiveComponent className="w-full h-full object-contain bg-[#D6E2E9]" />
    </div>
  );
}

export function StudentLogin({ onLoginSuccess, settings, onOpenAdmin }) {
  const [nisn, setNisn] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);

  const schoolName = settings?.school_name || 'CBT Online';
  const schoolSubtext = settings?.school_subtext || 'Sistem Ujian Online';
  const logoUrl = settings?.school_logo_url || '';

  const heroBgUrl = settings?.hero_bg_url || '/hero-login.png';

  // Auto-dismiss floating error notification after 4 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanNisn = nisn.trim();

    if (!cleanNisn) {
      setErrorMsg('Silakan masukkan NISN Anda terlebih dahulu.');
      return;
    }

    if (!/^\d+$/.test(cleanNisn)) {
      setErrorMsg('NISN hanya boleh berisi karakter angka.');
      return;
    }

    setLoading(true);
    try {
      const student = await storageEngine.getStudentByNisn(cleanNisn);
      if (student) {
        setIsSuccessState(true);
        setTimeout(() => {
          onLoginSuccess(student);
        }, 800);
      } else {
        setErrorMsg(`NISN (${cleanNisn}) tidak terdaftar dalam database sistem ujian. Silakan hubungi pengawas.`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan saat memverifikasi data. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F3F6F8] relative">

      {/* ── FLOATING TOAST NOTIFICATION TOP RIGHT ── */}
      <ToastNotification message={errorMsg} type="error" onClose={() => setErrorMsg('')} />

      {/* ── LEFT HERO PANEL ── */}
      <div
        className="relative lg:w-[55%] min-h-[300px] lg:min-h-full flex flex-col justify-end overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d2e42 0%, #133E59 40%, #1A936F 100%)',
        }}
      >
        {/* Hero Background Image */}
        <img
          src={heroBgUrl}
          alt="Sekolah"
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
          onError={(e) => { e.target.src = '/hero-login.png'; }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(13,46,66,0.97) 0%, rgba(13,46,66,0.55) 45%, rgba(13,46,66,0.15) 100%)',
          }}
        />

        {/* Green accent stripe top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A936F]" />

        {/* Floating stat badges */}
        <div className="absolute top-8 right-8 hidden lg:flex flex-col gap-3">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[10px] px-4 py-2.5 flex items-center gap-3">
            <Monitor className="w-5 h-5 text-[#1A936F]" />
            <div>
              <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">Mode</p>
              <p className="text-white font-bold text-sm">Fullscreen Secure</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[10px] px-4 py-2.5 flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#1A936F]" />
            <div>
              <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">Sistem</p>
              <p className="text-white font-bold text-sm">Anti-Kecurangan</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[10px] px-4 py-2.5 flex items-center gap-3">
            <Award className="w-5 h-5 text-[#1A936F]" />
            <div>
              <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">Platform</p>
              <p className="text-white font-bold text-sm">Google Form CBT</p>
            </div>
          </div>
        </div>

        {/* Hero Text Content */}
        <div className="relative z-10 p-8 lg:p-12 pb-10 lg:pb-14">
          {/* Logo + School Name */}
          <div className="flex items-center gap-3 mb-8">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-[10px] bg-[#1A936F] flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <p className="text-[#1A936F] font-bold text-sm tracking-wide uppercase">{schoolName}</p>
              <p className="text-white/60 text-xs">{schoolSubtext}</p>
            </div>
          </div>

          <h1
            className="text-white font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(26px, 4vw, 40px)' }}
          >
            Portal Ujian<br />
            <span className="text-[#1A936F]">Online</span> CBT
          </h1>

          <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-8">
            Sistem Ujian Berbasis Komputer yang aman, real-time, dan terintegrasi dengan Google Form. Kerjakan ujian dengan jujur dan penuh percaya diri.
          </p>

          {/* Feature chips & Admin Person Icon Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Person Icon Admin Switcher Button before Sesi Aman */}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-[#1A936F] border border-white/20 hover:border-[#1A936F] w-8 h-8 rounded-full transition-all shadow-sm cursor-pointer"
                title="Masuk Panel Admin CBT"
              >
                <User className="w-4 h-4" />
              </button>
            )}

            {[
              { icon: Lock, label: 'Sesi Aman' },
              { icon: ClipboardList, label: 'Google Form' },
              { icon: Clock, label: 'Realtime' },
              { icon: BarChart2, label: 'Anti-Curang' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-xs font-medium text-white/80 bg-white/10 border border-white/15 px-3 py-1 rounded-full"
              >
                <Icon className="w-3 h-3" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL WITH MATCHING RIVE CONTAINER BORDER (#B8C9D3) ── */}
      <div className="lg:w-[45%] flex items-center justify-center p-6 sm:p-8 lg:p-12">
        
        {/* Dedicated Login Card Container with Gray Outline matching Rive background */}
        <div className="w-full max-w-md bg-[#D6E2E9] border-2 border-[#B8C9D3] hover:border-[#9AB1BF] rounded-[24px] shadow-2xl shadow-[#133E59]/10 relative overflow-hidden transition-all duration-300">
          
          {/* Top Gray Accent Line matching container outline */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#B8C9D3] z-10" />

          {/* Rive Character Header */}
          <RiveLoginCharacter
            nisnLength={nisn.length}
            isFocused={isInputFocused}
            isError={Boolean(errorMsg)}
            isSuccess={isSuccessState}
          />

          {/* Form & Input Section Box (Clean Contrast inside Container) */}
          <div className="p-6 sm:p-7 bg-white/95 backdrop-blur-md rounded-b-[22px] border-t border-[#B8C9D3]/60">

            {/* Form Header */}
            <div className="mb-5 text-center">
              <div
                className="inline-flex items-center gap-2 text-[11px] font-bold text-[#1A936F] uppercase tracking-widest bg-[#1A936F]/10 border border-[#1A936F]/25 px-3.5 py-1 rounded-full mb-2.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Portal Siswa</span>
              </div>
              <h2 className="text-[22px] font-bold text-[#133E59] leading-tight mb-1">
                Masuk ke Ujian
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Masukkan NISN Anda untuk verifikasi identitas sesi ujian.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* NISN Input */}
              <div>
                <label htmlFor="nisn" className="block text-xs font-semibold text-[#133E59] mb-1.5">
                  Nomor Induk Siswa Nasional (NISN)
                </label>
                <div className="relative">
                  <input
                    id="nisn"
                    type="text"
                    inputMode="numeric"
                    value={nisn}
                    onChange={(e) => {
                      setNisn(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="Masukkan 10 digit NISN"
                    className="cbt-input text-base font-mono pr-10 placeholder:font-sans placeholder:text-xs rounded-lg border border-[#DDDDDD] focus:border-[#1A936F] focus:ring-2 focus:ring-[#1A936F]/20 transition-all bg-white"
                    autoFocus
                  />
                  <UserCheck className="w-5 h-5 text-[#5CA08E] absolute right-3 top-3.5" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-base py-3 rounded-[10px] font-bold shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Memeriksa Data...
                  </span>
                ) : (
                  <>
                    <span>Masuk Ujian</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Info */}
            <div className="mt-5 pt-4 border-t border-[#DDDDDD]">
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Hubungi pengawas jika NISN Anda tidak terdaftar atau mengalami masalah teknis selama ujian berlangsung.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
