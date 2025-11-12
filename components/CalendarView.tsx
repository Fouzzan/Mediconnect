import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarEvent {
    date: string; // YYYY-MM-DD
    title: string;
}

interface CalendarViewProps {
    events?: CalendarEvent[];
    onDateClick?: (date: string) => void;
    selectedDate?: string;
    availableDays?: string[]; // e.g., ['Mon', 'Wed', 'Fri']
}

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

const CalendarView: React.FC<CalendarViewProps> = ({ events = [], onDateClick, selectedDate, availableDays }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const daysInMonth = endOfMonth.getDate();

    const days = [];
    // Previous month's days
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`prev-${i}`} className="p-2 border border-gray-200 bg-gray-50"></div>);
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateString = date.toISOString().split('T')[0];
        const dayEvents = events.filter(e => e.date === dateString);

        const isAvailable = availableDays
            ? availableDays.includes(date.toLocaleDateString('en-US', { weekday: 'short' }))
            : true;
        
        const isPast = new Date() > date && !isSameDay(new Date(), date);

        const isDisabled = !isAvailable || isPast;

        days.push(
            <div
                key={dateString}
                className={`p-2 border border-gray-200 transition-colors h-28 flex flex-col ${isDisabled ? 'bg-gray-100 text-gray-400' : 'cursor-pointer hover:bg-teal-50'} ${selectedDate === dateString ? 'bg-teal-600 text-white' : 'bg-white text-gray-800'}`}
                onClick={() => !isDisabled && onDateClick && onDateClick(dateString)}
            >
                <div className="font-semibold">{day}</div>
                <div className="text-xs mt-1 space-y-1 overflow-y-auto">
                    {dayEvents.map((event, index) => (
                        <div key={index} className={`p-1 rounded text-left ${selectedDate === dateString ? 'bg-teal-700 text-white' : 'bg-teal-100 text-teal-800'}`}>
                            {event.title}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100" aria-label="Previous month">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h3 className="text-xl font-bold">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100" aria-label="Next month">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 mb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>
        </div>
    );
};

export default CalendarView;