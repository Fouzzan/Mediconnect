export interface VitalSign {
  date: string; // YYYY-MM-DD
  bloodPressure: string; // e.g., '120/80'
  heartRate: number; // bpm
  bmi: number;
}

export interface SleepLog {
  date: string;
  duration: string; // e.g., '7h 30m'
  quality: 'good' | 'fair' | 'poor';
}

export interface HeartRateLog {
  date: string;
  time: string;
  rate: number; // bpm
}

export interface BloodPressureLog {
  date: string;
  time: string;
  systolic: number;
  diastolic: number;
}

export interface BloodOxygenLog {
  date: string;
  time: string;
  level: number; // percentage
}

export interface HealthDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  url: string;
}

export interface ClinicalNote {
    id: string;
    date: string; // ISO 8601
    type: 'general' | 'soap';
    content: string | {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    };
    clinician: string; // Clinician's name or ID
}


export interface HealthInfo {
  dateOfBirth: string; // YYYY-MM-DD
  bloodType: string; // e.g., 'O+'
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  vitals: VitalSign[];
  sleepLogs?: SleepLog[];
  heartRateLogs?: HeartRateLog[];
  bloodPressureLogs?: BloodPressureLog[];
  bloodOxygenLogs?: BloodOxygenLog[];
  healthDocuments?: HealthDocument[];
  clinicalNotes?: ClinicalNote[];
}

export interface CaregiverInfo {
  userId: string;
  username: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'patient' | 'clinician' | 'admin' | null;
  faceIdEnabled: boolean;
  healthInfo?: HealthInfo;
  caregivers?: CaregiverInfo[]; // People who can access this patient's account
  caringFor?: CaregiverInfo[]; // Patients this user has access to
  status: 'active' | 'suspended';
  lastLogin: string; // ISO 8601 date string
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  avatarUrl: string;
  availability: string[];
}

export interface Appointment {
  id:string;
  userId: string;
  doctorId: string;
  doctor: Doctor;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  patient?: { username: string };
  reason?: string;
  type: 'follow-up' | 'annual-checkup' | 'consultation';
}

export interface AuditLog {
    id: string;
    timestamp: string; // ISO 8601
    actor: { id: string; name: string };
    action: string;
    target?: { id: string; type: string; name: string };
    details?: string;
}

export interface PlatformSettings {
    general: {
        platformName: string;
        supportEmail: string;
    };
    featureFlags: {
        aiHealthAssistant: boolean;
        newPatientRegistrations: boolean;
        clinicianPortal: boolean;
    };
    notifications: {
        newClinicianSignup: boolean;
        highSeverityAlerts: boolean;
    };
}