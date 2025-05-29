'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Piano, Music, Play, Pause, RefreshCw, Download, Save,
  Shuffle, Heart, Share2, Zap, TrendingUp, Clock,
  Volume2, Settings, ChevronLeft, ChevronRight, Sparkles,
  Grid, Layers, FileMusic, Copy, Edit, Mic, Guitar
} from 'lucide-react'

interface Chord {
  root: string
  type: string
  symbol: string
  notes: string[]
  roman: string
  color: string
}

interface ChordProgression {
  id: string
  name: string
  key: string
  mode: 'major' | 'minor'
  tempo: number
  timeSignature: string
  chords: Chord[]
  genre: string
  mood: string
  energy: number
  complexity: number
}

interface ChordSuggestion {
  chord: Chord
  probability: number
  reasoning: string
  tension: number
}

interface Scale {
  name: string
  notes: string[]
  intervals: string[]
}

export default function AIChordProgression() {
  const [selectedKey, setSelectedKey] = useState('C')
  const [selectedMode, setSelectedMode] = useState<'major' | 'minor'>('major')
  const [selectedGenre, setSelectedGenre] = useState('pop')
  const [selectedMood, setSelectedMood] = useState('happy')
  const [tempo, setTempo] = useState(120)
  const [currentProgression, setCurrentProgression] = useState<ChordProgression | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentChordIndex, setCurrentChordIndex] = useState(0)
  const [suggestions, setSuggestions] = useState<ChordSuggestion[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [history, setHistory] = useState<ChordProgression[]>([])
  const [showPiano, setShowPiano] = useState(true)
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const nextNoteTimeRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  
  const genres = [
    { id: 'pop', name: 'Pop', icon: '🎵' },
    { id: 'rock', name: 'Rock', icon: '🎸' },
    { id: 'jazz', name: 'Jazz', icon: '🎷' },
    { id: 'edm', name: 'EDM', icon: '🎛️' },
    { id: 'classical', name: 'Classical', icon: '🎻' },
    { id: 'hip-hop', name: 'Hip-Hop', icon: '🎤' },
    { id: 'folk', name: 'Folk', icon: '🪕' },
    { id: 'blues', name: 'Blues', icon: '🎺' }
  ]

  const moods = [
    { id: 'happy', name: 'Happy', color: 'yellow' },
    { id: 'sad', name: 'Sad', color: 'blue' },
    { id: 'energetic', name: 'Energetic', color: 'red' },
    { id: 'calm', name: 'Calm', color: 'green' },
    { id: 'mysterious', name: 'Mysterious', color: 'purple' },
    { id: 'romantic', name: 'Romantic', color: 'pink' },
    { id: 'dark', name: 'Dark', color: 'gray' },
    { id: 'uplifting', name: 'Uplifting', color: 'orange' }
  ]

  const chordTypes = {
    major: { symbol: '', intervals: [0, 4, 7] },
    minor: { symbol: 'm', intervals: [0, 3, 7] },
    major7: { symbol: 'maj7', intervals: [0, 4, 7, 11] },
    minor7: { symbol: 'm7', intervals: [0, 3, 7, 10] },
    dominant7: { symbol: '7', intervals: [0, 4, 7, 10] },
    diminished: { symbol: 'dim', intervals: [0, 3, 6] },
    augmented: { symbol: 'aug', intervals: [0, 4, 8] },
    sus2: { symbol: 'sus2', intervals: [0, 2, 7] },
    sus4: { symbol: 'sus4', intervals: [0, 5, 7] }
  }

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const generateProgression = async () => {
    // Simulate AI generation
    const progressionTemplates = getProgressionTemplates()
    const template = progressionTemplates[Math.floor(Math.random() * progressionTemplates.length)]
    
    const progression: ChordProgression = {
      id: Date.now().toString(),
      name: `${selectedGenre} ${selectedMood} in ${selectedKey}`,
      key: selectedKey,
      mode: selectedMode,
      tempo: tempo,
      timeSignature: '4/4',
      chords: template.map((roman, index) => {
        const chord = romanToChord(roman, selectedKey, selectedMode)
        return {
          ...chord,
          color: getChordColor(index)
        }
      }),
      genre: selectedGenre,
      mood: selectedMood,
      energy: calculateEnergy(selectedMood, selectedGenre),
      complexity: calculateComplexity(template)
    }
    
    setCurrentProgression(progression)
    setHistory([progression, ...history.slice(0, 9)])
    generateSuggestions(progression)
  }

  const getProgressionTemplates = () => {
    const templates: { [key: string]: string[][] } = {
      pop: [
        ['I', 'V', 'vi', 'IV'],
        ['I', 'vi', 'IV', 'V'],
        ['vi', 'IV', 'I', 'V'],
        ['I', 'IV', 'vi', 'V']
      ],
      rock: [
        ['I', 'IV', 'V', 'IV'],
        ['I', 'bVII', 'IV', 'I'],
        ['I', 'V', 'bVII', 'IV'],
        ['i', 'bVII', 'bVI', 'V']
      ],
      jazz: [
        ['IΔ7', 'vi7', 'ii7', 'V7'],
        ['IΔ7', 'I7', 'IVΔ7', 'iv7'],
        ['ii7', 'V7', 'IΔ7', 'VIΔ7'],
        ['IΔ7', 'VIΔ7', 'ii7', 'V7']
      ],
      blues: [
        ['I7', 'I7', 'I7', 'I7'],
        ['IV7', 'IV7', 'I7', 'I7'],
        ['V7', 'IV7', 'I7', 'V7']
      ]
    }
    
    return templates[selectedGenre] || templates.pop
  }

  const romanToChord = (roman: string, key: string, mode: 'major' | 'minor'): Chord => {
    // Simplified roman numeral to chord conversion
    const romanNumerals: { [key: string]: number } = {
      'I': 0, 'II': 2, 'III': 4, 'IV': 5, 'V': 7, 'VI': 9, 'VII': 11,
      'i': 0, 'ii': 2, 'iii': 4, 'iv': 5, 'v': 7, 'vi': 9, 'vii': 11
    }
    
    const keyIndex = keys.indexOf(key)
    const isMinor = roman.toLowerCase() === roman
    const baseRoman = roman.replace(/[^IVX]/gi, '').toUpperCase()
    const interval = romanNumerals[baseRoman] || 0
    const rootIndex = (keyIndex + interval) % 12
    const root = keys[rootIndex]
    
    let type = isMinor ? 'minor' : 'major'
    if (roman.includes('7')) type += '7'
    if (roman.includes('Δ')) type = 'major7'
    if (roman.includes('dim')) type = 'diminished'
    if (roman.includes('aug')) type = 'augmented'
    
    const chordType = chordTypes[type as keyof typeof chordTypes] || chordTypes.major
    const notes = chordType.intervals.map(interval => 
      keys[(rootIndex + interval) % 12]
    )
    
    return {
      root,
      type,
      symbol: root + chordType.symbol,
      notes,
      roman,
      color: ''
    }
  }

  const getChordColor = (index: number) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500'
    ]
    return colors[index % colors.length]
  }

  const calculateEnergy = (mood: string, genre: string) => {
    const energyMap: { [key: string]: number } = {
      'happy': 80, 'sad': 30, 'energetic': 95, 'calm': 20,
      'pop': 70, 'rock': 85, 'jazz': 60, 'edm': 90
    }
    return (energyMap[mood] || 50) * (energyMap[genre] || 50) / 50
  }

  const calculateComplexity = (template: string[][]) => {
    return template.length * 25
  }

  const generateSuggestions = (progression: ChordProgression) => {
    // AI-based next chord suggestions
    const lastChord = progression.chords[progression.chords.length - 1]
    const suggestions: ChordSuggestion[] = [
      {
        chord: romanToChord('V', progression.key, progression.mode),
        probability: 0.85,
        reasoning: 'Dominant resolution creates strong movement',
        tension: 8
      },
      {
        chord: romanToChord('IV', progression.key, progression.mode),
        probability: 0.70,
        reasoning: 'Subdominant provides gentle contrast',
        tension: 4
      },
      {
        chord: romanToChord('vi', progression.key, progression.mode),
        probability: 0.60,
        reasoning: 'Relative minor adds emotional depth',
        tension: 6
      }
    ]
    setSuggestions(suggestions)
  }

  const playChord = (chord: Chord) => {
    if (!audioContextRef.current) return
    
    const now = audioContextRef.current.currentTime
    const duration = 1.0
    
    chord.notes.forEach((note, index) => {
      const frequency = noteToFrequency(note + '4')
      const oscillator = audioContextRef.current!.createOscillator()
      const gainNode = audioContextRef.current!.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current!.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3 / chord.notes.length, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)
      
      oscillator.start(now + index * 0.05)
      oscillator.stop(now + duration)
    })
  }

  const noteToFrequency = (note: string): number => {
    const A4 = 440
    const noteMap: { [key: string]: number } = {
      'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4,
      'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2
    }
    
    const noteName = note.slice(0, -1)
    const octave = parseInt(note.slice(-1))
    const semitones = noteMap[noteName] + (octave - 4) * 12
    
    return A4 * Math.pow(2, semitones / 12)
  }

  const playProgression = () => {
    if (!currentProgression) return
    
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    
    setIsPlaying(true)
    const beatDuration = 60 / tempo
    
    const playNextChord = () => {
      if (!isPlaying || !currentProgression) return
      
      playChord(currentProgression.chords[currentChordIndex])
      setCurrentChordIndex((prev) => (prev + 1) % currentProgression.chords.length)
      
      timerRef.current = window.setTimeout(playNextChord, beatDuration * 1000)
    }
    
    playNextChord()
  }

  useEffect(() => {
    if (!isPlaying && timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }, [isPlaying])

  const exportMIDI = () => {
    // In a real app, this would generate and download a MIDI file
    console.log('Exporting MIDI...')
  }

  const exportAudio = () => {
    // In a real app, this would render and download an audio file
    console.log('Exporting audio...')
  }

  const toggleFavorite = (progressionId: string) => {
    setFavorites(prev =>
      prev.includes(progressionId)
        ? prev.filter(id => id !== progressionId)
        : [...prev, progressionId]
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Chord Progression Generator</h1>
              <p className="text-gray-400 mt-1">Create unique chord progressions with AI assistance</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPiano(!showPiano)}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center gap-2"
              >
                <Piano size={20} />
                {showPiano ? 'Hide' : 'Show'} Piano
              </button>
              <button className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2">
                <Sparkles size={20} />
                AI Mode
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Key & Mode Selection */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Key & Mode</h3>
              
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Key</label>
                <div className="grid grid-cols-6 gap-2">
                  {keys.map(key => (
                    <button
                      key={key}
                      onClick={() => setSelectedKey(key)}
                      className={`p-2 rounded text-sm font-medium transition-colors ${
                        selectedKey === key
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedMode('major')}
                    className={`p-3 rounded font-medium transition-colors ${
                      selectedMode === 'major'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    Major
                  </button>
                  <button
                    onClick={() => setSelectedMode('minor')}
                    className={`p-3 rounded font-medium transition-colors ${
                      selectedMode === 'minor'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    Minor
                  </button>
                </div>
              </div>
            </div>

            {/* Genre Selection */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Genre</h3>
              <div className="grid grid-cols-2 gap-2">
                {genres.map(genre => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    className={`p-3 rounded-lg flex items-center gap-2 transition-colors ${
                      selectedGenre === genre.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <span>{genre.icon}</span>
                    <span className="text-sm font-medium">{genre.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Selection */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Mood</h3>
              <div className="grid grid-cols-2 gap-2">
                {moods.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedMood === mood.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {mood.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tempo */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Tempo</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={tempo}
                  onChange={(e) => setTempo(Number(e.target.value))}
                  className="flex-1"
                />
                <div className="text-center">
                  <p className="text-2xl font-mono">{tempo}</p>
                  <p className="text-xs text-gray-400">BPM</p>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateProgression}
              className="w-full bg-purple-600 py-4 rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2 text-lg font-semibold"
            >
              <Zap size={24} />
              Generate Progression
            </button>
          </div>

          {/* Middle Column - Progression Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Progression */}
            {currentProgression && (
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">{currentProgression.name}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFavorite(currentProgression.id)}
                      className={`p-2 rounded-lg hover:bg-gray-700 ${
                        favorites.includes(currentProgression.id) ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart size={20} fill={favorites.includes(currentProgression.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-700">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Chord Display */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {currentProgression.chords.map((chord, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedChord(chord)
                        playChord(chord)
                      }}
                      className={`relative p-6 rounded-xl bg-gradient-to-br ${chord.color} hover:scale-105 transition-transform ${
                        currentChordIndex === index && isPlaying ? 'ring-4 ring-white ring-opacity-50' : ''
                      }`}
                    >
                      <p className="text-2xl font-bold">{chord.symbol}</p>
                      <p className="text-sm opacity-80">{chord.roman}</p>
                    </button>
                  ))}
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={playProgression}
                    className="p-4 bg-purple-600 rounded-full hover:bg-purple-700"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Progression Info */}
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Energy</p>
                    <p className="text-lg font-semibold">{Math.round(currentProgression.energy)}%</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Complexity</p>
                    <p className="text-lg font-semibold">{currentProgression.complexity}%</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Time Sig</p>
                    <p className="text-lg font-semibold">{currentProgression.timeSignature}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Length</p>
                    <p className="text-lg font-semibold">{currentProgression.chords.length} bars</p>
                  </div>
                </div>
              </div>
            )}

            {/* Piano Roll (if enabled) */}
            {showPiano && selectedChord && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Piano View - {selectedChord.symbol}
                </h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex gap-1">
                    {keys.map((key, index) => {
                      const isBlackKey = key.includes('#')
                      const isActive = selectedChord.notes.includes(key)
                      
                      return (
                        <div
                          key={index}
                          className={`relative ${
                            isBlackKey ? 'w-8 h-20 -mx-3 z-10' : 'w-12 h-32'
                          } ${
                            isActive
                              ? isBlackKey ? 'bg-purple-600' : 'bg-purple-500'
                              : isBlackKey ? 'bg-gray-900' : 'bg-white'
                          } rounded-b cursor-pointer hover:opacity-80`}
                          onClick={() => playChord({ ...selectedChord, notes: [key] })}
                        >
                          {!isBlackKey && (
                            <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                              {key}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="text-yellow-400" />
                  AI Suggestions - What Comes Next?
                </h3>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer"
                      onClick={() => playChord(suggestion.chord)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xl font-bold">{suggestion.chord.symbol}</p>
                          <p className="text-xs text-gray-400">{suggestion.chord.roman}</p>
                        </div>
                        <div>
                          <p className="text-sm">{suggestion.reasoning}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-400">
                              Probability: {Math.round(suggestion.probability * 100)}%
                            </span>
                            <span className="text-xs text-gray-400">
                              Tension: {suggestion.tension}/10
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-600 rounded">
                        <Play size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export Options */}
            {currentProgression && (
              <div className="flex gap-4">
                <button
                  onClick={exportMIDI}
                  className="flex-1 bg-gray-700 py-3 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
                >
                  <FileMusic size={20} />
                  Export MIDI
                </button>
                <button
                  onClick={exportAudio}
                  className="flex-1 bg-gray-700 py-3 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Export Audio
                </button>
                <button className="flex-1 bg-gray-700 py-3 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2">
                  <Copy size={20} />
                  Copy to DAW
                </button>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Progressions</h3>
                <div className="space-y-2">
                  {history.slice(0, 5).map((prog, index) => (
                    <div
                      key={prog.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer"
                      onClick={() => setCurrentProgression(prog)}
                    >
                      <div>
                        <p className="font-medium">{prog.name}</p>
                        <p className="text-sm text-gray-400">
                          {prog.chords.map(c => c.symbol).join(' - ')}
                        </p>
                      </div>
                      <Clock size={16} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}