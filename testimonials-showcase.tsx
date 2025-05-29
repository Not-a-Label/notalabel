'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaStar, FaQuoteLeft, FaPlay, FaMusic, FaChartLine,
  FaDollarSign, FaUsers, FaCheckCircle, FaSpotify,
  FaInstagram, FaTiktok, FaYoutube
} from 'react-icons/fa';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  location: string;
  stats: {
    before: string;
    after: string;
    metric: string;
    timeframe: string;
  };
  story: string;
  quote: string;
  video?: string;
  social: {
    instagram?: string;
    tiktok?: string;
    spotify?: string;
  };
  features: string[];
  genre: string;
}

export default function TestimonialsShowcase() {
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [filter, setFilter] = useState('all');

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Singer-Songwriter',
      image: '/testimonials/sarah-chen.jpg',
      location: 'Los Angeles, CA',
      stats: {
        before: '47',
        after: '52,000',
        metric: 'Monthly Listeners',
        timeframe: '6 months'
      },
      story: 'I was working three jobs to fund studio time. Now I produce broadcast-quality tracks from my bedroom.',
      quote: 'Not a Label gave me the tools and confidence to go from bedroom artist to full-time musician. The AI production suite alone saved me $50,000 in studio costs.',
      video: 'https://youtube.com/watch?v=demo1',
      social: {
        instagram: '@sarahchenmusic',
        spotify: 'spotify:artist:demo1',
        tiktok: '@sarahchenmusic'
      },
      features: ['AI Mixing', 'Analytics Dashboard', 'Distribution'],
      genre: 'Pop'
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      role: 'Hip-Hop Producer',
      image: '/testimonials/marcus-johnson.jpg',
      location: 'Atlanta, GA',
      stats: {
        before: '$500',
        after: '$12,000',
        metric: 'Monthly Revenue',
        timeframe: '4 months'
      },
      story: 'I was selling beats for $20 on random websites. The marketplace changed everything.',
      quote: 'The beat marketplace and analytics helped me understand my audience. I 10x my income and connected with artists worldwide.',
      social: {
        instagram: '@mjbeats',
        tiktok: '@mjbeats'
      },
      features: ['Beat Marketplace', 'Collaboration Tools', 'Analytics'],
      genre: 'Hip-Hop'
    },
    {
      id: '3',
      name: 'Luna Rodriguez',
      role: 'Indie Folk Artist',
      image: '/testimonials/luna-rodriguez.jpg',
      location: 'Austin, TX',
      stats: {
        before: '0',
        after: '25,000',
        metric: 'Email Subscribers',
        timeframe: '8 months'
      },
      story: 'I had no idea how to build a fanbase. The platform taught me everything.',
      quote: 'The educational resources and community support transformed my career. I went from playing coffee shops to sold-out venues.',
      video: 'https://youtube.com/watch?v=demo3',
      social: {
        instagram: '@lunarodriguezmusic',
        spotify: 'spotify:artist:demo3'
      },
      features: ['Fan Engagement', 'Email Marketing', 'Live Tools'],
      genre: 'Folk'
    },
    {
      id: '4',
      name: 'The Midnight Collective',
      role: 'Electronic Duo',
      image: '/testimonials/midnight-collective.jpg',
      location: 'Berlin, Germany',
      stats: {
        before: '5,000',
        after: '500,000',
        metric: 'Total Streams',
        timeframe: '1 year'
      },
      story: 'We were lost in the algorithm. The platform strategies made us visible.',
      quote: 'The AI mastering and release strategy tools helped us compete with major label acts. Our music finally sounds professional.',
      social: {
        instagram: '@midnightcollective',
        spotify: 'spotify:artist:demo4',
        youtube: '@midnightcollective'
      },
      features: ['AI Mastering', 'Release Strategy', 'Playlist Pitching'],
      genre: 'Electronic'
    },
    {
      id: '5',
      name: 'James Mitchell',
      role: 'Rock Guitarist',
      image: '/testimonials/james-mitchell.jpg',
      location: 'Nashville, TN',
      stats: {
        before: '2',
        after: '150+',
        metric: 'Collaborations',
        timeframe: '10 months'
      },
      story: 'I was a solo artist struggling alone. Now I have a global network.',
      quote: 'The collaboration features connected me with musicians worldwide. I\'ve played on tracks in 12 different countries!',
      social: {
        instagram: '@jamesmitchellguitar',
        tiktok: '@jmitchellmusic'
      },
      features: ['Collaboration Network', 'Session Work', 'Global Reach'],
      genre: 'Rock'
    },
    {
      id: '6',
      name: 'Aisha Patel',
      role: 'R&B Vocalist',
      image: '/testimonials/aisha-patel.jpg',
      location: 'London, UK',
      stats: {
        before: '£0',
        after: '£8,000',
        metric: 'Sync Licensing Revenue',
        timeframe: '5 months'
      },
      story: 'I didn\'t know sync licensing existed. Now it\'s my biggest revenue stream.',
      quote: 'The platform opened doors I didn\'t know existed. My music is now in TV shows and commercials globally.',
      video: 'https://youtube.com/watch?v=demo6',
      social: {
        instagram: '@aishapatelmusic',
        spotify: 'spotify:artist:demo6'
      },
      features: ['Sync Licensing', 'Rights Management', 'Global Distribution'],
      genre: 'R&B'
    }
  ];

  const genres = ['all', 'Pop', 'Hip-Hop', 'Folk', 'Electronic', 'Rock', 'R&B'];

  const filteredTestimonials = filter === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.genre === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Real Artists. Real Results.
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of independent musicians who've transformed their careers with Not a Label
          </p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: FaUsers, stat: '10,000+', label: 'Active Artists' },
            { icon: FaMusic, stat: '2.5M+', label: 'Tracks Produced' },
            { icon: FaDollarSign, stat: '$1.2M+', label: 'Artist Earnings' },
            { icon: FaStar, stat: '4.9/5', label: 'Average Rating' }
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <item.icon className="text-3xl text-purple-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold">{item.stat}</h3>
              <p className="text-gray-600">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Genre Filter */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setFilter(genre)}
              className={`px-4 py-2 rounded-full transition-all ${
                filter === genre
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedTestimonial(testimonial)}
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-purple-600 to-pink-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaMusic className="text-6xl text-white opacity-20" />
                </div>
                {testimonial.video && (
                  <div className="absolute top-4 right-4 bg-white rounded-full p-2">
                    <FaPlay className="text-purple-600" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                  <p className="text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>

                {/* Stats */}
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">{testimonial.stats.metric}</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-lg font-semibold text-gray-700">
                        {testimonial.stats.before}
                      </span>
                      <FaChartLine className="text-purple-600" />
                      <span className="text-2xl font-bold text-purple-600">
                        {testimonial.stats.after}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      in {testimonial.stats.timeframe}
                    </p>
                  </div>
                </div>

                {/* Quote Preview */}
                <div className="relative">
                  <FaQuoteLeft className="absolute -top-2 -left-2 text-purple-200 text-2xl" />
                  <p className="text-gray-700 italic line-clamp-3 pl-6">
                    {testimonial.quote}
                  </p>
                </div>

                {/* Features Used */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {testimonial.features.slice(0, 2).map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                  {testimonial.features.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{testimonial.features.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of artists who've taken control of their careers
          </p>
          <button className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all">
            Start Your Journey Today
          </button>
        </motion.div>

        {/* Detailed Testimonial Modal */}
        <AnimatePresence>
          {selectedTestimonial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedTestimonial(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Video Section */}
                {selectedTestimonial.video && (
                  <div className="relative h-64 bg-gray-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FaPlay className="text-6xl text-white opacity-50" />
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedTestimonial.name}</h2>
                      <p className="text-xl text-gray-600">{selectedTestimonial.role}</p>
                      <p className="text-gray-500">{selectedTestimonial.location}</p>
                    </div>
                    <button
                      onClick={() => setSelectedTestimonial(null)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">The Transformation</h3>
                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Before</p>
                        <p className="text-2xl font-bold text-gray-700">
                          {selectedTestimonial.stats.before}
                        </p>
                      </div>
                      <FaChartLine className="text-4xl text-purple-600" />
                      <div className="text-center">
                        <p className="text-sm text-gray-600">After</p>
                        <p className="text-3xl font-bold text-purple-600">
                          {selectedTestimonial.stats.after}
                        </p>
                      </div>
                    </div>
                    <p className="text-center text-gray-600 mt-4">
                      {selectedTestimonial.stats.metric} in {selectedTestimonial.stats.timeframe}
                    </p>
                  </div>

                  {/* Story */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">The Journey</h3>
                    <p className="text-gray-700 mb-4">{selectedTestimonial.story}</p>
                    <div className="relative pl-8">
                      <FaQuoteLeft className="absolute top-0 left-0 text-purple-200 text-2xl" />
                      <p className="text-lg italic text-gray-700">
                        {selectedTestimonial.quote}
                      </p>
                    </div>
                  </div>

                  {/* Features Used */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Features That Made the Difference</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedTestimonial.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full flex items-center gap-2"
                        >
                          <FaCheckCircle />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-4">
                    {selectedTestimonial.social.instagram && (
                      <a
                        href={`https://instagram.com/${selectedTestimonial.social.instagram.substring(1)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-purple-600"
                      >
                        <FaInstagram />
                        {selectedTestimonial.social.instagram}
                      </a>
                    )}
                    {selectedTestimonial.social.spotify && (
                      <a
                        href="#"
                        className="flex items-center gap-2 text-gray-600 hover:text-green-600"
                      >
                        <FaSpotify />
                        Listen on Spotify
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}