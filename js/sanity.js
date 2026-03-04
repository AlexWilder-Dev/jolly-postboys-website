/* ============================================================
   THE JOLLY POSTBOYS — Sanity CMS integration
   Fetches live content from Sanity and renders into the page.
   ============================================================ */

(function () {
    var PROJECT_ID  = 'hz632ff6';
    var DATASET     = 'production';
    var API_VERSION = '2024-01-01';
    var CDN         = 'https://' + PROJECT_ID + '.apicdn.sanity.io';

    // Cache so navigating back doesn't re-fetch
    var _cache = {};

    function query(groq) {
        if (_cache[groq]) return Promise.resolve(_cache[groq]);
        var url = CDN + '/v' + API_VERSION + '/data/query/' + DATASET +
                  '?query=' + encodeURIComponent(groq);
        return fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (d) { _cache[groq] = d.result; return d.result; });
    }

    // ── Helpers ───────────────────────────────────────────────────

    function esc(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatPrice(item) {
        if (item.priceLabel) return esc(item.priceLabel);
        if (item.price != null) {
            var p = parseFloat(item.price);
            return '&pound;' + (p % 1 === 0 ? p : p.toFixed(2));
        }
        return '';
    }

    function dietaryBadge(tags) {
        if (!tags || !tags.length) return '';
        return ' <span class="menu-row-dietary">' + tags.join(' / ') + '</span>';
    }

    // ── Menu ──────────────────────────────────────────────────────

    var MENU_GROQ = '*[_type == "menuCategory"] | order(order asc) {' +
        '_id, title, "slug": slug.current,' +
        '"items": *[_type == "menuItem" && references(^._id) && available == true] | order(order asc) {' +
            'name, price, priceLabel, description, dietaryTags, featured' +
        '}' +
    '}';

    var CATEGORY_NOTES = {
        starters: { deal: 'Wed 4&ndash;9pm &bull; Any 3 for &pound;18' },
        burgers:  { deal: 'Tue 4&ndash;9pm &bull; 2 for &pound;20', note: 'All served with fries &amp; slaw &bull; Tuesday deal excludes Burger of the Month' },
        sunday:   { deal: 'Sun 12&ndash;6pm &bull; Booking recommended', note: 'All roasts include roast potatoes, Yorkshire pudding, seasonal veg &amp; gravy &bull; <a href="tel:01865777767">01865 777767</a> to book' },
        drinks:   { deal: 'Thu 4&ndash;11pm &bull; &pound;4 Pint &bull; &pound;5 Wine', note: 'Thirst-Day: &pound;4 house lager or cask pint &bull; &pound;5 house wine 175ml' },
    };

    var THREE_COL = { sides: true, drinks: true };

    window.loadMenu = function () {
        var container = document.getElementById('menu-chapters');
        if (!container) return;
        container.innerHTML = '<p class="menu-loading">Loading menu&hellip;</p>';

        query(MENU_GROQ).then(function (categories) {
            if (!categories || !categories.length) {
                container.innerHTML = '<p class="menu-loading">Menu coming soon.</p>';
                return;
            }

            container.innerHTML = categories.map(function (cat) {
                var slug  = cat.slug || '';
                var extra = CATEGORY_NOTES[slug] || {};
                var items = cat.items || [];
                var listClass = 'menu-list' + (THREE_COL[slug] ? ' menu-list--3col' : '');

                var rowsHtml = items.map(function (item) {
                    var name  = item.featured ? '&#9733; ' + esc(item.name) : esc(item.name);
                    var desc  = item.description
                        ? '<p class="menu-row-desc">' + esc(item.description) + dietaryBadge(item.dietaryTags) + '</p>'
                        : '';
                    return '<li class="menu-row' + (item.featured ? ' menu-row--featured' : '') + '">' +
                        '<div class="menu-row-top">' +
                        '<span class="menu-row-name">' + name + '</span>' +
                        '<span class="menu-row-price">' + formatPrice(item) + '</span>' +
                        '</div>' + desc + '</li>';
                }).join('');

                return '<section class="menu-chapter fade-in" id="m-' + esc(slug) + '">' +
                    '<div class="menu-chapter-header">' +
                    '<h2 class="menu-chapter-title">' + esc(cat.title) + '</h2>' +
                    (extra.deal ? '<span class="menu-chapter-deal">' + extra.deal + '</span>' : '') +
                    '</div>' +
                    (extra.note ? '<p class="menu-chapter-note">' + extra.note + '</p>' : '') +
                    '<ul class="' + listClass + '">' + rowsHtml + '</ul>' +
                    '</section>';
            }).join('');

            // Re-apply scroll observer to newly created .fade-in elements
            if (window.observeAll) window.observeAll();
        }).catch(function () {
            container.innerHTML = '<p class="menu-loading">Unable to load menu right now &mdash; please try again.</p>';
        });
    };

    // ── Home specials ──────────────────────────────────────────────

    var SPECIALS_GROQ = '*[_type == "special" && active == true] | order(order asc) { day, nickname, deal, note, timeWindow }';

    window.loadHomeSpecials = function () {
        var grid = document.getElementById('home-specials-grid');
        if (!grid) return;

        query(SPECIALS_GROQ).then(function (specials) {
            if (!specials || !specials.length) return;
            grid.innerHTML = specials.map(function (s) {
                return '<div class="special-card">' +
                    '<div class="special-card-header">' +
                    '<div class="special-card-day">' + esc(s.nickname || s.day) + '</div>' +
                    '</div>' +
                    '<div class="special-card-body">' +
                    '<div class="special-card-deal">' + esc(s.deal) + '</div>' +
                    (s.note ? '<div class="special-card-note">(' + esc(s.note) + ')</div>' : '') +
                    '<div class="special-card-time">Every ' + esc(s.day) + ' &bull; ' + esc(s.timeWindow || '') + '</div>' +
                    '</div></div>';
            }).join('');
        });
    };

    // ── Events page ────────────────────────────────────────────────

    var EVENTS_GROQ = '*[_type == "event" && active == true] | order(_createdAt asc) { _id, title, description, recurring, recurringDay, recurringFrequency, time, date }';

    function capFirst(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

    window.loadEvents = function () {
        var specialsGrid = document.getElementById('events-specials-grid');
        var regularGrid  = document.getElementById('events-regular-grid');
        if (!specialsGrid && !regularGrid) return;

        if (specialsGrid) {
            query(SPECIALS_GROQ).then(function (specials) {
                if (!specials || !specials.length) return;
                specialsGrid.innerHTML = specials.map(function (s) {
                    return '<div class="event-card event-card--regular">' +
                        '<div class="event-day">' + esc(s.day) + '</div>' +
                        '<div class="event-body">' +
                        '<span class="event-badge">' + esc(s.nickname || s.day) + '</span>' +
                        '<h3>' + esc(s.deal) + '</h3>' +
                        '<div class="event-time">Every ' + esc(s.day) + ' &bull; ' + esc(s.timeWindow || '') + '</div>' +
                        (s.note ? '<p>' + esc(s.note) + '</p>' : '') +
                        '</div></div>';
                }).join('');
            });
        }

        if (regularGrid) {
            query(EVENTS_GROQ).then(function (events) {
                if (!events || !events.length) return;
                regularGrid.innerHTML = events.map(function (e) {
                    var when = e.recurring
                        ? capFirst(e.recurringFrequency || '') + (e.recurringDay ? ' ' + capFirst(e.recurringDay) : '') + (e.time ? ' &bull; ' + esc(e.time) : '')
                        : esc(e.time || e.date || '');
                    return '<div class="event-card">' +
                        '<div class="event-body" style="padding:1.5rem;">' +
                        '<h3>' + esc(e.title) + '</h3>' +
                        '<div class="event-time">' + when + '</div>' +
                        (e.description ? '<p>' + esc(e.description) + '</p>' : '') +
                        '</div></div>';
                }).join('');
            });
        }
    };

})();
