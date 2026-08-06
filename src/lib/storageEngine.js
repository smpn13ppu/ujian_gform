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
    const current = await this.getSettings();
    const updated = { ...current, ...newSettings };
    if (isSupabaseConfigured) {
      const records = Object.entries(updated).map(([key, value]) => ({ key, value: String(value) }));
      await supabase.from('system_settings').upsert(records);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },
  // === STUDENTS API ===
  async getStudents() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('students').select('*').order('nama', { ascending: true });
      if (!error && data) return data;
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS);
    return local ? JSON.parse(local) : INITIAL_STUDENTS;
  },

  async getStudentByNisn(nisn) {
    const students = await this.getStudents();
    return students.find((s) => String(s.nisn).trim() === String(nisn).trim()) || null;
  },

  async saveStudent(studentData) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('students').upsert(studentData);
      if (error) console.error('Supabase saveStudent error:', error);
    }
    const students = await this.getStudents();
    const existingIndex = students.findIndex((s) => String(s.nisn) === String(studentData.nisn));
    if (existingIndex >= 0) {
      students[existingIndex] = { ...students[existingIndex], ...studentData };
    } else {
      students.push({ ...studentData, created_at: new Date().toISOString() });
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return studentData;
  },

  async bulkSaveStudents(newStudentsList) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('students').upsert(newStudentsList);
      if (error) console.error('Supabase bulkSaveStudents error:', error);
    }
    const existingStudents = await this.getStudents();
    const studentMap = new Map(existingStudents.map((s) => [String(s.nisn), s]));
    
    newStudentsList.forEach((st) => {
      studentMap.set(String(st.nisn), {
        ...st,
        created_at: st.created_at || new Date().toISOString(),
      });
    });

    const updated = Array.from(studentMap.values());
    localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    return updated;
  },

  async deleteStudent(nisn) {
    if (isSupabaseConfigured) {
      await supabase.from('students').delete().eq('nisn', nisn);
    }
    const students = await this.getStudents();
    const filtered = students.filter((s) => String(s.nisn) !== String(nisn));
    localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
    return filtered;
  },

  // === EXAMS API ===
  async getExams() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.EXAMS);
    return local ? JSON.parse(local) : INITIAL_EXAMS;
  },

  async getActiveExamsForClass(kelas) {
    const exams = await this.getExams();
    return exams.filter(
      (e) => e.is_active && Array.isArray(e.target_kelas) && e.target_kelas.includes(kelas)
    );
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
  }
};
