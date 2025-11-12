



import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DoctorsListPage from './pages/DoctorsListPage';
import ProfilePage from './pages/ProfilePage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import Sidebar from './components/Sidebar';
import EmergencyButton from './components/EmergencyButton';
import AppointmentsPage from './pages/AppointmentsPage';
import MyRecordsPage from './pages/MyRecordsPage';
import FirstAidGuidePage from './pages/FirstAidGuidePage';
import HealthWellnessHubPage from './pages/HealthWellnessHubPage';
import FindNearbyCarePage from './pages/FindNearbyCarePage';
import SelectRolePage from './pages/SelectRolePage';
import ClinicianSidebar from './components/ClinicianSidebar';
import ClinicianDashboardPage from './pages/clinician/ClinicianDashboardPage';
import ClinicianAppointmentsPage from './pages/clinician/ClinicianAppointmentsPage';
import ClinicianDoctorsListPage from './pages/clinician/ClinicianDoctorsListPage';
import ClinicianPatientsListPage from './pages/clinician/ClinicianPatientsListPage';
import AdminSidebar from './components/AdminSidebar';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ClinicianPatientDetailPage from './pages/clinician/ClinicianPatientDetailPage';
import AIAssistantWidget from './components/AIAssistantWidget';
import FamilyAccessPage from './pages/FamilyAccessPage';
import AdminUserManagementPage from './pages/admin/AdminUserManagementPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminPlatformHealthPage from './pages/admin/AdminPlatformHealthPage';


const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
    </div>
);

const RoleBasedProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Handle the special case of the select-role page first.
  if (location.pathname === '/select-role') {
      if (user && user.role === null) {
          return <>{children}</>; // User needs to select a role, allow access.
      } else {
          // User already has a role, or something is wrong. Redirect them away.
          if (user?.role === 'patient') return <Navigate to="/home" replace />;
          if (user?.role === 'clinician') return <Navigate to="/clinician/home" replace />;
          if (user?.role === 'admin') return <Navigate to="/admin/home" replace />;
          return <Navigate to="/" replace />;
      }
  }

  // For all other pages:
  // If user has no role, they must be sent to select one.
  if (user && user.role === null) {
    return <Navigate to="/select-role" replace />;
  }

  // If user has a role, check if it's allowed.
  if (user && user.role && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // If role is defined but not allowed for this page, redirect to their default dashboard.
  if (user && user.role) {
      if (user.role === 'patient') return <Navigate to="/home" replace />;
      if (user.role === 'clinician') return <Navigate to="/clinician/home" replace />;
      if (user.role === 'admin') return <Navigate to="/admin/home" replace />;
  }
  
  return <Navigate to="/" replace />; // Fallback
};

const AuthRedirect: React.FC = () => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return null;

    if (isAuthenticated && user?.role && ['/login', '/register'].includes(location.pathname)) {
        if (user.role === 'patient') return <Navigate to="/home" replace />;
        if (user.role === 'clinician') return <Navigate to="/clinician/home" replace />;
        if (user.role === 'admin') return <Navigate to="/admin/home" replace />;
    }

    if (isAuthenticated && !user?.role && location.pathname !== '/select-role') {
        return <Navigate to="/select-role" replace />;
    }
    
    return null;
}

const AppContent: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

     useEffect(() => {
        if (isAuthenticated && user?.role === null && location.pathname !== '/select-role') {
            navigate('/select-role', { replace: true });
        }
    }, [isAuthenticated, user, location, navigate]);
    
    const renderSidebar = () => {
        if (!isAuthenticated || !user?.role) return null;
        switch(user.role) {
            case 'patient': return <Sidebar />;
            case 'clinician': return <ClinicianSidebar />;
            case 'admin': return <AdminSidebar />;
            default: return null;
        }
    };

    const isPortalActive = isAuthenticated && !!user?.role;

    const isPatientPortal = isAuthenticated && user?.role === 'patient';
    const isAIAssistantPage = location.pathname === '/ai-health-assistant';
    const isDashboardPage = location.pathname === '/home';
    const showFloatingWidget = isPatientPortal && !isAIAssistantPage && !isDashboardPage;
    
    const mainPadding = isAIAssistantPage ? 'p-0' : 'p-6 md:p-8';

    return (
        <>
            <AuthRedirect />
            <div className={isPortalActive ? "flex h-screen bg-gray-50" : ""}>
                {renderSidebar()}
                <div className={`flex-1 flex flex-col ${isPortalActive ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
                    <Header />
                    <main className={`flex-grow ${isPortalActive ? `${mainPadding} overflow-y-auto` : 'container mx-auto px-4 py-8'}`}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            
                            <Route path="/select-role" element={<RoleBasedProtectedRoute allowedRoles={['patient', 'clinician', 'admin']}><SelectRolePage /></RoleBasedProtectedRoute>} />

                            {/* Patient Routes */}
                            <Route path="/home" element={<RoleBasedProtectedRoute allowedRoles={['patient']}><DashboardPage /></RoleBasedProtectedRoute>} />
                            <Route path="/appointments" element={<RoleBasedProtectedRoute allowedRoles={['patient']}><AppointmentsPage /></RoleBasedProtectedRoute>} />
                            <Route path="/my-health" element={<RoleBasedProtectedRoute allowedRoles={['patient']}><ProfilePage /></RoleBasedProtectedRoute>} />
                            <Route path="/first-aid-guide" element={<RoleBasedProtectedRoute allowedRoles={['patient']}><FirstAidGuidePage /></RoleBasedProtectedRoute>} />
                            <Route path="/find-nearby-care" element={<RoleBasedProtectedRoute allowedRoles={['patient']}><FindNearbyCarePage /></RoleBasedProtectedRoute>} />
                            {/* FIX: Corrected typo in component name. */}
                            <Route path="/doctors" element={<RoleBasedProtectedRoute allowedRoles={['patient']}><DoctorsListPage /></RoleBasedProtectedRoute>} />
                            <Route path="/ai-health-assistant" element={<RoleBasedProtectedRoute allowedRoles={['patient']}><SymptomCheckerPage /></RoleBasedProtectedRoute>} />
                            <Route path="/family-access" element={<RoleBasedProtectedRoute allowedRoles={['patient']}><FamilyAccessPage /></RoleBasedProtectedRoute>} />


                            {/* Clinician Routes */}
                            <Route path="/clinician/home" element={<RoleBasedProtectedRoute allowedRoles={['clinician']}><ClinicianDashboardPage /></RoleBasedProtectedRoute>} />
                            <Route path="/clinician/appointments" element={<RoleBasedProtectedRoute allowedRoles={['clinician']}><ClinicianAppointmentsPage /></RoleBasedProtectedRoute>} />
                            <Route path="/clinician/doctors" element={<RoleBasedProtectedRoute allowedRoles={['clinician']}><ClinicianDoctorsListPage /></RoleBasedProtectedRoute>} />
                            <Route path="/clinician/patients" element={<RoleBasedProtectedRoute allowedRoles={['clinician']}><ClinicianPatientsListPage /></RoleBasedProtectedRoute>} />
                            <Route path="/clinician/patients/:patientId" element={<RoleBasedProtectedRoute allowedRoles={['clinician']}><ClinicianPatientDetailPage /></RoleBasedProtectedRoute>} />

                             {/* Admin Routes */}
                            <Route path="/admin/home" element={<RoleBasedProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></RoleBasedProtectedRoute>} />
                            <Route path="/admin/user-management" element={<RoleBasedProtectedRoute allowedRoles={['admin']}><AdminUserManagementPage /></RoleBasedProtectedRoute>} />
                            <Route path="/admin/settings" element={<RoleBasedProtectedRoute allowedRoles={['admin']}><AdminSettingsPage /></RoleBasedProtectedRoute>} />
                            <Route path="/admin/platform-health" element={<RoleBasedProtectedRoute allowedRoles={['admin']}><AdminPlatformHealthPage /></RoleBasedProtectedRoute>} />

                        </Routes>
                    </main>
                </div>
                {user?.role === 'patient' && <EmergencyButton />}
                {showFloatingWidget && <AIAssistantWidget />}
            {/* FIX: Added missing closing tag for the div element. */}
            </div>
        </>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;