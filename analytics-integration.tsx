'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface AnalyticsProps {
  GA_MEASUREMENT_ID: string;
}

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    dataLayer: any[];
  }
}

export function GoogleAnalytics({ GA_MEASUREMENT_ID }: AnalyticsProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [GA_MEASUREMENT_ID]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
    </>
  );
}

// Analytics tracking functions
export const analytics = {
  // Track page views
  pageView: (url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
        page_path: url,
      });
    }
  },

  // Track custom events
  event: (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  },

  // Track marketing events
  marketing: {
    contentGenerated: (type: string, tone: string) => {
      analytics.event('content_generated', 'marketing', `${type}_${tone}`);
    },
    
    postCreated: (platform: string, type: string) => {
      analytics.event('post_created', 'marketing', `${platform}_${type}`);
    },
    
    postScheduled: (platform: string) => {
      analytics.event('post_scheduled', 'marketing', platform);
    },
    
    templateUsed: (templateType: string) => {
      analytics.event('template_used', 'marketing', templateType);
    }
  },

  // Track user interactions
  user: {
    registered: (artistType: string) => {
      analytics.event('user_registered', 'auth', artistType);
    },
    
    loggedIn: () => {
      analytics.event('user_logged_in', 'auth');
    },
    
    feedbackSubmitted: (rating: number, category: string) => {
      analytics.event('feedback_submitted', 'engagement', category, rating);
    }
  },

  // Track AI usage
  ai: {
    assistantUsed: (queryType: string) => {
      analytics.event('ai_assistant_used', 'ai', queryType);
    },
    
    contentGenerated: (wordCount: number) => {
      analytics.event('ai_content_generated', 'ai', 'word_count', wordCount);
    }
  },

  // Track performance metrics
  performance: {
    apiCall: (endpoint: string, responseTime: number, success: boolean) => {
      analytics.event('api_call', 'performance', endpoint, responseTime);
      if (!success) {
        analytics.event('api_error', 'performance', endpoint);
      }
    },
    
    pageLoad: (page: string, loadTime: number) => {
      analytics.event('page_load_time', 'performance', page, loadTime);
    }
  }
};

// Hook for tracking page views in Next.js
export function useAnalytics() {
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      analytics.pageView(url);
    };

    // Track initial page load
    analytics.pageView(window.location.pathname);

    // Listen for route changes (for client-side navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handleRouteChange(window.location.pathname);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handleRouteChange(window.location.pathname);
    };

    window.addEventListener('popstate', () => {
      handleRouteChange(window.location.pathname);
    });

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);
}

// Enhanced API wrapper with analytics
export async function apiCallWithAnalytics(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(endpoint, options);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    analytics.performance.apiCall(endpoint, responseTime, response.ok);
    
    return response;
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    analytics.performance.apiCall(endpoint, responseTime, false);
    throw error;
  }
}