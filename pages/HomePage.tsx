

import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRightIcon } from '../components/Icons';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated && user?.role) {
    if (user.role === 'patient') return <Navigate to="/home" replace />;
    if (user.role === 'clinician') return <Navigate to="/clinician/home" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/home" replace />;
  }

  if (isAuthenticated && !user?.role) {
      return <Navigate to="/select-role" replace />;
  }

  return (
    <div className="text-center py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Welcome to <span className="text-teal-600">Mediconnect</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Your health, simplified. Securely connect with top doctors, manage appointments, and take control of your healthcare journey with state-of-the-art Face ID authentication.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <>
              <Link
                to="/register"
                className="inline-flex items-center justify-center w-full sm:w-auto bg-teal-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-teal-700 transition-transform transform hover:-translate-y-1"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full sm:w-auto bg-white text-teal-600 font-semibold px-8 py-3 rounded-lg shadow-lg ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-transform transform hover:-translate-y-1"
              >
                Login to Your Account
              </Link>
            </>
        </div>
      </div>
      
      <div className="mt-16 px-4">
        <img 
          src="..\Assets\Images\Medi-connect dashboard overview.png"
          alt="Mediconnect Dashboard Preview"
          className="mx-auto rounded-xl shadow-2xl ring-1 ring-gray-900/10 max-w-5xl w-full"
        />
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Secure Face ID Login</h3>
            <p className="mt-2 text-gray-600">Passwordless, secure, and instant access to your health portal using your face.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Find Top Doctors</h3>
            <p className="mt-2 text-gray-600">Browse profiles of specialized doctors and find the right one for your needs.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Easy Appointments</h3>
            <p className="mt-2 text-gray-600">Book, reschedule, or cancel your appointments with just a few clicks.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;