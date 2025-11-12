

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AIAssistantInput from '../components/AIAssistantInput';
import { SparklesIcon, CalendarIcon, FileTextIcon, ArrowRightIcon, UserStethoscopeIcon, FirstAidIcon } from '../components/Icons';

// A reusable card component for the dashboard
const DashboardCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 ${className}`}>
        {children}
    </div>
);

const DashboardPage: React.FC = () => {
  const { activeUser: user } = useAuth();
  const navigate = useNavigate();

  const handleSendMessage = (message: string) => {
    navigate('/ai-health-assistant', {
        state: { initialMessage: message }
    });
  };
  
  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
  };

  return (
    <div className="h-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{getGreeting()}, {user?.username}!</h1>
        <p className="text-lg text-gray-600 mb-8">Your personal health dashboard is ready.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Assistant Card - Main Feature */}
            <div className="relative flex flex-col justify-between h-full bg-gradient-to-br from-slate-900 to-gray-800 rounded-2xl p-6 text-white overflow-hidden shadow-lg lg:col-span-2">
                <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full filter blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl opacity-50"></div>
                
                <div className="z-10">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-8 h-8 text-teal-400" />
                        <h2 className="text-2xl font-bold">Chat with AURA</h2>
                    </div>
                    <p className="text-slate-300 mt-2 max-w-2xl">Your AI Health Assistant. Ask about symptoms, wellness, or medical terms.</p>
                </div>
                
                <div className="w-full mt-8 z-10">
                    <AIAssistantInput 
                        onSendMessage={handleSendMessage}
                        placeholder="Ask anything about your health..."
                        isInline={true}
                    />
                </div>
            </div>

            {/* Other Dashboard Cards */}
            <DashboardCard>
                <div className="flex items-center gap-3 mb-3">
                    <CalendarIcon className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-bold text-gray-800">Appointments</h3>
                </div>
                <p className="text-gray-600 mb-4">You have no upcoming appointments today. View your schedule or book a new one.</p>
                <Link to="/appointments" className="font-semibold text-sm text-blue-600 hover:underline flex items-center gap-1">
                    View Appointments <ArrowRightIcon className="w-4 h-4" />
                </Link>
            </DashboardCard>

            <DashboardCard>
                <div className="flex items-center gap-3 mb-3">
                    <FileTextIcon className="w-6 h-6 text-green-500" />
                    <h3 className="text-xl font-bold text-gray-800">My Health</h3>
                </div>
                <p className="text-gray-600 mb-4">Access your health records, view lab results, and track your wellness journey.</p>
                <Link to="/my-health" className="font-semibold text-sm text-green-600 hover:underline flex items-center gap-1">
                    Go to My Health <ArrowRightIcon className="w-4 h-4" />
                </Link>
            </DashboardCard>

            <DashboardCard>
                <div className="flex items-center gap-3 mb-3">
                    <UserStethoscopeIcon className="w-6 h-6 text-teal-500" />
                    <h3 className="text-xl font-bold text-gray-800">Find a Doctor</h3>
                </div>
                <p className="text-gray-600 mb-4">Browse our network of specialists and book an appointment with the right doctor for you.</p>
                <Link to="/doctors" className="font-semibold text-sm text-teal-600 hover:underline flex items-center gap-1">
                    See all doctors <ArrowRightIcon className="w-4 h-4" />
                </Link>
            </DashboardCard>

            <DashboardCard>
                <div className="flex items-center gap-3 mb-3">
                    <FirstAidIcon className="w-6 h-6 text-red-500" />
                    <h3 className="text-xl font-bold text-gray-800">First-Aid Guide</h3>
                </div>
                <p className="text-gray-600 mb-4">Get quick access to step-by-step guides for common medical emergencies.</p>
                <Link to="/first-aid-guide" className="font-semibold text-sm text-red-600 hover:underline flex items-center gap-1">
                    Open Guide <ArrowRightIcon className="w-4 h-4" />
                </Link>
            </DashboardCard>

        </div>
    </div>
  );
};

export default DashboardPage;