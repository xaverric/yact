import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { DayStats } from '../types';
import { NutritionCard } from './NutritionCard';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react';

interface DailyProgressProps {
  stats: DayStats;
  onOpenDetail: (type: 'protein' | 'carbs' | 'fat') => void;
}

export const DailyProgress: React.FC<DailyProgressProps> = ({ stats, onOpenDetail }) => {
  const remaining = Math.max(0, stats.goalCalories - stats.calories);
  
  const data = [
    { name: 'Protein', value: stats.protein * 4, color: '#10b981' }, // 4 kcal per g
    { name: 'Carbs', value: stats.carbs * 4, color: '#3b82f6' }, // 4 kcal per g
    { name: 'Fat', value: stats.fat * 9, color: '#f59e0b' }, // 9 kcal per g
    { name: 'Remaining', value: Math.max(0, stats.goalCalories - (stats.protein*4 + stats.carbs*4 + stats.fat*9)), color: 'rgba(243, 244, 246, 0.2)' } // Transparent for dark mode compatibility
  ];
  
  // If we overshot, the empty part is 0
  const totalCal = stats.protein * 4 + stats.carbs * 4 + stats.fat * 9;
  if(totalCal > stats.goalCalories) {
      data[3].value = 0;
  }

  return (
    <div className="space-y-6">
      {/* Main Calories Circle */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-0"></div>
        
        <div className="relative w-48 h-48 flex-shrink-0 z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                cornerRadius={10}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-extrabold text-gray-800 dark:text-white">{remaining}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Kcal zbývá</span>
          </div>
        </div>

        <div className="flex-1 w-full z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dnešní přehled</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Udržujte si tempo, vedete si skvěle!</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors">
                    <div className="flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400">
                        <Flame size={14} />
                        <span className="text-xs font-bold uppercase">Kalorie</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{Math.round(stats.calories)}</div>
                 </div>
                 <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => onOpenDetail('protein')}>
                    <div className="flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400">
                        <Beef size={14} />
                        <span className="text-xs font-bold uppercase">Bílkoviny</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{Math.round(stats.protein)}g</div>
                 </div>
                 <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => onOpenDetail('carbs')}>
                    <div className="flex items-center gap-1.5 mb-1 text-blue-500 dark:text-blue-400">
                        <Wheat size={14} />
                        <span className="text-xs font-bold uppercase">Sacharidy</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{Math.round(stats.carbs)}g</div>
                 </div>
                 <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => onOpenDetail('fat')}>
                    <div className="flex items-center gap-1.5 mb-1 text-amber-500 dark:text-amber-400">
                        <Droplets size={14} />
                        <span className="text-xs font-bold uppercase">Tuky</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{Math.round(stats.fat)}g</div>
                 </div>
            </div>
        </div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NutritionCard 
            label="Bílkoviny" 
            value={stats.protein} 
            total={stats.goalProtein} 
            unit="g" 
            color="bg-emerald-500"
            icon={<Beef size={16}/>}
            onClick={() => onOpenDetail('protein')}
        />
        <NutritionCard 
            label="Sacharidy" 
            value={stats.carbs} 
            total={stats.goalCarbs} 
            unit="g" 
            color="bg-blue-500"
            icon={<Wheat size={16}/>}
            onClick={() => onOpenDetail('carbs')}
        />
        <NutritionCard 
            label="Tuky" 
            value={stats.fat} 
            total={stats.goalFat} 
            unit="g" 
            color="bg-amber-500"
            icon={<Droplets size={16}/>}
            onClick={() => onOpenDetail('fat')}
        />
        <NutritionCard 
            label="Kalorie" 
            value={stats.calories} 
            total={stats.goalCalories} 
            unit="" 
            color="bg-red-500"
            icon={<Flame size={16}/>}
        />
      </div>
    </div>
  );
};