import React, { useState } from 'react';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600&family=Instrument+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');`;

const KF = `
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-track {
  animation: marquee 40s linear infinite;
}
.marquee-track:hover {
  animation-play-state: paused;
}
`;

const indianReviews = [
  {
    id: 1,
    image: "/images/anas.png",
    name: "Md Anas ",
    
    role: "Cafe Owner",
    rating: 5,
    text: "They created a beautiful and modern website for our cafe that perfectly matched our brand.Very professional team, smooth experience, and the final result exceeded our expectations. Highly recommended!",

  },
  {
    id: 2,
    image: "/images/shree.png",
    name: "shree Singh",
    
    role: "Student",
    rating: 5,
    text: "They built a clean and professional portfolio website that truly reflects my work and personality.The whole process was smooth, and they paid attention to every small detail perfectly.",
  },
  {
    id: 3,
    image: "/images/sundar.png",
    name: "Dewa Mishra ",
    role: "Gym Owner",
    rating: 5,
    text: "Our gym website looks professional and works smoothly on every device.Very satisfied with the quality, support, and overall experience.",
  },
  {
    id: 4,
    image: "/images/dadda.png",
    name: "Ankur",
    
    role: "Restaurant Owner",
    rating: 5,
    text: "They designed a clean and attractive website for our restaurant with all the features we needed.The entire process was simple, fast, and professionally handled.",
  },
  
];

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const ReviewCard = ({ review }) => {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, scale: 1 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTilt({
      rx: ((y - cy) / cy) * -8,
      ry: ((x - cx) / cx) * 8,
      scale: 1.03,
    });
  };

  const handleMouseLeave = () => setTilt({ rx: 0, ry: 0, scale: 1 });

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: '200px',
        height: '310px',
        flexShrink: 0,
        borderRadius: '14px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'default',
        border: '1px solid #2a2520',
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.scale})`,
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Full bleed portrait */}
      <img
        src={review.image}
        alt={review.name}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
        }}
      />

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, #0a0906 0%, rgba(10,9,6,0.85) 35%, rgba(10,9,6,0.1) 65%, transparent 100%)',
      }} />

      {/* Top vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(10,9,6,0.4) 0%, transparent 30%)',
      }} />

      {/* Stars badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'rgba(10,9,6,0.65)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '100px',
        padding: '3px 8px',
        display: 'flex',
        gap: '2px',
        alignItems: 'center',
      }}>
        {[...Array(review.rating)].map((_, i) => <StarIcon key={i} />)}
      </div>

      {/* Bottom content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 14px 14px' }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '32px',
          lineHeight: 1,
          color: '#ffffff',
          marginBottom: '2px',
          opacity: 0.6,
        }}>"</div>

        <p style={{
          fontFamily: "'Instrument Sans', sans-serif",
          fontSize: '10.5px',
          lineHeight: 1.6,
          color: '#ffffff',
          margin: '0 0 10px',
        }}>
          {review.text}
        </p>

        <div style={{
          height: '1px',
          background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)',
          marginBottom: '8px',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '13px',
              fontWeight: 600,
              color: '#ffffff',
              margin: '0 0 1px',
              letterSpacing: '-0.2px',
            }}>{review.name}</p>
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '8px',
              color: '#ffffff',
              margin: 0,
              letterSpacing: '0.5px',
              opacity: 0.7,
            }}>{review.role}</p>
          </div>
          <p style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: '9px',
            color: '#ffffff',
            margin: 0,
            textAlign: 'right',
            opacity: 0.5,
          }}>{review.company}</p>
        </div>
      </div>
    </div>
  );
};

const allReviews = [...indianReviews, ...indianReviews];

const Reviews = () => {
  return (
    <section 
    id="reviews"
    style={{ background: '#0a0906', padding: '48px 0 40px', overflow: 'hidden', position: 'relative', minHeight: '100vh', boxSizing: 'border-box' }}>
      <style>{FONTS + KF}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', padding: '0 7vw' }}>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px',
          letterSpacing: '4px',
          color: '#ffffff',
          textTransform: 'uppercase',
          margin: '0 0 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          opacity: 0.45,
        }}>
          <span style={{ width: '24px', height: '1px', background: '#ffffff', display: 'inline-block' }} />
          Client Stories
          <span style={{ width: '24px', height: '1px', background: '#ffffff', display: 'inline-block' }} />
        </p>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(40px,5vw,76px)',
          fontWeight: 600,
          color: '#ffffff',
          margin: '0 0 10px',
          lineHeight: 0.95,
          letterSpacing: '-2px',
        }}>
          Trusted across India.
        </h2>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(40px,5vw,76px)',
          fontWeight: 300,
          fontStyle: 'italic',
          color: '#ffffff',
          margin: '0 0 24px',
          lineHeight: 0.95,
          letterSpacing: '-2px',
          opacity: 0.45,
        }}>
          Loved by founders.
        </h2>
        <p style={{
          fontFamily: "'Instrument Sans', sans-serif",
          fontSize: '14px',
          color: '#ffffff',
          maxWidth: '380px',
          lineHeight: 1.85,
          margin: '0 auto',
          opacity: 0.45,
        }}>
          From early-stage startups to enterprise teams — every client gets the same obsessive care.
        </p>
      </div>

      {/* Marquee wrapper */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Fade left */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '120px',
          background: 'linear-gradient(to right, #0a0906, transparent)',
          zIndex: 10, pointerEvents: 'none',
        }} />
        {/* Fade right */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px',
          background: 'linear-gradient(to left, #0a0906, transparent)',
          zIndex: 10, pointerEvents: 'none',
        }} />

        <div
          className="marquee-track"
          style={{
            display: 'flex',
            gap: '32px',
            paddingTop: '12px',
            paddingBottom: '12px',
            width: 'max-content',
          }}
        >
          {allReviews.map((review, idx) => (
            <ReviewCard key={`${review.id}-${idx}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;