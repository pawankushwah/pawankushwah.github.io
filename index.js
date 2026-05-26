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
    document.getElementById('go-to-top').onclick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // Scroll Events: Nav visibility, Go to Top, Progress Bar, Active Links
    const nav = document.querySelector('nav');
    const heroGetInTouch = document.getElementById('hero-get-in-touch');
    const goToTop = document.getElementById('go-to-top');
    const scrollProgress = document.getElementById('scroll-progress');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        // Nav visibility & toggles
        if (window.scrollY > 200) {
            nav.classList.add('visible');
            if (heroGetInTouch) heroGetInTouch.style.opacity = '0';
            if (heroGetInTouch) heroGetInTouch.style.visibility = 'hidden';
            if (goToTop) goToTop.classList.add('visible');
        } else {
            nav.classList.remove('visible');
            if (heroGetInTouch) heroGetInTouch.style.opacity = '1';
            if (heroGetInTouch) heroGetInTouch.style.visibility = 'visible';
            if (goToTop) goToTop.classList.remove('visible');
        }

        // Scroll Progress Bar
        if (scrollProgress) {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            scrollProgress.style.width = `${scrollPercent}%`;
        }

        // Active Nav Link Highlighting
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 200) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (currentSection && link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // EmailJS Form Logic
    if (typeof emailjs !== 'undefined') {
        emailjs.init("oBRK721pGqPwruDL4");
    }

    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const alertBox = document.getElementById('contact-alert');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Initial sending state
            submitBtn.textContent = 'sending...';
            submitBtn.disabled = true;

            emailjs.sendForm('default_service', 'portfolio_contact_form', this)
                .then(() => {
                    submitBtn.textContent = 'Send Message';
                    submitBtn.disabled = false;

                    alertBox.textContent = 'Message Sent';
                    alertBox.className = 'contact-alert success';
                    alertBox.style.display = 'block';

                    contactForm.reset();

                    setTimeout(() => {
                        alertBox.style.display = 'none';
                    }, 5000);
                })
                .catch((error) => {
                    submitBtn.textContent = 'Send Message';
                    submitBtn.disabled = false;

                    alertBox.textContent = 'Unable to send Message';
                    alertBox.className = 'contact-alert error';
                    alertBox.style.display = 'block';

                    setTimeout(() => {
                        alertBox.style.display = 'none';
                    }, 5000);
                });
        });
    }

    // Custom Context Menu for Logos
    const contextMenu = document.getElementById('custom-context-menu');
    const logos = document.querySelectorAll('.logo, .hero-logo');

    if (contextMenu) {
        logos.forEach(logo => {
            logo.addEventListener('contextmenu', (e) => {
                e.preventDefault();

                contextMenu.style.display = 'block';

                let x = e.clientX;
                let y = e.clientY;

                // Keep menu inside viewport
                if (x + contextMenu.offsetWidth > window.innerWidth) {
                    x = window.innerWidth - contextMenu.offsetWidth;
                }
                if (y + contextMenu.offsetHeight > window.innerHeight) {
                    y = window.innerHeight - contextMenu.offsetHeight;
                }

                contextMenu.style.left = `${x}px`;
                contextMenu.style.top = `${y}px`;
            });
        });

        // Hide on click outside
        document.addEventListener('click', (e) => {
            if (contextMenu.style.display === 'block') {
                contextMenu.style.display = 'none';
            }
        });
    }
});
