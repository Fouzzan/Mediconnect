import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as api from '../services/api';
import { HealthInfo, VitalSign, HealthDocument, SleepLog, HeartRateLog, BloodPressureLog, BloodOxygenLog } from '../types';
import {
    UserCircleIcon,
    DropletIcon,
    AlertTriangleIcon,
    PillIcon,
    ClipboardListIcon,
    HeartPulseIcon,
    FileTextIcon,
    BedIcon,
    ActivityIcon,
    WeightIcon,
    PencilIcon,
    Trash2Icon,
    PlusIcon,
    UploadCloudIcon
} from '../components/Icons';
import BMICalculator from '../components/BMICalculator';
import MoodTracker from '../components/MoodTracker';
import EditableListComponent from '../components/EditableListComponent';

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string; }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <div>{children}</div>
    </div>
);

const VitalsChart: React.FC<{ data: any[] }> = ({ data }) => {
    if (data.length === 0) {
        return <div className="text-center text-gray-500 py-10">No vitals data available to display chart.</div>;
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

const calculateAge = (dob: string) => {
    if (!dob || dob === 'N/A') return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${active ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
    >
        {children}
    </button>
);


const ProfilePage: React.FC = () => {
    const { activeUser: user, updateUserInContext } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editableHealthInfo, setEditableHealthInfo] = useState<HealthInfo | undefined>(JSON.parse(JSON.stringify(user?.healthInfo || {})));
    
    // State for new entries
    const [newVital, setNewVital] = useState<Omit<VitalSign, 'date'> & { date: string }>({ date: new Date().toISOString().split('T')[0], bloodPressure: '', heartRate: 0, bmi: 0 });
    const [newDocument, setNewDocument] = useState<{ name: string; file: File | null }>({ name: '', file: null });
    const [newSleepLog, setNewSleepLog] = useState<SleepLog>({ date: new Date().toISOString().split('T')[0], duration: '', quality: 'good' });
    const [newHeartRateLog, setNewHeartRateLog] = useState<HeartRateLog>({ date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().substring(0,5), rate: 0 });
    const [newBloodPressureLog, setNewBloodPressureLog] = useState<BloodPressureLog>({ date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().substring(0,5), systolic: 0, diastolic: 0 });
    const [newBloodOxygenLog, setNewBloodOxygenLog] = useState<BloodOxygenLog>({ date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().substring(0,5), level: 0 });

    useEffect(() => {
        // When user switches view (e.g. caregiver view), reset the state
        setEditableHealthInfo(JSON.parse(JSON.stringify(user?.healthInfo || {})));
        setIsEditing(false);
    }, [user]);

    if (!user) {
        return <div className="text-center py-10">Loading user profile...</div>;
    }
    
    if (!user.healthInfo) {
        return <div className="text-center py-10">No health information available for this user.</div>;
    }
    
    const handleSave = async () => {
        if (!editableHealthInfo) return;
        try {
            const updatedUser = await api.updatePatientInfo(user.id, editableHealthInfo);
            updateUserInContext(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save health info:", error);
            alert("Could not save changes.");
        }
    };

    const handleCancel = () => {
        setEditableHealthInfo(JSON.parse(JSON.stringify(user?.healthInfo || {})));
        setIsEditing(false);
    };

    const handleFieldChange = (field: keyof HealthInfo, value: any) => {
        setEditableHealthInfo(prev => prev ? { ...prev, [field]: value } : undefined);
    };

    // Vitals Handlers
    const handleAddVital = () => {
        if (!newVital.bloodPressure || !newVital.heartRate || !newVital.bmi) {
            alert("Please fill all vital fields.");
            return;
        }
        const updatedVitals = [...(editableHealthInfo?.vitals || []), newVital];
        handleFieldChange('vitals', updatedVitals);
        setNewVital({ date: new Date().toISOString().split('T')[0], bloodPressure: '', heartRate: 0, bmi: 0 });
    };
    const handleRemoveVital = (indexToRemove: number) => {
        const updatedVitals = editableHealthInfo?.vitals.filter((_, index) => index !== indexToRemove);
        handleFieldChange('vitals', updatedVitals);
    };
    
    // Document Handlers
    const handleAddDocument = () => {
        if (!newDocument.name.trim() || !newDocument.file) {
            alert("Please provide a document name and select a file.");
            return;
        }
        const newDocEntry: HealthDocument = {
            id: `doc${Date.now()}`,
            name: newDocument.name,
            type: newDocument.file.type,
            uploadedAt: new Date().toISOString(),
            url: URL.createObjectURL(newDocument.file) // Mock URL
        };
        const updatedDocs = [...(editableHealthInfo?.healthDocuments || []), newDocEntry];
        handleFieldChange('healthDocuments', updatedDocs);
        setNewDocument({ name: '', file: null });
    };
     const handleRemoveDocument = (idToRemove: string) => {
        const updatedDocs = editableHealthInfo?.healthDocuments?.filter(doc => doc.id !== idToRemove);
        handleFieldChange('healthDocuments', updatedDocs);
    };

    // Log Handlers
    const handleAddSleepLog = () => {
        if (!newSleepLog.duration.trim()) { alert("Please enter a sleep duration."); return; }
        handleFieldChange('sleepLogs', [...(editableHealthInfo?.sleepLogs || []), newSleepLog]);
        setNewSleepLog({ date: new Date().toISOString().split('T')[0], duration: '', quality: 'good' });
    };
    const handleRemoveSleepLog = (indexToRemove: number) => {
        handleFieldChange('sleepLogs', editableHealthInfo?.sleepLogs?.filter((_, i) => i !== indexToRemove));
    };

    const handleAddHeartRateLog = () => {
        if (!newHeartRateLog.rate || newHeartRateLog.rate <= 0) { alert("Please enter a valid heart rate."); return; }
        handleFieldChange('heartRateLogs', [...(editableHealthInfo?.heartRateLogs || []), newHeartRateLog]);
        setNewHeartRateLog({ date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().substring(0,5), rate: 0 });
    };
    const handleRemoveHeartRateLog = (indexToRemove: number) => {
        handleFieldChange('heartRateLogs', editableHealthInfo?.heartRateLogs?.filter((_, i) => i !== indexToRemove));
    };

    const handleAddBloodPressureLog = () => {
        if (!newBloodPressureLog.systolic || !newBloodPressureLog.diastolic || newBloodPressureLog.systolic <= 0 || newBloodPressureLog.diastolic <= 0) { alert("Please enter valid systolic and diastolic values."); return; }
        handleFieldChange('bloodPressureLogs', [...(editableHealthInfo?.bloodPressureLogs || []), newBloodPressureLog]);
        setNewBloodPressureLog({ date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().substring(0,5), systolic: 0, diastolic: 0 });
    };
    const handleRemoveBloodPressureLog = (indexToRemove: number) => {
        handleFieldChange('bloodPressureLogs', editableHealthInfo?.bloodPressureLogs?.filter((_, i) => i !== indexToRemove));
    };
    
    const handleAddBloodOxygenLog = () => {
        if (!newBloodOxygenLog.level || newBloodOxygenLog.level <= 0) { alert("Please enter a valid oxygen level."); return; }
        handleFieldChange('bloodOxygenLogs', [...(editableHealthInfo?.bloodOxygenLogs || []), newBloodOxygenLog]);
        setNewBloodOxygenLog({ date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().substring(0,5), level: 0 });
    };
    const handleRemoveBloodOxygenLog = (indexToRemove: number) => {
        handleFieldChange('bloodOxygenLogs', editableHealthInfo?.bloodOxygenLogs?.filter((_, i) => i !== indexToRemove));
    };

    const age = calculateAge(editableHealthInfo?.dateOfBirth || '');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <img src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.username} className="w-20 h-20 rounded-full border-4 border-white shadow-md"/>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 capitalize">{user.username}</h1>
                        {isEditing ? (
                            <div className="flex gap-4 items-center mt-2">
                                <input type="date" value={editableHealthInfo?.dateOfBirth} onChange={e => handleFieldChange('dateOfBirth', e.target.value)} className="p-1 border rounded" />
                                <input type="text" value={editableHealthInfo?.bloodType} onChange={e => handleFieldChange('bloodType', e.target.value)} placeholder="Blood Type" className="p-1 border rounded w-24" />
                            </div>
                        ) : (
                            <p className="text-lg text-gray-600">
                                {age} years old &bull; Blood Type: {editableHealthInfo?.bloodType}
                            </p>
                        )}
                    </div>
                </div>
                 {isEditing ? (
                    <div className="flex gap-2">
                        <button onClick={handleCancel} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg">Cancel</button>
                        <button onClick={handleSave} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg">Save Changes</button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <PencilIcon className="w-5 h-5" />
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex gap-2 flex-wrap">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                <TabButton active={activeTab === 'vitals'} onClick={() => setActiveTab('vitals')}>Vitals</TabButton>
                <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>Health Logs</TabButton>
                <TabButton active={activeTab === 'tools'} onClick={() => setActiveTab('tools')}>Wellness Tools</TabButton>
                <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')}>Documents</TabButton>
            </div>
            
            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0">
                        <InfoCard title="Allergies" icon={<AlertTriangleIcon className="w-6 h-6 text-red-500"/>}>
                            {isEditing ? <EditableListComponent items={editableHealthInfo?.allergies || []} onItemsChange={items => handleFieldChange('allergies', items)} /> : (
                                <ul className="list-disc list-inside text-gray-700">
                                    {editableHealthInfo?.allergies?.length > 0 ? editableHealthInfo.allergies.map(item => <li key={item}>{item}</li>) : <li>None reported</li>}
                                </ul>
                            )}
                        </InfoCard>
                         <InfoCard title="Chronic Conditions" icon={<ClipboardListIcon className="w-6 h-6 text-yellow-600"/>}>
                            {isEditing ? <EditableListComponent items={editableHealthInfo?.chronicConditions || []} onItemsChange={items => handleFieldChange('chronicConditions', items)} /> : (
                                <ul className="list-disc list-inside text-gray-700">
                                    {editableHealthInfo?.chronicConditions?.length > 0 ? editableHealthInfo.chronicConditions.map(item => <li key={item}>{item}</li>) : <li>None reported</li>}
                                </ul>
                             )}
                        </InfoCard>
                         <InfoCard title="Medications" icon={<PillIcon className="w-6 h-6 text-blue-500"/>}>
                             {isEditing ? <EditableListComponent items={editableHealthInfo?.medications || []} onItemsChange={items => handleFieldChange('medications', items)} /> : (
                                <ul className="list-disc list-inside text-gray-700">
                                    {editableHealthInfo?.medications?.length > 0 ? editableHealthInfo.medications.map(item => <li key={item}>{item}</li>) : <li>None reported</li>}
                                </ul>
                            )}
                        </InfoCard>
                    </div>
                )}

                {activeTab === 'vitals' && (
                    <InfoCard title="Vitals History" icon={<HeartPulseIcon className="w-6 h-6 text-green-600" />}>
                        <VitalsChart data={editableHealthInfo?.vitals || []} />
                         {isEditing && (
                            <div className="mt-4 space-y-4">
                                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
                                    {editableHealthInfo?.vitals.map((vital, index) => (
                                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                            <p className="text-sm">{vital.date}: BP {vital.bloodPressure}, HR {vital.heartRate}, BMI {vital.bmi}</p>
                                            <button onClick={() => handleRemoveVital(index)} className="text-red-500 hover:text-red-700 p-1"><Trash2Icon className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t">
                                    <h4 className="font-semibold mb-2">Add New Vitals Entry</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <input type="date" value={newVital.date} onChange={e => setNewVital({...newVital, date: e.target.value})} className="p-1 border rounded" />
                                        <input type="text" value={newVital.bloodPressure} onChange={e => setNewVital({...newVital, bloodPressure: e.target.value})} placeholder="BP (e.g., 120/80)" className="p-1 border rounded" />
                                        <input type="number" value={newVital.heartRate || ''} onChange={e => setNewVital({...newVital, heartRate: parseInt(e.target.value)})} placeholder="Heart Rate" className="p-1 border rounded" />
                                        <input type="number" value={newVital.bmi || ''} onChange={e => setNewVital({...newVital, bmi: parseFloat(e.target.value)})} placeholder="BMI" className="p-1 border rounded" />
                                    </div>
                                    <button onClick={handleAddVital} className="mt-2 w-full bg-teal-600 text-white p-2 rounded-md font-semibold"><PlusIcon className="w-5 h-5 inline-block mr-1"/>Add Entry</button>
                                </div>
                            </div>
                         )}
                    </InfoCard>
                )}
                
                {activeTab === 'logs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-0">
                        <InfoCard title="Sleep Logs" icon={<BedIcon className="w-6 h-6 text-indigo-500"/>}>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div className="max-h-32 overflow-y-auto pr-1 space-y-1">
                                        {editableHealthInfo?.sleepLogs?.map((log, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm bg-gray-50 p-1.5 rounded">
                                                <span>{log.date}: {log.duration} ({log.quality})</span>
                                                <button onClick={() => handleRemoveSleepLog(i)}><Trash2Icon className="w-4 h-4 text-red-500 hover:text-red-700"/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-3 space-y-2">
                                        <h4 className="font-semibold text-sm">Add New Log</h4>
                                        <input type="date" value={newSleepLog.date} onChange={e => setNewSleepLog({...newSleepLog, date: e.target.value})} className="p-1.5 border rounded w-full text-sm"/>
                                        <input type="text" placeholder="Duration (e.g., 7h 30m)" value={newSleepLog.duration} onChange={e => setNewSleepLog({...newSleepLog, duration: e.target.value})} className="p-1.5 border rounded w-full text-sm"/>
                                        <select value={newSleepLog.quality} onChange={e => setNewSleepLog({...newSleepLog, quality: e.target.value as SleepLog['quality']})} className="p-1.5 border rounded w-full text-sm">
                                            <option value="good">Good</option>
                                            <option value="fair">Fair</option>
                                            <option value="poor">Poor</option>
                                        </select>
                                        <button onClick={handleAddSleepLog} className="w-full bg-teal-600 text-white text-sm py-2 rounded-md font-semibold">Add</button>
                                    </div>
                                </div>
                            ) : (
                                editableHealthInfo?.sleepLogs?.length > 0 ? editableHealthInfo.sleepLogs.map((log, i) => <p key={i} className="text-gray-600">{log.date}: {log.duration} ({log.quality})</p>) : <p className="text-gray-500">No sleep data.</p>
                            )}
                        </InfoCard>

                         <InfoCard title="Heart Rate" icon={<ActivityIcon className="w-6 h-6 text-red-500"/>}>
                             {isEditing ? (
                                <div className="space-y-3">
                                    <div className="max-h-32 overflow-y-auto pr-1 space-y-1">
                                        {editableHealthInfo?.heartRateLogs?.map((log, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm bg-gray-50 p-1.5 rounded">
                                                <span>{log.date} {log.time}: {log.rate} bpm</span>
                                                <button onClick={() => handleRemoveHeartRateLog(i)}><Trash2Icon className="w-4 h-4 text-red-500 hover:text-red-700"/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-3 space-y-2">
                                        <h4 className="font-semibold text-sm">Add New Log</h4>
                                        <div className="flex gap-2">
                                            <input type="date" value={newHeartRateLog.date} onChange={e => setNewHeartRateLog({...newHeartRateLog, date: e.target.value})} className="p-1.5 border rounded w-full text-sm"/>
                                            <input type="time" value={newHeartRateLog.time} onChange={e => setNewHeartRateLog({...newHeartRateLog, time: e.target.value})} className="p-1.5 border rounded w-full text-sm"/>
                                        </div>
                                        <input type="number" placeholder="Rate (bpm)" value={newHeartRateLog.rate || ''} onChange={e => setNewHeartRateLog({...newHeartRateLog, rate: parseInt(e.target.value)})} className="p-1.5 border rounded w-full text-sm"/>
                                        <button onClick={handleAddHeartRateLog} className="w-full bg-teal-600 text-white text-sm py-2 rounded-md font-semibold">Add</button>
                                    </div>
                                </div>
                             ) : (
                                editableHealthInfo?.heartRateLogs?.length > 0 ? editableHealthInfo.heartRateLogs.map((log, i) => <p key={i} className="text-gray-600">{log.date} at {log.time}: {log.rate} bpm</p>) : <p className="text-gray-500">No heart rate data.</p>
                             )}
                         </InfoCard>

                         <InfoCard title="Blood Pressure" icon={<DropletIcon className="w-6 h-6 text-orange-500"/>}>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div className="max-h-32 overflow-y-auto pr-1 space-y-1">
                                        {editableHealthInfo?.bloodPressureLogs?.map((log, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm bg-gray-50 p-1.5 rounded">
                                                <span>{log.date} {log.time}: {log.systolic}/{log.diastolic} mmHg</span>
                                                <button onClick={() => handleRemoveBloodPressureLog(i)}><Trash2Icon className="w-4 h-4 text-red-500 hover:text-red-700"/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-3 space-y-2">
                                        <h4 className="font-semibold text-sm">Add New Log</h4>
                                        <div className="flex gap-2">
                                            <input type="date" value={newBloodPressureLog.date} onChange={e => setNewBloodPressureLog({...newBloodPressureLog, date: e.target.value})} className="p-1.5 border rounded w-full text-sm"/>
                                            <input type="time" value={newBloodPressureLog.time} onChange={e => setNewBloodPressureLog({...newBloodPressureLog, time: e.target.value})} className="p-1.5 border rounded w-full text-sm"/>
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Systolic" value={newBloodPressureLog.systolic || ''} onChange={e => setNewBloodPressureLog({...newBloodPressureLog, systolic: parseInt(e.target.value)})} className="p-1.5 border rounded w-full text-sm"/>
                                            <input type="number" placeholder="Diastolic" value={newBloodPressureLog.diastolic || ''} onChange={e => setNewBloodPressureLog({...newBloodPressureLog, diastolic: parseInt(e.target.value)})} className="p-1.5 border rounded w-full text-sm"/>
                                        </div>
                                        <button onClick={handleAddBloodPressureLog} className="w-full bg-teal-600 text-white text-sm py-2 rounded-md font-semibold">Add</button>
                                    </div>
                                </div>
                             ) : (
                                editableHealthInfo?.bloodPressureLogs?.length > 0 ? editableHealthInfo.bloodPressureLogs.map((log, i) => <p key={i} className="text-gray-600">{log.date} at {log.time}: {log.systolic}/{log.diastolic} mmHg</p>) : <p className="text-gray-500">No blood pressure data.</p>
                             )}
                         </InfoCard>

                         <InfoCard title="Blood Oxygen" icon={<WeightIcon className="w-6 h-6 text-cyan-500"/>}>
                             {isEditing ? (
                                <div className="space-y-3">
                                    <div className="max-h-32 overflow-y-auto pr-1 space-y-1">
                                        {editableHealthInfo?.bloodOxygenLogs?.map((log, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm bg-gray-50 p-1.5 rounded">
                                                <span>{log.date} {log.time}: {log.level}%</span>
                                                <button onClick={() => handleRemoveBloodOxygenLog(i)}><Trash2Icon className="w-4 h-4 text-red-500 hover:text-red-700"/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-3 space-y-2">
                                        <h4 className="font-semibold text-sm">Add New Log</h4>
                                        <div className="flex gap-2">
                                            <input type="date" value={newBloodOxygenLog.date} onChange={e => setNewBloodOxygenLog({...newBloodOxygenLog, date: e.target.value})} className="p-1.5 border rounded w-full text-sm"/>
                                            <input type="time" value={newBloodOxygenLog.time} onChange={e => setNewBloodOxygenLog({...newBloodOxygenLog, time: e.target.value})} className="p-1.5 border rounded w-full text-sm"/>
                                        </div>
                                        <input type="number" placeholder="Level (%)" value={newBloodOxygenLog.level || ''} onChange={e => setNewBloodOxygenLog({...newBloodOxygenLog, level: parseInt(e.target.value)})} className="p-1.5 border rounded w-full text-sm"/>
                                        <button onClick={handleAddBloodOxygenLog} className="w-full bg-teal-600 text-white text-sm py-2 rounded-md font-semibold">Add</button>
                                    </div>
                                </div>
                             ) : (
                                editableHealthInfo?.bloodOxygenLogs?.length > 0 ? editableHealthInfo.bloodOxygenLogs.map((log, i) => <p key={i} className="text-gray-600">{log.date} at {log.time}: {log.level}%</p>) : <p className="text-gray-500">No blood oxygen data.</p>
                             )}
                         </InfoCard>
                    </div>
                )}

                {activeTab === 'tools' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-0">
                        <InfoCard title="Wellness Tools" icon={<UserCircleIcon className="w-6 h-6 text-green-600" />}>
                            <MoodTracker />
                        </InfoCard>
                        <InfoCard title="BMI Calculator" icon={<UserCircleIcon className="w-6 h-6 text-green-600" />}>
                            <BMICalculator />
                        </InfoCard>
                     </div>
                )}
                
                {activeTab === 'documents' && (
                    <InfoCard title="Health Documents" icon={<FileTextIcon className="w-6 h-6 text-green-600"/>}>
                        <div className="space-y-2">
                             {editableHealthInfo?.healthDocuments?.length > 0 ? editableHealthInfo.healthDocuments.map(doc => (
                                <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-grow">
                                        <p className="font-semibold text-gray-800">{doc.name}</p>
                                        <p className="text-sm text-gray-500">{doc.type} - Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                    </a>
                                    {isEditing && (
                                        <button onClick={() => handleRemoveDocument(doc.id)} className="text-red-500 hover:text-red-700 p-1 ml-2"><Trash2Icon className="w-4 h-4"/></button>
                                    )}
                                </div>
                            )) : <p className="text-center text-gray-500">No documents uploaded.</p>}
                        </div>
                         {isEditing && (
                             <div className="p-4 border-t mt-4">
                                <h4 className="font-semibold mb-2">Upload New Document</h4>
                                <div className="flex flex-col sm:flex-row gap-2">
                                     <input type="text" value={newDocument.name} onChange={e => setNewDocument({...newDocument, name: e.target.value})} placeholder="Document Name" className="p-2 border rounded flex-grow" />
                                     <input type="file" onChange={e => setNewDocument({...newDocument, file: e.target.files?.[0] || null})} className="text-sm" />
                                </div>
                                <button onClick={handleAddDocument} className="mt-2 w-full bg-teal-600 text-white p-2 rounded-md font-semibold"><UploadCloudIcon className="w-5 h-5 inline-block mr-1"/>Upload</button>
                            </div>
                         )}
                    </InfoCard>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;