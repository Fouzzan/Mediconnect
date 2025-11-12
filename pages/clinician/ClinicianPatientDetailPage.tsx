import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User, Appointment, ClinicalNote, HealthInfo } from '../../types';
import { ClipboardListIcon, HeartPulseIcon, CalendarIcon, FileTextIcon, PillIcon, AlertTriangleIcon, PlusIcon } from '../../components/Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string; }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const VitalsChart: React.FC<{ data: any[] }> = ({ data }) => {
    if (data.length === 0) {
        return <div className="text-center text-gray-500 py-10">No vitals data available.</div>;
    }
    const formattedData = useMemo(() => data.map(v => ({
        ...v,
        name: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        systolic: parseInt(v.bloodPressure.split('/')[0], 10),
        diastolic: parseInt(v.bloodPressure.split('/')[1], 10),
    })).reverse(), [data]);

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer>
                <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: 'BP (mmHg)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} label={{ value: 'Rate/BMI', angle: 90, position: 'insideRight' }}/>
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="systolic" name="Systolic BP" stroke="#ef4444" activeDot={{ r: 8 }} />
                    <Line yAxisId="left" type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#f97316" />
                    <Line yAxisId="right" type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#3b82f6" />
                    <Line yAxisId="right" type="monotone" dataKey="bmi" name="BMI" stroke="#10b981" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const NewNoteForm: React.FC<{ patient: User, onNoteAdded: (updatedUser: User) => void }> = ({ patient, onNoteAdded }) => {
    const { user: clinician } = useAuth();
    const [noteType, setNoteType] = useState<'general' | 'soap'>('general');
    const [generalContent, setGeneralContent] = useState('');
    const [soapContent, setSoapContent] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveNote = async () => {
        if (!clinician || !patient.healthInfo) return;

        const newNote: ClinicalNote = {
            id: `note-${Date.now()}`,
            date: new Date().toISOString(),
            type: noteType,
            content: noteType === 'general' ? generalContent : soapContent,
            clinician: clinician.username,
        };
        
        const updatedHealthInfo: HealthInfo = {
            ...patient.healthInfo,
            clinicalNotes: [...(patient.healthInfo.clinicalNotes || []), newNote]
        };

        setIsSaving(true);
        try {
            const updatedUser = await api.updatePatientInfo(patient.id, updatedHealthInfo);
            onNoteAdded(updatedUser);
            // Reset form
            setGeneralContent('');
            setSoapContent({ subjective: '', objective: '', assessment: '', plan: '' });
        } catch (error) {
            console.error("Failed to save note:", error);
            alert("Could not save the new note.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><PlusIcon className="w-5 h-5"/>Add New Clinical Note</h3>
            <div className="flex gap-2 mb-4">
                <button onClick={() => setNoteType('general')} className={`px-3 py-1 text-sm rounded ${noteType === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>General</button>
                <button onClick={() => setNoteType('soap')} className={`px-3 py-1 text-sm rounded ${noteType === 'soap' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>SOAP</button>
            </div>
            {noteType === 'general' ? (
                <textarea value={generalContent} onChange={e => setGeneralContent(e.target.value)} rows={5} className="w-full p-2 border rounded" placeholder="Enter general note..."/>
            ) : (
                <div className="space-y-2">
                    <textarea value={soapContent.subjective} onChange={e => setSoapContent(s => ({...s, subjective: e.target.value}))} rows={2} className="w-full p-2 border rounded" placeholder="Subjective..."/>
                    <textarea value={soapContent.objective} onChange={e => setSoapContent(s => ({...s, objective: e.target.value}))} rows={2} className="w-full p-2 border rounded" placeholder="Objective..."/>
                    <textarea value={soapContent.assessment} onChange={e => setSoapContent(s => ({...s, assessment: e.target.value}))} rows={2} className="w-full p-2 border rounded" placeholder="Assessment..."/>
                    <textarea value={soapContent.plan} onChange={e => setSoapContent(s => ({...s, plan: e.target.value}))} rows={2} className="w-full p-2 border rounded" placeholder="Plan..."/>
                </div>
            )}
            <button onClick={handleSaveNote} disabled={isSaving} className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                {isSaving ? 'Saving...' : 'Save Note'}
            </button>
        </div>
    );
};


const ClinicianPatientDetailPage: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const [patient, setPatient] = useState<User | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!patientId) return;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const { patient: fetchedPatient, appointments: fetchedAppointments } = await api.getPatientById(patientId);
                setPatient(fetchedPatient);
                setAppointments(fetchedAppointments);
            } catch (err) {
                setError('Failed to fetch patient data.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [patientId]);

    const handleNoteAdded = (updatedUser: User) => {
        setPatient(updatedUser);
    };

    if (isLoading) return <div className="text-center p-10">Loading patient details...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    if (!patient) return <div className="text-center p-10">Patient not found.</div>;
    
    const { healthInfo } = patient;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
                <img src={`https://i.pravatar.cc/150?u=${patient.id}`} alt={patient.username} className="w-20 h-20 rounded-full"/>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{patient.username}</h1>
                    <p className="text-gray-600">DOB: {healthInfo?.dateOfBirth} &bull; Blood Type: {healthInfo?.bloodType}</p>
                </div>
            </div>
            
            <div className="flex gap-2 border-b">
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Overview</button>
                <button onClick={() => setActiveTab('vitals')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'vitals' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Vitals</button>
                <button onClick={() => setActiveTab('appointments')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'appointments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Appointments</button>
                <button onClick={() => setActiveTab('notes')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'notes' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Clinical Notes</button>
            </div>

            <div>
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InfoCard title="Allergies" icon={<AlertTriangleIcon className="w-6 h-6 text-red-500"/>}>
                            <ul className="list-disc list-inside text-gray-700">{healthInfo?.allergies?.length ? healthInfo.allergies.map(item => <li key={item}>{item}</li>) : <li>None</li>}</ul>
                        </InfoCard>
                        <InfoCard title="Chronic Conditions" icon={<ClipboardListIcon className="w-6 h-6 text-yellow-600"/>}>
                            <ul className="list-disc list-inside text-gray-700">{healthInfo?.chronicConditions?.length ? healthInfo.chronicConditions.map(item => <li key={item}>{item}</li>) : <li>None</li>}</ul>
                        </InfoCard>
                        <InfoCard title="Medications" icon={<PillIcon className="w-6 h-6 text-blue-500"/>}>
                            <ul className="list-disc list-inside text-gray-700">{healthInfo?.medications?.length ? healthInfo.medications.map(item => <li key={item}>{item}</li>) : <li>None</li>}</ul>
                        </InfoCard>
                    </div>
                )}
                {activeTab === 'vitals' && (
                    <InfoCard title="Vitals History" icon={<HeartPulseIcon className="w-6 h-6 text-green-600"/>}>
                        <VitalsChart data={healthInfo?.vitals || []} />
                    </InfoCard>
                )}
                {activeTab === 'appointments' && (
                    <InfoCard title="Appointment History" icon={<CalendarIcon className="w-6 h-6 text-blue-600"/>}>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {appointments.length ? appointments.map(app => (
                                <div key={app.id} className="p-3 bg-gray-50 rounded-lg border">
                                    <p className="font-semibold">{app.date} @ {app.time} with {app.doctor.name}</p>
                                    <p className="text-sm text-gray-600">{app.reason} ({app.status})</p>
                                </div>
                            )) : <p>No appointments found.</p>}
                        </div>
                    </InfoCard>
                )}
                 {activeTab === 'notes' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                             <h3 className="text-lg font-bold text-gray-800">Existing Notes</h3>
                             <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                {healthInfo?.clinicalNotes?.length ? [...healthInfo.clinicalNotes].reverse().map(note => (
                                    <div key={note.id} className="p-4 bg-gray-50 rounded-lg border">
                                        <p className="text-sm text-gray-500">
                                            {new Date(note.date).toLocaleString()} - Dr. {note.clinician}
                                            <span className="ml-2 font-semibold capitalize bg-gray-200 px-2 py-0.5 rounded-full text-xs">{note.type}</span>
                                        </p>
                                        {/* FIX: Replaced ternary with type-safe conditional rendering to fix ReactNode error and improve type safety. */}
                                        {note.type === 'general' && typeof note.content === 'string' && (
                                            <p className="mt-2 whitespace-pre-wrap">{note.content}</p>
                                        )}
                                        {note.type === 'soap' && typeof note.content === 'object' && note.content && (
                                            <div className="mt-2 text-sm space-y-1">
                                                <p><strong>S:</strong> {note.content.subjective}</p>
                                                <p><strong>O:</strong> {note.content.objective}</p>
                                                <p><strong>A:</strong> {note.content.assessment}</p>
                                                <p><strong>P:</strong> {note.content.plan}</p>
                                            </div>
                                        )}
                                    </div>
                                )) : <p>No clinical notes for this patient.</p>}
                             </div>
                        </div>
                        <div>
                            <NewNoteForm patient={patient} onNoteAdded={handleNoteAdded} />
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ClinicianPatientDetailPage;