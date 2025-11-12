import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { UserIcon, XIcon, MailIcon } from '../components/Icons';

const FamilyAccessPage: React.FC = () => {
    const { user, updateUserInContext } = useAuth();
    const [inviteEmail, setInviteEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !inviteEmail.trim()) return;

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const updatedUser = await api.inviteCaregiverByEmail(user.id, inviteEmail);
            updateUserInContext(updatedUser);
            setSuccess(`Invitation sent to ${inviteEmail}! They now have access.`);
            setInviteEmail('');
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (caregiverId: string) => {
        if (!user) return;
        if (!window.confirm("Are you sure you want to remove this caregiver's access?")) return;

        try {
            const updatedUser = await api.removeCaregiver(user.id, caregiverId);
            updateUserInContext(updatedUser);
            setSuccess('Caregiver access has been removed.');
        } catch (err: any) {
            setError(err.message || 'Failed to remove caregiver.');
        }
    };
    
    return (
        <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Family & Caregiver Access</h1>
            <p className="text-lg text-gray-600 mb-8">Grant trusted individuals access to your health portal.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Invite Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Invite a Caregiver</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Enter the email address of the person you'd like to grant access. They must have a Mediconnect account.
                    </p>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <MailIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    required
                                    className="block w-full rounded-md border-gray-300 pl-10 p-2.5"
                                    placeholder="caregiver@example.com"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-teal-600 text-white font-semibold py-2.5 rounded-lg hover:bg-teal-700 disabled:bg-teal-400"
                        >
                            {isLoading ? 'Sending...' : 'Send Invite'}
                        </button>
                    </form>
                    {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                    {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
                </div>

                {/* Current Caregivers Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Caregivers</h2>
                    <div className="space-y-3">
                        {user?.caregivers && user.caregivers.length > 0 ? (
                            user.caregivers.map(caregiver => (
                                <div key={caregiver.userId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <UserIcon className="w-6 h-6 text-gray-500"/>
                                        <span className="font-medium text-gray-800">{caregiver.username}</span>
                                    </div>
                                    <button onClick={() => handleRemove(caregiver.userId)} className="text-red-500 hover:text-red-700 p-1 rounded-full">
                                        <XIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">You have not granted access to any caregivers.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FamilyAccessPage;
