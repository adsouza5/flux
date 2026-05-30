import { useEffect, useRef } from 'react';

const TWO_PI = Math.PI * 2;
const N = 72;

const RING_META = [
  { baseR: 52,  band: [0,   4],  rot:  0.00022, spikeMax: 28,  idleAmp: 4,  coreAlpha: 0.75, bright: 0   },
  { baseR: 92,  band: [3,   12], rot: -0.00016, spikeMax: 42,  idleAmp: 6,  coreAlpha: 0.60, bright: 12  },
  { baseR: 138, band: [10,  32], rot:  0.00011, spikeMax: 56,  idleAmp: 8,  coreAlpha: 0.45, bright: 28  },
  { baseR: 190, band: [28,  64], rot: -0.00007, spikeMax: 68,  idleAmp: 10, coreAlpha: 0.30, bright: 44  },
  { baseR: 248, band: [56, 100], rot:  0.00004, spikeMax: 78,  idleAmp: 12, coreAlpha: 0.18, bright: 62  },
];

function buildSmoothed(data, binStart, binEnd) {
  const out = new Float32Array(N);
  const span = binEnd - binStart;
  for (let i = 0; i < N; i++) {
    const f = binStart + (i / N) * span;
    const lo = Math.floor(f), hi = Math.min(lo + 1, data.length - 1);
    out[i] = ((data[lo] || 0) + ((data[hi] || 0) - (data[lo] || 0)) * (f - lo)) / 255;
  }
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < N; i++) {
      out[i] = (
        out[(i - 2 + N) % N] * 0.10 +
        out[(i - 1 + N) % N] * 0.20 +
        out[i]               * 0.40 +
        out[(i + 1)     % N] * 0.20 +
        out[(i + 2)     % N] * 0.10
      );
    }
  }
  return out;
}

function spline(ctx, pts) {
  const n = pts.length;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    if (i === 0) ctx.moveTo(p1[0], p1[1]);
    ctx.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
      p2[0], p2[1],
    );
  }
  ctx.closePath();
}

function glowStroke(ctx, r, g, b, coreAlpha, energy) {
  const boost = energy * 0.5;
  ctx.lineWidth = 14;
  ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(0.12, coreAlpha * 0.06 + boost * 0.06)})`;
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(0.30, coreAlpha * 0.18 + boost * 0.15)})`;
  ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(0.92, coreAlpha + boost)})`;
  ctx.stroke();
}

const POOL_SIZE = 120;
const pool = Array.from({ length: POOL_SIZE }, () => ({
  active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, decay: 0, size: 0, r: 0, g: 0, b: 0,
}));

function spawnParticle(x, y, angle, energy, color) {
  const p = pool.find(p => !p.active);
  if (!p) return;
  const speed = 0.8 + energy * 3;
  p.active = true; p.x = x; p.y = y;
  p.vx = Math.cos(angle) * speed;
  p.vy = Math.sin(angle) * speed;
  p.life = 1;
  p.decay = 0.016 + Math.random() * 0.014;
  p.size = 1.2 + energy * 2.5;
  [p.r, p.g, p.b] = color;
}

function clamp(v, min = 0, max = 255) { return Math.max(min, Math.min(max, v)); }

export default function FluxVisualizer({ state, analyserRef, typeColor }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const rotRef    = useRef(RING_META.map(() => 0));
  const ptsRef    = useRef(RING_META.map(() => Array.from({ length: N }, () => [0, 0])));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const fftData = new Uint8Array(128);
    let prev = performance.now();

    function loop(now) {
      rafRef.current = requestAnimationFrame(loop);
      const dt = now - prev; prev = now;
      const t = now / 1000;

      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const sc = Math.min(W, H) / 580;

      ctx.clearRect(0, 0, W, H);

      const recording    = state === 'recording' && analyserRef.current;
      const transcribing = state === 'transcribing';

      if (recording) analyserRef.current.getByteFrequencyData(fftData);

      let energy = 0;
      if (recording) {
        for (let i = 0; i < 16; i++) energy += fftData[i] / 255;
        energy /= 16;
      } else if (transcribing) {
        energy = 0.18 + Math.sin(t * 3.2) * 0.08;
      }

      // Derive per-ring colors from typeColor base
      const [br, bg, bb] = typeColor || [16, 185, 129];

      // ── Centre orb ──────────────────────────────────────────────
      const orbR = (22 + energy * 16) * sc;
      const g0 = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR * 3.5);
      const ambientAlpha = recording ? 0.10 + energy * 0.18 : transcribing ? 0.07 : 0.04;
      g0.addColorStop(0, `rgba(${br},${bg},${bb},${ambientAlpha})`);
      g0.addColorStop(1, `rgba(${br},${bg},${bb},0)`);
      ctx.fillStyle = g0;
      ctx.beginPath();
      ctx.arc(cx, cy, orbR * 3.5, 0, TWO_PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, orbR * 0.55, 0, TWO_PI);
      ctx.fillStyle = `rgba(${br},${bg},${bb},${recording ? 0.55 + energy * 0.45 : 0.18})`;
      ctx.fill();

      // ── Rings ────────────────────────────────────────────────────
      RING_META.forEach((ring, ri) => {
        const { baseR, band, rot, spikeMax, idleAmp, coreAlpha, bright } = ring;
        const R = baseR * sc;
        const cr = clamp(br + bright);
        const cg = clamp(bg + bright);
        const cb = clamp(bb + bright);

        const speedMult = recording ? 1 + energy * 5 : transcribing ? 1.8 : 1;
        rotRef.current[ri] += rot * dt * speedMult;
        const rotAngle = rotRef.current[ri];

        let smoothed = null;
        if (recording) smoothed = buildSmoothed(fftData, band[0], band[1]);

        const pts = ptsRef.current[ri];
        for (let i = 0; i < N; i++) {
          const angle = (i / N) * TWO_PI + rotAngle;
          let r = R;
          if (recording && smoothed) {
            r += smoothed[i] * spikeMax * sc;
          } else if (transcribing) {
            r += Math.sin(t * 3.0 + ri * 0.55) * idleAmp * 0.6 * sc;
          } else {
            r += (
              Math.sin(angle * 3 + t * 0.9  + ri * 0.7) * idleAmp * sc * 0.50 +
              Math.sin(angle * 5 - t * 0.55 + ri * 1.2) * idleAmp * sc * 0.30 +
              Math.sin(angle * 2 + t * 0.35 + ri * 0.4) * idleAmp * sc * 0.20
            );
          }
          pts[i][0] = cx + Math.cos(angle) * r;
          pts[i][1] = cy + Math.sin(angle) * r;
        }

        spline(ctx, pts);
        glowStroke(ctx, cr, cg, cb, coreAlpha, energy);

        if (recording && energy > 0.25) {
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${energy * 0.025})`;
          ctx.fill();
        }

        if (recording && (ri === 1 || ri === 2) && smoothed) {
          for (let i = 0; i < N; i += 3) {
            if (smoothed[i] > 0.70) {
              spawnParticle(pts[i][0], pts[i][1], (i / N) * TWO_PI + rotAngle, smoothed[i], [cr, cg, cb]);
            }
          }
        }
      });

      // ── Particles ────────────────────────────────────────────────
      for (const p of pool) {
        if (!p.active) continue;
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        p.life -= p.decay;
        if (p.life <= 0) { p.active = false; continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, TWO_PI);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.life * 0.85})`;
        ctx.fill();
      }
    }

    // Clear stale particles from previous type so old colors don't ghost
    pool.forEach(p => { p.active = false; });

    loop(performance.now());
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [state, analyserRef, typeColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
