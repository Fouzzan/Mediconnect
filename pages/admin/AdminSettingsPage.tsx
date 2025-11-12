import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { PlatformSettings } from '../../types';

const ToggleSwitch: React.FC<{
    label: string;
    description: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}> = ({ label, description, enabled, onChange }) => (
    <div className="flex justify-between items-center">
        <div>
            <h4 className="font-semibold text-gray-800">{label}</h4>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-slate-800' : 'bg-gray-200'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const AdminSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        api.getPlatformSettings()
            .then(setSettings)
            .finally(() => setIsLoading(false));
    }, []);

    const handleSettingChange = (category: keyof PlatformSettings, key: string, value: any) => {
        setSettings(prev => {
            if (!prev) return null;
            const newSettings = { ...prev };
            (newSettings[category] as any)[key] = value;
            return newSettings;
        });
    };
    
    const handleSaveChanges = async () => {
        if (!settings) return;
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            await api.updatePlatformSettings(settings);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !settings) {
        return <p>Loading settings...</p>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Platform Settings</h1>
                    <p className="text-lg text-gray-600">Manage global configurations for the application.</p>
                </div>
                <button onClick={handleSaveChanges} disabled={isSaving} className="bg-slate-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-slate-800 disabled:bg-slate-400">
                    {isSaving ? 'Saving...' : (saveSuccess ? 'Saved!' : 'Save Changes')}
                </button>
            </div>

            <div className="space-y-8 max-w-4xl mx-auto">
                {/* General Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">General</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Platform Name</label>
                            <input
                                type="text"
                                value={settings.general.platformName}
                                onChange={e => handleSettingChange('general', 'platformName', e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Support Email</label>
                            <input
                                type="email"
                                value={settings.general.supportEmail}
                                onChange={e => handleSettingChange('general', 'supportEmail', e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                </div>

                {/* Feature Flags */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">Feature Flags</h3>
                    <div className="space-y-6">
                        <ToggleSwitch
                            label="AI Health Assistant"
                            description="Enable or disable the AURA AI assistant for patients."
                            enabled={settings.featureFlags.aiHealthAssistant}
                            onChange={val => handleSettingChange('featureFlags', 'aiHealthAssistant', val)}
                        />
                         <ToggleSwitch
                            label="New Patient Registrations"
                            description="Allow or prevent new patients from creating accounts."
                            enabled={settings.featureFlags.newPatientRegistrations}
                            onChange={val => handleSettingChange('featureFlags', 'newPatientRegistrations', val)}
                        />
                         <ToggleSwitch
                            label="Clinician Portal Access"
                            description="Enable or disable access to the entire clinician portal."
                            enabled={settings.featureFlags.clinicianPortal}
                            onChange={val => handleSettingChange('featureFlags', 'clinicianPortal', val)}
                        />
                    </div>
                </div>
                
                 {/* Notifications */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">Notifications</h3>
                     <div className="space-y-6">
                        <ToggleSwitch
                            label="New Clinician Signups"
                            description="Send an email to admins when a new clinician registers."
                            enabled={settings.notifications.newClinicianSignup}
                            onChange={val => handleSettingChange('notifications', 'newClinicianSignup', val)}
                        />
                         <ToggleSwitch
                            label="High Severity System Alerts"
                            description="Notify admins of critical system errors or downtime."
                            enabled={settings.notifications.highSeverityAlerts}
                            onChange={val => handleSettingChange('notifications', 'highSeverityAlerts', val)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;