
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon, UserStethoscopeIcon, CogIcon } from '../components/Icons';

type UserRole = 'patient' | 'clinician' | 'admin';

const SelectRolePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { setUserRole, user } = useAuth();
    const navigate = useNavigate();

    const handleRoleSelect = async (role: UserRole) => {
        setIsLoading(true);
        setError('');
        try {
            await setUserRole(role);
            if (role === 'patient') {
                navigate('/home');
            } else if (role === 'clinician') {
                navigate('/clinician/home');
            } else if (role === 'admin') {
                navigate('/admin/home');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to set role.');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 text-center">
            <h1 className="text-4xl font-bold text-gray-800">One Last Step!</h1>
            <p className="mt-4 text-lg text-gray-600">
                Welcome, {user?.username}! Please select your role to personalize your Mediconnect experience.
            </p>

            {error && <p className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <RoleCard
                    icon={<UserIcon className="w-12 h-12 text-teal-500" />}
                    title="I'm a Patient"
                    description="Access my health records, book appointments, and manage my healthcare."
                    onClick={() => handleRoleSelect('patient')}
                    disabled={isLoading}
                />
                <RoleCard
                    icon={<UserStethoscopeIcon className="w-12 h-12 text-blue-500" />}
                    title="I'm a Clinician"
                    description="Manage patient appointments, view schedules, and access clinic tools."
                    onClick={() => handleRoleSelect('clinician')}
                    disabled={isLoading}
                />
                <RoleCard
                    icon={<CogIcon className="w-12 h-12 text-slate-500" />}
                    title="I'm an Admin"
                    description="Oversee the platform, manage users, and access administrative features."
                    onClick={() => handleRoleSelect('admin')}
                    disabled={isLoading}
                />
            </div>
             {isLoading && (
                <div className="mt-6 flex justify-center items-center">
                    <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-gray-800"></div>
                    <p className="ml-2 text-gray-600">Setting up your portal...</p>
                </div>
            )}
        </div>
    );
};

interface RoleCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    disabled: boolean;
}

const RoleCard: React.FC<RoleCardProps> = ({ icon, title, description, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-teal-300 transition-all transform hover:-translate-y-1 text-center disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <div className="flex justify-center mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
    </button>
);


export default SelectRolePage;
