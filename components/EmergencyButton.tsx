import React, { useState } from 'react';
import { PhoneIcon } from './Icons';
import EmergencyModal from './EmergencyModal';

const EmergencyButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 bg-red-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-transform transform hover:scale-110 z-40"
                aria-label="Emergency Assistance"
            >
                <PhoneIcon className="w-8 h-8" />
            </button>
            <EmergencyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default EmergencyButton;
