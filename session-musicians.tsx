'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';

interface Musician {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  bio: string;
  location: string;
  instruments: string[];
  genres: string[];
  skills: string[];
  experience: 'beginner' | 'intermediate' | 'professional' | 'expert';
  hourlyRate: number;
  projectRate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  verified: boolean;
  rating: number;
  totalJobs: number;
  completionRate: number;
  responseTime: number; // hours
  portfolio: PortfolioItem[];
  reviews: Review[];
  languages: string[];
  timezone: string;
  workingHours: WorkingHours;
  equipment: Equipment[];
  specialties: string[];
  socialLinks: SocialLink[];
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  imageUrl?: string;
  genre: string;
  instrument: string;
  duration: number;
  year: number;
  collaborators?: string[];
}

interface Review {
  id: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  projectType: string;
  date: string;
  isVerified: boolean;
}

interface WorkingHours {
  monday: { start: string; end: string; available: boolean };
  tuesday: { start: string; end: string; available: boolean };
  wednesday: { start: string; end: string; available: boolean };
  thursday: { start: string; end: string; available: boolean };
  friday: { start: string; end: string; available: boolean };
  saturday: { start: string; end: string; available: boolean };
  sunday: { start: string; end: string; available: boolean };
}

interface Equipment {
  type: 'instrument' | 'microphone' | 'interface' | 'software' | 'other';
  name: string;
  brand: string;
  model: string;
}

interface SocialLink {
  platform: string;
  url: string;
  username: string;
}

interface JobPosting {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  deadline: string;
  instruments: string[];
  genres: string[];
  skills: string[];
  requirements: string[];
  remote: boolean;
  location?: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  applicants: number;
  postedDate: string;
  urgency: 'low' | 'medium' | 'high';
  isTemplate?: boolean;
}

interface Application {
  id: string;
  jobId: string;
  musicianId: string;
  musician: Musician;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: string;
  portfolio: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedDate: string;
}

interface Contract {
  id: string;
  jobId: string;
  job: JobPosting;
  musicianId: string;
  musician: Musician;
  clientId: string;
  terms: string;
  budget: number;
  deadline: string;
  milestones: Milestone[];
  status: 'draft' | 'signed' | 'in-progress' | 'completed' | 'disputed';
  createdDate: string;
  signedDate?: string;
  completedDate?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'approved';
  deliverables: string[];
}

export default function SessionMusicians() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'jobs' | 'profile' | 'contracts' | 'earnings'>('browse');
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [filters, setFilters] = useState({
    instrument: '',
    genre: '',
    experience: '',
    location: '',
    availability: '',
    budget: { min: 0, max: 500 },
    sortBy: 'rating'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMusicians();
    fetchJobPostings();
    fetchApplications();
    fetchContracts();
  }, []);

  const fetchMusicians = async () => {
    try {
      const response = await fetch('/api/marketplace/musicians', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setMusicians(data.musicians || []);
    } catch (error) {
      console.error('Error fetching musicians:', error);
    }
  };

  const fetchJobPostings = async () => {
    try {
      const response = await fetch('/api/marketplace/jobs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setJobPostings(data.jobs || []);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/marketplace/applications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/marketplace/contracts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  const hireMusicianDirectly = async (musicianId: string, projectDetails: any) => {
    try {
      const response = await fetch('/api/marketplace/hire', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          musicianId,
          ...projectDetails
        })
      });

      if (response.ok) {
        setShowHireModal(false);
        fetchContracts();
      }
    } catch (error) {
      console.error('Error hiring musician:', error);
    }
  };

  const postJob = async (jobData: any) => {
    try {
      const response = await fetch('/api/marketplace/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        setShowJobModal(false);
        fetchJobPostings();
      }
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  const applyToJob = async (jobId: string, applicationData: any) => {
    try {
      const response = await fetch(`/api/marketplace/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      if (response.ok) {
        fetchApplications();
        fetchJobPostings();
      }
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const filteredMusicians = musicians.filter(musician => {
    const matchesSearch = !searchQuery || 
      musician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      musician.instruments.some(inst => inst.toLowerCase().includes(searchQuery.toLowerCase())) ||
      musician.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesInstrument = !filters.instrument || musician.instruments.includes(filters.instrument);
    const matchesGenre = !filters.genre || musician.genres.includes(filters.genre);
    const matchesExperience = !filters.experience || musician.experience === filters.experience;
    const matchesLocation = !filters.location || musician.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesAvailability = !filters.availability || musician.availability === filters.availability;
    const matchesBudget = musician.hourlyRate >= filters.budget.min && musician.hourlyRate <= filters.budget.max;

    return matchesSearch && matchesInstrument && matchesGenre && matchesExperience && 
           matchesLocation && matchesAvailability && matchesBudget;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.hourlyRate - b.hourlyRate;
      case 'price-high':
        return b.hourlyRate - a.hourlyRate;
      case 'experience':
        const expOrder = { beginner: 1, intermediate: 2, professional: 3, expert: 4 };
        return expOrder[b.experience] - expOrder[a.experience];
      case 'jobs':
        return b.totalJobs - a.totalJobs;
      case 'rating':
      default:
        return b.rating - a.rating;
    }
  });

  const renderBrowse = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search musicians, instruments, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.instrument}
              onChange={(e) => setFilters(prev => ({ ...prev, instrument: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Instruments</option>
              <option value="Guitar">Guitar</option>
              <option value="Piano">Piano</option>
              <option value="Drums">Drums</option>
              <option value="Bass">Bass</option>
              <option value="Vocals">Vocals</option>
              <option value="Violin">Violin</option>
              <option value="Saxophone">Saxophone</option>
            </select>
            
            <select
              value={filters.genre}
              onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Genres</option>
              <option value="Jazz">Jazz</option>
              <option value="Classical">Classical</option>
              <option value="Rock">Rock</option>
              <option value="Pop">Pop</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Electronic">Electronic</option>
            </select>

            <select
              value={filters.experience}
              onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Experience</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="professional">Professional</option>
              <option value="expert">Expert</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="experience">Most Experienced</option>
              <option value="jobs">Most Jobs</option>
            </select>

            <button
              onClick={() => setShowJobModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Post Job
            </button>
          </div>
        </div>
      </div>

      {/* Musicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMusicians.map(musician => (
          <div key={musician.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="relative">
                  <img
                    src={musician.avatar || '/api/placeholder/60/60'}
                    alt={musician.name}
                    className="w-15 h-15 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    musician.availability === 'available' ? 'bg-green-500' :
                    musician.availability === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900">{musician.displayName}</h3>
                    {musician.verified && <span className="text-blue-500">✓</span>}
                  </div>
                  <p className="text-sm text-gray-600">{musician.location}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < Math.floor(musician.rating) ? 'text-yellow-500' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({musician.reviews.length})</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{musician.bio}</p>

              {/* Instruments */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {musician.instruments.slice(0, 3).map(instrument => (
                    <span key={instrument} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                      {instrument}
                    </span>
                  ))}
                  {musician.instruments.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{musician.instruments.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Genres */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {musician.genres.slice(0, 3).map(genre => (
                    <span key={genre} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                <div>
                  <div className="font-bold text-gray-900">{musician.totalJobs}</div>
                  <div className="text-gray-500">Jobs</div>
                </div>
                <div>
                  <div className="font-bold text-gray-900">{musician.completionRate}%</div>
                  <div className="text-gray-500">Success</div>
                </div>
                <div>
                  <div className="font-bold text-gray-900">{musician.responseTime}h</div>
                  <div className="text-gray-500">Response</div>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Starting at</span>
                <span className="text-lg font-bold text-green-600">${musician.hourlyRate}/hr</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedMusician(musician);
                    setShowProfileModal(true);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setSelectedMusician(musician);
                    setShowHireModal(true);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Hire Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMusicians.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎼</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No musicians found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Available Jobs</h2>
        <button
          onClick={() => setShowJobModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Post New Job
        </button>
      </div>

      <div className="space-y-4">
        {jobPostings.filter(job => job.status === 'open').map(job => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-2">by {job.clientName}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                  <span>{job.applicants} applicants</span>
                  {job.remote && <span className="text-green-600">Remote</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  ${job.budget} {job.budgetType === 'hourly' ? '/hr' : 'fixed'}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  job.urgency === 'high' ? 'bg-red-100 text-red-600' :
                  job.urgency === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {job.urgency} priority
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{job.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Instruments Needed</h4>
                <div className="flex flex-wrap gap-1">
                  {job.instruments.map(instrument => (
                    <span key={instrument} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                      {instrument}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Genres</h4>
                <div className="flex flex-wrap gap-1">
                  {job.genres.map(genre => (
                    <span key={genre} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Deadline</h4>
                <p className="text-sm text-gray-600">{new Date(job.deadline).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {!job.remote && job.location && <span>📍 {job.location}</span>}
              </div>
              <button
                onClick={() => {
                  // Apply to job logic would go here
                  console.log('Apply to job:', job.id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Musicians</h1>
          <p className="text-gray-600">Find and hire talented musicians for your projects</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'browse', label: 'Find Musicians', icon: '🎼' },
              { id: 'jobs', label: 'Browse Jobs', icon: '💼' },
              { id: 'profile', label: 'My Profile', icon: '👤' },
              { id: 'contracts', label: 'Contracts', icon: '📄' },
              { id: 'earnings', label: 'Earnings', icon: '💰' }
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
        {activeTab === 'browse' && renderBrowse()}
        {activeTab === 'jobs' && renderJobs()}
        {activeTab === 'profile' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Musician Profile</h3>
            <p className="text-gray-600">Manage your professional musician profile</p>
          </div>
        )}
        {activeTab === 'contracts' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Active Contracts</h3>
            <p className="text-gray-600">Manage your ongoing projects and agreements</p>
          </div>
        )}
        {activeTab === 'earnings' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Earnings Dashboard</h3>
            <p className="text-gray-600">Track your income and payment history</p>
          </div>
        )}
      </div>

      {/* Modals would go here - simplified for brevity */}
    </div>
  );
}