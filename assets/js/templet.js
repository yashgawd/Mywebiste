document.addEventListener('DOMContentLoaded', function() {

    // --- Theme Management ---
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    let theme = document.documentElement.getAttribute('data-theme') || 'dark';
    if (currentTheme) {
        theme = currentTheme;
    } else {
        theme = prefersDarkScheme.matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const updateToggleButtonAria = (currentTheme) => {
        const label = currentTheme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode';
        if(themeToggle) {
           themeToggle.setAttribute('aria-label', label);
        }
    };
    updateToggleButtonAria(theme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleButtonAria(newTheme);
        });
    }

    // --- Mobile Navigation ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = !this.classList.contains('active'); // Check state *before* toggling
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            this.setAttribute('aria-expanded', isExpanded);
            // Scroll Lock: Uncommented as per suggestion
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });

        const closeMobileMenu = () => {
            if (navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                 // Scroll Lock: Uncommented as per suggestion
                document.body.style.overflow = ''; // Restore scroll
            }
        };

        navLinks.querySelectorAll('a').forEach(item => {
            item.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('click', (event) => {
            const isClickInsideNav = navLinks.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            if (!isClickInsideNav && !isClickOnToggle) {
                closeMobileMenu();
            }
        });
         document.addEventListener('keydown', (event) => {
             if (event.key === 'Escape') {
                 closeMobileMenu();
             }
         });
    }

    // --- Navigation Highlight (Using data attributes) ---
    try {
        const currentPageType = document.documentElement.getAttribute('data-page'); // e.g., 'blog-post'
        const navLinksAll = document.querySelectorAll('.nav-links a[data-nav]'); // Select only links with data-nav

        navLinksAll.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        let activeLinkFound = false;

        // Specific logic for blog post page type
        if (currentPageType === 'blog-post' || currentPageType === 'blog-index') { // Check for post or index page
            const blogsLink = document.querySelector('.nav-links a[data-nav="blogs"]');
            if (blogsLink) {
                blogsLink.classList.add('active');
                blogsLink.setAttribute('aria-current', 'page');
                activeLinkFound = true;
            }
        }
        // Add more 'else if' blocks here for other page types (about, contact) if needed
        // else if (currentPageType === 'about') { ... }

        // Fallback: Highlight based on exact URL match if no type match or for specific pages
        if (!activeLinkFound) {
            const currentLocation = window.location.href;
            navLinksAll.forEach(link => {
                if (link.href === currentLocation) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });
        }

        // Final fallback for root/home page if still nothing is active
        if (!document.querySelector('.nav-links a.active') && (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html'))) {
             const homeLink = document.querySelector('.nav-links a[data-nav="home"]');
             if (homeLink) {
                homeLink.classList.add('active');
                homeLink.setAttribute('aria-current', 'page');
             }
        }

    } catch (e) {
        console.error("Error setting active navigation link:", e);
    }


    // --- Scroll to Top Button ---
    const scrollToTopButton = document.querySelector('.scroll-to-top');

    if (scrollToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopButton.classList.add('visible');
            } else {
                scrollToTopButton.classList.remove('visible');
            }
        });

        scrollToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Intersection Observer for Animations (Using Class) ---
    // Select elements marked for animation
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add the 'is-visible' class to trigger the CSS transition
                    entry.target.classList.add('is-visible');
                    observerInstance.unobserve(entry.target); // Stop observing once visible
                }
            });
        }, {
            threshold: 0.1, // Trigger when 10% is visible
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers without IntersectionObserver or if no elements found
        animatedElements.forEach(element => {
            // If no JS observer, remove the initial hidden state (optional, depends on desired fallback)
            // Or simply add the visible class directly if you want animations to just appear
            element.classList.add('is-visible');
        });
    }

    // --- Update Footer Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Code Block Language Class ---
    document.querySelectorAll('.blog-post-content pre code').forEach(block => {
        if (!block.className.includes('language-')) {
            block.classList.add('language-plaintext');
        }
    });

}); // End DOMContentLoaded