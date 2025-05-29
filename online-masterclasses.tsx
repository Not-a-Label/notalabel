'use client'

import React, { useState, useEffect } from 'react'
import {
  Video, Calendar, Users, Clock, Star, Play, ChevronRight,
  Award, MessageCircle, Download, Share2, Bell, Sparkles,
  Mic, Music, Headphones, Radio, Camera, Zap, Globe,
  CheckCircle, Lock, Gift, TrendingUp, Heart, BookOpen
} from 'lucide-react'

interface Masterclass {
  id: string
  title: string
  subtitle: string
  instructor: {
    id: string
    name: string
    bio: string
    avatar: string
    credentials: string[]
    socialProof: {
      students: number
      rating: number
      reviews: number
    }
  }
  description: string
  thumbnail: string
  trailer: string
  price: number
  originalPrice: number
  currency: string
  duration: {
    total: string
    sessions: number
    perSession: string
  }
  schedule: {
    startDate: string
    endDate: string
    timezone: string
    sessions: Array<{
      date: string
      time: string
      topic: string
    }>
  }
  features: string[]
  bonuses: Array<{
    title: string
    value: number
  }>
  level: string
  category: string
  maxStudents: number
  enrolledStudents: number
  rating: number
  reviews: Array<{
    id: string
    user: string
    rating: number
    comment: string
    date: string
  }>
  curriculum: Array<{
    week: number
    title: string
    topics: string[]
  }>
  requirements: string[]
  outcomes: string[]
  certificate: boolean
  lifetime: boolean
  moneyBack: number
}

interface UpcomingSession {
  masterclassId: string
  title: string
  instructor: string
  date: string
  time: string
  duration: string
}

export default function OnlineMasterclasses() {
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([])
  const [selectedMasterclass, setSelectedMasterclass] = useState<Masterclass | null>(null)
  const [enrolledClasses, setEnrolledClasses] = useState<string[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showEnrolled, setShowEnrolled] = useState(false)

  useEffect(() => {
    fetchMasterclasses()
    fetchEnrollments()
  }, [])

  const fetchMasterclasses = async () => {
    try {
      const response = await fetch('/api/education/masterclasses')
      const data = await response.json()
      setMasterclasses(data.masterclasses)
    } catch (error) {
      console.error('Error fetching masterclasses:', error)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/education/my-masterclasses')
      const data = await response.json()
      setEnrolledClasses(data.enrolled)
      setUpcomingSessions(data.upcoming)
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  }

  const enrollInMasterclass = async (masterclassId: string) => {
    try {
      const response = await fetch('/api/education/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterclassId })
      })
      if (response.ok) {
        setEnrolledClasses([...enrolledClasses, masterclassId])
      }
    } catch (error) {
      console.error('Error enrolling:', error)
    }
  }

  const categories = [
    { id: 'all', name: 'All Masterclasses', icon: Sparkles },
    { id: 'production', name: 'Music Production', icon: Music },
    { id: 'mixing', name: 'Mixing & Mastering', icon: Headphones },
    { id: 'songwriting', name: 'Songwriting', icon: Mic },
    { id: 'performance', name: 'Live Performance', icon: Radio },
    { id: 'business', name: 'Music Business', icon: TrendingUp },
    { id: 'marketing', name: 'Marketing', icon: Globe }
  ]

  const MasterclassCard = ({ masterclass }: { masterclass: Masterclass }) => {
    const isEnrolled = enrolledClasses.includes(masterclass.id)
    const spotsLeft = masterclass.maxStudents - masterclass.enrolledStudents
    const discount = Math.round((1 - masterclass.price / masterclass.originalPrice) * 100)

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="text-gray-400" size={64} />
          </div>
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {discount}% OFF
            </div>
          )}
          {spotsLeft < 10 && spotsLeft > 0 && (
            <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
              Only {spotsLeft} spots left!
            </div>
          )}
          {isEnrolled && (
            <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <CheckCircle size={16} />
              Enrolled
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div>
              <div className="font-semibold">{masterclass.instructor.name}</div>
              <div className="text-xs text-gray-600">{masterclass.instructor.credentials[0]}</div>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-2">{masterclass.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{masterclass.subtitle}</p>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{new Date(masterclass.schedule.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{masterclass.duration.sessions} sessions</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>{masterclass.enrolledStudents} enrolled</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="text-yellow-500 fill-current" size={16} />
              <span className="font-semibold">{masterclass.rating}</span>
            </div>
            <span className="text-sm text-gray-600">({masterclass.reviews.length} reviews)</span>
          </div>

          {/* Features */}
          <div className="space-y-1 mb-4">
            {masterclass.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="text-green-500" size={16} />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">${masterclass.price}</span>
                {masterclass.originalPrice > masterclass.price && (
                  <span className="text-gray-500 line-through">${masterclass.originalPrice}</span>
                )}
              </div>
              {masterclass.moneyBack > 0 && (
                <div className="text-xs text-gray-600">{masterclass.moneyBack}-day money back</div>
              )}
            </div>
            
            <button
              onClick={() => isEnrolled ? setSelectedMasterclass(masterclass) : enrollInMasterclass(masterclass.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isEnrolled
                  ? 'bg-gray-200 hover:bg-gray-300'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isEnrolled ? 'View Details' : 'Enroll Now'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">
            Live Masterclasses
          </h1>
          <p className="text-xl mb-8">
            Learn directly from industry legends in intimate online sessions
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Award className="mb-2" />
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm">Expert Instructors</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Users className="mb-2" />
              <div className="text-2xl font-bold">15K+</div>
              <div className="text-sm">Active Students</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Star className="mb-2" />
              <div className="text-2xl font-bold">4.9</div>
              <div className="text-sm">Average Rating</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Globe className="mb-2" />
              <div className="text-2xl font-bold">120+</div>
              <div className="text-sm">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions (for enrolled students) */}
      {upcomingSessions.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bell /> Your Upcoming Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingSessions.slice(0, 3).map((session, index) => (
                <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="font-semibold mb-1">{session.title}</div>
                  <div className="text-sm opacity-90">with {session.instructor}</div>
                  <div className="text-sm mt-2">
                    {session.date} at {session.time}
                  </div>
                  <button className="mt-3 bg-white text-blue-600 px-3 py-1 rounded text-sm hover:bg-opacity-90">
                    Join Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Browse Masterclasses</h2>
            <button
              onClick={() => setShowEnrolled(!showEnrolled)}
              className={`px-4 py-2 rounded-lg ${
                showEnrolled ? 'bg-purple-600 text-white' : 'bg-gray-100'
              }`}
            >
              My Enrollments ({enrolledClasses.length})
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <category.icon size={16} />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Masterclass Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {masterclasses
            .filter(mc => selectedCategory === 'all' || mc.category === selectedCategory)
            .filter(mc => !showEnrolled || enrolledClasses.includes(mc.id))
            .map((masterclass) => (
              <MasterclassCard key={masterclass.id} masterclass={masterclass} />
            ))}
        </div>

        {/* Why Choose Our Masterclasses */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why Choose Not a Label Masterclasses?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="text-purple-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Live Interactive Sessions</h3>
              <p className="text-gray-600">
                Real-time Q&A and feedback from industry professionals
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-blue-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Certificate of Completion</h3>
              <p className="text-gray-600">
                Showcase your achievements with verified certificates
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-green-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Lifetime Access</h3>
              <p className="text-gray-600">
                Revisit recordings and materials whenever you need
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}