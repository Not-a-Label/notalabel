'use client'

import React, { useState, useEffect } from 'react'
import { 
  BookOpen, Video, Users, Award, TrendingUp, Search,
  Play, Clock, Star, Filter, ChevronRight, Sparkles,
  GraduationCap, Target, Zap, Trophy, Heart
} from 'lucide-react'

interface CourseProgress {
  courseId: string
  progress: number
  lastAccessed: string
}

interface FeaturedCourse {
  id: string
  title: string
  instructor: string
  thumbnail: string
  duration: string
  level: string
  rating: number
  enrollments: number
  price: number
}

export default function EducationalResourcesMain() {
  const [learningPath, setLearningPath] = useState('')
  const [recentCourses, setRecentCourses] = useState<CourseProgress[]>([])
  const [featuredCourses, setFeaturedCourses] = useState<FeaturedCourse[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchEducationalData()
  }, [])

  const fetchEducationalData = async () => {
    try {
      const [pathRes, progressRes, featuredRes] = await Promise.all([
        fetch('/api/education/learning-path'),
        fetch('/api/education/progress'),
        fetch('/api/education/featured')
      ])
      
      const pathData = await pathRes.json()
      const progressData = await progressRes.json()
      const featuredData = await featuredRes.json()
      
      setLearningPath(pathData.currentPath)
      setRecentCourses(progressData.courses)
      setFeaturedCourses(featuredData.courses)
    } catch (error) {
      console.error('Error fetching educational data:', error)
    }
  }

  const categories = [
    { id: 'all', name: 'All Courses', icon: BookOpen },
    { id: 'production', name: 'Music Production', icon: Zap },
    { id: 'business', name: 'Music Business', icon: TrendingUp },
    { id: 'performance', name: 'Performance', icon: Users },
    { id: 'marketing', name: 'Marketing', icon: Target },
    { id: 'technology', name: 'Music Tech', icon: Sparkles }
  ]

  const learningPaths = [
    {
      id: 'producer',
      title: 'Become a Producer',
      description: 'Master music production from basics to advanced',
      courses: 24,
      duration: '6 months',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'artist',
      title: 'Independent Artist',
      description: 'Build your music career without a label',
      courses: 18,
      duration: '4 months',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'engineer',
      title: 'Audio Engineering',
      description: 'Professional mixing and mastering skills',
      courses: 20,
      duration: '5 months',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'business',
      title: 'Music Business Pro',
      description: 'Navigate the music industry successfully',
      courses: 15,
      duration: '3 months',
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">
            Not a Label Academy
          </h1>
          <p className="text-xl mb-8">
            Learn from industry professionals and advance your music career
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, tutorials, mentors..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 bg-white shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Video className="text-purple-600 mb-2" />
            <div className="text-2xl font-bold">1,200+</div>
            <div className="text-gray-600">Video Tutorials</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <GraduationCap className="text-blue-600 mb-2" />
            <div className="text-2xl font-bold">85</div>
            <div className="text-gray-600">Masterclasses</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Users className="text-green-600 mb-2" />
            <div className="text-2xl font-bold">150+</div>
            <div className="text-gray-600">Expert Mentors</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Award className="text-orange-600 mb-2" />
            <div className="text-2xl font-bold">2,500+</div>
            <div className="text-gray-600">Certificates Earned</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Categories & Progress */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <category.icon size={20} />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Continue Learning */}
            {recentCourses.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Continue Learning</h3>
                <div className="space-y-4">
                  {recentCourses.slice(0, 3).map((course) => (
                    <div key={course.courseId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {course.courseId}
                        </span>
                        <span className="text-xs text-gray-500">
                          {course.progress}% complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Learning Paths & Featured */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Paths */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Learning Paths</h2>
                <button className="text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningPaths.map((path) => (
                  <div
                    key={path.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    <div className={`h-2 bg-gradient-to-r ${path.color}`} />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{path.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{path.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {path.courses} courses
                        </span>
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock size={14} />
                          {path.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Courses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Featured Courses</h2>
                <button className="text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  Browse All <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="aspect-video bg-gray-200 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="text-gray-400" size={48} />
                      </div>
                      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                        {course.duration}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">by {course.instructor}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-500 fill-current" size={16} />
                          <span className="text-sm font-medium">{course.rating}</span>
                          <span className="text-sm text-gray-500">
                            ({course.enrollments.toLocaleString()} students)
                          </span>
                        </div>
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {course.level}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          ${course.price}
                        </span>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl hover:shadow-lg transition-shadow">
                <Video className="mb-2" />
                <div className="font-semibold">Browse Tutorials</div>
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-xl hover:shadow-lg transition-shadow">
                <Users className="mb-2" />
                <div className="font-semibold">Find a Mentor</div>
              </button>
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl hover:shadow-lg transition-shadow">
                <Trophy className="mb-2" />
                <div className="font-semibold">Get Certified</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}