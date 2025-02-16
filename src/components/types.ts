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

export type Exercise = {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
};

export type WorkoutDay = {
  day: string;
  warmup: string;
  exercises: Exercise[];
};

export type WorkoutPlan = {
  workout: WorkoutDay[];
  motivation: string;
  tips: string[];
}; 