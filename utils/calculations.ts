import { UserProfile, DayStats, ActivityLevel, UserGoal } from '../types';

export const calculateGoals = (profile: UserProfile): DayStats => {
  // Mifflin-St Jeor Equation
  let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  bmr += profile.gender === 'male' ? 5 : -161;

  const activityMultipliers: Record<ActivityLevel, number> = {
    [ActivityLevel.SEDENTARY]: 1.2,
    [ActivityLevel.LIGHT]: 1.375,
    [ActivityLevel.MODERATE]: 1.55,
    [ActivityLevel.ACTIVE]: 1.725,
    [ActivityLevel.EXTRA_ACTIVE]: 1.9
  };

  let tdee = bmr * activityMultipliers[profile.activity];

  const goalAdjustments: Record<UserGoal, number> = {
    [UserGoal.LOSE_FAST]: -500,
    [UserGoal.LOSE_SLOW]: -250,
    [UserGoal.MAINTAIN]: 0,
    [UserGoal.GAIN]: 250
  };

  const targetCalories = Math.round(tdee + goalAdjustments[profile.goal]);

  // Macro split (Balanced: 30% Protein, 40% Carbs, 30% Fat)
  // 1g Protein = 4 kcal, 1g Carbs = 4 kcal, 1g Fat = 9 kcal
  
  return {
    calories: 0, // Current
    protein: 0,
    carbs: 0,
    fat: 0,
    goalCalories: targetCalories,
    goalProtein: Math.round((targetCalories * 0.3) / 4),
    goalCarbs: Math.round((targetCalories * 0.4) / 4),
    goalFat: Math.round((targetCalories * 0.3) / 9)
  };
};