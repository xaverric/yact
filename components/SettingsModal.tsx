import React, { useState } from 'react';
import { UserProfile, ActivityLevel, UserGoal } from '../types';
import { X, Save, Ruler, Weight, User, Activity } from 'lucide-react';

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
  isConfigured: true
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, initialProfile, onSave }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile || DEFAULT_PROFILE);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...profile, isConfigured: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-gray-900 dark:bg-black p-6 flex justify-between items-center text-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">Nastavení Profilu</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
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

          <button
            type="submit"
            className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-gray-400/20 hover:bg-black dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 sticky bottom-0"
          >
            <Save size={20} />
            Uložit a přepočítat
          </button>
        </form>
      </div>
    </div>
  );
};