

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    HomeIcon, 
    CalendarIcon, 
    FileTextIcon,
    HeartIcon,
    BookOpenIcon,
    MapPinIcon,
    SparklesIcon,
    StethoscopeIcon,
    UsersIcon,
    BrainCircuitIcon
} from './Icons';

const Sidebar: React.FC = () => {
    const commonLinkClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium";
    const activeLinkClass = "bg-teal-100 text-teal-700";
    const inactiveLinkClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

    return (
        <aside className="w-64 bg-white flex-shrink-0 flex flex-col border-r border-gray-200 p-4">
            <div className="px-2 pb-4">
                <NavLink to="/" className="flex items-center gap-2 text-xl font-bold text-teal-600">
                    <StethoscopeIcon className="w-8 h-8" />
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-gray-800">MediConnect</span>
                        <span className="text-xs font-medium text-gray-500">Patient Portal</span>
                    </div>
                </NavLink>
            </div>
            <nav className="flex-1 space-y-1.5">
                <NavLink to="/home" className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    <HomeIcon className="w-5 h-5" />
                    <span>Home</span>
                </NavLink>
                <NavLink to="/appointments" className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    <CalendarIcon className="w-5 h-5" />
                    <span>Appointments</span>
                </NavLink>
                <NavLink to="/ai-health-assistant" className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    <SparklesIcon className="w-5 h-5" />
                    <span>AI Health Assistant</span>
                </NavLink>
                <NavLink to="/my-health" className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    <FileTextIcon className="w-5 h-5" />
                    <span>My Health</span>
                </NavLink>
                <NavLink to="/family-access" className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    <UsersIcon className="w-5 h-5" />
                    <span>Family Access</span>
                </NavLink>
                <NavLink to="/first-aid-guide" className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    <HeartIcon className="w-5 h-5" />
                    <span>First-Aid Guide</span>
                </NavLink>
                <NavLink to="/find-nearby-care" className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    <MapPinIcon className="w-5 h-5" />
                    <span>Find Nearby Care</span>
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;