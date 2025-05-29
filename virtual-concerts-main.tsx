'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';

interface VirtualConcert {
  id: string;
  title: string;
  description: string;
  artist: string;
  artistId: string;
  poster: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  ticketPrice: number;
  freeEvent: boolean;
  maxAttendees: number;
  currentAttendees: number;
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  venue: 'virtual' | 'hybrid';
  streamUrl?: string;
  chatEnabled: boolean;
  merchEnabled: boolean;
  recordingEnabled: boolean;
  vipTiers: VipTier[];
  setlist: SetlistItem[];
  sponsors: Sponsor[];
  socialLinks: SocialLink[];
}

interface VipTier {
  id: string;
  name: string;
  price: number;
  perks: string[];
  maxTickets: number;
  soldTickets: number;
  color: string;
}

interface SetlistItem {
  id: string;
  songTitle: string;
  duration: number;
  order: number;
  isPlayed: boolean;
  notes?: string;
}

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface ConcertTicket {
  id: string;
  concertId: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketType: string;
  price: number;
  purchaseDate: string;
  qrCode: string;
  status: 'active' | 'used' | 'refunded';
}

export default function VirtualConcertsMain() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'hosting' | 'attended' | 'create'>('upcoming');
  const [concerts, setConcerts] = useState<VirtualConcert[]>([]);
  const [tickets, setTickets] = useState<ConcertTicket[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedConcert, setSelectedConcert] = useState<VirtualConcert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConcerts();
    fetchTickets();
  }, []);

  const fetchConcerts = async () => {
    try {
      const response = await fetch('/api/concerts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setConcerts(data.concerts || []);
    } catch (error) {
      console.error('Error fetching concerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/concerts/tickets', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const createConcert = async (concertData: any) => {
    try {
      const response = await fetch('/api/concerts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(concertData)
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        fetchConcerts();
      }
    } catch (error) {
      console.error('Error creating concert:', error);
    }
  };

  const purchaseTicket = async (concertId: string, ticketType: string) => {
    try {
      const response = await fetch(`/api/concerts/${concertId}/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticketType })
      });
      
      if (response.ok) {
        fetchTickets();
        fetchConcerts();
      }
    } catch (error) {
      console.error('Error purchasing ticket:', error);
    }
  };

  const joinConcert = async (concertId: string) => {
    try {
      const response = await fetch(`/api/concerts/${concertId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      const data = await response.json();
      if (data.streamUrl) {
        window.open(data.streamUrl, '_blank');
      }
    } catch (error) {
      console.error('Error joining concert:', error);
    }
  };

  const renderUpcoming = () => (
    <div className="space-y-6">
      {concerts.filter(c => c.status === 'upcoming').map(concert => (
        <div key={concert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={concert.poster || '/api/placeholder/400/300'}
                alt={concert.title}
                className="w-full h-48 md:h-full object-cover"
              />
            </div>
            <div className="md:w-2/3 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{concert.title}</h3>
                  <p className="text-blue-600 font-medium">{concert.artist}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {concert.freeEvent ? 'FREE' : `$${concert.ticketPrice}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {concert.currentAttendees}/{concert.maxAttendees} attending
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{concert.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-2 font-medium">{new Date(concert.date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>
                  <span className="ml-2 font-medium">{concert.startTime} {concert.timezone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2 font-medium">
                    {Math.floor((new Date(`1970-01-01T${concert.endTime}`).getTime() - 
                      new Date(`1970-01-01T${concert.startTime}`).getTime()) / 60000)} minutes
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Venue:</span>
                  <span className="ml-2 font-medium capitalize">{concert.venue}</span>
                </div>
              </div>

              {/* VIP Tiers */}
              {concert.vipTiers.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">VIP Options:</div>
                  <div className="flex space-x-2">
                    {concert.vipTiers.map(tier => (
                      <div
                        key={tier.id}
                        className={`px-2 py-1 rounded text-xs font-medium ${tier.color} text-white`}
                      >
                        {tier.name} - ${tier.price}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                {tickets.some(t => t.concertId === concert.id) ? (
                  <button
                    onClick={() => joinConcert(concert.id)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Join Concert
                  </button>
                ) : (
                  <button
                    onClick={() => purchaseTicket(concert.id, 'standard')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={concert.currentAttendees >= concert.maxAttendees}
                  >
                    {concert.freeEvent ? 'Get Free Ticket' : 'Buy Ticket'}
                  </button>
                )}
                <button
                  onClick={() => setSelectedConcert(concert)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {concerts.filter(c => c.status === 'upcoming').length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming concerts</h3>
          <p className="text-gray-600">Check back later for new virtual concerts</p>
        </div>
      )}
    </div>
  );

  const renderHosting = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Your Concerts</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Concert
        </button>
      </div>

      {concerts.filter(c => c.artistId === user?.id).map(concert => (
        <div key={concert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{concert.title}</h3>
              <p className="text-gray-600">{new Date(concert.date).toLocaleDateString()} at {concert.startTime}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              concert.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
              concert.status === 'live' ? 'bg-green-100 text-green-800' :
              concert.status === 'ended' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {concert.status.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{concert.currentAttendees}</div>
              <div className="text-sm text-gray-500">Attendees</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                ${(concert.currentAttendees * concert.ticketPrice).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{concert.setlist.length}</div>
              <div className="text-sm text-gray-500">Songs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {concert.setlist.filter(s => s.isPlayed).length}
              </div>
              <div className="text-sm text-gray-500">Played</div>
            </div>
          </div>

          <div className="flex space-x-3">
            {concert.status === 'upcoming' && (
              <>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Start Concert
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Edit
                </button>
              </>
            )}
            {concert.status === 'live' && (
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                End Concert
              </button>
            )}
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      ))}

      {concerts.filter(c => c.artistId === user?.id).length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎤</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Host your first virtual concert</h3>
          <p className="text-gray-600 mb-6">Create immersive experiences for your fans worldwide</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Concert
          </button>
        </div>
      )}
    </div>
  );

  const renderAttended = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Your Tickets</h2>
      
      {tickets.map(ticket => {
        const concert = concerts.find(c => c.id === ticket.concertId);
        if (!concert) return null;
        
        return (
          <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={concert.poster || '/api/placeholder/80/80'}
                  alt={concert.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-bold text-gray-900">{concert.title}</h3>
                  <p className="text-blue-600">{concert.artist}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(concert.date).toLocaleDateString()} at {concert.startTime}
                  </p>
                  <p className="text-xs text-gray-500">Ticket Type: {ticket.ticketType}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                  ticket.status === 'active' ? 'bg-green-100 text-green-800' :
                  ticket.status === 'used' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {ticket.status.toUpperCase()}
                </div>
                {concert.status === 'upcoming' && ticket.status === 'active' && (
                  <button
                    onClick={() => joinConcert(concert.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Join Concert
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {tickets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
          <p className="text-gray-600">Browse upcoming concerts to get your first ticket</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Virtual Concerts</h1>
          <p className="text-gray-600">Immersive live music experiences from anywhere in the world</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'upcoming', label: 'Upcoming', icon: '🎪' },
              { id: 'hosting', label: 'Hosting', icon: '🎤' },
              { id: 'attended', label: 'Your Tickets', icon: '🎫' }
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
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading concerts...</p>
          </div>
        ) : (
          <>
            {activeTab === 'upcoming' && renderUpcoming()}
            {activeTab === 'hosting' && renderHosting()}
            {activeTab === 'attended' && renderAttended()}
          </>
        )}
      </div>

      {/* Create Concert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Virtual Concert</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createConcert({
                title: formData.get('title'),
                description: formData.get('description'),
                date: formData.get('date'),
                startTime: formData.get('startTime'),
                endTime: formData.get('endTime'),
                ticketPrice: parseFloat(formData.get('ticketPrice') as string || '0'),
                freeEvent: formData.get('freeEvent') === 'on',
                maxAttendees: parseInt(formData.get('maxAttendees') as string || '100'),
                venue: formData.get('venue'),
                chatEnabled: formData.get('chatEnabled') === 'on',
                merchEnabled: formData.get('merchEnabled') === 'on',
                recordingEnabled: formData.get('recordingEnabled') === 'on'
              });
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Concert Title</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter concert title"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your concert"
                  />
                </div>

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
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    name="endTime"
                    type="time"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Attendees</label>
                  <input
                    name="maxAttendees"
                    type="number"
                    min="1"
                    max="10000"
                    defaultValue="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue Type</label>
                  <select
                    name="venue"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="virtual">Virtual Only</option>
                    <option value="hybrid">Hybrid (Virtual + Physical)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Price ($)</label>
                  <input
                    name="ticketPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center">
                    <input
                      name="freeEvent"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Free Event</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      name="chatEnabled"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Enable Live Chat</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      name="merchEnabled"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Enable Merchandise Sales</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      name="recordingEnabled"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Record Concert</label>
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
                  Create Concert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Concert Details Modal */}
      {selectedConcert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedConcert.title}</h3>
              <button
                onClick={() => setSelectedConcert(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <img
              src={selectedConcert.poster || '/api/placeholder/600/300'}
              alt={selectedConcert.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            
            <div className="space-y-4">
              <p className="text-gray-600">{selectedConcert.description}</p>
              
              {selectedConcert.setlist.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Setlist</h4>
                  <div className="space-y-2">
                    {selectedConcert.setlist.map(song => (
                      <div key={song.id} className="flex items-center justify-between text-sm">
                        <span className={song.isPlayed ? 'line-through text-gray-500' : 'text-gray-900'}>
                          {song.order}. {song.songTitle}
                        </span>
                        <span className="text-gray-500">{song.duration}min</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedConcert.sponsors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sponsors</h4>
                  <div className="flex space-x-2">
                    {selectedConcert.sponsors.map(sponsor => (
                      <img
                        key={sponsor.id}
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="h-8 object-contain"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}