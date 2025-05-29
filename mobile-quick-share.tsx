'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Share2, Camera, Image, Music, FileText, Link,
  Instagram, Twitter, Facebook, Youtube, Send,
  Copy, Download, QrCode, Mail, MessageCircle,
  Globe, Hash, AtSign, MapPin, Calendar, Clock,
  Zap, TrendingUp, Users, Heart, Eye, ChevronRight,
  X, Check, Loader2, Upload, Smartphone, Radio
} from 'lucide-react'

interface ShareTemplate {
  id: string
  name: string
  icon: React.ReactNode
  platforms: string[]
  content: {
    title: string
    description: string
    hashtags: string[]
    mentions: string[]
    link?: string
    media?: string
  }
}

interface Platform {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  maxChars?: number
  mediaTypes: string[]
  features: string[]
}

interface ShareAnalytics {
  platform: string
  shares: number
  clicks: number
  engagement: number
  topTime: string
}

export default function MobileQuickShare() {
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [shareType, setShareType] = useState<'track' | 'image' | 'story' | 'link'>('track')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [templates, setTemplates] = useState<ShareTemplate[]>([])
  const [analytics, setAnalytics] = useState<ShareAnalytics[]>([])
  const [showQRCode, setShowQRCode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const platforms: Platform[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram />,
      color: 'from-purple-500 to-pink-500',
      mediaTypes: ['image', 'video', 'story'],
      features: ['stories', 'reels', 'posts']
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter />,
      color: 'from-blue-400 to-blue-600',
      maxChars: 280,
      mediaTypes: ['image', 'video', 'link'],
      features: ['threads', 'polls']
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook />,
      color: 'from-blue-600 to-blue-800',
      mediaTypes: ['image', 'video', 'link'],
      features: ['stories', 'events']
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: <Youtube />,
      color: 'from-red-500 to-red-700',
      mediaTypes: ['video'],
      features: ['shorts', 'community']
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: <Music />,
      color: 'from-gray-900 to-gray-700',
      mediaTypes: ['video'],
      features: ['sounds', 'effects']
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: <Radio />,
      color: 'from-green-400 to-green-600',
      mediaTypes: ['link'],
      features: ['canvas', 'storyline']
    }
  ]

  useEffect(() => {
    loadTemplates()
    loadAnalytics()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/share/templates')
      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/share/analytics')
      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedContent({
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: event.target?.result,
          file
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const generateCaption = () => {
    // AI-powered caption generation
    const templates = [
      "🎵 New music alert! Check out my latest track '{title}' 🔥",
      "Just dropped something special for you all 💜 Link in bio!",
      "Been working on this one for months... '{title}' is finally here! 🎶",
      "Vibes on vibes 🌊 Stream '{title}' now on all platforms"
    ]
    
    const template = templates[Math.floor(Math.random() * templates.length)]
    setCaption(template.replace('{title}', selectedContent?.title || 'Untitled'))
  }

  const suggestHashtags = () => {
    // AI-powered hashtag suggestions
    const suggestions = [
      '#newmusic', '#indieartist', '#musicproducer', '#originalmusic',
      '#unsignedartist', '#musicislife', '#instamusic', '#musician',
      '#songwriter', '#producer', '#beatmaker', '#studiolife'
    ]
    
    const genre = selectedContent?.genre || 'indie'
    const genreTags = {
      'indie': ['#indiemusic', '#indierock', '#indiepop'],
      'electronic': ['#electronicmusic', '#edm', '#housemusic'],
      'hiphop': ['#hiphop', '#rap', '#beats'],
      'pop': ['#popmusic', '#popsinger', '#popstar']
    }
    
    setHashtags([...suggestions.slice(0, 5), ...(genreTags[genre] || [])])
  }

  const shareContent = async () => {
    setIsSharing(true)
    
    try {
      const shareData = {
        platforms: selectedPlatforms,
        content: selectedContent,
        caption,
        hashtags,
        scheduledTime
      }
      
      if (scheduledTime) {
        // Schedule for later
        await fetch('/api/share/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shareData)
        })
      } else {
        // Share immediately
        if (navigator.share && selectedPlatforms.includes('native')) {
          await navigator.share({
            title: selectedContent?.title,
            text: caption,
            url: selectedContent?.url
          })
        } else {
          // Use platform APIs
          await fetch('/api/share/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shareData)
          })
        }
      }
      
      // Track analytics
      trackShare()
      
      // Reset form
      resetForm()
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const trackShare = () => {
    selectedPlatforms.forEach(platform => {
      // Analytics tracking
      if (window.gtag) {
        window.gtag('event', 'share', {
          method: platform,
          content_type: shareType,
          content_id: selectedContent?.id
        })
      }
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Show success toast
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const generateQRCode = () => {
    // Generate QR code for the share link
    setShowQRCode(true)
  }

  const resetForm = () => {
    setSelectedContent(null)
    setSelectedPlatforms([])
    setCaption('')
    setHashtags([])
    setScheduledTime(null)
  }

  const canShare = selectedContent && selectedPlatforms.length > 0 && caption.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Quick Share</h1>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Selection */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!selectedContent ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">What do you want to share?</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setShareType('track')
                  // Load recent tracks
                }}
                className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50"
              >
                <Music className="mx-auto mb-2 text-purple-600" size={32} />
                <div className="font-medium">Music Track</div>
                <div className="text-sm text-gray-500">Share your latest release</div>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50"
              >
                <Image className="mx-auto mb-2 text-purple-600" size={32} />
                <div className="font-medium">Photo/Video</div>
                <div className="text-sm text-gray-500">Upload from gallery</div>
              </button>
              
              <button
                onClick={() => {
                  setShareType('story')
                  // Open story creator
                }}
                className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50"
              >
                <Camera className="mx-auto mb-2 text-purple-600" size={32} />
                <div className="font-medium">Story</div>
                <div className="text-sm text-gray-500">Create a quick story</div>
              </button>
              
              <button
                onClick={() => {
                  setShareType('link')
                  // Open link sharing
                }}
                className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50"
              >
                <Link className="mx-auto mb-2 text-purple-600" size={32} />
                <div className="font-medium">Link</div>
                <div className="text-sm text-gray-500">Share any URL</div>
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <>
            {/* Selected Content Preview */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  {selectedContent.type === 'track' ? (
                    <Music className="text-gray-400" size={32} />
                  ) : selectedContent.type === 'image' ? (
                    <img src={selectedContent.url} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <FileText className="text-gray-400" size={32} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedContent.title || 'Untitled'}</h3>
                  <p className="text-sm text-gray-600">{selectedContent.description}</p>
                </div>
              </div>
              
              {/* Caption */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium">Caption</label>
                  <button
                    onClick={generateCaption}
                    className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                  >
                    <Zap size={14} />
                    Generate
                  </button>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                  rows={3}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {caption.length} / 280
                </div>
              </div>
              
              {/* Hashtags */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium">Hashtags</label>
                  <button
                    onClick={suggestHashtags}
                    className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                  >
                    <Hash size={14} />
                    Suggest
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => setHashtags(hashtags.filter((_, i) => i !== index))}
                        className="hover:text-purple-900"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <button className="text-purple-600 hover:text-purple-700 text-sm">
                    + Add tag
                  </button>
                </div>
              </div>
            </div>

            {/* Platform Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="font-semibold mb-4">Share to</h3>
              <div className="grid grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => {
                      if (selectedPlatforms.includes(platform.id)) {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id))
                      } else {
                        setSelectedPlatforms([...selectedPlatforms, platform.id])
                      }
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`bg-gradient-to-r ${platform.color} w-10 h-10 rounded-lg flex items-center justify-center text-white mx-auto mb-2`}>
                      {platform.icon}
                    </div>
                    <div className="text-sm font-medium">{platform.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Options */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="font-semibold mb-4">When to share</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setScheduledTime(null)}
                  className={`p-4 rounded-lg border-2 ${
                    !scheduledTime
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200'
                  }`}
                >
                  <Zap className="mx-auto mb-2 text-purple-600" size={24} />
                  <div className="font-medium">Now</div>
                </button>
                <button
                  onClick={() => setScheduledTime(new Date())}
                  className={`p-4 rounded-lg border-2 ${
                    scheduledTime
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200'
                  }`}
                >
                  <Clock className="mx-auto mb-2 text-purple-600" size={24} />
                  <div className="font-medium">Schedule</div>
                </button>
              </div>
              
              {scheduledTime && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="datetime-local"
                    value={scheduledTime.toISOString().slice(0, 16)}
                    onChange={(e) => setScheduledTime(new Date(e.target.value))}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Share Analytics Preview */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="font-semibold mb-4">Expected Performance</h3>
              <div className="space-y-3">
                {selectedPlatforms.map(platformId => {
                  const platform = platforms.find(p => p.id === platformId)
                  const stats = analytics.find(a => a.platform === platformId)
                  
                  return (
                    <div key={platformId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`bg-gradient-to-r ${platform?.color} w-8 h-8 rounded-lg flex items-center justify-center text-white`}>
                          {platform?.icon}
                        </div>
                        <div>
                          <div className="font-medium">{platform?.name}</div>
                          <div className="text-sm text-gray-600">
                            Best time: {stats?.topTime || '7-9 PM'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{stats?.engagement || 0}%</div>
                        <div className="text-sm text-gray-600">engagement</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={shareContent}
                disabled={!canShare || isSharing}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    {scheduledTime ? 'Schedule' : 'Share Now'}
                  </>
                )}
              </button>
              
              <button
                onClick={generateQRCode}
                className="p-3 border rounded-lg hover:bg-gray-50"
              >
                <QrCode size={20} />
              </button>
              
              <button
                onClick={() => copyToClipboard(selectedContent.url)}
                className="p-3 border rounded-lg hover:bg-gray-50"
              >
                <Copy size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}