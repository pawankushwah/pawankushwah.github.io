// Intersection Observer for Scroll Reveal
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Theme Management
const setTheme = (theme) => {
    const html = document.documentElement;
    const btns = document.querySelectorAll('.theme-btn');
    
    btns.forEach(btn => btn.classList.remove('active'));
    
    if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.removeAttribute('data-theme');
        document.querySelector('[data-theme-btn="system"]').classList.add('active');
    } else {
        html.setAttribute('data-theme', theme);
        document.querySelector(`[data-theme-btn="${theme}"]`).classList.add('active');
    }
    
    localStorage.setItem('portfolio-theme', theme);
};

document.addEventListener('DOMContentLoaded', () => {
    // Initial Theme
    const savedTheme = localStorage.getItem('portfolio-theme') || 'system';
    setTheme(savedTheme);

    // Theme Toggle Listeners
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(btn.getAttribute('data-theme-btn'));
        });
    });

    // Add reveal styles and observe elements
    const revealElements = document.querySelectorAll('.project-card, .tech-item, #impact div, .founder-card');
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Offset for sticky nav
                    behavior: 'smooth'
                });
            }
        });
    });
});
