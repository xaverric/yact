import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface NutritionCardProps {
  label: string;
  value: number;
  total: number;
  unit: string;
  color: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ label, value, total, unit, color, icon, onClick }) => {
  const percentage = Math.min(100, Math.max(0, (value / total) * 100));

  return (
    <div 
        onClick={onClick}
        className={`bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between transition-all relative group ${onClick ? 'cursor-pointer hover:shadow-md dark:hover:border-gray-700 hover:scale-[1.02]' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</span>
        {icon && <span className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{icon}</span>}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{Math.round(value)}</span>
          <span className="text-xs text-gray-400">/ {total}{unit}</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mt-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${color}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      {onClick && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={14} className="text-gray-400" />
          </div>
      )}
    </div>
  );
};