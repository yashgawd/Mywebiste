document.addEventListener('DOMContentLoaded', function() {

    // --- Theme Management ---
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Determine initial theme: localStorage > prefers-color-scheme > default ('dark')
    let theme = 'dark'; // Default theme
    if (currentTheme) {
        theme = currentTheme;
    } else {
        theme = prefersDarkScheme.matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme); // Store the determined theme

    // Function to update the ARIA label of the theme toggle button
    const updateToggleButtonAria = (currentTheme) => {
        const label = currentTheme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode';
        if(themeToggle) {
           themeToggle.setAttribute('aria-label', label);
        }
    };
    updateToggleButtonAria(theme); // Set initial ARIA label

    // Add click listener for theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleButtonAria(newTheme); // Update ARIA label on change
        });
    }

    // --- Mobile Navigation ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links'); // Assumes class 'nav-links' for the UL

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = !this.classList.contains('active'); // Check state *before* toggling class
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            this.setAttribute('aria-expanded', isExpanded.toString()); // Set aria-expanded

            // Toggle body scroll lock
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });

        // Function to close the mobile menu
        const closeMobileMenu = () => {
            if (navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = ''; // Restore scroll
            }
        };

        // Close menu when a navigation link is clicked
        navLinks.querySelectorAll('a').forEach(item => {
            item.addEventListener('click', closeMobileMenu);
        });

        // Close menu if clicking outside the nav and toggle button
        document.addEventListener('click', (event) => {
            const isClickInsideNav = navLinks.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        });

         // Close menu on 'Escape' key press
         document.addEventListener('keydown', (event) => {
             if (event.key === 'Escape') {
                 closeMobileMenu();
             }
         });
    } else {
        // console.warn("Mobile navigation elements (.menu-toggle or .nav-links) not found.");
    }

    // --- Navigation Highlight (Using data attributes) ---
    try {
        const currentPageType = document.documentElement.getAttribute('data-page'); // e.g., 'blog-post', 'home', 'about'
        const navLinksAll = document.querySelectorAll('.nav-links a[data-nav]'); // Select only links with data-nav

        // Reset all nav links first
        navLinksAll.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        let activeLinkFound = false;

        // 1. Try highlighting based on data-page attribute
        if (currentPageType) {
            let navIdentifier = currentPageType;
            // Special case: map 'blog-post' or 'blog-index' page types to the 'blogs' nav link
            if (currentPageType === 'blog-post' || currentPageType === 'blog-index') {
                navIdentifier = 'blogs';
            }
            // Find the link whose data-nav matches the (potentially mapped) page type
            const matchingLink = document.querySelector(`.nav-links a[data-nav="${navIdentifier}"]`);
            if (matchingLink) {
                matchingLink.classList.add('active');
                matchingLink.setAttribute('aria-current', 'page');
                activeLinkFound = true;
            }
        }

        // 2. Fallback: If no match via data-page, try highlighting based on exact URL match
        // This is useful for pages that might not have a specific data-page type defined
        // or if the data-page logic didn't catch it.
        if (!activeLinkFound) {
            const currentLocation = window.location.pathname; // Use pathname for more reliable matching
            navLinksAll.forEach(link => {
                 // Normalize link.pathname in case it includes index.html
                let linkPathname = link.pathname;
                 if (linkPathname.endsWith('/index.html')) {
                    linkPathname = linkPathname.substring(0, linkPathname.length - 'index.html'.length);
                 }
                // Normalize currentLocation if it ends with /index.html
                let currentPath = currentLocation;
                 if (currentPath.endsWith('/index.html')) {
                    currentPath = currentPath.substring(0, currentPath.length - 'index.html'.length);
                 }

                if (linkPathname === currentPath) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                    activeLinkFound = true; // Found a match, stop further fallbacks
                }
            });
        }

        // 3. Final Fallback for Root/Home Page: If still nothing is active and we are at the root
         if (!activeLinkFound && (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html'))) {
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
            // Show button when scrolled down 300px
            if (window.scrollY > 300) {
                scrollToTopButton.classList.add('visible');
            } else {
                scrollToTopButton.classList.remove('visible');
            }
        });

        // Add click listener to scroll smoothly to top
        scrollToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Intersection Observer for Animations (Using Class) ---
    // Select all elements that should be animated when scrolled into view
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    // Check if IntersectionObserver is supported and elements exist
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                // If the element is intersecting (visible)
                if (entry.isIntersecting) {
                    // Add the 'is-visible' class to trigger the CSS transition/animation
                    entry.target.classList.add('is-visible');
                    // Stop observing the element once it has become visible
                    observerInstance.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1, // Trigger when at least 10% of the element is visible
            // rootMargin: '0px 0px -50px 0px' // Optional: trigger slightly before element enters viewport
        });

        // Observe each animated element
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers without IntersectionObserver or if no elements are found
        // Simply make all elements visible immediately if observer is not supported
        animatedElements.forEach(element => {
            element.classList.add('is-visible');
        });
        // if (animatedElements.length > 0) {
        //     console.warn("IntersectionObserver not supported. Animations will show immediately.");
        // }
    }

    // --- Update Footer Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Code Block Language Class (Optional Enhancement) ---
    // Add a default language class if none exists for syntax highlighting libraries
    // document.querySelectorAll('.blog-post-content pre code').forEach(block => {
    //     // Check if a 'language-*' class already exists
    //     const hasLanguageClass = Array.from(block.classList).some(cls => cls.startsWith('language-'));
    //     if (!hasLanguageClass) {
    //         block.classList.add('language-plaintext'); // Add a default class
    //     }
    // });

}); // End DOMContentLoaded