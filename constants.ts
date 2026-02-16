import { DayStats } from './types';

export const DEFAULT_GOALS: DayStats = {
  calories: 0, // Current
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  saturatedFat: 0,
  goalCalories: 2000,
  goalProtein: 150,
  goalCarbs: 200,
  goalFat: 70,
  goalFiber: 30,      // Doporučená denní dávka
  goalSugar: 50,      // Doporučené maximum
  goalSaturatedFat: 20 // Doporučené maximum
};

export const MEAL_ORDER = [
  'Snídaně',
  'Oběd',
  'Svačina',
  'Večeře'
];