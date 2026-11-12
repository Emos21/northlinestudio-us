  // Scroll-triggered reveals
  (function(){
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var items = document.querySelectorAll('.reveal');
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function(el){ el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function(el){ io.observe(el); });
  })();

  // Count-up for the stats band
  (function(){
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nums = document.querySelectorAll('[data-count]');
    function setFinal(el){
      var d = parseInt(el.dataset.decimals || 0, 10);
      el.textContent = parseFloat(el.dataset.count).toFixed(d);
    }
    if (reduced || !('IntersectionObserver' in window)) {
      nums.forEach(setFinal);
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var target = parseFloat(el.dataset.count);
        var decimals = parseInt(el.dataset.decimals || 0, 10);
        var duration = 1400;
        var start = null;
        function tick(ts){
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    nums.forEach(function(el){ io.observe(el); });
  })();

  // Close the mobile menu after choosing a link
  document.querySelectorAll('#navLinks a').forEach(function(a){
    a.addEventListener('click', function(){
      document.getElementById('navLinks').classList.remove('open');
    });
  });

  // PWA: register the service worker (requires HTTPS or localhost)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('sw.js').catch(function(){});
    });
  }

/* ---------- Smooth FAQ accordion (exclusive: one open at a time) ----------
   Native <details> snaps open/closed. We animate height with the Web Animations
   API for a smooth expand/collapse, AND opening one card closes any other open
   card (the professional "exclusive accordion" pattern). Respects reduced-motion. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.16,1,.3,1)';
  function pad(el) {
    var cs = getComputedStyle(el);
    return parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  }
  var controllers = [];
  Array.prototype.forEach.call(document.querySelectorAll('.faq details'), function (el) {
    var summary = el.querySelector('summary');
    if (!summary) return;
    var anim = null, closing = false, expanding = false;

    controllers.push({ el: el, closeIfOpen: closeIfOpen });

    summary.addEventListener('click', function (e) {
      if (reduce) {
        // no animation, but still enforce one-open-at-a-time
        if (!el.open) closeOthers();
        return; // let the native toggle happen
      }
      e.preventDefault();
      el.style.overflow = 'hidden';
      if (closing || !el.open) { closeOthers(); openDetails(); }
      else if (expanding || el.open) shrink();
    });

    function closeOthers() {
      controllers.forEach(function (c) { if (c.el !== el) c.closeIfOpen(); });
    }
    function closeIfOpen() {
      if (el.open && !closing) { el.style.overflow = 'hidden'; shrink(); }
    }
    function shrink() {
      closing = true;
      var start = el.offsetHeight + 'px';
      var end = (summary.offsetHeight + pad(el)) + 'px';
      if (anim) anim.cancel();
      anim = el.animate({ height: [start, end] }, { duration: 300, easing: EASE });
      anim.onfinish = function () { finish(false); };
      anim.oncancel = function () { closing = false; };
    }
    function openDetails() {
      el.style.height = el.offsetHeight + 'px';
      el.open = true;
      window.requestAnimationFrame(expand);
    }
    function expand() {
      expanding = true;
      var start = el.offsetHeight + 'px';
      var end = el.scrollHeight + 'px';
      if (anim) anim.cancel();
      anim = el.animate({ height: [start, end] }, { duration: 320, easing: EASE });
      anim.onfinish = function () { finish(true); };
      anim.oncancel = function () { expanding = false; };
    }
    function finish(isOpen) {
      el.open = isOpen;
      anim = null; closing = false; expanding = false;
      el.style.height = el.style.overflow = '';
    }
  });
})();
