/* Anna Pegova Profissional — abertura com logo + animações */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Abertura: logo no centro sobe e encaixa no topo ---------- */
  function intro() {
    var el = document.querySelector('.intro');
    var target = document.querySelector('.nav .brand__logo');
    if (!el || !target) { doc.classList.add('is-ready'); return; }
    var seen = false;
    try { seen = sessionStorage.getItem('ap-intro') === '1'; } catch (e) {}
    if (seen || reduce) { el.remove(); doc.classList.add('is-ready'); return; }
    try { sessionStorage.setItem('ap-intro', '1'); } catch (e) {}

    var logo = el.querySelector('.intro__logo');
    doc.classList.add('is-intro');
    window.scrollTo(0, 0);

    setTimeout(function () {
      var a = logo.getBoundingClientRect();
      var b = target.getBoundingClientRect();
      var s = b.width / a.width;
      var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
      var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
      logo.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')';
      el.classList.add('is-leaving');
    }, 1500);

    setTimeout(function () {
      doc.classList.remove('is-intro');
      doc.classList.add('is-ready');
    }, 2450);
    setTimeout(function () { el.remove(); }, 3200);
  }

  /* ---------- Revelar ao rolar ---------- */
  function reveal() {
    var sel = '.section__head, .card-prod, .card-img, .box, .why__img, .why__body, .banner, .duo > *, .mech > *, .dl, .cta, .p-selos span, .footer .wrap';
    var items = document.querySelectorAll(sel);
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    items.forEach(function (n) {
      n.classList.add('rv');
      var p = n.parentElement, i = Array.prototype.indexOf.call(p.children, n);
      if (p.children.length > 1) n.style.transitionDelay = Math.min(i, 6) * 90 + 'ms';
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Nav com sombra ao rolar + parallax suave ---------- */
  function scrollFx() {
    var nav = document.querySelector('.nav');
    var par = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll('.banner__img, .cta__tex'));
    var ticking = false;
    function run() {
      ticking = false;
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8);
      var vh = window.innerHeight;
      par.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.setProperty('--py', (p * -36).toFixed(1) + 'px');
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(run); }
    }, { passive: true });
    run();
  }

  /* ---------- Imagens com fade ao carregar ---------- */
  function imgFade() {
    document.querySelectorAll('main img').forEach(function (img) {
      if (img.complete && img.naturalWidth) return;
      img.classList.add('img-wait');
      img.addEventListener('load', function () { img.classList.remove('img-wait'); }, { once: true });
      img.addEventListener('error', function () { img.classList.remove('img-wait'); }, { once: true });
    });
  }

  function start() { imgFade(); intro(); reveal(); scrollFx(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
