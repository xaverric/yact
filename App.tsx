import React, { useState, useEffect, useMemo } from 'react';
import { DailyProgress } from './components/DailyProgress';
import { MealSection } from './components/MealSection';
import { AddFoodModal } from './components/AddFoodModal';
import { CalendarHeader } from './components/CalendarHeader';
import { MonthCalendar } from './components/MonthCalendar';
import { SettingsModal } from './components/SettingsModal';
import { FoodItem, DayStats, MealType, UserProfile, MealSuggestion } from './types';
import { DEFAULT_GOALS, MEAL_ORDER } from './constants';
import { Plus, Bot, Settings, ChefHat, Check, ArrowRight, Utensils } from 'lucide-react';
import { suggestMealPlan } from './services/geminiService';
import { getItemsForDate, saveItemsForDate, getUserProfile, saveUserProfile } from './utils/storage';
import { calculateGoals } from './utils/calculations';

const App: React.FC = () => {
  // Global State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [items, setItems] = useState<FoodItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.BREAKFAST);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // AI Suggestions State
  const [aiSuggestions, setAiSuggestions] = useState<MealSuggestion[]>([]);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [suggestionType, setSuggestionType] = useState<MealType>(MealType.SNACK);

  // Dark Mode State
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
        return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
      const newMode = !isDark;
      setIsDark(newMode);
      if (newMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('kalorickeAi_theme', 'dark');
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('kalorickeAi_theme', 'light');
      }
  };

  // Initialization
  useEffect(() => {
    const loadedProfile = getUserProfile();
    setUserProfile(loadedProfile);
    if (!loadedProfile) {
      setIsSettingsOpen(true);
    }
  }, []);

  // Load items when date changes
  useEffect(() => {
    const loadedItems = getItemsForDate(selectedDate);
    setItems(loadedItems);
    setAiSuggestions([]); // Clear old suggestions on date change
  }, [selectedDate]);

  // Save items when items change
  useEffect(() => {
    saveItemsForDate(selectedDate, items);
  }, [items, selectedDate]);

  // Save profile when profile changes
  const handleSaveProfile = (profile: UserProfile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
  };

  const stats = useMemo<DayStats>(() => {
    const current = items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    
    const goals = userProfile ? calculateGoals(userProfile) : DEFAULT_GOALS;
    
    return { 
      ...current,
      goalCalories: goals.goalCalories,
      goalProtein: goals.goalProtein,
      goalCarbs: goals.goalCarbs,
      goalFat: goals.goalFat
    };
  }, [items, userProfile]);

  const handleAddFood = (item: Omit<FoodItem, 'id' | 'timestamp'>) => {
    const newItem: FoodItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleDeleteFood = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };
  
  const openAddModal = (type: MealType) => {
      setSelectedMealType(type);
      setIsModalOpen(true);
  }

  const handleGetSuggestion = async () => {
      setLoadingSuggestion(true);
      const remaining = Math.max(0, stats.goalCalories - stats.calories);
      const suggestions = await suggestMealPlan(remaining, suggestionType);
      setAiSuggestions(suggestions);
      setLoadingSuggestion(false);
  }
  
  const handleAddSuggestion = (s: MealSuggestion) => {
      handleAddFood({
          name: s.name,
          quantity: '1 porce',
          calories: s.calories,
          protein: s.protein,
          carbs: s.carbs,
          fat: s.fat,
          mealType: suggestionType
      });
      // Optional: Clear suggestions or show success feedback
      setAiSuggestions([]);
  }

  const isToday = new Date().toDateString() === selectedDate.toDateString();

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-gray-950 pb-24 md:pb-10 transition-colors">
      
      {/* Navigation & Date Switcher */}
      <CalendarHeader 
        selectedDate={selectedDate} 
        onChangeDate={setSelectedDate} 
        onToggleCalendar={() => setIsCalendarOpen(!isCalendarOpen)}
        isCalendarOpen={isCalendarOpen}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
      
      {/* Settings Button (Absolute position in header area) */}
      <div className="absolute top-0 right-0 h-16 flex items-center px-4 z-50 pointer-events-none">
        <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="pointer-events-auto p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
            <Settings size={20} />
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-8 animate-in fade-in duration-500 relative">
        
        {/* Calendar View Overlay */}
        {isCalendarOpen && (
            <div className="mb-6">
                <MonthCalendar 
                    selectedDate={selectedDate} 
                    onChangeDate={setSelectedDate} 
                    onClose={() => setIsCalendarOpen(false)} 
                />
            </div>
        )}

        {/* Progress Section */}
        <section>
          <DailyProgress stats={stats} />
        </section>

        {/* AI Assistant Banner (Only visible if goals are set) */}
        {userProfile && (
            <section className="bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 dark:from-indigo-900 dark:to-purple-900 rounded-3xl p-1 text-white relative overflow-hidden shadow-lg shadow-indigo-200 dark:shadow-none">
                <div className="bg-white/10 backdrop-blur-sm rounded-[22px] p-5 h-full relative z-10">
                    <div className="flex flex-col gap-4">
                        
                        {/* Header & Controls */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                                    <Bot size={20} className="text-indigo-200" />
                                    AI Nutriční Asistent
                                </h3>
                                <p className="text-indigo-100 text-xs md:text-sm max-w-md">
                                    {stats.calories < stats.goalCalories 
                                        ? `Máte ještě místo na ${Math.round(Math.max(0, stats.goalCalories - stats.calories))} kcal. Co si dáte?`
                                        : `Dnes máte splněno! Pokud máte stále hlad, zkusme něco lehkého.`}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 items-center">
                                <div className="flex bg-black/20 rounded-xl p-1">
                                    {(Object.values(MealType) as MealType[]).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setSuggestionType(type)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                suggestionType === type 
                                                ? 'bg-white text-indigo-600 shadow-sm' 
                                                : 'text-indigo-100 hover:bg-white/10'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={handleGetSuggestion}
                                    disabled={loadingSuggestion}
                                    className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-70 flex items-center gap-2"
                                >
                                    {loadingSuggestion ? <span className="animate-pulse">Hledám...</span> : <><Utensils size={16}/> Doporučit</>}
                                </button>
                            </div>
                        </div>

                        {/* Suggestions Cards */}
                        {aiSuggestions.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 animate-in slide-in-from-bottom-4 duration-500">
                                {aiSuggestions.map((suggestion, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-xl border border-white/10 shadow-lg flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-sm leading-tight">{suggestion.name}</h4>
                                                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    {suggestion.calories} kcal
                                                </span>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 line-clamp-2">{suggestion.description}</p>
                                            
                                            <div className="flex gap-2 mb-3">
                                                 <div className="flex flex-col items-center flex-1 bg-gray-50 dark:bg-gray-700/50 rounded p-1">
                                                    <span className="text-[10px] text-gray-400 font-medium">B</span>
                                                    <span className="text-xs font-bold">{suggestion.protein}</span>
                                                 </div>
                                                 <div className="flex flex-col items-center flex-1 bg-gray-50 dark:bg-gray-700/50 rounded p-1">
                                                    <span className="text-[10px] text-gray-400 font-medium">S</span>
                                                    <span className="text-xs font-bold">{suggestion.carbs}</span>
                                                 </div>
                                                 <div className="flex flex-col items-center flex-1 bg-gray-50 dark:bg-gray-700/50 rounded p-1">
                                                    <span className="text-[10px] text-gray-400 font-medium">T</span>
                                                    <span className="text-xs font-bold">{suggestion.fat}</span>
                                                 </div>
                                            </div>

                                            <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium mb-3 italic">
                                                "{suggestion.reason}"
                                            </p>
                                        </div>

                                        <button 
                                            onClick={() => handleAddSuggestion(suggestion)}
                                            className="w-full py-2 bg-gray-900 dark:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-black dark:hover:bg-emerald-500 transition-colors"
                                        >
                                            <Plus size={14} /> Přidat
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            </section>
        )}

        {/* Meals List */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {isToday ? "Dnešní Jídelníček" : "Historie jídel"}
            </h2>
          </div>
          
          {MEAL_ORDER.map((mealType) => (
            <MealSection
              key={mealType}
              title={mealType}
              type={mealType as MealType}
              items={items.filter((i) => i.mealType === mealType)}
              onDelete={handleDeleteFood}
              onAdd={openAddModal}
            />
          ))}
        </section>

      </main>

      {/* Floating Add Button (Global backup) */}
      {isToday && (
          <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none md:hidden">
            <button
              onClick={() => {
                  setSelectedMealType(MealType.LUNCH); // Default middle of dayish
                  setIsModalOpen(true);
              }}
              className="pointer-events-auto bg-gray-900 dark:bg-emerald-600 text-white px-6 py-4 rounded-full shadow-2xl shadow-gray-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-semibold text-lg"
            >
              <Plus size={24} className="text-emerald-400 dark:text-white" />
              Rychlé přidání
            </button>
          </div>
      )}

      <AddFoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddFood}
        defaultMealType={selectedMealType}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialProfile={userProfile}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default App;