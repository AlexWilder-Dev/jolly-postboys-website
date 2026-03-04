/* ============================================================
   THE JOLLY POSTBOYS — main.js
   ============================================================ */

(function () {
    'use strict';

    var pages = {
        home:      document.getElementById('page-home'),
        events:    document.getElementById('page-events'),
        menu:      document.getElementById('page-menu'),
        contact:   document.getElementById('page-contact'),
        about:     document.getElementById('page-about'),
        allergens: document.getElementById('page-allergens'),
        privacy:   document.getElementById('page-privacy'),
    };

    var navLinks    = document.querySelectorAll('[data-page]');
    var navToggle   = document.getElementById('nav-toggle');
    var mainNav     = document.getElementById('main-nav');
    var announcer   = document.getElementById('page-announcer');

    var pageTitles = {
        home:      'The Jolly Postboys | Pub & Kitchen in Florence Park, Oxford',
        events:    'What\'s On | The Jolly Postboys',
        menu:      'Menu | The Jolly Postboys',
        contact:   'Contact | The Jolly Postboys',
        about:     'About Us | The Jolly Postboys',
        allergens: 'Allergen Information | The Jolly Postboys',
        privacy:   'Privacy Policy | The Jolly Postboys',
    };

    var pageNames = {
        home:      'Home',
        events:    'What\'s On',
        menu:      'Menu',
        contact:   'Contact',
        about:     'About Us',
        allergens: 'Allergen Information',
        privacy:   'Privacy Policy',
    };


    // ── Page routing ─────────────────────────────────────────────

    function showPage(pageId) {
        // Hide all pages
        Object.values(pages).forEach(function (p) {
            if (p) p.classList.remove('active');
        });

        // Show target page — CSS animation fires on .active
        var target = pages[pageId] || pages.home;
        target.classList.add('active');

        // Update nav — active class + aria-current
        navLinks.forEach(function (link) {
            var isCurrent = link.dataset.page === pageId;
            link.classList.toggle('active', isCurrent);
            if (isCurrent) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        // Update document title
        if (pageTitles[pageId]) {
            document.title = pageTitles[pageId];
        }

        // Announce page change to screen readers
        if (announcer && pageNames[pageId]) {
            announcer.textContent = '';
            // Small timeout so clearing + setting is picked up as a change
            setTimeout(function () {
                announcer.textContent = pageNames[pageId] + ' page loaded';
            }, 50);
        }

        // Scroll to top instantly (no janky scroll-during-transition)
        window.scrollTo(0, 0);

        // Close mobile nav
        closeMobileNav();

        // Let the IO pick up elements that are now in view
        // (a small delay lets the CSS page animation begin first)
        setTimeout(observeNewPage, 80);

        // Fetch live content from Sanity for relevant pages
        if (pageId === 'menu'   && window.loadMenu)         window.loadMenu();
        if (pageId === 'events' && window.loadEvents)       window.loadEvents();
        if (pageId === 'home'   && window.loadHomeSpecials) window.loadHomeSpecials();
    }

    document.addEventListener('click', function (e) {
        var link = e.target.closest('[data-page]');
        if (!link) return;
        e.preventDefault();
        var page = link.dataset.page;
        if (page && pages[page]) {
            showPage(page);
            history.pushState({ page: page }, '', '#' + page);
        }
    });

    window.addEventListener('popstate', function (e) {
        var page = (e.state && e.state.page) || getPageFromHash() || 'home';
        showPage(page);
    });

    function getPageFromHash() {
        var hash = window.location.hash.replace('#', '');
        return pages[hash] ? hash : null;
    }


    // ── Mobile nav ───────────────────────────────────────────────

    navToggle.addEventListener('click', function () {
        var isOpen = mainNav.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    function closeMobileNav() {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    }

    document.addEventListener('click', function (e) {
        if (
            mainNav.classList.contains('open') &&
            !mainNav.contains(e.target) &&
            !navToggle.contains(e.target)
        ) {
            closeMobileNav();
        }
    });


    // ── Scroll-reveal system ─────────────────────────────────────
    //
    // Grid containers get their children staggered together when the
    // first child enters view. Standalone elements animate individually.
    //
    // Using a single persistent observer means elements that are already
    // in view when a page loads will still get handled correctly.

    var STAGGER_PARENTS = [
        '.features-grid',
        '.specials-grid',
        '.dish-grid',
        '.events-grid',
        '.values-grid',
        '.about-sidebar',
    ].join(', ');

    var STAGGER_DELAY   = 100; // ms between each card in a group
    var RELEASE_DELAY   = 900; // ms after which will-change is freed

    var observer;

    function buildObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback: reveal everything immediately
            document.querySelectorAll('.fade-in').forEach(function (el) {
                el.classList.add('visible');
            });
            return;
        }

        observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var el    = entry.target;
                var group = el.closest(STAGGER_PARENTS);

                if (group && !group.dataset.animated) {
                    // ── Stagger the whole group at once ──────────────
                    group.dataset.animated = '1';

                    var children = Array.from(
                        group.querySelectorAll('.fade-in:not(.visible)')
                    );

                    children.forEach(function (child, i) {
                        // Unobserve immediately so IO doesn't re-fire for siblings
                        observer.unobserve(child);

                        child.style.animationDelay = (i * STAGGER_DELAY) + 'ms';

                        // Double rAF ensures the delay is applied before animation starts
                        requestAnimationFrame(function () {
                            requestAnimationFrame(function () {
                                child.classList.add('visible');

                                // Lock in final state and free GPU layer
                                var cleanup = (i * STAGGER_DELAY) + RELEASE_DELAY;
                                setTimeout(function () {
                                    child.style.opacity = '1';
                                    child.style.transform = 'none';
                                    child.style.animation = 'none';
                                    child.style.willChange = 'auto';
                                }, cleanup);
                            });
                        });
                    });

                } else if (!group) {
                    // ── Standalone element ────────────────────────────
                    observer.unobserve(el);

                    requestAnimationFrame(function () {
                        requestAnimationFrame(function () {
                            el.classList.add('visible');
                            setTimeout(function () {
                                el.style.opacity = '1';
                                el.style.transform = 'none';
                                el.style.animation = 'none';
                                el.style.willChange = 'auto';
                            }, RELEASE_DELAY);
                        });
                    });
                }
                // If `group` exists but is already animated, do nothing —
                // the siblings were handled together already.
            });
        }, {
            threshold:  0.12,
            rootMargin: '0px 0px -48px 0px',
        });
    }

    function setupFadeIns() {
        // Elements that get the scroll-reveal treatment.
        // Hero children are excluded — they use CSS keyframes via #page-home.active.
        var selectors = [
            '.feature-card',
            '.dish-card',
            '.special-card',
            '.event-card',
            '.value-item',
            '.about-stat-card',
        ];

        selectors.forEach(function (sel) {
            document.querySelectorAll(sel).forEach(function (el) {
                // Don't double-add the class
                if (!el.classList.contains('fade-in')) {
                    el.classList.add('fade-in');
                }
            });
        });
    }

    function observeAll() {
        if (!observer) return;
        document.querySelectorAll('.fade-in:not(.visible)').forEach(function (el) {
            observer.observe(el);
        });
    }

    function observeNewPage() {
        // Called after a page switch — picks up newly-visible elements
        observeAll();
    }


    // ── Menu jump links ─────────────────────────────────────────
    // Intercept anchor clicks so they scroll smoothly without
    // changing location.hash (which would confuse the SPA router).

    document.addEventListener('click', function (e) {
        var link = e.target.closest('.menu-jump-link');
        if (!link) return;
        e.preventDefault();
        var targetId = link.getAttribute('href').replace('#', '');
        var target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });


    // ── Footer year ──────────────────────────────────────────────

    var yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();


    // ── Chalkboard typewriter ─────────────────────────────────────

    function initChalkboard() {
        var board = document.querySelector('.chalkboard');
        if (!board) return;

        var panels = Array.prototype.slice.call(board.querySelectorAll('.chalk-text'));
        var started = false;

        // Show cursors now so they blink at empty position until typing starts
        panels.forEach(function (pre) {
            var cur = pre.querySelector('.chalk-cursor');
            if (cur) cur.style.display = 'inline';
        });

        var obs = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting && !started) {
                started = true;
                obs.disconnect();
                typeChalkPanels(panels);
            }
        }, { threshold: 0.25 });

        obs.observe(board);
    }

    function typeChalkPanels(panels) {
        var CHAR_MS   = 22;   // ms per character
        var NL_EXTRA  = 75;   // extra pause at newlines
        var PANEL_GAP = 380;  // ms between panel starts

        panels.forEach(function (pre, idx) {
            var lines;
            try { lines = JSON.parse(pre.dataset.lines || '[]'); } catch (e) { return; }
            var text = lines.join('\n');
            var typed  = pre.querySelector('.chalk-typed');
            var cursor = pre.querySelector('.chalk-cursor');
            var pos = 0;

            setTimeout(function tick() {
                if (pos >= text.length) {
                    setTimeout(function () { if (cursor) cursor.style.display = 'none'; }, 900);
                    return;
                }
                var ch = text[pos++];
                typed.textContent += ch;
                setTimeout(tick, ch === '\n' ? CHAR_MS + NL_EXTRA : CHAR_MS);
            }, idx * PANEL_GAP);
        });
    }


    // ── Init ─────────────────────────────────────────────────────

    function init() {
        var startPage = getPageFromHash() || 'home';

        // Set initial state without triggering the page enter animation
        // (we want the hero entrance to run, not the generic pageEnter)
        Object.values(pages).forEach(function (p) {
            if (p) p.classList.remove('active');
        });
        var startEl = pages[startPage] || pages.home;
        startEl.classList.add('active');

        navLinks.forEach(function (link) {
            var isCurrent = link.dataset.page === startPage;
            link.classList.toggle('active', isCurrent);
            if (isCurrent) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        history.replaceState({ page: startPage }, '', '#' + startPage);

        buildObserver();
        setupFadeIns();
        initChalkboard();

        // Small delay so the browser has painted before observing
        setTimeout(observeAll, 100);

        // Load Sanity content for the initial page
        if (startPage === 'menu'   && window.loadMenu)         window.loadMenu();
        if (startPage === 'events' && window.loadEvents)       window.loadEvents();
        if (startPage === 'home'   && window.loadHomeSpecials) window.loadHomeSpecials();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }


    // ── Cookie banner ─────────────────────────────────────────────

    (function () {
        var banner = document.getElementById('cookie-banner');
        var btn    = document.getElementById('cookie-accept');
        if (!banner || !btn) return;
        if (!localStorage.getItem('jpb_cookie_ok')) {
            banner.hidden = false;
        }
        btn.addEventListener('click', function () {
            localStorage.setItem('jpb_cookie_ok', '1');
            banner.hidden = true;
        });
    }());

})();
