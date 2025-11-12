import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import { Appointment, Doctor, User } from '../../types';
import { ArrowRightIcon, CalendarIcon, UsersIcon, BriefcaseIcon, BellIcon, ActivityIcon, MessageSquareIcon } from '../../components/Icons';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; linkTo: string }> = ({ icon, title, value, linkTo }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
        <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">{icon}</div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
        <Link to={linkTo} className="font-semibold text-sm text-blue-600 hover:underline flex items-center gap-1 mt-4">
            View All <ArrowRightIcon className="w-4 h-4" />
        </Link>
    </div>
);

const ClinicianDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for new UI elements
  const alerts = [
    { text: "Lab results for John Doe are ready for review.", level: "high" },
    { text: "3 patients have appointments tomorrow.", level: "medium" },
    { text: "A new patient 'susan.chen' has registered.", level: "low" },
  ];
  const recentActivity = [
    { text: "You completed an appointment with Jane Smith.", icon: <CalendarIcon className="w-4 h-4 text-gray-500"/>, time: "2h ago" },
    { text: "Peter Jones scheduled a new consultation.", icon: <UsersIcon className="w-4 h-4 text-gray-500"/>, time: "5h ago" },
    { text: "Sent a message to John Doe.", icon: <MessageSquareIcon className="w-4 h-4 text-gray-500"/>, time: "1d ago" },
  ];


  useEffect(() => {
    const fetchData = async () => {
        if (!user) return;
        try {
            const [fetchedAppointments, fetchedPatients, fetchedDoctors] = await Promise.all([
                api.getAppointmentsForClinician(user.id),
                api.getPatients(),
                api.getDoctors(),
            ]);
            setAppointments(fetchedAppointments);
            setPatients(fetchedPatients);
            setDoctors(fetchedDoctors);
        } catch (error) {
            console.error("Failed to fetch clinician data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [user]);

  const todaysAppointments = useMemo(() => {
      return appointments.filter(app => new Date(app.date).toDateString() === new Date().toDateString() && app.status === 'upcoming');
  }, [appointments]);

  if (isLoading) {
      return <div>Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome, Dr. {user?.username}!</h1>
        <p className="text-lg text-gray-600">Here's a summary of your clinic's activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
            icon={<CalendarIcon className="w-6 h-6 text-blue-600"/>}
            title="Today's Appointments"
            value={todaysAppointments.length}
            linkTo="/clinician/appointments"
        />
        <StatCard 
            icon={<UsersIcon className="w-6 h-6 text-blue-600"/>}
            title="Total Patients"
            value={patients.length}
            linkTo="/clinician/patients"
        />
        <StatCard 
            icon={<BriefcaseIcon className="w-6 h-6 text-blue-600"/>}
            title="Total Doctors"
            value={doctors.length}
            linkTo="/clinician/doctors"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Schedule</h2>
          {todaysAppointments.length > 0 ? (
              <div className="space-y-4 max-h-[22rem] overflow-y-auto pr-2">
                  {todaysAppointments.map(app => (
                      <div key={app.id} className="p-4 rounded-lg bg-gray-50 border flex items-center justify-between hover:bg-gray-100">
                          <div>
                              <p className="font-semibold text-gray-700">{app.patient?.username}</p>
                              <p className="text-sm text-gray-500">{app.reason}</p>
                          </div>
                          <div className="text-right">
                             <p className="font-bold text-blue-600">{app.time}</p>
                             <p className="text-sm text-gray-500 capitalize">{app.type.replace('-', ' ')}</p>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="text-center py-10">
                <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2"/>
                <p className="text-gray-500 font-semibold">No appointments scheduled for today.</p>
              </div>
          )}
        </div>

        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-3"><BellIcon className="w-5 h-5"/> Alerts</h3>
                <div className="space-y-3">
                    {alerts.map((alert, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${alert.level === 'high' ? 'bg-red-500' : alert.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                            <p className="text-gray-600">{alert.text}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-3"><ActivityIcon className="w-5 h-5"/> Recent Activity</h3>
                 <div className="space-y-3">
                    {recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                            <div className="bg-gray-100 p-1.5 rounded-full">{activity.icon}</div>
                            <p className="text-gray-600 flex-grow">{activity.text}</p>
                            <span className="text-gray-400 text-xs">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicianDashboardPage;