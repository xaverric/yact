import React from 'react';
import { DayStats, FoodItem, MealType } from '../types';
import { X, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface NutrientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  items: FoodItem[];
  nutrientKey: keyof FoodItem; // 'protein', 'carbs', 'fat'
  subMetrics?: { label: string; current: number; goal: number; color: string }[];
}

export const NutrientDetailModal: React.FC<NutrientDetailModalProps> = ({ 
    isOpen, onClose, title, current, goal, unit, color, items, nutrientKey, subMetrics 
}) => {
  if (!isOpen) return null;

  // Calculate breakdown by meal
  const mealBreakdown = items.reduce((acc, item) => {
      const val = (item[nutrientKey] as number) || 0;
      acc[item.mealType] = (acc[item.mealType] || 0) + val;
      return acc;
  }, {} as Record<string, number>);

  const chartData = Object.values(MealType).map(type => ({
      name: type,
      value: mealBreakdown[type] || 0
  })).filter(d => d.value > 0);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
  const percentage = Math.min(100, Math.max(0, (current / goal) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 text-white flex justify-between items-center ${color.replace('bg-', 'bg-')}`}>
           <div>
               <h2 className="text-2xl font-bold flex items-center gap-2">
                   {title}
               </h2>
               <p className="text-white/80 text-sm font-medium">Detailní přehled živin</p>
           </div>
           <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
               <X size={24} />
           </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
            
            {/* Main Progress */}
            <div className="flex flex-col items-center">
                 <div className="relative w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[{ value: current }, { value: Math.max(0, goal - current) }]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={10}
                            >
                                <Cell fill={color.replace('bg-', '') === 'bg-emerald-500' ? '#10b981' : color.replace('bg-', '') === 'bg-blue-500' ? '#3b82f6' : '#f59e0b'} />
                                <Cell fill="#f3f4f6" /> 
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(current)}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">/ {goal}{unit}</span>
                    </div>
                 </div>
                 <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                     Splněno {Math.round(percentage)}% denního cíle
                 </p>
            </div>

            {/* Sub Metrics (Fiber, Sugar, Sat Fat) */}
            {subMetrics && subMetrics.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <TrendingUp size={18} className="text-gray-400" />
                        Podrobné složení
                    </h3>
                    <div className="grid gap-4">
                        {subMetrics.map((metric, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{metric.label}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-bold text-gray-900 dark:text-white">{Math.round(metric.current)}</span> / {metric.goal}g
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${metric.color}`} 
                                        style={{ width: `${Math.min(100, (metric.current / metric.goal) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Meal Breakdown */}
            <div>
                 <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                    <PieIcon size={18} className="text-gray-400" />
                    Rozložení podle jídel
                </h3>
                <div className="space-y-3">
                    {chartData.length > 0 ? chartData.map((d, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-2 h-10 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{d.name}</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(d.value)}{unit}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full opacity-60" 
                                        style={{ 
                                            backgroundColor: COLORS[idx % COLORS.length],
                                            width: `${Math.min(100, (d.value / current) * 100)}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-400 text-sm text-center py-4">Zatím žádná data.</p>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};