import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEYS = {
  STUDENTS: 'smanda_cbt_students',
  EXAMS: 'smanda_cbt_exams',
  SETTINGS: 'smanda_cbt_settings',
  LOGS: 'smanda_cbt_logs',
};

// Initial Seed Data — empty by default (no dummy data)
const INITIAL_STUDENTS = [];
const INITIAL_EXAMS = [];
const INITIAL_LOGS = [];

const INITIAL_SETTINGS = {
  school_name: '',
  school_subtext: 'CBT Online Assessment System',
  school_logo_url: '',
  hero_bg_url: '',
  secret_key: 'SMANDA_CBT_SECURE_TOKEN_SECRET_2026',
  enable_minimize_lock: true,
  network_minimize_pin: '1234',
};

// Helper to initialize local storage
function initializeLocalStorage() {
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.EXAMS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.LOGS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
}

// Auto-run initialization
initializeLocalStorage();

export const storageEngine = {
  // === SETTINGS API ===
  async getSettings() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('system_settings').select('*');
      if (!error && data && data.length > 0) {
        const settingsObj = { ...INITIAL_SETTINGS };
        data.forEach((item) => {
          if (item.key === 'enable_minimize_lock') {
            settingsObj[item.key] = item.value === 'true' || item.value === true;
          } else {
            settingsObj[item.key] = item.value;
          }
        });
        return settingsObj;
      }
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    const parsed = local ? JSON.parse(local) : INITIAL_SETTINGS;
    return { ...INITIAL_SETTINGS, ...parsed };
  },

  async saveSettings(newSettings) {
    let updated = { ...INITIAL_SETTINGS, ...newSettings };
    try {
      const current = await this.getSettings();
      updated = { ...INITIAL_SETTINGS, ...current, ...newSettings };
      
      if (isSupabaseConfigured) {
        try {
          const records = Object.entries(updated)
            .filter(([key]) => key && typeof key === 'string')
            .map(([key, value]) => ({ 
              key, 
              value: value === null || value === undefined ? '' : String(value) 
            }));
          const { error } = await supabase.from('system_settings').upsert(records);
          if (error) console.warn('Supabase saveSettings warning:', error);
        } catch (subErr) {
          console.warn('Supabase saveSettings exception:', subErr);
        }
      }
    } catch (err) {
      console.warn('saveSettings fallback error:', err);
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage saveSettings error:', e);
    }

    return updated;
  },
  // === STUDENTS API ===
  async getStudents() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('students').select('*').order('nama', { ascending: true });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getStudents exception:', err);
      }
    }
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS);
      return local ? JSON.parse(local) : INITIAL_STUDENTS;
    } catch (e) {
      return INITIAL_STUDENTS;
    }
  },

  async getStudentByNisn(nisn) {
    const cleanNisn = String(nisn || '').trim();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('nisn', cleanNisn)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getStudentByNisn exception:', e);
      }
    }
    const students = await this.getStudents();
    return students.find((s) => String(s?.nisn || '').trim() === cleanNisn) || null;
  },

  async saveStudent(studentData) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('students').upsert(studentData);
        if (error) console.error('Supabase saveStudent error:', error);
      } catch (e) {
        console.warn('Supabase saveStudent exception:', e);
      }
    }
    const students = await this.getStudents();
    const existingIndex = students.findIndex((s) => String(s?.nisn) === String(studentData.nisn));
    if (existingIndex >= 0) {
      students[existingIndex] = { ...students[existingIndex], ...studentData };
    } else {
      students.push({ ...studentData, created_at: new Date().toISOString() });
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {}
    return studentData;
  },

  async bulkSaveStudents(newStudentsList) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('students').upsert(newStudentsList, { onConflict: 'nisn' });
        if (error) console.error('Supabase bulkSaveStudents error:', error);
      } catch (e) {
        console.warn('Supabase bulkSaveStudents exception:', e);
      }
    }
    const students = await this.getStudents();
    const studentMap = new Map();

    students.forEach((st) => studentMap.set(String(st.nisn), st));
    newStudentsList.forEach((st) => {
      studentMap.set(String(st.nisn), {
        ...st,
        created_at: st.created_at || new Date().toISOString(),
      });
    });

    const updated = Array.from(studentMap.values());
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    } catch (e) {}
    return updated;
  },

  async deleteStudent(nisn) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('students').delete().eq('nisn', nisn);
      } catch (e) {}
    }
    const students = await this.getStudents();
    const filtered = students.filter((s) => String(s?.nisn) !== String(nisn));
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
    } catch (e) {}
    return filtered;
  },

  // === EXAMS API ===
  async getExams() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getExams exception:', err);
      }
    }
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEYS.EXAMS);
      return local ? JSON.parse(local) : INITIAL_EXAMS;
    } catch (e) {
      return INITIAL_EXAMS;
    }
  },

  async getActiveExamsForClass(kelas) {
    try {
      const exams = await this.getExams();
      if (!exams || !Array.isArray(exams)) return [];

      const cleanTargetClass = String(kelas || '').trim().toUpperCase();

      return exams.filter((e) => {
        if (!e || !e.is_active) return false;

        let targetClasses = [];
        if (Array.isArray(e.target_kelas)) {
          targetClasses = e.target_kelas;
        } else if (typeof e.target_kelas === 'string') {
          try {
            targetClasses = JSON.parse(e.target_kelas);
          } catch (err) {
            targetClasses = e.target_kelas.split(',').map((s) => s.trim());
          }
        }

        if (!Array.isArray(targetClasses)) return false;

        return targetClasses.some(
          (c) => String(c || '').trim().toUpperCase() === cleanTargetClass
        );
      });
    } catch (err) {
      console.warn('getActiveExamsForClass exception:', err);
      return [];
    }
  },

  async saveExam(examData) {
    const newExam = {
      ...examData,
      id: examData.id || `ex-${Date.now()}`,
      created_at: examData.created_at || new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('exams').upsert(newExam);
      if (error) console.error('Supabase saveExam error:', error);
    }
    const exams = await this.getExams();
    const idx = exams.findIndex((e) => e.id === newExam.id);
    if (idx >= 0) {
      exams[idx] = newExam;
    } else {
      exams.unshift(newExam);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    return newExam;
  },

  async deleteExam(id) {
    if (isSupabaseConfigured) {
      await supabase.from('exams').delete().eq('id', id);
    }
    const exams = await this.getExams();
    const filtered = exams.filter((e) => e.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXAMS, JSON.stringify(filtered));
    return filtered;
  },

  // === PROCTOR LOGS API ===
  async getLogs() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('exam_logs').select('*').order('updated_at', { ascending: false });
      if (!error && data) return data;
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.LOGS);
    return local ? JSON.parse(local) : INITIAL_LOGS;
  },

  async createOrUpdateLog({ nisn, studentName, kelas, examId, examTitle, violationIncrement = 0, status }) {
    const logs = await this.getLogs();
    let existingLog = logs.find((l) => String(l.nisn) === String(nisn) && l.exam_id === examId);

    const now = new Date().toISOString();
    if (!existingLog) {
      existingLog = {
        id: `log-${Date.now()}`,
        nisn: String(nisn),
        nama_siswa: studentName,
        kelas: kelas,
        exam_id: examId,
        judul_soal: examTitle,
        violation_count: violationIncrement,
        status: status || 'IN_PROGRESS',
        last_violation_at: violationIncrement > 0 ? now : null,
        updated_at: now,
      };
      logs.unshift(existingLog);
    } else {
      existingLog.violation_count = (existingLog.violation_count || 0) + violationIncrement;
      if (status) existingLog.status = status;
      if (violationIncrement > 0) existingLog.last_violation_at = now;
      existingLog.updated_at = now;
    }

    if (isSupabaseConfigured) {
      await supabase.from('exam_logs').upsert(existingLog);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.LOGS, JSON.stringify(logs));
    return existingLog;
  },

  async resetStudentSession(nisn, examId) {
    const logs = await this.getLogs();
    const idx = logs.findIndex((l) => String(l.nisn) === String(nisn) && (!examId || l.exam_id === examId));
    if (idx >= 0) {
      logs[idx].violation_count = 0;
      logs[idx].status = 'IN_PROGRESS';
      logs[idx].last_violation_at = null;
      logs[idx].updated_at = new Date().toISOString();
      if (isSupabaseConfigured) {
        await supabase.from('exam_logs').upsert(logs[idx]);
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.LOGS, JSON.stringify(logs));
    }
    return logs;
  },

  async clearAllLogs() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('exam_logs').delete().neq('id', '');
      if (error) console.error('Supabase clearAllLogs error:', error);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.LOGS, JSON.stringify([]));
    return [];
  },

  // === ADMIN AUTHENTICATION API ===
  async verifyAdminCredentials(username, password) {
    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '').trim();

    // Default requested credentials: username: guru, password: guru
    if (cleanUser.toLowerCase() === 'guru' && cleanPass === 'guru') {
      return {
        success: true,
        user: { username: 'guru', name: 'Admin Guru CBT', role: 'ADMIN' },
      };
    }

    // Check Supabase admin_users table if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('username', cleanUser)
          .single();

        if (!error && data && data.password === cleanPass) {
          return {
            success: true,
            user: { username: data.username, name: data.nama_admin || data.username, role: 'ADMIN' },
          };
        }
      } catch (err) {
        console.warn('Supabase admin_users check fallback:', err);
      }
    }

    return {
      success: false,
      message: 'Username atau Password Admin salah! (Default: guru / guru)',
    };
  }
};
