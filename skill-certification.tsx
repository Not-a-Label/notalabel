'use client'

import React, { useState, useEffect } from 'react'
import {
  Award, CheckCircle, Lock, Star, TrendingUp, Download,
  Clock, BookOpen, Target, Zap, Trophy, Shield,
  BarChart3, Users, ChevronRight, Play, FileText,
  Briefcase, Music, Headphones, Mic, Radio, Globe,
  Certificate, Medal, Sparkles, ArrowRight, Share2
} from 'lucide-react'

interface Certification {
  id: string
  title: string
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  skills: string[]
  requirements: {
    courses: number
    practiceHours: number
    projects: number
    assessment: boolean
  }
  duration: string
  price: number
  enrolledCount: number
  completedCount: number
  rating: number
  modules: Array<{
    id: string
    title: string
    description: string
    lessons: number
    duration: string
    completed: boolean
  }>
  benefits: string[]
  instructors: Array<{
    name: string
    title: string
  }>
}

interface UserProgress {
  certificationId: string
  progress: number
  modulesCompleted: number
  projectsSubmitted: number
  practiceHours: number
  currentModule: string
  startDate: string
  estimatedCompletion: string
  achievements: string[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

export default function SkillCertification() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [myCertifications, setMyCertifications] = useState<UserProgress[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null)
  const [showMyCerts, setShowMyCerts] = useState(false)

  useEffect(() => {
    fetchCertifications()
    fetchUserProgress()
  }, [])

  const fetchCertifications = async () => {
    try {
      const response = await fetch('/api/education/certifications')
      const data = await response.json()
      setCertifications(data.certifications)
    } catch (error) {
      console.error('Error fetching certifications:', error)
    }
  }

  const fetchUserProgress = async () => {
    try {
      const response = await fetch('/api/education/my-certifications')
      const data = await response.json()
      setMyCertifications(data.progress)
      setAchievements(data.achievements)
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  const enrollInCertification = async (certificationId: string) => {
    try {
      const response = await fetch('/api/education/enroll-certification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificationId })
      })
      if (response.ok) {
        fetchUserProgress()
      }
    } catch (error) {
      console.error('Error enrolling:', error)
    }
  }

  const categories = [
    { id: 'all', name: 'All Certifications', icon: Award },
    { id: 'production', name: 'Music Production', icon: Music },
    { id: 'engineering', name: 'Audio Engineering', icon: Headphones },
    { id: 'performance', name: 'Performance', icon: Mic },
    { id: 'business', name: 'Music Business', icon: Briefcase },
    { id: 'marketing', name: 'Digital Marketing', icon: Globe }
  ]

  const levelColors = {
    beginner: 'from-green-500 to-emerald-500',
    intermediate: 'from-blue-500 to-cyan-500',
    advanced: 'from-purple-500 to-pink-500',
    professional: 'from-orange-500 to-red-500'
  }

  const CertificationCard = ({ cert }: { cert: Certification }) => {
    const userProgress = myCertifications.find(p => p.certificationId === cert.id)
    const isEnrolled = !!userProgress

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
        <div className={`h-2 bg-gradient-to-r ${levelColors[cert.level]}`} />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">{cert.title}</h3>
              <p className="text-gray-600 text-sm">{cert.description}</p>
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="fill-current" size={16} />
              <span className="font-semibold">{cert.rating}</span>
            </div>
          </div>

          {/* Level Badge */}
          <div className="flex items-center gap-4 mb-4">
            <span className={`px-3 py-1 rounded-full text-white text-sm bg-gradient-to-r ${levelColors[cert.level]}`}>
              {cert.level.charAt(0).toUpperCase() + cert.level.slice(1)}
            </span>
            <span className="text-gray-600 text-sm">{cert.duration}</span>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {cert.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                {skill}
              </span>
            ))}
            {cert.skills.length > 3 && (
              <span className="text-gray-500 text-sm">+{cert.skills.length - 3} more</span>
            )}
          </div>

          {/* Requirements */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-gray-400" />
              <span>{cert.requirements.courses} courses</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <span>{cert.requirements.practiceHours}h practice</span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={16} className="text-gray-400" />
              <span>{cert.requirements.projects} projects</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-gray-400" />
              <span>Final assessment</span>
            </div>
          </div>

          {/* Progress Bar (if enrolled) */}
          {isEnrolled && userProgress && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">{userProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${userProgress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>{cert.enrolledCount} enrolled</span>
            <span>{cert.completedCount} certified</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {cert.price === 0 ? 'Free' : `$${cert.price}`}
            </span>
            <button
              onClick={() => isEnrolled ? setSelectedCertification(cert) : enrollInCertification(cert.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isEnrolled
                  ? 'bg-gray-200 hover:bg-gray-300'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Achievement Badge Component
  const AchievementBadge = ({ achievement }: { achievement: Achievement }) => (
    <div className={`bg-white rounded-lg p-4 border ${achievement.unlockedAt ? 'border-purple-200' : 'border-gray-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          achievement.unlockedAt ? 'bg-purple-100' : 'bg-gray-100'
        }`}>
          <Trophy className={achievement.unlockedAt ? 'text-purple-600' : 'text-gray-400'} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{achievement.title}</h4>
          <p className="text-sm text-gray-600">{achievement.description}</p>
          {achievement.progress !== undefined && (
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-purple-600 h-1 rounded-full"
                  style={{ width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%` }}
                />
              </div>
            </div>
          )}
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
            Professional Certifications
          </h1>
          <p className="text-xl mb-8">
            Validate your skills with industry-recognized certifications
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Award className="mb-2" />
              <div className="text-2xl font-bold">25+</div>
              <div className="text-sm">Certifications</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Users className="mb-2" />
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm">Certified Artists</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Briefcase className="mb-2" />
              <div className="text-2xl font-bold">85%</div>
              <div className="text-sm">Career Growth</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Shield className="mb-2" />
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm">Industry Valid</div>
            </div>
          </div>
        </div>
      </div>

      {/* My Achievements (if any) */}
      {achievements.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">🏆 Your Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.slice(0, 3).map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
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
            <h2 className="text-xl font-semibold">Browse Certifications</h2>
            <button
              onClick={() => setShowMyCerts(!showMyCerts)}
              className={`px-4 py-2 rounded-lg ${
                showMyCerts ? 'bg-purple-600 text-white' : 'bg-gray-100'
              }`}
            >
              My Certifications ({myCertifications.length})
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

        {/* Certification Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications
            .filter(cert => selectedCategory === 'all' || cert.category === selectedCategory)
            .filter(cert => !showMyCerts || myCertifications.some(p => p.certificationId === cert.id))
            .map((cert) => (
              <CertificationCard key={cert.id} cert={cert} />
            ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why Get Certified?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-purple-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Industry Recognition</h3>
              <p className="text-gray-600 text-sm">
                Credentials recognized by top music companies
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-blue-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Career Advancement</h3>
              <p className="text-gray-600 text-sm">
                Stand out and unlock new opportunities
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Exclusive Network</h3>
              <p className="text-gray-600 text-sm">
                Join a community of certified professionals
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Medal className="text-orange-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Digital Credentials</h3>
              <p className="text-gray-600 text-sm">
                Shareable certificates and LinkedIn badges
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}