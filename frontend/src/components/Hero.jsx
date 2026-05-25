import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { X, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';

// ─── LineWaves ────────────────────────────────────────────────────────────────

function hexToVec3(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

#define HALF_PI 1.5707963

float hashF(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float smoothNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hashF(i), hashF(i + 1.0), u);
}

float displaceA(float coord, float t) {
  float result = sin(coord * 2.123) * 0.2;
  result += sin(coord * 3.234 + t * 4.345) * 0.1;
  result += sin(coord * 0.589 + t * 0.934) * 0.5;
  return result;
}

float displaceB(float coord, float t) {
  float result = sin(coord * 1.345) * 0.3;
  result += sin(coord * 2.734 + t * 3.345) * 0.2;
  result += sin(coord * 0.189 + t * 0.934) * 0.3;
  return result;
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords * 2.0 - 1.0;
  coords = rotate2D(coords, uRotation);

  float halfT = uTime * uSpeed * 0.5;
  float fullT = uTime * uSpeed;

  float mouseWarp = 0.0;
  if (uEnableMouse) {
    vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
    float mDist = length(coords - mPos);
    mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);
  }

  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;

  vec2 fieldA = vec2(warpAx, warpAy);
  vec2 fieldB = vec2(warpBx, warpBy);
  vec2 blended = mix(fieldA, fieldB, mix(fieldA, fieldB, 0.5));

  float fadeTop    = smoothstep( uEdgeFadeWidth,  uEdgeFadeWidth + 0.4, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
  float vMask = 1.0 - max(fadeTop, fadeBottom);

  float tileCount = mix(uOuterLines, uInnerLines, vMask);
  float scaledY = blended.y * tileCount;
  float nY = smoothNoise(abs(scaledY));

  float ridge = pow(
    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
    5.0
  );

  float lines = 0.0;
  for (float i = 1.0; i < 3.0; i += 1.0) {
    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
  }

  float pattern = vMask * lines;

  float cycleT = fullT * uColorCycleSpeed;
  float rChannel = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);
  float gChannel = (pattern + vMask  * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);
  float bChannel = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);

  vec3 col = (rChannel * uColor1 + gChannel * uColor2 + bChannel * uColor3) * uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`;

function LineWaves({
  speed = 0.3,
  innerLineCount = 32.0,
  outerLineCount = 36.0,
  warpIntensity = 1.0,
  rotation = -45,
  edgeFadeWidth = 0.0,
  colorCycleSpeed = 1.0,
  brightness = 0.2,
  color1 = '#ffffff',
  color2 = '#ffffff',
  color3 = '#ffffff',
  enableMouseInteraction = true,
  mouseInfluence = 2.0,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    let program;
    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];

    function handleMouseMove(e) {
      const rect = container.getBoundingClientRect();
      targetMouse = [
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height,
      ];
    }

    function handleMouseLeave(e) {
      const rect = container.getBoundingClientRect();
      if (
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top  || e.clientY > rect.bottom
      ) {
        targetMouse = [0.5, 0.5];
      }
    }

    function resize() {
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      if (program) {
        program.uniforms.uResolution.value = [
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height,
        ];
      }
    }
    window.addEventListener('resize', resize);
    resize();

    const geometry = new Triangle(gl);
    const rotationRad = (rotation * Math.PI) / 180;

    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime:             { value: 0 },
        uResolution:       { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
        uSpeed:            { value: speed },
        uInnerLines:       { value: innerLineCount },
        uOuterLines:       { value: outerLineCount },
        uWarpIntensity:    { value: warpIntensity },
        uRotation:         { value: rotationRad },
        uEdgeFadeWidth:    { value: edgeFadeWidth },
        uColorCycleSpeed:  { value: colorCycleSpeed },
        uBrightness:       { value: brightness },
        uColor1:           { value: hexToVec3(color1) },
        uColor2:           { value: hexToVec3(color2) },
        uColor3:           { value: hexToVec3(color3) },
        uMouse:            { value: new Float32Array([0.5, 0.5]) },
        uMouseInfluence:   { value: mouseInfluence },
        uEnableMouse:      { value: enableMouseInteraction },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    if (enableMouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    let animationFrameId;

    function update(time) {
      animationFrameId = requestAnimationFrame(update);
      program.uniforms.uTime.value = time * 0.001;

      if (enableMouseInteraction) {
        currentMouse[0] += 0.15 * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += 0.15 * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }

      renderer.render({ scene: mesh });
    }
    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (enableMouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [speed, innerLineCount, outerLineCount, warpIntensity, rotation, edgeFadeWidth, colorCycleSpeed, brightness, color1, color2, color3, enableMouseInteraction, mouseInfluence]);

  return <div ref={containerRef} className="w-full h-full" />;
}

// ─── Consultation Modal ───────────────────────────────────────────────────────

const ConsultationModal = ({ isOpen, onClose }) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '' });

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setLoading(false);
      setForm({ name: '', email: '', service: '', message: '' });
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(modalRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: onClose });
    gsap.to(modalRef.current, { opacity: 0, y: 20, scale: 0.97, duration: 0.2, ease: 'power2.in' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs.send(
      'service_4w2u1us',
      'template_phsqba6',
      {
        from_name: form.name,
        to_name: form.name,
        from_email: form.email,
        to_email: form.email,
        service: form.service,
        message: form.message,
        logo_url: 'https://i.ibb.co/jPWdG62f/logo.png',
      },
      'sZBujAVFwDgsQQnSC'
    )
    .then(() => {
      setSubmitted(true);
      setLoading(false);
    })
    .catch((err) => {
      console.error('Email failed:', err);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && handleClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          padding: '2rem',
          width: '100%',
          maxWidth: '480px',
          position: 'relative',
          boxShadow: '0 0 60px rgba(255,255,255,0.05)',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: '50%',
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          <X size={16} />
        </button>

        {!submitted ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Let's talk
              </p>
              <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: '2rem', color: '#fff', lineHeight: 1, margin: 0 }}>
                Book a Consultation
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Your Name</label>
                <input
                  type="text" placeholder="Rounak Mishra"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.65rem 0.9rem', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Email Address</label>
                <input
                  type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.65rem 0.9rem', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>What do you need?</label>
                <select
                  value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}
                  style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.65rem 0.9rem', color: form.service ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s', cursor: 'pointer', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <option value="" disabled>Select a service...</option>
                  <option value="UI / UX Design">UI / UX Design</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Branding & Strategy">Branding & Strategy</option>
                  <option value="Full Product Build">Full Product Build</option>
                  <option value="Something else">Something else</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Tell us more</label>
                <textarea
                  placeholder="Briefly describe your project or idea..."
                  rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.65rem 0.9rem', color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'none', transition: 'border 0.2s', boxSizing: 'border-box', lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ width: '100%', marginTop: '0.25rem', background: '#fff', color: '#000', border: 'none', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.2s, transform 0.15s', opacity: loading ? 0.7 : 1 }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}
                onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {loading ? 'Sending...' : <><span>Send Request</span><Send size={15} /></>}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', fontSize: '1.5rem' }}>✓</div>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>We'll be in touch!</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Thanks {form.name ? form.name.split(' ')[0] : 'there'}! We've received your request and will reach out to <span style={{ color: 'rgba(255,255,255,0.8)' }}>{form.email}</span> within 24 hours.
            </p>
            <button onClick={handleClose} style={{ marginTop: '1.5rem', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.5rem 1.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => {
  const containerRef = useRef(null);
  const subtitleRef  = useRef(null);
  const buttonsRef   = useRef(null);
  const glowRef      = useRef(null);
  // FIX 1: Added ref for badge element
  const badgeRef     = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@900&family=Supermercado+One&family=Satisfy&family=Outfit:wght@200;300;400&display=swap';
    document.head.appendChild(link);

    const ctx = gsap.context(() => {
      const handleMouseMove = (e) => {
        if (!glowRef.current) return;
        const x = (e.clientX / window.innerWidth  - 0.5) * 100;
        const y = (e.clientY / window.innerHeight - 0.5) * 100;
        gsap.to(glowRef.current, { x, y, duration: 2, ease: 'power3.out' });
      };
      window.addEventListener('mousemove', handleMouseMove);

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // FIX 1: Use ref instead of class selector for badge
      tl.fromTo(badgeRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.3 }
      )
      .fromTo('.brand-name-char',
        { y: 120, opacity: 0, rotateX: -60 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.4, ease: 'expo.out' },
        '-=0.6'
      )
      .fromTo('.brand-studios',
        { y: 20, opacity: 0, letterSpacing: '0.6em' },
        { y: 0, opacity: 1, letterSpacing: '0.35em', duration: 1.2 },
        '-=0.8'
      )
      .fromTo(subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        '-=0.6'
      )
      .fromTo('.hero-btn',
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1 },
        '-=0.5'
      );

      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // FIX 2: Inline SVG noise — no external URL needed
  const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

  return (
    <>
      <section
        ref={containerRef}
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <LineWaves
            speed={0.3}
            innerLineCount={32}
            outerLineCount={36}
            warpIntensity={1.0}
            rotation={-45}
            edgeFadeWidth={0.0}
            colorCycleSpeed={1.0}
            brightness={0.2}
            color1="#ffffff"
            color2="#ffffff"
            color3="#ffffff"
            enableMouseInteraction={true}
            mouseInfluence={2.0}
          />
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none">
          <div
            ref={glowRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[120px] opacity-50"
          />
         
        </div>

        <div className="relative z-20 max-w-6xl mx-auto px-6 text-center flex flex-col items-center">

          

          <div className="brand-name-char relative inline-block" style={{ perspective: '1200px' }} aria-label="CENTREDIV Studios">
            <div style={{ lineHeight: 0.88, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <span style={{
                fontFamily: "'Big Shoulders Display', sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(5rem, 16vw, 14rem)',
                letterSpacing: '-0.01em',
                color: '#ffffff',
                display: 'inline-block',
              }}>CENTER</span>
              <span style={{
                fontFamily: "'Supermercado One', sans-serif",
                fontWeight: 400,
                fontSize: 'clamp(5rem, 16vw, 14rem)',
                display: 'inline-block',
                letterSpacing: '-0.01em',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', fontWeight: 300 }}>&lt;</span>
                <span style={{ color: '#ffffff', textShadow: '0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(255,255,255,0.2)' }}>DIV</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', fontWeight: 300 }}>&gt;</span>
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.15em' }}>
              <p className="brand-studios" style={{
                fontFamily: "'Satisfy', cursive",
                fontWeight: 400,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                letterSpacing: '0.06em',
                color: '#ffffff',
                textShadow: '0 0 30px rgba(255,255,255,0.5)',
                margin: 0,
                lineHeight: 1,
              }}>Studios</p>
            </div>
          </div>

          <div className="w-16 mt-8 mb-7 opacity-30" style={{ height: '1px', background: 'rgba(255,255,255,0.6)' }} />

          <p
            ref={subtitleRef}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
              fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
              color: 'rgba(255,255,255,0.85)',
              maxWidth: '560px',
              lineHeight: 1.85,
              letterSpacing: '0.02em',
              textAlign: 'center',
            }}
            className="mb-4"
          >
            Strategy. Design. Development. Launch.{' '}
            We handle the entire journey from your first rough idea to a live, polished product that performs. No handoffs, no miscommunication — just one tight team that cares about your outcome.
          </p>

          <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center gap-3">
            <button
              className="hero-btn group relative px-6 py-3 bg-white text-black rounded-full font-medium text-base overflow-hidden transition-transform hover:scale-105 active:scale-95"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-slate-600 to-slate-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                View Our Services
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              className="hero-btn px-6 py-3 rounded-full font-medium text-base glass hover:bg-white/10 transition-colors border border-white/20"
              onClick={() => setModalOpen(true)}
            >
              Book a Consultation
            </button>
          </div>
        </div>
      </section>

      <ConsultationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Hero;