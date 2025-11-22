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
        this.listeners = new Map();
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

        const key = this._getKey(element, event, handler);
        
        // Don't add duplicate listeners
        if (this.listeners.has(key)) return;

        element.addEventListener(event, handler, options);
        this.listeners.set(key, { element, event, handler, options });
    }

    /**
     * Remove event listener
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    remove(element, event, handler) {
        if (!element) return;

        const key = this._getKey(element, event, handler);
        const listener = this.listeners.get(key);

        if (listener) {
            element.removeEventListener(event, handler, listener.options);
            this.listeners.delete(key);
        }
    }

    /**
     * Remove all tracked listeners
     */
    removeAll() {
        this.listeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.listeners.clear();
    }

    /**
     * Generate unique key for listener tracking
     */
    _getKey(element, event, handler) {
        return `${element.tagName}_${event}_${handler.name || 'anonymous'}`;
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
