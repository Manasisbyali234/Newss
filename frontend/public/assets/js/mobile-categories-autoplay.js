// Mobile Job Categories Carousel Autoplay
(function() {
    function initMobileCategoriesAutoplay() {
        var mobileContainer = document.querySelector('.mobile-categories > div');
        if (!mobileContainer) return;
        
        var items = mobileContainer.querySelectorAll('> div');
        if (items.length === 0) return;
        
        var totalItems = items.length;
        var itemsPerView = 2;
        var currentIndex = 0;
        var autoplayInterval = 4000;
        
        function rotateCategories() {
            currentIndex = (currentIndex + 1) % totalItems;
            var offset = -(currentIndex * (100 / itemsPerView));
            mobileContainer.style.transform = 'translateX(' + offset + '%)';
            mobileContainer.style.transition = 'transform 0.5s ease-in-out';
        }
        
        setInterval(rotateCategories, autoplayInterval);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileCategoriesAutoplay);
    } else {
        initMobileCategoriesAutoplay();
    }
})();
