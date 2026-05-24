import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── BlurText ─────────────────────────────────────────────────────────────────

function BlurText({ text = "", delay = 100, style = {} }) {
  const words = text.split(" ");
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ display: "flex", flexWrap: "wrap", gap: "0.25em", ...style }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={visible ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.8, delay: i * (delay / 1000), ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "inline-block", willChange: "transform, opacity, filter" }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

// ─── ExpandItem ───────────────────────────────────────────────────────────────

function ExpandItem({ title, body, active, onClick }) {
  return (
    <div onClick={onClick} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "22px 0", cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "clamp(18px,1.6vw,30px)", color: active ? "#ffffff" : "rgba(255,255,255,0.45)", fontWeight: 500, letterSpacing: "-0.04em", transition: "0.3s", fontFamily: "'Outfit', sans-serif" }}>
          {title}
        </h3>
        <span style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.4)", fontSize: "22px", transition: "0.3s" }}>
          {active ? "−" : "+"}
        </span>
      </div>
      <div style={{ maxHeight: active ? "160px" : "0px", overflow: "hidden", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <p style={{ marginTop: "12px", maxWidth: "580px", color: "rgba(255,255,255,0.62)", fontSize: "13px", lineHeight: 1.8, fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}>
          {body}
        </p>
      </div>
    </div>
  );
}

// ─── PixelTransition ──────────────────────────────────────────────────────────

function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 8,
  pixelColor = "#ffffff",
  animationStepDuration = 0.4,
  once = false,
  className = "",
  style = {},
}) {
  const containerRef = useRef(null);
  const [isSecond, setIsSecond] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pixels, setPixels] = useState([]);
  const hasAnimated = useRef(false);
  const timeoutsRef = useRef([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const buildGrid = useCallback(() => {
    const cells = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        cells.push({ r, c, visible: false });
      }
    }
    return cells;
  }, [gridSize]);

  const runAnimation = useCallback((toSecond) => {
    if (isAnimating) return;
    if (once && hasAnimated.current) return;
    hasAnimated.current = true;
    setIsAnimating(true);
    clearTimeouts();

    const total = gridSize * gridSize;
    const indices = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
    const stepMs = (animationStepDuration * 1000) / total;

    const showPixels = [];
    indices.forEach((idx, order) => {
      const t1 = setTimeout(() => {
        setPixels(prev => {
          const next = [...prev];
          next[idx] = { ...next[idx], visible: true };
          return next;
        });
      }, order * stepMs);
      showPixels.push(t1);
    });
    timeoutsRef.current.push(...showPixels);

    const flipT = setTimeout(() => {
      setIsSecond(toSecond);
    }, animationStepDuration * 1000 * 0.5);
    timeoutsRef.current.push(flipT);

    const hidePixels = [];
    indices.forEach((idx, order) => {
      const t2 = setTimeout(() => {
        setPixels(prev => {
          const next = [...prev];
          next[idx] = { ...next[idx], visible: false };
          return next;
        });
        if (order === total - 1) setIsAnimating(false);
      }, animationStepDuration * 1000 * 0.5 + order * stepMs);
      hidePixels.push(t2);
    });
    timeoutsRef.current.push(...hidePixels);
  }, [isAnimating, once, gridSize, animationStepDuration]);

  useEffect(() => {
    setPixels(buildGrid());
    return () => clearTimeouts();
  }, [buildGrid]);

  const handleMouseEnter = () => { if (!isSecond) runAnimation(true); };
  const handleMouseLeave = () => { if (isSecond && !once) runAnimation(false); };

  const cellW = `${100 / gridSize}%`;
  const cellH = `${100 / gridSize}%`;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", cursor: "pointer", ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* First content */}
      <div style={{ position: "absolute", inset: 0, opacity: isSecond ? 0 : 1, transition: "opacity 0s" }}>
        {firstContent}
      </div>
      {/* Second content */}
      <div style={{ position: "absolute", inset: 0, opacity: isSecond ? 1 : 0, transition: "opacity 0s" }}>
        {secondContent}
      </div>
      {/* Pixel grid overlay */}
      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)`, pointerEvents: "none" }}>
        {pixels.map((px, i) => (
          <div
            key={i}
            style={{
              width: "100%", height: "100%",
              background: pixelColor,
              opacity: px.visible ? 1 : 0,
              transition: `opacity ${animationStepDuration * 0.3}s ease`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Team Data ────────────────────────────────────────────────────────────────

const teamMembers = [
  {
    name: "Rounak Mishra",
    title: "Founder & CEO",
    instagram: "https://instagram.com/YOUR_HANDLE",
    linkedin: "https://linkedin.com/in/YOUR_HANDLE",
    
    photo: "/images/Rounak.png",
    initials: "RM",
  },
  {
    name: "Neeraj Chauhan",
    title: "Managing Director",
    instagram: "https://instagram.com/YOUR_HANDLE",
    linkedin: "https://linkedin.com/in/YOUR_HANDLE",
    
    photo: "/images/Neeraj.png",
    initials: "NC",
  },
  {
    name: "Vinay Dhiman",
    title: "Chief Technology Officer",
    instagram: "https://instagram.com/YOUR_HANDLE",
    linkedin: "https://linkedin.com/in/YOUR_HANDLE",
    photo: "/images/Vinay.png",
    initials: "VD",
  },
];

// ─── Team Card ────────────────────────────────────────────────────────────────

function TeamCard({ member, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        overflow: "hidden",
        background: "#0d0d0d",
      }}
    >
      {/* PixelTransition — full card height, no separate info bar */}
      <div style={{ width: "100%", aspectRatio: "3 / 4", position: "relative" }}>
        <PixelTransition
          gridSize={8}
          pixelColor="#ffffff"
          once={false}
          animationStepDuration={0.4}
          style={{ width: "100%", height: "100%" }}
          firstContent={
            /* ── FIRST: full photo + bottom name overlay ── */
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              {/* Photo fills entire card */}
              <img
                src={member.photo}
                alt={member.name}
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center top",
                  display: "block",
                }}
              />
              {/* Gradient scrim at bottom */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: "45%",
                background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
                pointerEvents: "none",
              }} />
              {/* Name + title overlay */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "20px 20px 18px",
              }}>
                <div style={{
                  fontSize: "20px", fontWeight: 700, color: "#fff",
                  fontFamily: "'Big Shoulders Display', sans-serif",
                  letterSpacing: "-0.01em", lineHeight: 1.1,
                }}>
                  {member.name}
                </div>
                <div style={{
                  fontSize: "11px", color: "rgba(255,255,255,0.5)",
                  fontFamily: "'Outfit', sans-serif",
                  marginTop: "4px", letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  {member.title}
                </div>
              </div>
            </div>
          }
          secondContent={
            /* ── SECOND: dark panel with social links ── */
            <div style={{
              width: "100%", height: "100%",
              background: "#0d0d0d",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "28px",
              padding: "32px",
              boxSizing: "border-box",
            }}>
              {/* Initials circle */}
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", fontWeight: 700, color: "#fff",
                fontFamily: "'Big Shoulders Display', sans-serif",
                letterSpacing: "0.04em",
              }}>
                {member.initials}
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "22px", fontWeight: 900, color: "#fff",
                  fontFamily: "'Big Shoulders Display', sans-serif",
                  letterSpacing: "-0.02em",
                }}>
                  {member.name}
                </div>
                <div style={{
                  fontSize: "11px", color: "rgba(255,255,255,0.35)",
                  fontFamily: "'Outfit', sans-serif",
                  marginTop: "5px", letterSpacing: "0.12em", textTransform: "uppercase",
                }}>
                  {member.title}
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px" }}>
                {/* Instagram */}
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "52px", height: "52px", borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff", textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "52px", height: "52px", borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff", textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>

                {/* Email */}
                <a
                  href="mailto:centerdiv.studio@gmail.com"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "52px", height: "52px", borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff", textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <polyline points="2,4 12,13 22,4"/>
                  </svg>
                </a>
              </div>
            </div>
          }
        />
      </div>
    </motion.div>
  );
}

// ─── Team Modal ───────────────────────────────────────────────────────────────

function TeamModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(12px)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "2rem",
            overflowY: "auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", maxWidth: "1100px" }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif" }}>
                  The People Behind The Work
                </p>
                <h2 style={{ margin: 0, fontSize: "clamp(28px,4vw,52px)", fontWeight: 900, color: "#fff", fontFamily: "'Big Shoulders Display', sans-serif", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  Meet Our Team
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: "20px", transition: "all 0.2s", flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              >
                ✕
              </button>
            </div>

            {/* 3-column grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
              alignItems: "start",
            }}>
              {teamMembers.map((member, i) => (
                <TeamCard key={member.name} member={member} index={i} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── AboutAgency ──────────────────────────────────────────────────────────────

export default function AboutAgency() {
  const [active, setActive] = useState(1);
  const [teamOpen, setTeamOpen] = useState(false);

  return (
    <>
      <section
        id="about"
        style={{
          position: "relative", background: "#0a0a0a", overflow: "hidden",
          padding: "72px 7vw 80px", minHeight: "100vh", boxSizing: "border-box",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top left,rgba(255,255,255,0.05),transparent 35%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
          <span style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.2)" }} />
          <p style={{ margin: 0, fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif" }}>
            About The Studio
          </p>
        </div>

        <div style={{ marginBottom: "36px" }}>
          <BlurText text="Crafting Digital" style={{ fontSize: "clamp(46px,7.5vw,124px)", lineHeight: 0.88, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.04em", fontFamily: "'Big Shoulders Display', sans-serif", textShadow: "0 0 40px rgba(255,255,255,0.08)" }} />
          <BlurText text="Experiences." delay={120} style={{ fontSize: "clamp(46px,7.5vw,124px)", lineHeight: 0.88, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.08em", fontFamily: "'Big Shoulders Display', sans-serif", textShadow: "0 0 40px rgba(255,255,255,0.08)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "80px", alignItems: "start" }}>
          <div>
            <p style={{ margin: "0 0 40px", color: "rgba(255,255,255,0.72)", fontSize: "clamp(18px,2.1vw,36px)", lineHeight: 1.35, letterSpacing: "-0.04em", fontWeight: 300, maxWidth: "720px", fontFamily: "'Outfit', sans-serif" }}>
              At CENTRE&lt;DIV&gt;, we craft immersive digital experiences that blend strategy, design, and development into one seamless process.
              <br /><br />
              From premium websites to modern product experiences, every detail is designed to feel intentional, interactive, and unforgettable.
            </p>

            <button
              onClick={() => setTeamOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "100px", padding: "14px 28px",
                color: "#fff", fontSize: "14px",
                fontFamily: "'Outfit', sans-serif", fontWeight: 500,
                letterSpacing: "0.04em", cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.border = "1px solid rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.border = "1px solid rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                {["RM", "NC", "VD"].map((init, i) => (
                  <div key={i} style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)", border: "2px solid #0a0a0a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.7)",
                    marginLeft: i === 0 ? 0 : "-8px",
                    fontFamily: "'Big Shoulders Display', sans-serif",
                  }}>
                    {init}
                  </div>
                ))}
              </div>
              Meet Our Team
              <span style={{ fontSize: "16px", opacity: 0.6 }}>→</span>
            </button>
          </div>

          <div>
            <ExpandItem title="Our Philosophy" active={active === 0} onClick={() => setActive(active === 0 ? null : 0)} body="We believe premium digital experiences are built through clarity, emotion, and precision. Every interaction should feel effortless yet memorable." />
            <ExpandItem title="Our Vision" active={active === 1} onClick={() => setActive(active === 1 ? null : 1)} body="To build timeless digital products that combine modern aesthetics with powerful performance and smooth user experiences." />
            <ExpandItem title="How We Work" active={active === 2} onClick={() => setActive(active === 2 ? null : 2)} body="We handle everything from concept and strategy to design, animation, and development — ensuring one unified creative direction throughout the journey." />
          </div>
        </div>
      </section>

      <TeamModal isOpen={teamOpen} onClose={() => setTeamOpen(false)} />
    </>
  );
}