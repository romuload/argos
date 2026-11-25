/* ArgosAI · molécula 3D vetorial para o painel da Plataforma.
   Uma única estrutura conceitual (não representa nenhum candidato real) que
   muda de forma conforme a etapa em foco:
   0 Dados          → fita de sequência solta
   1 Análise        → a fita se dobra numa estrutura compacta, com contatos internos
   2 Priorização    → a estrutura se separa em candidatos; dois se destacam
   3 Validação      → um candidato ao centro, em traço tracejado: validação pendente
   O progresso vem da posição das etapas na tela; não há animação em loop. */
(() => {
  const host = document.querySelector('[data-mol3d]');
  if (!host) return;
  const frame = host.querySelector('.scrolly-frame');
  const steps = [...host.querySelectorAll('.scrolly-step')];
  if (!frame || steps.length < 4) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 901px)');

  // ---------- geometria ----------
  const N = 48, CL = 6, PER = N / CL;           // 6 candidatos de 8 átomos
  const HIGH = [1, 4];                          // candidatos destacados na priorização
  const FOCUS = 4;                              // candidato levado à validação
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const fib = (k, n, r) => { const y = 1 - (k + .5) / n * 2, rr = Math.sqrt(1 - y * y), t = k * 2.39996; return [Math.cos(t) * rr * r, y * r, Math.sin(t) * rr * r]; };

  const S = [[], [], [], []];
  for (let i = 0; i < N; i++) {
    // 0 · fita helicoidal ao longo de x
    const u = i / (N - 1);
    S[0].push([-1.12 + u * 2.24, .32 * Math.sin(i * .5) + .08 * Math.sin(i * .13), .32 * Math.cos(i * .5)]);
    // 1 · dobrada: passeio aleatório compacto (forma orgânica, vizinhos próximos)
    if (i === 0) S[1].push([-.3, .2, 0]);
    else {
      const prev = S[1][i - 1]; let best = null, bd = 1e9;
      for (let k = 0; k < 14; k++) {
        const t1 = rnd() * Math.PI * 2, t2 = Math.acos(2 * rnd() - 1);
        const q = [prev[0] + .2 * Math.sin(t2) * Math.cos(t1), prev[1] + .2 * Math.cos(t2) * .9, prev[2] + .2 * Math.sin(t2) * Math.sin(t1)];
        const rc = Math.hypot(q[0], q[1], q[2]);
        const crowd = S[1].reduce((m, o) => Math.min(m, Math.hypot(o[0] - q[0], o[1] - q[1], o[2] - q[2])), 9);
        const score = Math.max(0, rc - .62) * 6 + (crowd < .16 ? 3 : 0) + rnd() * .3;
        if (score < bd) { bd = score; best = q; }
      }
      S[1].push(best);
    }
  }
  for (let c = 0; c < CL; c++) {
    const cx = -1.05 + c * .42, cy = .16 * Math.sin(c * 1.7), cz = (c % 2 ? .12 : -.12);
    for (let k = 0; k < PER; k++) {
      const [x, y, z] = fib(k, PER, .2);
      S[2].push([cx + x, cy + y, cz + z]);
      // 3 · o candidato em foco vai ao centro e cresce; os outros se afastam
      if (c === FOCUS) { const [a, b, d] = fib(k, PER, .5); S[3].push([a, b, d]); }
      else S[3].push([cx * 1.9, cy * 1.6 + (c % 2 ? .9 : -.9), cz * 2]);
    }
  }
  const cluster = i => Math.floor(i / PER);
  const bonds = [];
  for (let i = 0; i < N - 1; i++) {
    const same = cluster(i) === cluster(i + 1);
    bonds.push({ a: i, b: i + 1, w: same ? [1, 1, 1, cluster(i) === FOCUS ? 1 : 0] : [1, 1, 0, 0] });
  }
  for (let i = 0; i < N; i++) for (let j = i + 4; j < N; j++) {
    const p = S[1][i], q = S[1][j];
    if (Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < .27 && bonds.length < 90) bonds.push({ a: i, b: j, w: [0, .55, 0, 0], contact: true });
  }
  for (let c = 0; c < CL; c++) {   // ligações internas que fecham cada candidato
    const o = c * PER; bonds.push({ a: o, b: o + PER - 1, w: [0, 0, 1, c === FOCUS ? 1 : 0] });
    bonds.push({ a: o + 1, b: o + 5, w: [0, 0, .7, c === FOCUS ? 1 : 0] });
    bonds.push({ a: o + 2, b: o + 6, w: [0, 0, .5, c === FOCUS ? 1 : 0] });
  }
  // destaque (0 = comum, 1 = destacado) e opacidade por estado
  const hi = i => [0, 0, HIGH.includes(cluster(i)) ? 1 : 0, cluster(i) === FOCUS ? 1 : 0];
  const op = i => [1, 1, HIGH.includes(cluster(i)) ? 1 : .55, cluster(i) === FOCUS ? 1 : 0];
  const size = i => [.055, .072, HIGH.includes(cluster(i)) ? .07 : .06, cluster(i) === FOCUS ? .1 : .05];

  // ---------- SVG ----------
  const NS = 'http://www.w3.org/2000/svg', W = 480, H = 360;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'mol3d'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
  svg.innerHTML = `<defs>
    <radialGradient id="molShine" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".45" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs><g class="mol-bonds"></g><g class="mol-atoms"></g><circle class="mol-pending" cx="${W / 2}" cy="${H / 2}" r="0" fill="none"/>`;
  const gB = svg.querySelector('.mol-bonds'), gA = svg.querySelector('.mol-atoms'), ring = svg.querySelector('.mol-pending');
  const lines = bonds.map(() => { const l = document.createElementNS(NS, 'line'); gB.append(l); return l; });
  const atoms = Array.from({ length: N }, () => {
    const g = document.createElementNS(NS, 'g'), c = document.createElementNS(NS, 'circle'), s = document.createElementNS(NS, 'circle');
    s.setAttribute('fill', 'url(#molShine)'); g.append(c, s); gA.append(g); return { g, c, s };
  });
  frame.append(svg);
  host.classList.add('has-mol');

  // ---------- interpolação e desenho ----------
  const ease = x => x * x * (3 - 2 * x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (arr, t) => { const i = Math.min(2, Math.floor(t)), f = ease(t - i); return lerp(arr[i], arr[i + 1], f); };
  const C0 = [168, 201, 212], C1 = [63, 111, 116], INK = [35, 62, 66];
  const rgb = (a, b, t, d) => `rgb(${a.map((v, k) => Math.round(lerp(v, b[k], t) * d)).join(',')})`;

  function draw(t) {
    const ang = -.28 + t * .2 + (t > 2 ? (t - 2) * .5 : 0), tilt = .3;
    const ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(tilt), st = Math.sin(tilt);
    const P = [];
    for (let i = 0; i < N; i++) {
      const p = [0, 1, 2].map(k => mix(S.map(s => s[i][k]), t));
      let x = p[0] * ca - p[2] * sa, z = p[0] * sa + p[2] * ca, y = p[1];
      const y2 = y * ct - z * st, z2 = y * st + z * ct;
      const sc = 3.4 / (3.4 + z2);
      P.push({ x: W / 2 + x * 168 * sc, y: H / 2 + y2 * 168 * sc, z: z2, sc });
    }
    const dashed = t > 2.55;
    bonds.forEach((b, k) => {
      const w = mix(b.w, t), A = P[b.a], B = P[b.b], l = lines[k];
      const o = w * Math.min(mix(op(b.a), t), mix(op(b.b), t));
      if (o < .02) { l.setAttribute('opacity', 0); return; }
      l.setAttribute('x1', A.x.toFixed(1)); l.setAttribute('y1', A.y.toFixed(1)); l.setAttribute('x2', B.x.toFixed(1)); l.setAttribute('y2', B.y.toFixed(1));
      const depth = (A.z + B.z) / 2;
      l.setAttribute('opacity', (o * (b.contact ? .7 : .9) * (1 - depth * .18)).toFixed(3));
      l.setAttribute('stroke-width', ((b.contact ? 1.1 : 2.2) * (A.sc + B.sc) / 2).toFixed(2));
      l.setAttribute('stroke-dasharray', dashed && cluster(b.a) === FOCUS ? '5 5' : '');
    });
    const order = P.map((p, i) => i).sort((a, b) => P[b].z - P[a].z);
    order.forEach(i => {
      const { g, c, s } = atoms[i], p = P[i], o = mix(op(i), t);
      const r = mix(size(i), t) * 150 * p.sc, h = mix(hi(i), t), d = 1 - Math.max(0, p.z) * .16;
      c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1)); c.setAttribute('r', r.toFixed(2));
      s.setAttribute('cx', p.x.toFixed(1)); s.setAttribute('cy', p.y.toFixed(1)); s.setAttribute('r', r.toFixed(2));
      if (dashed && cluster(i) === FOCUS) {
        c.setAttribute('fill', '#fff'); c.setAttribute('stroke', rgb(C1, INK, .3, 1)); c.setAttribute('stroke-width', 1.6); c.setAttribute('stroke-dasharray', '3 3'); s.setAttribute('opacity', 0);
      } else {
        c.setAttribute('fill', rgb(C0, C1, h, d)); c.removeAttribute('stroke'); c.removeAttribute('stroke-dasharray'); s.setAttribute('opacity', .9);
      }
      g.setAttribute('opacity', o.toFixed(3));
      gA.append(g);
    });
    const rr = Math.max(0, (t - 2.4) / .6);
    ring.setAttribute('r', (rr * 140).toFixed(1)); ring.setAttribute('opacity', (rr * .9).toFixed(2));
  }

  // ---------- progresso a partir das etapas ----------
  function target() {
    const c = innerHeight * .5;
    const mids = steps.map(s => { const n = s.querySelector('.scrolly-num').getBoundingClientRect(); return n.top + n.height / 2; });
    if (c <= mids[0]) return 0;
    for (let i = 0; i < mids.length - 1; i++) if (c <= mids[i + 1]) return i + (c - mids[i]) / (mids[i + 1] - mids[i]);
    return mids.length - 1;
  }
  let cur = 0, goal = 0, raf = 0;
  function tick() {
    raf = 0;
    goal = target();
    if (reduce.matches) cur = Math.round(goal);           // sem transição: troca de estado direta
    else cur += (goal - cur) * .14;
    if (Math.abs(goal - cur) < .002) cur = reduce.matches ? cur : goal;
    draw(Math.max(0, Math.min(3, cur)));
    if (!reduce.matches && Math.abs(goal - cur) > .002) raf = requestAnimationFrame(tick);
  }
  const schedule = () => { if (desktop.matches && !raf) raf = requestAnimationFrame(tick); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  reduce.addEventListener?.('change', schedule);
  cur = goal = target(); draw(Math.max(0, Math.min(3, cur)));
})();
