/* Replaces the two server-side features of the old PHP site.
   1. ?src=G4 attribution: tags every WhatsApp first message with "(G4)".
      Letters, digits and dashes only, max 12 chars. No cookie is set.
   2. Enquiry form: builds a WhatsApp message from the fields and opens it. */
(function () {
  'use strict';

  var WA_NUMBER = '254743875608';

  function cleanSrc(raw) {
    return String(raw || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 12).toUpperCase();
  }

  function currentSrc() {
    try { return cleanSrc(new URLSearchParams(window.location.search).get('src')); }
    catch (e) { return ''; }
  }

  function tagWhatsAppLinks(src) {
    if (!src) return;
    var links = document.querySelectorAll('a[href^="https://wa.me/"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var url = a.getAttribute('href');
      var at = url.indexOf('?text=');
      if (at === -1) continue;
      var text;
      try { text = decodeURIComponent(url.slice(at + 6)); } catch (e) { continue; }
      a.setAttribute('href', url.slice(0, at) + '?text=' + encodeURIComponent(text + ' (' + src + ')'));
    }
  }

  function field(form, name) {
    var el = form.elements[name];
    return el ? String(el.value || '').trim() : '';
  }

  function wireEnquiryForm(src) {
    var form = document.getElementById('enquiry-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (field(form, 'company_website') !== '') return; // honeypot: do nothing
      var name = field(form, 'name');
      var email = field(form, 'email');
      var message = field(form, 'message');
      if (!name || !email || !message) return;
      var lines = [
        'Hi Northline Studio, I would like to make an enquiry.',
        '',
        'Name: ' + name,
        'Email: ' + email,
        'Service: ' + (field(form, 'service') || 'not specified'),
        'Timing: ' + (field(form, 'timing') || 'not specified'),
        '',
        message
      ];
      if (src) lines.push('', '(' + src + ')');
      var url = 'https://wa.me/' + (form.getAttribute('data-whatsapp') || WA_NUMBER) +
        '?text=' + encodeURIComponent(lines.join('\n'));
      var win = window.open(url, '_blank', 'noopener');
      if (!win) window.location.href = url;
    });
  }

  var src = currentSrc();
  tagWhatsAppLinks(src);
  wireEnquiryForm(src);
})();
