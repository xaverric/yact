import React, { useState, useRef, useEffect } from 'react';
import { analyzeFoodText, analyzeFoodImage } from '../services/geminiService';
import { MealType, FoodItem, AIAnalysisResult } from '../types';
import { Loader2, Sparkles, X, Check, Camera, Type, Pencil, Edit3 } from 'lucide-react';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<FoodItem, 'id' | 'timestamp'>) => void;
  defaultMealType?: MealType;
}

type Mode = 'text' | 'camera' | 'manual';
type Step = 'input' | 'review';

export const AddFoodModal: React.FC<AddFoodModalProps> = ({ isOpen, onClose, onAdd, defaultMealType }) => {
  const [mode, setMode] = useState<Mode>('text');
  const [step, setStep] = useState<Step>('input');
  
  // Input State
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Review/Edit State
  const [formData, setFormData] = useState<AIAnalysisResult>({
    food_name: '',
    quantity_description: '',
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    confidence_score: 1
  });
  const [mealType, setMealType] = useState<MealType>(MealType.BREAKFAST);

  // Update meal type when default changes
  useEffect(() => {
    if (defaultMealType) {
        setMealType(defaultMealType);
    }
  }, [defaultMealType]);

  const reset = () => {
    setMode('text');
    setStep('input');
    setTextInput('');
    setFormData({
      food_name: '',
      quantity_description: '',
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      confidence_score: 1
    });
    // Don't reset mealType here, keep it sticky or based on what was passed
  };

  const handleTextAnalyze = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    const result = await analyzeFoodText(textInput);
    setLoading(false);
    if (result) {
      setFormData(result);
      setStep('review');
    } else {
      alert("Nerozuměl jsem textu. Zkus to znovu.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const result = await analyzeFoodImage(base64String);
      setLoading(false);
      if (result) {
        setFormData(result);
        setStep('review');
      } else {
        alert("Nepodařilo se rozpoznat jídlo na obrázku.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualStart = () => {
    setMode('manual');
    setStep('review');
    setFormData({
        food_name: '',
        quantity_description: '1 porce',
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        confidence_score: 1
    });
  }

  const handleConfirm = () => {
    onAdd({
      name: formData.food_name || 'Neznámé jídlo',
      quantity: formData.quantity_description,
      calories: Number(formData.calories),
      protein: Number(formData.protein_g),
      carbs: Number(formData.carbs_g),
      fat: Number(formData.fat_g),
      mealType: mealType
    });
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-emerald-500 p-6 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles size={20} />
            {step === 'input' ? 'Přidat jídlo' : 'Kontrola a úprava'}
          </h2>
          <button onClick={() => { onClose(); reset(); }} className="p-1 hover:bg-emerald-600 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          
          {/* STEP 1: INPUT METHOD SELECTION */}
          {step === 'input' && (
            <div className="space-y-6">
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button 
                  onClick={() => setMode('text')} 
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'text' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  <div className="flex items-center justify-center gap-2"><Type size={16} /> Text</div>
                </button>
                <button 
                  onClick={() => setMode('camera')} 
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'camera' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  <div className="flex items-center justify-center gap-2"><Camera size={16} /> Fotka</div>
                </button>
                <button 
                   onClick={handleManualStart}
                   className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200`}
                >
                   <div className="flex items-center justify-center gap-2"><Edit3 size={16} /> Ručně</div>
                </button>
              </div>

              {mode === 'text' && (
                <div className="space-y-4">
                  <textarea
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500 transition-all resize-none outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    rows={4}
                    placeholder="Např. 2 míchaná vajíčka a krajíc chleba s máslem..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleTextAnalyze();
                        }
                    }}
                  />
                  <button
                    onClick={handleTextAnalyze}
                    disabled={loading || !textInput.trim()}
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Analyzovat'}
                  </button>
                </div>
              )}

              {mode === 'camera' && (
                <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                  />
                  {loading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-emerald-500" size={48} />
                        <span className="text-gray-400 font-medium">Analyzuji obrázek...</span>
                    </div>
                  ) : (
                    <>
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                            <Camera size={32} />
                        </div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">Nahrát nebo vyfotit jídlo</span>
                        <span className="text-sm text-gray-400 mt-1">Podporujeme JPG a PNG</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: REVIEW & EDIT */}
          {step === 'review' && (
            <div className="space-y-6">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Název jídla</label>
                  <input
                    type="text"
                    value={formData.food_name}
                    onChange={(e) => setFormData({...formData, food_name: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Např. Ovesná kaše"
                  />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Množství</label>
                    <input
                        type="text"
                        value={formData.quantity_description}
                        onChange={(e) => setFormData({...formData, quantity_description: e.target.value})}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Např. 1 miska"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Typ jídla</label>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {Object.values(MealType).map((type) => (
                        <button
                            key={type}
                            onClick={() => setMealType(type)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            mealType === type 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                        >
                            {type}
                        </button>
                        ))}
                    </div>
                </div>
              </div>

              {/* Macros Grid */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase block mb-1">Kalorie (kcal)</label>
                        <input
                            type="number"
                            value={formData.calories}
                            onChange={(e) => setFormData({...formData, calories: Number(e.target.value)})}
                            className="w-full p-3 text-center text-2xl font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs text-center text-gray-500 dark:text-gray-400 block mb-1">Bílkoviny</label>
                        <input
                            type="number"
                            value={formData.protein_g}
                            onChange={(e) => setFormData({...formData, protein_g: Number(e.target.value)})}
                            className="w-full p-2 text-center font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-center text-gray-500 dark:text-gray-400 block mb-1">Sacharidy</label>
                        <input
                            type="number"
                            value={formData.carbs_g}
                            onChange={(e) => setFormData({...formData, carbs_g: Number(e.target.value)})}
                            className="w-full p-2 text-center font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-center text-gray-500 dark:text-gray-400 block mb-1">Tuky</label>
                        <input
                            type="number"
                            value={formData.fat_g}
                            onChange={(e) => setFormData({...formData, fat_g: Number(e.target.value)})}
                            className="w-full p-2 text-center font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Zpět
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 transition-colors"
                >
                  <Check size={18} />
                  Uložit jídlo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};