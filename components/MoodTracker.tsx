import React, { useState } from 'react';

const moods = [
    { name: 'Happy', emoji: '😊', color: 'bg-green-100 text-green-800' },
    { name: 'Calm', emoji: '😌', color: 'bg-blue-100 text-blue-800' },
    { name: 'Okay', emoji: '😐', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Sad', emoji: '😢', color: 'bg-indigo-100 text-indigo-800' },
    { name: 'Anxious', emoji: '😟', color: 'bg-purple-100 text-purple-800' },
];

const MoodTracker: React.FC = () => {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    const handleMoodSelect = (moodName: string) => {
        setSelectedMood(moodName);
    };

    return (
        <div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-1">How are you feeling today?</h3>
            <p className="text-gray-500 mb-4">Select a mood to log it for today.</p>

            <div className="flex flex-wrap justify-center gap-4">
                {moods.map(mood => (
                    <button
                        key={mood.name}
                        onClick={() => handleMoodSelect(mood.name)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 w-24 transition-all transform hover:scale-105 ${
                            selectedMood === mood.name ? 'border-teal-500 bg-teal-50' : 'border-transparent hover:bg-slate-100'
                        }`}
                    >
                        <span className="text-4xl">{mood.emoji}</span>
                        <span className="text-sm font-medium text-gray-700">{mood.name}</span>
                    </button>
                ))}
            </div>
            
            {selectedMood && (
                 <div className="mt-6 text-center bg-slate-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-700">
                        You've logged your mood as <span className={`font-bold ${moods.find(m => m.name === selectedMood)?.color}`}>{selectedMood}</span>. Keep up the great work!
                    </p>
                </div>
            )}
        </div>
    );
};

export default MoodTracker;