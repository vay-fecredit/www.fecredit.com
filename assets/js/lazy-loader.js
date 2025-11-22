/**
 * Lazy Loader for Heavy Libraries
 * Loads large JavaScript libraries only when needed
 */

class LazyLibraryLoader {
  constructor() {
    this.loadedLibraries = new Map();
    this.loadingPromises = new Map();
  }

  /**
     * Load a script dynamically
     * @param {string} name - Library name for caching
     * @param {string} url - Script URL
     * @param {Function} checkFn - Function to check if library is already loaded
     * @returns {Promise} Resolves when script is loaded
     */
  async loadScript(name, url, checkFn = null) {
    // Check if already loaded globally
    if (checkFn && checkFn()) {
      this.loadedLibraries.set(name, true);
      return Promise.resolve(checkFn());
    }

    // Check if already loaded via this loader
    if (this.loadedLibraries.has(name)) {
      return Promise.resolve(this.loadedLibraries.get(name));
    }

    // Check if currently loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    // Load the script
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
            
      script.onload = () => {
        const lib = checkFn ? checkFn() : true;
        this.loadedLibraries.set(name, lib);
        this.loadingPromises.delete(name);
        resolve(lib);
      };
            
      script.onerror = () => {
        this.loadingPromises.delete(name);
        reject(new Error(`Failed to load library: ${name} from ${url}`));
      };
            
      document.head.appendChild(script);
    });

    this.loadingPromises.set(name, promise);
    return promise;
  }

  /**
     * Load OpenCV.js (9.8MB - large library)
     * Only loads when actually needed
     */
  async loadOpenCV() {
    return this.loadScript(
      'opencv',
      '/assets/js/opencv.js',
      () => window.cv
    );
  }

  /**
     * Load Face-API.js (652KB)
     * Only loads when face detection is needed
     */
  async loadFaceAPI() {
    return this.loadScript(
      'faceapi',
      'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js',
      () => window.faceapi
    );
  }

  /**
     * Load Tesseract.js for OCR (64KB)
     * Only loads when OCR is needed
     */
  async loadTesseract() {
    return this.loadScript(
      'tesseract',
      'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js',
      () => window.Tesseract
    );
  }

  /**
     * Load jsPDF (356KB)
     * Only loads when PDF generation is needed
     */
  async loadJsPDF() {
    return this.loadScript(
      'jspdf',
      '/assets/js/jspdf.umd.min.js',
      () => window.jspdf
    );
  }

  /**
     * Preload library in the background (low priority)
     * Uses requestIdleCallback if available
     * @param {string} method - Method name to call (e.g., 'loadOpenCV')
     */
  preload(method) {
    const load = () => {
      if (typeof this[method] === 'function') {
        this[method]().catch(() => {
          // Preload failed silently - will retry on actual use
        });
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(load, { timeout: 2000 });
    } else {
      setTimeout(load, 1000);
    }
  }

  /**
     * Check if a library is loaded
     * @param {string} name - Library name
     * @returns {boolean}
     */
  isLoaded(name) {
    return this.loadedLibraries.has(name);
  }

  /**
     * Unload a library (remove from cache)
     * Note: This doesn't remove the script from DOM
     * @param {string} name - Library name
     */
  unload(name) {
    this.loadedLibraries.delete(name);
    this.loadingPromises.delete(name);
  }
}

// Create global instance
const lazyLoader = new LazyLibraryLoader();

// Example usage:
// 
// // Load OpenCV only when needed
// button.addEventListener('click', async () => {
//     const cv = await lazyLoader.loadOpenCV();
//     // Use cv here
// });
//
// // Preload in background when user is idle
// lazyLoader.preload('loadFaceAPI');

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LazyLibraryLoader, lazyLoader };
}
