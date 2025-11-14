// Force Light Mode Utility
// This utility ensures the website always stays in light mode

export const forceLightMode = () => {
  // Override matchMedia to always return false for dark mode queries
  if (window.matchMedia) {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = function(query) {
      if (query.includes('prefers-color-scheme: dark')) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: function() {},
          removeListener: function() {},
          addEventListener: function() {},
          removeEventListener: function() {},
          dispatchEvent: function() { return true; }
        };
      }
      return originalMatchMedia(query);
    };
  }

  // Force light color scheme on document
  const forceStyles = () => {
    document.documentElement.style.setProperty('color-scheme', 'light only', 'important');
    document.documentElement.style.setProperty('background-color', '#ffffff', 'important');
    document.documentElement.style.setProperty('color', '#111827', 'important');
    
    document.body.style.setProperty('background-color', '#ffffff', 'important');
    document.body.style.setProperty('color', '#111827', 'important');
    document.body.style.setProperty('color-scheme', 'light only', 'important');
    
    // Add meta tag if not exists
    if (!document.querySelector('meta[name="color-scheme"]')) {
      const meta = document.createElement('meta');
      meta.name = 'color-scheme';
      meta.content = 'light only';
      document.head.appendChild(meta);
    }
    
    // Add viewport meta for better mobile handling
    if (!document.querySelector('meta[name="theme-color"]')) {
      const themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      themeMeta.content = '#ffffff';
      document.head.appendChild(themeMeta);
    }
  };

  // Apply immediately
  forceStyles();

  // Watch for any changes and reapply
  const observer = new MutationObserver(() => {
    forceStyles();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // Override CSS.supports for dark mode queries
  if (window.CSS && window.CSS.supports) {
    const originalSupports = window.CSS.supports;
    window.CSS.supports = function(property, value) {
      if (property === 'color-scheme' && value === 'dark') {
        return false;
      }
      return originalSupports.call(this, property, value);
    };
  }

  return () => {
    observer.disconnect();
  };
};

// Initialize immediately when module loads
if (typeof window !== 'undefined') {
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceLightMode);
  } else {
    forceLightMode();
  }
  
  // Also run on window load as backup
  window.addEventListener('load', forceLightMode);
}

export default forceLightMode;