'use client'

import React, { useState, useEffect } from 'react'
import { 
  Video, Play, Pause, Clock, Star, Filter, Search,
  ShoppingCart, Heart, Share2, Download, ChevronRight,
  Eye, ThumbsUp, MessageCircle, BookOpen, Award,
  TrendingUp, Upload, DollarSign, BarChart3
} from 'lucide-react'

interface Tutorial {
  id: string
  title: string
  description: string
  instructor: {
    id: string
    name: string
    avatar: string
    followers: number
  }
  thumbnail: string
  preview: string
  duration: string
  price: number
  rating: number
  reviews: number
  students: number
  level: string
  category: string
  tags: string[]
  chapters: Array<{
    title: string
    duration: string
    free: boolean
  }>
  createdAt: string
  lastUpdated: string
}

interface CartItem {
  tutorialId: string
  price: number
}

export default function VideoTutorialsMarketplace() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState('student')
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    fetchTutorials()
  }, [])

  useEffect(() => {
    filterTutorials()
  }, [tutorials, searchQuery, selectedCategory, priceRange, sortBy])

  const fetchTutorials = async () => {
    try {
      const response = await fetch('/api/education/tutorials')
      const data = await response.json()
      setTutorials(data.tutorials)
      setFilteredTutorials(data.tutorials)
    } catch (error) {
      console.error('Error fetching tutorials:', error)
    }
  }

  const filterTutorials = () => {
    let filtered = [...tutorials]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tutorial =>
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tutorial => tutorial.category === selectedCategory)
    }

    // Price filter
    filtered = filtered.filter(tutorial => 
      tutorial.price >= priceRange.min && tutorial.price <= priceRange.max
    )

    // Sorting
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.students - a.students)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
    }

    setFilteredTutorials(filtered)
  }

  const addToCart = (tutorial: Tutorial) => {
    setCart([...cart, { tutorialId: tutorial.id, price: tutorial.price }])
  }

  const toggleWishlist = (tutorialId: string) => {
    setWishlist(prev => 
      prev.includes(tutorialId)
        ? prev.filter(id => id !== tutorialId)
        : [...prev, tutorialId]
    )
  }

  const categories = [
    'all', 'production', 'mixing', 'mastering', 'songwriting',
    'instruments', 'vocals', 'business', 'marketing', 'live-performance'
  ]

  // Instructor Dashboard
  const InstructorDashboard = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Instructor Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg">
          <DollarSign className="mb-2" />
          <div className="text-2xl font-bold">$12,456</div>
          <div className="text-sm opacity-90">Total Earnings</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-lg">
          <Eye className="mb-2" />
          <div className="text-2xl font-bold">45.2K</div>
          <div className="text-sm opacity-90">Total Views</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg">
          <BookOpen className="mb-2" />
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm opacity-90">Published Tutorials</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg">
          <Star className="mb-2" />
          <div className="text-2xl font-bold">4.8</div>
          <div className="text-sm opacity-90">Average Rating</div>
        </div>
      </div>

      <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
        <Upload size={20} />
        Upload New Tutorial
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Video Tutorials</h1>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('student')}
                  className={`px-4 py-2 rounded ${viewMode === 'student' ? 'bg-white shadow' : ''}`}
                >
                  Student
                </button>
                <button
                  onClick={() => setViewMode('instructor')}
                  className={`px-4 py-2 rounded ${viewMode === 'instructor' ? 'bg-white shadow' : ''}`}
                >
                  Instructor
                </button>
              </div>

              {/* Cart */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <ShoppingCart />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Instructor Dashboard */}
        {viewMode === 'instructor' && <InstructorDashboard />}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tutorials..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border rounded-lg"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tutorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="text-gray-400" size={48} />
                </div>
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                  {tutorial.duration}
                </div>
                {tutorial.price === 0 && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                    FREE
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {tutorial.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full" />
                  <span className="text-sm text-gray-600">{tutorial.instructor.name}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-500 fill-current" size={16} />
                    <span>{tutorial.rating}</span>
                  </div>
                  <span>({tutorial.reviews} reviews)</span>
                  <span>{tutorial.students.toLocaleString()} students</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {tutorial.price === 0 ? 'Free' : `$${tutorial.price}`}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleWishlist(tutorial.id)}
                      className={`p-2 rounded-lg hover:bg-gray-100 ${
                        wishlist.includes(tutorial.id) ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart size={20} fill={wishlist.includes(tutorial.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => addToCart(tutorial)}
                      disabled={cart.some(item => item.tutorialId === tutorial.id)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300"
                    >
                      {cart.some(item => item.tutorialId === tutorial.id) ? 'In Cart' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTutorials.length === 0 && (
          <div className="text-center py-12">
            <Video className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold mb-2">No tutorials found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  )
}