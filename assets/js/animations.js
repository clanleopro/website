window.initAnimations = function () {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, observerOptions);

    // Observe elements that might have been loaded dynamically
    const hiddenElements = document.querySelectorAll('.fade-on-scroll:not(.is-visible)');
    hiddenElements.forEach((el) => observer.observe(el));
};
