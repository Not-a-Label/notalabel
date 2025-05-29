'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaMusic, FaUpload, FaPlay, FaPause, FaEdit, FaTrash,
  FaDownload, FaShare, FaEye, FaHeart, FaFilter, FaSearch
} from 'react-icons/fa';

export default function MyMusicPage() {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMyMusic();
  }, []);

  const fetchMyMusic = async () => {
    try {
      const response = await fetch('/api/music/my-tracks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTracks(data.tracks || []);
      }
    } catch (error) {
      console.error('Error fetching music:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTracks = tracks.filter(track => {
    const matchesFilter = filter === 'all' || track.status === filter;
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Music</h1>
            <p className="text-gray-600">Manage your tracks and releases</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
            <FaUpload />
            Upload New Track
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Tracks</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="processing">Processing</option>
              </select>
            </div>
            
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your music...</p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaMusic className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tracks found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Upload your first track to get started'}
            </p>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <FaUpload className="inline mr-2" />
              Upload Track
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTracks.map((track) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    {track.artwork ? (
                      <img src={track.artwork} alt={track.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <FaMusic className="text-3xl text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{track.title}</h3>
                    <p className="text-gray-600">{track.artist}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaPlay /> {track.plays || 0} plays
                      </span>
                      <span className="flex items-center gap-1">
                        <FaHeart /> {track.likes || 0} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye /> {track.views || 0} views
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Play">
                      <FaPlay className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                      <FaEdit className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Share">
                      <FaShare className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                      <FaDownload className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg" title="Delete">
                      <FaTrash className="text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}