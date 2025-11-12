import React, { useState, useEffect } from 'react';
import { getDoctors } from '../services/api';
import { Doctor } from '../types';
import BookingModal from '../components/BookingModal';

const DoctorsListPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const fetchedDoctors = await getDoctors();
        setDoctors(fetchedDoctors);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleOpenModal = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setIsModalOpen(true);
  };

  const handleBookingSuccess = () => {
    setIsModalOpen(false);
    alert('Appointment booked successfully!');
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Find Your Doctor</h1>
      <p className="text-lg text-gray-600 mb-8">Browse our network of specialists.</p>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-md border animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-3">
                           <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                           <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doctor => (
            <div key={doctor.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-teal-300 transition-all transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <img src={doctor.avatarUrl} alt={doctor.name} className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-teal-100" />
                <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                <p className="text-teal-600 font-semibold mb-3">{doctor.specialization}</p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {doctor.availability.map(day => (
                    <span key={day} className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">{day}</span>
                  ))}
                </div>
                <button 
                  onClick={() => handleOpenModal(doctor.id)}
                  className="mt-2 w-full bg-teal-600 text-white font-semibold py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <BookingModal 
        isOpen={isModalOpen}
        initialDoctorId={selectedDoctorId} 
        onClose={() => setIsModalOpen(false)}
        onBookingSuccess={handleBookingSuccess} 
      />
    </div>
  );
};

export default DoctorsListPage;