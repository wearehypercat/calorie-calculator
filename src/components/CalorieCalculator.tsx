import React, { useState } from 'react';
import { Sparkles, ChevronDown, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Gender = 'male' | 'female';

type MealItem = {
  meal: string;
  calories: number;
};

type DayPlan = {
  day: string;
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snacks: MealItem[];
};

type MealPlan = {
  meals: string;
  tips: string;
  weekPlan: DayPlan[];
};

type WorkoutPlan = {
  workout: string;
  motivation: string;
};

const MEAL_PLAN_PROMPT = `You are a professional nutrition coach. Create a detailed 5-day meal plan based on the following parameters:
- Daily Calorie Target: {calories} calories
- Goal: Healthy weight management

Response must be VALID JSON in this format:
{
  "meals": "Here's your personalized meal plan designed to help you reach your goals while maintaining a balanced diet.",
  "tips": "Focus on protein with each meal. Stay hydrated throughout the day!",
  "weekPlan": [
    {
      "day": "Monday",
      "breakfast": { "meal": "Oatmeal with berries & nuts", "calories": 450 },
      "lunch": { "meal": "Grilled chicken salad", "calories": 550 },
      "dinner": { "meal": "Baked salmon with quinoa", "calories": 600 },
      "snacks": [
        { "meal": "Greek yogurt with honey", "calories": 150 },
        { "meal": "Apple with almond butter", "calories": 200 }
      ]
    },
    // ... repeat for other days
  ]
}

Rules:
1. weekPlan must be an array of 5 days
2. Include specific calorie counts for each meal
3. Must be valid JSON
4. Include healthy, balanced meals with variety
5. Keep tips under 100 characters
6. Each meal should include protein, complex carbs, and healthy fats`;

const NUTRITION_TIP_PROMPT = `You are a knowledgeable nutrition expert. Create a helpful nutrition tip based on a {calories} calorie diet.

Response must be VALID JSON in this format:
{
  "title": "Protein Timing Matters!",
  "explanation": "A concise, practical tip about nutrition (max 2 sentences)",
  "actionItem": "One specific action to take (start with a verb)"
}

Keep it practical, science-based, and easy to implement.`;

const WORKOUT_PLAN_PROMPT = `You are an expert fitness coach. Create a customized workout plan based on the following:
- Goal: Complement a {calories} calorie diet plan
- Focus: Full body fitness and strength

Response must be VALID JSON in this format:
{
  "workout": "MONDAY - FULL BODY:\\n- 3x12 Squats\\n- 3x10 Push-ups\\n...\\n\\nWEDNESDAY - CARDIO:\\n...",
  "motivation": "Transform your body through dedication and consistent effort! 💪"
}

Rules:
1. Use \\n for line breaks
2. Include 3-4 days of workouts
3. Keep motivation under 100 characters
4. Must be valid JSON
5. Include a mix of strength and cardio`;

function CalorieCalculator() {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [bmr, setBmr] = useState<number | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [nutritionTip, setNutritionTip] = useState<{ title: string; explanation: string; actionItem: string } | null>(null);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const calculateBMR = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    if (!w || !h || !a) return null;

    // Using Mifflin-St Jeor formula
    const result = gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

    return Math.round(result);
  };

  const generateNutritionTip = async (calories: number) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return;

    try {
      const prompt = NUTRITION_TIP_PROMPT.replace('{calories}', calories.toString());
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      if (!text.startsWith('{')) {
        text = text.substring(text.indexOf('{'));
      }
      if (!text.endsWith('}')) {
        text = text.substring(0, text.lastIndexOf('}') + 1);
      }
      
      const parsedResponse = JSON.parse(text);
      setNutritionTip(parsedResponse);
    } catch (error) {
      console.error('Error generating nutrition tip:', error);
    }
  };

  const generateMealPlan = async (calories: number) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setMealPlan({
        meals: "Error: Gemini API key not found",
        tips: "Please configure your API key",
        weekPlan: []
      });
      return;
    }
    
    try {
      const prompt = MEAL_PLAN_PROMPT.replace('{calories}', calories.toString());
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      if (!text.startsWith('{')) {
        text = text.substring(text.indexOf('{'));
      }
      if (!text.endsWith('}')) {
        text = text.substring(0, text.lastIndexOf('}') + 1);
      }
      
      const parsedResponse = JSON.parse(text);
      setMealPlan(parsedResponse);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setMealPlan({
        meals: "Error generating meal plan. Please try again.",
        tips: "Don't give up! Technical issues happen, but your health journey continues! 💪",
        weekPlan: []
      });
    }
  };

  const generateWorkoutPlan = async () => {
    if (!bmr) return;
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setWorkoutPlan({
        workout: "Error: Gemini API key not found",
        motivation: "Please configure your API key"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const prompt = WORKOUT_PLAN_PROMPT.replace('{calories}', bmr.toString());
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      if (!text.startsWith('{')) {
        text = text.substring(text.indexOf('{'));
      }
      if (!text.endsWith('}')) {
        text = text.substring(0, text.lastIndexOf('}') + 1);
      }
      
      const parsedResponse = JSON.parse(text);
      setWorkoutPlan(parsedResponse);
    } catch (error) {
      console.error('Error generating workout plan:', error);
      setWorkoutPlan({
        workout: "Error generating workout plan. Please try again.",
        motivation: "Stay strong! Technical issues are temporary, but your dedication is permanent! 💪"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');
    setIsEmailSubmitted(true);
    generateWorkoutPlan();
  };

  const handleCalculate = async () => {
    const calculatedBMR = calculateBMR();
    if (calculatedBMR) {
      setIsLoading(true);
      setBmr(calculatedBMR);
      
      try {
        // Generate both meal plan and nutrition tip simultaneously
        await Promise.all([
          generateMealPlan(calculatedBMR),
          generateNutritionTip(calculatedBMR)
        ]);
      } catch (error) {
        console.error('Error generating content:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/80 to-black pointer-events-none"></div>
      <div className="container mx-auto px-4 max-w-4xl relative z-10 py-8 md:py-16">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-[1px] w-6 md:w-12 bg-gradient-to-r from-transparent to-zinc-600"></div>
          <h1 className="text-3xl md:text-5xl font-oswald tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            CALORIE CALCULATOR
          </h1>
          <div className="h-[1px] w-6 md:w-12 bg-gradient-to-l from-transparent to-zinc-600"></div>
        </div>

        <div className="text-center text-zinc-400 mb-8 text-xs md:text-base px-4">
          Calculate your daily calorie needs and get a personalized meal plan
        </div>

        <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-sm rounded-2xl p-6 md:p-12 mb-8 shadow-2xl border border-zinc-800/50">
          <div className="max-w-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">GENDER</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-xl font-oswald tracking-wide focus:border-red-500 transition-colors"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">AGE (YEARS)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-xl font-oswald tracking-wide focus:border-red-500 transition-colors"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">WEIGHT (KG)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-xl font-oswald tracking-wide focus:border-red-500 transition-colors"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">HEIGHT (CM)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-xl font-oswald tracking-wide focus:border-red-500 transition-colors"
                  placeholder="0"
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={!age || !weight || !height || isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg py-4 text-xl font-oswald tracking-wide hover:from-red-600 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>GENERATING YOUR PLAN...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>CALCULATE & GET PERSONALIZED PLAN</span>
                </>
              )}
            </button>

            {bmr && (
              <div className="mt-8 text-center py-6 md:py-8 bg-black/30 rounded-xl border border-zinc-800">
                <div className="text-sm md:text-base text-zinc-400 mb-4 uppercase tracking-wider">
                  Your Daily Calorie Needs (BMR)
                </div>
                <div className="text-5xl md:text-7xl font-oswald font-bold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  {bmr}
                  <span className="text-xl md:text-3xl text-zinc-400 ml-2">KCAL</span>
                </div>
              </div>
            )}

            {nutritionTip && (
              <div className="mt-8 bg-black/30 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-red-500" />
                  <h3 className="text-xl font-oswald text-white">{nutritionTip.title}</h3>
                </div>
                <p className="text-zinc-300 mb-4">{nutritionTip.explanation}</p>
                <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                  <p className="text-red-400 font-semibold">Action Step:</p>
                  <p className="text-zinc-300">{nutritionTip.actionItem}</p>
                </div>
              </div>
            )}

            {mealPlan && (
              <div className="mt-8">
                <div className="bg-black/30 rounded-xl border border-zinc-800 p-6">
                  <h2 className="text-2xl font-oswald mb-4 text-center">Your 5-Day Meal Plan</h2>
                  <p className="text-zinc-300 mb-6 text-center">{mealPlan.meals}</p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="bg-zinc-800/50 text-zinc-300 font-oswald tracking-wide px-4 py-3 text-left border-b border-zinc-700">Day</th>
                          <th className="bg-zinc-800/50 text-zinc-300 font-oswald tracking-wide px-4 py-3 text-left border-b border-zinc-700">
                            Breakfast
                            <span className="block text-xs text-zinc-400 font-normal">400-500 cal</span>
                          </th>
                          <th className="bg-zinc-800/50 text-zinc-300 font-oswald tracking-wide px-4 py-3 text-left border-b border-zinc-700">
                            Lunch
                            <span className="block text-xs text-zinc-400 font-normal">500-600 cal</span>
                          </th>
                          <th className="bg-zinc-800/50 text-zinc-300 font-oswald tracking-wide px-4 py-3 text-left border-b border-zinc-700">
                            Dinner
                            <span className="block text-xs text-zinc-400 font-normal">500-600 cal</span>
                          </th>
                          <th className="bg-zinc-800/50 text-zinc-300 font-oswald tracking-wide px-4 py-3 text-left border-b border-zinc-700">
                            Snacks
                            <span className="block text-xs text-zinc-400 font-normal">200-300 cal each</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mealPlan.weekPlan.map((day, index) => (
                          <tr key={day.day} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                            <td className="px-4 py-4 text-zinc-300 font-oswald">{day.day}</td>
                            <td className="px-4 py-4">
                              <div className="text-zinc-300">{day.breakfast.meal}</div>
                              <div className="text-xs text-zinc-500 mt-1">{day.breakfast.calories} cal</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-zinc-300">{day.lunch.meal}</div>
                              <div className="text-xs text-zinc-500 mt-1">{day.lunch.calories} cal</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-zinc-300">{day.dinner.meal}</div>
                              <div className="text-xs text-zinc-500 mt-1">{day.dinner.calories} cal</div>
                            </td>
                            <td className="px-4 py-4">
                              {day.snacks.map((snack, i) => (
                                <div key={i} className="mb-2 last:mb-0">
                                  <div className="text-zinc-300">{i + 1}. {snack.meal}</div>
                                  <div className="text-xs text-zinc-500 mt-1">{snack.calories} cal</div>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
                    <p className="text-center text-zinc-400">{mealPlan.tips}</p>
                  </div>
                  
                  <button
                    onClick={() => setShowEmailPopup(true)}
                    className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg py-4 text-xl font-oswald tracking-wide hover:from-green-600 hover:to-emerald-600 transition-colors"
                  >
                    GET WORKOUT PLAN ($20)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Popup */}
        {showEmailPopup && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 max-w-md w-full border border-zinc-700 shadow-2xl animate-scale-in relative">
              <button
                onClick={() => {
                  setShowEmailPopup(false);
                  setIsEmailSubmitted(false);
                }}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {isEmailSubmitted ? (
                <>
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-oswald mb-4">Your Workout Plan is Ready!</h3>
                  </div>
                  {workoutPlan && (
                    <div className="bg-black/30 rounded-xl border border-zinc-800 p-6">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-300">{workoutPlan.workout}</pre>
                      <div className="mt-4 text-center text-zinc-400">{workoutPlan.motivation}</div>
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={handleEmailSubmit} className="py-8">
                  <h3 className="text-2xl font-oswald mb-6 text-center">Get Your Custom Workout Plan</h3>
                  <div className="mb-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-lg focus:border-green-500 transition-colors"
                    />
                    {emailError && (
                      <div className="text-red-500 text-sm mt-2">{emailError}</div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg py-4 text-xl font-oswald tracking-wide hover:from-green-600 hover:to-emerald-600 transition-colors"
                  >
                    PURCHASE & GET PLAN ($20)
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalorieCalculator; 