// Frontend UX Optimization Components

// 1. Loading Performance Optimization
const LoadingOptimizer = {
  // Lazy load images with intersection observer
  setupLazyLoading: () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  },

  // Preload critical resources
  preloadCriticalResources: () => {
    const criticalImages = ['/logo-nal.png', '/hero-bg.jpg'];
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  },

  // Progressive loading with skeleton screens
  showSkeleton: (element) => {
    element.innerHTML = `
      <div class="animate-pulse">
        <div class="h-6 bg-gray-300 rounded mb-4"></div>
        <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    `;
  }
};

// 2. Interactive Feedback Components
const FeedbackSystem = {
  // Toast notifications
  showToast: (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
      type === 'success' ? 'bg-green-600 text-white' : 
      type === 'error' ? 'bg-red-600 text-white' : 
      'bg-blue-600 text-white'
    }`;
    toast.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-lg">×</button>
      </div>
    `;
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 5000);
  },

  // Progress indicators
  createProgressBar: (container, progress = 0) => {
    const progressBar = document.createElement('div');
    progressBar.className = 'w-full bg-gray-200 rounded-full h-2.5';
    progressBar.innerHTML = `
      <div class="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
    `;
    container.appendChild(progressBar);
    return progressBar;
  },

  // Form validation with real-time feedback
  validateField: (field, rules) => {
    const value = field.value.trim();
    const errorElement = field.parentNode.querySelector('.error-message');
    
    let isValid = true;
    let errorMessage = '';

    if (rules.required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    } else if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    } else if (rules.minLength && value.length < rules.minLength) {
      isValid = false;
      errorMessage = `Minimum ${rules.minLength} characters required`;
    }

    // Update field styling
    field.className = field.className.replace(/(border-red-500|border-green-500)/g, '');
    field.className += isValid ? ' border-green-500' : ' border-red-500';

    // Show/hide error message
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = errorMessage ? 'block' : 'none';
    }

    return isValid;
  }
};

// 3. Smooth Animations & Micro-interactions
const AnimationSystem = {
  // Stagger animations for lists
  staggerAnimation: (elements, delay = 100) => {
    elements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * delay);
    });
  },

  // Smooth scroll to section
  smoothScrollTo: (targetId) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  },

  // Parallax effect for hero section
  setupParallax: () => {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallax = document.querySelector('.parallax-bg');
      if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    });
  },

  // Button click ripple effect
  addRippleEffect: (button) => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.height, rect.width);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
      `;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }
};

// 4. Performance Monitoring
const PerformanceMonitor = {
  // Track page load times
  trackPageLoad: () => {
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.log(`Page loaded in ${loadTime}ms`);
      
      // Send to analytics
      if (window.gtag) {
        window.gtag('event', 'page_load_time', {
          value: loadTime,
          custom_parameter: 'load_performance'
        });
      }
    });
  },

  // Monitor Core Web Vitals
  trackWebVitals: () => {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        console.log('LCP:', entry.startTime);
        if (window.gtag) {
          window.gtag('event', 'lcp', { value: entry.startTime });
        }
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime);
        if (window.gtag) {
          window.gtag('event', 'fid', { value: entry.processingStart - entry.startTime });
        }
      }
    }).observe({ entryTypes: ['first-input'] });
  },

  // Bundle size monitoring
  trackBundleSize: () => {
    if ('navigation' in performance) {
      const nav = performance.navigation;
      const transferSize = nav.transferSize || 0;
      console.log(`Bundle transfer size: ${(transferSize / 1024).toFixed(2)}KB`);
    }
  }
};

// 5. User Experience Enhancements
const UXEnhancements = {
  // Keyboard navigation
  setupKeyboardNavigation: () => {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  },

  // Focus management for modals
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });
  },

  // Auto-save for forms
  setupAutoSave: (form, endpoint) => {
    const inputs = form.querySelectorAll('input, textarea, select');
    let saveTimeout;

    inputs.forEach(input => {
      input.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          const formData = new FormData(form);
          fetch(endpoint, {
            method: 'POST',
            body: formData
          }).then(() => {
            FeedbackSystem.showToast('Auto-saved', 'info');
          });
        }, 2000);
      });
    });
  },

  // Smart search with debouncing
  setupSmartSearch: (input, searchFunction, delay = 300) => {
    let searchTimeout;
    
    input.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();
      
      if (query.length >= 2) {
        searchTimeout = setTimeout(() => {
          searchFunction(query);
        }, delay);
      }
    });
  }
};

// Initialize all optimizations
const initializeUXOptimizations = () => {
  LoadingOptimizer.preloadCriticalResources();
  LoadingOptimizer.setupLazyLoading();
  AnimationSystem.setupParallax();
  PerformanceMonitor.trackPageLoad();
  PerformanceMonitor.trackWebVitals();
  UXEnhancements.setupKeyboardNavigation();

  // Add ripple effect to all buttons
  document.querySelectorAll('button').forEach(button => {
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    AnimationSystem.addRippleEffect(button);
  });

  // Stagger animate feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  if (featureCards.length) {
    AnimationSystem.staggerAnimation(featureCards);
  }
};

// CSS for ripple animation
const rippleCSS = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .keyboard-navigation button:focus,
  .keyboard-navigation a:focus {
    outline: 2px solid #8b5cf6;
    outline-offset: 2px;
  }
  
  .lazy {
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .lazy.loaded {
    opacity: 1;
  }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUXOptimizations);
} else {
  initializeUXOptimizations();
}

export {
  LoadingOptimizer,
  FeedbackSystem,
  AnimationSystem,
  PerformanceMonitor,
  UXEnhancements,
  initializeUXOptimizations
};