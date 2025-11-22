/* custom.js - General UI enhancements and event listeners (Optimized) */
document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM queries for better performance
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const hamburger = document.querySelector('.c-hamburger');
  const navMobile = document.querySelector('.nav-mobile');
  const lazyImages = document.querySelectorAll('img.image-lazy-loading');

  // Smooth scrolling for anchor links
  if (anchorLinks.length > 0) {
    anchorLinks.forEach(anchor => {
      anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Toggle mobile navigation
  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('is-active');
      navMobile.style.display = navMobile.style.display === 'block' ? 'none' : 'block';
    });
  }

  // Lazy load images using IntersectionObserver
  if (lazyImages.length > 0) {
    const imageObserverOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01
    };

    const imageObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          img.classList.remove('image-lazy-loading');
          img.classList.add('image-loaded');
          obs.unobserve(img);
        }
      });
    }, imageObserverOptions);

    lazyImages.forEach(img => imageObserver.observe(img));
  }
});
