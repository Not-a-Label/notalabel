'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface GoalsData {
  careerStage: string;
  primaryGoals: string[];
  timeCommitment: string;
  audienceSize: string;
  monthlyListeners: string;
  revenueGoal: string;
  focusAreas: string[];
  challenges: string[];
}

const CAREER_STAGES = [
  {
    id: 'hobbyist',
    title: 'Hobbyist',
    description: 'Music is my passion, I create for fun and personal expression'
  },
  {
    id: 'emerging',
    title: 'Emerging Artist',
    description: 'I have some music out there and want to grow my audience'
  },
  {
    id: 'developing',
    title: 'Developing Artist',
    description: 'I have a growing fanbase and consistent releases'
  },
  {
    id: 'established',
    title: 'Established Artist',
    description: 'I have a solid fanbase and music is my primary income'
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'I tour regularly and music is my full-time career'
  }
];

const PRIMARY_GOALS = [
  { id: 'grow-audience', label: 'Grow my audience', icon: '👥' },
  { id: 'increase-streams', label: 'Increase streaming numbers', icon: '📈' },
  { id: 'live-performances', label: 'Book more live shows', icon: '🎤' },
  { id: 'collaborate', label: 'Collaborate with other artists', icon: '🤝' },
  { id: 'monetize', label: 'Make money from my music', icon: '💰' },
  { id: 'get-signed', label: 'Get signed to a label', icon: '📝' },
  { id: 'sync-licensing', label: 'Get music in TV/film/ads', icon: '🎬' },
  { id: 'improve-skills', label: 'Improve my musical skills', icon: '🎵' }
];

const FOCUS_AREAS = [
  { id: 'songwriting', label: 'Songwriting & Composition' },
  { id: 'recording', label: 'Recording & Production' },
  { id: 'marketing', label: 'Marketing & Promotion' },
  { id: 'social-media', label: 'Social Media Growth' },
  { id: 'live-performance', label: 'Live Performance Skills' },
  { id: 'networking', label: 'Industry Networking' },
  { id: 'business', label: 'Music Business Knowledge' },
  { id: 'branding', label: 'Personal Branding' }
];

const CHALLENGES = [
  { id: 'time-management', label: 'Finding time to create music' },
  { id: 'marketing-knowledge', label: 'Not knowing how to market myself' },
  { id: 'technical-skills', label: 'Limited technical/production skills' },
  { id: 'financial-resources', label: 'Limited budget for promotion' },
  { id: 'industry-connections', label: 'Lack of industry connections' },
  { id: 'confidence', label: 'Confidence in sharing my music' },
  { id: 'consistency', label: 'Staying consistent with releases' },
  { id: 'standing-out', label: 'Standing out in a crowded market' }
];

export default function OnboardingGoalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [goalsData, setGoalsData] = useState<GoalsData>({
    careerStage: '',
    primaryGoals: [],
    timeCommitment: '',
    audienceSize: '',
    monthlyListeners: '',
    revenueGoal: '',
    focusAreas: [],
    challenges: []
  });

  const handleCareerStageChange = (stage: string) => {
    setGoalsData(prev => ({ ...prev, careerStage: stage }));
  };

  const handleMultiSelect = (field: keyof GoalsData, value: string) => {
    setGoalsData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleInputChange = (field: keyof GoalsData, value: string) => {
    setGoalsData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Save goals data to localStorage
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      onboardingData.goals = goalsData;
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Move to next step
      router.push('/onboarding/platforms');
    } catch (error) {
      console.error('Goals save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = goalsData.careerStage && goalsData.primaryGoals.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          What are your music goals?
        </h1>
        <p className="text-gray-600">
          Help us understand where you are in your journey and where you want to go
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Career Stage */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What stage best describes your music career?</h3>
          <div className="space-y-3">
            {CAREER_STAGES.map(stage => (
              <label key={stage.id} className="block">
                <input
                  type="radio"
                  name="careerStage"
                  value={stage.id}
                  checked={goalsData.careerStage === stage.id}
                  onChange={(e) => handleCareerStageChange(e.target.value)}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  goalsData.careerStage === stage.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="font-medium text-gray-900">{stage.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{stage.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Primary Goals */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What are your primary goals? (Select all that apply)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PRIMARY_GOALS.map(goal => (
              <label key={goal.id} className="block">
                <input
                  type="checkbox"
                  checked={goalsData.primaryGoals.includes(goal.id)}
                  onChange={() => handleMultiSelect('primaryGoals', goal.id)}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  goalsData.primaryGoals.includes(goal.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <span className="font-medium text-gray-900">{goal.label}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Time Commitment */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How much time can you dedicate to music weekly?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['1-5 hours', '5-10 hours', '10-20 hours', '20+ hours'].map(time => (
              <label key={time} className="block">
                <input
                  type="radio"
                  name="timeCommitment"
                  value={time}
                  checked={goalsData.timeCommitment === time}
                  onChange={(e) => handleInputChange('timeCommitment', e.target.value)}
                  className="sr-only"
                />
                <div className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-colors ${
                  goalsData.timeCommitment === time
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <span className="font-medium text-gray-900">{time}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Current Audience Size */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's your current audience size across all platforms?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Just starting', '1-100', '100-1K', '1K-10K', '10K-100K', '100K+'].map(size => (
              <label key={size} className="block">
                <input
                  type="radio"
                  name="audienceSize"
                  value={size}
                  checked={goalsData.audienceSize === size}
                  onChange={(e) => handleInputChange('audienceSize', e.target.value)}
                  className="sr-only"
                />
                <div className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-colors ${
                  goalsData.audienceSize === size
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <span className="font-medium text-gray-900">{size}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What areas do you want to focus on improving? (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FOCUS_AREAS.map(area => (
              <label key={area.id} className="block">
                <input
                  type="checkbox"
                  checked={goalsData.focusAreas.includes(area.id)}
                  onChange={() => handleMultiSelect('focusAreas', area.id)}
                  className="sr-only"
                />
                <div className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  goalsData.focusAreas.includes(area.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <span className="font-medium text-gray-900">{area.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Challenges */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What are your biggest challenges? (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CHALLENGES.map(challenge => (
              <label key={challenge.id} className="block">
                <input
                  type="checkbox"
                  checked={goalsData.challenges.includes(challenge.id)}
                  onChange={() => handleMultiSelect('challenges', challenge.id)}
                  className="sr-only"
                />
                <div className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  goalsData.challenges.includes(challenge.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <span className="font-medium text-gray-900">{challenge.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={() => router.push('/onboarding/profile')}
            className="text-gray-500 hover:text-gray-700"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={loading || !isValid}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}