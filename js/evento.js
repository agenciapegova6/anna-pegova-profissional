/* LP Evento HOF — formulário de inscrição */
(function () {
  var f = document.getElementById('inscricao');
  if (!f) return;
  var uf = f.elements.estado, cidadeBox = f.querySelector('.ev-cidade'), cidade = f.elements.cidade;
  var tel = f.elements.whatsapp, erro = f.querySelector('.ev-erro'), btn = f.querySelector('button[type=submit]');

  var CAPITAIS = {AC:'Rio Branco',AL:'Maceió',AP:'Macapá',AM:'Manaus',BA:'Salvador',CE:'Fortaleza',DF:'Brasília',ES:'Vitória',GO:'Goiânia',MA:'São Luís',MT:'Cuiabá',MS:'Campo Grande',MG:'Belo Horizonte',PA:'Belém',PB:'João Pessoa',PR:'Curitiba',PE:'Recife',PI:'Teresina',RJ:'Rio de Janeiro',RN:'Natal',RS:'Porto Alegre',RO:'Porto Velho',RR:'Boa Vista',SC:'Florianópolis',SE:'Aracaju',TO:'Palmas'};
  var opcoesSP = cidade.innerHTML;
  uf.addEventListener('change', function () {
    var v = uf.value;
    if (!v) { cidadeBox.hidden = true; cidade.required = false; cidade.value = ''; return; }
    if (v === 'SP') {
      cidade.innerHTML = opcoesSP; cidade.value = '';
    } else {
      cidade.innerHTML = '';
      var o = document.createElement('option'); o.textContent = CAPITAIS[v]; o.value = CAPITAIS[v];
      cidade.appendChild(o); cidade.value = CAPITAIS[v];
    }
    cidadeBox.hidden = false;
    cidade.required = true;
  });

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
    if (f.elements.nome.value.trim().length < 3) return falha('Informe seu nome completo.');
    if (tel.value.replace(/\D/g, '').length < 10) return falha('Informe um WhatsApp válido com DDD.');
    var em = f.elements.email.value.trim();
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return falha('Confira o e-mail informado.');
    if (!uf.value) return falha('Selecione seu estado.');
    if (!cidade.value) return falha('Selecione sua cidade.');
    if (!f.elements.aceite.checked) return falha('Para receber o convite, marque o aceite de comunicações.');
    if (!window.EVENTO_ENDPOINT) return falha('Inscrições abrem em breve.');

    var dados = new URLSearchParams(new FormData(f));
    dados.set('origem', location.href);
    btn.disabled = true; btn.textContent = 'Enviando…';
    fetch(window.EVENTO_ENDPOINT, { method: 'POST', mode: 'no-cors', body: dados })
      .then(function () {
        f.hidden = true;
        f.parentElement.querySelector('.ev-ok').hidden = false;
        if (window.gtag) gtag('event', 'inscricao_evento_hof', { estado: uf.value, cidade: cidade.value || '' });
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'Quero meu convite';
        falha('Não foi possível enviar agora. Confira sua conexão e tente de novo.');
      });
  });
})();
