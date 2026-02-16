import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Moon, Sun } from 'lucide-react';

interface CalendarHeaderProps {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  onToggleCalendar: () => void;
  isCalendarOpen: boolean;
  isDark: boolean;
  toggleTheme: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
    selectedDate, 
    onChangeDate, 
    onToggleCalendar, 
    isCalendarOpen,
    isDark,
    toggleTheme
}) => {
  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onChangeDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onChangeDate(newDate);
  };

  const isToday = new Date().toDateString() === selectedDate.toDateString();

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800 transition-all">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left Side: Theme Toggle */}
        <button 
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Center: Date Navigation */}
        <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
                <ChevronLeft size={24} />
            </button>

            <div className="flex flex-col items-center cursor-pointer group" onClick={onToggleCalendar}>
                <h1 className={`font-bold text-lg flex items-center gap-2 ${isCalendarOpen ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                    {isToday ? "Dnes" : selectedDate.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'short' })}
                    {!isToday && <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Zpět</span>}
                    <CalendarIcon size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isCalendarOpen ? 'opacity-100' : ''}`} />
                </h1>
                <span className="text-xs text-gray-400 font-medium hidden group-hover:block transition-all">
                    {selectedDate.toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>

            <button 
                onClick={handleNext} 
                disabled={isToday}
                className={`p-2 rounded-full transition-colors ${isToday ? 'opacity-30 cursor-not-allowed text-gray-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
            >
                <ChevronRight size={24} />
            </button>
        </div>

        {/* Right Side: Spacer for Settings button (positioned absolutely in App.tsx) */}
        <div className="w-10"></div>

      </div>
    </div>
  );
};