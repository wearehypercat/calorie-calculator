import React from 'react';
import { Sparkles, ArrowLeft, Dumbbell, Info, Clock, RotateCcw } from 'lucide-react';
import { MealPlan, WorkoutPlan } from './types';

type Props = {
  workoutPlan: WorkoutPlan;
  mealPlan: MealPlan;
  onBack: () => void;
};

function WorkoutPlanPage({ workoutPlan, mealPlan, onBack }: Props) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Motivation Banner */}
      <div className="relative h-[30vh] overflow-hidden flex items-center justify-center bg-gradient-to-r from-zinc-900 to-black">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-oswald mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Your Personalized Workout Plan
          </h1>
          <p className="text-xl text-zinc-300">{workoutPlan.motivation}</p>
        </div>
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Training Tips */}
        <div className="mb-12 bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-oswald">Training Tips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workoutPlan.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 bg-black/30 p-4 rounded-lg border border-zinc-800">
                <Sparkles className="w-5 h-5 text-orange-500 mt-1" />
                <p className="text-zinc-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Workout Days */}
        <div className="space-y-8">
          {workoutPlan.workout.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
              <div className="flex items-center gap-3 mb-6">
                <Dumbbell className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-oswald">{day.day}</h2>
              </div>

              {/* Warm-up Section */}
              <div className="mb-6 bg-black/30 p-4 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                  <RotateCcw className="w-5 h-5" />
                  <h3 className="font-semibold">Warm-up</h3>
                </div>
                <p className="text-zinc-300">{day.warmup}</p>
              </div>

              {/* Exercises */}
              <div className="space-y-4">
                {day.exercises.map((exercise, index) => (
                  <div key={index} className="bg-black/30 p-4 rounded-lg border border-zinc-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {index + 1}. {exercise.name}
                        </h3>
                        <p className="text-zinc-400 text-sm mb-3">{exercise.notes}</p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-zinc-300">{exercise.sets} sets</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <span className="text-zinc-300">{exercise.reps} reps</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-zinc-500" />
                            <span className="text-zinc-300">Rest: {exercise.rest}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkoutPlanPage; 