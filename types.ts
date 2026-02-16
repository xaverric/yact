export enum MealType {
  BREAKFAST = 'Snídaně',
  LUNCH = 'Oběd',
  DINNER = 'Večeře',
  SNACK = 'Svačina'
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary', // Sedavé (BMR * 1.2)
  LIGHT = 'light',         // Lehce aktivní (BMR * 1.375)
  MODERATE = 'moderate',   // Středně aktivní (BMR * 1.55)
  ACTIVE = 'active',       // Velmi aktivní (BMR * 1.725)
  EXTRA_ACTIVE = 'extra'   // Extrémně aktivní (BMR * 1.9)
}

export enum UserGoal {
  LOSE_FAST = 'lose_fast', // -500 kcal
  LOSE_SLOW = 'lose_slow', // -250 kcal
  MAINTAIN = 'maintain',   // 0
  GAIN = 'gain'            // +250 kcal
}

export interface WeightRecord {
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface UserProfile {
  age: number;
  weight: number; // kg (current)
  height: number; // cm
  gender: 'male' | 'female';
  activity: ActivityLevel;
  goal: UserGoal;
  isConfigured: boolean;
  weightHistory: WeightRecord[];
}

export interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  saturatedFat: number;
}

export interface FoodItem extends Nutrients {
  id: string;
  name: string;
  quantity: string;
  mealType: MealType;
  timestamp: number;
}

export interface DayStats extends Nutrients {
  goalCalories: number;
  goalProtein: number;
  goalCarbs: number;
  goalFat: number;
  goalFiber: number;
  goalSugar: number;
  goalSaturatedFat: number;
}

export interface AIAnalysisResult {
  food_name: string;
  quantity_description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  saturated_fat_g: number;
  confidence_score: number; // 0-1
}

export interface MealSuggestion {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    reason: string; // Proč je to dobrá volba
}