

import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StethoscopeIcon, LogOutIcon, ChevronDownIcon, UserCircleIcon, UserIcon } from './Icons';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user, activeUser, switchView } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  const portalName = user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal` : 'Mediconnect';
  
  const currentUser = activeUser || user;

  const handleSwitchView = (id: string | null) => {
    switchView(id);
    setIsSwitcherOpen(false);
  };


  return (
    <header className={`bg-white ${isAuthenticated ? 'border-b border-slate-200' : 'shadow-sm'}`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <NavLink to={user?.role === 'patient' ? '/home' : user?.role === 'clinician' ? '/clinician/home' : '/'} className="flex items-center gap-2 text-xl font-bold text-teal-600">
          <StethoscopeIcon className="w-8 h-8" />
           <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-800">MediConnect</span>
              {user?.role && <span className="text-xs font-medium text-gray-500">{portalName}</span>}
          </div>
        </NavLink>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
               {/* Profile Switcher */}
              {user?.caringFor && user.caringFor.length > 0 && user.role === 'patient' && (
                <div className="relative">
                  <button onClick={() => setIsSwitcherOpen(!isSwitcherOpen)} className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 p-2 rounded-lg">
                    <span>Viewing: <strong>{currentUser?.username}</strong></span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isSwitcherOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border animate-in fade-in-0 zoom-in-95">
                      <div
                        onClick={() => handleSwitchView(null)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        <UserCircleIcon className="w-5 h-5"/> My Profile
                      </div>
                      <div className="border-t my-1"></div>
                      <div className="px-4 py-1 text-xs text-gray-500 font-semibold">CARING FOR</div>
                      {user.caringFor.map(patient => (
                        <div
                          key={patient.userId}
                          onClick={() => handleSwitchView(patient.userId)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                           <UserIcon className="w-5 h-5"/> {patient.username}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <span className="text-gray-700 hidden sm:inline">Welcome, {user?.username}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                <LogOutIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-gray-600 hover:text-teal-600 transition-colors">Login</NavLink>
              <NavLink to="/register" className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;