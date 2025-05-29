'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Artist {
  id: string;
  name: string;
  displayName: string;
  location: string;
  avatar: string;
  coverImage: string;
  genres: string[];
  skills: string[];
  instruments: string[];
  lookingFor: string[];
  experience: 'beginner' | 'intermediate' | 'professional';
  verified: boolean;
  rating: number;
  collaborations: number;
  bio: string;
  recentWork: {
    title: string;
    type: string;
    year: number;
  }[];
  availability: 'available' | 'busy' | 'not-available';
  responseTime: string;
  tags: string[];
}

interface SearchFilters {
  location: string;
  genres: string[];
  skills: string[];
  experience: string;
  availability: string;
  verified: boolean;
}

export default function CollaborationDiscover() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    genres: [],
    skills: [],
    experience: '',
    availability: '',
    verified: false
  });
  const [activeTab, setActiveTab] = useState<'discover' | 'connections' | 'invitations'>('discover');

  // Mock data
  const artists: Artist[] = [
    {
      id: '1',
      name: 'sarah_music',
      displayName: 'Sarah Johnson',
      location: 'Los Angeles, CA',
      avatar: '👩‍🎤',
      coverImage: '🎵',
      genres: ['Indie Pop', 'Alternative'],
      skills: ['Vocals', 'Songwriting', 'Guitar'],
      instruments: ['Guitar', 'Piano'],
      lookingFor: ['Producer', 'Bassist', 'Drummer'],
      experience: 'professional',
      verified: true,
      rating: 4.8,
      collaborations: 12,
      bio: 'Indie pop artist with 5+ years experience. Looking to collaborate on dreamy, atmospheric tracks.',
      recentWork: [
        { title: 'Moonlight Sessions', type: 'EP', year: 2024 },
        { title: 'City Dreams', type: 'Single', year: 2023 }
      ],
      availability: 'available',
      responseTime: 'Usually responds in 2 hours',
      tags: ['Remote Friendly', 'Quick Turnaround', 'Creative']
    },
    {
      id: '2',
      name: 'beat_maker_mike',
      displayName: 'Mike Chen',
      location: 'New York, NY',
      avatar: '🎧',
      coverImage: '🎛️',
      genres: ['Hip-Hop', 'R&B', 'Electronic'],
      skills: ['Production', 'Mixing', 'Beat Making'],
      instruments: ['MPC', 'Synthesizer'],
      lookingFor: ['Vocalist', 'Rapper', 'Songwriter'],
      experience: 'professional',
      verified: true,
      rating: 4.9,
      collaborations: 28,
      bio: 'Grammy-nominated producer specializing in modern hip-hop and R&B. Open to experimental collaborations.',
      recentWork: [
        { title: 'Future Sounds', type: 'Album', year: 2024 },
        { title: 'Beat Tape Vol. 3', type: 'Mixtape', year: 2024 }
      ],
      availability: 'busy',
      responseTime: 'Usually responds in 1 day',
      tags: ['Industry Connections', 'Professional Quality', 'Chart Success']
    },
    {
      id: '3',
      name: 'acoustic_emma',
      displayName: 'Emma Rodriguez',
      location: 'Austin, TX',
      avatar: '🎸',
      coverImage: '🌟',
      genres: ['Folk', 'Country', 'Acoustic'],
      skills: ['Guitar', 'Vocals', 'Songwriting'],
      instruments: ['Acoustic Guitar', 'Harmonica'],
      lookingFor: ['Fiddle Player', 'Harmonica', 'Backing Vocals'],
      experience: 'intermediate',
      verified: false,
      rating: 4.6,
      collaborations: 8,
      bio: 'Folk storyteller with a passion for authentic acoustic music. Love collaborating on meaningful songs.',
      recentWork: [
        { title: 'Country Roads', type: 'Single', year: 2024 },
        { title: 'Hometown Stories', type: 'EP', year: 2023 }
      ],
      availability: 'available',
      responseTime: 'Usually responds in 4 hours',
      tags: ['Authentic', 'Storytelling', 'Warm Vocals']
    },
    {
      id: '4',
      name: 'synth_wizard',
      displayName: 'Alex Thompson',
      location: 'Seattle, WA',
      avatar: '🎹',
      coverImage: '🌌',
      genres: ['Synthwave', 'Electronic', 'Ambient'],
      skills: ['Synthesizer', 'Sound Design', 'Arrangement'],
      instruments: ['Modular Synth', 'Piano', 'Drum Machine'],
      lookingFor: ['Vocalist', 'Guitarist', 'Visual Artist'],
      experience: 'professional',
      verified: true,
      rating: 4.7,
      collaborations: 15,
      bio: 'Synthwave producer creating nostalgic electronic soundscapes. Looking for creative collaborators.',
      recentWork: [
        { title: 'Neon Nights', type: 'Album', year: 2024 },
        { title: 'Retrowave Compilation', type: 'Compilation', year: 2023 }
      ],
      availability: 'available',
      responseTime: 'Usually responds in 3 hours',
      tags: ['Retro Vibes', 'Cinematic', 'Atmospheric']
    },
    {
      id: '5',
      name: 'jazz_cat_sam',
      displayName: 'Sam Williams',
      location: 'Chicago, IL',
      avatar: '🎺',
      coverImage: '🎷',
      genres: ['Jazz', 'Blues', 'Soul'],
      skills: ['Trumpet', 'Arrangement', 'Improvisation'],
      instruments: ['Trumpet', 'Flugelhorn', 'Piano'],
      lookingFor: ['Saxophonist', 'Pianist', 'Bassist'],
      experience: 'professional',
      verified: true,
      rating: 4.9,
      collaborations: 22,
      bio: 'Jazz trumpet player with conservatory training. Love blending traditional jazz with modern elements.',
      recentWork: [
        { title: 'Modern Standards', type: 'Album', year: 2024 },
        { title: 'Blue Note Sessions', type: 'Live Album', year: 2023 }
      ],
      availability: 'not-available',
      responseTime: 'Usually responds in 6 hours',
      tags: ['Traditional Jazz', 'Improvisation', 'Live Performance']
    }
  ];

  const allGenres = ['Indie Pop', 'Hip-Hop', 'Folk', 'Electronic', 'Jazz', 'Rock', 'R&B', 'Country', 'Alternative', 'Blues'];
  const allSkills = ['Vocals', 'Guitar', 'Piano', 'Production', 'Songwriting', 'Mixing', 'Drums', 'Bass', 'Synthesizer'];

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = !filters.location || artist.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesGenres = filters.genres.length === 0 || filters.genres.some(genre => artist.genres.includes(genre));
    const matchesSkills = filters.skills.length === 0 || filters.skills.some(skill => artist.skills.includes(skill));
    const matchesExperience = !filters.experience || artist.experience === filters.experience;
    const matchesAvailability = !filters.availability || artist.availability === filters.availability;
    const matchesVerified = !filters.verified || artist.verified;

    return matchesSearch && matchesLocation && matchesGenres && matchesSkills && 
           matchesExperience && matchesAvailability && matchesVerified;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'not-available':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenreToggle = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Collaborators</h1>
        <p className="text-gray-600">Find and connect with artists who share your vision</p>
      </div>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          {(['discover', 'connections', 'invitations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'discover' && (
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Artist name, genre, bio..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State, Country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Genres */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genres
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {allGenres.map(genre => (
                    <label key={genre} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.genres.includes(genre)}
                        onChange={() => handleGenreToggle(genre)}
                        className="rounded text-indigo-600"
                      />
                      <span className="ml-2 text-sm">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {allSkills.map(skill => (
                    <label key={skill} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.skills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="rounded text-indigo-600"
                      />
                      <span className="ml-2 text-sm">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any Availability</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="not-available">Not Available</option>
                </select>
              </div>

              {/* Verified Only */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                    className="rounded text-indigo-600"
                  />
                  <span className="ml-2 text-sm">Verified artists only</span>
                </label>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({
                    location: '',
                    genres: [],
                    skills: [],
                    experience: '',
                    availability: '',
                    verified: false
                  });
                  setSearchQuery('');
                }}
                className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Artists Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">{filteredArtists.length} artists found</p>
              <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                <option>Sort by Relevance</option>
                <option>Sort by Rating</option>
                <option>Sort by Experience</option>
                <option>Sort by Location</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredArtists.map(artist => (
                <div key={artist.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  {/* Cover Image */}
                  <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-lg flex items-center justify-center">
                    <span className="text-4xl">{artist.coverImage}</span>
                  </div>
                  
                  <div className="p-6">
                    {/* Profile Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl bg-gray-100 p-2 rounded-full">{artist.avatar}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{artist.displayName}</h3>
                            {artist.verified && (
                              <span className="text-indigo-600" title="Verified Artist">✓</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">@{artist.name}</p>
                          <p className="text-xs text-gray-500">{artist.location}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(artist.availability)}`}>
                        {artist.availability.replace('-', ' ')}
                      </span>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{artist.bio}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>{artist.rating}</span>
                      </div>
                      <div>{artist.collaborations} collabs</div>
                      <div className="text-xs">{artist.responseTime}</div>
                    </div>

                    {/* Genres & Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {artist.genres.slice(0, 2).map((genre, i) => (
                          <span key={i} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                            {genre}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {artist.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Looking For */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-1">Looking for:</p>
                      <div className="flex flex-wrap gap-1">
                        {artist.lookingFor.slice(0, 3).map((item, i) => (
                          <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    {artist.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {artist.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedArtist(artist)}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                      >
                        View Profile
                      </button>
                      <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm">
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredArtists.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No artists found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <button
                  onClick={() => {
                    setFilters({
                      location: '',
                      genres: [],
                      skills: [],
                      experience: '',
                      availability: '',
                      verified: false
                    });
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'connections' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <span className="text-6xl mb-4 block">🤝</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Connections</h3>
          <p className="text-gray-600 mb-4">Artists you've connected with will appear here</p>
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Invite Friends
          </button>
        </div>
      )}

      {activeTab === 'invitations' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <span className="text-6xl mb-4 block">📨</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Collaboration Invitations</h3>
          <p className="text-gray-600 mb-4">Pending invitations and requests will appear here</p>
          <div className="text-sm text-gray-500">
            Check back soon for collaboration opportunities!
          </div>
        </div>
      )}

      {/* Artist Profile Modal */}
      {selectedArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 bg-white bg-opacity-20 text-white rounded-full p-2 hover:bg-opacity-30"
              >
                ✕
              </button>
              <div className="absolute bottom-6 left-6 flex items-center gap-4">
                <div className="text-6xl bg-white bg-opacity-20 p-4 rounded-full">{selectedArtist.avatar}</div>
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold">{selectedArtist.displayName}</h2>
                    {selectedArtist.verified && <span className="text-yellow-300">✓</span>}
                  </div>
                  <p className="opacity-90">@{selectedArtist.name}</p>
                  <p className="opacity-75 text-sm">{selectedArtist.location}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                  {/* Bio */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About</h3>
                    <p className="text-gray-700">{selectedArtist.bio}</p>
                  </div>

                  {/* Recent Work */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Recent Work</h3>
                    <div className="space-y-2">
                      {selectedArtist.recentWork.map((work, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{work.title}</p>
                            <p className="text-sm text-gray-600">{work.type}</p>
                          </div>
                          <span className="text-sm text-gray-500">{work.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Looking For */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Looking For</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedArtist.lookingFor.map((item, i) => (
                        <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span className="flex items-center gap-1">
                          <span>⭐</span>
                          <span>{selectedArtist.rating}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Collaborations:</span>
                        <span>{selectedArtist.collaborations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Experience:</span>
                        <span className="capitalize">{selectedArtist.experience}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span className="text-xs">{selectedArtist.responseTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Genres */}
                  <div>
                    <h4 className="font-semibold mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedArtist.genres.map((genre, i) => (
                        <span key={i} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="font-semibold mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedArtist.skills.map((skill, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Instruments */}
                  <div>
                    <h4 className="font-semibold mb-2">Instruments</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedArtist.instruments.map((instrument, i) => (
                        <span key={i} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                          {instrument}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedArtist.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedArtist.tags.map((tag, i) => (
                          <span key={i} className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Send Message
                    </button>
                    <button className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                      Invite to Project
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Add to Connections
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}