import React, { useState, useEffect } from 'react';
import { getDoctors } from '../../services/api';
import { Doctor } from '../../types';

const ClinicianDoctorsListPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Clinic Doctors</h1>
      <p className="text-lg text-gray-600 mb-8">Directory of all healthcare professionals.</p>
      
      {isLoading ? (
        <p>Loading doctors...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doctor => (
            <div key={doctor.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex flex-col items-center text-center">
                <img src={doctor.avatarUrl} alt={doctor.name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-100" />
                <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{doctor.specialization}</p>
                <div className="border-t border-gray-200 w-full pt-4 mt-2">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Availability</p>
                    <div className="flex flex-wrap justify-center gap-2">
                    {doctor.availability.map(day => (
                        <span key={day} className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">{day}</span>
                    ))}
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClinicianDoctorsListPage;
