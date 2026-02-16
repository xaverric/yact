import { DayStats } from './types';

export const DEFAULT_GOALS: DayStats = {
  calories: 0, // Current
  protein: 0,
  carbs: 0,
  fat: 0,
  goalCalories: 2000,
  goalProtein: 150,
  goalCarbs: 200,
  goalFat: 70
};

export const MEAL_ORDER = [
  'Snídaně',
  'Oběd',
  'Svačina',
  'Večeře'
];