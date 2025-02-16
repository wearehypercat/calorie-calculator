import React, { useEffect } from 'react';
import { useState } from 'react';
import { Sparkles, ChevronDown, ArrowRight, Mail, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import CalorieCalculator from './components/CalorieCalculator';

type WorkoutRecommendation = {
  workout: string;
  motivation: string;
};

const GEMINI_PROMPT = `You are an elite, high-energy gym coach known for your intense and motivating style. Your responses should be:

1. ENERGETIC & INTENSE - Use caps for emphasis
2. CONCISE - No fluff, just powerful statements
3. MOTIVATIONAL - Push people to their limits
4. GYM-FOCUSED - Use gym slang and terminology

CRITICAL: Your response must be VALID JSON in this exact format:
{
  "workout": "4x8 BENCH PRESS - EXPLOSIVE POWER\\n3x10 WEIGHTED DIPS - CONTROL THE DESCENT\\n4x12 INCLINE DB PRESS",
  "motivation": "EMBRACE THE DISCOMFORT. YOUR LEGACY IS BUILT IN THESE MOMENTS!"
}

Rules:
1. Use \\n for line breaks in the workout
2. Keep motivation under 100 characters
3. NO special characters except ! and 💪
4. MUST be valid JSON that can be parsed

Keep it INTENSE but PROFESSIONAL. NO jokes or casual language.`;

function App() {
  const [activeCalculator, setActiveCalculator] = useState<'1rm' | 'calories'>('1rm');
  const [weight, setWeight] = useState<string>('');
  const [showPercentages, setShowPercentages] = useState(false);
  const [recommendation, setRecommendation] = useState<WorkoutRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);

  const calculate1RM = (weight: number, reps: number = 8): number => {
    return Math.round(weight * (1 + (reps / 30))); // Calculate directly in kg
  };

  const getPercentage = (oneRM: number, percentage: number): number => {
    return Math.round((percentage / 100) * oneRM); // Calculate in kg
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
    generateWorkoutRecommendation();
  };

  const generateWorkoutRecommendation = async () => {
    const oneRM = calculate1RM(Number(weight));
    const workingWeight = getPercentage(oneRM, 75);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      setRecommendation({
        workout: "Error: Gemini API key not found",
        motivation: "Please add your API key to the .env file! 💪"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const prompt = `${GEMINI_PROMPT}\n\nCreate a workout for someone with a 1RM of ${oneRM}kg (working weight: ${Math.round(workingWeight)}kg). Focus on compound movements and progressive overload.`;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up the response if needed
      if (!text.startsWith('{')) {
        text = text.substring(text.indexOf('{'));
      }
      if (!text.endsWith('}')) {
        text = text.substring(0, text.lastIndexOf('}') + 1);
      }
      
      try {
        const parsedResponse = JSON.parse(text);
        if (typeof parsedResponse.workout === 'string' && typeof parsedResponse.motivation === 'string') {
          setRecommendation(parsedResponse);
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        throw new Error('Invalid response format from AI');
      }

    } catch (error) {
      console.error('Error generating workout:', error instanceof Error ? error.message : 'Unknown error');
      setRecommendation({
        workout: "Error generating workout. Please try again.",
        motivation: "Never give up! Even when technology fails, we keep pushing forward! 💪"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Update metadata
    document.title = "BBA 1RM Calculator | Better Body Academy";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Calculate your one-rep max and get personalized workout recommendations with Better Body Academy's 1RM Calculator.");
    }
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isEmailSubmitted) {
      timeout = setTimeout(() => {
        setShowEmailPopup(false);
        setIsEmailSubmitted(false);
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [isEmailSubmitted]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[45vh] md:h-[45vh] overflow-hidden flex items-center justify-center bg-gradient-to-r from-zinc-900 to-black">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')] bg-cover bg-center opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <div className="marquee-container">
            <div className="marquee-text">PUSH YOUR LIMITS • BREAK BARRIERS • ACHIEVE GREATNESS • </div>
          </div>
        </div>
        <div className="relative z-10 text-center animate-fade-in py-12 px-4">
          <img 
            src="/a4b432bb392fa69e95e2f0c54fa6ab66_1200_80.webp" 
            alt="BBA Logo" 
            className="w-24 md:w-32 h-auto mx-auto mb-6"
          />
          <div className="hero-text font-black text-[2rem] md:text-[5rem] leading-none">
            BETTER BODY<br className="md:hidden" /> ACADEMY
          </div>
          <div className="text-xs md:text-base tracking-[0.3em] md:tracking-[0.5em] text-zinc-400 font-light mt-4">
            YOUR JOURNEY TO STRENGTH
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4 py-4">
            <button
              onClick={() => setActiveCalculator('1rm')}
              className={`px-6 py-2 rounded-lg font-oswald tracking-wide transition-colors ${
                activeCalculator === '1rm'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              1RM CALCULATOR
            </button>
            <button
              onClick={() => setActiveCalculator('calories')}
              className={`px-6 py-2 rounded-lg font-oswald tracking-wide transition-colors ${
                activeCalculator === 'calories'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              CALORIE CALCULATOR
            </button>
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      {activeCalculator === '1rm' ? (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/80 to-black pointer-events-none"></div>
          <div className="container mx-auto px-4 max-w-4xl relative z-10 py-8 md:py-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-[1px] w-6 md:w-12 bg-gradient-to-r from-transparent to-zinc-600"></div>
              <h1 className="text-3xl md:text-5xl font-oswald tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">1RM CALCULATOR</h1>
              <div className="h-[1px] w-6 md:w-12 bg-gradient-to-l from-transparent to-zinc-600"></div>
            </div>
            
            <div className="text-center text-zinc-400 mb-8 text-xs md:text-base px-4">
              Input the weight you can lift for 8 reps from your last workout
            </div>

            <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-sm rounded-2xl p-6 md:p-12 mb-8 shadow-2xl border border-zinc-800/50">
              <div className="max-w-xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="block text-sm text-zinc-400 mb-2">WEIGHT LIFTED (KG)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 md:px-6 py-3 md:py-4 text-xl md:text-2xl font-oswald tracking-wide focus:border-red-500 transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-zinc-400 mb-2">REPS</label>
                    <input
                      type="number"
                      value="8"
                      disabled
                      className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 md:px-6 py-3 md:py-4 text-xl md:text-2xl font-oswald tracking-wide opacity-50"
                    />
                  </div>
                </div>

                {weight && (
                  <>
                    <div className="mb-8 text-center py-6 md:py-8 bg-black/30 rounded-xl border border-zinc-800">
                      <div className="text-sm md:text-base text-zinc-400 mb-4 uppercase tracking-wider">Your One Rep Max</div>
                      <div className="text-5xl md:text-7xl font-oswald font-bold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        {calculate1RM(Number(weight))}
                        <span className="text-xl md:text-3xl text-zinc-400 ml-2">KG</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowPercentages(!showPercentages)}
                      className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 mx-auto"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showPercentages ? 'rotate-180' : ''}`} />
                      {showPercentages ? 'Hide' : 'Show'} Percentages
                    </button>

                    {showPercentages && (
                      <div className="grid grid-cols-4 gap-3 mb-8 bg-black/30 p-6 rounded-xl border border-zinc-800">
                        {Array.from({ length: 36 }, (_, i) => 60 + i).map((percentage) => (
                          <div key={percentage} className="bg-black/30 rounded-lg p-3 border border-zinc-800/50 hover:border-red-500/30 transition-colors">
                            <div className="text-sm text-zinc-400 mb-1">{percentage}%</div>
                            <div className="font-oswald text-base md:text-lg flex items-center gap-1">
                              {getPercentage(calculate1RM(Number(weight)), percentage)} KG
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setShowEmailPopup(true)}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-6 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-3 relative"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span className="font-oswald tracking-wider text-2xl">GENERATING...</span>
                        </div>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span className="font-oswald tracking-wider text-2xl">GENERATE WORKOUT</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {recommendation && (
              <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-sm rounded-2xl p-12 border border-zinc-800/50 shadow-2xl mt-8 transition-colors">
                <h2 className="text-4xl font-oswald font-black tracking-tight mb-8 text-center bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">YOUR BETTER BODY ACADEMY WORKOUT</h2>
                <div className="bg-black/30 rounded-xl p-8 mb-8 whitespace-pre-line border border-zinc-800 font-oswald text-xl tracking-wide">
                  {recommendation.workout}
                </div>
                <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-8 font-oswald font-black text-2xl tracking-wider text-center">
                  {recommendation.motivation}
                </div>
              </div>
            )}

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
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-10 h-10" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-oswald font-black tracking-tight mb-4">YOU'RE ALL SET! 💪</h2>
                      <p className="text-zinc-400 mb-6 text-sm md:text-base">Demo Mode: No email will be sent. Click below to view your workout!</p>
                      <button
                        onClick={() => {
                          setShowEmailPopup(false);
                          setIsEmailSubmitted(false);
                        }}
                        className="text-red-500 hover:text-red-400 transition-colors font-semibold"
                      >
                        Click to view your workout plan now
                      </button>
                      <p className="text-sm text-zinc-500 mt-4">
                        This is a demo version. In the full version, you would receive an email with your program.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Mail className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-oswald font-black tracking-tight mb-2">GET YOUR COMPLETE PROGRAM</h2>
                        <p className="text-zinc-400 mb-4 text-sm md:text-base">Enter your email to receive:</p>
                        <ul className="text-xs md:text-sm text-zinc-400 space-y-2 mb-4">
                          <li className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-red-500" />
                            Personalized Workout Program
                          </li>
                          <li className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-red-500" />
                            Progressive Training Guide
                          </li>
                          <li className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-red-500" />
                            Form & Technique Tips
                          </li>
                          <li className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-red-500" />
                            Nutrition & Recovery Guidance
                          </li>
                        </ul>
                        <p className="text-xs text-zinc-500">Join thousands of people on their strength journey</p>
                        <p className="text-[10px] text-zinc-500 mt-2">*This is a demo version - no emails will be sent</p>
                      </div>

                      <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setEmailError('');
                            }}
                            placeholder="Enter your email"
                            className="w-full bg-black/50 border border-zinc-700 rounded-lg px-6 py-4 text-lg focus:border-red-500 transition-colors"
                          />
                          {emailError && (
                            <p className="text-red-500 text-sm mt-2">{emailError}</p>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-4 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-5 h-5" />
                          <span className="font-oswald tracking-wider text-xl">GENERATE MY WORKOUT</span>
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <CalorieCalculator />
      )}

      {/* Footer */}
      <footer className="mt-auto bg-zinc-900/50 border-t border-zinc-800">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center gap-6 md:gap-8">
            <img 
              src="/556d314278579ec205dc33bf7b89c97c_1200_80.webp" 
              alt="BBA Footer Logo" 
              className="w-24 md:w-32 h-auto opacity-80"
            />
            <div className="text-center">
              <div className="text-zinc-400 text-xs md:text-sm">
                © 2025 Better Body Academy. All rights reserved.
              </div>
              <div className="text-zinc-600 text-[10px] md:text-xs mt-2">
                Supporting your journey to a stronger, better you
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;