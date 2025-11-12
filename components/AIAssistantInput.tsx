

import React, { useState, useRef } from 'react';
import { SparklesIcon, ArrowRightIcon, PaperclipIcon, XIcon } from './Icons';

interface AIAssistantInputProps {
    onSendMessage: (message: string) => void;
    placeholder: string;
    isInline?: boolean;
    onImageSelect?: (file: File) => void;
    imagePreview?: string | null;
    onClearImage?: () => void;
}

const AIAssistantInput: React.FC<AIAssistantInputProps> = ({ 
    onSendMessage, 
    placeholder, 
    isInline = false,
    onImageSelect,
    imagePreview,
    onClearImage
}) => {
    const [userInput, setUserInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Allow sending image with empty message
        if (!userInput.trim() && !imagePreview) return;
        onSendMessage(userInput);
        setUserInput('');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onImageSelect) {
            onImageSelect(file);
        }
    };
    
    if (isInline) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl">
                {imagePreview && (
                    <div className="p-2 border-b border-slate-700/50">
                        <div className="relative w-24">
                            <img src={imagePreview} alt="upload preview" className="rounded-md h-24 w-24 object-cover"/>
                            <button 
                                onClick={onClearImage}
                                className="absolute -top-2 -right-2 bg-slate-900 rounded-full p-0.5 text-white hover:bg-slate-700"
                                aria-label="Remove image"
                            >
                                <XIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="relative flex items-center p-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-slate-400 hover:text-white"
                        aria-label="Attach image"
                    >
                        <PaperclipIcon className="w-6 h-6"/>
                    </button>
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-transparent text-white placeholder-slate-400 text-lg border-none focus:ring-0 p-2"
                        aria-label={placeholder}
                    />
                    <button
                        type="submit"
                        disabled={!userInput.trim() && !imagePreview}
                        className="bg-teal-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        aria-label="Send message"
                    >
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        );
    }
    
    // Non-inline version remains unchanged for now, but could be adapted similarly.
    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
            <div className="relative">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-full border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-3 pl-4 pr-12"
                />
                <button
                    type="submit"
                    disabled={!userInput.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-teal-700 transition-colors disabled:bg-teal-300"
                    aria-label="Send message"
                >
                    <ArrowRightIcon className="w-4 h-4" />
                </button>
            </div>
        </form>
    );
};

export default AIAssistantInput;