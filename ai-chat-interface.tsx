'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface QuickAction {
  icon: string;
  label: string;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: '🎯',
    label: 'Set Goals',
    prompt: 'Help me set realistic career goals for the next 3 months'
  },
  {
    icon: '📈',
    label: 'Growth Strategy',
    prompt: 'What\'s the best strategy to grow my audience this month?'
  },
  {
    icon: '🎵',
    label: 'Release Plan',
    prompt: 'How should I plan my next music release for maximum impact?'
  },
  {
    icon: '💰',
    label: 'Monetization',
    prompt: 'What are the best ways for me to start earning from my music?'
  },
  {
    icon: '📱',
    label: 'Social Media',
    prompt: 'Create a social media content strategy for my music'
  },
  {
    icon: '🤝',
    label: 'Networking',
    prompt: 'How can I network effectively in the music industry?'
  }
];

const SAMPLE_RESPONSES = {
  'growth': `Based on your profile, here's a personalized growth strategy:

**Week 1-2: Foundation**
- Post consistently on TikTok (3x/week) with behind-the-scenes content
- Engage with 10 artists in your genre daily
- Complete your Spotify for Artists profile

**Week 3-4: Amplification** 
- Collaborate with 2 artists for cross-promotion
- Submit your best track to 15 relevant playlists
- Run targeted Instagram ads ($50 budget)

**Expected Results:** 200-500 new followers, 2-5 playlist placements

Would you like me to break down any of these steps?`,

  'release': `Here's your optimal release strategy:

**Pre-Release (4 weeks out):**
- Announce with teaser video on all platforms
- Create anticipation content (studio sessions, lyrics previews)
- Reach out to blogs and playlist curators

**Release Week:**
- Release on Friday (industry standard)
- Push hard on social media first 72 hours
- Encourage saves/adds to playlists

**Post-Release (2 weeks):**
- Share fan reactions and milestone celebrations
- Create remix or acoustic version
- Analyze performance data

The key is building momentum BEFORE you release. Want specific content ideas?`,

  'monetization': `Here are 5 revenue streams you can start today:

**1. Streaming Optimization** 
- Focus on playlists that pay well (Spotify, Apple Music)
- Aim for 1000+ monthly listeners first

**2. Direct Sales**
- Bandcamp for superfans who want to support you
- Limited edition merchandise

**3. Sync Licensing**
- Submit tracks to music libraries
- Your style could work for commercials/YouTube

**4. Live Performance**
- Start with local venues and open mics
- Virtual concerts on platforms like StageIt

**5. Teaching/Coaching**
- Offer music lessons or production tips
- Create educational content on YouTube

Which revenue stream interests you most?`,

  'social': `Your personalized social media strategy:

**TikTok (Primary Focus):**
- Behind-the-scenes music creation
- 15-second song previews
- Day-in-the-life content
- Music production tips
Post 5x/week, optimal times: 6-10pm

**Instagram:**
- Polished photos and Reels
- Story highlights for different topics
- IGTV for longer content
Post 3x/week

**YouTube:**
- Full songs with visualizers
- "Making of" videos
- Lyric videos
Weekly uploads

**Content Pillars:**
40% Music content, 30% Personality, 20% Industry insights, 10% Behind-scenes

Need help creating a content calendar?`
};

export default function AIChatInterface({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `🎵 Hi! I'm your AI Career Assistant. I've analyzed your profile and I'm ready to help you accelerate your music career.

I can help you with:
• Growth strategies tailored to your genre
• Social media and marketing advice  
• Release planning and promotion
• Revenue optimization
• Industry connections and networking

What would you like to work on today?`,
      timestamp: new Date(),
      suggestions: [
        'How do I get more streams?',
        'Create a release strategy',
        'Help me set goals',
        'Social media tips'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('growth') || message.includes('audience') || message.includes('followers')) {
      return SAMPLE_RESPONSES.growth;
    }
    if (message.includes('release') || message.includes('promote') || message.includes('launch')) {
      return SAMPLE_RESPONSES.release;
    }
    if (message.includes('money') || message.includes('revenue') || message.includes('income')) {
      return SAMPLE_RESPONSES.monetization;
    }
    if (message.includes('social media') || message.includes('content') || message.includes('tiktok')) {
      return SAMPLE_RESPONSES.social;
    }
    if (message.includes('goals') || message.includes('plan')) {
      return `Let's set some SMART goals for your music career:

**Short-term (1-3 months):**
- Reach 1,000 monthly Spotify listeners
- Build 500 social media followers
- Release 2 high-quality tracks
- Get featured on 3 playlists

**Medium-term (3-6 months):**
- Hit 5,000 monthly listeners
- Collaborate with 2 artists
- Earn first $100 from music
- Build email list of 200 fans

**Long-term (6-12 months):**
- 25,000+ monthly listeners  
- $500+ monthly music income
- Local venue performances
- Industry connections

Which timeframe would you like to focus on first?`;
    }
    
    // Generic responses for other queries
    const responses = [
      `That's a great question! Based on your profile and current goals, here's what I recommend...

Let me analyze your specific situation and provide personalized advice. Your genre (${localStorage.getItem('userGenre') || 'music'}) and career stage give us some unique opportunities.

Could you tell me more about what specifically you're trying to achieve?`,
      
      `I'd love to help you with that! Your music career has so much potential.

Based on successful artists in your position, here are some key strategies that tend to work well:

1. **Consistency** - Regular content and releases
2. **Authenticity** - Stay true to your sound  
3. **Community** - Build real connections with fans
4. **Quality** - Focus on improving your craft

What aspect would you like to dive deeper into?`,
      
      `Absolutely! This is exactly the kind of strategic thinking that separates successful artists from the rest.

Here's how we can approach this step by step:

**Step 1:** Define your target outcome
**Step 2:** Identify your current resources  
**Step 3:** Create an action plan
**Step 4:** Set measurable milestones

Which step should we start with?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(content),
        timestamp: new Date(),
        suggestions: [
          'Tell me more',
          'What\'s next?',
          'Give me examples',
          'Other options?'
        ]
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1500); // 1.5-3s delay
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              🤖
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI Career Assistant</h2>
              <p className="text-sm text-gray-500">Online • Ready to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-purple-200' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                
                {/* AI Suggestions */}
                {message.type === 'ai' && message.suggestions && (
                  <div className="mt-3 space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-2 py-1 text-xs bg-white text-gray-700 rounded border hover:bg-gray-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your music career..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={isTyping || !inputValue.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Ask specific questions for better advice (e.g., "How do I get 1000 Spotify listeners?")
          </p>
        </div>
      </div>
    </div>
  );
}