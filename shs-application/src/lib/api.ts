import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  // Admin
  adminLogin: (data: { username: string; password: string }) =>
    api.post('/admin/login', data),
  adminLogout: () => api.post('/admin/logout'),
  adminProfile: () => api.get('/admin/profile'),

  // User (Registrar/Teacher)
  userLogin: (data: { email: string; password: string }) =>
    api.post('/user/login', data),
  userRegister: (data: { name: string; email: string; password: string; password_confirmation: string; role: string }) =>
    api.post('/user/register', data),
  userLogout: () => api.post('/user/logout'),
  userProfile: () => api.get('/user/profile'),

  // Student
  studentLogin: (data: { username: string; password: string }) =>
    api.post('/student/login', data),
  studentRegister: (data: { id_number: string; email: string; username: string; password: string; password_confirmation: string }) =>
    api.post('/student/register', data),
  studentLogout: () => api.post('/student/logout'),
  studentProfile: () => api.get('/student/profile'),
};

// Admin API (CRUD operations)
export const adminApi = {
  // Tracks
  getTracks: (params?: { page?: number; per_page?: number; paginate?: boolean }) =>
    api.get('/admin/tracks', { params }),
  getTrack: (id: number) => api.get(`/admin/tracks/${id}`),
  createTrack: (data: { name: string }) => api.post('/admin/tracks', data),
  updateTrack: (id: number, data: { name: string }) => api.put(`/admin/tracks/${id}`, data),
  deleteTrack: (id: number) => api.delete(`/admin/tracks/${id}`),

  // Strands
  getStrands: (params?: { page?: number; per_page?: number; paginate?: boolean }) =>
    api.get('/admin/strands', { params }),
  getStrand: (id: number) => api.get(`/admin/strands/${id}`),
  createStrand: (data: { name: string }) => api.post('/admin/strands', data),
  updateStrand: (id: number, data: { name: string }) => api.put(`/admin/strands/${id}`, data),
  deleteStrand: (id: number) => api.delete(`/admin/strands/${id}`),

  // Buildings
  getBuildings: (params?: { page?: number; per_page?: number; paginate?: boolean }) =>
    api.get('/admin/buildings', { params }),
  getBuilding: (id: number) => api.get(`/admin/buildings/${id}`),
  createBuilding: (data: { name: string }) => api.post('/admin/buildings', data),
  updateBuilding: (id: number, data: { name: string }) => api.put(`/admin/buildings/${id}`, data),
  deleteBuilding: (id: number) => api.delete(`/admin/buildings/${id}`),

  // Sections
  getSections: (params?: { page?: number; per_page?: number; paginate?: boolean }) =>
    api.get('/admin/sections', { params }),
  getSection: (id: number) => api.get(`/admin/sections/${id}`),
  createSection: (data: { name: string }) => api.post('/admin/sections', data),
  updateSection: (id: number, data: { name: string }) => api.put(`/admin/sections/${id}`, data),
  deleteSection: (id: number) => api.delete(`/admin/sections/${id}`),

  // Rooms
  getRooms: (params?: { page?: number; per_page?: number; paginate?: boolean }) =>
    api.get('/admin/rooms', { params }),
  getRoom: (id: number) => api.get(`/admin/rooms/${id}`),
  createRoom: (data: { building_id?: number; room_number: string; capacity?: number }) => api.post('/admin/rooms', data),
  updateRoom: (id: number, data: { building_id?: number; room_number: string; capacity?: number }) => api.put(`/admin/rooms/${id}`, data),
  deleteRoom: (id: number) => api.delete(`/admin/rooms/${id}`),

  // Track-Strands
  getTrackStrands: (params?: { grade_level?: string; track_id?: number; strand_id?: number; page?: number; per_page?: number; paginate?: boolean }) => 
    api.get('/admin/track-strands', { params }),
  getTrackStrand: (id: number) => api.get(`/admin/track-strands/${id}`),
  createTrackStrand: (data: { track_id: number; strand_id: number; grade_level: string }) => 
    api.post('/admin/track-strands', data),
  updateTrackStrand: (id: number, data: { track_id: number; strand_id: number; grade_level: string }) => 
    api.put(`/admin/track-strands/${id}`, data),
  deleteTrackStrand: (id: number) => api.delete(`/admin/track-strands/${id}`),

  // Building-Sections
  getBuildingSections: (params?: { building_id?: number; page?: number; per_page?: number; paginate?: boolean }) => 
    api.get('/admin/building-sections', { params }),
  getBuildingSection: (id: number) => api.get(`/admin/building-sections/${id}`),
  createBuildingSection: (data: { building_id: number; section_id: number }) => 
    api.post('/admin/building-sections', data),
  updateBuildingSection: (id: number, data: { building_id: number; section_id: number }) => 
    api.put(`/admin/building-sections/${id}`, data),
  deleteBuildingSection: (id: number) => api.delete(`/admin/building-sections/${id}`),

  // TSBSRs
  getTsbsrs: (params?: { track_strand_id?: number; grade_level?: string; page?: number; per_page?: number; paginate?: boolean }) => 
    api.get('/admin/tsbsrs', { params }),
  getTsbsr: (id: number) => api.get(`/admin/tsbsrs/${id}`),
  createTsbsr: (data: { track_strand_id: number; building_section_id: number; room_id: number }) => 
    api.post('/admin/tsbsrs', data),
  updateTsbsr: (id: number, data: { track_strand_id: number; building_section_id: number; room_id: number }) => 
    api.put(`/admin/tsbsrs/${id}`, data),
  deleteTsbsr: (id: number) => api.delete(`/admin/tsbsrs/${id}`),

  // Students
  getStudents: (params?: { search?: string; status?: string; school_year?: string; page?: number }) => 
    api.get('/admin/students', { params }),
  getStudent: (id: number) => api.get(`/admin/students/${id}`),
  createStudent: (data: { id_number: string; email: string; username: string; password: string }) => 
    api.post('/admin/students', data),
  updateStudent: (id: number, data: Partial<{ id_number: string; email: string; username: string; password: string }>) => 
    api.put(`/admin/students/${id}`, data),
  deleteStudent: (id: number) => api.delete(`/admin/students/${id}`),
  restoreStudent: (id: number) => api.post(`/admin/students/${id}/restore`),

  // Student Info
  getStudentInfo: (studentId: number) => api.get(`/admin/students/${studentId}/info`),
  createStudentInfo: (studentId: number, data: Record<string, unknown>) => 
    api.post(`/admin/students/${studentId}/info`, data),
  updateStudentInfo: (studentId: number, data: Record<string, unknown>) => 
    api.put(`/admin/students/${studentId}/info`, data),

  // Student Tracks (Enrollment)
  getStudentTracks: (params?: { student_id?: number; school_year?: string; status?: string; page?: number; per_page?: number }) => 
    api.get('/admin/student-tracks', { params }),
  getStudentTrack: (id: number) => api.get(`/admin/student-tracks/${id}`),
  createStudentTrack: (data: { student_id: number; tsbsr_id: number; school_year: string; status?: string }) => 
    api.post('/admin/student-tracks', data),
  updateStudentTrack: (id: number, data: Partial<{ tsbsr_id: number; school_year: string; status: string }>) => 
    api.put(`/admin/student-tracks/${id}`, data),
  deleteStudentTrack: (id: number) => api.delete(`/admin/student-tracks/${id}`),
  getStudentEnrollmentHistory: (studentId: number) => 
    api.get(`/admin/students/${studentId}/enrollment-history`),
};

// Public API
export const publicApi = {
  getTracks: () => api.get('/public/tracks'),
  getStrands: () => api.get('/public/strands'),
  getTrackStrands: () => api.get('/public/track-strands'),
};

// Student API
export const studentApi = {
  getMyInfo: () => api.get('/student/my-info'),
  updateMyInfo: (data: Record<string, string | undefined>) => 
    api.put('/student/my-info', data),
  getMyEnrollments: () => api.get('/student/my-enrollments'),
  getAvailableTrackStrands: () => api.get('/student/available-track-strands'),
  getAvailableTsbsrs: () => api.get('/student/available-tsbsrs'),
  enroll: (data: { tsbsr_id: number; school_year: string }) => 
    api.post('/student/enroll', data),
};

// Registrar API
export const registrarApi = {
  getTracks: () => api.get('/registrar/tracks'),
  getStrands: () => api.get('/registrar/strands'),
  getBuildings: () => api.get('/registrar/buildings'),
  getSections: () => api.get('/registrar/sections'),
  getRooms: () => api.get('/registrar/rooms'),
  getTrackStrands: () => api.get('/registrar/track-strands'),
  getBuildingSections: () => api.get('/registrar/building-sections'),
  getTsbsrs: () => api.get('/registrar/tsbsrs'),
  
  // Students
  getStudents: (params?: { search?: string; status?: string; school_year?: string; page?: number }) => 
    api.get('/registrar/students', { params }),
  getStudent: (id: number) => api.get(`/registrar/students/${id}`),
  createStudent: (data: { id_number: string; email: string; username: string; password: string }) => 
    api.post('/registrar/students', data),
  updateStudent: (id: number, data: Partial<{ id_number: string; email: string; username: string; password: string }>) => 
    api.put(`/registrar/students/${id}`, data),
  deleteStudent: (id: number) => api.delete(`/registrar/students/${id}`),

  // Student Info
  getStudentInfo: (studentId: number) => api.get(`/registrar/students/${studentId}/info`),
  createStudentInfo: (studentId: number, data: Record<string, unknown>) => 
    api.post(`/registrar/students/${studentId}/info`, data),
  updateStudentInfo: (studentId: number, data: Record<string, unknown>) => 
    api.put(`/registrar/students/${studentId}/info`, data),

  // Student Tracks
  getStudentTracks: (params?: { student_id?: number; school_year?: string; status?: string }) => 
    api.get('/registrar/student-tracks', { params }),
  createStudentTrack: (data: { student_id: number; tsbsr_id: number; school_year: string; status?: string }) => 
    api.post('/registrar/student-tracks', data),
  updateStudentTrack: (id: number, data: Partial<{ tsbsr_id: number; school_year: string; status: string }>) => 
    api.put(`/registrar/student-tracks/${id}`, data),
  deleteStudentTrack: (id: number) => api.delete(`/registrar/student-tracks/${id}`),
};

// Teacher API
export const teacherApi = {
  getTracks: () => api.get('/teacher/tracks'),
  getStrands: () => api.get('/teacher/strands'),
  getTrackStrands: () => api.get('/teacher/track-strands'),
  getTsbsrs: () => api.get('/teacher/tsbsrs'),
  getStudents: (params?: { search?: string; status?: string; school_year?: string }) => 
    api.get('/teacher/students', { params }),
  getStudent: (id: number) => api.get(`/teacher/students/${id}`),
  getStudentInfo: (studentId: number) => api.get(`/teacher/students/${studentId}/info`),
  getStudentTracks: (params?: { student_id?: number; school_year?: string }) => 
    api.get('/teacher/student-tracks', { params }),
};
