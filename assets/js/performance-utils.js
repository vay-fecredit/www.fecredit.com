/**
 * Performance Utilities
 * Provides throttling, debouncing, and other performance optimizations
 */

/**
 * Throttle function execution
 * Ensures function is called at most once per specified interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Debounce function execution
 * Delays function execution until after specified wait time has elapsed
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute on leading edge instead of trailing
 * @returns {Function} Debounced function
 */
function debounce(func, wait, immediate = false) {
  let timeout;
  return function(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

/**
 * DOM Query Cache
 * Caches DOM queries to avoid repeated lookups
 */
class DOMCache {
  constructor() {
    this.cache = new Map();
  }

  /**
     * Get element by ID (cached)
     * @param {string} id - Element ID
     * @returns {HTMLElement|null}
     */
  getElementById(id) {
    if (!this.cache.has(id)) {
      this.cache.set(id, document.getElementById(id));
    }
    return this.cache.get(id);
  }

  /**
     * Query selector (cached by query string)
     * @param {string} selector - CSS selector
     * @returns {HTMLElement|null}
     */
  querySelector(selector) {
    if (!this.cache.has(selector)) {
      this.cache.set(selector, document.querySelector(selector));
    }
    return this.cache.get(selector);
  }

  /**
     * Query selector all (not cached as result is dynamic)
     * @param {string} selector - CSS selector
     * @returns {NodeList}
     */
  querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }

  /**
     * Clear cache entry
     * @param {string} key - Cache key to clear
     */
  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
     * Invalidate cache when DOM changes
     */
  invalidate() {
    this.cache.clear();
  }
}

/**
 * Request Animation Frame throttle
 * Use requestAnimationFrame for visual updates
 * @param {Function} callback - Callback function
 * @returns {Function} RAF-throttled function
 */
function rafThrottle(callback) {
  let requestId = null;
  let lastArgs;

  const later = (context) => () => {
    requestId = null;
    callback.apply(context, lastArgs);
  };

  const throttled = function(...args) {
    lastArgs = args;
    if (requestId === null) {
      requestId = requestAnimationFrame(later(this));
    }
  };

  throttled.cancel = () => {
    if (requestId !== null) {
      cancelAnimationFrame(requestId);
      requestId = null;
    }
  };

  return throttled;
}

/**
 * Lazy load images using Intersection Observer
 * @param {string} selector - Selector for images to lazy load
 * @param {Object} options - Intersection Observer options
 */
function lazyLoadImages(selector = 'img[data-src]', options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01
  };

  const observerOptions = { ...defaultOptions, ...options };

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
                
        // Load the image
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
                
        // Load srcset if available
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
          img.removeAttribute('data-srcset');
        }

        // Remove loading class and add loaded class
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-loaded');

        // Stop observing this image
        observer.unobserve(img);
      }
    });
  }, observerOptions);

  // Observe all images
  const images = document.querySelectorAll(selector);
  images.forEach(img => imageObserver.observe(img));

  return imageObserver;
}

/**
 * Memory-efficient event listener manager
 * Helps prevent memory leaks by tracking and cleaning up listeners
 */
class EventListenerManager {
  constructor() {
    // Use WeakMap for element-based tracking to prevent memory leaks
    this.elementListeners = new WeakMap();
    this.listenerId = 0;
  }

  /**
     * Add event listener with tracking
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object|boolean} options - Event listener options
     */
  add(element, event, handler, options = false) {
    if (!element) return;

    // Get or create listener map for this element
    let listeners = this.elementListeners.get(element);
    if (!listeners) {
      listeners = new Map();
      this.elementListeners.set(element, listeners);
    }

    // Create unique key for this listener
    const key = `${event}_${this.listenerId++}`;
        
    // Don't add if this exact handler is already registered for this event
    let alreadyRegistered = false;
    listeners.forEach((value) => {
      if (value.event === event && value.handler === handler) {
        alreadyRegistered = true;
      }
    });
        
    if (alreadyRegistered) return;

    element.addEventListener(event, handler, options);
    listeners.set(key, { event, handler, options });
  }

  /**
     * Remove event listener
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
  remove(element, event, handler) {
    if (!element) return;

    const listeners = this.elementListeners.get(element);
    if (!listeners) return;

    // Find and remove matching listeners
    const keysToRemove = [];
    listeners.forEach((value, key) => {
      if (value.event === event && value.handler === handler) {
        element.removeEventListener(event, handler, value.options);
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => listeners.delete(key));
  }

  /**
     * Remove all tracked listeners (requires manual cleanup per element)
     */
  removeAll() {
    // Note: WeakMap cannot be iterated, so we can't automatically clean up all elements
    // This prevents memory leaks but requires manual cleanup via removeAllForElement()
    console.warn('EventListenerManager.removeAll(): Use removeAllForElement(element) for specific cleanup');
  }

  /**
     * Remove all listeners for a specific element
     * @param {HTMLElement} element - Target element
     */
  removeAllForElement(element) {
    if (!element) return;

    const listeners = this.elementListeners.get(element);
    if (!listeners) return;

    listeners.forEach((value) => {
      element.removeEventListener(value.event, value.handler, value.options);
    });

    this.elementListeners.delete(element);
  }
}

// Create global instances for convenience
const domCache = new DOMCache();
const eventManager = new EventListenerManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    throttle,
    debounce,
    rafThrottle,
    DOMCache,
    EventListenerManager,
    lazyLoadImages,
    domCache,
    eventManager
  };
}
