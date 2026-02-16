import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getDaysWithData } from '../utils/storage';

interface MonthCalendarProps {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  onClose: () => void;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({ selectedDate, onChangeDate, onClose }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const dates = getDaysWithData();
    setActiveDates(new Set(dates));
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday. We want Monday to be 0 for array mapping if we start week on Mon
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChangeDate(newDate);
    onClose();
  };

  // Generate grid
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const weekDays = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 animate-in slide-in-from-top-4 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white capitalize">
            {viewDate.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                <ChevronLeft size={20} />
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                <ChevronRight size={20} />
            </button>
            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 ml-2">
                <X size={20} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-400 uppercase">
                {day}
            </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(day => {
            const currentDayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
            const dateKey = currentDayDate.toISOString().split('T')[0];
            const isSelected = selectedDate.toDateString() === currentDayDate.toDateString();
            const isToday = new Date().toDateString() === currentDayDate.toDateString();
            const hasData = activeDates.has(dateKey);

            return (
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                        aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all
                        ${isSelected 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
                        ${isToday && !isSelected ? 'border border-emerald-500 text-emerald-500' : ''}
                    `}
                >
                    <span className="text-sm font-medium">{day}</span>
                    {hasData && !isSelected && (
                        <span className="absolute bottom-2 w-1 h-1 bg-emerald-500 rounded-full"></span>
                    )}
                </button>
            );
        })}
      </div>
    </div>
  );
};