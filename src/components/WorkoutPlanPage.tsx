import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { MealPlan, WorkoutPlan } from './types';

type Props = {
  workoutPlan: WorkoutPlan;
  mealPlan: MealPlan;
  onBack: () => void;
};

function WorkoutPlanPage({ workoutPlan, mealPlan, onBack }: Props) {
  // Convert workout text with \n to array of sections
  const workoutSections = workoutPlan.workout.split('\\n\\n').map(section => {
    const [day, ...exercises] = section.split('\\n');
    return {
      day: day.trim(),
      exercises: exercises.map(ex => ex.trim().replace('- ', ''))
    };
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative h-[30vh] overflow-hidden flex items-center justify-center bg-gradient-to-r from-zinc-900 to-black">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 text-center py-12 px-4">
          <h1 className="text-4xl md:text-6xl font-oswald font-black tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-4">
            YOUR COMPLETE FITNESS PLAN
          </h1>
          <p className="text-zinc-400 text-sm md:text-base tracking-wide">
            Customized workout and nutrition plan to help you reach your goals
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Calculator
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workout Plan Section */}
          <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-oswald text-white">Your Workout Plan</h2>
            </div>

            <div className="space-y-8">
              {workoutSections.map((section, index) => (
                <div key={index} className="bg-black/30 rounded-xl border border-zinc-800 p-6">
                  <h3 className="text-xl font-oswald text-red-500 mb-4">{section.day}</h3>
                  <div className="space-y-3">
                    {section.exercises.map((exercise, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-oswald text-zinc-400 flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-zinc-300">{exercise}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
              <p className="text-center text-zinc-300 font-oswald">{workoutPlan.motivation}</p>
            </div>
          </div>

          {/* Meal Plan Section */}
          <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-oswald text-white">Your Meal Plan</h2>
            </div>

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
                  {mealPlan.weekPlan.map((day) => (
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

            <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
              <p className="text-center text-zinc-400">{mealPlan.tips}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkoutPlanPage; 