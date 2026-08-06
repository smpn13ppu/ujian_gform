import { useState, useEffect, useCallback, useRef } from 'react';
import { storageEngine } from '../lib/storageEngine';
import { validateSubmittedToken } from '../lib/tokenEngine';

export function useProctoring({ isActive, isOnline = true, studentInfo, activeExam, secretKey }) {
  const [isViolationActive, setIsViolationActive] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [violationReason, setViolationReason] = useState('');
  const isViolatingRef = useRef(false);
  // Track isOnline via ref so event handlers can check it synchronously
  // without waiting for React re-render (avoids false violations on disconnect)
  const isOnlineRef = useRef(isOnline);

  // Synchronize refs
  useEffect(() => {
    isViolatingRef.current = isViolationActive;
  }, [isViolationActive]);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  const triggerViolation = useCallback(
    async (reason) => {
      if (!isActive || isViolatingRef.current) return;

      isViolatingRef.current = true;
      setIsViolationActive(true);
      setViolationReason(reason);
      setViolationCount((prev) => {
        const nextCount = prev + 1;
        // Log to storage engine asynchronously
        if (studentInfo && activeExam) {
          storageEngine.createOrUpdateLog({
            nisn: studentInfo.nisn,
            studentName: studentInfo.nama,
            kelas: studentInfo.kelas,
            examId: activeExam.id,
            examTitle: activeExam.judul_soal,
            violationIncrement: 1,
            status: 'IN_PROGRESS',
          });
        }
        return nextCount;
      });
    },
    [isActive, studentInfo, activeExam]
  );

  // 1. Fullscreen Change Detection
  useEffect(() => {
    if (!isActive) return;

    const handleFullscreenChange = () => {
      // Skip if offline — network disconnect causes fullscreen exit involuntarily
      if (!document.fullscreenElement && !isViolatingRef.current && isOnlineRef.current) {
        triggerViolation('Terdeteksi Keluar dari Mode Fullscreen!');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isActive, triggerViolation]);

  // 2. Tab Switch, Taskbar OS, Windows Key, Side Panel & Focus Loss Detection
  // KEY INSIGHT: document.hasFocus() returns TRUE when focus is inside an iframe (Google Form) 
  // but returns FALSE the instant the OS Taskbar, another app, or side panel steals focus.
  // This is the only reliable way to detect Taskbar appearance on Windows Fullscreen.
  useEffect(() => {
    if (!isActive) return;

    // Track consecutive focus-lost cycles to avoid single-frame blips
    let focusLostCount = 0;
    const FOCUS_LOST_THRESHOLD = 2; // Must fail 2 consecutive checks (1 second gap) to trigger

    // Visibility Change: tab hidden / minimized
    const handleVisibilityChange = () => {
      // Skip if offline — browser may hide tab during network events
      if (document.hidden && !isViolatingRef.current && isOnlineRef.current) {
        focusLostCount = 0;
        triggerViolation('Terdeteksi Berpindah Tab Browser atau Meminimalkan Window!');
      }
    };

    // Primary Taskbar & Focus Detector — polls document.hasFocus() every 500ms
    // This catches: Windows Taskbar, Windows Key, Alt+Tab, Side Panel, other apps
    const checkFocusState = () => {
      if (isViolatingRef.current) return;
      if (document.hidden) return; // handled by visibilitychange
      // Skip focus check while offline — OS may steal focus during network reconnection
      if (!isOnlineRef.current) {
        focusLostCount = 0;
        return;
      }

      if (!document.hasFocus()) {
        focusLostCount += 1;
        if (focusLostCount >= FOCUS_LOST_THRESHOLD) {
          focusLostCount = 0;
          triggerViolation('Terdeteksi Taskbar OS / Aplikasi Lain Mendapat Fokus! (Bukan Area Ujian)');
        }
      } else {
        // Focus is back — reset counter
        focusLostCount = 0;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Poll every 500ms — catches taskbar, side panel, Windows key
    const focusPollInterval = setInterval(checkFocusState, 500);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(focusPollInterval);
    };
  }, [isActive, triggerViolation]);

  // 3. Mouse Lock, Right Click, Drag-Drop & Keyboard Shortcuts (Anti-Google Lens, QR Code & Translate)
  useEffect(() => {
    if (!isActive) return;

    // Block right-click / context menu, QR Code, Translate, & Google Lens
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isViolatingRef.current) {
        triggerViolation('Terdeteksi Klik Kanan / Menu Konteks (QR Code / Translate / Google Lens)!');
      }
      return false;
    };

    // Detect right click mouse button down
    const handleMouseDown = (e) => {
      if (e.button === 2 || e.which === 3) {
        e.preventDefault();
        e.stopPropagation();
        if (!isViolatingRef.current) {
          triggerViolation('Terdeteksi Klik Kanan / Menu Konteks (QR Code / Translate)!');
        }
        return false;
      }
    };

    // Block Drag & Drop (prevents dragging text/image to QR Code / Translate / Side Search)
    const handleDragDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleCopyCutPaste = (e) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e) => {
      // Key combinations: Ctrl+C, Ctrl+V, Ctrl+T, Ctrl+N, Ctrl+W, Ctrl+Shift+I, F12, Alt+Tab, Windows/Meta Key
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (
        (isCtrl && ['c', 'v', 't', 'n', 'w', 'u', 's', 'p', 'a', 'g', 'q'].includes(key)) ||
        e.key === 'F12' ||
        (e.altKey && e.key === 'Tab') ||
        e.key === 'Meta' ||
        e.key === 'ContextMenu'
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation(`Penggunaan Tombol Kombinasi Terlarang (${e.key})!`);
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('dragstart', handleDragDrop, true);
    document.addEventListener('drop', handleDragDrop, true);
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);
    document.addEventListener('paste', handleCopyCutPaste);
    document.addEventListener('selectstart', handleCopyCutPaste);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('dragstart', handleDragDrop, true);
      document.removeEventListener('drop', handleDragDrop, true);
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
      document.removeEventListener('paste', handleCopyCutPaste);
      document.removeEventListener('selectstart', handleCopyCutPaste);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isActive, triggerViolation]);

  // Unlock handler using supervisor dynamic token (unified single token)
  const unlockProctoring = useCallback(
    async (tokenInput) => {
      let activeSecretKey = secretKey;
      if (!activeSecretKey) {
        try {
          const sett = await storageEngine.getSettings();
          activeSecretKey = sett?.secret_key || 'SMANDA_CBT_SECURE_TOKEN_SECRET_2026';
        } catch (err) {
          activeSecretKey = 'SMANDA_CBT_SECURE_TOKEN_SECRET_2026';
        }
      }

      const isValid = validateSubmittedToken(tokenInput, activeSecretKey);
      if (!isValid) return false;

      // Re-enter Fullscreen
      try {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            await document.documentElement.webkitRequestFullscreen();
          }
        }
      } catch (err) {
        console.warn('Fullscreen re-entry failed:', err);
      }

      isViolatingRef.current = false;
      setIsViolationActive(false);
      setViolationReason('');
      return true;
    },
    [secretKey]
  );

  return {
    isViolationActive,
    violationCount,
    violationReason,
    unlockProctoring,
  };
}
