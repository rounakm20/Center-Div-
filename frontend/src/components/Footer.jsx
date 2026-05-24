import { useState } from "react";

const WHITE = "#ffffff";
const BEIGE = "#f0ede6";
const ACCENT = "#c8ff00";
const MUTED = "#444";
const BORDER = "#1e1e1e";
const BG = "#080808";

const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.428.403a4.9 4.9 0 0 1 1.772 1.153 4.9 4.9 0 0 1 1.153 1.772c.163.458.35 1.258.403 2.428.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.428a4.9 4.9 0 0 1-1.153 1.772 4.9 4.9 0 0 1-1.772 1.153c-.458.163-1.258.35-2.428.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.428-.403a4.9 4.9 0 0 1-1.772-1.153 4.9 4.9 0 0 1-1.153-1.772c-.163-.458-.35-1.258-.403-2.428C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.428A4.9 4.9 0 0 1 3.79 2.95a4.9 4.9 0 0 1 1.772-1.153c.458-.163 1.258-.35 2.428-.403C9.416 2.175 9.796 2.163 12 2.163zm0-2.163C8.756 0 8.332.013 7.052.072 5.775.131 4.902.333 4.14.63a7.07 7.07 0 0 0-2.555 1.664A7.07 7.07 0 0 0 .63 4.14C.333 4.902.131 5.775.072 7.052.013 8.332 0 8.756 0 12c0 3.244.013 3.668.072 4.948.059 1.277.261 2.15.558 2.912a7.07 7.07 0 0 0 1.664 2.555 7.07 7.07 0 0 0 2.555 1.664c.762.297 1.635.499 2.912.558C8.332 23.987 8.756 24 12 24s3.668-.013 4.948-.072c1.277-.059 2.15-.261 2.912-.558a7.07 7.07 0 0 0 2.555-1.664 7.07 7.07 0 0 0 1.664-2.555c.297-.762.499-1.635.558-2.912.059-1.28.072-1.704.072-4.948s-.013-3.668-.072-4.948c-.059-1.277-.261-2.15-.558-2.912a7.07 7.07 0 0 0-1.664-2.555A7.07 7.07 0 0 0 19.86.63C19.098.333 18.225.131 16.948.072 15.668.013 15.244 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452H16.89v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a1.98 1.98 0 0 1-1.98-1.98c0-1.093.887-1.98 1.98-1.98s1.98.887 1.98 1.98a1.98 1.98 0 0 1-1.98 1.98zm1.961 13.019H3.374V9h3.924v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const BehanceIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029H23.726zm-7.726-3h3.578c-.105-1.547-1.136-2.219-1.845-2.219-.95 0-1.605.624-1.733 2.219zM7.386 13c.396-.785.596-1.656.534-2.654C7.78 7.096 5.824 6 3 6H0v12h3.78C6.498 18 8.357 16.462 7.386 13zm-5.386-.756V8.756H3c1.296 0 2.614.444 2.614 1.958 0 1.485-1.101 1.529-2.614 1.529H2zm0 1.512H3c1.766 0 3.614.099 3.614 2.006C6.614 17.499 4.728 18 3 18H2v-4.244z" />
  </svg>
);

function SocialBtn({ icon: Icon, label, href = "#" }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        placeItems: "center",
        width: 34,
        height: 34,
        borderRadius: "50%",
        border: `1px solid ${hovered ? WHITE : BORDER}`,
        color: hovered ? WHITE : MUTED,
        textDecoration: "none",
        transition: "color 0.22s, border-color 0.22s, transform 0.22s",
        transform: hovered ? "translateY(-3px) scale(1.1)" : "translateY(0) scale(1)",
        background: "transparent",
        flexShrink: 0,
      }}
    >
      <Icon />
    </a>
  );
}

export default function AgencyFooter() {
  const [emailHovered, setEmailHovered] = useState(false);
  const navLinks = ["Work", "Services", "About"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: ${BG}; }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes revealIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .f-headline {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(56px, 8vw, 120px);
          line-height: 0.92;
          letter-spacing: -1px;
          display: flex;
          flex-wrap: wrap;
          gap: 0 18px;
          animation: slideUp 0.8s cubic-bezier(.16,1,.3,1) both;
        }

        .f-outline {
          -webkit-text-stroke: 1.5px ${BEIGE};
          color: transparent;
          transition: color 0.3s, -webkit-text-stroke 0.3s;
        }
        .f-outline:hover {
          color: ${ACCENT};
          -webkit-text-stroke: 1.5px ${ACCENT};
        }

        .f-r1 { opacity:0; animation: revealIn 0.6s cubic-bezier(.16,1,.3,1) 0.1s forwards; }
        .f-r2 { opacity:0; animation: revealIn 0.6s cubic-bezier(.16,1,.3,1) 0.22s forwards; }
        .f-r3 { opacity:0; animation: revealIn 0.6s cubic-bezier(.16,1,.3,1) 0.34s forwards; }

        .fnav-link {
          color: ${MUTED};
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .fnav-link:hover { color: ${BEIGE}; }
      `}</style>

      <footer style={{
        width: "100%",
        background: BG,
        borderTop: `1px solid ${BORDER}`,
        padding: "32px 44px 20px",
        fontFamily: "'DM Sans', sans-serif",
        color: BEIGE,
        position: "relative",
        overflow: "hidden",
      }}>

        {/* noise */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.3,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }} />

        {/* ── ROW 1: Headline + Socials ── */}
        <div style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 24, gap: 20, flexWrap: "wrap",
          position: "relative",
        }}>
          <div style={{ overflow: "hidden" }}>
            <div className="f-headline">
              <span style={{ color: BEIGE }}>LET'S</span>
              <span className="f-outline">BUILD</span>
              <span style={{ color: BEIGE }}>SOMETHING<span style={{ color: ACCENT }}>.</span></span>
            </div>
          </div>

          <div className="f-r1" style={{
            display: "flex", flexDirection: "column",
            alignItems: "flex-end", gap: 8, marginLeft: "auto",
          }}>
            <span style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED }}>
              Follow us
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <SocialBtn icon={InstagramIcon} label="Instagram" />
              <SocialBtn icon={LinkedInIcon}  label="LinkedIn" />
              <SocialBtn icon={XIcon}         label="X (Twitter)" />
              <SocialBtn icon={BehanceIcon}   label="Behance" />
            </div>
          </div>
        </div>

        {/* ── ROW 2: Email + Nav ── */}
        <div className="f-r2" style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 16,
          borderTop: `1px solid ${BORDER}`,
          gap: 16, flexWrap: "wrap",
          position: "relative",
        }}>
          <a
            href="mailto:centrediv.studios@gmail.com"
            onMouseEnter={() => setEmailHovered(true)}
            onMouseLeave={() => setEmailHovered(false)}
            style={{
              color: BEIGE, textDecoration: "none",
              fontSize: 12, fontWeight: 300, letterSpacing: "0.04em",
              position: "relative", display: "inline-block",
            }}
          >
            centrediv.studios@gmail.com
            <span style={{
              position: "absolute", bottom: -2, left: 0,
              height: 1, background: ACCENT, display: "block",
              width: emailHovered ? "100%" : "0%",
              transition: "width 0.3s ease",
            }} />
          </a>

          <nav style={{ display: "flex", gap: 22, marginLeft: "auto" }}>
            {navLinks.map(link => (
              <a key={link} href="#" className="fnav-link">{link}</a>
            ))}
          </nav>
        </div>

        {/* ── ROW 3: Made with love ── */}
        <div className="f-r3" style={{
          display: "flex", justifyContent: "center",
          paddingTop: 14, position: "relative",
        }}>
          <p style={{
            fontSize: 10, color: "#333",
            letterSpacing: "0.12em", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            Made with <span style={{ color: "#c0392b", fontSize: 12 }}>♥</span> in India
          </p>
        </div>

      </footer>
    </>
  );
}