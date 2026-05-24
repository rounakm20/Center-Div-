import React, { useEffect, useRef, useState } from 'react';
import {
  Globe, Code2, ShieldCheck, BookOpen, Headphones, Clock,
  Sparkles, Zap, RefreshCw, Wrench, BarChart2, Search,
  Utensils, Rocket, Stethoscope, Dumbbell, Store, Video,
  Building2, GraduationCap, ArrowUpRight
} from 'lucide-react';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600&family=Instrument+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');`;
const KF = `
@keyframes revealY { from{transform:translateY(110%);opacity:0} to{transform:translateY(0);opacity:1} }
.card-item .icon-circle { background:#e8e2d8; transition:background 0.25s; }
.card-item:hover .icon-circle { background:#1a1a1a; }
.card-item .icon-circle svg { transition:color 0.25s; }
.card-item:hover .icon-circle svg { color:#f5f0e8 !important; stroke:#f5f0e8 !important; }
`;

const deliverables = [
  { Icon:Globe,       n:'01', label:'Live Website',     body:'Deployed on day one. SSL-secured, globally distributed, zero cold-starts. Your site is live before we say goodbye.',    stat:'99.9%', sub:'Uptime SLA' },
  { Icon:Code2,       n:'02', label:'Source Code',      body:'Every file, every commit — handed over in a clean GitHub repo. SOLID principles, documented, forever yours.',           stat:'100%',  sub:'Ownership' },
  { Icon:ShieldCheck, n:'03', label:'Admin Access',     body:'Full CMS panel with role-based permissions and 2FA. Edit any text, image, or page in under sixty seconds.',             stat:'<60s',  sub:'Edit Cycle' },
  { Icon:BookOpen,    n:'04', label:'Documentation',    body:'Human-readable guides in PDF, web, and video formats. Searchable, versioned, kept up to date with your codebase.',      stat:'3',     sub:'Formats' },
  { Icon:Headphones,  n:'05', label:'Training Session', body:'A live Zoom walkthrough plus a recorded Loom your whole team can rewatch anytime. Custom cheat sheet included.',        stat:'2 hrs', sub:'Dedicated' },
  { Icon:Clock,       n:'06', label:'30-Day Support',   body:'A full month of post-launch coverage. Bug fixes, edge cases, hotfixes — all handled at zero extra cost.',              stat:'30',    sub:'Days Covered' },
];

const addons = [
  { Icon:Sparkles,  label:'Free Consultation',  body:"A strategy call before we write a single line of code. No pitch — just honest advice on what will actually work for you." },
  { Icon:Zap,       label:'Fast Delivery',       body:"7–14 day sprints for most projects. We don't pad timelines to look busier than we are." },
  { Icon:RefreshCw, label:'Unlimited Revisions', body:"We iterate until it's exactly what you pictured. Scope stays fixed; quality has no ceiling." },
  { Icon:Wrench,    label:'Monthly Maintenance', body:'Ongoing updates, backups, and uptime monitoring bundled into one predictable monthly retainer.' },
  { Icon:Search,    label:'SEO Audit',           body:'Full site crawl, a prioritised fix report, and hands-on implementation so search engines find you.' },
  { Icon:BarChart2, label:'Analytics Reports',   body:"Monthly breakdowns of what's converting, what's bouncing, and what to fix next — in your inbox." },
];

const specialties = [
  { label:'Portfolio & Agency Sites',  body:'First impressions that convert visitors into clients.' },
  { label:'Startup Landing Pages',     body:'Launch fast, validate faster, iterate without fear.' },
  { label:'Small Business Websites',   body:'Your best salesperson — works 24/7, no sick days.' },
  { label:'Dashboards & Data Tools',   body:'Complex data made scannable, beautiful, and useful.' },
  { label:'Internal Tooling',          body:'Workflows automated so your team stops context-switching.' },
  { label:'Utility & File-Share Apps', body:'Purpose-built software with zero unnecessary bloat.' },
];

const niches = [
  { Icon:Utensils,      label:'Restaurants' },
  { Icon:Rocket,        label:'Startups' },
  { Icon:Stethoscope,   label:'Clinics' },
  { Icon:Dumbbell,      label:'Gyms' },
  { Icon:Store,         label:'Local Business' },
  { Icon:Video,         label:'Creators' },
  { Icon:Building2,     label:'Real Estate' },
  { Icon:GraduationCap, label:'Schools' },
];



function Cursor() {
  const ringRef = useRef(null);
  const dotRef  = useRef(null);
  const bigRef  = useRef(false);
  useEffect(() => {
    let tx=-300,ty=-300,cx=-300,cy=-300,raf;
    const lerp=(a,b,t)=>a+(b-a)*t;
    const tick=()=>{ cx=lerp(cx,tx,0.12);cy=lerp(cy,ty,0.12); if(ringRef.current)ringRef.current.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`; raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick);
    const move=e=>{ tx=e.clientX;ty=e.clientY; if(dotRef.current)dotRef.current.style.transform=`translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`; };
    const over=e=>{ const h=!!e.target.closest('a,button,[data-h]'); if(h!==bigRef.current){bigRef.current=h; if(ringRef.current){ringRef.current.style.width=h?'72px':'36px';ringRef.current.style.height=h?'72px':'36px';}} };
    window.addEventListener('mousemove',move,{passive:true});
    window.addEventListener('mouseover',over,{passive:true});
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('mousemove',move);window.removeEventListener('mouseover',over);};
  },[]);
  return(<><div ref={ringRef} style={{position:'fixed',top:0,left:0,pointerEvents:'none',zIndex:99999,width:'36px',height:'36px',borderRadius:'50%',background:'#fff',mixBlendMode:'difference',transition:'width 0.3s cubic-bezier(0.16,1,0.3,1),height 0.3s cubic-bezier(0.16,1,0.3,1)'}}/><div ref={dotRef} style={{position:'fixed',top:0,left:0,pointerEvents:'none',zIndex:100000,width:'5px',height:'5px',borderRadius:'50%',background:'#fff',mixBlendMode:'difference'}}/></>);
}

function useInView(ref,thr=0.08){
  const [v,setV]=useState(false);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true);},{threshold:thr});
    if(ref.current)o.observe(ref.current);
    return()=>o.disconnect();
  },[]);
  return v;
}

const CARD_W=300, CARD_GAP=20;

function CardStrip(){
  const outerRef=useRef(null);
  const trackRef=useRef(null);
  const counterRef=useRef(null);
  const barRef=useRef(null);
  const [sectionH,setSectionH]=useState(4000);

  useEffect(()=>{
    const compute=()=>{
      const vw=window.innerWidth;
      const vh=window.innerHeight;
      const totalW=deliverables.length*(CARD_W+CARD_GAP);
      const maxShift=Math.max(0,totalW-(vw*0.93));
      setSectionH(maxShift+vh);
    };
    compute();
    window.addEventListener('resize',compute);
    return()=>window.removeEventListener('resize',compute);
  },[]);

  useEffect(()=>{
    const onScroll=()=>{
      const outer=outerRef.current;
      if(!outer)return;
      const vw=window.innerWidth;
      const totalW=deliverables.length*(CARD_W+CARD_GAP);
      const maxShift=Math.max(0,totalW-(vw*0.93));
      const sectionTop=outer.offsetTop;
      const scrolled=window.scrollY-sectionTop;
      const shift=Math.min(maxShift,Math.max(0,scrolled));
      const p=maxShift>0?shift/maxShift:0;
      if(trackRef.current)trackRef.current.style.transform=`translateX(${-shift}px)`;
      if(barRef.current)barRef.current.style.width=`${p*100}%`;
      if(counterRef.current){
        const idx=Math.min(deliverables.length-1,Math.floor(p*deliverables.length));
        counterRef.current.textContent=`${String(idx+1).padStart(2,'0')} — ${String(deliverables.length).padStart(2,'0')}`;
      }
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();
    return()=>window.removeEventListener('scroll',onScroll);
  },[sectionH]);

  return(
    <div ref={outerRef} style={{position:'relative',height:`${sectionH}px`}}>
      <div style={{position:'sticky',top:0,height:'100vh',overflow:'hidden',display:'flex',flexDirection:'column',justifyContent:'center',background:'#0a0a0a'}}>
        <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',padding:'0 7vw',marginBottom:'32px'}}>
          <span ref={counterRef} style={{fontFamily:"'Space Mono',monospace",fontSize:'10px',color:'#ffffff',letterSpacing:'2px'}}>01 — 06</span>
        </div>

        <div ref={trackRef} style={{display:'flex',gap:`${CARD_GAP}px`,paddingLeft:'7vw',willChange:'transform'}}>
          {deliverables.map(({Icon,n,label,body,stat,sub},i)=>(
            <div key={i} className="card-item" data-h style={{
              flexShrink:0, width:`${CARD_W}px`, height:'400px', boxSizing:'border-box',
              background:'#f5f0e8',
              border:'1px solid #e0d8cc',
              borderRadius:'20px', padding:'34px 30px',
              position:'relative', overflow:'hidden', cursor:'none',
            }}>
              <span style={{position:'absolute',bottom:'-8px',right:'16px',fontFamily:"'Cormorant Garamond',serif",fontSize:'120px',fontWeight:700,lineHeight:1,color:'rgba(0,0,0,0.05)',userSelect:'none',pointerEvents:'none'}}>{n}</span>

              <div className="icon-circle" style={{width:'40px',height:'40px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'24px',margin:'0 auto 24px'}}>
                <Icon size={17} color="#8a7f72" />
              </div>

              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',fontWeight:600,color:'#1a1714',margin:'0 0 10px',lineHeight:1.15,letterSpacing:'-0.3px',textAlign:'center'}}>{label}</p>
              <p style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:'13px',fontWeight:400,color:'#7a7068',lineHeight:1.85,margin:0,textAlign:'center'}}>{body}</p>

              <div style={{position:'absolute',bottom:'28px',left:'30px',right:'30px',borderTop:'1px solid #ddd6cc',paddingTop:'14px',display:'flex',justifyContent:'center',alignItems:'flex-end',gap:'16px'}}>
                <div style={{textAlign:'center'}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:'18px',fontWeight:700,color:'#1a1714',lineHeight:1}}>{stat}</div>
                  <div style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:'10px',color:'#a89f95',letterSpacing:'1.5px',textTransform:'uppercase',marginTop:'4px'}}>{sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{padding:'28px 7vw 0'}}>
          <div style={{height:'1px',background:'#1e1e1e',position:'relative'}}>
            <div ref={barRef} style={{position:'absolute',left:0,top:0,height:'1px',background:'#555',width:'0%'}}/>
          </div>
        </div>
      </div>
    </div>
  );
}



export default function WhatYouGet(){
  const splitRef=useRef(null);const splitVis=useInView(splitRef);
  const nicheRef=useRef(null);const nicheVis=useInView(nicheRef);

  return(
    <section 
     id="what-you-get"
     style={{background:'#0a0a0a',cursor:'none',overflow:'clip'}}>
      <style>{FONTS+KF}</style>
      <Cursor/>

      {/* Hero */}
      <div style={{padding:'130px 7vw 90px',borderBottom:'1px solid #1a1a1a',textAlign:'center'}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(60px,8.5vw,128px)',fontWeight:600,color:'#fff',lineHeight:0.95,letterSpacing:'-3px',margin:'0 0 12px'}}>Built to ship.</h1>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(60px,8.5vw,128px)',fontWeight:300,fontStyle:'italic',color:'#ffffff',lineHeight:0.95,letterSpacing:'-3px',margin:'0 0 48px'}}>Built to last.</h1>
        <p style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:'clamp(14px,1.3vw,17px)',fontWeight:400,color:'#ffffff',maxWidth:'500px',lineHeight:1.85,margin:'0 auto'}}>
          Every engagement ends with a complete handoff — live site, clean code, admin access, and documentation. No half-measures, no excuses.
        </p>
      </div>

      <CardStrip/>

      {/* Split */}
      <div ref={splitRef} style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
        <div style={{padding:'100px 5vw 100px 7vw',borderRight:'1px solid #1a1a1a'}}>
          <p style={{fontFamily:"'Space Mono',monospace",fontSize:'10px',letterSpacing:'4px',color:'#ffffff',textTransform:'uppercase',margin:'0 0 16px',display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={{width:'20px',height:'1px',background:'#ffffff',display:'inline-block'}}/> Why us
          </p>
          <div style={{overflow:'hidden',marginBottom:'52px'}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(32px,3.5vw,52px)',fontWeight:600,color:'#fff',margin:0,lineHeight:1.05,letterSpacing:'-1px',textAlign:'center',animation:splitVis?'revealY 0.85s cubic-bezier(0.16,1,0.3,1) forwards':'none',opacity:splitVis?1:0}}>
              The difference is in the details.
            </h2>
          </div>
          {addons.map(({Icon,label,body},i)=>(
            <div key={i} data-h style={{display:'flex',gap:'18px',alignItems:'flex-start',padding:'22px 0',borderBottom:'1px solid #161616',opacity:splitVis?1:0,transform:splitVis?'translateX(0)':'translateX(-20px)',transition:`opacity 0.6s ease ${0.08+i*0.08}s,transform 0.6s cubic-bezier(0.16,1,0.3,1) ${0.08+i*0.08}s`,cursor:'none'}}>
              <div style={{width:'34px',height:'34px',borderRadius:'9px',border:'1px solid #1e1e1e',background:'#0f0f0f',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'2px'}}><Icon size={14} color="#ffffff"/></div>
              <div>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(17px,1.5vw,21px)',fontWeight:600,color:'#ffffff',margin:'0 0 5px',lineHeight:1.2,letterSpacing:'-0.2px'}}>{label}</p>
                <p style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:'13px',color:'#ffffff',lineHeight:1.8,margin:0}}>{body}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:'100px 7vw 100px 5vw',background:'#0d0d0d'}}>
          <p style={{fontFamily:"'Space Mono',monospace",fontSize:'10px',letterSpacing:'4px',color:'#ffffff',textTransform:'uppercase',margin:'0 0 16px',display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={{width:'20px',height:'1px',background:'#ffffff',display:'inline-block'}}/> Our specialties
          </p>
          <div style={{overflow:'hidden',marginBottom:'44px'}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(32px,3.5vw,52px)',fontWeight:600,color:'#fff',margin:0,lineHeight:1.05,letterSpacing:'-1px',textAlign:'center',animation:splitVis?'revealY 0.85s cubic-bezier(0.16,1,0.3,1) 0.1s forwards':'none',opacity:splitVis?1:0}}>
              We build things that work.
            </h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'1px',background:'#1a1a1a'}}>
            {specialties.map(({label,body},i)=>(
              <div key={i} data-h style={{background:'#0d0d0d',padding:'26px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'16px',opacity:splitVis?1:0,transform:splitVis?'translateY(0)':'translateY(14px)',transition:`opacity 0.5s ease ${0.12+i*0.07}s,transform 0.5s cubic-bezier(0.16,1,0.3,1) ${0.12+i*0.07}s,background 0.18s`,cursor:'none'}}
                onMouseEnter={e=>e.currentTarget.style.background='#121212'}
                onMouseLeave={e=>e.currentTarget.style.background='#0d0d0d'}
              >
                <div>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(15px,1.4vw,19px)',fontWeight:600,color:'#ffffff',margin:'0 0 4px',letterSpacing:'-0.2px',lineHeight:1.2}}>{label}</p>
                  <p style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:'12px',color:'#ffffff',margin:0,lineHeight:1.6}}>{body}</p>
                </div>
                <ArrowUpRight size={14} color="#ffffff" style={{flexShrink:0}}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Niches */}
      <div ref={nicheRef} style={{padding:'100px 7vw',borderTop:'1px solid #1a1a1a'}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',marginBottom:'56px',gap:'20px'}}>
          <div style={{overflow:'hidden'}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(34px,4.5vw,68px)',fontWeight:600,color:'#fff',margin:0,lineHeight:1.0,letterSpacing:'-1.5px',animation:nicheVis?'revealY 0.9s cubic-bezier(0.16,1,0.3,1) forwards':'none',opacity:nicheVis?1:0}}>
              We know your world.
            </h2>
          </div>
          <p style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:'14px',color:'#ffffff',maxWidth:'300px',lineHeight:1.8,margin:0}}>
            We've shipped for every kind of business. Whoever you are, we've solved problems like yours.
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',background:'#1a1a1a'}}>
          {niches.map(({Icon,label},i)=>(
            <div key={i} data-h style={{background:'#0a0a0a',padding:'38px 28px',display:'flex',flexDirection:'column',gap:'14px',opacity:nicheVis?1:0,transform:nicheVis?'scale(1)':'scale(0.96)',transition:`opacity 0.5s ease ${i*0.05}s,transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i*0.05}s,background 0.18s`,cursor:'none'}}
              onMouseEnter={e=>e.currentTarget.style.background='#0f0f0f'}
              onMouseLeave={e=>e.currentTarget.style.background='#0a0a0a'}
            >
              <div style={{width:'36px',height:'36px',borderRadius:'9px',border:'1px solid #1e1e1e',background:'#111',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon size={15} color="#ffffff"/></div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'19px',fontWeight:600,color:'#ffffff',margin:0,lineHeight:1.2,letterSpacing:'-0.2px'}}>{label}</p>
            </div>
          ))}
        </div>
      </div>


    </section>
  );
}