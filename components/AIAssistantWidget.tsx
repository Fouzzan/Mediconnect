
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AIAssistantInput from './AIAssistantInput';
import { SparklesIcon, XIcon } from './Icons';

const AIAssistantWidget: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const handleSendMessage = (message: string) => {
        navigate('/ai-health-assistant', {
            state: { initialMessage: message }
        });
        setIsExpanded(false);
    };

    return (
        <div className="fixed bottom-6 right-24 z-40">
            {isExpanded ? (
                <div 
                    className="rounded-xl shadow-2xl w-80 overflow-hidden animate-in fade-in-0 slide-in-from-bottom-5 p-0.5"
                    style={{ background: 'linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 12%, rgba(0, 212, 255, 1) 81%)' }}
                >
                    <div className="bg-white rounded-[10px] overflow-hidden">
                        <header className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-teal-600" />
                                <h3 className="font-semibold text-gray-800">AI Health Assistant</h3>
                            </div>
                            <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-gray-600">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </header>
                        <AIAssistantInput 
                            onSendMessage={handleSendMessage}
                            placeholder="Ask a health question..."
                        />
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="animated-gradient-border text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-transform transform hover:scale-110"
                    aria-label="Open AI Health Assistant"
                >
                    <SparklesIcon className="w-8 h-8" />
                </button>
            )}
        </div>
    );
};

export default AIAssistantWidget;