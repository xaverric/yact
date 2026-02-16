import { FoodItem, UserProfile } from '../types';

const STORAGE_PREFIX = 'kalorickeAi_';
const ITEMS_KEY = (date: string) => `${STORAGE_PREFIX}items_${date}`;
const PROFILE_KEY = `${STORAGE_PREFIX}profile`;

export const getItemsForDate = (date: Date): FoodItem[] => {
  const dateKey = date.toISOString().split('T')[0];
  const stored = localStorage.getItem(ITEMS_KEY(dateKey));
  return stored ? JSON.parse(stored) : [];
};

export const saveItemsForDate = (date: Date, items: FoodItem[]) => {
  const dateKey = date.toISOString().split('T')[0];
  localStorage.setItem(ITEMS_KEY(dateKey), JSON.stringify(items));
};

export const getUserProfile = (): UserProfile | null => {
  const stored = localStorage.getItem(PROFILE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getDaysWithData = (): string[] => {
    const dates: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${STORAGE_PREFIX}items_`)) {
            const dateStr = key.replace(`${STORAGE_PREFIX}items_`, '');
            // Only add if there are actually items in the array
            const items = JSON.parse(localStorage.getItem(key) || '[]');
            if (items.length > 0) {
                dates.push(dateStr);
            }
        }
    }
    return dates;
};