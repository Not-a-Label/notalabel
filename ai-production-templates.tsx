'use client'

import React, { useState, useEffect } from 'react'
import {
  Music, Layers, Grid, Play, Download, Save, Heart,
  Share2, Copy, Edit, Plus, Trash2, Settings, Zap,
  Headphones, Radio, Guitar, Piano, Mic, Drum,
  Volume2, Clock, TrendingUp, Star, Filter, Search,
  ChevronRight, Folder, FileMusic, Lock, Unlock,
  Sparkles, Package, Upload, CheckCircle
} from 'lucide-react'

interface Track {
  id: string
  name: string
  type: 'drums' | 'bass' | 'keys' | 'guitar' | 'vocals' | 'synth' | 'fx'
  instrument: string
  volume: number
  pan: number
  muted: boolean
  solo: boolean
  effects: Effect[]
  pattern?: Pattern
  color: string
}

interface Effect {
  type: string
  enabled: boolean
  params: Record<string, number>
}

interface Pattern {
  bars: number
  notes: Note[]
}

interface Note {
  pitch: number
  start: number
  duration: number
  velocity: number
}

interface ProductionTemplate {
  id: string
  name: string
  genre: string
  subgenre?: string
  description: string
  tempo: number
  key: string
  timeSignature: string
  tracks: Track[]
  arrangement: Arrangement
  mixPreset: MixPreset
  author: string
  downloads: number
  rating: number
  tags: string[]
  premium: boolean
  preview?: string
}

interface Arrangement {
  sections: Section[]
  length: number
}

interface Section {
  name: string
  start: number
  length: number
  tracks: string[]
}

interface MixPreset {
  masterBus: {
    eq: Record<string, number>
    compression: Record<string, number>
    limiter: Record<string, number>
  }
  sends: Send[]
}

interface Send {
  name: string
  type: 'reverb' | 'delay' | 'chorus'
  amount: number
  params: Record<string, number>
}

export default function AIProductionTemplates() {
  const [templates, setTemplates] = useState<ProductionTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ProductionTemplate | null>(null)
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyFree, setShowOnlyFree] = useState(false)
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular')
  const [isPlaying, setIsPlaying] = useState(false)
  const [userTemplates, setUserTemplates] = useState<ProductionTemplate[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [copiedTracks, setCopiedTracks] = useState<Track[]>([])

  const genres = [
    { id: 'all', name: 'All Genres', icon: <Music /> },
    { id: 'pop', name: 'Pop', icon: <Radio /> },
    { id: 'rock', name: 'Rock', icon: <Guitar /> },
    { id: 'electronic', name: 'Electronic', icon: <Headphones /> },
    { id: 'hip-hop', name: 'Hip-Hop', icon: <Mic /> },
    { id: 'jazz', name: 'Jazz', icon: <Piano /> },
    { id: 'classical', name: 'Classical', icon: <Music /> },
    { id: 'world', name: 'World', icon: <Drum /> }
  ]

  const trackTypeIcons = {
    drums: <Drum size={16} />,
    bass: <Guitar size={16} />,
    keys: <Piano size={16} />,
    guitar: <Guitar size={16} />,
    vocals: <Mic size={16} />,
    synth: <Radio size={16} />,
    fx: <Sparkles size={16} />
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    // Mock templates data
    const mockTemplates: ProductionTemplate[] = [
      {
        id: '1',
        name: 'Modern Pop Hit',
        genre: 'pop',
        subgenre: 'dance-pop',
        description: 'Radio-ready pop production with punchy drums and catchy hooks',
        tempo: 128,
        key: 'C major',
        timeSignature: '4/4',
        tracks: generatePopTracks(),
        arrangement: generatePopArrangement(),
        mixPreset: generatePopMixPreset(),
        author: 'AI Producer',
        downloads: 15234,
        rating: 4.8,
        tags: ['upbeat', 'radio', 'commercial', 'vocal'],
        premium: false,
        preview: '/previews/modern-pop.mp3'
      },
      {
        id: '2',
        name: 'Trap Banger',
        genre: 'hip-hop',
        subgenre: 'trap',
        description: 'Hard-hitting 808s with modern trap production',
        tempo: 140,
        key: 'F minor',
        timeSignature: '4/4',
        tracks: generateTrapTracks(),
        arrangement: generateTrapArrangement(),
        mixPreset: generateTrapMixPreset(),
        author: 'BeatMaker Pro',
        downloads: 23456,
        rating: 4.9,
        tags: ['808', 'hard', 'bass', 'hi-hats'],
        premium: false,
        preview: '/previews/trap-banger.mp3'
      },
      {
        id: '3',
        name: 'Synthwave Dreams',
        genre: 'electronic',
        subgenre: 'synthwave',
        description: 'Retro-futuristic synthwave with analog warmth',
        tempo: 118,
        key: 'A minor',
        timeSignature: '4/4',
        tracks: generateSynthwaveTracks(),
        arrangement: generateSynthwaveArrangement(),
        mixPreset: generateSynthwaveMixPreset(),
        author: 'RetroWave',
        downloads: 8976,
        rating: 4.7,
        tags: ['retro', '80s', 'synth', 'atmospheric'],
        premium: true,
        preview: '/previews/synthwave.mp3'
      }
    ]
    
    setTemplates(mockTemplates)
  }

  const generatePopTracks = (): Track[] => [
    {
      id: 'drums',
      name: 'Pop Drums',
      type: 'drums',
      instrument: 'Modern Kit',
      volume: 0,
      pan: 0,
      muted: false,
      solo: false,
      effects: [
        { type: 'compression', enabled: true, params: { threshold: -10, ratio: 4 } },
        { type: 'eq', enabled: true, params: { low: 2, mid: 0, high: 3 } }
      ],
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'bass',
      name: 'Sub Bass',
      type: 'bass',
      instrument: 'Analog Bass',
      volume: -3,
      pan: 0,
      muted: false,
      solo: false,
      effects: [
        { type: 'compression', enabled: true, params: { threshold: -15, ratio: 3 } }
      ],
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'keys',
      name: 'Piano Chords',
      type: 'keys',
      instrument: 'Grand Piano',
      volume: -6,
      pan: -20,
      muted: false,
      solo: false,
      effects: [
        { type: 'reverb', enabled: true, params: { size: 30, mix: 20 } }
      ],
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'lead',
      name: 'Lead Vocal',
      type: 'vocals',
      instrument: 'Lead Vox',
      volume: 0,
      pan: 0,
      muted: false,
      solo: false,
      effects: [
        { type: 'compression', enabled: true, params: { threshold: -18, ratio: 4 } },
        { type: 'delay', enabled: true, params: { time: 250, feedback: 20, mix: 15 } }
      ],
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const generateTrapTracks = (): Track[] => [
    {
      id: '808',
      name: '808 Bass',
      type: 'bass',
      instrument: 'TR-808',
      volume: 3,
      pan: 0,
      muted: false,
      solo: false,
      effects: [
        { type: 'distortion', enabled: true, params: { drive: 30, tone: 50 } },
        { type: 'compression', enabled: true, params: { threshold: -6, ratio: 8 } }
      ],
      color: 'from-purple-600 to-purple-800'
    },
    {
      id: 'kick',
      name: 'Trap Kick',
      type: 'drums',
      instrument: 'Trap Kit - Kick',
      volume: 0,
      pan: 0,
      muted: false,
      solo: false,
      effects: [],
      color: 'from-gray-600 to-gray-800'
    },
    {
      id: 'hihat',
      name: 'Hi-Hat Rolls',
      type: 'drums',
      instrument: 'Trap Kit - HiHats',
      volume: -6,
      pan: 10,
      muted: false,
      solo: false,
      effects: [
        { type: 'filter', enabled: true, params: { cutoff: 8000, resonance: 20 } }
      ],
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'melody',
      name: 'Dark Melody',
      type: 'synth',
      instrument: 'Analog Lead',
      volume: -9,
      pan: -30,
      muted: false,
      solo: false,
      effects: [
        { type: 'reverb', enabled: true, params: { size: 50, mix: 30 } },
        { type: 'delay', enabled: true, params: { time: 375, feedback: 40, mix: 20 } }
      ],
      color: 'from-red-600 to-red-800'
    }
  ]

  const generateSynthwaveTracks = (): Track[] => [
    {
      id: 'drums',
      name: 'Retro Drums',
      type: 'drums',
      instrument: 'LinnDrum',
      volume: -3,
      pan: 0,
      muted: false,
      solo: false,
      effects: [
        { type: 'reverb', enabled: true, params: { size: 40, mix: 25 } }
      ],
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'bass',
      name: 'Analog Bass',
      type: 'synth',
      instrument: 'Moog Bass',
      volume: 0,
      pan: 0,
      muted: false,
      solo: false,
      effects: [
        { type: 'chorus', enabled: true, params: { rate: 2, depth: 30, mix: 40 } }
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'pad',
      name: 'Lush Pad',
      type: 'synth',
      instrument: 'JP-8000',
      volume: -6,
      pan: 0,
      muted: false,
      solo: false,
      effects: [
        { type: 'reverb', enabled: true, params: { size: 70, mix: 50 } },
        { type: 'chorus', enabled: true, params: { rate: 1, depth: 50, mix: 60 } }
      ],
      color: 'from-pink-400 to-purple-400'
    },
    {
      id: 'lead',
      name: 'Synth Lead',
      type: 'synth',
      instrument: 'Prophet 5',
      volume: -9,
      pan: 20,
      muted: false,
      solo: false,
      effects: [
        { type: 'delay', enabled: true, params: { time: 500, feedback: 50, mix: 30 } }
      ],
      color: 'from-yellow-400 to-pink-400'
    }
  ]

  const generatePopArrangement = (): Arrangement => ({
    sections: [
      { name: 'Intro', start: 0, length: 8, tracks: ['drums', 'keys'] },
      { name: 'Verse 1', start: 8, length: 16, tracks: ['drums', 'bass', 'keys'] },
      { name: 'Chorus', start: 24, length: 16, tracks: ['drums', 'bass', 'keys', 'lead'] },
      { name: 'Verse 2', start: 40, length: 16, tracks: ['drums', 'bass', 'keys'] },
      { name: 'Chorus', start: 56, length: 16, tracks: ['drums', 'bass', 'keys', 'lead'] },
      { name: 'Bridge', start: 72, length: 8, tracks: ['keys', 'lead'] },
      { name: 'Chorus', start: 80, length: 16, tracks: ['drums', 'bass', 'keys', 'lead'] },
      { name: 'Outro', start: 96, length: 8, tracks: ['drums', 'keys'] }
    ],
    length: 104
  })

  const generateTrapArrangement = (): Arrangement => ({
    sections: [
      { name: 'Intro', start: 0, length: 8, tracks: ['melody'] },
      { name: 'Drop', start: 8, length: 16, tracks: ['808', 'kick', 'hihat', 'melody'] },
      { name: 'Break', start: 24, length: 8, tracks: ['melody', 'hihat'] },
      { name: 'Drop', start: 32, length: 16, tracks: ['808', 'kick', 'hihat', 'melody'] },
      { name: 'Outro', start: 48, length: 8, tracks: ['melody'] }
    ],
    length: 56
  })

  const generateSynthwaveArrangement = (): Arrangement => ({
    sections: [
      { name: 'Intro', start: 0, length: 16, tracks: ['pad'] },
      { name: 'Main', start: 16, length: 32, tracks: ['drums', 'bass', 'pad'] },
      { name: 'Lead', start: 48, length: 32, tracks: ['drums', 'bass', 'pad', 'lead'] },
      { name: 'Break', start: 80, length: 16, tracks: ['pad', 'lead'] },
      { name: 'Outro', start: 96, length: 16, tracks: ['drums', 'bass', 'pad'] }
    ],
    length: 112
  })

  const generatePopMixPreset = (): MixPreset => ({
    masterBus: {
      eq: { low: 2, lowMid: 0, mid: 1, highMid: 2, high: 3 },
      compression: { threshold: -8, ratio: 3, attack: 10, release: 100 },
      limiter: { ceiling: -0.3, release: 50 }
    },
    sends: [
      { name: 'Hall Reverb', type: 'reverb', amount: 30, params: { size: 70, damping: 50 } },
      { name: 'Slap Delay', type: 'delay', amount: 20, params: { time: 125, feedback: 10 } }
    ]
  })

  const generateTrapMixPreset = (): MixPreset => ({
    masterBus: {
      eq: { low: 5, lowMid: -2, mid: 0, highMid: 3, high: 4 },
      compression: { threshold: -6, ratio: 4, attack: 1, release: 50 },
      limiter: { ceiling: -0.1, release: 10 }
    },
    sends: [
      { name: 'Dark Reverb', type: 'reverb', amount: 40, params: { size: 80, damping: 70 } },
      { name: 'Trap Delay', type: 'delay', amount: 30, params: { time: 375, feedback: 40 } }
    ]
  })

  const generateSynthwaveMixPreset = (): MixPreset => ({
    masterBus: {
      eq: { low: 3, lowMid: 1, mid: -1, highMid: 2, high: 4 },
      compression: { threshold: -12, ratio: 2.5, attack: 30, release: 200 },
      limiter: { ceiling: -0.5, release: 100 }
    },
    sends: [
      { name: 'Vintage Reverb', type: 'reverb', amount: 50, params: { size: 60, damping: 40 } },
      { name: 'Analog Delay', type: 'delay', amount: 40, params: { time: 500, feedback: 50 } },
      { name: 'Chorus', type: 'chorus', amount: 30, params: { rate: 2, depth: 40 } }
    ]
  })

  const filteredTemplates = templates.filter(template => {
    const matchesGenre = selectedGenre === 'all' || template.genre === selectedGenre
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFree = !showOnlyFree || !template.premium
    
    return matchesGenre && matchesSearch && matchesFree
  })

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads
      case 'newest':
        return b.id.localeCompare(a.id) // In real app, would use creation date
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  const exportTemplate = (template: ProductionTemplate, format: 'daw' | 'midi' | 'stems') => {
    console.log(`Exporting ${template.name} as ${format}`)
    // In a real app, this would generate and download the appropriate files
  }

  const duplicateTemplate = (template: ProductionTemplate) => {
    const newTemplate: ProductionTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      author: 'You',
      downloads: 0,
      rating: 0
    }
    setUserTemplates([...userTemplates, newTemplate])
  }

  const createNewTemplate = () => {
    setShowCreateModal(true)
    // In a real app, this would open a template creation interface
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Production Templates</h1>
              <p className="text-gray-400 mt-1">Professional templates to jumpstart your music production</p>
            </div>
            <button
              onClick={createNewTemplate}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Create Template
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-gray-700 rounded-lg"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Free Only Toggle */}
            <label className="flex items-center gap-2 px-4 py-3 bg-gray-700 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyFree}
                onChange={(e) => setShowOnlyFree(e.target.checked)}
                className="rounded"
              />
              <span>Free Only</span>
            </label>
          </div>

          {/* Genre Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {genres.map(genre => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedGenre === genre.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {genre.icon}
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sortedTemplates.map(template => (
            <div
              key={template.id}
              className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              {/* Template Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-400">{template.genre} • {template.subgenre}</p>
                  </div>
                  {template.premium && (
                    <div className="bg-yellow-500 text-gray-900 px-2 py-1 rounded text-xs font-semibold">
                      PRO
                    </div>
                  )}
                </div>

                <p className="text-gray-300 text-sm mb-4">{template.description}</p>

                {/* Template Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400">Tempo:</span>
                    <span className="ml-2 font-medium">{template.tempo} BPM</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Key:</span>
                    <span className="ml-2 font-medium">{template.key}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Tracks:</span>
                    <span className="ml-2 font-medium">{template.tracks.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Length:</span>
                    <span className="ml-2 font-medium">{Math.floor(template.arrangement.length / 4)} bars</span>
                  </div>
                </div>

                {/* Track Preview */}
                <div className="flex gap-1 mb-4">
                  {template.tracks.map(track => (
                    <div
                      key={track.id}
                      className={`h-8 flex-1 bg-gradient-to-r ${track.color} rounded opacity-80`}
                      title={track.name}
                    />
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Download size={16} />
                      <span>{template.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500 fill-current" />
                      <span>{template.rating}</span>
                    </div>
                  </div>
                  <span className="text-gray-400">by {template.author}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-700 p-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsPlaying(!isPlaying)
                  }}
                  className="flex-1 bg-gray-700 py-2 rounded hover:bg-gray-600 flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  Preview
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    exportTemplate(template, 'daw')
                  }}
                  className="flex-1 bg-purple-600 py-2 rounded hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Template Detail */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedTemplate.name}</h2>
                    <p className="text-gray-400">{selectedTemplate.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Track List */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Tracks</h3>
                  <div className="space-y-3">
                    {selectedTemplate.tracks.map(track => (
                      <div
                        key={track.id}
                        className="bg-gray-700 rounded-lg p-4 flex items-center gap-4"
                      >
                        <div className={`p-2 rounded bg-gradient-to-r ${track.color}`}>
                          {trackTypeIcons[track.type]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{track.name}</h4>
                          <p className="text-sm text-gray-400">{track.instrument}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-600 rounded">
                            <Volume2 size={16} />
                          </button>
                          <button className="p-2 hover:bg-gray-600 rounded">
                            <Settings size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrangement */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Arrangement</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="space-y-2">
                      {selectedTemplate.arrangement.sections.map((section, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <span className="text-sm font-medium w-20">{section.name}</span>
                          <div className="flex-1 bg-gray-600 rounded h-8 relative overflow-hidden">
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-purple-500 opacity-50"
                              style={{
                                left: `${(section.start / selectedTemplate.arrangement.length) * 100}%`,
                                width: `${(section.length / selectedTemplate.arrangement.length) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-400">{section.length} bars</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => exportTemplate(selectedTemplate, 'daw')}
                    className="flex-1 bg-purple-600 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <Package size={20} />
                    Open in DAW
                  </button>
                  <button
                    onClick={() => exportTemplate(selectedTemplate, 'midi')}
                    className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center gap-2"
                  >
                    <FileMusic size={20} />
                    Export MIDI
                  </button>
                  <button
                    onClick={() => exportTemplate(selectedTemplate, 'stems')}
                    className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center gap-2"
                  >
                    <Layers size={20} />
                    Export Stems
                  </button>
                  <button
                    onClick={() => duplicateTemplate(selectedTemplate)}
                    className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center gap-2"
                  >
                    <Copy size={20} />
                    Duplicate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Templates */}
        {userTemplates.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTemplates.map(template => (
                <div
                  key={template.id}
                  className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <button className="text-gray-400 hover:text-white">
                      <Edit size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{template.genre} • {template.tempo} BPM</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-700 py-2 rounded hover:bg-gray-600">
                      Open
                    </button>
                    <button className="p-2 bg-gray-700 rounded hover:bg-gray-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}