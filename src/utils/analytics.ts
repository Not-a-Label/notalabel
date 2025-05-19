// Analytics event names
export enum EventName {
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  PROFILE_UPDATE = 'profile_update',
  FORM_SUBMIT = 'form_submit',
  SEARCH = 'search',
  SIGNUP = 'signup',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ERROR = 'error',
  ONBOARDING_START = 'onboarding_start',
  ONBOARDING_STEP = 'onboarding_step',
  ONBOARDING_COMPLETE = 'onboarding_complete'
}

// Analytics event categories
export enum EventCategory {
  USER = 'user',
  CONTENT = 'content',
  UI = 'ui',
  SYSTEM = 'system',
  ONBOARDING = 'onboarding'
}

// For real implementation, this would use a service like Google Analytics, Mixpanel, etc.
export const trackEvent = (eventName: EventName, category: EventCategory, data: Record<string, any> = {}) => {
  // Add common properties to all events
  const eventData = {
    ...data,
    timestamp: new Date().toISOString(),
    // In a real implementation, we'd add user ID, session ID, etc.
  };
  
  // Log the event (for development)
  console.log(`[Analytics] Event: ${eventName}, Category: ${category}`, eventData);
  
  // In a real implementation, we'd send this to an analytics service
  // Example:
  // if (window.gtag) {
  //   window.gtag('event', eventName, {
  //     event_category: category,
  //     ...eventData
  //   });
  // }
  
  // Or to Mixpanel
  // if (window.mixpanel) {
  //   window.mixpanel.track(eventName, {
  //     category,
  //     ...eventData
  //   });
  // }
};

// Track page views
export const trackPageView = (pageName: string) => {
  trackEvent(EventName.PAGE_VIEW, EventCategory.CONTENT, { page: pageName });
};

// Track button clicks
export const trackButtonClick = (buttonName: string) => {
  trackEvent(EventName.BUTTON_CLICK, EventCategory.UI, { button: buttonName });
};

// Track onboarding steps
export const trackOnboardingStep = (step: number, data: Record<string, any> = {}) => {
  trackEvent(EventName.ONBOARDING_STEP, EventCategory.ONBOARDING, { 
    step,
    ...data
  });
};

// Track errors
export const trackError = (errorMessage: string, errorCode?: string) => {
  trackEvent(EventName.ERROR, EventCategory.SYSTEM, { 
    message: errorMessage,
    code: errorCode
  });
}; 