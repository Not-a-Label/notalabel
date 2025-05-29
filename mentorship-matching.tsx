'use client'

import React, { useState, useEffect } from 'react'
import {
  Users, Search, Filter, Star, MessageCircle, Video,
  Calendar, Clock, DollarSign, Award, CheckCircle,
  MapPin, Music, Briefcase, TrendingUp, Heart,
  Shield, ChevronRight, Globe, Zap, BookOpen,
  Headphones, Mic, Radio, Camera, Phone, Mail
} from 'lucide-react'

interface Mentor {
  id: string
  name: string
  title: string
  avatar: string
  bio: string
  expertise: string[]
  genres: string[]
  location: string
  timezone: string
  languages: string[]
  experience: string
  achievements: string[]
  rating: number
  reviews: number
  students: number
  sessionsCompleted: number
  responseTime: string
  availability: {
    days: string[]
    slots: Array<{
      day: string
      times: string[]
    }>
  }
  pricing: {
    oneTime: number
    package5: number
    package10: number
    monthly: number
  }
  offerings: string[]
  verified: boolean
  topMentor: boolean
  testimonials: Array<{
    id: string
    student: string
    rating: number
    comment: string
    date: string
  }>
}

interface MentorshipRequest {
  id: string
  mentorId: string
  status: 'pending' | 'accepted' | 'completed'
  message: string
  goals: string[]
  preferredSchedule: string
  budget: string
  createdAt: string
}

export default function MentorshipMatching() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([])
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [myMentors, setMyMentors] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    expertise: 'all',
    priceRange: 'all',
    availability: 'all',
    rating: 0
  })
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingType, setBookingType] = useState<'oneTime' | 'package' | 'monthly'>('oneTime')

  useEffect(() => {
    fetchMentors()
  }, [])

  useEffect(() => {
    filterMentors()
  }, [mentors, searchQuery, filters])

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/education/mentors')
      const data = await response.json()
      setMentors(data.mentors)
      setFilteredMentors(data.mentors)
    } catch (error) {
      console.error('Error fetching mentors:', error)
    }
  }

  const filterMentors = () => {
    let filtered = [...mentors]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Expertise filter
    if (filters.expertise !== 'all') {
      filtered = filtered.filter(mentor =>
        mentor.expertise.includes(filters.expertise)
      )
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number)
      filtered = filtered.filter(mentor =>
        mentor.pricing.oneTime >= min && mentor.pricing.oneTime <= max
      )
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(mentor => mentor.rating >= filters.rating)
    }

    setFilteredMentors(filtered)
  }

  const bookMentor = async (mentorId: string, type: string) => {
    try {
      const response = await fetch('/api/education/book-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId, type })
      })
      if (response.ok) {
        setMyMentors([...myMentors, mentorId])
        setShowBookingModal(false)
      }
    } catch (error) {
      console.error('Error booking mentor:', error)
    }
  }

  const expertiseOptions = [
    'Music Production', 'Songwriting', 'Vocal Coaching', 'Music Business',
    'Marketing', 'Live Performance', 'Audio Engineering', 'Music Theory'
  ]

  const MentorCard = ({ mentor }: { mentor: Mentor }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gray-300 rounded-full" />
            {mentor.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <CheckCircle className="text-white" size={16} />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{mentor.name}</h3>
              {mentor.topMentor && (
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                  Top Mentor
                </span>
              )}
            </div>
            <p className="text-gray-600">{mentor.title}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {mentor.location}
              </span>
              <span className="flex items-center gap-1">
                <Globe size={14} />
                {mentor.languages.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-gray-700 mb-4 line-clamp-2">{mentor.bio}</p>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {mentor.expertise.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
          {mentor.expertise.length > 3 && (
            <span className="text-gray-500 text-sm">+{mentor.expertise.length - 3} more</span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
              <Star className="fill-current" size={16} />
              <span className="font-semibold">{mentor.rating}</span>
            </div>
            <div className="text-xs text-gray-600">{mentor.reviews} reviews</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="font-semibold mb-1">{mentor.students}</div>
            <div className="text-xs text-gray-600">Students</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="font-semibold mb-1">{mentor.sessionsCompleted}</div>
            <div className="text-xs text-gray-600">Sessions</div>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t pt-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">1-on-1 Session</span>
            <span className="font-semibold">${mentor.pricing.oneTime}/hour</span>
          </div>
          <div className="text-sm text-gray-500">
            Packages available from ${mentor.pricing.package5}/session
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedMentor(mentor)}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            View Profile
          </button>
          <button className="p-2 border rounded-lg hover:bg-gray-50">
            <MessageCircle size={20} />
          </button>
          <button className="p-2 border rounded-lg hover:bg-gray-50">
            <Heart size={20} />
          </button>
        </div>
      </div>
    </div>
  )

  // Mentor Detail Modal
  const MentorDetailModal = ({ mentor }: { mentor: Mentor }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full" />
              <div>
                <h2 className="text-2xl font-bold">{mentor.name}</h2>
                <p className="text-gray-600">{mentor.title}</p>
                <p className="text-sm text-gray-500">{mentor.experience} experience</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMentor(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - About */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio */}
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-gray-700">{mentor.bio}</p>
              </div>

              {/* Expertise */}
              <div>
                <h3 className="font-semibold mb-2">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="font-semibold mb-2">Achievements</h3>
                <ul className="space-y-2">
                  {mentor.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Trophy className="text-purple-600 mt-0.5" size={16} />
                      <span className="text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Testimonials */}
              <div>
                <h3 className="font-semibold mb-2">Student Reviews</h3>
                <div className="space-y-4">
                  {mentor.testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < testimonial.rating ? 'fill-current' : ''}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{testimonial.student}</span>
                      </div>
                      <p className="text-gray-700">{testimonial.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Booking */}
            <div className="space-y-6">
              {/* Availability */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Availability</h3>
                <div className="space-y-2 text-sm">
                  {mentor.availability.slots.map((slot, index) => (
                    <div key={index}>
                      <span className="font-medium">{slot.day}:</span>
                      <span className="text-gray-600 ml-2">{slot.times.join(', ')}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Timezone: {mentor.timezone}
                </p>
              </div>

              {/* Pricing */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Pricing Options</h3>
                <div className="space-y-3">
                  <label className="block cursor-pointer">
                    <input
                      type="radio"
                      name="booking"
                      value="oneTime"
                      checked={bookingType === 'oneTime'}
                      onChange={(e) => setBookingType(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="font-medium">Single Session</span>
                    <div className="text-2xl font-bold text-purple-600">
                      ${mentor.pricing.oneTime}/hour
                    </div>
                  </label>
                  
                  <label className="block cursor-pointer">
                    <input
                      type="radio"
                      name="booking"
                      value="package"
                      checked={bookingType === 'package'}
                      onChange={(e) => setBookingType(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="font-medium">5-Session Package</span>
                    <div className="text-2xl font-bold text-purple-600">
                      ${mentor.pricing.package5}
                      <span className="text-sm text-gray-600 ml-2">
                        (${Math.round(mentor.pricing.package5 / 5)}/session)
                      </span>
                    </div>
                  </label>
                  
                  <label className="block cursor-pointer">
                    <input
                      type="radio"
                      name="booking"
                      value="monthly"
                      checked={bookingType === 'monthly'}
                      onChange={(e) => setBookingType(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="font-medium">Monthly Mentorship</span>
                    <div className="text-2xl font-bold text-purple-600">
                      ${mentor.pricing.monthly}/month
                    </div>
                    <p className="text-xs text-gray-600">4 sessions + unlimited chat</p>
                  </label>
                </div>
                
                <button
                  onClick={() => bookMentor(mentor.id, bookingType)}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors mt-4"
                >
                  Book Now
                </button>
              </div>

              {/* Contact */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Quick Contact</h3>
                <button className="w-full border border-purple-600 text-purple-600 py-2 rounded-lg hover:bg-purple-50 mb-2">
                  <MessageCircle className="inline mr-2" size={16} />
                  Send Message
                </button>
                <button className="w-full border border-purple-600 text-purple-600 py-2 rounded-lg hover:bg-purple-50">
                  <Video className="inline mr-2" size={16} />
                  Schedule Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">
            Find Your Perfect Mentor
          </h1>
          <p className="text-xl mb-8">
            Connect with industry professionals who can guide your music journey
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill, or genre..."
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.expertise}
              onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Expertise</option>
              {expertiseOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">Any Price</option>
              <option value="0-50">$0 - $50/hour</option>
              <option value="50-100">$50 - $100/hour</option>
              <option value="100-200">$100 - $200/hour</option>
              <option value="200-1000">$200+/hour</option>
            </select>

            <select
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">Any Availability</option>
              <option value="immediate">Available Now</option>
              <option value="thisWeek">This Week</option>
              <option value="flexible">Flexible Schedule</option>
            </select>

            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: Number(e.target.value) })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="0">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {filteredMentors.length} Mentors Available
          </h2>
          <button className="text-purple-600 hover:text-purple-700">
            <Filter className="inline mr-2" size={16} />
            More Filters
          </button>
        </div>

        {/* Mentor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      </div>

      {/* Selected Mentor Modal */}
      {selectedMentor && <MentorDetailModal mentor={selectedMentor} />}
    </div>
  )
}