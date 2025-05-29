'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChartBarIcon, SparklesIcon, UsersIcon, CurrencyDollarIcon, MicrophoneIcon, ChartPieIcon } from '@heroicons/react/24/outline';

export default function EnhancedHomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Trigger animations after component mounts
    setIsVisible(true);
    
    // Parallax scroll effect
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Load UX optimizations
    const script = document.createElement('script');
    script.src = '/frontend-ux-optimizations.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleGetStarted = () => {
    setIsLoading(true);
    
    // Show progress feedback
    const progressContainer = document.createElement('div');
    progressContainer.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50';
    progressContainer.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-4 min-w-64">
        <div class="text-center text-gray-700 mb-2">Redirecting to registration...</div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-purple-600 h-2 rounded-full transition-all duration-1000" style="width: 0%"></div>
        </div>
      </div>
    `;
    document.body.appendChild(progressContainer);
    
    const progressBar = progressContainer.querySelector('.bg-purple-600');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      progressBar.style.width = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          router.push('/auth/register');
          progressContainer.remove();
        }, 200);
      }
    }, 100);
  };

  const features = [
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Real-time insights across all platforms with predictive analytics and growth recommendations.',
      color: 'text-blue-400',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: SparklesIcon,
      title: 'AI Career Assistant',
      description: 'Personalized strategies, content optimization, and market trend analysis powered by AI.',
      color: 'text-purple-400',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: UsersIcon,
      title: 'Fan Community Hub',
      description: 'Build lasting relationships with exclusive content, direct messaging, and loyalty programs.',
      color: 'text-green-400',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Revenue Optimization',
      description: 'Smart royalty tracking, automatic splits, and income forecasting with tax preparation.',
      color: 'text-yellow-400',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: MicrophoneIcon,
      title: 'Live Performance Suite',
      description: 'Virtual concerts, event management, merchandise integration, and audience engagement tools.',
      color: 'text-red-400',
      gradient: 'from-red-500 to-rose-500'
    },
    {
      icon: ChartPieIcon,
      title: 'Market Intelligence',
      description: 'Trend forecasting, competitor analysis, and audience behavior prediction with actionable insights.',
      color: 'text-indigo-400',
      gradient: 'from-indigo-500 to-blue-500'
    }
  ];

  const stats = [
    { label: 'Active Artists', value: '12,500+', change: '+23%' },
    { label: 'Streams Tracked', value: '1.2B+', change: '+45%' },
    { label: 'Revenue Managed', value: '$8.2M+', change: '+67%' },
    { label: 'AI Interactions', value: '150K+', change: '+89%' }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Indie Pop Artist',
      content: 'Not a Label transformed my career. The AI insights helped me grow from 1K to 50K monthly listeners!',
      avatar: '/avatars/sarah.jpg',
      streams: '2.3M streams'
    },
    {
      name: 'Marcus Rivera',
      role: 'Hip-Hop Producer',
      content: 'The revenue tracking and collaboration tools saved me hours every week. Game changer!',
      avatar: '/avatars/marcus.jpg',
      earnings: '$125K revenue'
    },
    {
      name: 'Luna Park',
      role: 'Electronic Artist',
      content: 'Live streaming integration boosted my virtual concert attendance by 400%. Incredible platform!',
      avatar: '/avatars/luna.jpg',
      fans: '15K active fans'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Enhanced Navigation with blur effect */}
      <header className="fixed top-0 w-full bg-slate-900/90 backdrop-blur-xl z-50 border-b border-slate-800/50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Image
                src="/logo-nal.png"
                alt="Not a Label"
                width={40}
                height={40}
                className="rounded-lg transition-transform hover:scale-110"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25"></div>
            </div>
            <span className="text-xl font-bold text-white">Not a Label</span>
          </div>
          <div className="flex items-center space-x-6">
            {['Discover', 'Collaborate', 'Live', 'Learn', 'Mobile App', 'About', 'Pricing'].map((item) => (
              <Link 
                key={item}
                href={`/${item.toLowerCase().replace(' ', '-')}`} 
                className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
              >
                {item}
              </Link>
            ))}
            <Link 
              href="/auth/login" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-lg font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/25 hover:scale-105 disabled:opacity-75 relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                'Get Started'
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Enhanced Hero Section with parallax */}
      <section className="pt-32 pb-20 px-6 relative">
        <div 
          className="absolute inset-0 opacity-20 parallax-bg"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            background: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.3), transparent 50%), radial-gradient(circle at 70% 30%, rgba(219, 39, 119, 0.3), transparent 50%)'
          }}
        ></div>
        
        <div className={`container mx-auto text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Music Career,
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent"> Amplified</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            The most advanced platform for independent artists. Track your growth, engage your fans, 
            and get AI-powered insights to accelerate your career exponentially.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-75 relative group overflow-hidden"
            >
              <span className="relative z-10">
                {isLoading ? 'Redirecting...' : 'Start Free Trial'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
            <Link
              href="/demo"
              className="bg-slate-800/50 hover:bg-slate-700/50 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 border border-slate-600 hover:border-slate-500 backdrop-blur-sm hover:scale-105"
            >
              Watch Demo
            </Link>
          </div>
          
          {/* Enhanced Stats with animations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 mb-1">{stat.label}</div>
                <div className="text-green-400 text-sm font-medium">{stat.change} this month</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 px-6 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
            Everything You Need to <span className="text-purple-400">Dominate</span>
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Cutting-edge tools designed specifically for the modern independent artist.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="feature-card group bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
                  style={{ 
                    opacity: 0,
                    transform: 'translateY(20px)',
                    animation: isVisible ? `fadeInUp 0.6s ease forwards ${index * 100}ms` : 'none'
                  }}
                >
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${feature.gradient} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* New Testimonials Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            Success <span className="text-purple-400">Stories</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all duration-500 hover:scale-105"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div className="text-purple-400 font-medium">
                  {testimonial.streams || testimonial.earnings || testimonial.fans}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-pink-800 opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Music Career?
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                Join over 12,500 independent artists who are already accelerating their growth with Not a Label.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-75"
                >
                  {isLoading ? 'Loading...' : 'Start Your Journey'}
                </button>
                <Link
                  href="/demo"
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300"
                >
                  See It In Action
                </Link>
              </div>
              <p className="text-purple-100 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/logo-nal.png"
                  alt="Not a Label"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-lg font-bold text-white">Not a Label</span>
              </div>
              <p className="text-gray-400 mb-4">Empowering independent artists worldwide with AI-powered career acceleration.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Discord</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="text-gray-400 hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/api" className="text-gray-400 hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/learn" className="text-gray-400 hover:text-white transition-colors">Learning Hub</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/community" className="text-gray-400 hover:text-white transition-colors">Community</Link></li>
                <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Not a Label. All rights reserved. Built for independent artists, by independent artists.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}