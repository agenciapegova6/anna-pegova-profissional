/* LP Seja um franqueado — formulário de interesse */
(function () {
  var f = document.getElementById('franquia');
  if (!f) return;
  var tel = f.elements.whatsapp, erro = f.querySelector('.ev-erro'), btn = f.querySelector('button[type=submit]');

  tel.addEventListener('input', function () {
    var n = tel.value.replace(/\D/g, '').slice(0, 11), o = '';
    if (n.length > 0) o = '(' + n.slice(0, 2);
    if (n.length >= 3) o += ') ' + n.slice(2, n.length > 10 ? 7 : 6);
    if (n.length >= 7) o += '-' + n.slice(n.length > 10 ? 7 : 6);
    tel.value = o;
  });

  function falha(msg) { erro.textContent = msg; erro.hidden = false; }

  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    erro.hidden = true;
    var E = f.elements;
    if (E.nome.value.trim().length < 3) return falha('Informe seu nome completo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(E.email.value.trim())) return falha('Informe um e-mail válido.');
    if (tel.value.replace(/\D/g, '').length < 10) return falha('Informe um WhatsApp válido com DDD.');
    if (!E.estado.value) return falha('Selecione o estado.');
    if (E.cidade.value.trim().length < 2) return falha('Informe a cidade de interesse.');
    if (!E.experiencia.value || !E.investimento.value || !E.gestao.value) return falha('Responda às três perguntas sobre o seu perfil.');
    if (!window.FRANQUIA_ENDPOINT) return falha('Cadastro indisponível no momento. Fale com a gente pelo WhatsApp.');

    var dados = new URLSearchParams(new FormData(f));
    dados.set('tipo', 'franquia');
    dados.set('origem', location.href);
    btn.disabled = true; btn.textContent = 'Enviando…';
    fetch(window.FRANQUIA_ENDPOINT, { method: 'POST', mode: 'no-cors', body: dados })
      .then(function () {
        f.hidden = true;
        f.parentElement.querySelector('.fr-ok').hidden = false;
        if (window.gtag) gtag('event', 'cadastro_franquia', { estado: E.estado.value });
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'Quero receber a apresentação';
        falha('Não foi possível enviar agora. Confira sua conexão e tente de novo.');
      });
  });
})();
