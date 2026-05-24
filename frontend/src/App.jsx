import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Masonry from './components/Masonry';
import Services from './components/Services';
import WhatYouGet from './components/WhatYouGet';
import Reviews from './components/Reviews';
import Footer from './components/Footer';


gsap.registerPlugin(ScrollTrigger);

function App() {
  const appRef = useRef(null);

  useEffect(() => {
    // Optional global smooth scroll setup
  }, []);

  return (
    <div ref={appRef} className="min-h-screen bg-background text-primary selection:bg-accent/30 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <WhatYouGet />
        {/* ── Masonry Gallery Section ── */}
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-neutral-500 mb-4">Gallery</p>
          <h2 className="text-4xl md:text-6xl font-light leading-none tracking-tight mb-4">
            The world<br />
            <span className="text-neutral-500">in frames.</span>
          </h2>
          <p className="text-neutral-400 text-base max-w-md leading-relaxed mb-12">
            A curated collection of landscapes, nature, and atmosphere.
          </p>
          <Masonry
            animateFrom="bottom"
            scaleOnHover={true}
            hoverScale={0.97}
            blurToFocus={true}
            colorShiftOnHover={false}
          />
        </section>

        <Reviews />
      </main>
      <Footer />
    </div>
  );
}

export default App;