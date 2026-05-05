/* ─────────────────────────────────────────────
   Matrix Rain · Particle system with mouse
   convergence: attract toward ring, repel core
───────────────────────────────────────────── */
(function () {
    const canvas = document.getElementById('matrix-bg');
    const ctx    = canvas.getContext('2d');
    const ACCENT = '#1A6B35';
    const R      = 200;

    const mouse = { x: -999, y: -999, on: false };
    let pts = [], W, H, rafId = null;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768 || !window.matchMedia('(pointer: fine)').matches;

    /* Default off on mobile or when reduced motion is preferred */
    let running = !prefersReducedMotion && !isMobile;

    function mkPt(randY) {
        const baseVy = 0.6 + Math.random() * 1.4;
        return {
            x: Math.random() * (W || innerWidth),
            y: randY ? Math.random() * (H || innerHeight) : -16,
            vx: 0, vy: baseVy, baseVy,
            char: Math.random() > 0.5 ? '1' : '0',
            alpha: 0.03 + Math.random() * 0.05,
            size:  11 + Math.floor(Math.random() * 5),
            t: 0, ti: 20 + Math.floor(Math.random() * 40)
        };
    }

    function resize() {
        W = canvas.width  = innerWidth;
        H = canvas.height = innerHeight;
        ctx.clearRect(0, 0, W, H);
        const n = W < 768 ? 80 : 280;
        pts = Array.from({ length: n }, (_, i) => mkPt(i < n));
    }

    function tick() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = ACCENT;
        ctx.textAlign = 'left';

        for (const p of pts) {
            if (++p.t >= p.ti) {
                p.char = Math.random() > 0.5 ? '1' : '0';
                p.t = 0;
            }

            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const d  = Math.sqrt(dx * dx + dy * dy) || 0.01;
            const near = mouse.on && d < R;

            if (near) {
                const s = 1 - d / R;
                if (d < 68) {
                    p.vx -= (dx / d) * s * 2.4;
                    p.vy -= (dy / d) * s * 2.4;
                } else {
                    p.vx += (dx / d) * s * 1.1;
                    p.vy += (dy / d) * s * 1.1;
                }
                p.vx += (-dy / d) * s * 0.45;
                p.vy += ( dx / d) * s * 0.45;
            }

            p.vx *= 0.88;
            const tVy = near ? p.baseVy * 0.08 : p.baseVy;
            p.vy += (tVy - p.vy) * 0.04;
            p.vy  = Math.min(Math.max(p.vy, -4), 6);

            p.x += p.vx;
            p.y += p.vy;

            if (p.y > H + 20) Object.assign(p, mkPt(false));
            if (p.x < -30)    p.x = W + 10;
            if (p.x > W + 30) p.x = -10;

            const glow = near ? (1 - d / R) : 0;
            ctx.globalAlpha = near ? Math.min(0.1 + 0.14 * glow, 0.22) : p.alpha;
            ctx.shadowBlur  = 0;
            ctx.font = `${p.size}px "IBM Plex Mono", monospace`;
            ctx.fillText(p.char, p.x, p.y);
        }

        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
        rafId = requestAnimationFrame(tick);
    }

    function syncToggleBtn() {
        const btn = document.getElementById('canvas-toggle');
        if (!btn) return;
        btn.textContent = running ? '⏸ Matrix' : '▶ Matrix';
        btn.setAttribute('aria-pressed', String(running));
    }

    function startCanvas() {
        if (rafId) return;
        running = true;
        rafId = requestAnimationFrame(tick);
        syncToggleBtn();
    }

    function stopCanvas() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        ctx.clearRect(0, 0, W, H);
        running = false;
        syncToggleBtn();
    }

    window.toggleCanvas = function () { running ? stopCanvas() : startCanvas(); };

    window.addEventListener('resize', resize);

    if (window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', e => {
            mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true;
        });
        document.addEventListener('mouseleave', () => { mouse.on = false; });
    }

    resize();
    if (running) rafId = requestAnimationFrame(tick);
    syncToggleBtn();
})();

/* ── Filter with URL search param ── */
function filterProjects(cat, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.project-item').forEach(el => {
        el.classList.toggle('hidden', cat !== 'all' && el.dataset.cat !== cat);
    });
    const url = new URL(location.href);
    if (cat === 'all') {
        url.searchParams.delete('filter');
    } else {
        url.searchParams.set('filter', cat);
    }
    history.pushState({}, '', url);
}

/* Apply ?filter= param on page load */
(function () {
    const filter = new URLSearchParams(location.search).get('filter');
    if (filter) {
        const btn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
        if (btn) filterProjects(filter, btn);
    }
})();

/* ── Lang toggle is defined in js/lang.js ── */
