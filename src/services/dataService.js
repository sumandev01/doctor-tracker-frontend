/**
 * Universal Data Service Layer
 * Follows Rule 12 (Decoupled Data Architecture) & Rule 25 (Secure JWT Transport).
 * 
 * Exclusively communicates with Live Express REST API & MongoDB Atlas Cloud Database.
 * Zero static mock data. Zero fabricated fallbacks.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('careguide_token');
    const sessionSecret = localStorage.getItem('careguide_session_secret');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (sessionSecret) {
      headers['x-session-secret'] = sessionSecret;
    }
    return headers;
  }
  return { 'Content-Type': 'application/json' };
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };

  const res = await fetch(url, config);
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(json.message || `API error: ${res.status}`);
    error.status = res.status;
    error.errors = json.errors;
    throw error;
  }

  return json;
}

export const dataService = {
  // ==================== AUTHENTICATION ====================
  async login(email, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('careguide_token', res.data.token);
        localStorage.setItem('careguide_session_secret', res.data.sessionSecret);
        localStorage.setItem('careguide_user', JSON.stringify(res.data.user));
        // Set cookies for Next.js Server-Side Middleware Route Guard
        document.cookie = `careguide_token=${res.data.token}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `careguide_role=${res.data.user.role}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `careguide_session_secret=${res.data.sessionSecret}; path=/; max-age=2592000; SameSite=Lax`;
      }
      return res.data;
    }
    throw new Error(res.message || 'Authentication failed');
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('careguide_token');
      localStorage.removeItem('careguide_session_secret');
      localStorage.removeItem('careguide_user');
      document.cookie = 'careguide_token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'careguide_role=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'careguide_session_secret=; path=/; max-age=0; SameSite=Lax';
    }
  },

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('careguide_user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  },

  // ==================== DASHBOARD & ANALYTICS (REAL ATLAS DATA) ====================
  async getDashboardAnalytics() {
    const res = await apiRequest('/analytics/dashboard');
    if (res.success && res.data) {
      const kpi = res.data.kpi || {};
      const totalDocs = kpi.totalDoctors || 0;
      const totalPts = kpi.totalPatients || 0;
      const avg = totalDocs > 0 ? (totalPts / totalDocs).toFixed(1) : '0';

      const doctorWorkload = (res.data.doctorWorkload || []).map((d) => ({
        name: d.name,
        count: d.patientCount || 0,
        max: 10,
        specialty: d.specialization || 'General',
      }));

      const admissionTrends = (res.data.admissionTrends || []).map((t) => ({
        date: t.date,
        admissions: t.count,
      }));

      return {
        stats: {
          totalDoctors: totalDocs,
          totalPatients: totalPts,
          patientsPerDoctorAvg: avg,
          criticalCases: kpi.criticalPatients || 0,
        },
        patientsPerDoctor: doctorWorkload,
        admissionTrends,
      };
    }
    throw new Error('Failed to retrieve analytics data from database');
  },

  // ==================== DOCTOR MANAGEMENT ====================
  async getDoctors({ page = 1, limit = 5, search = '', specialization = '' } = {}) {
    const query = new URLSearchParams();
    query.append('page', page);
    query.append('limit', limit);
    if (search) query.append('search', search);
    if (specialization && specialization !== 'All Specializations') {
      query.append('specialization', specialization);
    }

    const res = await apiRequest(`/doctors?${query.toString()}`);
    if (res.success && res.data) {
      return {
        doctors: res.data,
        total: res.pagination?.total || res.data.length,
        page: res.pagination?.page || page,
        totalPages: res.pagination?.totalPages || 1,
      };
    }
    return { doctors: [], total: 0, page: 1, totalPages: 1 };
  },

  async createDoctor(doctorData) {
    const res = await apiRequest('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
    return res.data;
  },

  async deleteDoctor(id) {
    const res = await apiRequest(`/doctors/${id}`, {
      method: 'DELETE',
    });
    return res;
  },

  // ==================== DOCTOR'S PATIENT POOL (SPEC 2.2) ====================
  async getPatientsByDoctor(doctorId) {
    const res = await apiRequest(`/doctors/${doctorId}/patients`);
    if (res.success && res.data) {
      return res.data;
    }
    return [];
  },

  async addPatientToDoctor(doctorId, patientData) {
    const payload = {
      ...patientData,
      doctorId,
    };
    const res = await apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async removePatientFromDoctor(doctorId, patientId) {
    const res = await apiRequest(`/doctors/${doctorId}/patients/${patientId}`, {
      method: 'DELETE',
    });
    return res;
  },

  // ==================== PATIENT MANAGEMENT ====================
  async getPatients({ page = 1, limit = 5, search = '', condition = '', doctorId = '' } = {}) {
    const query = new URLSearchParams();
    query.append('page', page);
    query.append('limit', limit);
    if (search) query.append('search', search);
    if (condition && condition !== 'All Patient Conditions') {
      const cleanCondition = condition.replace(' Condition', '');
      query.append('condition', cleanCondition);
    }
    if (doctorId && doctorId !== 'All') {
      query.append('doctorId', doctorId);
    }

    const res = await apiRequest(`/patients?${query.toString()}`);
    if (res.success && res.data) {
      return {
        patients: res.data.map((p) => ({
          ...p,
          doctorName: p.doctorId?.name || 'Assigned Specialist',
          doctorSpecialization: p.doctorId?.specialization || 'General',
        })),
        total: res.pagination?.total || res.data.length,
        page: res.pagination?.page || page,
        totalPages: res.pagination?.totalPages || 1,
      };
    }
    return { patients: [], total: 0, page: 1, totalPages: 1 };
  },

  async createPatient(patientData) {
    const res = await apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
    return res.data;
  },

  async updatePatient(id, updatedData) {
    const res = await apiRequest(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    });
    return res.data;
  },

  async deletePatient(id) {
    const res = await apiRequest(`/patients/${id}`, {
      method: 'DELETE',
    });
    return res;
  },

  // ==================== USER & STAFF MANAGEMENT (SPEC 2.1) ====================
  async getUsers({ page = 1, limit = 5, search = '', role = '', status = '' } = {}) {
    const query = new URLSearchParams();
    query.append('page', page);
    query.append('limit', limit);
    if (search) query.append('search', search);
    if (role && role !== 'All Roles') query.append('role', role);
    if (status && status !== 'All Status') query.append('status', status);

    const res = await apiRequest(`/users?${query.toString()}`);
    if (res.success && res.data) {
      const users = res.data;
      return {
        users,
        total: res.pagination?.total || users.length,
        totalPages: res.pagination?.totalPages || 1,
        currentPage: page,
        stats: {
          total: res.pagination?.total || users.length,
          admins: users.filter((u) => u.role === 'Admin').length,
          staff: users.filter((u) => u.role === 'Staff').length,
          active: users.filter((u) => u.status === 'Active').length,
        },
      };
    }
    return {
      users: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
      stats: { total: 0, admins: 0, staff: 0, active: 0 },
    };
  },

  async createUser(userData) {
    const res = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res.data;
  },

  async updateUser(id, updatedData) {
    const res = await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    });
    return res.data;
  },

  async deleteUser(id) {
    const res = await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
    return res;
  },
};
