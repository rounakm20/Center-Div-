// ─────────────────────────────────────────────────────
// Masonry.jsx  —  src/components/Masonry.jsx
// Vite + React + Tailwind CSS
// npm install gsap
// ─────────────────────────────────────────────────────

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────
// Apni design images yahan replace karo
// height alag-alag rakho — masonry look ke liye
// ─────────────────────────────────────────────────────
export const DEFAULT_ITEMS = [
  { id: '1', img: '/images/one.png', height: 480 },
  { id: '2', img: '/images/two.png', height: 300 },
  { id: '3', img: '/images/three.png', height: 420 },
  { id: '4', img: '/images/four.png', height: 260 },
  { id: '5', img: '/images/five.png', height: 540 },
  { id: '6', img: '/images/six.png', height: 340 },
  { id: '7', img: '/images/seven.png', height: 400 },
  { id: '8', img: '/images/eight.png', height: 280 },
  { id: '9', img: '/images/nine.png', height: 460 },
  { id: '10', img: '/images/ten.png', height: 320 },
  { id: '11', img: '/images/eleven.png', height: 380 },
  { id: '12', img: '/images/twelve.png', height: 240 },
];
// ─────────────────────────────────────────────────────
// Har column ka scroll speed (px mein drift)
// Negative = upar jaata hai | Positive = neeche jaata hai
// Bada number = zyada movement
// ─────────────────────────────────────────────────────
const COLUMN_SPEEDS = [
  -80,   // col 0 — slow upar
   70,   // col 1 — medium neeche
  -130,  // col 2 — fast upar
   50,   // col 3 — slow neeche
  -100,  // col 4 — medium-fast upar
];

// ─────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────
const useMedia = (queries, values, defaultValue) => {
  const get = () =>
    values[queries.findIndex(q => window.matchMedia(q).matches)] ?? defaultValue;
  const [value, setValue] = useState(get);
  useEffect(() => {
    const handler = () => setValue(get);
    const mqls = queries.map(q => window.matchMedia(q));
    mqls.forEach(m => m.addEventListener('change', handler));
    return () => mqls.forEach(m => m.removeEventListener('change', handler));
  }, []); // eslint-disable-line
  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) =>
      setSize({ width: e.contentRect.width, height: e.contentRect.height })
    );
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
};

const preloadImages = urls =>
  Promise.all(
    urls.map(src => new Promise(res => {
      const i = new Image();
      i.src = src;
      i.onload = i.onerror = res;
    }))
  );

// ─────────────────────────────────────────────────────
// Masonry Component
// ─────────────────────────────────────────────────────
const Masonry = ({
  items = DEFAULT_ITEMS,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.06,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.96,
  blurToFocus = true,
  colorShiftOnHover = false,
}) => {
  const columns = useMedia(
    ['(min-width:1400px)', '(min-width:1000px)', '(min-width:640px)', '(min-width:400px)'],
    [4, 3, 2, 2],
    1
  );

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);
  const hasMounted = useRef(false);
  const cardRefs = useRef({});

  useEffect(() => {
    setImagesReady(false);
    preloadImages(items.map(i => i.img)).then(() => setImagesReady(true));
  }, [items]);

  // ── Layout: x, y, w, h compute karo ──
  const grid = useMemo(() => {
    if (!width) return [];
    const GAP = 12;
    const colHeights = new Array(columns).fill(0);
    const colWidth = (width - GAP * (columns - 1)) / columns;

    return items.map(item => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (colWidth + GAP);
      const y = colHeights[col];
      const h = item.height; // height as-is for varied sizes
      colHeights[col] += h + GAP;
      return { ...item, x, y, w: colWidth, h, col };
    });
  }, [columns, items, width]);

  const totalHeight = useMemo(
    () => (grid.length ? Math.max(...grid.map(i => i.y + i.h)) + 40 : 0),
    [grid]
  );

  // ── Entry animation ──
  useLayoutEffect(() => {
    if (!imagesReady || !grid.length) return;

    grid.forEach((item, index) => {
      const el = cardRefs.current[item.id];
      if (!el) return;

      const target = { left: item.x, top: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        let fromX = item.x;
        let fromY = item.y + 140;

        if (animateFrom === 'top')    fromY = -300;
        if (animateFrom === 'bottom') fromY = window.innerHeight + 300;
        if (animateFrom === 'left')   { fromX = -300; fromY = item.y; }
        if (animateFrom === 'right')  { fromX = window.innerWidth + 300; fromY = item.y; }

        gsap.fromTo(el,
          {
            opacity: 0, left: fromX, top: fromY, width: item.w, height: item.h,
            ...(blurToFocus && { filter: 'blur(10px)' }),
          },
          {
            opacity: 1, ...target,
            ...(blurToFocus && { filter: 'blur(0px)' }),
            duration: 1, ease: 'power3.out', delay: index * stagger,
          }
        );
      } else {
        gsap.to(el, { ...target, duration, ease, overwrite: 'auto' });
      }
    });

    hasMounted.current = true;
  }, [grid, imagesReady]); // eslint-disable-line

  // ── Per-column scroll parallax ──
  // KEY: Har column alag COLUMN_SPEEDS value se drift karta hai
  // Positive drift = neeche, Negative = upar — creates dynamic feel
  useEffect(() => {
    if (!imagesReady || !grid.length) return;

    const triggers = [];

    // Column-wise grouping
    const byCol = {};
    grid.forEach(item => {
      if (!byCol[item.col]) byCol[item.col] = [];
      byCol[item.col].push(item.id);
    });

    Object.entries(byCol).forEach(([colStr, ids]) => {
      const col = Number(colStr);
      const yDrift = COLUMN_SPEEDS[col % COLUMN_SPEEDS.length];

      ids.forEach(id => {
        const el = cardRefs.current[id];
        if (!el) return;
        const driftEl = el.querySelector('.masonry-drift');
        if (!driftEl) return;

        // Scroll karne pe yDrift px tak move karta hai
        const t = gsap.fromTo(
          driftEl,
          { y: 0 },
          {
            y: yDrift,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5, // smooth lag effect
            },
          }
        );
        triggers.push(t);
      });
    });

    // Inner image parallax (bg depth)
    grid.forEach(item => {
      const el = cardRefs.current[item.id];
      if (!el) return;
      const inner = el.querySelector('.masonry-inner');
      if (!inner) return;

      const t = gsap.fromTo(inner,
        { backgroundPositionY: '25%' },
        {
          backgroundPositionY: '75%',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
      triggers.push(t);
    });

    return () => triggers.forEach(t => t.scrollTrigger?.kill());
  }, [imagesReady, grid]); // eslint-disable-line

  // ── Hover handlers ──
  const handleMouseEnter = (id, el) => {
    if (scaleOnHover) gsap.to(el, { scale: hoverScale, duration: 0.3, ease: 'power2.out' });
    if (colorShiftOnHover) {
      const ov = el.querySelector('.color-overlay');
      if (ov) gsap.to(ov, { opacity: 0.4, duration: 0.3 });
    }
  };

  const handleMouseLeave = (id, el) => {
    if (scaleOnHover) gsap.to(el, { scale: 1, duration: 0.3, ease: 'power2.out' });
    if (colorShiftOnHover) {
      const ov = el.querySelector('.color-overlay');
      if (ov) gsap.to(ov, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: totalHeight }}
    >
      {grid.map(item => (
        <div
          key={item.id}
          ref={el => { cardRefs.current[item.id] = el; }}
          className="absolute box-content cursor-pointer"
          style={{
            left: item.x,
            top: item.y,
            width: item.w,
            height: item.h,
            willChange: 'transform, opacity',
          }}
          onClick={() => item.url !== '#' && window.open(item.url, '_blank', 'noopener')}
          onMouseEnter={e => handleMouseEnter(item.id, e.currentTarget)}
          onMouseLeave={e => handleMouseLeave(item.id, e.currentTarget)}
        >
          {/* masonry-drift — sirf translateY, position se alag */}
          <div className="masonry-drift w-full h-full">
            <div
              className="masonry-inner relative w-full h-full bg-cover bg-center rounded-2xl overflow-hidden"
              style={{
                backgroundImage: `url(${item.img})`,
                boxShadow: '0 8px 40px -8px rgba(0,0,0,0.5)',
              }}
            >
              {colorShiftOnHover && (
                <div className="color-overlay absolute inset-0 bg-gradient-to-tr from-rose-500/50 to-sky-400/50 opacity-0 pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;