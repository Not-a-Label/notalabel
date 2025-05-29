#!/bin/bash

# Fix Platform Issues Script for Not a Label
# This script implements fixes for identified navigation and routing issues

echo "🔧 Fixing Not a Label Platform Issues..."

# Server details
SERVER="159.89.247.208"
USER="root"
FRONTEND_DIR="/var/www/not-a-label-frontend"
BACKEND_DIR="/var/www/not-a-label-backend"

# Create missing contact page
echo "📝 Creating contact page..."
ssh $USER@$SERVER "mkdir -p $FRONTEND_DIR/src/app/contact"
scp contact-page.tsx $USER@$SERVER:$FRONTEND_DIR/src/app/contact/page.tsx

# Update dashboard navigation with all features
echo "🧭 Updating dashboard navigation..."
scp updated-dashboard-nav.tsx $USER@$SERVER:$FRONTEND_DIR/src/components/dashboard-nav.tsx

# Create API endpoint for contact form
echo "📮 Creating contact API endpoint..."
ssh $USER@$SERVER "cat > $BACKEND_DIR/routes/contact-routes.js << 'EOF'
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configure email transporter (update with your SMTP settings)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'support@not-a-label.art',
    pass: process.env.SMTP_PASS
  }
});

// Contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;
    
    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Email content
    const mailOptions = {
      from: email,
      to: 'support@not-a-label.art',
      subject: \`[\${category}] \${subject}\`,
      html: \`
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> \${name} (\${email})</p>
        <p><strong>Category:</strong> \${category}</p>
        <p><strong>Subject:</strong> \${subject}</p>
        <p><strong>Message:</strong></p>
        <p>\${message.replace(/\\n/g, '<br>')}</p>
      \`
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    // Auto-reply to user
    const autoReplyOptions = {
      from: 'support@not-a-label.art',
      to: email,
      subject: 'We received your message - Not a Label',
      html: \`
        <h3>Thank you for contacting Not a Label!</h3>
        <p>Hi \${name},</p>
        <p>We've received your message and will get back to you within 24-48 hours.</p>
        <p>In the meantime, feel free to explore our platform and discover amazing music!</p>
        <p>Best regards,<br>The Not a Label Team</p>
      \`
    };
    
    await transporter.sendMail(autoReplyOptions);
    
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
EOF"

# Add contact routes to backend
echo "🔌 Adding contact routes to backend..."
ssh $USER@$SERVER "cd $BACKEND_DIR && sed -i '/\\/api\\/ai-music/a\\
// Contact form routes\\
const contactRoutes = require(\"./routes/contact-routes\");\\
app.use(\"/api/contact\", contactRoutes);' server.js"

# Fix authentication route consistency
echo "🔐 Standardizing authentication routes..."
ssh $USER@$SERVER "cd $FRONTEND_DIR/src/components && sed -i 's|/auth/signup|/auth/register|g' main-nav.tsx"

# Create dashboard music page
echo "🎵 Creating dashboard music page..."
ssh $USER@$SERVER "mkdir -p $FRONTEND_DIR/src/app/dashboard/music && cat > $FRONTEND_DIR/src/app/dashboard/music/page.tsx << 'EOF'
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaMusic, FaUpload, FaPlay, FaPause, FaEdit, FaTrash,
  FaDownload, FaShare, FaEye, FaHeart, FaFilter, FaSearch
} from 'react-icons/fa';

export default function MyMusicPage() {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch user's music
    fetchMyMusic();
  }, []);

  const fetchMyMusic = async () => {
    try {
      const response = await fetch('/api/music/my-tracks', {
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('token')}\`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTracks(data.tracks || []);
      }
    } catch (error) {
      console.error('Error fetching music:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTracks = tracks.filter(track => {
    const matchesFilter = filter === 'all' || track.status === filter;
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Music</h1>
            <p className="text-gray-600">Manage your tracks and releases</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
            <FaUpload />
            Upload New Track
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Tracks</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="processing">Processing</option>
              </select>
            </div>
            
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Track List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your music...</p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaMusic className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tracks found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Upload your first track to get started'}
            </p>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <FaUpload className="inline mr-2" />
              Upload Track
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTracks.map((track) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-6">
                  {/* Album Art */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    {track.artwork ? (
                      <img src={track.artwork} alt={track.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <FaMusic className="text-3xl text-gray-400" />
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{track.title}</h3>
                    <p className="text-gray-600">{track.artist}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaPlay /> {track.plays || 0} plays
                      </span>
                      <span className="flex items-center gap-1">
                        <FaHeart /> {track.likes || 0} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye /> {track.views || 0} views
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Play">
                      <FaPlay className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                      <FaEdit className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Share">
                      <FaShare className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                      <FaDownload className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg" title="Delete">
                      <FaTrash className="text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
EOF"

# Add breadcrumb component for nested routes
echo "🍞 Creating breadcrumb component..."
ssh $USER@$SERVER "cat > $FRONTEND_DIR/src/components/breadcrumb.tsx << 'EOF'
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChevronRight, FaHome } from 'react-icons/fa';

export default function Breadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    return { href, label, isLast: index === pathSegments.length - 1 };
  });

  if (pathSegments.length <= 1) return null;

  return (
    <nav className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <FaHome />
          </Link>
        </li>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <li>
              <FaChevronRight className="text-gray-400 text-xs" />
            </li>
            <li>
              {item.isLast ? (
                <span className="text-gray-700 font-medium">{item.label}</span>
              ) : (
                <Link href={item.href} className="text-gray-500 hover:text-gray-700">
                  {item.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
EOF"

# Create footer component with navigation
echo "🦶 Creating footer with navigation..."
ssh $USER@$SERVER "cat > $FRONTEND_DIR/src/components/footer.tsx << 'EOF'
import React from 'react';
import Link from 'next/link';
import { 
  FaMusic, FaTwitter, FaInstagram, FaLinkedin, FaYoutube,
  FaGithub, FaDiscord, FaEnvelope, FaHeart
} from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'About Us', href: '/about' },
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Blog', href: '/blog' }
    ],
    community: [
      { label: 'Discover Artists', href: '/discover' },
      { label: 'Collaborate', href: '/collaborate' },
      { label: 'Live Shows', href: '/live' },
      { label: 'Learn Music', href: '/learn' }
    ],
    resources: [
      { label: 'Help Center', href: '/help' },
      { label: 'API Docs', href: '/api-docs' },
      { label: 'Contact', href: '/contact' },
      { label: 'Status', href: '/status' }
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'DMCA', href: '/dmca' }
    ]
  };

  const socialLinks = [
    { icon: FaTwitter, href: 'https://twitter.com/notalabel', label: 'Twitter' },
    { icon: FaInstagram, href: 'https://instagram.com/notalabel', label: 'Instagram' },
    { icon: FaLinkedin, href: 'https://linkedin.com/company/notalabel', label: 'LinkedIn' },
    { icon: FaYoutube, href: 'https://youtube.com/notalabel', label: 'YouTube' },
    { icon: FaGithub, href: 'https://github.com/Not-a-Label', label: 'GitHub' },
    { icon: FaDiscord, href: 'https://discord.gg/notalabel', label: 'Discord' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <FaMusic className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold text-white">Not a Label</span>
            </Link>
            <p className="text-sm mb-4">
              Empowering independent musicians to build sustainable careers.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="text-lg" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-semibold text-white mb-2">Stay in the loop</h3>
            <p className="text-sm mb-4">Get the latest updates on new features and artist success stories.</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {currentYear} Not a Label. All rights reserved.</p>
          <p className="mt-2 md:mt-0 flex items-center gap-1">
            Made with <FaHeart className="text-red-500" /> for independent artists
          </p>
        </div>
      </div>
    </footer>
  );
}
EOF"

# Update layout to include footer
echo "📐 Updating layout with footer..."
ssh $USER@$SERVER "cd $FRONTEND_DIR && sed -i '/<\\/body>/i\\
        <Footer />' src/app/layout.tsx && sed -i '/import type { Metadata } from/a\\
import Footer from \"@/components/footer\";' src/app/layout.tsx"

# Install nodemailer for contact form
echo "📦 Installing nodemailer..."
ssh $USER@$SERVER "cd $BACKEND_DIR && npm install nodemailer"

# Rebuild frontend
echo "🔨 Rebuilding frontend..."
ssh $USER@$SERVER "cd $FRONTEND_DIR && npm run build"

# Restart services
echo "🔄 Restarting services..."
ssh $USER@$SERVER "pm2 restart all"

echo "✅ Platform issues fixed successfully!"
echo ""
echo "📋 Changes implemented:"
echo "- Created contact page at /contact"
echo "- Updated dashboard navigation with all features"
echo "- Added dashboard music page at /dashboard/music"
echo "- Created breadcrumb component for better navigation"
echo "- Added comprehensive footer with navigation links"
echo "- Implemented contact form API endpoint"
echo "- Standardized authentication routes"
echo ""
echo "🔍 Next steps:"
echo "1. Test all navigation links"
echo "2. Verify contact form functionality"
echo "3. Check responsive design on mobile"
echo "4. Monitor for any console errors"
echo "5. Update GitHub repository with fixes"