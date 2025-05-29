'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPencilAlt, FaUsers, FaMagic, FaSave, FaPlay, FaPause, 
  FaRedo, FaMusic, FaBrain, FaLightbulb, FaHistory,
  FaDownload, FaShare, FaComments, FaSync, FaQuoteLeft,
  FaMicrophone, FaPalette, FaBook, FaGuitar, FaDrum
} from 'react-icons/fa';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isOnline: boolean;
  contribution: string;
}

interface Suggestion {
  id: string;
  type: 'lyric' | 'melody' | 'structure' | 'rhyme';
  content: string;
  confidence: number;
  source: string;
}

interface SongSection {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'pre-chorus';
  lyrics: string;
  melody?: string;
  chords?: string[];
  notes?: string;
}

interface Version {
  id: string;
  timestamp: Date;
  author: string;
  changes: string;
  sections: SongSection[];
}

export default function AISongwriting() {
  const [activeSong, setActiveSong] = useState({
    title: 'Untitled Song',
    genre: 'Pop',
    mood: 'Uplifting',
    tempo: 120,
    key: 'C Major',
    timeSignature: '4/4',
    sections: [] as SongSection[],
    collaborators: [] as Collaborator[],
    versions: [] as Version[]
  });

  const [currentSection, setCurrentSection] = useState<SongSection | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [rhymeScheme, setRhymeScheme] = useState('ABAB');
  const [syllableCount, setSyllableCount] = useState(8);
  const [isRecording, setIsRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const sectionTypes = [
    { type: 'intro', label: 'Intro', icon: FaMusic },
    { type: 'verse', label: 'Verse', icon: FaPencilAlt },
    { type: 'pre-chorus', label: 'Pre-Chorus', icon: FaGuitar },
    { type: 'chorus', label: 'Chorus', icon: FaDrum },
    { type: 'bridge', label: 'Bridge', icon: FaBrain },
    { type: 'outro', label: 'Outro', icon: FaQuoteLeft }
  ];

  const moodOptions = [
    'Uplifting', 'Melancholic', 'Energetic', 'Romantic', 
    'Dark', 'Playful', 'Nostalgic', 'Aggressive'
  ];

  const genreOptions = [
    'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Country', 
    'Electronic', 'Jazz', 'Folk', 'Indie', 'Metal'
  ];

  useEffect(() => {
    // Load sample data
    setActiveSong(prev => ({
      ...prev,
      sections: [
        {
          id: '1',
          type: 'verse',
          lyrics: 'Walking down this empty street\nSearching for a melody\nEvery step a different beat\nLost in possibility',
          chords: ['C', 'Am', 'F', 'G']
        }
      ],
      collaborators: [
        {
          id: '1',
          name: 'AI Assistant',
          avatar: '🤖',
          role: 'Co-writer',
          isOnline: true,
          contribution: 'Lyric suggestions, rhyme schemes'
        }
      ]
    }));

    // Generate initial suggestions
    generateSuggestions();
  }, []);

  const generateSuggestions = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSuggestions([
        {
          id: '1',
          type: 'lyric',
          content: 'The stars align to guide my way\nThrough shadows cast by yesterday',
          confidence: 0.92,
          source: 'Rhyme continuation'
        },
        {
          id: '2',
          type: 'melody',
          content: 'Try ascending melody: C-D-E-G for "guide my way"',
          confidence: 0.88,
          source: 'Melodic analysis'
        },
        {
          id: '3',
          type: 'structure',
          content: 'Consider adding a pre-chorus to build tension',
          confidence: 0.85,
          source: 'Song structure AI'
        },
        {
          id: '4',
          type: 'rhyme',
          content: 'Rhymes with "street": beat, meet, complete, feat',
          confidence: 0.95,
          source: 'Rhyme dictionary'
        }
      ]);
      setIsGenerating(false);
    }, 1000);
  };

  const addSection = (type: string) => {
    const newSection: SongSection = {
      id: Date.now().toString(),
      type: type as any,
      lyrics: '',
      chords: []
    };
    setActiveSong(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setCurrentSection(newSection);
  };

  const updateSection = (sectionId: string, updates: Partial<SongSection>) => {
    setActiveSong(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, ...updates } : s
      )
    }));
  };

  const saveVersion = () => {
    const newVersion: Version = {
      id: Date.now().toString(),
      timestamp: new Date(),
      author: 'You',
      changes: 'Manual save',
      sections: [...activeSong.sections]
    };
    setActiveSong(prev => ({
      ...prev,
      versions: [...prev.versions, newVersion]
    }));
  };

  const applySuggestion = (suggestion: Suggestion) => {
    if (currentSection && suggestion.type === 'lyric') {
      updateSection(currentSection.id, {
        lyrics: currentSection.lyrics + '\n' + suggestion.content
      });
    }
    generateSuggestions();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Songwriting Assistant</h1>
            <p className="text-gray-600">Collaborate with AI to write your next hit</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <FaHistory /> Version History
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <FaComments /> Collaborate
            </button>
            <button
              onClick={saveVersion}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FaSave /> Save Version
            </button>
          </div>
        </div>

        {/* Song Metadata */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={activeSong.title}
                onChange={(e) => setActiveSong(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <select
                value={activeSong.genre}
                onChange={(e) => setActiveSong(prev => ({ ...prev, genre: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {genreOptions.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
              <select
                value={activeSong.mood}
                onChange={(e) => setActiveSong(prev => ({ ...prev, mood: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {moodOptions.map(mood => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempo</label>
              <input
                type="number"
                value={activeSong.tempo}
                onChange={(e) => setActiveSong(prev => ({ ...prev, tempo: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <input
                type="text"
                value={activeSong.key}
                onChange={(e) => setActiveSong(prev => ({ ...prev, key: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Signature</label>
              <input
                type="text"
                value={activeSong.timeSignature}
                onChange={(e) => setActiveSong(prev => ({ ...prev, timeSignature: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            {/* Section Tabs */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Song Structure</h3>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isRecording 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaMicrophone /> {isRecording ? 'Stop Recording' : 'Record Melody'}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {sectionTypes.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-2"
                  >
                    <Icon /> Add {label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {activeSong.sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      currentSection?.id === section.id
                        ? 'bg-purple-100 border-2 border-purple-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentSection(section)}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium capitalize">{section.type} {index + 1}</h4>
                      <div className="flex gap-2">
                        {section.chords && section.chords.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {section.chords.join(' - ')}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {section.lyrics.split('\n').length} lines
                        </span>
                      </div>
                    </div>
                    {section.lyrics && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {section.lyrics}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Lyrics Editor */}
            {currentSection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold capitalize">
                    {currentSection.type} Editor
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={generateSuggestions}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <FaMagic /> Generate Ideas
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lyrics</label>
                  <textarea
                    value={currentSection.lyrics}
                    onChange={(e) => updateSection(currentSection.id, { lyrics: e.target.value })}
                    className="w-full h-64 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    placeholder="Start writing your lyrics here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chords</label>
                    <input
                      type="text"
                      value={currentSection.chords?.join(' ') || ''}
                      onChange={(e) => updateSection(currentSection.id, { 
                        chords: e.target.value.split(' ').filter(c => c) 
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="C Am F G"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <input
                      type="text"
                      value={currentSection.notes || ''}
                      onChange={(e) => updateSection(currentSection.id, { notes: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Performance notes..."
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rhyme Scheme</label>
                    <select
                      value={rhymeScheme}
                      onChange={(e) => setRhymeScheme(e.target.value)}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="ABAB">ABAB</option>
                      <option value="AABB">AABB</option>
                      <option value="ABCB">ABCB</option>
                      <option value="AAAA">AAAA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Syllables/Line</label>
                    <input
                      type="number"
                      value={syllableCount}
                      onChange={(e) => setSyllableCount(parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* AI Suggestions Sidebar */}
          <div className="space-y-6">
            {/* AI Suggestions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">AI Suggestions</h3>
                <button
                  onClick={generateSuggestions}
                  disabled={isGenerating}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <FaSync className={`${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-3">
                {suggestions.map(suggestion => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {suggestion.type === 'lyric' && <FaPencilAlt className="text-purple-600" />}
                        {suggestion.type === 'melody' && <FaMusic className="text-blue-600" />}
                        {suggestion.type === 'structure' && <FaPalette className="text-green-600" />}
                        {suggestion.type === 'rhyme' && <FaBook className="text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{suggestion.content}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">{suggestion.source}</span>
                          <div className="flex items-center gap-1">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${suggestion.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Collaborators */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Collaborators</h3>
              <div className="space-y-3">
                {activeSong.collaborators.map(collaborator => (
                  <div key={collaborator.id} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg">
                        {collaborator.avatar}
                      </div>
                      {collaborator.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{collaborator.name}</p>
                      <p className="text-xs text-gray-500">{collaborator.contribution}</p>
                    </div>
                  </div>
                ))}
                <button className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center justify-center gap-2">
                  <FaUsers /> Invite Collaborator
                </button>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Export Song</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <FaDownload /> Export as PDF
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <FaMusic /> Export as MIDI
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <FaShare /> Share with Band
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Version History Modal */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-semibold mb-4">Version History</h3>
                <div className="space-y-3">
                  {activeSong.versions.map(version => (
                    <div key={version.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{version.changes}</p>
                          <p className="text-sm text-gray-500">
                            by {version.author} • {new Date(version.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
                          Restore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collaboration Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Collaboration Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      🤖
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-lg p-3">
                      <p className="text-sm">
                        I've analyzed your verse structure. Consider adding internal rhymes to enhance the flow!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}