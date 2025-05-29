'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Sliders, Headphones, Activity, Zap, Download, Upload,
  Play, Pause, SkipBack, SkipForward, Volume2, Loader2,
  Waveform, BarChart3, Settings, Sparkles, Music,
  Mic, Speaker, Radio, Gauge, TrendingUp, AlertCircle,
  CheckCircle, RefreshCw, Save, Share2, FileAudio
} from 'lucide-react'

interface AudioAnalysis {
  frequency: {
    bass: number
    mid: number
    treble: number
  }
  dynamics: {
    rms: number
    peak: number
    lufs: number
    dynamic_range: number
  }
  clarity: {
    muddiness: number
    harshness: number
    presence: number
  }
  stereo: {
    width: number
    balance: number
    correlation: number
  }
}

interface MixingSuggestion {
  parameter: string
  current: number
  suggested: number
  reason: string
  impact: 'high' | 'medium' | 'low'
}

interface MasteringPreset {
  id: string
  name: string
  genre: string
  description: string
  settings: {
    eq: Record<string, number>
    compression: {
      threshold: number
      ratio: number
      attack: number
      release: number
    }
    limiting: {
      ceiling: number
      release: number
    }
    stereoWidth: number
    warmth: number
  }
}

export default function AIMixingMastering() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null)
  const [suggestions, setSuggestions] = useState<MixingSuggestion[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string>('balanced')
  const [isPlaying, setIsPlaying] = useState(false)
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Mixing parameters
  const [mixSettings, setMixSettings] = useState({
    eq: {
      '60hz': 0,
      '200hz': 0,
      '800hz': 0,
      '3khz': 0,
      '10khz': 0
    },
    compression: {
      threshold: -24,
      ratio: 4,
      attack: 10,
      release: 100
    },
    limiting: {
      ceiling: -0.3,
      release: 50
    },
    stereoWidth: 100,
    warmth: 0,
    autoGain: true
  })

  const masteringPresets: MasteringPreset[] = [
    {
      id: 'balanced',
      name: 'Balanced',
      genre: 'All',
      description: 'Natural, transparent mastering',
      settings: {
        eq: { '60hz': 0, '200hz': 0, '800hz': 0, '3khz': 0, '10khz': 0 },
        compression: { threshold: -24, ratio: 4, attack: 10, release: 100 },
        limiting: { ceiling: -0.3, release: 50 },
        stereoWidth: 100,
        warmth: 0
      }
    },
    {
      id: 'warm-vintage',
      name: 'Warm & Vintage',
      genre: 'Rock, Jazz',
      description: 'Analog warmth with smooth highs',
      settings: {
        eq: { '60hz': 2, '200hz': 1, '800hz': -1, '3khz': -2, '10khz': -3 },
        compression: { threshold: -20, ratio: 3, attack: 30, release: 200 },
        limiting: { ceiling: -0.5, release: 100 },
        stereoWidth: 90,
        warmth: 30
      }
    },
    {
      id: 'modern-bright',
      name: 'Modern & Bright',
      genre: 'Pop, EDM',
      description: 'Crisp highs and punchy lows',
      settings: {
        eq: { '60hz': 3, '200hz': -2, '800hz': 0, '3khz': 3, '10khz': 4 },
        compression: { threshold: -18, ratio: 6, attack: 5, release: 50 },
        limiting: { ceiling: -0.1, release: 10 },
        stereoWidth: 120,
        warmth: -10
      }
    },
    {
      id: 'hip-hop',
      name: 'Hip-Hop',
      genre: 'Hip-Hop, Trap',
      description: 'Heavy bass and crisp vocals',
      settings: {
        eq: { '60hz': 5, '200hz': 2, '800hz': -1, '3khz': 2, '10khz': 3 },
        compression: { threshold: -15, ratio: 8, attack: 1, release: 30 },
        limiting: { ceiling: -0.1, release: 5 },
        stereoWidth: 110,
        warmth: 10
      }
    },
    {
      id: 'acoustic',
      name: 'Acoustic',
      genre: 'Folk, Singer-Songwriter',
      description: 'Natural dynamics and warmth',
      settings: {
        eq: { '60hz': -1, '200hz': 1, '800hz': 0, '3khz': 1, '10khz': 0 },
        compression: { threshold: -30, ratio: 2, attack: 50, release: 300 },
        limiting: { ceiling: -1, release: 200 },
        stereoWidth: 100,
        warmth: 20
      }
    }
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      analyzeAudio(file)
    }
  }

  const analyzeAudio = async (file: File) => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock analysis results
      const mockAnalysis: AudioAnalysis = {
        frequency: {
          bass: Math.random() * 100,
          mid: Math.random() * 100,
          treble: Math.random() * 100
        },
        dynamics: {
          rms: -20 + Math.random() * 10,
          peak: -6 + Math.random() * 6,
          lufs: -14 + Math.random() * 4,
          dynamic_range: 6 + Math.random() * 6
        },
        clarity: {
          muddiness: Math.random() * 50,
          harshness: Math.random() * 50,
          presence: 50 + Math.random() * 50
        },
        stereo: {
          width: 50 + Math.random() * 50,
          balance: -10 + Math.random() * 20,
          correlation: 0.5 + Math.random() * 0.5
        }
      }
      
      setAnalysis(mockAnalysis)
      generateSuggestions(mockAnalysis)
    } catch (error) {
      console.error('Error analyzing audio:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateSuggestions = (analysis: AudioAnalysis) => {
    const suggestions: MixingSuggestion[] = []
    
    // Frequency suggestions
    if (analysis.frequency.bass > 70) {
      suggestions.push({
        parameter: 'Low Frequency',
        current: analysis.frequency.bass,
        suggested: 60,
        reason: 'Bass frequencies are overpowering. Reduce 60-200Hz by 3-6dB.',
        impact: 'high'
      })
    }
    
    if (analysis.clarity.harshness > 30) {
      suggestions.push({
        parameter: 'High-Mid Frequency',
        current: analysis.clarity.harshness,
        suggested: 15,
        reason: 'Harsh frequencies detected. Cut around 2-4kHz to reduce ear fatigue.',
        impact: 'medium'
      })
    }
    
    // Dynamics suggestions
    if (analysis.dynamics.dynamic_range < 6) {
      suggestions.push({
        parameter: 'Compression',
        current: analysis.dynamics.dynamic_range,
        suggested: 8,
        reason: 'Over-compressed. Reduce ratio or increase threshold for more dynamics.',
        impact: 'high'
      })
    }
    
    // Stereo suggestions
    if (analysis.stereo.correlation < 0.7) {
      suggestions.push({
        parameter: 'Stereo Width',
        current: analysis.stereo.correlation,
        suggested: 0.85,
        reason: 'Phase issues detected. Reduce stereo width to improve mono compatibility.',
        impact: 'medium'
      })
    }
    
    setSuggestions(suggestions)
  }

  const applyAISuggestions = () => {
    // Apply AI-suggested settings
    const newSettings = { ...mixSettings }
    
    suggestions.forEach(suggestion => {
      switch (suggestion.parameter) {
        case 'Low Frequency':
          newSettings.eq['60hz'] = -3
          newSettings.eq['200hz'] = -2
          break
        case 'High-Mid Frequency':
          newSettings.eq['3khz'] = -4
          break
        case 'Compression':
          newSettings.compression.ratio = 3
          newSettings.compression.threshold = -28
          break
        case 'Stereo Width':
          newSettings.stereoWidth = 85
          break
      }
    })
    
    setMixSettings(newSettings)
    processAudio()
  }

  const processAudio = async () => {
    if (!audioFile) return
    
    setIsProcessing(true)
    
    try {
      // In a real app, this would send to an audio processing API
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // For demo, we'll use the original audio
      setProcessedAudioUrl(audioUrl)
      
      // Show success notification
      console.log('Audio processed successfully!')
    } catch (error) {
      console.error('Error processing audio:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const downloadProcessed = () => {
    if (processedAudioUrl) {
      const a = document.createElement('a')
      a.href = processedAudioUrl
      a.download = `mastered_${audioFile?.name || 'audio.wav'}`
      a.click()
    }
  }

  const applyPreset = (presetId: string) => {
    const preset = masteringPresets.find(p => p.id === presetId)
    if (preset) {
      setMixSettings({
        ...mixSettings,
        ...preset.settings
      })
      setSelectedPreset(presetId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Mixing & Mastering</h1>
              <p className="text-gray-400 mt-1">Professional audio processing powered by AI</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center gap-2">
                <Settings size={20} />
                Advanced
              </button>
              <button className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2">
                <Sparkles size={20} />
                AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Analysis */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Track</h2>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-purple-500 transition-colors"
              >
                <Upload className="mx-auto mb-3 text-gray-400" size={48} />
                <p className="text-gray-400">Click to upload audio file</p>
                <p className="text-sm text-gray-500 mt-1">WAV, MP3, FLAC (max 100MB)</p>
              </button>
              
              {audioFile && (
                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileAudio className="text-purple-400" />
                    <div className="flex-1">
                      <p className="font-medium">{audioFile.name}</p>
                      <p className="text-sm text-gray-400">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis */}
            {analysis && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="text-purple-400" />
                  AI Analysis
                </h3>
                
                <div className="space-y-4">
                  {/* Frequency Balance */}
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Frequency Balance</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs w-12">Bass</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${analysis.frequency.bass}%` }}
                          />
                        </div>
                        <span className="text-xs w-10 text-right">{Math.round(analysis.frequency.bass)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs w-12">Mid</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${analysis.frequency.mid}%` }}
                          />
                        </div>
                        <span className="text-xs w-10 text-right">{Math.round(analysis.frequency.mid)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs w-12">Treble</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${analysis.frequency.treble}%` }}
                          />
                        </div>
                        <span className="text-xs w-10 text-right">{Math.round(analysis.frequency.treble)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamics */}
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Dynamics</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-gray-400 text-xs">LUFS</p>
                        <p className="font-mono">{analysis.dynamics.lufs.toFixed(1)}</p>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-gray-400 text-xs">Peak</p>
                        <p className="font-mono">{analysis.dynamics.peak.toFixed(1)} dB</p>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-gray-400 text-xs">RMS</p>
                        <p className="font-mono">{analysis.dynamics.rms.toFixed(1)} dB</p>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-gray-400 text-xs">Range</p>
                        <p className="font-mono">{analysis.dynamics.dynamic_range.toFixed(1)} LU</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="text-yellow-400" />
                    AI Suggestions
                  </h3>
                  <button
                    onClick={applyAISuggestions}
                    className="text-sm bg-purple-600 px-3 py-1 rounded hover:bg-purple-700"
                  >
                    Apply All
                  </button>
                </div>
                
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        {suggestion.impact === 'high' ? (
                          <AlertCircle className="text-red-400 mt-0.5" size={16} />
                        ) : (
                          <AlertCircle className="text-yellow-400 mt-0.5" size={16} />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{suggestion.parameter}</p>
                          <p className="text-xs text-gray-400 mt-1">{suggestion.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Middle Column - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Audio Player</h2>
                {processedAudioUrl && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={compareMode}
                      onChange={(e) => setCompareMode(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">A/B Compare</span>
                  </label>
                )}
              </div>
              
              {/* Waveform Visualization */}
              <div className="bg-gray-700 rounded-lg h-32 mb-4 flex items-center justify-center">
                <Waveform className="text-gray-500" size={48} />
              </div>
              
              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button className="p-2 hover:bg-gray-700 rounded">
                  <SkipBack size={20} />
                </button>
                <button
                  onClick={togglePlayback}
                  className="p-4 bg-purple-600 rounded-full hover:bg-purple-700"
                  disabled={!audioUrl}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button className="p-2 hover:bg-gray-700 rounded">
                  <SkipForward size={20} />
                </button>
              </div>
              
              {/* Volume */}
              <div className="flex items-center gap-3">
                <Volume2 size={20} className="text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="75"
                  className="flex-1"
                />
              </div>
              
              <audio ref={audioRef} src={compareMode && processedAudioUrl ? processedAudioUrl : audioUrl || undefined} />
            </div>

            {/* Mastering Presets */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Mastering Presets</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {masteringPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPreset === preset.id
                        ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <p className="font-medium">{preset.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{preset.genre}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* EQ Controls */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sliders className="text-purple-400" />
                Equalizer
              </h3>
              
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(mixSettings.eq).map(([freq, value]) => (
                  <div key={freq} className="text-center">
                    <div className="h-32 relative">
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        value={value}
                        onChange={(e) => setMixSettings({
                          ...mixSettings,
                          eq: { ...mixSettings.eq, [freq]: Number(e.target.value) }
                        })}
                        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-90"
                        style={{ width: '120px' }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">{freq}</p>
                    <p className="text-sm font-mono">{value > 0 ? '+' : ''}{value}dB</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamics Controls */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Gauge className="text-purple-400" />
                Dynamics Processing
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Compressor */}
                <div>
                  <h4 className="font-medium mb-3">Compressor</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Threshold</label>
                      <input
                        type="range"
                        min="-40"
                        max="0"
                        value={mixSettings.compression.threshold}
                        onChange={(e) => setMixSettings({
                          ...mixSettings,
                          compression: { ...mixSettings.compression, threshold: Number(e.target.value) }
                        })}
                        className="w-full"
                      />
                      <span className="text-xs font-mono">{mixSettings.compression.threshold} dB</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Ratio</label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={mixSettings.compression.ratio}
                        onChange={(e) => setMixSettings({
                          ...mixSettings,
                          compression: { ...mixSettings.compression, ratio: Number(e.target.value) }
                        })}
                        className="w-full"
                      />
                      <span className="text-xs font-mono">{mixSettings.compression.ratio}:1</span>
                    </div>
                  </div>
                </div>
                
                {/* Limiter */}
                <div>
                  <h4 className="font-medium mb-3">Limiter</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Ceiling</label>
                      <input
                        type="range"
                        min="-3"
                        max="0"
                        step="0.1"
                        value={mixSettings.limiting.ceiling}
                        onChange={(e) => setMixSettings({
                          ...mixSettings,
                          limiting: { ...mixSettings.limiting, ceiling: Number(e.target.value) }
                        })}
                        className="w-full"
                      />
                      <span className="text-xs font-mono">{mixSettings.limiting.ceiling} dB</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Release</label>
                      <input
                        type="range"
                        min="1"
                        max="1000"
                        value={mixSettings.limiting.release}
                        onChange={(e) => setMixSettings({
                          ...mixSettings,
                          limiting: { ...mixSettings.limiting, release: Number(e.target.value) }
                        })}
                        className="w-full"
                      />
                      <span className="text-xs font-mono">{mixSettings.limiting.release} ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={processAudio}
                disabled={!audioFile || isProcessing}
                className="flex-1 bg-purple-600 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Process with AI
                  </>
                )}
              </button>
              
              <button
                onClick={downloadProcessed}
                disabled={!processedAudioUrl}
                className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download size={20} />
                Download
              </button>
              
              <button className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center gap-2">
                <Share2 size={20} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}