'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCommentAlt, FaBug, FaLightbulb, FaStar, FaThumbsUp, 
  FaThumbsDown, FaExclamationTriangle, FaPaperPlane,
  FaSmile, FaFrown, FaMeh, FaGrinStars, FaAngry,
  FaCheckCircle, FaTimes, FaCamera, FaMicrophone
} from 'react-icons/fa';

// Floating Feedback Widget
export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'idea' | 'praise'>('general');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackTypes = [
    { type: 'general', icon: FaCommentAlt, label: 'General', color: 'blue' },
    { type: 'bug', icon: FaBug, label: 'Bug Report', color: 'red' },
    { type: 'idea', icon: FaLightbulb, label: 'Feature Idea', color: 'yellow' },
    { type: 'praise', icon: FaStar, label: 'Praise', color: 'green' }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const feedback = {
      type: feedbackType,
      rating,
      message,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });
      
      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setMessage('');
        setRating(0);
      }, 2000);
    } catch (error) {
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center text-white z-50"
      >
        <FaCommentAlt className="text-xl" />
      </motion.button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              {!isSubmitted ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Send Feedback</h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Feedback Type Selection */}
                  <div className="flex gap-2 mb-4">
                    {feedbackTypes.map(({ type, icon: Icon, label, color }) => (
                      <button
                        key={type}
                        onClick={() => setFeedbackType(type as any)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                          feedbackType === type
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`text-${color}-500 mx-auto mb-1`} />
                        <span className="text-xs">{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">How's your experience?</p>
                    <div className="flex justify-center gap-3">
                      {[FaAngry, FaFrown, FaMeh, FaSmile, FaGrinStars].map((Icon, index) => (
                        <button
                          key={index}
                          onClick={() => setRating(index + 1)}
                          className={`text-3xl transition-all ${
                            rating === index + 1
                              ? 'text-purple-600 scale-125'
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                        >
                          <Icon />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-4">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        feedbackType === 'bug' 
                          ? "Describe the issue you're experiencing..."
                          : feedbackType === 'idea'
                          ? "Share your feature idea..."
                          : feedbackType === 'praise'
                          ? "What do you love about the platform?"
                          : "How can we improve?"
                      }
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!message || isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Feedback'}
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-center py-8"
                >
                  <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Thanks for your feedback!</h3>
                  <p className="text-gray-600">We really appreciate it.</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Feature-Specific Feedback Component
export function FeatureFeedback({ feature }: { feature: string }) {
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleFeedback = async (helpful: boolean) => {
    setIsHelpful(helpful);
    
    if (!helpful) {
      setShowDetails(true);
    } else {
      await submitFeedback(helpful, '');
    }
  };

  const submitFeedback = async (helpful: boolean, details: string) => {
    try {
      await fetch('/api/feature-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature,
          helpful,
          details,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Feature feedback error:', error);
    }
  };

  return (
    <div className="bg-purple-50 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Was this helpful?</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleFeedback(true)}
            className={`p-2 rounded-lg transition-all ${
              isHelpful === true
                ? 'bg-green-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <FaThumbsUp />
          </button>
          <button
            onClick={() => handleFeedback(false)}
            className={`p-2 rounded-lg transition-all ${
              isHelpful === false
                ? 'bg-red-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <FaThumbsDown />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3"
          >
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What could be better?"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
            <button
              onClick={() => {
                submitFeedback(false, feedback);
                setShowDetails(false);
              }}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              Submit Feedback
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// NPS Survey Component
export function NPSSurvey({ onComplete }: { onComplete: () => void }) {
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (score === null) return;
    
    setIsSubmitting(true);
    
    try {
      await fetch('/api/nps-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          feedback,
          timestamp: new Date().toISOString()
        })
      });
      
      onComplete();
    } catch (error) {
      console.error('NPS survey error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-xl p-6 z-40"
    >
      <h3 className="text-lg font-semibold mb-3">Quick Question</h3>
      <p className="text-sm text-gray-600 mb-4">
        How likely are you to recommend Not a Label to a fellow musician?
      </p>

      {/* Score Selection */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-gray-500">Not likely</span>
          <span className="text-xs text-gray-500">Very likely</span>
        </div>
        <div className="grid grid-cols-11 gap-1">
          {[...Array(11)].map((_, i) => (
            <button
              key={i}
              onClick={() => setScore(i)}
              className={`py-2 text-sm rounded transition-all ${
                score === i
                  ? i <= 6
                    ? 'bg-red-500 text-white'
                    : i <= 8
                    ? 'bg-yellow-500 text-white'
                    : 'bg-green-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {score !== null && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="mb-4"
        >
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={
              score <= 6
                ? "What can we do better?"
                : score <= 8
                ? "What would make this a 10?"
                : "What do you love most?"
            }
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            rows={3}
          />
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onComplete}
          className="flex-1 py-2 text-gray-600 hover:text-gray-800"
        >
          Maybe later
        </button>
        <button
          onClick={handleSubmit}
          disabled={score === null || isSubmitting}
          className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Submit'}
        </button>
      </div>
    </motion.div>
  );
}

// Session Recording Notice
export function SessionRecordingNotice() {
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const isAcknowledged = localStorage.getItem('sessionRecordingAcknowledged');
    if (isAcknowledged) {
      setAcknowledged(true);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem('sessionRecordingAcknowledged', 'true');
    setAcknowledged(true);
  };

  if (acknowledged) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-purple-900 text-white p-4 z-50"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaCamera className="text-2xl" />
          <div>
            <p className="font-medium">Helping us improve</p>
            <p className="text-sm text-purple-200">
              We're recording this session to understand how to make the platform better for you.
            </p>
          </div>
        </div>
        <button
          onClick={handleAcknowledge}
          className="px-4 py-2 bg-white text-purple-900 rounded-lg font-medium hover:bg-gray-100"
        >
          Got it
        </button>
      </div>
    </motion.div>
  );
}

// Bug Report Modal
export function BugReportModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [bugData, setBugData] = useState({
    title: '',
    description: '',
    steps: '',
    expected: '',
    actual: '',
    severity: 'medium',
    screenshot: null as File | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(bugData).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value as any);
      }
    });

    try {
      await fetch('/api/bug-report', {
        method: 'POST',
        body: formData
      });
      
      onClose();
    } catch (error) {
      console.error('Bug report error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaBug className="text-red-500" />
            Report a Bug
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bug Title *</label>
            <input
              type="text"
              required
              value={bugData.title}
              onChange={(e) => setBugData({ ...bugData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              value={bugData.description}
              onChange={(e) => setBugData({ ...bugData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Detailed description of what went wrong"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Steps to Reproduce</label>
            <textarea
              value={bugData.steps}
              onChange={(e) => setBugData({ ...bugData, steps: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Expected Result</label>
              <input
                type="text"
                value={bugData.expected}
                onChange={(e) => setBugData({ ...bugData, expected: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="What should happen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Actual Result</label>
              <input
                type="text"
                value={bugData.actual}
                onChange={(e) => setBugData({ ...bugData, actual: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="What actually happened"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Severity</label>
            <select
              value={bugData.severity}
              onChange={(e) => setBugData({ ...bugData, severity: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="low">Low - Minor issue</option>
              <option value="medium">Medium - Affects functionality</option>
              <option value="high">High - Major feature broken</option>
              <option value="critical">Critical - Platform unusable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Screenshot (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBugData({ ...bugData, screenshot: e.target.files?.[0] || null })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}