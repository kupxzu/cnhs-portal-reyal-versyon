// Types for the SHS Portal

export type UserType = 'admin' | 'user' | 'student';
export type UserRole = 'registrar' | 'teacher';

export interface Admin {
  id: number;
  username: string;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  id_number: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  info?: StudentInfo;
  student_tracks?: StudentTrack[];
}

export interface StudentInfo {
  id: number;
  student_id: number;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  extension_name: string | null;
  date_of_birth: string;
  address: string;
  phone_number: string | null;
  gender: 'male' | 'female' | 'other' | null;
  civil_status: string | null;
  nationality: string;
  religion: string | null;
  father_name: string | null;
  father_occupation: string | null;
  father_phone: string | null;
  mother_name: string | null;
  mother_occupation: string | null;
  mother_phone: string | null;
  guardian_name: string | null;
  guardian_relationship: string | null;
  guardian_phone: string | null;
  guardian_address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  lrn: string | null;
  previous_school: string | null;
  previous_school_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  strands?: Strand[];
  track_strands?: TrackStrand[];
}

export interface Strand {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  tracks?: Track[];
  track_strands?: TrackStrand[];
}

export interface Building {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  sections?: Section[];
  building_sections?: BuildingSection[];
}

export interface Section {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  buildings?: Building[];
  building_sections?: BuildingSection[];
}

export interface Room {
  id: number;
  building_id: number | null;
  room_number: string;
  capacity: number;
  created_at: string;
  updated_at: string;
  building?: Building;
}

export interface TrackStrand {
  id: number;
  track_id: number;
  strand_id: number;
  grade_level: '11' | '12';
  created_at: string;
  updated_at: string;
  track?: Track;
  strand?: Strand;
  display_name?: string;
}

export interface BuildingSection {
  id: number;
  building_id: number;
  section_id: number;
  created_at: string;
  updated_at: string;
  building?: Building;
  section?: Section;
  display_name?: string;
}

export interface Tsbsr {
  id: number;
  track_strand_id: number;
  building_section_id: number;
  room_id: number;
  created_at: string;
  updated_at: string;
  track_strand?: TrackStrand;
  building_section?: BuildingSection;
  room?: Room;
  enrollment_count?: number;
  has_capacity?: boolean;
  display_name?: string;
}

export interface StudentTrack {
  id: number;
  student_id: number;
  tsbsr_id: number;
  school_year: string;
  status: 'enrolled' | 'dropped' | 'graduated' | 'transferred';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  student?: Student;
  tsbsr?: Tsbsr;
}

export interface AuthState {
  user: Admin | User | Student | null;
  userType: UserType | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ApiResponse<T> {
  message?: string;
  [key: string]: T | string | undefined;
}
