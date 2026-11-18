/* Painel de inscritos — Evento HOF (lê dados agregados do Apps Script) */
(function () {
  var NOMES = {AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins'};
  var MAPA = {RR:[2,0],AP:[4,0],AM:[1,1],PA:[3,1],MA:[5,1],CE:[6,1],RN:[7,1],AC:[0,2],RO:[1,2],MT:[2,2],TO:[4,2],PI:[5,2],PE:[6,2],PB:[7,2],GO:[3,3],DF:[4,3],BA:[5,3],SE:[6,3],AL:[7,3],MS:[2,4],MG:[4,4],ES:[5,4],SP:[3,5],RJ:[4,5],PR:[3,6],SC:[3,7],RS:[3,8]};
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var pct = function (n, t) { return t ? Math.round(n * 100 / t) + '%' : '0%'; };

  var lock = $('lock'), senha = $('senha');
  function guarda(k) { try { k ? sessionStorage.setItem('ap-painel-k', k) : sessionStorage.removeItem('ap-painel-k'); } catch (e) {} }
  function pedeSenha(errou) {
    $('dados').hidden = true; $('planilha').hidden = true; $('pdf').hidden = true;
    $('fonte').textContent = ''; lock.hidden = false; $('lockErr').hidden = !errou; senha.value = ''; senha.focus();
  }
  function carrega(k) {
    if (!window.EVENTO_ENDPOINT) { $('fonte').textContent = 'Painel ainda não conectado à planilha.'; return; }
    if (!k) return pedeSenha(false);
    $('fonte').textContent = 'Carregando…';
    fetch(window.EVENTO_ENDPOINT + '?k=' + encodeURIComponent(k))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.erro) { guarda(''); return pedeSenha(true); }
        guarda(k); lock.hidden = true; $('dados').hidden = false; $('pdf').hidden = false; desenha(d);
      })
      .catch(function () { $('fonte').textContent = 'Não foi possível carregar os dados agora.'; });
  }
  lock.addEventListener('submit', function (ev) { ev.preventDefault(); carrega(senha.value.trim()); });
  var k0 = '';
  try { k0 = new URLSearchParams(location.hash.slice(1)).get('k') || sessionStorage.getItem('ap-painel-k') || ''; } catch (e) {}
  if (location.hash) history.replaceState(null, '', location.pathname);
  carrega(k0);

  function desenha(d) {
    var T = d.total, est = Object.keys(d.porEstado).filter(function (k) { return NOMES[k]; })
      .map(function (k) { return [k, d.porEstado[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
    var cid = Object.keys(d.porCidadeSP).map(function (k) { return [k, d.porCidadeSP[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
    var lider = est[0], cl = cid[0], sp = d.porEstado.SP || 0;
    $('fonte').textContent = 'Fonte: planilha do formulário (Google Sheets) · atualizado em ' + d.atualizado;
    if (d.planilha) { $('planilha').href = d.planilha; $('planilha').hidden = false; }

    var kp = [
      ['Total de inscritos', T, '+' + d.ultimos7 + ' nos últimos 7 dias'],
      ['Estados com inscritos', est.length + ' de 27', (27 - est.length) + ' estados ainda sem inscrição'],
      ['Estado líder', lider ? lider[0] + ' · ' + lider[1] : '—', lider ? pct(lider[1], T) + ' do total' : ''],
      ['Cidade líder em SP', cl ? cl[0] + ' · ' + cl[1] : '—', cl ? pct(cl[1], sp) + ' dos inscritos de SP' : '']
    ];
    $('kpis').innerHTML = kp.map(function (k) { return '<div class="pn-kpi"><p>' + esc(k[0]) + '</p><strong>' + esc(k[1]) + '</strong><span>' + esc(k[2]) + '</span></div>'; }).join('');

    var max = est.length ? est[0][1] : 1;
    var top = est.slice(0, 10), resto = est.slice(10).reduce(function (a, b) { return a + b[1]; }, 0);
    $('ranking').innerHTML = top.map(function (e) {
      return '<div class="pn-row"><b>' + e[0] + '</b><span>' + esc(NOMES[e[0]]) + '</span><i style="--w:' + (e[1] * 100 / max) + '%"></i><em>' + e[1] + '</em><small>' + pct(e[1], T) + '</small></div>';
    }).join('') + (resto ? '<p class="pn-more">+ ' + (est.length - 10) + ' estados somam ' + resto + ' inscritos (' + pct(resto, T) + ')</p>' : '') || '<p class="pn-empty">Nenhuma inscrição ainda.</p>';

    $('mapa').innerHTML = Object.keys(MAPA).map(function (uf) {
      var n = d.porEstado[uf] || 0, a = n ? 0.18 + 0.82 * (n / max) : 0;
      return '<div class="pn-tile' + (n ? '' : ' is-zero') + '" style="grid-column:' + (MAPA[uf][0] + 1) + ';grid-row:' + (MAPA[uf][1] + 1) + ';--a:' + a.toFixed(2) + '" title="' + esc(NOMES[uf]) + ': ' + n + '"><b>' + uf + '</b><span>' + (n || '—') + '</span></div>';
    }).join('');

    var dias = [], hoje = new Date();
    for (var i = 29; i >= 0; i--) { var dt = new Date(hoje.getTime() - i * 864e5); var k = dt.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }); dias.push([k, d.porDia[k] || 0]); }
    var md = Math.max.apply(null, dias.map(function (x) { return x[1]; }).concat([1]));
    $('dias').innerHTML = dias.map(function (x) { return '<div title="' + x[0].split('-').reverse().slice(0, 2).join('/') + ': ' + x[1] + '"><i style="height:' + (x[1] * 100 / md) + '%"></i></div>'; }).join('');

    var mc = cid.length ? cid[0][1] : 1;
    $('cidades').innerHTML = cid.map(function (c) { return '<div class="pn-row pn-row--c"><span>' + esc(c[0]) + '</span><i style="--w:' + (c[1] * 100 / mc) + '%"></i><em>' + c[1] + '</em><small>' + pct(c[1], sp) + '</small></div>'; }).join('') || '<p class="pn-empty">Nenhuma inscrição de SP ainda.</p>';

    $('recentes').innerHTML = (d.recentes || []).map(function (r) { return '<div class="pn-rec"><b>' + esc(r.nome) + '</b><span>' + esc(r.whatsapp) + '</span><span>' + esc(r.cidade || NOMES[r.estado] || r.estado) + '</span><small>' + esc(r.data) + '</small></div>'; }).join('') || '<p class="pn-empty">Nenhuma inscrição ainda.</p>';
  }
})();
