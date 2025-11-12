import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAppointmentsForUser } from '../services/api';
import { Appointment } from '../types';
import BookingModal from '../components/BookingModal';
import { PlusIcon } from '../components/Icons';

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
    const tag = appointment.status === 'upcoming' ? appointment.type : appointment.status;
    const tagColor = tag === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600';

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 w-full space-y-2">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800">Dr. {appointment.doctor.name}</h3>
                <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-md ${tagColor}`}>
                    {tag.replace('-', ' ')}
                </span>
            </div>
            <p className="text-sm text-gray-500">{new Date(appointment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {appointment.time}</p>
            <p className="text-sm text-gray-700">{appointment.reason}</p>
        </div>
    );
};

const AppointmentsPage: React.FC = () => {
    const { activeUser } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const fetchAppointments = async () => {
        if (!activeUser) return;
        setIsLoading(true);
        try {
            const userAppointments = await getAppointmentsForUser(activeUser.id);
            setAppointments(userAppointments);
        } catch (error) {
            console.error("Failed to fetch appointments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [activeUser]);

    const { upcomingAppointments, pastAppointments } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        
        const upcoming = appointments.filter(app => new Date(app.date) >= today && app.status === 'upcoming');
        const past = appointments.filter(app => new Date(app.date) < today || app.status !== 'upcoming');
        
        return { upcomingAppointments: upcoming, pastAppointments: past };
    }, [appointments]);

    const handleBookingSuccess = () => {
        setIsBookingModalOpen(false);
        alert('Appointment booked successfully!');
        fetchAppointments();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
                <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Book New
                </button>
            </div>

            {isLoading ? (
                <p>Loading appointments...</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upcoming Appointments */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700">Upcoming</h2>
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map(app => <AppointmentCard key={app.id} appointment={app} />)
                        ) : (
                            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center text-gray-500">
                                No upcoming appointments.
                            </div>
                        )}
                    </div>

                    {/* Past Appointments */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700">Past Appointments</h2>
                        {pastAppointments.length > 0 ? (
                            pastAppointments.map(app => <AppointmentCard key={app.id} appointment={app} />)
                        ) : (
                            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center text-gray-500">
                                No past appointments.
                            </div>
                        )}
                    </div>
                </div>
            )}

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onBookingSuccess={handleBookingSuccess}
            />
        </div>
    );
};

export default AppointmentsPage;