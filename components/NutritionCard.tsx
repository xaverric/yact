import React from 'react';

interface NutritionCardProps {
  label: string;
  value: number;
  total: number;
  unit: string;
  color: string;
  icon?: React.ReactNode;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ label, value, total, unit, color, icon }) => {
  const percentage = Math.min(100, Math.max(0, (value / total) * 100));

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</span>
        {icon && <span className="text-gray-400 dark:text-gray-600">{icon}</span>}
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
    </div>
  );
};