/* Northline Studio: consent-gated Meta Pixel.
   The pixel NEVER loads until the visitor taps Accept (Kenya Data Protection
   Act: consent first, refusing as easy as accepting). Choice is remembered in
   localStorage. No pixel id configured = this file does nothing. */
(function () {
  'use strict';
  var PIXEL = window.NL_PIXEL_ID;
  if (!PIXEL) return;

  var KEY = 'nl_consent';
  var banner = document.getElementById('nlConsent');
  var loaded = false;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function remember(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  // Standard Meta Pixel loader, called ONLY after consent.
  function loadPixel() {
    if (loaded) return;
    loaded = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL);
    window.fbq('track', 'PageView');
    wireEvents();
  }

  function track(name) {
    if (loaded && window.fbq) window.fbq('track', name);
  }

  // Fire conversion events once the pixel is live.
  function wireEvents() {
    // Form success page shows an element tagged data-nl-event.
    var done = document.querySelector('[data-nl-event]');
    if (done) track(done.getAttribute('data-nl-event') || 'Lead');
  }

  // WhatsApp / booking taps = a Contact event (bind regardless, fires only if live).
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
    if (a) track('Contact');
  }, true);

  function show() { if (banner) { banner.hidden = false; requestAnimationFrame(function () { banner.classList.add('in'); }); } }
  function hide() { if (banner) { banner.classList.remove('in'); setTimeout(function () { banner.hidden = true; }, 300); } }

  function choose(v) {
    remember(v);
    hide();
    if (v === 'granted') loadPixel();
  }

  // Wire the banner buttons.
  if (banner) {
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-nl-consent]');
      if (b) choose(b.getAttribute('data-nl-consent'));
    });
  }
  // A "cookie settings" link anywhere reopens the choice.
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-nl-consent-open]');
    if (t) { e.preventDefault(); show(); }
  });

  // Decide what to do on load.
  var prior = stored();
  if (prior === 'granted') loadPixel();
  else if (prior !== 'denied') show();
})();
