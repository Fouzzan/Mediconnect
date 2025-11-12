import React, { useState } from 'react';
import { PhoneIcon, FirstAidIcon, XIcon } from './Icons';

interface EmergencyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
    const [showGuidance, setShowGuidance] = useState(false);
    
    if (!isOpen) return null;

    const handleClose = () => {
        setShowGuidance(false);
        onClose();
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all text-center">
                <div className="p-6 border-b border-gray-200 relative">
                    <h2 className="text-2xl font-bold text-gray-800">Emergency Assistance</h2>
                    <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {showGuidance ? (
                        <div>
                             <h3 className="text-xl font-semibold text-gray-800 mb-2">Basic First Aid</h3>
                             <div className="text-left space-y-2 text-gray-600">
                                <p><strong>1. Check for safety:</strong> Ensure the area is safe for you and the injured person.</p>
                                <p><strong>2. Check for response:</strong> Ask loudly, "Are you okay?" and gently shake their shoulder.</p>
                                <p><strong>3. Call for help:</strong> If there is no response, call emergency services immediately.</p>
                                <p><strong>4. For bleeding:</strong> Apply firm, direct pressure to the wound with a clean cloth.</p>
                             </div>
                             <button onClick={() => setShowGuidance(false)} className="mt-4 text-teal-600 font-semibold hover:underline">
                                Back to options
                             </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600">If you are in a life-threatening situation, please call your local emergency number immediately.</p>
                            <a
                                href="tel:911" // In a real app, this might be localized.
                                className="w-full flex items-center justify-center gap-3 bg-red-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-red-700 transition-colors text-lg"
                            >
                                <PhoneIcon className="w-6 h-6" />
                                Call Emergency Services
                            </a>
                            <button
                                onClick={() => setShowGuidance(true)}
                                className="w-full flex items-center justify-center gap-3 bg-slate-100 text-gray-700 font-bold py-4 px-4 rounded-lg hover:bg-slate-200 transition-colors text-lg"
                            >
                                <FirstAidIcon className="w-6 h-6" />
                                First Aid Guidance
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmergencyModal;
