'use client';

import { useState } from 'react';

interface ContentIdea {
  id: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'all';
  type: 'video' | 'photo' | 'story' | 'reel' | 'post';
  title: string;
  description: string;
  hashtags: string[];
  bestTime: string;
  expectedEngagement: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  equipment: string[];
}

interface ContentCalendar {
  week: number;
  days: {
    day: string;
    date: string;
    content: ContentIdea[];
  }[];
}

const CONTENT_TEMPLATES = {
  'hip-hop': {
    tiktok: [
      {
        title: 'Beat Creation Process',
        description: 'Film yourself making a beat from scratch in 60 seconds',
        hashtags: ['#BeatMaking', '#HipHop', '#Producer', '#MusicProduction', '#Studio'],
        equipment: ['Phone camera', 'Music software']
      },
      {
        title: 'Freestyle Challenge',
        description: 'Freestyle over a popular beat for 15-30 seconds',
        hashtags: ['#Freestyle', '#Rap', '#HipHop', '#Bars', '#Challenge'],
        equipment: ['Phone camera', 'Speaker/headphones']
      },
      {
        title: 'Lyrics Breakdown',
        description: 'Explain the meaning behind your bars with text overlay',
        hashtags: ['#LyricsExplained', '#Storytelling', '#HipHop', '#Meaning', '#Bars'],
        equipment: ['Phone camera']
      }
    ],
    instagram: [
      {
        title: 'Studio Aesthetic Shot',
        description: 'Professional photo of you in the studio with your equipment',
        hashtags: ['#StudioLife', '#HipHop', '#Recording', '#Producer', '#Grind'],
        equipment: ['Camera/phone', 'Good lighting']
      },
      {
        title: 'Behind the Bars',
        description: 'Story series showing your writing process',
        hashtags: ['#WritingProcess', '#Songwriter', '#HipHop', '#Creative', '#Bars'],
        equipment: ['Phone camera', 'Notebook']
      }
    ]
  },
  'pop': {
    tiktok: [
      {
        title: 'Hook Challenge',
        description: 'Sing your catchiest hook and encourage others to duet',
        hashtags: ['#PopMusic', '#Hook', '#Challenge', '#Duet', '#Catchy'],
        equipment: ['Phone camera', 'Good audio']
      },
      {
        title: 'Vocal Runs',
        description: 'Show off your vocal range with runs and riffs',
        hashtags: ['#Vocals', '#PopSinger', '#VocalRuns', '#Talent', '#Voice'],
        equipment: ['Phone camera', 'Microphone (optional)']
      }
    ],
    instagram: [
      {
        title: 'Performance Moments',
        description: 'Carousel of your best live performance shots',
        hashtags: ['#LiveMusic', '#Performance', '#PopSinger', '#Stage', '#Concert'],
        equipment: ['Performance photos', 'Editing app']
      }
    ]
  },
  'electronic': {
    tiktok: [
      {
        title: 'Drop Preview',
        description: 'Build anticipation with a snippet leading to your best drop',
        hashtags: ['#ElectronicMusic', '#Drop', '#EDM', '#Preview', '#Bass'],
        equipment: ['Phone camera', 'Music software']
      },
      {
        title: 'Production Breakdown',
        description: 'Show layers of your track being built in your DAW',
        hashtags: ['#MusicProduction', '#EDM', '#Ableton', '#FL', '#Producer'],
        equipment: ['Screen recording', 'DAW software']
      }
    ]
  }
};

export default function ContentStrategyGenerator() {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [timeCommitment, setTimeCommitment] = useState<string>('');
  const [contentCalendar, setContentCalendar] = useState<ContentCalendar[]>([]);
  const [loading, setLoading] = useState(false);

  const genres = ['Hip Hop', 'Pop', 'Rock', 'Electronic', 'R&B', 'Indie', 'Other'];
  const goals = [
    'Increase followers',
    'Drive streams',
    'Build community',
    'Showcase personality',
    'Promote releases',
    'Find collaborators'
  ];
  const timeOptions = ['1-2 hours/week', '3-5 hours/week', '6-10 hours/week', '10+ hours/week'];

  const generateContentCalendar = async () => {
    if (!selectedGenre || selectedGoals.length === 0 || !timeCommitment) {
      alert('Please fill in all fields to generate your strategy');
      return;
    }

    setLoading(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const calendar = generatePersonalizedCalendar();
    setContentCalendar(calendar);
    setLoading(false);
  };

  const generatePersonalizedCalendar = (): ContentCalendar[] => {
    const weeks = 4; // Generate 4 weeks
    const calendar: ContentCalendar[] = [];
    
    for (let week = 1; week <= weeks; week++) {
      const weekData: ContentCalendar = {
        week,
        days: []
      };
      
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      daysOfWeek.forEach((day, dayIndex) => {
        const content = generateDayContent(week, dayIndex, selectedGenre.toLowerCase().replace(' ', '-'));
        const date = new Date();
        date.setDate(date.getDate() + (week - 1) * 7 + dayIndex);
        
        weekData.days.push({
          day,
          date: date.toLocaleDateString(),
          content
        });
      });
      
      calendar.push(weekData);
    }
    
    return calendar;
  };

  const generateDayContent = (week: number, dayIndex: number, genre: string): ContentIdea[] => {
    const contentPattern = getContentPattern(timeCommitment);
    const shouldPost = contentPattern[dayIndex];
    
    if (!shouldPost) return [];
    
    const ideas: ContentIdea[] = [];
    const templates = CONTENT_TEMPLATES[genre as keyof typeof CONTENT_TEMPLATES] || CONTENT_TEMPLATES['hip-hop'];
    
    // Alternate between platforms based on day
    if (dayIndex % 3 === 0) {
      // TikTok day
      const tiktokIdeas = templates.tiktok || [];
      if (tiktokIdeas.length > 0) {
        const template = tiktokIdeas[week % tiktokIdeas.length];
        ideas.push({
          id: `${week}-${dayIndex}-tiktok`,
          platform: 'tiktok',
          type: 'video',
          title: template.title,
          description: template.description,
          hashtags: template.hashtags,
          bestTime: '6:00 PM - 9:00 PM',
          expectedEngagement: 'high',
          difficulty: 'medium',
          equipment: template.equipment
        });
      }
    } else if (dayIndex % 3 === 1) {
      // Instagram day
      const instagramIdeas = templates.instagram || [];
      if (instagramIdeas.length > 0) {
        const template = instagramIdeas[week % instagramIdeas.length];
        ideas.push({
          id: `${week}-${dayIndex}-instagram`,
          platform: 'instagram',
          type: 'post',
          title: template.title,
          description: template.description,
          hashtags: template.hashtags,
          bestTime: '11:00 AM - 1:00 PM',
          expectedEngagement: 'medium',
          difficulty: 'easy',
          equipment: template.equipment
        });
      }
    } else {
      // Story/casual content day
      ideas.push({
        id: `${week}-${dayIndex}-story`,
        platform: 'instagram',
        type: 'story',
        title: 'Behind the Scenes',
        description: 'Share what you\'re working on today - studio time, practice, or daily life',
        hashtags: ['#BTS', '#StudioLife', '#Process'],
        bestTime: '7:00 PM - 9:00 PM',
        expectedEngagement: 'medium',
        difficulty: 'easy',
        equipment: ['Phone camera']
      });
    }
    
    return ideas;
  };

  const getContentPattern = (commitment: string): boolean[] => {
    switch (commitment) {
      case '1-2 hours/week':
        return [false, false, true, false, false, true, false]; // 2 posts/week
      case '3-5 hours/week':
        return [true, false, true, false, true, false, false]; // 3 posts/week
      case '6-10 hours/week':
        return [true, false, true, false, true, false, true]; // 4 posts/week
      case '10+ hours/week':
        return [true, true, true, true, true, false, false]; // 5 posts/week
      default:
        return [false, false, true, false, false, true, false];
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'tiktok': return 'bg-black text-white';
      case 'instagram': return 'bg-pink-500 text-white';
      case 'youtube': return 'bg-red-500 text-white';
      case 'twitter': return 'bg-blue-400 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok': return '🎭';
      case 'instagram': return '📸';
      case 'youtube': return '📺';
      case 'twitter': return '🐦';
      default: return '📱';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎨 Content Strategy Generator
        </h1>
        <p className="text-gray-600">
          AI-powered content calendar tailored to your genre and goals
        </p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Tell us about your content goals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Genre Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select genre</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Time Commitment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Commitment
            </label>
            <select
              value={timeCommitment}
              onChange={(e) => setTimeCommitment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select time commitment</option>
              {timeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Goals
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {goals.map(goal => (
                <label key={goal} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedGoals.includes(goal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGoals([...selectedGoals, goal]);
                      } else {
                        setSelectedGoals(selectedGoals.filter(g => g !== goal));
                      }
                    }}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={generateContentCalendar}
          disabled={loading}
          className="mt-6 bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Strategy...
            </span>
          ) : (
            '🚀 Generate My Content Strategy'
          )}
        </button>
      </div>

      {/* Generated Calendar */}
      {contentCalendar.length > 0 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Personalized Content Calendar
            </h2>
            <p className="text-gray-600">
              {selectedGenre} content strategy for {timeCommitment} commitment
            </p>
          </div>

          {contentCalendar.map((week) => (
            <div key={week.week} className="bg-white rounded-lg shadow">
              <div className="bg-purple-600 text-white px-6 py-3 rounded-t-lg">
                <h3 className="text-lg font-semibold">Week {week.week}</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {week.days.map((day) => (
                    <div key={day.day} className="border border-gray-200 rounded-lg p-3">
                      <div className="text-center mb-3">
                        <div className="font-medium text-gray-900">{day.day}</div>
                        <div className="text-xs text-gray-500">{day.date}</div>
                      </div>
                      
                      {day.content.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm py-4">
                          Rest day
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {day.content.map((content) => (
                            <div key={content.id} className="border border-gray-100 rounded p-2">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getPlatformColor(content.platform)}`}>
                                  {getPlatformIcon(content.platform)} {content.platform}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  content.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                  content.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {content.difficulty}
                                </span>
                              </div>
                              
                              <div className="font-medium text-sm text-gray-900 mb-1">
                                {content.title}
                              </div>
                              
                              <div className="text-xs text-gray-600 mb-2">
                                {content.description}
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                Best time: {content.bestTime}
                              </div>
                              
                              {content.hashtags.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs text-blue-600">
                                    {content.hashtags.slice(0, 3).join(' ')}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Strategy Tips */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Pro Tips for Your Content Strategy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Content Creation:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Batch create content on Sundays</li>
                  <li>• Keep a running list of content ideas</li>
                  <li>• Repurpose content across platforms</li>
                  <li>• Stay authentic to your brand</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Optimization:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Track which content performs best</li>
                  <li>• Engage with comments within 2 hours</li>
                  <li>• Use trending sounds on TikTok/Instagram</li>
                  <li>• Post consistently at optimal times</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => window.print()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors mr-4"
            >
              📄 Download Calendar
            </button>
            <button
              onClick={generateContentCalendar}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🔄 Generate New Strategy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}