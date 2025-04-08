document.addEventListener('DOMContentLoaded', function() {

    // --- Theme Management ---
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    let theme = 'dark'; // Default specified in HTML
    if (currentTheme) {
        theme = currentTheme;
    } else if (prefersDarkScheme.matches) {
        theme = 'dark';
    } else {
        theme = 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const updateToggleButtonAria = (currentTheme) => {
        const label = currentTheme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode';
        if(themeToggle) {
           themeToggle.setAttribute('aria-label', label);
        }
    };
    updateToggleButtonAria(theme); // Set initial label

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleButtonAria(newTheme); // Update label on change
        });
    }

    // --- Mobile Navigation ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            const isExpanded = this.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
            // Optional: Toggle body scroll lock
            // document.body.style.overflow = isExpanded ? 'hidden' : 'auto';
        });

        const closeMobileMenu = () => {
            if (navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                // document.body.style.overflow = 'auto'; // Restore scroll
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
         // Close on escape key press
         document.addEventListener('keydown', (event) => {
             if (event.key === 'Escape') {
                 closeMobileMenu();
             }
         });
    }

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            // Check if it's more than just "#" and it's linking to an ID on the current page
            if (targetId.length > 1 && targetId.startsWith('#')) {
                const targetElement = document.getElementById(targetId.substring(1)); // Use getElementById for better performance/specificity
                if (targetElement) {
                    e.preventDefault();
                    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 70; // Adjusted default
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    closeMobileMenu(); // Close menu after clicking anchor link
                }
            }
            // If it's just "#" or linking to the same page root, handle active state setting if needed, but don't scroll.
            else if (targetId === '#') {
                 e.preventDefault(); // Prevent page jump for lone "#"
                 window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top smoothly for "#" link
                 closeMobileMenu();
            }
            // Let other links (external or different pages) behave normally
        });
    });


    // --- Newsletter Form Submission ---
    const newsletterForm = document.querySelector('.newsletter-form');
    const newsletterMessage = document.getElementById('newsletter-message');

    if (newsletterForm && newsletterMessage) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const submitButton = this.querySelector('button[type="submit"]');

            // Clear previous messages and ensure visibility is reset
            newsletterMessage.textContent = '';
            newsletterMessage.className = 'newsletter-message'; // Reset classes
            newsletterMessage.style.opacity = '1'; // Ensure opacity is reset if previously faded out
            newsletterMessage.style.display = 'none'; // Hide initially

            if (!emailInput || !emailInput.checkValidity()) {
                newsletterMessage.textContent = 'Please enter a valid email address.';
                newsletterMessage.classList.add('error');
                newsletterMessage.style.display = 'block'; // Show error message
                emailInput?.focus();
                return;
            }

            // Simulate submission
            console.log('Subscribing with email:', emailInput.value);
            submitButton.textContent = 'Subscribing...';
            submitButton.disabled = true;
            emailInput.disabled = true;

            setTimeout(() => { // Simulate network delay
                // Show success message
                newsletterMessage.textContent = 'Thanks for subscribing! Check your inbox.';
                newsletterMessage.classList.add('success');
                newsletterMessage.style.display = 'block'; // Show success message
                newsletterMessage.style.opacity = '1'; // Ensure it's fully visible
                emailInput.value = ''; // Clear input

                // Re-enable form
                submitButton.textContent = 'Subscribe';
                submitButton.disabled = false;
                emailInput.disabled = false;

                // Optionally hide message after a few seconds
                setTimeout(() => {
                     newsletterMessage.style.opacity = '0';
                     // Use transition end event for cleaner removal if needed
                     setTimeout(() => {
                         // Double check it's still the success message before clearing and hiding
                         if (newsletterMessage.textContent.includes('Thanks')) {
                            newsletterMessage.textContent = '';
                            newsletterMessage.className = 'newsletter-message'; // Reset class
                            newsletterMessage.style.display = 'none'; // Hide completely
                         }
                         // If an error occurred in the meantime, leave the error message visible.
                     }, 500); // Wait for fade out transition (matches CSS transition duration)
                }, 5000); // Start hiding after 5 seconds

            }, 1500);
        });
    }

    // --- Intersection Observer for Animations ---
    const animatedElements = document.querySelectorAll('.post-card, .newsletter');
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observerInstance.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(element => { observer.observe(element); });
    } else {
        // Fallback for browsers without IntersectionObserver
        animatedElements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    // --- Add Active Class & aria-current to Current Page Navigation Link ---
    try {
        // Normalize current location: remove trailing slash, hash, and query params for comparison
        const cleanCurrentLocation = window.location.origin + window.location.pathname.replace(/\/$/, ''); // Remove trailing slash
        const navLinksAll = document.querySelectorAll('.nav-links a');

        let isMatchFound = false;

        navLinksAll.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current'); // Remove existing aria-current

            // Normalize link href: get absolute URL, remove trailing slash, hash, and query params
            const linkUrl = new URL(link.href, window.location.origin);
            const cleanLinkHref = linkUrl.origin + linkUrl.pathname.replace(/\/$/, ''); // Remove trailing slash

             // Special handling for root/index links
             const isLinkHome = link.pathname === '/' || link.pathname.endsWith('/index.html') || link.getAttribute('href') === '#';
             const isCurrentPageHome = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');

            // Check 1: Exact match after normalization
            if (cleanLinkHref === cleanCurrentLocation) {
                 // Check if it's the home link represented by '#' when actually at the root
                 if (link.getAttribute('href') === '#' && isCurrentPageHome) {
                     link.classList.add('active');
                     link.setAttribute('aria-current', 'page');
                     isMatchFound = true;
                 } else if (link.getAttribute('href') !== '#') { // Avoid activating '#' if not on home page
                     link.classList.add('active');
                     link.setAttribute('aria-current', 'page');
                     isMatchFound = true;
                 }
            }
            // Check 2: Activate home link variations ('#', '/', 'index.html') only if on the actual home page and no other match was found yet
            else if (!isMatchFound && isLinkHome && isCurrentPageHome) {
                 link.classList.add('active');
                 link.setAttribute('aria-current', 'page');
                 isMatchFound = true; // Set flag here as well
            }
        });

        // Fallback: If still no match (e.g., complex URL structure), default to highlighting the root link if on the home page.
         if (!isMatchFound && (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html'))) {
             navLinksAll.forEach(link => {
                 const linkPath = link.getAttribute('href');
                 if (linkPath === '#' || linkPath === '/' || link.pathname === '/' || link.pathname.endsWith('index.html')) {
                     link.classList.add('active');
                     link.setAttribute('aria-current', 'page');
                 }
             });
         }

    } catch (e) {
        console.error("Error setting active navigation link:", e);
    }

    // --- Update Footer Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 404 Handling Note ---
    // Proper 404 handling for non-existent routes (e.g., /non-page) on static sites
    // is typically configured on the web server (e.g., Apache .htaccess, Nginx config,
    // Netlify/Vercel settings) to serve the 404.html file.
    // JavaScript on the client-side cannot reliably intercept all invalid URL requests.

}); // End DOMContentLoaded