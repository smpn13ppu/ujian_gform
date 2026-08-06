import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { StudentLogin } from './pages/StudentLogin';
import { StudentDashboard } from './pages/StudentDashboard';
import { FullscreenModal } from './components/FullscreenModal';
import { ExamRoom } from './pages/ExamRoom';
import { AdminDashboard } from './pages/AdminDashboard';
import { SupervisorPortal } from './pages/SupervisorPortal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { storageEngine } from './lib/storageEngine';

export function App() {
  // Support standalone direct access URLs for Supervisor Token Portal (e.g. /token, ?token, ?mode=supervisor, #token)
  const urlParams = new URLSearchParams(window.location.search);
  const pathName = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const pathQuery = (urlParams.get('path') || '').toLowerCase();

  const isTokenModeDirect =
    urlParams.get('mode') === 'supervisor' ||
    urlParams.get('mode') === 'token' ||
    urlParams.has('token') ||
    pathName.endsWith('/token') ||
    pathName.includes('/token') ||
    pathQuery.includes('token') ||
    hash.includes('token');

  const initialMode = isTokenModeDirect ? 'supervisor' : (urlParams.get('mode') || 'student');

  const [appMode, setAppMode] = useState(initialMode); // 'student' | 'supervisor' | 'admin'
  const [studentStep, setStudentStep] = useState('login'); // 'login' | 'dashboard' | 'fullscreen_prompt' | 'exam'

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);

  const [activeStudent, setActiveStudent] = useState(null);
  const [activeExam, setActiveExam] = useState(null);
  
  const [settings, setSettings] = useState({
    school_name: '',
    school_subtext: 'CBT Online Assessment System',
    school_logo_url: '',
    hero_bg_url: '',
    secret_key: 'SMANDA_CBT_SECURE_TOKEN_SECRET_2026',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const sett = await storageEngine.getSettings();
        if (sett) setSettings(sett);
      } catch (err) {
        console.error(err);
      }
    }
    loadSettings();
  }, []);

  // Synchronize Tab Title and Tab Favicon with School Settings
  useEffect(() => {
    document.title = 'CBT Online Assessment System';

    if (settings.school_logo_url) {
      const faviconLink = document.getElementById('favicon');
      if (faviconLink) {
        faviconLink.href = settings.school_logo_url;
      }
    }
  }, [settings.school_logo_url]);

  // Student Flow Handlers
  const handleLoginSuccess = (studentData) => {
    setActiveStudent(studentData);
    setStudentStep('dashboard');
  };

  const handleStartExamRequest = ({ student, exam }) => {
    setActiveStudent(student);
    setActiveExam(exam);
    setStudentStep('fullscreen_prompt');
  };

  const handleConfirmFullscreen = () => {
    setStudentStep('exam');
  };

  const handleCancelFullscreen = () => {
    setStudentStep('dashboard');
  };

  const handleFinishExam = () => {
    setActiveStudent(null);
    setActiveExam(null);
    setStudentStep('login');
  };

  const handleLogoutStudent = () => {
    setActiveStudent(null);
    setActiveExam(null);
    setStudentStep('login');
  };

  // Admin Authentication Handlers
  const handleRequestOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setAppMode('admin');
    } else {
      setShowAdminAuthModal(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowAdminAuthModal(false);
    setAppMode('admin');
  };

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setAppMode('student');
  };

  // If in active exam room, hide normal top navbar for maximum screen space & security
  if (appMode === 'student' && studentStep === 'exam' && activeStudent && activeExam) {
    return (
      <ExamRoom
        student={activeStudent}
        exam={activeExam}
        settings={settings}
        onFinishExam={handleFinishExam}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex flex-col font-sans">
      <main className="flex-1">
        {appMode === 'admin' ? (
          <AdminDashboard
            onSwitchToStudent={() => setAppMode('student')}
            onSettingsUpdated={(newSett) => setSettings(newSett)}
            onOpenSupervisorPortal={() => setAppMode('supervisor')}
            onLogoutAdmin={handleLogoutAdmin}
          />
        ) : appMode === 'supervisor' ? (
          <SupervisorPortal settings={settings} onBackToAdmin={handleRequestOpenAdmin} />
        ) : (
          <>
            {studentStep === 'login' && (
              <StudentLogin
                onLoginSuccess={handleLoginSuccess}
                settings={settings}
                onOpenAdmin={handleRequestOpenAdmin}
                onOpenTokenPortal={() => setAppMode('supervisor')}
              />
            )}

            {studentStep === 'dashboard' && activeStudent && (
              <StudentDashboard
                student={activeStudent}
                onStartExam={handleStartExamRequest}
                onLogout={handleLogoutStudent}
              />
            )}

            {studentStep === 'fullscreen_prompt' && activeExam && (
              <div className="p-8">
                <FullscreenModal
                  exam={activeExam}
                  onConfirm={handleConfirmFullscreen}
                  onCancel={handleCancelFullscreen}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Admin Login Popup Authentication Modal */}
      <AdminAuthModal
        isOpen={showAdminAuthModal}
        onClose={() => setShowAdminAuthModal(false)}
        onAuthSuccess={handleAdminAuthSuccess}
      />
    </div>
  );
}

export default App;
