'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/utils/auth';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  key: string;
  tempo: number;
  genre: string;
  notes?: string;
  isOriginal: boolean;
  audioFile?: string;
  lyrics?: string;
}

interface SetlistItem {
  id: string;
  songId: string;
  song: Song;
  order: number;
  notes?: string;
  isPlayed: boolean;
  playedAt?: string;
  transitionNotes?: string;
  estimatedDuration: number;
}

interface Setlist {
  id: string;
  name: string;
  description: string;
  eventType: 'concert' | 'rehearsal' | 'recording' | 'other';
  venue?: string;
  date: string;
  startTime: string;
  estimatedDuration: number;
  actualDuration?: number;
  items: SetlistItem[];
  status: 'draft' | 'finalized' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface SetTemplate {
  id: string;
  name: string;
  description: string;
  items: Omit<SetlistItem, 'id' | 'isPlayed' | 'playedAt'>[];
  tags: string[];
  isPublic: boolean;
}

export default function SetlistManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'setlists' | 'songs' | 'templates' | 'live'>('setlists');
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [templates, setTemplates] = useState<SetTemplate[]>([]);
  const [currentSetlist, setCurrentSetlist] = useState<Setlist | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [draggedItem, setDraggedItem] = useState<SetlistItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'duration' | 'key' | 'tempo'>('title');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchSetlists();
    fetchSongs();
    fetchTemplates();
  }, []);

  const fetchSetlists = async () => {
    try {
      const response = await fetch('/api/setlists', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setSetlists(data.setlists || []);
    } catch (error) {
      console.error('Error fetching setlists:', error);
    }
  };

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/songs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setSongs(data.songs || []);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/setlist-templates', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const createSetlist = async (setlistData: any) => {
    try {
      const response = await fetch('/api/setlists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(setlistData)
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        fetchSetlists();
      }
    } catch (error) {
      console.error('Error creating setlist:', error);
    }
  };

  const addSongToSetlist = async (setlistId: string, songId: string) => {
    try {
      const response = await fetch(`/api/setlists/${setlistId}/songs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ songId })
      });
      
      if (response.ok) {
        fetchSetlists();
        setShowAddSongModal(false);
      }
    } catch (error) {
      console.error('Error adding song to setlist:', error);
    }
  };

  const reorderSetlist = async (setlistId: string, items: SetlistItem[]) => {
    try {
      await fetch(`/api/setlists/${setlistId}/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: items.map((item, index) => ({ ...item, order: index + 1 })) })
      });
    } catch (error) {
      console.error('Error reordering setlist:', error);
    }
  };

  const markSongAsPlayed = async (setlistId: string, itemId: string) => {
    try {
      await fetch(`/api/setlists/${setlistId}/items/${itemId}/played`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchSetlists();
    } catch (error) {
      console.error('Error marking song as played:', error);
    }
  };

  const startLiveMode = (setlist: Setlist) => {
    setCurrentSetlist(setlist);
    setCurrentSongIndex(0);
    setActiveTab('live');
  };

  const handleDragStart = (item: SetlistItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetItem: SetlistItem) => {
    e.preventDefault();
    if (!draggedItem || !currentSetlist) return;

    const items = [...currentSetlist.items];
    const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
    const targetIndex = items.findIndex(item => item.id === targetItem.id);

    items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    const updatedSetlist = { ...currentSetlist, items };
    setCurrentSetlist(updatedSetlist);
    reorderSetlist(currentSetlist.id, items);
    setDraggedItem(null);
  };

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !filterGenre || song.genre === filterGenre;
    return matchesSearch && matchesGenre;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'duration':
        return a.duration - b.duration;
      case 'key':
        return a.key.localeCompare(b.key);
      case 'tempo':
        return a.tempo - b.tempo;
      default:
        return a.title.localeCompare(b.title);
    }
  });

  const renderSetlists = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Your Setlists</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Setlist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {setlists.map(setlist => (
          <div key={setlist.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{setlist.name}</h3>
                <p className="text-sm text-gray-600">{setlist.description}</p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                setlist.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                setlist.status === 'finalized' ? 'bg-blue-100 text-blue-600' :
                setlist.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                {setlist.status}
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center justify-between">
                <span>Songs:</span>
                <span className="font-medium">{setlist.items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Duration:</span>
                <span className="font-medium">{Math.floor(setlist.estimatedDuration / 60)}h {setlist.estimatedDuration % 60}m</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Date:</span>
                <span className="font-medium">{new Date(setlist.date).toLocaleDateString()}</span>
              </div>
              {setlist.venue && (
                <div className="flex items-center justify-between">
                  <span>Venue:</span>
                  <span className="font-medium">{setlist.venue}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentSetlist(setlist)}
                className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => startLiveMode(setlist)}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Live Mode
              </button>
            </div>
          </div>
        ))}
      </div>

      {setlists.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create your first setlist</h3>
          <p className="text-gray-600 mb-6">Organize your songs for performances and rehearsals</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Setlist
          </button>
        </div>
      )}
    </div>
  );

  const renderSongs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Song Library</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add Song
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Genres</option>
          <option value="Rock">Rock</option>
          <option value="Pop">Pop</option>
          <option value="Jazz">Jazz</option>
          <option value="Folk">Folk</option>
          <option value="Electronic">Electronic</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="title">Sort by Title</option>
          <option value="duration">Sort by Duration</option>
          <option value="key">Sort by Key</option>
          <option value="tempo">Sort by Tempo</option>
        </select>
      </div>

      {/* Songs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSongs.map(song => (
          <div key={song.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">{song.title}</h3>
                <p className="text-sm text-gray-600">{song.artist}</p>
              </div>
              {song.isOriginal && (
                <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Original</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
              <div>
                <span className="text-gray-500">Duration:</span>
                <span className="ml-1">{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
              </div>
              <div>
                <span className="text-gray-500">Key:</span>
                <span className="ml-1">{song.key}</span>
              </div>
              <div>
                <span className="text-gray-500">Tempo:</span>
                <span className="ml-1">{song.tempo} BPM</span>
              </div>
              <div>
                <span className="text-gray-500">Genre:</span>
                <span className="ml-1">{song.genre}</span>
              </div>
            </div>

            {song.notes && (
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{song.notes}</p>
            )}

            <div className="flex space-x-2">
              {currentSetlist && (
                <button
                  onClick={() => addSongToSetlist(currentSetlist.id, song.id)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Add to Setlist
                </button>
              )}
              <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLiveMode = () => {
    if (!currentSetlist) return null;

    const currentItem = currentSetlist.items[currentSongIndex];
    const playedCount = currentSetlist.items.filter(item => item.isPlayed).length;
    const totalDuration = currentSetlist.items.reduce((acc, item) => acc + item.estimatedDuration, 0);
    const playedDuration = currentSetlist.items.filter(item => item.isPlayed)
      .reduce((acc, item) => acc + item.estimatedDuration, 0);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Live Performance</h2>
            <button
              onClick={() => setActiveTab('setlists')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Exit Live Mode
            </button>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{playedCount}</div>
              <div className="text-sm text-gray-500">Songs Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{currentSetlist.items.length - playedCount}</div>
              <div className="text-sm text-gray-500">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{Math.floor(playedDuration / 60)}m</div>
              <div className="text-sm text-gray-500">Time Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{Math.floor((totalDuration - playedDuration) / 60)}m</div>
              <div className="text-sm text-gray-500">Time Left</div>
            </div>
          </div>

          {/* Current Song */}
          {currentItem && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Now Playing</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentSongIndex(Math.max(0, currentSongIndex - 1))}
                    disabled={currentSongIndex === 0}
                    className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => markSongAsPlayed(currentSetlist.id, currentItem.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Mark as Played
                  </button>
                  <button
                    onClick={() => setCurrentSongIndex(Math.min(currentSetlist.items.length - 1, currentSongIndex + 1))}
                    disabled={currentSongIndex === currentSetlist.items.length - 1}
                    className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{currentItem.song.title}</h4>
                  <p className="text-gray-600 mb-4">by {currentItem.song.artist}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Key:</span>
                      <span className="ml-2 font-medium">{currentItem.song.key}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tempo:</span>
                      <span className="ml-2 font-medium">{currentItem.song.tempo} BPM</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 font-medium">
                        {Math.floor(currentItem.song.duration / 60)}:{(currentItem.song.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Position:</span>
                      <span className="ml-2 font-medium">{currentSongIndex + 1} of {currentSetlist.items.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {currentItem.notes && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Performance Notes:</h5>
                      <p className="text-sm text-gray-600 bg-white rounded p-3">{currentItem.notes}</p>
                    </div>
                  )}
                  
                  {currentItem.transitionNotes && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Transition Notes:</h5>
                      <p className="text-sm text-gray-600 bg-white rounded p-3">{currentItem.transitionNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Full Setlist */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Complete Setlist</h3>
          <div className="space-y-2">
            {currentSetlist.items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === currentSongIndex ? 'bg-blue-100 border-2 border-blue-300' :
                  item.isPlayed ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">{item.order}.</span>
                  <div>
                    <h4 className={`font-medium ${item.isPlayed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {item.song.title}
                    </h4>
                    <p className="text-sm text-gray-600">{item.song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{item.song.key}</span>
                  <span>{Math.floor(item.song.duration / 60)}:{(item.song.duration % 60).toString().padStart(2, '0')}</span>
                  {item.isPlayed && <span className="text-green-600">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setlist Management</h1>
          <p className="text-gray-600">Organize and manage your performance setlists</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'setlists', label: 'Setlists', icon: '📝' },
              { id: 'songs', label: 'Songs', icon: '🎵' },
              { id: 'templates', label: 'Templates', icon: '📋' },
              { id: 'live', label: 'Live Mode', icon: '🎤' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'setlists' && renderSetlists()}
        {activeTab === 'songs' && renderSongs()}
        {activeTab === 'templates' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Setlist Templates</h3>
            <p className="text-gray-600">Reusable setlist templates for different types of performances</p>
          </div>
        )}
        {activeTab === 'live' && renderLiveMode()}
      </div>

      {/* Create Setlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Setlist</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createSetlist({
                name: formData.get('name'),
                description: formData.get('description'),
                eventType: formData.get('eventType'),
                venue: formData.get('venue'),
                date: formData.get('date'),
                startTime: formData.get('startTime')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Setlist Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter setlist name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe this setlist"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                  <select
                    name="eventType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="concert">Concert</option>
                    <option value="rehearsal">Rehearsal</option>
                    <option value="recording">Recording Session</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue (Optional)</label>
                  <input
                    name="venue"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter venue name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      name="date"
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      name="startTime"
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}