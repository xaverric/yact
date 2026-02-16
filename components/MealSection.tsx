import React from 'react';
import { FoodItem, MealType } from '../types';
import { Trash2, Plus } from 'lucide-react';

interface MealSectionProps {
  title: string;
  type: MealType;
  items: FoodItem[];
  onDelete: (id: string) => void;
  onAdd: (type: MealType) => void;
}

export const MealSection: React.FC<MealSectionProps> = ({ title, type, items, onDelete, onAdd }) => {
  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-6 transition-colors">
      <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{title}</h3>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
            {totalCalories} kcal
            </span>
        </div>
        <button 
            onClick={() => onAdd(type)}
            className="p-2 bg-gray-900 dark:bg-emerald-600 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-200 dark:shadow-none"
        >
            <Plus size={18} />
        </button>
      </div>
      
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
            Zatím žádné jídlo.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-4 flex justify-between items-center group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex-1">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex gap-2">
                  <span>{item.quantity}</span>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center"></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">{item.calories} kcal</span>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center"></span>
                  <span>P: {item.protein}g • S: {item.carbs}g • T: {item.fat}g</span>
                </div>
              </div>
              <button 
                onClick={() => onDelete(item.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};