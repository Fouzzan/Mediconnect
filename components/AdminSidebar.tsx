

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboardIcon, 
    UsersIcon,
    CogIcon,
    StethoscopeIcon,
    ShieldCheckIcon
} from './Icons';

const AdminSidebar: React.FC = () => {
    const commonLinkClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium";
    const activeLinkClass = "bg-slate-200 text-slate-800";
    const inactiveLinkClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

    return (
        <aside className="w-64 bg-white flex-shrink-0 flex flex-col border-r border-gray-200 p-4">
            <div className="px-2 pb-4">
                <NavLink to="/admin/home" className="flex items-center gap-2 text-xl font-bold text-slate-600">
                    <StethoscopeIcon className="w-8 h-8" />
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-gray-800">MediConnect</span>
                        <span className="text-xs font-medium text-gray-500">Admin Portal</span>
                    </div>
                </NavLink>
            </div>
            <nav className="flex-1 space-y-1.5">
                <NavLink to="/admin/home" className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    <LayoutDashboardIcon className="w-5 h-5" />
                    <span>Analytics</span>
                </NavLink>
                <NavLink to="/admin/user-management" className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    <UsersIcon className="w-5 h-5" />
                    <span>User Management</span>
                </NavLink>
                 <NavLink to="/admin/platform-health" className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Platform Health</span>
                </NavLink>
                <NavLink to="/admin/settings" className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                    <CogIcon className="w-5 h-5" />
                    <span>Settings</span>
                </NavLink>
            </nav>
        </aside>
    );
};

export default AdminSidebar;