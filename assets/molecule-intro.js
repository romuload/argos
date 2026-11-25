/* ArgosAI · moléculas 3D vetoriais na abertura das páginas internas.
   Substitui a ilustração estática (.intro-art), que continua no HTML como
   reserva sem JavaScript. Cada página recebe uma estrutura conceitual ligada ao
   tema; nenhuma representa um candidato ou resultado real.
   Movimento: monta-se uma vez ao abrir, gira com a rolagem e inclina de leve
   com o ponteiro. Sem loop. Com movimento reduzido, fica parada. */
(() => {
  const img = document.querySelector('img.intro-art');
  if (!img) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const path = location.pathname.replace(/\/index\.html$/, '/').split('/').filter(Boolean).pop() || '';

  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const fib = (k, n, r) => { const y = 1 - (k + .5) / n * 2, rr = Math.sqrt(1 - y * y), t = k * 2.39996; return [Math.cos(t) * rr * r, y * r, Math.sin(t) * rr * r]; };
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  const chain = (A, from, to, B) => { for (let i = from; i < to - 1; i++) B.push([i, i + 1]); };

  // ---------- famílias de estrutura ----------
  const shapes = {
    strand() { const A = [], B = []; for (let i = 0; i < 30; i++) A.push([-1.05 + i * .072, .3 * Math.sin(i * .55), .3 * Math.cos(i * .55), i % 7 === 3 ? 1 : 0]); chain(A, 0, 30, B); return { A, B }; },
    doubleHelix() {
      const A = [], B = []; const n = 16;
      for (let s = 0; s < 2; s++) for (let i = 0; i < n; i++) { const a = i * .62 + s * Math.PI; A.push([-1 + i * .133, .34 * Math.sin(a), .34 * Math.cos(a), s]); }
      chain(A, 0, n, B); chain(A, n, 2 * n, B); for (let i = 0; i < n; i += 2) B.push([i, i + n, 'rung']);
      return { A, B };
    },
    folded(n = 44, r = .66) {
      const A = [[0, 0, 0, 0]], B = [];
      for (let i = 1; i < n; i++) {
        const prev = A[i - 1]; let best = null, bd = 1e9;
        for (let k = 0; k < 14; k++) {
          const t1 = rnd() * 6.283, t2 = Math.acos(2 * rnd() - 1);
          const q = [prev[0] + .2 * Math.sin(t2) * Math.cos(t1), prev[1] + .2 * Math.cos(t2), prev[2] + .2 * Math.sin(t2) * Math.sin(t1)];
          const crowd = A.reduce((m, o) => Math.min(m, dist(o, q)), 9);
          const sc = Math.max(0, Math.hypot(...q) - r) * 6 + (crowd < .16 ? 3 : 0) + rnd() * .3;
          if (sc < bd) { bd = sc; best = q; }
        }
        A.push([...best, i > n * .55 && i < n * .72 ? 1 : 0]);
      }
      chain(A, 0, n, B);
      for (let i = 0; i < n; i++) for (let j = i + 4; j < n; j++) if (dist(A[i], A[j]) < .26) B.push([i, j, 'contact']);
      return { A, B };
    },
    clusters(k = 4, high = [1]) {
      const A = [], B = [], per = 8;
      for (let c = 0; c < k; c++) {
        const ang = (c / k) * Math.PI * 2, cx = Math.cos(ang) * .62, cz = Math.sin(ang) * .62, cy = (c % 2 ? .14 : -.14);
        const o = A.length;
        for (let i = 0; i < per; i++) { const [x, y, z] = fib(i, per, .22); A.push([cx + x, cy + y, cz + z, high.includes(c) ? 1 : 0]); }
        chain(A, o, o + per, B); B.push([o, o + per - 1]); B.push([o + 1, o + 5]);
      }
      return { A, B };
    },
    network(n = 26) {
      const A = [], B = [];
      for (let i = 0; i < n; i++) { const [x, y, z] = fib(i, n, .82); A.push([x, y, z, i % 9 === 4 ? 1 : 0]); }
      for (let i = 0; i < n; i++) { const near = A.map((p, j) => [dist(A[i], p), j]).filter(([d, j]) => j > i).sort((a, b) => a[0] - b[0]).slice(0, 2); near.forEach(([, j]) => B.push([i, j])); }
      return { A, B };
    },
    pair() {
      const L = shapes.folded(18, .34), R = shapes.folded(18, .34), A = [], B = [];
      L.A.forEach(p => A.push([p[0] - .52, p[1], p[2], 0])); R.A.forEach(p => A.push([p[0] + .52, p[1], p[2], 1]));
      L.B.forEach(b => B.push(b)); R.B.forEach(([a, c, t]) => B.push([a + 18, c + 18, t]));
      let links = 0; for (let i = 0; i < 18 && links < 3; i++) for (let j = 18; j < 36 && links < 3; j++) if (dist(A[i], A[j]) < .42) { B.push([i, j, 'link']); links++; }
      return { A, B };
    },
    ring() {
      const A = [], B = [];
      for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + r * Math.PI / 6, rad = r ? .78 : .42; A.push([Math.cos(a) * rad, (r ? .12 : -.06) * (i % 2 ? 1 : -1), Math.sin(a) * rad, r ? 0 : 1]); }
      for (let i = 0; i < 6; i++) { B.push([i, (i + 1) % 6]); B.push([i, 6 + i]); B.push([6 + i, 6 + (i + 1) % 6, 'contact']); }
      return { A, B };
    },
  };
  const byPage = {
    plataforma: () => shapes.folded(), ciencia: () => (seed = 29, shapes.folded(40)),
    produtos: () => shapes.clusters(4, [0, 2]), 'relatorio-demonstrativo': () => shapes.clusters(4, [1, 3]), 'areas-de-atuacao': () => shapes.clusters(3, [0]),
    capacidades: () => shapes.network(28), recursos: () => (seed = 5, shapes.network(22)),
    projetos: () => shapes.strand(), 'quem-somos': () => shapes.doubleHelix(),
    codesenvolvimento: () => shapes.pair(), contato: () => (seed = 3, shapes.pair()),
    imprensa: () => shapes.ring(),
  };
  const { A, B } = (byPage[path] || shapes.folded)();
  const N = A.length;
  // centraliza e normaliza: todas as estruturas ocupam o mesmo espaço
  const cen = [0, 1, 2].map(k => A.reduce((m, a) => m + a[k], 0) / N);
  A.forEach(a => { for (let k = 0; k < 3; k++) a[k] -= cen[k]; });
  const R = Math.max(...A.map(a => Math.hypot(a[0], a[1] * 1.25, a[2])));
  A.forEach(a => { for (let k = 0; k < 3; k++) a[k] *= .95 / R; });
  const PITCH = path === 'imprensa' ? .95 : .3;
  const start = A.map(() => { const [x, y, z] = fib(Math.floor(rnd() * 60), 60, 1.6 + rnd() * .5); return [x, y, z]; });

  // ---------- SVG ----------
  const NS = 'http://www.w3.org/2000/svg', W = 420, H = 340;
  const box = document.createElement('div'); box.className = 'intro-mol'; box.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('focusable', 'false');
  svg.innerHTML = '<defs><radialGradient id="imShine" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".45" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><radialGradient id="imShadow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#1c2322" stop-opacity=".10"/><stop offset="1" stop-color="#1c2322" stop-opacity="0"/></radialGradient></defs><ellipse class="im-shadow" fill="url(#imShadow)"/><g class="im-b"></g><g class="im-a"></g>';
  const gB = svg.querySelector('.im-b'), gA = svg.querySelector('.im-a'), shadow = svg.querySelector('.im-shadow');
  const lines = B.map(() => { const l = document.createElementNS(NS, 'line'); gB.append(l); return l; });
  const atoms = A.map(() => { const g = document.createElementNS(NS, 'g'), c = document.createElementNS(NS, 'circle'), s = document.createElementNS(NS, 'circle'); s.setAttribute('fill', 'url(#imShine)'); g.append(c, s); gA.append(g); return { g, c, s }; });
  box.append(svg); img.after(box); img.classList.add('is-replaced');

  const C0 = [168, 201, 212], C1 = [63, 111, 116];
  const lerp = (a, b, t) => a + (b - a) * t;
  const outQuint = t => 1 - Math.pow(1 - t, 4);
  function draw(build, yaw, pitch) {
    const ca = Math.cos(yaw), sa = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const P = A.map((a, i) => {
      const t = Math.min(1, Math.max(0, build * 1.25 - (i / N) * .25)), e = outQuint(t);
      const p = [0, 1, 2].map(k => lerp(start[i][k], a[k], e));
      const x = p[0] * ca - p[2] * sa, z = p[0] * sa + p[2] * ca, y2 = p[1] * cp - z * sp, z2 = p[1] * sp + z * cp;
      const sc = 3.3 / (3.3 + z2);
      return { x: W / 2 + x * 200 * sc, y: H / 2 - 14 + y2 * 200 * sc, z: z2, sc, o: e };
    });
    B.forEach(([a, b, kind], k) => {
      const p = P[a], q = P[b], l = lines[k], o = Math.min(p.o, q.o);
      l.setAttribute('x1', p.x.toFixed(1)); l.setAttribute('y1', p.y.toFixed(1)); l.setAttribute('x2', q.x.toFixed(1)); l.setAttribute('y2', q.y.toFixed(1));
      l.setAttribute('stroke-width', ((kind === 'contact' ? 1.1 : kind === 'rung' ? 1.6 : 2.4) * (p.sc + q.sc) / 2).toFixed(2));
      l.setAttribute('opacity', (o * (kind === 'contact' ? .5 : .85) * (1 - (p.z + q.z) * .1)).toFixed(3));
      l.setAttribute('stroke-dasharray', kind === 'link' ? '4 4' : '');
    });
    P.map((p, i) => i).sort((i, j) => P[j].z - P[i].z).forEach(i => {
      const p = P[i], { g, c, s } = atoms[i], r = (A[i][3] ? .082 : .068) * 190 * p.sc, d = 1 - Math.max(0, p.z) * .15, h = A[i][3];
      [c, s].forEach(el => { el.setAttribute('cx', p.x.toFixed(1)); el.setAttribute('cy', p.y.toFixed(1)); el.setAttribute('r', r.toFixed(2)); });
      c.setAttribute('fill', `rgb(${C0.map((v, k) => Math.round(lerp(v, C1[k], h) * d)).join(',')})`);
      g.setAttribute('opacity', p.o.toFixed(3)); gA.append(g);
    });
    const low = Math.max(...P.map(p => p.y)), xs = P.map(p => p.x);
    shadow.setAttribute('cx', ((Math.min(...xs) + Math.max(...xs)) / 2).toFixed(1)); shadow.setAttribute('cy', Math.min(H - 10, low + 26).toFixed(1));
    shadow.setAttribute('rx', ((Math.max(...xs) - Math.min(...xs)) * .42 * Math.min(1, build * 1.2)).toFixed(1)); shadow.setAttribute('ry', 11);
  }

  // ---------- movimento ----------
  let build = reduce ? 1 : 0, tilt = 0, tiltGoal = 0, raf = 0, t0 = 0;
  const intro = box.closest('section') || document.body;
  const yawFor = () => -.45 + scrollY * .0022;
  function tick(ts) {
    raf = 0;
    if (!t0) t0 = ts;
    if (build < 1) build = Math.min(1, (ts - t0) / 1500);
    tilt += (tiltGoal - tilt) * .1;
    draw(build, yawFor() + tilt * .35, PITCH + tilt * .12);
    if (build < 1 || Math.abs(tiltGoal - tilt) > .002) raf = requestAnimationFrame(tick);
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };
  if (reduce) { draw(1, -.45, PITCH); return; }
  addEventListener('scroll', () => { if (intro.getBoundingClientRect().bottom > 0) schedule(); }, { passive: true });
  if (matchMedia('(pointer: fine)').matches) {
    intro.addEventListener('pointermove', e => { const r = intro.getBoundingClientRect(); tiltGoal = ((e.clientX - r.left) / r.width - .5) * 2; schedule(); });
    intro.addEventListener('pointerleave', () => { tiltGoal = 0; schedule(); });
  }
  draw(0, yawFor(), PITCH); schedule();
})();
