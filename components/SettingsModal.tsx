import React, { useState, useMemo } from 'react';
import { UserProfile, ActivityLevel, UserGoal, WeightRecord } from '../types';
import { X, Save, Ruler, Weight, User, Activity, TrendingUp, Calendar as CalendarIcon, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  age: 30,
  weight: 75,
  height: 175,
  gender: 'male',
  activity: ActivityLevel.MODERATE,
  goal: UserGoal.MAINTAIN,
  isConfigured: true,
  weightHistory: []
};

type Tab = 'profile' | 'weight';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{new Date(label).toLocaleDateString('cs-CZ')}</p>
        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
          {payload[0].value} kg
        </p>
      </div>
    );
  }
  return null;
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, initialProfile, onSave }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile || DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Weight Tracking State
  const [weightInputDate, setWeightInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightInputValue, setWeightInputValue] = useState<string>(initialProfile?.weight.toString() || '');

  if (!isOpen) return null;

  // Ensure weight history exists
  const weightHistory = profile.weightHistory || [];
  
  // Sort history for graph
  const sortedHistory = useMemo(() => {
    return [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weightHistory]);

  const handleSaveProfile = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    onSave({ ...profile, isConfigured: true });
    onClose();
  };

  const handleAddWeightEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInputValue);
    if (isNaN(val) || val <= 0) return;

    const newEntry: WeightRecord = { date: weightInputDate, weight: val };
    
    // Filter out existing entry for this date and add new one
    const newHistory = weightHistory.filter(h => h.date !== weightInputDate);
    newHistory.push(newEntry);
    
    // Sort
    newHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Update profile (update current weight if date is today or future, or just the latest one)
    const latestWeight = newHistory[newHistory.length - 1].weight;

    setProfile({
        ...profile,
        weight: latestWeight,
        weightHistory: newHistory
    });
    
    // Don't close, user might want to see the graph update
  };

  const handleEditEntry = (entry: WeightRecord) => {
      setWeightInputDate(entry.date);
      setWeightInputValue(entry.weight.toString());
      // Focus input logic could go here
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-900 dark:bg-black p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`text-sm font-bold px-4 py-2 rounded-full transition-all ${activeTab === 'profile' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                  Profil
              </button>
              <button 
                onClick={() => setActiveTab('weight')}
                className={`text-sm font-bold px-4 py-2 rounded-full transition-all ${activeTab === 'weight' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                  Sledování váhy
              </button>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
            
            {/* --- PROFILE TAB --- */}
            {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                    {/* Basics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Věk</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                            type="number"
                            required
                            value={profile.age}
                            onChange={e => setProfile({...profile, age: Number(e.target.value)})}
                            className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pohlaví</label>
                        <select
                            value={profile.gender}
                            onChange={e => setProfile({...profile, gender: e.target.value as 'male' | 'female'})}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            <option value="male">Muž</option>
                            <option value="female">Žena</option>
                        </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Váha (kg)</label>
                        <div className="relative">
                            <Weight className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                            type="number"
                            required
                            value={profile.weight}
                            onChange={e => setProfile({...profile, weight: Number(e.target.value)})}
                            className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Výška (cm)</label>
                        <div className="relative">
                            <Ruler className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                            type="number"
                            required
                            value={profile.height}
                            onChange={e => setProfile({...profile, height: Number(e.target.value)})}
                            className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        </div>
                    </div>

                    {/* Activity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Activity size={18} />
                        Úroveň aktivity
                        </label>
                        <div className="space-y-2">
                        {Object.entries({
                            [ActivityLevel.SEDENTARY]: 'Sedavé (kancelář, málo pohybu)',
                            [ActivityLevel.LIGHT]: 'Lehká (sport 1-3x týdně)',
                            [ActivityLevel.MODERATE]: 'Střední (sport 3-5x týdně)',
                            [ActivityLevel.ACTIVE]: 'Vysoká (sport 6-7x týdně)',
                            [ActivityLevel.EXTRA_ACTIVE]: 'Extrémní (fyzická práce + trénink)'
                        }).map(([key, label]) => (
                            <label key={key} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${profile.activity === key ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300'}`}>
                            <input
                                type="radio"
                                name="activity"
                                value={key}
                                checked={profile.activity === key}
                                onChange={() => setProfile({...profile, activity: key as ActivityLevel})}
                                className="mr-3 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium">{label}</span>
                            </label>
                        ))}
                        </div>
                    </div>

                    {/* Goal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cíl</label>
                        <select
                        value={profile.goal}
                        onChange={e => setProfile({...profile, goal: e.target.value as UserGoal})}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                        <option value={UserGoal.LOSE_FAST}>Rychle zhubnout (-500 kcal)</option>
                        <option value={UserGoal.LOSE_SLOW}>Pomalu zhubnout (-250 kcal)</option>
                        <option value={UserGoal.MAINTAIN}>Udržet váhu</option>
                        <option value={UserGoal.GAIN}>Nabrat svaly (+250 kcal)</option>
                        </select>
                    </div>

                    <div className="h-10"></div> {/* Spacer */}
                </form>
            )}

            {/* --- WEIGHT TRACKING TAB --- */}
            {activeTab === 'weight' && (
                <div className="p-6 space-y-8">
                    
                    {/* Graph */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-end mb-4 px-2">
                             <div>
                                 <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Aktuální váha</h3>
                                 <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{profile.weight} kg</div>
                             </div>
                             <div className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                 <TrendingUp size={14} /> Graf
                             </div>
                        </div>
                        
                        <div className="h-64 w-full">
                            {sortedHistory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sortedHistory}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.3} />
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={(date) => new Date(date).getDate() + '.' + (new Date(date).getMonth() + 1) + '.'} 
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            tickMargin={10}
                                        />
                                        <YAxis 
                                            domain={['dataMin - 1', 'dataMax + 1']} 
                                            stroke="#9ca3af" 
                                            fontSize={12}
                                            width={30}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="weight" 
                                            stroke="#10b981" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorWeight)" 
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                    Zatím žádná data. Přidejte první vážení.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Entry Form */}
                    <form onSubmit={handleAddWeightEntry} className="bg-white dark:bg-gray-900 rounded-xl space-y-4">
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Weight size={18} className="text-emerald-500"/>
                            Zaznamenat váhu
                        </h4>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Datum</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <input 
                                        type="date" 
                                        required
                                        value={weightInputDate}
                                        onChange={(e) => setWeightInputDate(e.target.value)}
                                        className="w-full pl-9 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Váha (kg)</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    required
                                    value={weightInputValue}
                                    onChange={(e) => setWeightInputValue(e.target.value)}
                                    placeholder="0.0"
                                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors h-[38px] w-[38px] flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                                    <Save size={18} />
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* History List */}
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                            <History size={18} className="text-gray-400"/>
                            Historie vážení
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {sortedHistory.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">Seznam je prázdný.</p>
                            ) : (
                                sortedHistory.slice().reverse().map((record, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => handleEditEntry(record)}
                                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
                                    >
                                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            {new Date(record.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 dark:text-white">{record.weight} kg</span>
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Upravit</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                     <div className="h-10"></div> 
                </div>
            )}

        </div>

        {/* Footer with Main Save Button (Always Visible) */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800 shrink-0">
             <button
                onClick={() => handleSaveProfile()}
                className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-3 rounded-xl font-bold shadow-lg shadow-gray-400/20 hover:bg-black dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
                <Save size={20} />
                Uložit vše
            </button>
        </div>
      </div>
    </div>
  );
};