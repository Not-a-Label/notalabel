'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Mic, MicOff, Headphones, Sliders, Zap, Download,
  Play, Pause, Volume2, Activity, Sparkles, Settings,
  BarChart3, Waveform, RefreshCw, Save, Share2, Upload,
  Timer, Music, Radio, Filter, Loader2, CheckCircle,
  AlertCircle, TrendingUp, Gauge, Shield, Waves
} from 'lucide-react'

interface VocalAnalysis {
  pitch: {
    accuracy: number
    range: { min: number; max: number }
    stability: number
    vibrato: number
  }
  tone: {
    brightness: number
    warmth: number
    breathiness: number
    nasality: number
  }
  dynamics: {
    average: number
    range: number
    consistency: number
  }
  clarity: {
    articulation: number
    sibilance: number
    plosives: number
  }
  issues: VocalIssue[]
}

interface VocalIssue {
  type: 'pitch' | 'timing' | 'tone' | 'noise'
  severity: 'low' | 'medium' | 'high'
  timestamp: number
  description: string
  suggestion: string
}

interface EnhancementPreset {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  settings: VocalSettings
}

interface VocalSettings {
  pitchCorrection: {
    enabled: boolean
    strength: number
    speed: number
    preserveVibrato: boolean
  }
  toneShaping: {
    brightness: number
    warmth: number
    air: number
    body: number
  }
  dynamics: {
    compression: number
    expansion: number
    deEsser: number
    gate: number
  }
  effects: {
    reverb: number
    delay: number
    chorus: number
    harmony: boolean
  }
  noise: {
    reduction: number
    breathRemoval: number
    roomTone: number
  }
}

export default function AIVocalEnhancement() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysis, setAnalysis] = useState<VocalAnalysis | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>('natural')
  const [isPlaying, setIsPlaying] = useState(false)
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [compareMode, setCompareMode] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  
  const [settings, setSettings] = useState<VocalSettings>({
    pitchCorrection: {
      enabled: true,
      strength: 50,
      speed: 75,
      preserveVibrato: true
    },
    toneShaping: {
      brightness: 0,
      warmth: 0,
      air: 0,
      body: 0
    },
    dynamics: {
      compression: 30,
      expansion: 0,
      deEsser: 40,
      gate: 20
    },
    effects: {
      reverb: 15,
      delay: 0,
      chorus: 0,
      harmony: false
    },
    noise: {
      reduction: 30,
      breathRemoval: 50,
      roomTone: 20
    }
  })

  const presets: EnhancementPreset[] = [
    {
      id: 'natural',
      name: 'Natural',
      description: 'Subtle enhancement preserving original character',
      icon: <Mic />,
      settings: {
        pitchCorrection: { enabled: true, strength: 30, speed: 85, preserveVibrato: true },
        toneShaping: { brightness: 0, warmth: 10, air: 5, body: 0 },
        dynamics: { compression: 20, expansion: 0, deEsser: 30, gate: 15 },
        effects: { reverb: 10, delay: 0, chorus: 0, harmony: false },
        noise: { reduction: 20, breathRemoval: 30, roomTone: 15 }
      }
    },
    {
      id: 'pop',
      name: 'Pop Vocal',
      description: 'Bright, present, and radio-ready',
      icon: <Radio />,
      settings: {
        pitchCorrection: { enabled: true, strength: 80, speed: 95, preserveVibrato: false },
        toneShaping: { brightness: 40, warmth: -10, air: 30, body: -20 },
        dynamics: { compression: 60, expansion: 0, deEsser: 70, gate: 40 },
        effects: { reverb: 20, delay: 10, chorus: 5, harmony: true },
        noise: { reduction: 50, breathRemoval: 80, roomTone: 40 }
      }
    },
    {
      id: 'warm',
      name: 'Warm & Smooth',
      description: 'Rich, vintage-inspired vocal tone',
      icon: <Music />,
      settings: {
        pitchCorrection: { enabled: true, strength: 40, speed: 70, preserveVibrato: true },
        toneShaping: { brightness: -20, warmth: 50, air: -10, body: 30 },
        dynamics: { compression: 40, expansion: 10, deEsser: 20, gate: 10 },
        effects: { reverb: 25, delay: 0, chorus: 10, harmony: false },
        noise: { reduction: 30, breathRemoval: 40, roomTone: 20 }
      }
    },
    {
      id: 'podcast',
      name: 'Podcast',
      description: 'Clear speech with consistent levels',
      icon: <Headphones />,
      settings: {
        pitchCorrection: { enabled: false, strength: 0, speed: 0, preserveVibrato: false },
        toneShaping: { brightness: 10, warmth: 20, air: 0, body: 15 },
        dynamics: { compression: 50, expansion: 20, deEsser: 50, gate: 60 },
        effects: { reverb: 5, delay: 0, chorus: 0, harmony: false },
        noise: { reduction: 70, breathRemoval: 60, roomTone: 80 }
      }
    },
    {
      id: 'artistic',
      name: 'Artistic',
      description: 'Creative processing with character',
      icon: <Sparkles />,
      settings: {
        pitchCorrection: { enabled: true, strength: 60, speed: 50, preserveVibrato: true },
        toneShaping: { brightness: 20, warmth: 30, air: 40, body: 10 },
        dynamics: { compression: 30, expansion: 0, deEsser: 40, gate: 20 },
        effects: { reverb: 40, delay: 30, chorus: 20, harmony: true },
        noise: { reduction: 10, breathRemoval: 20, roomTone: 10 }
      }
    }
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      analyzeVocal(file)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' })
        setAudioFile(file)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        analyzeVocal(file)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      
      // Start timer
      const startTime = Date.now()
      const updateTimer = () => {
        if (isRecording) {
          setRecordingTime(Math.floor((Date.now() - startTime) / 1000))
          requestAnimationFrame(updateTimer)
        }
      }
      updateTimer()
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const analyzeVocal = async (file: File) => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock analysis results
      const mockAnalysis: VocalAnalysis = {
        pitch: {
          accuracy: 85 + Math.random() * 15,
          range: { min: 80, max: 600 },
          stability: 70 + Math.random() * 30,
          vibrato: Math.random() * 50
        },
        tone: {
          brightness: Math.random() * 100,
          warmth: Math.random() * 100,
          breathiness: Math.random() * 50,
          nasality: Math.random() * 30
        },
        dynamics: {
          average: -20 + Math.random() * 10,
          range: 15 + Math.random() * 10,
          consistency: 60 + Math.random() * 40
        },
        clarity: {
          articulation: 70 + Math.random() * 30,
          sibilance: Math.random() * 50,
          plosives: Math.random() * 50
        },
        issues: generateVocalIssues()
      }
      
      setAnalysis(mockAnalysis)
    } catch (error) {
      console.error('Error analyzing vocal:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateVocalIssues = (): VocalIssue[] => {
    const issues: VocalIssue[] = []
    
    if (Math.random() > 0.5) {
      issues.push({
        type: 'pitch',
        severity: 'medium',
        timestamp: 2.4,
        description: 'Slight pitch drift detected',
        suggestion: 'Apply moderate pitch correction (50-70% strength)'
      })
    }
    
    if (Math.random() > 0.6) {
      issues.push({
        type: 'tone',
        severity: 'low',
        timestamp: 5.1,
        description: 'Excessive sibilance in "s" sounds',
        suggestion: 'Increase de-esser to reduce harshness'
      })
    }
    
    if (Math.random() > 0.7) {
      issues.push({
        type: 'noise',
        severity: 'low',
        timestamp: 0,
        description: 'Background room noise detected',
        suggestion: 'Apply noise reduction (30-50%)'
      })
    }
    
    return issues
  }

  const applyEnhancement = async () => {
    if (!audioFile) return
    
    setIsProcessing(true)
    
    try {
      // In a real app, this would send to an audio processing API
      await new Promise(resolve => setTimeout(resolve, 4000))
      
      // For demo, we'll use the original audio
      setProcessedAudioUrl(audioUrl)
      
      // Show success notification
      console.log('Vocal enhanced successfully!')
    } catch (error) {
      console.error('Error processing vocal:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const applyPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (preset) {
      setSettings(preset.settings)
      setSelectedPreset(presetId)
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
      a.download = `enhanced_${audioFile?.name || 'vocal.wav'}`
      a.click()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Vocal Enhancement</h1>
              <p className="text-gray-400 mt-1">Professional vocal processing powered by AI</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center gap-2">
                <Settings size={20} />
                Advanced
              </button>
              <button className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2">
                <Sparkles size={20} />
                AI Auto-Enhance
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Analysis */}
          <div className="space-y-6">
            {/* File Upload / Recording */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Input Source</h2>
              
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-600 rounded-lg p-6 hover:border-purple-500 transition-colors"
                >
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-400">Upload vocal file</p>
                  <p className="text-xs text-gray-500 mt-1">WAV, MP3, FLAC</p>
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">OR</span>
                  </div>
                </div>
                
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full p-4 rounded-lg flex items-center justify-center gap-3 ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      Recording... {formatTime(recordingTime)}
                    </>
                  ) : (
                    <>
                      <Mic size={20} />
                      Record Vocal
                    </>
                  )}
                </button>
              </div>
              
              {audioFile && (
                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Music className="text-purple-400" />
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
                  Vocal Analysis
                </h3>
                
                <div className="space-y-4">
                  {/* Pitch Analysis */}
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Pitch Performance</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Accuracy</span>
                        <span className="text-xs font-mono">{analysis.pitch.accuracy.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${analysis.pitch.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tone Characteristics */}
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Tone Characteristics</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-xs text-gray-400">Brightness</p>
                        <p className="font-mono">{analysis.tone.brightness.toFixed(0)}%</p>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-xs text-gray-400">Warmth</p>
                        <p className="font-mono">{analysis.tone.warmth.toFixed(0)}%</p>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-xs text-gray-400">Breathiness</p>
                        <p className="font-mono">{analysis.tone.breathiness.toFixed(0)}%</p>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-xs text-gray-400">Clarity</p>
                        <p className="font-mono">{analysis.clarity.articulation.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Issues Detected */}
                  {analysis.issues.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Issues Detected</p>
                      <div className="space-y-2">
                        {analysis.issues.map((issue, index) => (
                          <div key={index} className="bg-gray-700 rounded p-3">
                            <div className="flex items-start gap-2">
                              {issue.severity === 'high' ? (
                                <AlertCircle className="text-red-400 mt-0.5" size={16} />
                              ) : issue.severity === 'medium' ? (
                                <AlertCircle className="text-yellow-400 mt-0.5" size={16} />
                              ) : (
                                <AlertCircle className="text-blue-400 mt-0.5" size={16} />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium">{issue.description}</p>
                                <p className="text-xs text-gray-400 mt-1">{issue.suggestion}</p>
                                {issue.timestamp > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    At {issue.timestamp.toFixed(1)}s
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Middle & Right Columns - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Preview</h2>
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
              
              {/* Waveform */}
              <div className="bg-gray-700 rounded-lg h-24 mb-4 flex items-center justify-center">
                <Waveform className="text-gray-500" size={48} />
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={togglePlayback}
                  className="p-4 bg-purple-600 rounded-full hover:bg-purple-700"
                  disabled={!audioUrl}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
              </div>
              
              <audio 
                ref={audioRef} 
                src={compareMode && processedAudioUrl ? processedAudioUrl : audioUrl || undefined}
                onEnded={() => setIsPlaying(false)}
              />
            </div>

            {/* Enhancement Presets */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Enhancement Presets</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {presets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPreset === preset.id
                        ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2 text-purple-400">
                      {preset.icon}
                    </div>
                    <p className="font-medium">{preset.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch Correction */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pitch Correction</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.pitchCorrection.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      pitchCorrection: { ...settings.pitchCorrection, enabled: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">Enabled</span>
                </label>
              </div>
              
              <div className="space-y-4 opacity-${settings.pitchCorrection.enabled ? '100' : '50'}">
                <div>
                  <label className="text-sm text-gray-400">Correction Strength</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.pitchCorrection.strength}
                    onChange={(e) => setSettings({
                      ...settings,
                      pitchCorrection: { ...settings.pitchCorrection, strength: Number(e.target.value) }
                    })}
                    disabled={!settings.pitchCorrection.enabled}
                    className="w-full mt-1"
                  />
                  <span className="text-xs font-mono">{settings.pitchCorrection.strength}%</span>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Correction Speed</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.pitchCorrection.speed}
                    onChange={(e) => setSettings({
                      ...settings,
                      pitchCorrection: { ...settings.pitchCorrection, speed: Number(e.target.value) }
                    })}
                    disabled={!settings.pitchCorrection.enabled}
                    className="w-full mt-1"
                  />
                  <span className="text-xs font-mono">{settings.pitchCorrection.speed}%</span>
                </div>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.pitchCorrection.preserveVibrato}
                    onChange={(e) => setSettings({
                      ...settings,
                      pitchCorrection: { ...settings.pitchCorrection, preserveVibrato: e.target.checked }
                    })}
                    disabled={!settings.pitchCorrection.enabled}
                    className="rounded"
                  />
                  <span className="text-sm">Preserve Natural Vibrato</span>
                </label>
              </div>
            </div>

            {/* Tone Shaping */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Tone Shaping</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Brightness</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={settings.toneShaping.brightness}
                    onChange={(e) => setSettings({
                      ...settings,
                      toneShaping: { ...settings.toneShaping, brightness: Number(e.target.value) }
                    })}
                    className="w-full mt-1"
                  />
                  <span className="text-xs font-mono">{settings.toneShaping.brightness > 0 ? '+' : ''}{settings.toneShaping.brightness}</span>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Warmth</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={settings.toneShaping.warmth}
                    onChange={(e) => setSettings({
                      ...settings,
                      toneShaping: { ...settings.toneShaping, warmth: Number(e.target.value) }
                    })}
                    className="w-full mt-1"
                  />
                  <span className="text-xs font-mono">{settings.toneShaping.warmth > 0 ? '+' : ''}{settings.toneShaping.warmth}</span>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Air</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={settings.toneShaping.air}
                    onChange={(e) => setSettings({
                      ...settings,
                      toneShaping: { ...settings.toneShaping, air: Number(e.target.value) }
                    })}
                    className="w-full mt-1"
                  />
                  <span className="text-xs font-mono">{settings.toneShaping.air > 0 ? '+' : ''}{settings.toneShaping.air}</span>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Body</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={settings.toneShaping.body}
                    onChange={(e) => setSettings({
                      ...settings,
                      toneShaping: { ...settings.toneShaping, body: Number(e.target.value) }
                    })}
                    className="w-full mt-1"
                  />
                  <span className="text-xs font-mono">{settings.toneShaping.body > 0 ? '+' : ''}{settings.toneShaping.body}</span>
                </div>
              </div>
            </div>

            {/* Dynamics & Noise */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Dynamics</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Compression</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.dynamics.compression}
                      onChange={(e) => setSettings({
                        ...settings,
                        dynamics: { ...settings.dynamics, compression: Number(e.target.value) }
                      })}
                      className="w-full mt-1"
                    />
                    <span className="text-xs font-mono">{settings.dynamics.compression}%</span>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">De-Esser</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.dynamics.deEsser}
                      onChange={(e) => setSettings({
                        ...settings,
                        dynamics: { ...settings.dynamics, deEsser: Number(e.target.value) }
                      })}
                      className="w-full mt-1"
                    />
                    <span className="text-xs font-mono">{settings.dynamics.deEsser}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Noise Control</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Noise Reduction</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.noise.reduction}
                      onChange={(e) => setSettings({
                        ...settings,
                        noise: { ...settings.noise, reduction: Number(e.target.value) }
                      })}
                      className="w-full mt-1"
                    />
                    <span className="text-xs font-mono">{settings.noise.reduction}%</span>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Breath Removal</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.noise.breathRemoval}
                      onChange={(e) => setSettings({
                        ...settings,
                        noise: { ...settings.noise, breathRemoval: Number(e.target.value) }
                      })}
                      className="w-full mt-1"
                    />
                    <span className="text-xs font-mono">{settings.noise.breathRemoval}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={applyEnhancement}
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
                    Enhance Vocal
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