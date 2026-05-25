import React, { useEffect, useRef, useMemo } from 'react';
import { Layout, Globe, ShoppingCart, Zap, Bot, Wrench } from 'lucide-react';

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@900&family=Supermercado+One&family=Satisfy&family=Outfit:wght@200;300;400&family=Cormorant+Garamond:wght@300;600;700&family=Instrument+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
@keyframes sd { 0% { top: -40% } 100% { top: 140% } }
`;

const mainServices = [
  { Icon: Layout,       title: 'SaaS MVP & React Web Apps',       desc: 'Custom scalable applications built with modern frameworks. Architecture, UI, backend, and deployment handled end-to-end.' },
  { Icon: ShoppingCart, title: 'E-Commerce Stores',                desc: 'High-converting online stores with smooth checkout flows, modern design systems, and mobile-first performance.' },
  { Icon: Globe,        title: 'Business & Portfolio Websites',    desc: 'Elegant digital experiences that establish trust and convert visitors into long-term customers.' },
  { Icon: Bot,          title: 'AI & API Integrations',            desc: 'Smart chatbot systems and powerful third-party integrations that automate workflows and reduce manual effort.' },
  { Icon: Zap,          title: 'Speed & SEO Optimization',         desc: 'Performance-focused engineering with technical SEO that helps your website rank faster and convert better.' },
  { Icon: Wrench,       title: 'Maintenance & Support',            desc: 'Reliable post-launch support, hosting management, updates, and monitoring so your platform never slows down.' },
];

const TOTAL = mainServices.length;
const DX = 26, DY = 20, DZ = -40;

// Desktop: centered on anchor point
const getTransform = (slot) =>
  `translate(-50%, -50%) translate3d(${slot * DX}px, ${-slot * DY}px, ${slot * DZ}px)`;

// Mobile: top-anchored so card goes BELOW the heading
const getMobileTransform = (slot) =>
  `translateX(-50%) translate3d(${slot * DX}px, ${slot * DY}px, ${slot * DZ}px)`;

export default function Services() {
  const sectionRef = useRef(null);
  const cardRefs = useMemo(() => mainServices.map(() => React.createRef()), []);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < 768);
  const isMobileRef = useRef(isMobile);

  const S = useRef({
    cardIdx: 0,
    order: mainServices.map((_, i) => i),
    isAnimating: false,
    accDelta: 0,
  });

  // always read latest isMobile from ref inside imperative code
  const tf    = (slot) => isMobileRef.current ? getMobileTransform(slot) : getTransform(slot);
  const exitY = ()     => isMobileRef.current
    ? 'translateX(-50%) translate3d(0px,900px,0px)'
    : 'translate(-50%,-50%) translate3d(0px,900px,0px)';

  const placeCard = (el, slot) => {
    if (!el) return;
    el.style.transition = 'none';
    el.style.transform   = tf(slot);
    el.style.zIndex      = String(TOTAL - slot);
    el.style.opacity     = '1';
  };

  const moveCard = (el, slot) => {
    if (!el) return;
    el.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1)';
    el.style.transform  = tf(slot);
    el.style.zIndex     = String(TOTAL - slot);
  };

  const swapForward = () => {
    if (S.current.isAnimating) return;
    if (S.current.cardIdx >= TOTAL - 1) return;
    S.current.isAnimating = true;
    const [front, ...rest] = S.current.order;
    const elFront = cardRefs[front].current;
    elFront.style.transition = 'transform 0.42s cubic-bezier(0.55,0,1,0.45), opacity 0.3s';
    elFront.style.transform  = exitY();
    elFront.style.opacity    = '0';
    setTimeout(() => { rest.forEach((idx, i) => moveCard(cardRefs[idx].current, i)); }, 50);
    setTimeout(() => {
      placeCard(elFront, TOTAL - 1);
      S.current.order = [...rest, front];
      S.current.cardIdx += 1;
      setActiveIdx(S.current.order[0]);
      S.current.isAnimating = false;
    }, 620);
  };

  const swapBackward = () => {
    if (S.current.isAnimating) return;
    if (S.current.cardIdx <= 0) return;
    S.current.isAnimating = true;
    const rest = S.current.order.slice(0, TOTAL - 1);
    const back = S.current.order[TOTAL - 1];
    const elBack = cardRefs[back].current;
    elBack.style.transition = 'none';
    elBack.style.opacity    = '0';
    elBack.style.zIndex     = String(TOTAL + 1);
    elBack.style.transform  = exitY();
    setTimeout(() => { rest.forEach((idx, i) => moveCard(cardRefs[idx].current, i + 1)); }, 40);
    setTimeout(() => {
      elBack.style.transition = 'transform 0.52s cubic-bezier(0.22,1,0.36,1), opacity 0.28s';
      elBack.style.opacity    = '1';
      elBack.style.zIndex     = String(TOTAL);
      elBack.style.transform  = tf(0);
      S.current.order = [back, ...rest];
      S.current.cardIdx -= 1;
      setActiveIdx(S.current.order[0]);
      setTimeout(() => { S.current.isAnimating = false; }, 530);
    }, 110);
  };

  // detect mobile
  useEffect(() => {
    const check = () => {
      const m = window.innerWidth < 768;
      isMobileRef.current = m;
      setIsMobile(m);
    };
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // initial card placement — runs after every isMobile change so transforms re-apply
  useEffect(() => {
    isMobileRef.current = isMobile;
    cardRefs.forEach((r, i) => {
      const slot = S.current.order.indexOf(i);
      placeCard(r.current, slot);
    });
  }, [isMobile]);

  // desktop wheel
  useEffect(() => {
    const THRESHOLD = 120;
    const isInView = () => {
      const el = sectionRef.current;
      if (!el) return false;
      const { top, bottom } = el.getBoundingClientRect();
      return top <= window.innerHeight * 0.1 && bottom >= window.innerHeight * 0.9;
    };
    const onWheel = (e) => {
      if (!isInView()) return;
      if (e.deltaY > 0 && S.current.cardIdx >= TOTAL - 1) return;
      if (e.deltaY < 0 && S.current.cardIdx <= 0) return;
      e.preventDefault();
      S.current.accDelta += e.deltaY;
      if (Math.abs(S.current.accDelta) < THRESHOLD) return;
      S.current.accDelta = 0;
      if (e.deltaY > 0) swapForward(); else swapBackward();
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  // mobile touch swipe
  useEffect(() => {
    let startY = null;
    const onTouchStart = (e) => { startY = e.touches[0].clientY; };
    const onTouchEnd   = (e) => {
      if (startY === null) return;
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 50) { startY = null; return; }
      if (dy > 0) swapForward(); else swapBackward();
      startY = null;
    };
    const el = sectionRef.current;
    if (!el) return;
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, []);

  // ── MOBILE ─────────────────────────────────────────────────────
  if (isMobile) {
    const cardW = Math.min(window.innerWidth - 48, 360);
    const cardH = 300;

    return (
      <div id="services" style={{ height: `${TOTAL * 55}vh`, position: 'relative', background: '#0a0a0a' }}>
        <style>{FONTS}</style>
        <div
          ref={sectionRef}
          style={{
            position: 'sticky', top: 0, height: '100vh',
            display: 'flex', flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            padding: '10vh 24px 0',
            boxSizing: 'border-box',
            overflow: 'hidden',
            borderTop: '1px solid #1a1a1a',
            borderBottom: '1px solid #1a1a1a',
          }}
        >
          {/* HEADING */}
          <div style={{ width: '100%', marginBottom: '32px', flexShrink: 0 }}>
            <p style={{
              fontFamily: "'Space Mono', monospace", fontSize: '10px',
              letterSpacing: '4px', color: '#555', textTransform: 'uppercase',
              margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ width: '20px', height: '1px', background: '#555', display: 'inline-block' }} />
              Services
            </p>
            <h2 style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontSize: 'clamp(62px, 14vw, 90px)', fontWeight: 900,
              color: '#ffffff', lineHeight: 0.85, letterSpacing: '-2px', margin: 0,
            }}>
              Crafted<br />to scale.
            </h2>
          </div>

          {/* CARD STACK — anchor top-left of card area, translateX(-50%) centers it */}
          <div style={{ position: 'relative', width: `${cardW}px`, height: `${cardH}px`, perspective: '1200px', flexShrink: 0, alignSelf: 'center' }}>
            <div style={{ position: 'absolute', top: '0', left: '50%' }}>
              {mainServices.map((service, i) => {
                const { Icon } = service;
                return (
                  <div key={i} ref={cardRefs[i]} style={{
                    position: 'absolute',
                    width: `${cardW}px`, height: `${cardH}px`,
                    borderRadius: '24px', background: '#f5f0e8',
                    border: '1px solid #ddd6cc', overflow: 'hidden',
                    willChange: 'transform', boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
                  }}>
                    <div style={{ width: '100%', height: '5px', background: '#1a1714' }} />
                    <div style={{ padding: '24px 28px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: '#e8e2d8', border: '1px solid #ddd6cc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6f655d', marginBottom: '14px',
                      }}>
                        <Icon size={18} />
                      </div>
                      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#a89f95', margin: '0 0 8px' }}>
                        {String(i + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
                      </p>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: '#1a1714', margin: '0 0 10px', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                        {service.title}
                      </h3>
                      <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: '12px', color: '#7a7068', lineHeight: 1.7, margin: 0 }}>
                        {service.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DESKTOP (original, untouched) ──────────────────────────────
  return (
    <div id="services" style={{ height: `${TOTAL * 55}vh`, position: 'relative', background: '#0a0a0a' }}>
      <style>{FONTS}</style>
      <div ref={sectionRef} style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 7vw', overflow: 'hidden', boxSizing: 'border-box',
        borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a',
      }}>
        {/* LEFT */}
        <div style={{ maxWidth: '320px', flexShrink: 0 }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '4px', color: '#555', textTransform: 'uppercase', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '20px', height: '1px', background: '#555', display: 'inline-block' }} />
            Services
          </p>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 'clamp(72px,7vw,110px)', fontWeight: 900, color: '#ffffff', lineHeight: 0.85, letterSpacing: '-2px', margin: '0 0 42px' }}>
            Crafted<br />to scale.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mainServices.map((s, i) => {
              const { Icon } = s;
              const active = i === activeIdx;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: active ? '#151515' : '#101010', border: `1px solid ${active ? '#2a2a2a' : '#171717'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#ffffff' : '#555', transition: 'all 0.3s', flexShrink: 0 }}>
                    <Icon size={15} />
                  </div>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: active ? '#ffffff' : '#666', transition: 'color 0.3s' }}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD STACK */}
        <div style={{ position: 'relative', width: '620px', height: '500px', perspective: '1200px', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: '50%', left: '40%' }}>
            {mainServices.map((service, i) => {
              const { Icon } = service;
              return (
                <div key={i} ref={cardRefs[i]} style={{ position: 'absolute', width: '520px', height: '380px', borderRadius: '24px', background: '#f5f0e8', border: '1px solid #ddd6cc', overflow: 'hidden', willChange: 'transform', boxShadow: '0 20px 60px rgba(0,0,0,0.22)' }}>
                  <div style={{ width: '100%', height: '5px', background: '#1a1714' }} />
                  <div style={{ padding: '42px 44px' }}>
                    <div style={{ width: '58px', height: '58px', borderRadius: '15px', background: '#e8e2d8', border: '1px solid #ddd6cc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6f655d', marginBottom: '28px' }}>
                      <Icon size={24} />
                    </div>
                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#a89f95', margin: '0 0 12px' }}>
                      {String(i + 1).padStart(2, '0')} /{String(TOTAL).padStart(2, '0')}
                    </p>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 600, color: '#1a1714', margin: '0 0 16px', lineHeight: 1.05, letterSpacing: '-1px' }}>
                      {service.title}
                    </h3>
                    <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: '14px', color: '#7a7068', lineHeight: 1.9, margin: 0 }}>
                      {service.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}