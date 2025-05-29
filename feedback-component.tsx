'use client';

import { useState } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  StarIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface FeedbackData {
  rating: number;
  category: string;
  message: string;
  email?: string;
}

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    category: '',
    message: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'Marketing Features',
    'AI Content Generation',
    'User Interface',
    'Performance',
    'Bug Report',
    'Feature Request',
    'General'
  ];

  const submitFeedback = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          ...feedback,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setStep(1);
          setFeedback({ rating: 0, category: '', message: '', email: '' });
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setFeedback({ ...feedback, rating: star })}
            className="focus:outline-none"
          >
            {star <= feedback.rating ? (
              <StarIconSolid className="h-8 w-8 text-yellow-400" />
            ) : (
              <StarIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400 transition-colors" />
            )}
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all z-50 group"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Send Feedback
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl border z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Send Feedback</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="p-4">
        {submitted ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-4xl mb-4">✓</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Thank you!</h4>
            <p className="text-gray-600">Your feedback helps us improve the platform.</p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you rate your experience?
                  </label>
                  {renderStars()}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What is your feedback about?
                  </label>
                  <select
                    value={feedback.category}
                    onChange={(e) => setFeedback({ ...feedback, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!feedback.rating || !feedback.category}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us more about your experience
                  </label>
                  <textarea
                    value={feedback.message}
                    onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                    placeholder="Share your thoughts, suggestions, or report issues..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={feedback.email}
                    onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll only use this to follow up on your feedback
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={submitFeedback}
                    disabled={!feedback.message || isSubmitting}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        Send
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}