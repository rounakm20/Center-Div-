import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';

function FlowingMenu({
  items = [],
  speed = 15,
  textColor = '#fff',
  bgColor = '#120F17',
  marqueeBgColor = '#fff',
  marqueeTextColor = '#120F17',
  borderColor = 'rgba(255,255,255,0.12)',
}) {
  return (
    <div className="w-full h-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      <nav className="flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isFirst={idx === 0}
          />
        ))}
      </nav>
    </div>
  );
}

function MenuItem({ link, text, image, speed, textColor, marqueeBgColor, marqueeTextColor, borderColor, isFirst }) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const animationRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.6, ease: 'expo' };

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2;
    const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part');
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };
    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [text, image]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part');
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;
      if (animationRef.current) animationRef.current.kill();
      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1,
      });
    };
    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) animationRef.current.kill();
    };
  }, [text, image, repetitions, speed]);

  const handleMouseEnter = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
    gsap.timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
    gsap.timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  return (
    <div
      className="flex-1 relative overflow-hidden text-center"
      ref={itemRef}
      style={{ borderTop: isFirst ? 'none' : `1px solid ${borderColor}` }}
    >
      <a
        className="flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-semibold text-[4vh]"
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ color: textColor }}
      >
        {text}
      </a>
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"
        ref={marqueeRef}
        style={{ backgroundColor: marqueeBgColor }}
      >
        <div className="h-full w-fit flex" ref={marqueeInnerRef}>
          {[...Array(repetitions)].map((_, idx) => (
            <div className="marquee-part flex items-center flex-shrink-0" key={idx} style={{ color: marqueeTextColor }}>
              <span className="whitespace-nowrap uppercase font-normal text-[4vh] leading-[1] px-[1vw]">{text}</span>
              <div
                className="w-[200px] h-[7vh] my-[2em] mx-[2vw] py-[1em] rounded-[50px] bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { text: 'About',        link: '#about',        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80' },
  { text: 'Services',     link: '#services',     image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { text: 'What You Get', link: '#what-you-get', image: 'https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=400&q=80' },
  { text: 'Reviews',      link: '#reviews',      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80' },
];

// ✅ Apni logo image URL yahan daal do
const LOGO_IMAGE_URL = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&q=80';

// Custom hamburger icon — 3 badi lines
const HamburgerIcon = () => (
  <svg width="32" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="0"    width="32" height="2.8" rx="1.4" fill="white" />
    <rect y="9.6"  width="32" height="2.8" rx="1.4" fill="white" />
    <rect y="19.2" width="32" height="2.8" rx="1.4" fill="white" />
  </svg>
);

const Navbar = () => {
  const navRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const overlayCallbackRef = (node) => {
    if (!node) return;
    gsap.fromTo(
      node,
      { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
      { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 0.65, ease: 'power4.inOut' }
    );
  };

  const handleLetsTalk = () => {
    setIsOpen(false);
    setTimeout(() => {
      const footer = document.querySelector('footer');
      if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    }, 350);
  };

  return (
    <>
      <header ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo: sirf image, koi text nahi */}
          <div className="flex items-center">
            <img
              src= "/images/logo.png"
              alt="Logo"
              className="w-11 h-11 rounded-[10px] object-cover"
              style={{ boxShadow: '0 0 20px rgba(100,116,139,0.35)' }}
            />
          </div>

          {/* Hamburger / Close button */}
          <button
            className="z-[60] relative bg-transparent border-0 cursor-pointer flex items-center"
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={32} strokeWidth={2.2} color="white" /> : <HamburgerIcon />}
          </button>
        </div>
      </header>

      {isOpen && (
        <div ref={overlayCallbackRef} className="fixed inset-0 z-40 flex flex-col">
          <div className="h-20 flex-shrink-0" style={{ backgroundColor: '#120F17' }} />

          <div className="flex-1 min-h-0">
            <FlowingMenu
              items={NAV_ITEMS}
              speed={18}
              textColor="#fff"
              bgColor="#120F17"
              marqueeBgColor="#fff"
              marqueeTextColor="#120F17"
              borderColor="rgba(255,255,255,0.1)"
            />
          </div>

          <div
            className="flex-shrink-0 px-8 py-6 flex items-center justify-between border-t"
            style={{ backgroundColor: '#120F17', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <span className="text-secondary text-sm">Ready to build something great?</span>
            <button
              onClick={handleLetsTalk}
              className="px-6 py-2.5 rounded-full bg-white text-black font-medium text-sm hover:bg-gray-200 transition-colors tracking-widest uppercase"
            >
              Let's Talk
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;