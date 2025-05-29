'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaMusic, FaRocket, FaBell, FaTwitter, FaInstagram, 
  FaLinkedin, FaYoutube, FaTiktok, FaSpotify,
  FaCheckCircle, FaStar, FaUsers, FaChartLine
} from 'react-icons/fa';

export default function LaunchCountdownPage() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Set launch date (adjust as needed)
  const launchDate = new Date('2025-06-15T00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/launch-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const features = [
    {
      icon: FaMusic,
      title: 'AI Music Production',
      description: 'Professional-grade AI tools for mixing, mastering, and production'
    },
    {
      icon: FaChartLine,
      title: 'Advanced Analytics',
      description: 'Real-time insights into your music performance and earnings'
    },
    {
      icon: FaUsers,
      title: 'Collaboration Network',
      description: 'Connect with musicians, producers, and industry professionals'
    },
    {
      icon: FaStar,
      title: 'Career Growth Tools',
      description: 'Everything you need to build a sustainable music career'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Independent Artist',
      image: '/testimonials/sarah.jpg',
      quote: 'Not a Label revolutionized how I manage my music career. The AI tools alone saved me thousands in production costs.'
    },
    {
      name: 'Marcus Johnson',
      role: 'Producer',
      image: '/testimonials/marcus.jpg',
      quote: 'Finally, a platform that understands what independent musicians actually need. The collaboration features are game-changing.'
    },
    {
      name: 'Luna Rodriguez',
      role: 'Singer-Songwriter',
      image: '/testimonials/luna.jpg',
      quote: 'From analytics to distribution, everything is in one place. I\'ve grown my fanbase 10x since joining the beta.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <FaMusic className="text-2xl" />
              </div>
              <span className="text-2xl font-bold">Not a Label</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6"
            >
              <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
              <a href="#testimonials" className="hover:text-purple-400 transition-colors">Testimonials</a>
              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:shadow-lg transition-shadow">
                Get Early Access
              </button>
            </motion.div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Music Career
              <br />
              Starts Here
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              The all-in-one platform for independent musicians. AI-powered tools, 
              advanced analytics, and everything you need to succeed - no label required.
            </p>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl mb-6">Launching In</h2>
            <div className="flex justify-center gap-4 md:gap-8">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="text-center">
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center mb-2">
                    <span className="text-3xl md:text-5xl font-bold">{value}</span>
                  </div>
                  <span className="text-sm md:text-base text-gray-400 capitalize">{unit}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Email Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-md mx-auto"
          >
            <AnimatePresence mode="wait">
              {!isSubscribed ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubscribe}
                  className="flex flex-col md:flex-row gap-4"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-6 py-3 rounded-full bg-white/10 backdrop-blur border border-white/20 focus:outline-none focus:border-purple-400 placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <FaBell />
                    Get Early Access
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <FaCheckCircle className="text-5xl text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">You're on the list!</h3>
                  <p className="text-gray-300">We'll notify you as soon as we launch.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex justify-center gap-4"
          >
            {[FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaTiktok, FaSpotify].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Icon className="text-xl" />
              </a>
            ))}
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-300">Professional tools without the professional price tag</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur rounded-2xl p-8 hover:bg-white/10 transition-colors"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="text-3xl" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Artists Love Not a Label</h2>
            <p className="text-xl text-gray-300">Join thousands of musicians building their careers</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur rounded-2xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Take Control?</h2>
            <p className="text-xl text-gray-300 mb-8">Join the waitlist and get exclusive early access</p>
            <button className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-3 mx-auto">
              <FaRocket />
              Claim Your Spot
            </button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-white/10">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">© 2025 Not a Label. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}