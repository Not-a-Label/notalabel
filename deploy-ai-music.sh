#!/bin/bash

# Deploy AI Music Production Suite for Not a Label platform
# This script copies the AI music production components to the server

echo "🎵 Deploying AI Music Production Suite..."

# Server details
SERVER="165.232.191.87"
USER="root"
FRONTEND_DIR="/var/www/not-a-label-frontend"
BACKEND_DIR="/var/www/not-a-label-backend"

# Create AI music production components directory on server
echo "Creating AI music production directory..."
ssh $USER@$SERVER "mkdir -p $FRONTEND_DIR/src/components/ai-music-production"

# Copy AI music production components
echo "Copying AI music production components..."
scp ai-mixing-mastering.tsx $USER@$SERVER:$FRONTEND_DIR/src/components/ai-music-production/
scp ai-chord-progression.tsx $USER@$SERVER:$FRONTEND_DIR/src/components/ai-music-production/
scp ai-vocal-enhancement.tsx $USER@$SERVER:$FRONTEND_DIR/src/components/ai-music-production/
scp ai-production-templates.tsx $USER@$SERVER:$FRONTEND_DIR/src/components/ai-music-production/
scp ai-songwriting.tsx $USER@$SERVER:$FRONTEND_DIR/src/components/ai-music-production/

# Copy AI API routes
echo "Copying AI music API routes..."
scp ai-music-api-routes.js $USER@$SERVER:$BACKEND_DIR/routes/

# Update the main AI music production page to include all components
echo "Creating main AI music production page..."
ssh $USER@$SERVER "cat > $FRONTEND_DIR/src/app/ai-music-production/page.tsx << 'EOF'
'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaMagic, FaMusic, FaMicrophone, FaPalette, FaPencilAlt,
  FaMixer, FaGuitar, FaDrum, FaHeadphones, FaBrain
} from 'react-icons/fa';
import AIMixingMastering from '@/components/ai-music-production/ai-mixing-mastering';
import AIChordProgression from '@/components/ai-music-production/ai-chord-progression';
import AIVocalEnhancement from '@/components/ai-music-production/ai-vocal-enhancement';
import AIProductionTemplates from '@/components/ai-music-production/ai-production-templates';
import AISongwriting from '@/components/ai-music-production/ai-songwriting';

export default function AIMusicProductionPage() {
  const [activeTab, setActiveTab] = useState('mixing');

  const tabs = [
    { id: 'mixing', label: 'Mixing & Mastering', icon: FaMixer, component: AIMixingMastering },
    { id: 'chords', label: 'Chord Progressions', icon: FaGuitar, component: AIChordProgression },
    { id: 'vocals', label: 'Vocal Enhancement', icon: FaMicrophone, component: AIVocalEnhancement },
    { id: 'templates', label: 'Production Templates', icon: FaPalette, component: AIProductionTemplates },
    { id: 'songwriting', label: 'AI Songwriting', icon: FaPencilAlt, component: AISongwriting }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AIMixingMastering;

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-purple-50 to-pink-50\">
      <div className=\"max-w-7xl mx-auto px-4 py-8\">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"text-center mb-12\"
        >
          <div className=\"flex items-center justify-center gap-3 mb-4\">
            <FaBrain className=\"text-4xl text-purple-600\" />
            <h1 className=\"text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent\">
              AI Music Production Suite
            </h1>
            <FaMusic className=\"text-4xl text-pink-600\" />
          </div>
          <p className=\"text-xl text-gray-600 max-w-3xl mx-auto\">
            Harness the power of AI to create, enhance, and perfect your music
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className=\"flex flex-wrap justify-center gap-4 mb-8\">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={\`px-6 py-3 rounded-full flex items-center gap-2 transition-all \${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }\`}
              >
                <Icon className=\"text-lg\" />
                <span className=\"font-medium\">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Active Component */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ActiveComponent />
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className=\"mt-16 grid grid-cols-1 md:grid-cols-3 gap-6\"
        >
          <div className=\"bg-white rounded-xl p-6 shadow-lg\">
            <div className=\"w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4\">
              <FaHeadphones className=\"text-2xl text-purple-600\" />
            </div>
            <h3 className=\"text-lg font-semibold mb-2\">Professional Quality</h3>
            <p className=\"text-gray-600\">
              AI-powered tools trained on industry-standard production techniques
            </p>
          </div>

          <div className=\"bg-white rounded-xl p-6 shadow-lg\">
            <div className=\"w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4\">
              <FaMagic className=\"text-2xl text-pink-600\" />
            </div>
            <h3 className=\"text-lg font-semibold mb-2\">Instant Results</h3>
            <p className=\"text-gray-600\">
              Get professional-sounding music in seconds, not hours
            </p>
          </div>

          <div className=\"bg-white rounded-xl p-6 shadow-lg\">
            <div className=\"w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4\">
              <FaDrum className=\"text-2xl text-indigo-600\" />
            </div>
            <h3 className=\"text-lg font-semibold mb-2\">Creative Freedom</h3>
            <p className=\"text-gray-600\">
              Experiment with unlimited possibilities and break creative blocks
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
EOF"

# Update backend server.js to include AI music routes
echo "Updating backend server to include AI music routes..."
ssh $USER@$SERVER "cd $BACKEND_DIR && sed -i '/\\/api\\/mobile/a\\
// AI Music Production routes\\
const aiMusicRoutes = require(\"./routes/ai-music-api-routes\");\\
app.use(\"/api/ai-music\", aiMusicRoutes);' server.js"

# Add AI music production to dashboard navigation
echo "Adding AI music production to dashboard..."
ssh $USER@$SERVER "cd $FRONTEND_DIR && sed -i '/<FaMobileAlt \\/> Mobile Studio<\\/Link>/a\\
            <Link\\
              href=\"/ai-music-production\"\\
              className={pathname === \"/ai-music-production\" ? activeClass : inactiveClass}\\
            >\\
              <FaBrain /> AI Production\\
            </Link>' src/components/dashboard-nav.tsx"

# Rebuild frontend
echo "Rebuilding frontend..."
ssh $USER@$SERVER "cd $FRONTEND_DIR && npm run build"

# Restart services
echo "Restarting services..."
ssh $USER@$SERVER "pm2 restart all"

echo "✅ AI Music Production Suite deployed successfully!"
echo "🎵 Musicians can now access AI-powered music production tools at:"
echo "   https://not-a-label.art/ai-music-production"
echo ""
echo "Features deployed:"
echo "- AI Mixing & Mastering Assistant"
echo "- AI Chord Progression Generator"
echo "- AI Vocal Enhancement Tools"
echo "- Genre-specific Production Templates"
echo "- Collaborative AI Songwriting Tool"
echo ""
echo "Business revenue streams integrated:"
echo "- \$2.50 per AI processing job"
echo "- \$5.00 for premium AI features"
echo "- \$1.00 per export"
echo "- \$3.00 per collaborative session"