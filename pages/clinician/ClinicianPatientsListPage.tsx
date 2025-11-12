import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatients } from '../../services/api';
import { User } from '../../types';
import { MailIcon, UserCircleIcon, ArrowRightIcon } from '../../components/Icons';

const ClinicianPatientsListPage: React.FC = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const fetchedPatients = await getPatients();
        setPatients(fetchedPatients);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Patient Directory</h1>
      <p className="text-lg text-gray-600 mb-8">List of all registered patients.</p>
      
      {isLoading ? (
        <p>Loading patients...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Patient Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Face ID</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map(patient => (
                            <tr key={patient.id} className="bg-white border-b hover:bg-gray-50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center gap-2">
                                    <UserCircleIcon className="w-5 h-5 text-gray-400"/>
                                    {patient.username}
                                </th>
                                <td className="px-6 py-4 flex items-center gap-2">
                                     <MailIcon className="w-4 h-4 text-gray-400"/>
                                     {patient.email}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${patient.faceIdEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {patient.faceIdEnabled ? 'Enabled' : 'Disabled'}
                                   </span>
                                </td>
                                <td className="px-6 py-4">
                                    <Link 
                                        to={`/clinician/patients/${patient.id}`}
                                        className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        View Profile <ArrowRightIcon className="w-4 h-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClinicianPatientsListPage;