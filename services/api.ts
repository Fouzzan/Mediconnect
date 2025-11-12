import { User, Doctor, Appointment, HealthInfo, AuditLog, PlatformSettings } from '../types';

const generateLastLogin = () => {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
}

// --- MOCK DATABASE ---
let users: User[] = [
  { 
    id: '1', 
    username: 'john.doe', 
    email: 'john.doe@example.com', 
    role: 'patient', 
    faceIdEnabled: true,
    caregivers: [{ userId: '2', username: 'jane.smith' }],
    caringFor: [],
    status: 'active',
    lastLogin: generateLastLogin(),
    healthInfo: {
      dateOfBirth: '1985-05-20',
      bloodType: 'A+',
      allergies: ['Peanuts', 'Penicillin'],
      chronicConditions: ['Hypertension'],
      medications: ['Lisinopril 10mg'],
      vitals: [
        { date: '2024-08-15', bloodPressure: '130/85', heartRate: 72, bmi: 26.1 },
        { date: '2024-05-10', bloodPressure: '128/82', heartRate: 75, bmi: 25.9 },
        { date: '2024-01-05', bloodPressure: '135/88', heartRate: 78, bmi: 26.3 },
      ],
      sleepLogs: [ { date: '2024-09-14', duration: '7h 45m', quality: 'good' }, { date: '2024-09-13', duration: '6h 15m', quality: 'fair' }, ],
      heartRateLogs: [ { date: '2024-09-15', time: '08:00 AM', rate: 65 }, { date: '2024-09-14', time: '08:15 AM', rate: 68 }, ],
      bloodPressureLogs: [ { date: '2024-09-15', time: '08:00 AM', systolic: 125, diastolic: 82 }, { date: '2024-09-14', time: '08:15 AM', systolic: 128, diastolic: 84 }, ],
      bloodOxygenLogs: [ { date: '2024-09-15', time: '08:05 AM', level: 98 }, { date: '2024-09-14', time: '08:20 AM', level: 97 }, ],
      healthDocuments: [ { id: 'doc1', name: 'Annual Checkup Lab Results.pdf', type: 'Lab Report', uploadedAt: '2024-08-16T10:00:00Z', url: '#' }, { id: 'doc2', name: 'Lisinopril Prescription.pdf', type: 'Prescription', uploadedAt: '2024-08-15T14:30:00Z', url: '#' }, ],
      clinicalNotes: [],
    } 
  },
  { 
    id: '2', 
    username: 'jane.smith', 
    email: 'jane.smith@example.com', 
    role: 'patient', 
    faceIdEnabled: false,
    caregivers: [],
    caringFor: [{ userId: '1', username: 'john.doe' }],
    status: 'active',
    lastLogin: generateLastLogin(),
    healthInfo: {
      dateOfBirth: '1992-11-30',
      bloodType: 'O-',
      allergies: ['None'],
      chronicConditions: ['Asthma'],
      medications: ['Albuterol Inhaler'],
      vitals: [ { date: '2024-08-19', bloodPressure: '118/78', heartRate: 68, bmi: 22.5 }, { date: '2024-06-01', bloodPressure: '120/80', heartRate: 70, bmi: 22.4 }, ],
      clinicalNotes: [],
    }
  },
  { 
    id: '3', 
    username: 'peter.jones', 
    email: 'peter.jones@example.com', 
    role: 'patient', 
    faceIdEnabled: false,
    status: 'suspended',
    lastLogin: generateLastLogin(),
    healthInfo: {
        dateOfBirth: '1978-02-15',
        bloodType: 'B+',
        allergies: ['Shellfish'],
        chronicConditions: [],
        medications: [],
        vitals: [ { date: '2024-09-10', bloodPressure: '122/81', heartRate: 80, bmi: 27.2 }, ],
        clinicalNotes: [],
    }
  },
  { 
    id: '4', 
    username: 'susan.chen', 
    email: 'susan.chen@example.com', 
    role: 'patient', 
    faceIdEnabled: true,
    status: 'active',
    lastLogin: generateLastLogin(),
    healthInfo: {
        dateOfBirth: '2018-07-22',
        bloodType: 'AB+',
        allergies: ['Pollen'],
        chronicConditions: ['Eczema'],
        medications: ['Hydrocortisone Cream'],
        vitals: [ { date: '2024-07-20', bloodPressure: '90/60', heartRate: 100, bmi: 16.5 }, ],
        clinicalNotes: [],
    }
  },
  { id: 'doc1', username: 'emily.carter', email: 'emily.carter@example.com', role: 'clinician', faceIdEnabled: true, status: 'active', lastLogin: generateLastLogin() },
  { id: 'doc2', username: 'benjamin.lee', email: 'benjamin.lee@example.com', role: 'clinician', faceIdEnabled: false, status: 'active', lastLogin: generateLastLogin() },
  { id: 'admin1', username: 'admin.user', email: 'admin@mediconnect.com', role: 'admin', faceIdEnabled: false, status: 'active', lastLogin: new Date().toISOString() },
];

const doctors: Doctor[] = [
  { id: 'doc1', name: 'Dr. Emily Carter', specialization: 'Cardiologist', avatarUrl: 'https://i.pravatar.cc/150?img=1', availability: ['Mon', 'Wed', 'Fri'] },
  { id: 'doc2', name: 'Dr. Benjamin Lee', specialization: 'Dermatologist', avatarUrl: 'https://i.pravatar.cc/150?img=2', availability: ['Tue', 'Thu'] },
  { id: 'doc3', name: 'Dr. Olivia Harris', specialization: 'Pediatrician', avatarUrl: 'https://i.pravatar.cc/150?img=3', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: 'doc4', name: 'Dr. Michael Chen', specialization: 'Neurologist', avatarUrl: 'https://i.pravatar.cc/150?img=4', availability: ['Wed', 'Fri'] },
  { id: 'doc5', name: 'Dr. Sophia Rodriguez', specialization: 'General Practitioner', avatarUrl: 'https://i.pravatar.cc/150?img=5', availability: ['Mon', 'Tue', 'Thu'] },
  { id: 'doc6', name: 'Dr. William Garcia', specialization: 'Orthopedic Surgeon', avatarUrl: 'https://i.pravatar.cc/150?img=6', availability: ['Tue', 'Thu', 'Fri'] },
];

let appointments: Appointment[] = [
  { id: 'app1', userId: '1', doctorId: 'doc1', doctor: doctors[0], date: '2024-09-05', time: '10:00 AM', status: 'upcoming', reason: 'Follow-up checkup', type: 'follow-up' },
  { id: 'app2', userId: '1', doctorId: 'doc1', doctor: doctors[0], date: '2024-08-15', time: '09:00 AM', status: 'completed', reason: 'Annual checkup', type: 'annual-checkup' },
  { id: 'app3', userId: '2', doctorId: 'doc1', doctor: doctors[0], date: '2024-08-19', time: '09:00 AM', status: 'upcoming', reason: 'Follow-up appointment', type: 'follow-up' },
  { id: 'app4', userId: '1', doctorId: 'doc1', doctor: doctors[0], date: '2024-08-19', time: '11:00 AM', status: 'upcoming', reason: 'Chest pain evaluation', type: 'consultation' },
  { id: 'app5', userId: '3', doctorId: 'doc2', doctor: doctors[1], date: '2024-09-10', time: '02:00 PM', status: 'upcoming', reason: 'Skin rash check', type: 'consultation' },
  { id: 'app6', userId: '4', doctorId: 'doc3', doctor: doctors[2], date: '2024-07-20', time: '11:30 AM', status: 'completed', reason: 'Child vaccination', type: 'annual-checkup' },
];

let platformSettings: PlatformSettings = {
    general: { platformName: 'Mediconnect', supportEmail: 'support@mediconnect.com' },
    featureFlags: { aiHealthAssistant: true, newPatientRegistrations: true, clinicianPortal: true },
    notifications: { newClinicianSignup: true, highSeverityAlerts: false },
};

let auditLogs: AuditLog[] = [
    { id: 'log1', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), actor: { id: '2', name: 'jane.smith' }, action: 'Logged In', details: 'Successful login with password.' },
    { id: 'log2', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), actor: { id: 'doc1', name: 'emily.carter' }, action: 'Viewed Patient Record', target: { id: '1', type: 'Patient', name: 'john.doe' } },
    { id: 'log3', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), actor: { id: 'admin1', name: 'admin.user' }, action: 'Suspended User', target: { id: '3', type: 'Patient', name: 'peter.jones' }, details: 'Reason: Account policy violation.' },
    { id: 'log4', timestamp: new Date(Date.now() - 62 * 60 * 1000).toISOString(), actor: { id: '1', name: 'john.doe' }, action: 'Booked Appointment', target: { id: 'app1', type: 'Appointment', name: 'Dr. Emily Carter' } },
];

// --- MOCK API FUNCTIONS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth
export const loginUser = async (username: string, password_unused: string): Promise<User> => {
  await delay(500);
  const user = users.find(u => u.username === username);
  if (user) {
    if (user.status === 'suspended') throw new Error('Your account has been suspended.');
    user.lastLogin = new Date().toISOString();
    return user;
  }
  throw new Error('Invalid username or password');
};

export const verifyFaceId = async (username: string, image_unused: string): Promise<User> => {
    await delay(1000);
    const user = users.find(u => u.username === username);
    if (user) {
        if (user.status === 'suspended') throw new Error('Your account has been suspended.');
        if (!user.faceIdEnabled) throw new Error('Face ID is not enabled for this user.');
        user.lastLogin = new Date().toISOString();
        return user;
    }
    throw new Error('Face ID verification failed.');
};

export const registerUser = async (username: string, email: string, password_unused: string, faceImage: string | null): Promise<User> => {
    await delay(700);
    if (users.some(u => u.username === username || u.email === email)) {
        throw new Error('User with this username or email already exists.');
    }
    const newUser: User = {
        id: `user${users.length + 1}`,
        username,
        email,
        role: null,
        faceIdEnabled: !!faceImage,
        status: 'active',
        lastLogin: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
};

export const updateUserRole = async (userId: string, role: 'patient' | 'clinician' | 'admin'): Promise<User> => {
    await delay(300);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex].role = role;

    // FIX: If user becomes a patient and doesn't have healthInfo, create it.
    if (role === 'patient' && !users[userIndex].healthInfo) {
        users[userIndex].healthInfo = {
            dateOfBirth: 'N/A',
            bloodType: 'N/A',
            allergies: [],
            chronicConditions: [],
            medications: [],
            vitals: [],
            sleepLogs: [],
            heartRateLogs: [],
            bloodPressureLogs: [],
            bloodOxygenLogs: [],
            healthDocuments: [],
            clinicalNotes: [],
        };
    }

    return users[userIndex];
};

// Users
export const getDoctors = async (): Promise<Doctor[]> => { await delay(800); return [...doctors]; };
export const getPatients = async (): Promise<User[]> => { await delay(700); return users.filter(u => u.role === 'patient'); };
export const getAllUsers = async (): Promise<User[]> => { await delay(500); return [...users]; };
export const getUserById = async (userId: string): Promise<User> => { await delay(100); const user = users.find(u => u.id === userId); if (user) return { ...user }; throw new Error('User not found'); };

export const getPatientById = async (patientId: string): Promise<{ patient: User, appointments: Appointment[] }> => {
    await delay(600);
    const patient = users.find(u => u.id === patientId && u.role === 'patient');
    if (!patient) throw new Error("Patient not found");
    const patientAppointments = appointments.filter(app => app.userId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { patient: { ...patient }, appointments: patientAppointments };
};

export const updatePatientInfo = async (patientId: string, healthInfo: HealthInfo): Promise<User> => {
    await delay(400);
    const userIndex = users.findIndex(u => u.id === patientId && u.role === 'patient');
    if (userIndex === -1) throw new Error("Patient not found");
    users[userIndex].healthInfo = healthInfo;
    return { ...users[userIndex] };
};

// Appointments
export const getAppointmentsForUser = async (userId: string): Promise<Appointment[]> => {
  await delay(600);
  return appointments.filter(app => app.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getAppointmentsForClinician = async (clinicianId: string): Promise<Appointment[]> => {
  await delay(600);
  const doctorAppointments = appointments.filter(app => app.doctorId === clinicianId);
  return doctorAppointments.map(app => {
    const patient = users.find(u => u.id === app.userId);
    return { ...app, patient: patient ? { username: patient.username } : { username: 'Unknown' } };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getAllAppointments = async (): Promise<Appointment[]> => {
  await delay(400);
  return [...appointments];
}

export const bookAppointment = async (userId: string, doctorId: string, date: string, time: string, reason: string): Promise<Appointment> => {
  await delay(1000);
  const doctor = doctors.find(d => d.id === doctorId);
  if (!doctor) throw new Error('Doctor not found.');
  const newAppointment: Appointment = { id: `app${appointments.length + 1}`, userId, doctorId, doctor, date, time, status: 'upcoming', reason, type: 'consultation', };
  appointments.push(newAppointment);
  return newAppointment;
};

// Caregiver
export const inviteCaregiverByEmail = async (patientId: string, caregiverEmail: string): Promise<User> => {
    await delay(600);
    const patientIndex = users.findIndex(u => u.id === patientId);
    const caregiver = users.find(u => u.email === caregiverEmail);
    if (patientIndex === -1) throw new Error("Patient not found.");
    if (!caregiver) throw new Error("User with that email does not exist.");
    if (caregiver.id === patientId) throw new Error("You cannot add yourself as a caregiver.");
    const patient = users[patientIndex];
    if (!patient.caregivers) patient.caregivers = [];
    if (patient.caregivers.some(c => c.userId === caregiver.id)) throw new Error("This user is already a caregiver.");
    patient.caregivers.push({ userId: caregiver.id, username: caregiver.username });
    if (!caregiver.caringFor) caregiver.caringFor = [];
    if (!caregiver.caringFor.some(p => p.userId === patient.id)) caregiver.caringFor.push({ userId: patient.id, username: patient.username });
    return { ...patient };
};

export const removeCaregiver = async (patientId: string, caregiverId: string): Promise<User> => {
    await delay(400);
    const patientIndex = users.findIndex(u => u.id === patientId);
    const caregiverIndex = users.findIndex(u => u.id === caregiverId);
    if (patientIndex === -1) throw new Error("Patient not found.");
    if (caregiverIndex === -1) throw new Error("Caregiver not found.");
    const patient = users[patientIndex];
    const caregiver = users[caregiverIndex];
    if (patient.caregivers) patient.caregivers = patient.caregivers.filter(c => c.userId !== caregiverId);
    if (caregiver.caringFor) caregiver.caringFor = caregiver.caringFor.filter(p => p.userId !== patientId);
    return { ...patient };
};

// Admin Functions
export const getAuditLogs = async (): Promise<AuditLog[]> => {
    await delay(700);
    return [...auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getPlatformSettings = async (): Promise<PlatformSettings> => {
    await delay(300);
    return JSON.parse(JSON.stringify(platformSettings));
};

export const updatePlatformSettings = async (newSettings: PlatformSettings): Promise<PlatformSettings> => {
    await delay(500);
    platformSettings = JSON.parse(JSON.stringify(newSettings));
    return platformSettings;
};

export const updateUserByAdmin = async (userId: string, updates: { role?: User['role'], status?: User['status'] }): Promise<User> => {
    await delay(400);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");
    if (updates.role !== undefined) users[userIndex].role = updates.role;
    if (updates.status !== undefined) users[userIndex].status = updates.status;
    return { ...users[userIndex] };
};

export const deleteUserByAdmin = async (userId: string): Promise<{ success: true }> => {
    await delay(600);
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    if (users.length === initialLength) throw new Error("User not found");
    return { success: true };
};