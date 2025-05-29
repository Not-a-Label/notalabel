'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaMusic, FaRocket, FaStar, FaCheckCircle, FaSpotify,
  FaInstagram, FaTiktok, FaYoutube, FaSoundcloud,
  FaGuitar, FaMicrophone, FaHeadphones, FaDrum,
  FaLock, FaGift, FaUsers, FaChartLine
} from 'react-icons/fa';

interface FormData {
  // Basic Info
  artistName: string;
  email: string;
  realName: string;
  location: string;
  
  // Music Profile
  genre: string;
  yearsActive: string;
  monthlyListeners: string;
  primaryPlatform: string;
  
  // Links
  spotifyUrl: string;
  instagramHandle: string;
  websiteUrl: string;
  bestTrackUrl: string;
  
  // Motivation
  whyJoin: string;
  biggestChallenge: string;
  excitedAbout: string;
  
  // Technical
  techComfort: string;
  deviceType: string;
  internetSpeed: string;
}

export default function BetaApplicationPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    artistName: '',
    email: '',
    realName: '',
    location: '',
    genre: '',
    yearsActive: '',
    monthlyListeners: '',
    primaryPlatform: '',
    spotifyUrl: '',
    instagramHandle: '',
    websiteUrl: '',
    bestTrackUrl: '',
    whyJoin: '',
    biggestChallenge: '',
    excitedAbout: '',
    techComfort: '',
    deviceType: '',
    internetSpeed: ''
  });

  const totalSteps = 4;

  const benefits = [
    {
      icon: FaGift,
      title: 'Free Pro Access Forever',
      value: '$600/year value',
      description: 'Get lifetime access to all Pro features at no cost'
    },
    {
      icon: FaStar,
      title: 'Founding Artist Status',
      value: 'Exclusive badge',
      description: 'Be recognized as one of the first 500 artists'
    },
    {
      icon: FaUsers,
      title: 'Direct Platform Input',
      value: 'Shape the future',
      description: 'Your feedback directly influences development'
    },
    {
      icon: FaRocket,
      title: 'Priority Everything',
      value: 'VIP treatment',
      description: 'Priority support, features, and opportunities'
    }
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/beta-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
        >
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thanks for applying to the Not a Label beta program. We'll review your application and get back to you within 48 hours.
          </p>
          <p className="text-sm text-gray-500">
            Check your email for confirmation and next steps.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <FaMusic className="text-2xl" />
            </div>
            <span className="text-2xl font-bold">Not a Label Beta</span>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Join the Beta Program
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Be one of 500 artists shaping the future of independent music. 
            Get lifetime Pro access and help us build the platform you deserve.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur rounded-xl p-6 text-center"
              >
                <Icon className="text-4xl mx-auto mb-3 text-purple-400" />
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-purple-400 font-bold mb-2">{benefit.value}</p>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* Application Form */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Step {step} of {totalSteps}</span>
              <span className="text-sm text-gray-400">
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Your Music'}
                {step === 3 && 'Motivation'}
                {step === 4 && 'Technical'}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Form Steps */}
          <motion.form
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur rounded-2xl p-8"
          >
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Let's start with the basics</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Artist/Band Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.artistName}
                    onChange={(e) => updateFormData('artistName', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="The Midnight Collective"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="artist@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Real Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.realName}
                    onChange={(e) => updateFormData('realName', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="Jane Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="Los Angeles, CA"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Music Profile */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Tell us about your music</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Genre *</label>
                  <select
                    required
                    value={formData.genre}
                    onChange={(e) => updateFormData('genre', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                  >
                    <option value="">Select genre</option>
                    <option value="pop">Pop</option>
                    <option value="rock">Rock</option>
                    <option value="hip-hop">Hip-Hop/Rap</option>
                    <option value="electronic">Electronic</option>
                    <option value="r&b">R&B/Soul</option>
                    <option value="indie">Indie</option>
                    <option value="country">Country</option>
                    <option value="jazz">Jazz</option>
                    <option value="classical">Classical</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Years Making Music *</label>
                  <select
                    required
                    value={formData.yearsActive}
                    onChange={(e) => updateFormData('yearsActive', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                  >
                    <option value="">Select years</option>
                    <option value="0-1">Less than 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Listeners (Estimate) *</label>
                  <select
                    required
                    value={formData.monthlyListeners}
                    onChange={(e) => updateFormData('monthlyListeners', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                  >
                    <option value="">Select range</option>
                    <option value="0-100">0-100</option>
                    <option value="100-1000">100-1,000</option>
                    <option value="1000-10000">1,000-10,000</option>
                    <option value="10000-50000">10,000-50,000</option>
                    <option value="50000+">50,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Best Track Link *</label>
                  <input
                    type="url"
                    required
                    value={formData.bestTrackUrl}
                    onChange={(e) => updateFormData('bestTrackUrl', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="https://spotify.com/track/..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Spotify, SoundCloud, YouTube, etc.</p>
                </div>
              </div>
            )}

            {/* Step 3: Motivation */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Why Not a Label?</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Why do you want to join the beta? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.whyJoin}
                    onChange={(e) => updateFormData('whyJoin', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="I want to take control of my music career and..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    What's your biggest challenge as an independent artist? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.biggestChallenge}
                    onChange={(e) => updateFormData('biggestChallenge', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="Getting professional sound quality without breaking the bank..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    What feature are you most excited about? *
                  </label>
                  <select
                    required
                    value={formData.excitedAbout}
                    onChange={(e) => updateFormData('excitedAbout', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                  >
                    <option value="">Select feature</option>
                    <option value="ai-production">AI Music Production</option>
                    <option value="analytics">Advanced Analytics</option>
                    <option value="monetization">Direct Monetization</option>
                    <option value="collaboration">Collaboration Tools</option>
                    <option value="education">Educational Resources</option>
                    <option value="distribution">Music Distribution</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Technical */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Almost done!</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    How comfortable are you with technology? *
                  </label>
                  <select
                    required
                    value={formData.techComfort}
                    onChange={(e) => updateFormData('techComfort', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner - I need help with basics</option>
                    <option value="intermediate">Intermediate - I can figure things out</option>
                    <option value="advanced">Advanced - I love trying new tech</option>
                    <option value="expert">Expert - I help others with tech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Device *
                  </label>
                  <select
                    required
                    value={formData.deviceType}
                    onChange={(e) => updateFormData('deviceType', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                  >
                    <option value="">Select device</option>
                    <option value="mac">Mac</option>
                    <option value="windows">Windows PC</option>
                    <option value="iphone">iPhone</option>
                    <option value="android">Android</option>
                    <option value="ipad">iPad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Social Media (Optional)</label>
                  <input
                    type="text"
                    value={formData.instagramHandle}
                    onChange={(e) => updateFormData('instagramHandle', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="@yourusername"
                  />
                </div>

                <div className="bg-purple-900/30 rounded-lg p-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      required
                      className="mt-1"
                    />
                    <span className="text-sm">
                      I understand this is a beta program and agree to provide feedback, 
                      report bugs, and help shape the platform. I'm excited to be part 
                      of building the future of independent music!
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Back
                </button>
              )}
              
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow ml-auto"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow ml-auto disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </motion.form>

          {/* FAQ */}
          <div className="mt-12 text-center">
            <p className="text-gray-400">
              Questions? Email us at{' '}
              <a href="mailto:beta@not-a-label.art" className="text-purple-400 hover:text-purple-300">
                beta@not-a-label.art
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}