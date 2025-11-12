import React, { useState, useEffect } from 'react';
import { Doctor } from '../types';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { CalendarIcon, XIcon, ClockIcon } from './Icons';

const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBookingSuccess: () => void;
    initialDoctorId?: string | null;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onBookingSuccess, initialDoctorId }) => {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [reason, setReason] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const fetchedDoctors = await api.getDoctors();
                setDoctors(fetchedDoctors);
            } catch (err) {
                setError("Could not load doctor's list.");
            }
        };
        if (isOpen) {
          fetchDoctors();
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (isOpen) {
            setSelectedDoctorId(initialDoctorId || '');
            setSelectedDate('');
            setSelectedTime('');
            setReason('');
            setError('');
        }
    }, [isOpen, initialDoctorId]);

    const handleBooking = async () => {
        if (!selectedDoctorId || !selectedDate || !selectedTime) {
            setError('Please select a doctor, date, and time.');
            return;
        }
        if (!user) {
            setError('You must be logged in to book an appointment.');
            return;
        }
        setError('');
        setIsBooking(true);
        try {
            await api.bookAppointment(user.id, selectedDoctorId, selectedDate, selectedTime, reason);
            onBookingSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to book appointment.');
        } finally {
            setIsBooking(false);
        }
    };

    if (!isOpen) return null;
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Book New Appointment</h2>
                        <p className="text-sm text-gray-500">Schedule an appointment with one of our healthcare providers.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Select Doctor */}
                    <div>
                        <label htmlFor="doctor" className="block text-sm font-bold text-gray-700 mb-1">Select Doctor</label>
                        <select
                            id="doctor"
                            value={selectedDoctorId}
                            onChange={(e) => setSelectedDoctorId(e.target.value)}
                            className="block w-full rounded-lg border border-blue-400 p-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="" disabled>Choose a doctor</option>
                            {doctors.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Select Date */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-1">Select Date</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                id="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]} // Disable past dates
                                className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                                placeholder="Pick a date"
                            />
                        </div>
                    </div>

                    {/* Select Time */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Time</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {timeSlots.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${selectedTime === time ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'}`}
                                >
                                    <ClockIcon className="w-4 h-4" />
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reason for Visit */}
                    <div>
                        <label htmlFor="reason" className="block text-sm font-bold text-gray-700 mb-1">Reason for Visit</label>
                        <textarea
                            id="reason"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                            placeholder="Please describe the reason for your appointment..."
                        />
                    </div>

                    {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                </div>

                <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end items-center gap-3">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBooking}
                        type="button"
                        disabled={isBooking || !selectedDoctorId || !selectedDate || !selectedTime}
                        className="px-6 py-2.5 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                        {isBooking ? 'Booking...' : 'Book Appointment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;