

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import { User, Appointment } from '../../types';
import { UsersIcon, UserStethoscopeIcon, CalendarIcon, UserCircleIcon } from '../../components/Icons';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; change?: string; }> = ({ icon, title, value, change }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-full">{icon}</div>
        </div>
        {change && <p className="text-xs text-green-600 mt-2">{change}</p>}
    </div>
);

const BarChart: React.FC<{ data: { label: string, value: number }[]; title: string; }> = ({ data, title }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <div className="flex-grow flex items-end gap-2">
            {data.map((item, index) => {
                const max = Math.max(...data.map(d => d.value), 1);
                const height = `${(item.value / max) * 100}%`;
                return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="text-xs font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity -mt-6">
                            {item.value}
                        </div>
                        <div className="w-full h-full bg-slate-200 rounded-t-md overflow-hidden flex items-end">
                            <div className="w-full bg-slate-600 group-hover:bg-slate-800 transition-colors" style={{ height }}></div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                    </div>
                );
            })}
        </div>
    </div>
);

const PieChart: React.FC<{ data: { label: string, value: number, color: string }[]; title: string; }> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;
    const gradients = data.map(item => {
        const percentage = (item.value / total) * 360;
        const start = cumulative;
        const end = cumulative + percentage;
        cumulative = end;
        return `${item.color} ${start}deg ${end}deg`;
    });
    const conicGradient = `conic-gradient(${gradients.join(', ')})`;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
            <div className="flex-grow flex items-center justify-center gap-6">
                <div className="w-36 h-36 rounded-full" style={{ background: conicGradient }}></div>
                <div className="space-y-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm font-medium text-gray-600">{item.label} ({((item.value / total) * 100).toFixed(0)}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        if (!user) return;
        try {
            const [fetchedUsers, fetchedAppointments] = await Promise.all([
                api.getAllUsers(),
                api.getAllAppointments(),
            ]);
            setUsers(fetchedUsers);
            setAppointments(fetchedAppointments);
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [user]);

  const stats = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const newUsersLastMonth = users.filter(u => new Date(u.lastLogin) > lastMonth).length;
    return {
        totalUsers: users.length,
        totalPatients: users.filter(u => u.role === 'patient').length,
        totalClinicians: users.filter(u => u.role === 'clinician').length,
        totalAppointments: appointments.length,
        newUsersChange: `+${newUsersLastMonth} in last 30 days`
    };
  }, [users, appointments]);

  const appointmentTrends = useMemo(() => {
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const counts = [12, 19, 3, 5, 2, 3]; // Mock data
    return monthLabels.map((label, index) => ({ label, value: counts[index] }));
  }, [appointments]);

  const roleDistribution = useMemo(() => [
        { label: 'Patients', value: stats.totalPatients, color: '#38bdf8' },
        { label: 'Clinicians', value: stats.totalClinicians, color: '#4f46e5' },
        { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#64748b' }
  ], [stats, users]);


  if (isLoading) {
      return <div>Loading dashboard...</div>
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Analytics</h1>
      <p className="text-lg text-gray-600 mb-8">Platform overview and statistics.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            icon={<UsersIcon className="w-6 h-6 text-slate-600"/>}
            title="Total Users"
            value={stats.totalUsers}
            change={stats.newUsersChange}
        />
        <StatCard 
            icon={<UserCircleIcon className="w-6 h-6 text-slate-600"/>}
            title="Total Patients"
            value={stats.totalPatients}
        />
        <StatCard 
            icon={<UserStethoscopeIcon className="w-6 h-6 text-slate-600"/>}
            title="Total Clinicians"
            value={stats.totalClinicians}
        />
        <StatCard 
            icon={<CalendarIcon className="w-6 h-6 text-slate-600"/>}
            title="Total Appointments"
            value={stats.totalAppointments}
        />
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <BarChart data={appointmentTrends} title="Appointment Trends (Last 6 Months)" />
        </div>
        <div>
            <PieChart data={roleDistribution} title="User Role Distribution" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;