export type MealItem = {
  meal: string;
  calories: number;
};

export type DayPlan = {
  day: string;
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snacks: MealItem[];
};

export type MealPlan = {
  meals: string;
  tips: string;
  weekPlan: DayPlan[];
};

export type WorkoutPlan = {
  workout: string;
  motivation: string;
}; 