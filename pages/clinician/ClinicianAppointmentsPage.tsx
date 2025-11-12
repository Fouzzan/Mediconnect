import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAppointmentsForClinician } from '../../services/api';
import { Appointment } from '../../types';
import CalendarView from '../../components/CalendarView';
import { CalendarIcon, ClockIcon } from '../../components/Icons';

const ClinicianAppointmentsPage: React.FC = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const clinicianAppointments = await getAppointmentsForClinician(user.id);
                setAppointments(clinicianAppointments);
            } catch (error) {
                console.error("Failed to fetch appointments:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppointments();
    }, [user]);

    const calendarEvents = useMemo(() => {
        const eventMap = new Map<string, number>();
        appointments.forEach(app => {
            eventMap.set(app.date, (eventMap.get(app.date) || 0) + 1);
        });
        return Array.from(eventMap.entries()).map(([date, count]) => ({
            date,
            title: `${count} appointment${count > 1 ? 's' : ''}`
        }));
    }, [appointments]);

    const selectedDayAppointments = useMemo(() => {
        const timeToMinutes = (time: string) => {
            const [timePart, meridiem] = time.split(' ');
            let [hours, minutes] = timePart.split(':').map(Number);
            if (meridiem === 'PM' && hours !== 12) hours += 12;
            if (meridiem === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        return appointments
            .filter(app => app.date === selectedDate)
            .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    }, [appointments, selectedDate]);

    const formattedSelectedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Appointments Schedule</h1>
            
            {isLoading ? (
                <p>Loading schedule...</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow min-h-0">
                    <div className="lg:col-span-2 h-full">
                        <CalendarView 
                            events={calendarEvents}
                            onDateClick={setSelectedDate}
                            selectedDate={selectedDate}
                        />
                    </div>

                    <div className="lg:col-span-1 bg-white p-4 rounded-xl border border-gray-200 h-full flex flex-col">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-4 border-b border-gray-200">
                           Schedule for <br/> <span className="text-blue-600">{formattedSelectedDate}</span>
                        </h2>
                        <div className="flex-grow overflow-y-auto pr-2">
                           {selectedDayAppointments.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedDayAppointments.map((app, index) => (
                                        <div key={app.id} className="flex gap-4">
                                            {/* Timeline */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <div className={`flex-grow w-px bg-gray-300 ${index === selectedDayAppointments.length - 1 ? 'hidden' : ''}`}></div>
                                            </div>
                                            {/* Card */}
                                            <div className="pb-4 flex-1">
                                                <p className="font-bold text-blue-600 -mt-1">{app.time}</p>
                                                <div className="p-3 mt-1 rounded-lg bg-blue-50 border border-blue-200">
                                                    <p className="font-semibold text-gray-800">{app.patient?.username}</p>
                                                    <p className="text-sm text-gray-600">{app.reason}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                           ) : (
                                <div className="text-center text-gray-500 py-10 flex flex-col items-center justify-center h-full">
                                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2"/>
                                    <p className="font-semibold">No Appointments</p>
                                    <p className="text-sm">No appointments scheduled for this day.</p>
                                </div>
                           )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicianAppointmentsPage;