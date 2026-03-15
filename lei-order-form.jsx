import { useState, useMemo, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── SUPABASE CLIENT ──────────────────────────────────────────────────────────
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify environment variables
const _SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const _SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = _SUPABASE_URL && _SUPABASE_KEY
  ? createClient(_SUPABASE_URL, _SUPABASE_KEY)
  : null;

// ── LEI GALLERY IMAGES ──────────────────────────────────────────────────────


// ── LOADING ANIMATION ────────────────────────────────────────────────────────
const LOADER_COLORS = ["#EE1111","#FF8000","#FFE000","#00A832","#1148CC","#8B00CC","#E91E8C","#FF6B6B","#FFD166","#2EC4B6","#C9A7EB","#FF4500"];
const LOADER_CSS = `
@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes spinReverse { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
@keyframes pulseGlow { 0%,100%{opacity:0.7;filter:blur(40px)} 50%{opacity:1;filter:blur(60px)} }
@keyframes fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
@keyframes petalExplode { 0%{transform:translate(0,0) rotate(0deg) scale(1);opacity:1} 100%{transform:translate(var(--dx),var(--dy)) rotate(var(--dr)) scale(0);opacity:0} }
@keyframes textPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
@keyframes curtainFade { 0%{opacity:1} 100%{opacity:0} }
@keyframes starFloat { 0%{transform:translate(0,0) scale(0);opacity:0} 40%{opacity:1;transform:translate(var(--sx),var(--sy)) scale(1)} 100%{transform:translate(var(--sx2),var(--sy2)) scale(0);opacity:0} }
@keyframes ringPulse { 0%{transform:scale(0.6);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
@keyframes subtitleFade { 0%{opacity:0;letter-spacing:8px} 100%{opacity:1;letter-spacing:4px} }
`;

function LoadingScreen({ onDone }) {
  const [phase, setPhase] = useState(0);
  // 0=building, 1=fullLei, 2=text, 3=explode, 4=fadeOut
  const [colorCount, setColorCount] = useState(2);
  const [showMoney, setShowMoney] = useState(false);
  const [showBeads, setShowBeads] = useState(false);
  const [showLeather, setShowLeather] = useState(false);
  const [explodePetals, setExplodePetals] = useState([]);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setColorCount(4), 140),
      setTimeout(() => setColorCount(7), 315),
      setTimeout(() => setColorCount(12), 490),
      setTimeout(() => setShowMoney(true), 700),
      setTimeout(() => {
        setPhase(3);
        // Generate explosion vectors for each petal
        const petals = Array.from({length: 36}, (_, i) => {
          const angle = (i / 36) * Math.PI * 2;
          const dist = 200 + Math.random() * 300;
          return {
            id: i,
            dx: Math.cos(angle) * dist,
            dy: Math.sin(angle) * dist,
            dr: (Math.random() - 0.5) * 720,
            color: LOADER_COLORS[i % LOADER_COLORS.length],
          };
        });
        setExplodePetals(petals);
      }, 1800),
      setTimeout(() => setFadeOut(true), 2200),
      setTimeout(() => onDone(), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const W = 300, H = 300;
  const cx = 150, cy = 150, R = 100;
  const PETAL_COUNT = 36;
  const petals = Array.from({length: PETAL_COUNT}, (_, i) => {
    const angle = (i / PETAL_COUNT) * Math.PI * 2;
    const x = cx + Math.cos(angle) * R;
    const y = cy + Math.sin(angle) * R;
    const deg = (angle * 180 / Math.PI) + 90;
    const color = LOADER_COLORS[i % colorCount];
    const visible = true;
    return { x, y, deg, color, visible, id: i };
  });

  const beadPositions = petals.filter((_, i) => i % 4 === 0);
  const leatherPositions = petals.filter((_, i) => i % 6 === 2);
  const moneyPositions = petals.filter((_, i) => i % 9 === 0);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#0a0208",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      opacity: fadeOut ? 0 : 1,
      transition: fadeOut ? "opacity 0.8s ease-in" : "none",
    }}>
      <style>{LOADER_CSS}</style>

      {/* Deep bg gradient layers */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 50%, #1a0520 0%, #0a0208 60%, #000 100%)"}}/>

      {/* Animated color orbs */}
      {["#EE1111","#FFD166","#8B00CC","#00A832","#1148CC","#E91E8C"].map((c,i) => (
        <div key={i} style={{
          position:"absolute",
          width: 300 + i*80, height: 300 + i*80,
          borderRadius:"50%",
          background: `radial-gradient(circle, ${c}22 0%, transparent 70%)`,
          left:`${10 + i*13}%`, top:`${5 + i*11}%`,
          animation:`pulseGlow ${2.5 + i*0.4}s ease-in-out infinite`,
          animationDelay:`${i*0.3}s`,
        }}/>
      ))}

      {/* Sparkle stars */}
      {Array.from({length:20},(_,i) => {
        const sx = (Math.random()-0.5)*600, sy = (Math.random()-0.5)*600;
        const sx2 = sx + (Math.random()-0.5)*200, sy2 = sy - 100 - Math.random()*200;
        return (
          <div key={i} style={{
            position:"absolute", width:4, height:4, borderRadius:"50%",
            background:"white", left:"50%", top:"50%",
            "--sx":`${sx}px`,"--sy":`${sy}px`,"--sx2":`${sx2}px`,"--sy2":`${sy2}px`,
            animation:`starFloat ${2+Math.random()*3}s ease-out infinite`,
            animationDelay:`${Math.random()*4}s`,
            opacity:0,
          }}/>
        );
      })}

      {/* Pulse rings */}
      {[0,1,2].map(i => (
        <div key={i} style={{
          position:"absolute", width:200, height:200, borderRadius:"50%",
          border:"1px solid rgba(255,210,100,0.3)",
          left:"50%",top:"50%",marginLeft:-100,marginTop:-100,
          animation:`ringPulse 2s ease-out infinite`,
          animationDelay:`${i*0.65}s`,
          pointerEvents:"none",
        }}/>
      ))}

      {/* ── LEI SVG — shifted up 20px ── */}
      <div style={{transform:"translateY(-20px)"}}>
      <div style={{
        position: "relative",
        animation: phase < 3 ? `spin ${phase >= 1 ? "1.2s" : "2.5s"} linear infinite` : "none",
        filter: phase >= 1 ? "drop-shadow(0 0 30px rgba(255,210,80,0.8)) drop-shadow(0 0 60px rgba(255,100,200,0.5))" : "drop-shadow(0 0 16px rgba(255,200,80,0.4))",
        transition: "filter 0.6s",
      }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD166" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#FFD166" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(180,140,60,0.25)" strokeWidth="16"/>
          <circle cx={cx} cy={cy} r={R+2} fill="url(#centerGlow)"/>

          {phase < 3 && petals.map(p => (
            <g key={p.id} transform={`translate(${p.x},${p.y}) rotate(${p.deg})`}
              style={{transition:`opacity 0.3s, fill 0.4s`}}>
              <ellipse rx="10" ry="16" fill={p.color} stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" opacity="0.95"/>
              <ellipse rx="4.5" ry="8" cy="-3" fill="rgba(255,255,255,0.22)"/>
            </g>
          ))}

          {/* Beads */}
          {showBeads && phase < 3 && beadPositions.map((p,i) => (
            <circle key={i} cx={p.x} cy={p.y} r="7"
              fill={LOADER_COLORS[(i*3)%12]} stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"
              style={{filter:"drop-shadow(0 0 4px rgba(255,255,255,0.6))"}}/>
          ))}

          {/* Leather */}
          {showLeather && phase < 3 && leatherPositions.map((p,i) => {
            const angle = (((p.id / PETAL_COUNT) * 360) + 90) * Math.PI/180;
            return (
              <g key={i} transform={`translate(${p.x},${p.y}) rotate(${p.deg})`}>
                <rect x="-5" y="-14" width="10" height="18" rx="2" fill="#7B3F10" stroke="#4a2008" strokeWidth="0.7"/>
              </g>
            );
          })}

          {/* Money */}
          {showMoney && phase < 3 && moneyPositions.map((p,i) => (
            <g key={i} transform={`translate(${p.x},${p.y}) rotate(${p.deg})`}>
              <rect x="-11" y="-7" width="22" height="14" rx="2" fill="#85BB65" stroke="#3e7a28" strokeWidth="0.8"/>
              <text textAnchor="middle" dy="5" fontSize="8" fill="#1a3d08" fontWeight="800" fontFamily="monospace">$20</text>
            </g>
          ))}

        </svg>
      </div>
      </div>{/* end lei shift wrapper */}

      {/* Explosion petals */}
      {phase === 3 && explodePetals.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:"50%", top:"50%",
          width:20, height:30, marginLeft:-10, marginTop:-15,
          borderRadius:"50%",
          background: p.color,
          "--dx":`${p.dx}px`, "--dy":`${p.dy}px`, "--dr":`${p.dr}deg`,
          animation:"petalExplode 0.9s cubic-bezier(0.2,0,0.8,1) forwards",
          boxShadow:`0 0 12px ${p.color}`,
        }}/>
      ))}

      {/* Text reveal — shifted up 20px to match lei */}
      {phase >= 1 && phase < 3 && (
        <div style={{
          position:"absolute", bottom:"18%", textAlign:"center",
          transform:"translateY(-20px)",
          animation:"fadeInUp 0.7s ease-out both",
        }}>
          <div style={{
            fontSize:"clamp(40px,8vw,72px)",
            fontFamily:"'Georgia',serif",
            fontWeight:"900",
            letterSpacing:"6px",
            background:"linear-gradient(135deg, #FFD166 0%, #ff9f43 35%, #ee5a24 55%, #FFD166 80%, #ffeaa7 100%)",
            backgroundSize:"200% auto",
            WebkitBackgroundClip:"text",
            WebkitTextFillColor:"transparent",
            backgroundClip:"text",
            animation:"shimmer 2s linear infinite",
            textTransform:"uppercase",
            filter:"drop-shadow(0 0 30px rgba(255,210,80,0.6))",
          }} className="loader-title">
            Buttons & Leis
          </div>
          <div className="loader-subtitle" style={{
            color:"rgba(255,220,150,0.75)",
            fontSize:"clamp(12px,2vw,16px)",
            letterSpacing:"4px",
            fontFamily:"sans-serif",
            marginTop:"10px",
            textTransform:"uppercase",
            animation:"subtitleFade 0.9s ease-out 0.3s both",
          }}>
            Handmade · Custom · With Love
          </div>
        </div>
      )}

      {/* Burst flash on explode */}
      {phase === 3 && (
        <div style={{
          position:"absolute",inset:0,
          background:"radial-gradient(circle, rgba(255,240,180,0.9) 0%, transparent 60%)",
          animation:"curtainFade 0.5s ease-out forwards",
          pointerEvents:"none",
        }}/>
      )}
    </div>
  );
}


const LEI_TIERS = [
  { key: 'classic', label: 'Classic Lei', price: 35, description: "Braided ribbon, 2-strand color, recipient's name & year" },
  { key: 'decorative', label: 'Decorative Lei', price: 45, description: "Pinwheel/scrunchie ribbon, 2-strand color, recipient's name & year" },
  { key: 'money', label: 'Decorative Money Lei', price: 65, description: 'Includes 20 × $1 bills — amount cannot be modified' },
];
const BUTTON_PRICE = 5;
const SHIPPING_PRICE = 12.65;

// ── Stripe Payment Links ─────────────────────────────────────────────────────
// 14 product+fulfillment combos × 3 quantities = 42 links
// Key format: {tier}[_button]_{ship|pickup}_q{1|2|3}
const STRIPE_LINKS = {
  // ── Q1 (14 links) ──
  button_ship_q1:              "https://buy.stripe.com/4gM7sE3ka72R1bCcMh8so00",
  button_pickup_q1:            "https://buy.stripe.com/6oU9AM6wm0Et3jK4fL8so01",
  money_ship_q1:               "https://buy.stripe.com/5kQ3cog6WgDr8E49A58so02",
  money_button_ship_q1:        "https://buy.stripe.com/aFa00c6wmbj7cUk9A58so0o",
  money_pickup_q1:             "https://buy.stripe.com/7sY28kcUKgDr3jK3bH8so03",
  money_button_pickup_q1:      "https://buy.stripe.com/fZu4gs7Aqaf3bQg7rX8so0p",
  classic_ship_q1:             "https://buy.stripe.com/8x228k1c2bj76vW4fL8so04",
  classic_button_ship_q1:      "https://buy.stripe.com/7sY5kw07Y86V1bC9A58so0q",
  classic_pickup_q1:           "https://buy.stripe.com/dRm8wIcUK2MB5rS9A58so05",
  classic_button_pickup_q1:    "https://buy.stripe.com/aFaaEQ6wmgDrg6w4fL8so0r",
  decorative_ship_q1:          "https://buy.stripe.com/fZufZa5sibj7dYofYt8so06",
  decorative_button_ship_q1:   "https://buy.stripe.com/9B69AM5sifzn5rS7rX8so0s",
  decorative_pickup_q1:        "https://buy.stripe.com/cNi28k7Aqbj7aMcfYt8so07",
  decorative_button_pickup_q1: "https://buy.stripe.com/6oU9AM5sibj7f2s8w18so0t",
  // ── Q2 (14 links) ──
  button_ship_q2:              "https://buy.stripe.com/fZu28kaMCgDr1bCeUp8so0a",
  button_pickup_q2:            "https://buy.stripe.com/3cI5kw3kafzn6vWh2x8so0b",
  money_ship_q2:               "https://buy.stripe.com/9B66oA8Eu72RcUkfYt8so0f",
  money_button_ship_q2:        "https://buy.stripe.com/eVqbIU4oe0Etg6w7rX8so0u",
  money_pickup_q2:             "https://buy.stripe.com/cNi3cof2S3QF9I8fYt8so0e",
  money_button_pickup_q2:      "https://buy.stripe.com/14A00cg6Waf36vW7rX8so0v",
  classic_ship_q2:             "https://buy.stripe.com/fZu6oAg6WevjdYoh2x8so0c",
  classic_button_ship_q2:      "https://buy.stripe.com/9B68wI3ka9aZ4nO6nT8so0w",
  classic_pickup_q2:           "https://buy.stripe.com/6oUeV607Y4UJ4nOfYt8so0d",
  classic_button_pickup_q2:    "https://buy.stripe.com/fZudR27Aq2MBg6wcMh8so0x",
  decorative_ship_q2:          "https://buy.stripe.com/cNifZadYOgDr6vWfYt8so09",
  decorative_button_ship_q2:   "https://buy.stripe.com/7sY5kwg6W2MBg6wfYt8so0y",
  decorative_pickup_q2:        "https://buy.stripe.com/bJe9AM2g64UJ8E4cMh8so08",
  decorative_button_pickup_q2: "https://buy.stripe.com/eVq28k07Y4UJcUk4fL8so0z",
  // ── Q3 (14 links) ──
  button_ship_q3:              "https://buy.stripe.com/9B67sE4oegDrbQg9A58so0h",
  button_pickup_q3:            "https://buy.stripe.com/bJe14g3kafzn9I8h2x8so0g",
  money_ship_q3:               "https://buy.stripe.com/8x2fZa8Eu72RdYoaE98so0i",
  money_button_ship_q3:        "https://buy.stripe.com/14AbIU1c21Ixg6weUp8so0A",
  money_pickup_q3:             "https://buy.stripe.com/eVqdR2aMC0Et9I86nT8so0j",
  money_button_pickup_q3:      "https://buy.stripe.com/14A7sE4oecnb2fG7rX8so0B",
  classic_ship_q3:             "https://buy.stripe.com/8x25kw6wm3QF07y8w18so0k",
  classic_button_ship_q3:      "https://buy.stripe.com/8x25kw3ka4UJbQgcMh8so0C",
  classic_pickup_q3:           "https://buy.stripe.com/4gMcMY6wm0Et3jKh2x8so0l",
  classic_button_pickup_q3:    "https://buy.stripe.com/00w3co7Aq2MB5rS13z8so0D",
  decorative_ship_q3:          "https://buy.stripe.com/3cIbIUaMC86V4nOfYt8so0m",
  decorative_button_ship_q3:   "https://buy.stripe.com/7sY7sE2g69aZ7A0dQl8so0E",
  decorative_pickup_q3:        "https://buy.stripe.com/00w6oAbQGevj4nObId8so0n",
  decorative_button_pickup_q3: "https://buy.stripe.com/4gMdR21c2cnb5rS7rX8so0F",
};
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || "";

// ── Input format validators ───────────────────────────────────────────────────
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v) => v.replace(/\D/g, "").length >= 10;
const isValidName  = (v) => v.trim().length >= 2;
const CONTACT_EMAIL = "buttonsandleis@gmail.com";

// ── DATA ───────────────────────────────────────────────────────────────────
// 4 rows × 12 columns — columns are color families, rows go from vibrant → dark/neutral → light → deep
const COLOR_ROWS = [
  // Row 1 — Standard color wheel (always visible)
  [
    { name: "Red",          hex: "#EE1111", dark: false },
    { name: "Red-Orange",   hex: "#FF4500", dark: false },
    { name: "Orange",       hex: "#FF8000", dark: false },
    { name: "Yellow-Orange",hex: "#FFAA00", dark: true  },
    { name: "Yellow",       hex: "#FFE000", dark: true  },
    { name: "Yellow-Green", hex: "#7DC900", dark: true  },
    { name: "Green",        hex: "#00A832", dark: false },
    { name: "Blue-Green",   hex: "#009B8D", dark: false },
    { name: "Blue",         hex: "#1148CC", dark: false },
    { name: "Purple-Blue",  hex: "#5B2FBE", dark: false },
    { name: "Purple",       hex: "#8B00CC", dark: false },
    { name: "Red-Purple",   hex: "#CC0066", dark: false },
  ],
  // Row 2 — Darks & Neutrals incl. Black / Grey / White (always visible)
  [
    { name: "Maroon",       hex: "#800020", dark: false },
    { name: "Coral",        hex: "#FF6B6B", dark: false },
    { name: "Burnt Orange", hex: "#CC5500", dark: false },
    { name: "Gold",         hex: "#D4A017", dark: false },
    { name: "White",        hex: "#F5F5F5", dark: true  },
    { name: "Lime",         hex: "#32CD32", dark: true  },
    { name: "Forest Green", hex: "#228B22", dark: false },
    { name: "Dark Teal",    hex: "#007A74", dark: false },
    { name: "Royal Blue",   hex: "#1A4B8C", dark: false },
    { name: "Navy",         hex: "#0D1B2A", dark: false },
    { name: "Grey",         hex: "#808080", dark: false },
    { name: "Black",        hex: "#1A1A1A", dark: false },
  ],
  // Row 3 — Lights & Pastels (visible when expanded)
  [
    { name: "Salmon",       hex: "#FA8072", dark: true  },
    { name: "Peach",        hex: "#FFCBA4", dark: true  },
    { name: "Apricot",      hex: "#FBCEB1", dark: true  },
    { name: "Honey",        hex: "#FFB347", dark: true  },
    { name: "Cream",        hex: "#F7E7C4", dark: true  },
    { name: "Sage",         hex: "#9DC183", dark: true  },
    { name: "Mint",         hex: "#98EDB5", dark: true  },
    { name: "Seafoam",      hex: "#71EEB8", dark: true  },
    { name: "Sky Blue",     hex: "#87CEEB", dark: true  },
    { name: "Periwinkle",   hex: "#CCCCFF", dark: true  },
    { name: "Lavender",     hex: "#C9A7EB", dark: true  },
    { name: "Hot Pink",     hex: "#E91E8C", dark: false },
  ],
  // Row 4 — Deep & Special (visible when expanded)
  [
    { name: "Burgundy",     hex: "#6E0E0A", dark: false },
    { name: "Rose",         hex: "#E8A0BF", dark: true  },
    { name: "Terracotta",   hex: "#C77B58", dark: false },
    { name: "Bronze",       hex: "#CD7F32", dark: false },
    { name: "Ivory",        hex: "#FFFFF0", dark: true  },
    { name: "Olive",        hex: "#6B8E23", dark: false },
    { name: "Emerald",      hex: "#50C878", dark: true  },
    { name: "Turquoise",    hex: "#40E0D0", dark: true  },
    { name: "Baby Blue",    hex: "#89CFF0", dark: true  },
    { name: "Midnight",     hex: "#191970", dark: false },
    { name: "Lilac",        hex: "#C8A2C8", dark: true  },
    { name: "Silver",       hex: "#C0C0C0", dark: true  },
  ],
];



// ── BEZIER HELPERS ──────────────────────────────────────────────────────────
function cubicBezier(t, p0, p1, p2, p3) {
  const mt = 1 - t;
  return {
    x: mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x,
    y: mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y,
  };
}
function cubicBezierAngle(t, p0, p1, p2, p3) {
  const mt = 1 - t;
  const dx = 3*(mt*mt*(p1.x-p0.x) + 2*mt*t*(p2.x-p1.x) + t*t*(p3.x-p2.x));
  const dy = 3*(mt*mt*(p1.y-p0.y) + 2*mt*t*(p2.y-p1.y) + t*t*(p3.y-p2.y));
  return Math.atan2(dy, dx) * 180 / Math.PI;
}

// ── LEI DRAPE PREVIEW ───────────────────────────────────────────────────────
function LeiDrapePreview({ colors, hasMoney, billDenom, billCount, themes, customText }) {
  const displayColors = colors.length > 0 ? colors : [{ hex: "#D4B06A" }, { hex: "#8B5E1A" }];
  const W = 340, H = 195;
  const p0={x:28,y:16}, p1={x:28,y:188}, p2={x:312,y:188}, p3={x:312,y:16};

  const PETAL_COUNT = 34;
  const petals = Array.from({length: PETAL_COUNT}, (_, i) => {
    const t = i / (PETAL_COUNT - 1);
    const pos = cubicBezier(t, p0, p1, p2, p3);
    const angle = cubicBezierAngle(t, p0, p1, p2, p3);
    return { ...pos, angle, color: displayColors[i % displayColors.length].hex, t };
  });



  const moneyCount = Math.min(billCount || 0, 7);
  const moneyPositions = hasMoney && moneyCount > 0
    ? Array.from({length: moneyCount}, (_, i) => {
        const t = 0.22 + (i / Math.max(moneyCount - 1, 1)) * 0.56;
        const pos = cubicBezier(t, p0, p1, p2, p3);
        const angle = cubicBezierAngle(t, p0, p1, p2, p3);
        return {...pos, angle};
      })
    : [];

  const bottomCenter = cubicBezier(0.5, p0, p1, p2, p3);
  const text = (customText || "").trim().toUpperCase();

  return (
    <div>
      <svg width="100%" viewBox={`-5 -5 ${W+10} ${H+54}`} style={{maxWidth:"340px",display:"block",margin:"0 auto",filter:"drop-shadow(0 4px 18px rgba(0,0,0,0.12))"}}>
        <defs>
          <filter id="ps"><feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.18"/></filter>
        </defs>
        {/* Shoulder silhouette hint */}
        <path d="M 0,16 Q 30,10 80,14 L 80,22 Q 30,18 0,24 Z" fill="rgba(200,170,120,0.13)" />
        <path d="M 340,16 Q 310,10 260,14 L 260,22 Q 310,18 340,24 Z" fill="rgba(200,170,120,0.13)" />
        <ellipse cx="170" cy="-2" rx="44" ry="12" fill="rgba(200,170,120,0.1)" />
        {/* Cord */}
        <path d={`M ${p0.x},${p0.y} C ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
          fill="none" stroke="rgba(165,130,55,0.45)" strokeWidth="12" strokeLinecap="round" />
        {/* Petals */}
        {petals.map((p, i) => (
          <g key={i} transform={`translate(${p.x},${p.y}) rotate(${p.angle+90})`} filter="url(#ps)">
            <ellipse rx="9" ry="14" fill={p.color} stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" opacity="0.96"/>
            <ellipse rx="4" ry="7" cy="-2" fill="rgba(255,255,255,0.2)"/>
          </g>
        ))}

        {/* Money bills */}
        {moneyPositions.map((mp, i) => (
          <g key={i} transform={`translate(${mp.x},${mp.y}) rotate(${mp.angle+90})`}>
            <rect x="-12" y="-8" width="24" height="16" rx="2.5" fill="#85BB65" stroke="#3e7a28" strokeWidth="0.9"/>
            <text textAnchor="middle" dy="5.5" fontSize="9.5" fill="#1a3d08" fontWeight="800" fontFamily="monospace">${billDenom}</text>
          </g>
        ))}

        {/* Bottom decorations */}
        {text && (
          <text x={bottomCenter.x} y={bottomCenter.y + 32} textAnchor="middle"
            fontSize="21" fontWeight="800" fontFamily="'Georgia', serif"
            fill="#3d1500" letterSpacing="2.5" opacity="0.9">{text}</text>
        )}
      </svg>
      <p style={{textAlign:"center",fontSize:"11px",color:"#bbb",fontStyle:"italic",margin:"6px 0 0",fontFamily:"sans-serif",letterSpacing:"0.5px"}}>
        ✦ Simplified preview — for design reference only ✦
      </p>
    </div>
  );
}

// ── PRICING CARD ────────────────────────────────────────────────────────────
function PricingCard({ leiTier, wantsButton, colors, fulfillment, quantity = 1 }) {
  const tier = LEI_TIERS.find(t => t.key === leiTier) || LEI_TIERS[0];
  const buttonAddOn = wantsButton ? BUTTON_PRICE : 0;
  const shippingCost = fulfillment === "shipping" ? SHIPPING_PRICE : 0;
  const total = (tier.price + buttonAddOn) * quantity + shippingCost;
  return (
    <div style={{background:"white",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)",fontSize:"13px",fontFamily:"sans-serif"}}>
      <h4 style={{margin:"0 0 12px",color:"#5a3000",fontSize:"14px",fontWeight:"700",letterSpacing:"0.5px"}}>💰 Estimated Total</h4>
      <div style={{borderTop:"1px dashed #e5c88a",paddingTop:"10px"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",color:"#7a5520",alignItems:"center"}}>
          <span style={{display:"flex",alignItems:"center",gap:"6px"}}>
            {quantity > 1 ? `${quantity} × ` : ""}{tier.label}
            {colors && colors.length > 0 && (
              <span style={{display:"flex",gap:"3px"}}>
                {colors.map((c,i) => <span key={i} style={{width:"11px",height:"11px",borderRadius:"50%",background:c.hex,display:"inline-block",border:"1px solid rgba(0,0,0,0.15)"}} />)}
              </span>
            )}
          </span>
          <span>${(tier.price * quantity).toFixed(2)}</span>
        </div>
        {wantsButton && (
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",color:"#7a5520"}}>
            <span>{quantity > 1 ? `${quantity} × ` : ""}Button Add-on</span><span>+${(BUTTON_PRICE * quantity).toFixed(2)}</span>
          </div>
        )}
      </div>
      {fulfillment === "shipping" && (
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",color:"#7a5520"}}>
          <span>🚚 USPS Shipping</span><span>+${SHIPPING_PRICE.toFixed(2)}</span>
        </div>
      )}
      {fulfillment === "pickup" && (
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",color:"#059669",fontWeight:"600"}}>
          <span>📍 Local Pickup</span><span style={{color:"#059669"}}>FREE</span>
        </div>
      )}
      {!fulfillment && (
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",color:"#9a7040",fontStyle:"italic"}}>
          <span>+ Shipping (select below)</span><span>+${SHIPPING_PRICE.toFixed(2)} or FREE</span>
        </div>
      )}
      <div style={{borderTop:"2px solid #e5c88a",marginTop:"8px",paddingTop:"8px",display:"flex",justifyContent:"space-between",fontWeight:"800",fontSize:"16px",color:"#3d1500"}}>
        <span>Total</span><span>${total.toFixed(2)}</span>
      </div>
      <p style={{margin:"8px 0 0",fontSize:"10px",color:"#b08050",lineHeight:"1.5"}}>
        Payment via Stripe — no account needed
      </p>
    </div>
  );
}

// ── GALLERY PAGE ─────────────────────────────────────────────────────────────
const GALLERY_ITEMS = [
  {
    src: '/gallery/LEI1.png', caption: "Teal & Black Decorative Lei",
    tier: 'decorative', price: 45, tags: ['Decorative Lei'],
    prePopulate: { colors: [{name:"Teal",hex:"#2EC4B6",dark:false},{name:"Black",hex:"#222222",dark:false}], text: '', occasion: 'Graduation' }
  },
  {
    src: '/gallery/LEI2.png', caption: "Maroon & Gold Money Lei",
    tier: 'money', price: 65, tags: ['Decorative Money Lei'],
    prePopulate: { colors: [{name:"Maroon",hex:"#800000",dark:false},{name:"Gold",hex:"#D4A017",dark:false}], text: '', occasion: 'Graduation' }
  },
  {
    src: '/gallery/LEI3.png', caption: "Forest Green & Gold Decorative Lei",
    tier: 'decorative', price: 45, tags: ['Decorative Lei'],
    prePopulate: { colors: [{name:"Forest Green",hex:"#228B22",dark:false},{name:"Gold",hex:"#D4A017",dark:false}], text: '', occasion: 'Graduation' }
  },
  {
    src: '/gallery/LEI4.png', caption: "Maroon & Gold Decorative Lei",
    tier: 'decorative', price: 45, tags: ['Decorative Lei'],
    prePopulate: { colors: [{name:"Maroon",hex:"#800000",dark:false},{name:"Gold",hex:"#D4A017",dark:false}], text: '', occasion: 'Graduation' }
  },
  {
    src: '/gallery/LEI5.png', caption: "Forest Green Classic Lei",
    tier: 'classic', price: 35, tags: ['Classic Lei'],
    prePopulate: { colors: [{name:"Forest Green",hex:"#228B22",dark:false},{name:"Gold",hex:"#D4A017",dark:false}], text: '', occasion: 'Graduation' }
  },
  {
    src: '/gallery/LEI6.png', caption: "Black & Gold Money Lei",
    tier: 'money', price: 65, tags: ['Decorative Money Lei'],
    prePopulate: { colors: [{name:"Black",hex:"#222222",dark:false},{name:"Gold",hex:"#D4A017",dark:false}], text: '', occasion: 'Graduation' }
  },
  {
    src: '/gallery/LEI7.png', caption: "Maroon & Gold Classic Lei",
    tier: 'classic', price: 35, tags: ['Classic Lei'],
    prePopulate: { colors: [{name:"Maroon",hex:"#800000",dark:false},{name:"Gold",hex:"#D4A017",dark:false}], text: '', occasion: 'Graduation' }
  },
  {
    src: '/gallery/LEI8.png', caption: "Maroon & Gold Decorative Lei",
    tier: 'decorative', price: 45, tags: ['Decorative Lei'],
    prePopulate: { colors: [{name:"Maroon",hex:"#800000",dark:false},{name:"Gold",hex:"#D4A017",dark:false}], text: '', occasion: 'Graduation' }
  },
  {
    src: '/gallery/Button1.png', caption: "EHS Proud Parent Button",
    tier: 'button', price: 5, tags: ['Button'],
    prePopulate: { text: 'Proud Parent EHS 2026 GRAD', occasion: 'Graduation' }
  },
  {
    src: '/gallery/Button2.png', caption: "AHS 2026 Grad Button",
    tier: 'button', price: 5, tags: ['Button'],
    prePopulate: { text: 'AHS 2026 GRAD', occasion: 'Graduation' }
  },
  {
    src: '/gallery/Button3.png', caption: "WRHS 2026 Grad Button",
    tier: 'button', price: 5, tags: ['Button'],
    prePopulate: { text: 'WRHS 2026 GRAD', occasion: 'Graduation' }
  },
];

// ── FAQ SECTION ──────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "What's the difference between Classic, Decorative, and Money Lei?",
    a: "Classic leis are braided ribbon — a timeless 2-color strand. Decorative leis are pinwheel or scrunchie style, fuller and more voluminous. Money Leis include 20 real $1 bills woven in — a beloved graduation and birthday gift!",
  },
  {
    q: "Why do I choose exactly 2 colors?",
    a: "Our leis use a 2-strand braid or pinwheel technique where 2 colors creates the most beautiful pattern. We may weave in small accent colors at no extra cost to add depth.",
  },
  {
    q: "How long does it take to make my order?",
    a: "Most orders are ready within 3–7 days. We'll email you as soon as yours is complete and ready for pickup or shipping!",
  },
  {
    q: "What area does local pickup cover?",
    a: "Pickup is available in the 98391 area (Bonney Lake / Sumner, WA). After your order is ready, we'll reach out by email to coordinate a convenient time and drop-off location.",
  },
  {
    q: "Can I order something I see in the gallery?",
    a: "Absolutely! Click any photo in the gallery and tap \"Order This Style\" to pre-fill your order with that design. Every lei is handmade, so yours will be uniquely yours.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit and debit cards, plus Apple Pay and Google Pay — all processed securely through Stripe. No account required.",
  },
  {
    q: "I didn't receive a confirmation email — what should I do?",
    a: "Check your spam or junk folder first. If it's not there, email us at buttonsandleis@gmail.com with your name and we'll look up your order right away.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="faq-section" style={{marginTop:"36px",background:"white",borderRadius:"20px",padding:"28px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)"}}>
      <h3 style={{margin:"0 0 20px",color:"#5a3000",fontSize:"18px",fontFamily:"'Georgia',serif",textAlign:"center"}}>
        Frequently Asked Questions
      </h3>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} style={{borderRadius:"12px",border:`1px solid ${isOpen ? "#c8833a" : "#edd9a0"}`,overflow:"hidden",transition:"border-color 0.2s"}}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                style={{
                  width:"100%",textAlign:"left",background: isOpen ? "#fdf3e3" : "#fdf8f0",
                  border:"none",padding:"14px 16px",cursor:"pointer",
                  display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",
                }}>
                <span style={{fontFamily:"sans-serif",fontSize:"13px",fontWeight:"600",color:"#5a3000",lineHeight:"1.4"}}>
                  {item.q}
                </span>
                <span style={{color:"#c8833a",fontSize:"16px",flexShrink:0,transition:"transform 0.2s",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"}}>▼</span>
              </button>
              {isOpen && (
                <div style={{padding:"0 16px 14px",background:"#fdf3e3"}}>
                  <p style={{margin:0,fontFamily:"sans-serif",fontSize:"13px",color:"#7a5020",lineHeight:"1.7"}}>
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GalleryPage({ onOrderItem }) {
  const [modal, setModal] = useState(null); // index of open image

  const close = () => setModal(null);

  // Close on escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const prev = () => setModal(m => (m - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
  const next = () => setModal(m => (m + 1) % GALLERY_ITEMS.length);

  const TAG_COLORS = {
    'Classic Lei': { bg: '#e8f0d8', color: '#3a5010' },
    'Decorative Lei': { bg: '#e8d8f8', color: '#5a1080' },
    'Decorative Money Lei': { bg: '#d8f0e0', color: '#1a6030' },
    'Buttons': { bg: '#fde8d8', color: '#8a3010' },
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#fdf6ec 0%,#fce8c0 55%,#fad9a0 100%)"}}>
      {/* Hero Header */}
      <div className="gallery-hero" style={{background:"linear-gradient(160deg,#1e0d00,#3d1f00,#6b3200)",padding:"20px 24px 18px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,opacity:0.03,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",backgroundSize:"14px 14px"}}/>
        <div style={{position:"relative"}}>
          <h1 onClick={() => window.scrollTo({top:0,behavior:'smooth'})} style={{color:"#FFD166",fontSize:"clamp(20px,4vw,36px)",margin:"0 0 4px",fontFamily:"'Georgia','Times New Roman',serif",fontWeight:"400",letterSpacing:"clamp(2px,1.5vw,8px)",textTransform:"uppercase",textShadow:"0 2px 20px rgba(0,0,0,0.4)",lineHeight:1.1,cursor:"pointer"}}>
            Buttons & Leis
          </h1>
          <p style={{color:"rgba(255,220,150,0.65)",margin:"0 0 14px",fontSize:"clamp(9px,1.8vw,11px)",letterSpacing:"clamp(1.5px,1vw,3px)",textTransform:"uppercase",fontFamily:"sans-serif",fontWeight:"400"}}>
            Handmade &nbsp;·&nbsp; Custom &nbsp;·&nbsp; With Love
          </p>
          <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
            <button className="hero-btn" onClick={() => onOrderItem && onOrderItem({ tier: 'classic', prePopulate: null })}
              style={{background:"linear-gradient(135deg,#c8833a,#a85200)",color:"white",border:"none",borderRadius:"10px",padding:"8px 20px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"sans-serif",letterSpacing:"0.5px",boxShadow:"0 3px 12px rgba(168,82,0,0.4)",width:"170px"}}>
              🌺 Order Lei
            </button>
            <button className="hero-btn" onClick={() => onOrderItem && onOrderItem({ page: 'button-order' })}
              style={{background:"rgba(255,255,255,0.12)",color:"#FFD166",border:"2px solid rgba(255,209,102,0.4)",borderRadius:"10px",padding:"8px 20px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"sans-serif",letterSpacing:"0.5px",backdropFilter:"blur(4px)",width:"170px"}}>
              🔘 Order Button
            </button>
          </div>
        </div>
      </div>

      <div className="gallery-container" style={{padding:"32px 20px 60px",maxWidth:"900px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <h2 style={{color:"#5a3000",fontSize:"22px",margin:"0 0 6px",fontFamily:"'Georgia',serif",fontStyle:"italic"}}>Our Work</h2>
          <p style={{color:"#9a7040",fontSize:"13px",fontFamily:"sans-serif",margin:0}}>
            Click any item to order something similar
          </p>
        </div>

        <div className="gallery-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"18px"}}>
          {GALLERY_ITEMS.map((item, i) => (
            <div key={i}
              style={{
                borderRadius:"18px",overflow:"hidden",cursor:"pointer",
                boxShadow:"0 4px 20px rgba(0,0,0,0.10)",
                transition:"transform 0.2s, box-shadow 0.2s",
                background:"#f5e8d0",
                position:"relative",
                display:"flex",flexDirection:"column",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="scale(1.02)"; e.currentTarget.style.boxShadow="0 10px 36px rgba(0,0,0,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.10)"; }}
            >
              <div style={{position:"relative"}} onClick={() => setModal(i)}>
                <img src={item.src} alt={item.caption}
                  style={{width:"100%",aspectRatio:"3/4",objectFit:"cover",display:"block"}}/>
                <div style={{position:"absolute",top:"10px",left:"10px",background:"rgba(0,0,0,0.65)",borderRadius:"20px",padding:"4px 10px",fontSize:"12px",color:"#FFD166",fontFamily:"sans-serif",fontWeight:"700",backdropFilter:"blur(4px)"}}>
                  ${item.price}
                </div>
                <div style={{position:"absolute",top:"10px",right:"10px",background:"rgba(0,0,0,0.45)",borderRadius:"20px",padding:"4px 9px",fontSize:"11px",color:"white",fontFamily:"sans-serif",backdropFilter:"blur(4px)"}}>
                  🔍 Zoom
                </div>
              </div>
              <div style={{padding:"12px 14px 14px",background:"white",flex:1,display:"flex",flexDirection:"column",gap:"8px"}}>
                <div style={{fontSize:"13px",fontWeight:"700",color:"#3d1500",fontFamily:"sans-serif"}}>{item.caption}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                  {item.tags.map((tag, ti) => {
                    const tc = TAG_COLORS[tag] || { bg: '#f0e8d8', color: '#7a5020' };
                    return (
                      <span key={ti} style={{background:tc.bg,color:tc.color,borderRadius:"10px",padding:"2px 8px",fontSize:"10px",fontWeight:"600",fontFamily:"sans-serif"}}>{tag}</span>
                    );
                  })}
                </div>
                <button
                  onClick={() => onOrderItem && onOrderItem({ tier: item.tier, prePopulate: item.prePopulate })}
                  style={{marginTop:"auto",background:"linear-gradient(135deg,#c8833a,#a85200)",color:"white",border:"none",borderRadius:"8px",padding:"8px 14px",fontSize:"12px",fontWeight:"700",cursor:"pointer",fontFamily:"sans-serif",width:"100%"}}>
                  Order This Style →
                </button>
              </div>
            </div>
          ))}

          <div style={{
            borderRadius:"18px",aspectRatio:"3/4",
            background:"linear-gradient(135deg,#fdf0d8,#f5dba0)",
            border:"2px dashed #e5c088",
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            gap:"10px",color:"#c8933a",fontFamily:"sans-serif",
          }}>
            <span style={{fontSize:"32px"}}>🌺</span>
            <span style={{fontSize:"12px",fontStyle:"italic",color:"#b08050"}}>More coming soon</span>
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:"36px",background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)"}}>
          <p style={{color:"#7a5520",fontFamily:"sans-serif",fontSize:"14px",lineHeight:"1.7",margin:0}}>
            Every lei is handmade with love — no two are exactly alike! 🌸<br/>
            <strong style={{cursor:"pointer",color:"#c8833a"}} onClick={() => onOrderItem && onOrderItem({ tier: 'classic', prePopulate: null })}>Start a custom order →</strong>
          </p>
        </div>

        <FAQSection />
      </div>

      {modal !== null && (
        <div
          onClick={close}
          style={{
            position:"fixed",inset:0,zIndex:9000,
            background:"rgba(0,0,0,0.88)",
            display:"flex",alignItems:"center",justifyContent:"center",
            padding:"20px",
            backdropFilter:"blur(8px)",
            animation:"modalFadeIn 0.2s ease-out",
          }}>
          <style>{`@keyframes modalFadeIn{from{opacity:0}to{opacity:1}} @keyframes modalImgIn{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
          <button onClick={close} style={{
            position:"absolute",top:"16px",right:"16px",
            background:"rgba(255,255,255,0.18)",border:"2px solid rgba(255,255,255,0.25)",color:"white",
            width:"48px",height:"48px",borderRadius:"50%",fontSize:"22px",
            cursor:"pointer",zIndex:1,backdropFilter:"blur(6px)",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>✕</button>
          {GALLERY_ITEMS.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prev(); }} style={{
              position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",
              background:"rgba(255,255,255,0.18)",border:"2px solid rgba(255,255,255,0.25)",color:"white",
              width:"52px",height:"52px",borderRadius:"50%",fontSize:"28px",
              cursor:"pointer",backdropFilter:"blur(6px)",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>‹</button>
          )}
          <div onClick={e => e.stopPropagation()} style={{
            maxWidth:"min(96vw,860px)",maxHeight:"96vh",
            display:"flex",flexDirection:"column",alignItems:"center",gap:"14px",
            animation:"modalImgIn 0.25s ease-out",
          }}>
            <img src={GALLERY_ITEMS[modal].src} alt={GALLERY_ITEMS[modal].caption}
              style={{maxWidth:"100%",maxHeight:"84vh",borderRadius:"16px",objectFit:"contain",boxShadow:"0 24px 80px rgba(0,0,0,0.6)"}}/>
            <div style={{textAlign:"center"}}>
              <div style={{color:"white",fontSize:"15px",fontWeight:"700",fontFamily:"sans-serif",marginBottom:"6px"}}>{GALLERY_ITEMS[modal].caption}</div>
              <button onClick={() => { close(); onOrderItem && onOrderItem({ tier: GALLERY_ITEMS[modal].tier, prePopulate: GALLERY_ITEMS[modal].prePopulate }); }}
                style={{background:"linear-gradient(135deg,#c8833a,#a85200)",color:"white",border:"none",borderRadius:"10px",padding:"10px 22px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"sans-serif",marginBottom:"8px"}}>
                Order This Style →
              </button>
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:"12px",fontFamily:"sans-serif",marginTop:"6px"}}>{modal+1} / {GALLERY_ITEMS.length}</div>
            </div>
          </div>
          {GALLERY_ITEMS.length > 1 && (
            <button onClick={e => { e.stopPropagation(); next(); }} style={{
              position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",
              background:"rgba(255,255,255,0.18)",border:"2px solid rgba(255,255,255,0.25)",color:"white",
              width:"52px",height:"52px",borderRadius:"50%",fontSize:"28px",
              cursor:"pointer",backdropFilter:"blur(6px)",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>›</button>
          )}
        </div>
      )}
    </div>
  );
}

// ── COLOR PICKER SECTION ─────────────────────────────────────────────────────
const GRID_COLS = "repeat(12, 32px)";
const GRID_GAP  = "8px";

function ColorRow({ row, selectedColors, toggleColor }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:GRID_COLS,gap:GRID_GAP}}>
      {row.map((color) => {
        const sel = selectedColors.find(c => c.name === color.name);
        return (
          <button key={color.name} onClick={() => toggleColor(color)} title={color.name}
            style={{
              width:"32px",height:"32px",borderRadius:"50%",background:color.hex,
              border: sel ? "3px solid #c8833a" : "2px solid rgba(0,0,0,0.12)",
              cursor:"pointer",
              transition:"all 0.18s",
              boxShadow: sel ? "0 0 0 3px white, 0 0 0 5px #c8833a" : "0 1px 3px rgba(0,0,0,0.15)",
              position:"relative",flexShrink:0,padding:0,
            }}>
            {sel && <span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:"11px",color:color.dark?"#333":"#fff",fontWeight:"bold",pointerEvents:"none"}}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

function ColorSection({ selectedColors, setSelectedColors }) {
  const [showMore, setShowMore] = useState(false);
  const [customHex, setCustomHex] = useState("#ff69b4");
  const [customAdded, setCustomAdded] = useState(false);

  const toggleColor = (color) => {
    const isSelected = selectedColors.find(c => c.name === color.name);
    if (isSelected) {
      setSelectedColors(selectedColors.filter(c => c.name !== color.name));
    } else if (selectedColors.length < 2) {
      setSelectedColors([...selectedColors, color]);
    } else {
      setSelectedColors([selectedColors[1], color]);
    }
  };

  const addCustomColor = () => {
    const custom = { name: "Custom", hex: customHex, dark: false, custom: true };
    const existing = selectedColors.findIndex(c => c.custom);
    if (existing >= 0) {
      const updated = [...selectedColors];
      updated[existing] = custom;
      setSelectedColors(updated);
    } else if (selectedColors.length < 2) {
      setSelectedColors([...selectedColors, custom]);
    } else {
      setSelectedColors([selectedColors[1], custom]);
    }
    setCustomAdded(true);
    setTimeout(() => setCustomAdded(false), 1500);
  };

  return (
    <div style={{background:"white",borderRadius:"20px",padding:"26px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"4px"}}>
        <h3 style={{margin:0,color:"#5a3000",fontSize:"17px",fontFamily:"'Georgia',serif"}}>🎨 Colors</h3>
        <span style={{fontFamily:"sans-serif",fontSize:"12px",color:selectedColors.length===2?"#2d7020":"#c8400a",fontWeight:"600"}}>
          {selectedColors.length}/2 selected
        </span>
      </div>
      <p style={{margin:"0 0 12px",fontSize:"12px",color:"#9a7040",fontFamily:"sans-serif"}}>
        Choose exactly 2 · Selecting a 3rd replaces the 1st
      </p>

      {/* Always-visible rows 1 & 2 */}
      <div style={{overflowX:"auto",padding:"6px 4px 6px 6px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:GRID_GAP,minWidth:"fit-content"}}>
          <ColorRow row={COLOR_ROWS[0]} selectedColors={selectedColors} toggleColor={toggleColor} />
          <ColorRow row={COLOR_ROWS[1]} selectedColors={selectedColors} toggleColor={toggleColor} />

          {/* Expanded rows 3 & 4 */}
          {showMore && (<>
            <ColorRow row={COLOR_ROWS[2]} selectedColors={selectedColors} toggleColor={toggleColor} />
            <ColorRow row={COLOR_ROWS[3]} selectedColors={selectedColors} toggleColor={toggleColor} />
          </>)}
        </div>
      </div>

      <button onClick={() => setShowMore(!showMore)}
        style={{background:"none",border:"1px solid #e5c88a",borderRadius:"20px",padding:"5px 14px",
          cursor:"pointer",fontSize:"12px",color:"#c8833a",fontFamily:"sans-serif",fontWeight:"600",marginTop:"12px",marginBottom:"4px"}}>
        {showMore ? "▲ Show fewer colors" : "▼ Show more colors (pastels & deeps)"}
      </button>

      {showMore && (
        <div style={{background:"#fdf8f0",borderRadius:"12px",padding:"14px",border:"1px solid #edd9a0",marginTop:"10px"}}>
          <p style={{margin:"0 0 8px",fontSize:"12px",color:"#7a5520",fontFamily:"sans-serif",fontWeight:"600"}}>
            🎨 Custom Color
          </p>
          <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
            <input type="color" value={customHex} onChange={e => setCustomHex(e.target.value)}
              style={{width:"42px",height:"36px",border:"none",borderRadius:"8px",cursor:"pointer",background:"none",padding:0}}/>
            <span style={{fontSize:"12px",color:"#9a7040",fontFamily:"monospace"}}>{customHex.toUpperCase()}</span>
            <button onClick={addCustomColor}
              style={{background:"#c8833a",color:"white",border:"none",
                borderRadius:"8px",padding:"6px 14px",cursor:"pointer",
                fontSize:"12px",fontWeight:"600",fontFamily:"sans-serif",transition:"all 0.2s"}}>
              {customAdded ? "✓ Added!" : "+ Add Custom"}
            </button>
          </div>
          <p style={{margin:"8px 0 0",fontSize:"11px",color:"#b05a20",fontFamily:"sans-serif",lineHeight:"1.4"}}>
            ⚠️ We will do our best to match custom colors — exact shades may vary.
          </p>
        </div>
      )}

      <p style={{margin:"10px 0 0",fontSize:"11px",color:"#9a7040",fontFamily:"sans-serif",fontStyle:"italic"}}>
        ✦ Additional accent colors may be included at no extra cost.
      </p>

      {selectedColors.length > 0 && (
        <div style={{marginTop:"14px",display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {selectedColors.map((c, i) => (
            <span key={c.name+i} style={{
              display:"flex",alignItems:"center",gap:"6px",background:"#fdf6ec",
              border:"1px solid #e5c88a",borderRadius:"20px",padding:"4px 10px",
              fontSize:"12px",color:"#7a4010",fontFamily:"sans-serif"
            }}>
              <span style={{width:"10px",height:"10px",borderRadius:"50%",background:c.hex,border:"1px solid rgba(0,0,0,0.2)",display:"inline-block"}}/>
              {i+1}. {c.name}
              <button onClick={() => toggleColor(c)} style={{background:"none",border:"none",cursor:"pointer",color:"#c8833a",padding:0,fontSize:"15px",lineHeight:1}}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── VALIDATION CHECKLIST ─────────────────────────────────────────────────────
function ValidationChecklist({ items }) {
  const visible = items.filter(it => it.show !== false);
  if (visible.every(it => it.done)) return null;
  return (
    <div style={{background:"#fdf8f0",borderRadius:"12px",padding:"14px 16px",marginBottom:"12px",border:"1px solid #edd9a0"}}>
      <p style={{margin:"0 0 8px",fontSize:"12px",fontWeight:"700",color:"#7a4010",fontFamily:"sans-serif"}}>
        To-Do List
      </p>
      <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
        {visible.map((it, i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"sans-serif",fontSize:"12px",
            color: it.done ? "#2d7020" : "#9a4020"}}>
            <span style={{fontSize:"13px",lineHeight:1}}>{it.done ? "✓" : "✗"}</span>
            <span style={{textDecoration: it.done ? "line-through" : "none", opacity: it.done ? 0.6 : 1}}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STORAGE HELPERS ──────────────────────────────────────────────────────────
// Saves a new order — uses Supabase if configured, otherwise falls back to localStorage
const saveOrder = async (order) => {
  if (supabase) {
    const { error } = await supabase.from("orders").insert([{
      id: order.id,
      submitted_at: order.submittedAt,
      status: order.status,
      type: order.type,
      contact: order.contact,
      design: order.design,
      total: order.total,
      admin_notes: "",
    }]);
    if (!error) return;
    console.error("Supabase insert error:", error);
  }
  // Fallback: localStorage
  try {
    const existing = JSON.parse(localStorage.getItem("lei_orders") || "[]");
    existing.unshift(order);
    localStorage.setItem("lei_orders", JSON.stringify(existing));
  } catch {}
};

// Fetches all orders — used by admin page
const fetchOrders = async () => {
  if (supabase) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (!error) return data || [];
    console.error("Supabase fetch error:", error);
  }
  // Fallback: localStorage
  try { return JSON.parse(localStorage.getItem("lei_orders") || "[]"); } catch {}
  return [];
};

// Updates a single field on an order
const updateOrder = async (id, patch) => {
  if (supabase) {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (!error) return;
    console.error("Supabase update error:", error);
  }
  // Fallback: patch in localStorage
  try {
    const orders = JSON.parse(localStorage.getItem("lei_orders") || "[]");
    const patched = orders.map(o => o.id === id ? { ...o, ...patch } : o);
    localStorage.setItem("lei_orders", JSON.stringify(patched));
  } catch {}
};

// Deletes an order
const deleteOrderById = async (id) => {
  if (supabase) {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (!error) return;
    console.error("Supabase delete error:", error);
  }
  try {
    const orders = JSON.parse(localStorage.getItem("lei_orders") || "[]");
    localStorage.setItem("lei_orders", JSON.stringify(orders.filter(o => o.id !== id)));
  } catch {}
};

// ── ADMIN PAGE ────────────────────────────────────────────────────────────────
const STATUS_FLOW = [
  { key:"new",               bg:"#fff3cd", color:"#92640a", label:"🆕 New (Unpaid)" },
  { key:"payment_pending",   bg:"#fef3c7", color:"#d97706", label:"⏳ Sent to Stripe" },
  { key:"paid",              bg:"#dcfce7", color:"#166534", label:"💰 Paid" },
  { key:"making",            bg:"#ede9fe", color:"#5b21b6", label:"🔨 Making" },
  { key:"ready",             bg:"#cffafe", color:"#0e7490", label:"📦 Ready / Shipped" },
  { key:"delivered",         bg:"#bbf7d0", color:"#14532d", label:"✅ Delivered" },
  { key:"payment_abandoned", bg:"#fef9c3", color:"#713f12", label:"⚠️ Abandoned Cart" },
  { key:"payment_failed",    bg:"#fee2e2", color:"#991b1b", label:"🚨 Payment Failed" },
  { key:"cancelled",         bg:"#f3f4f6", color:"#6b7280", label:"❌ Cancelled" },
];
// Which statuses admin can manually set (excludes auto-set statuses)
const ADMIN_STATUS_OPTIONS = ["new","paid","making","ready","delivered","cancelled"];
const STATUS_MAP = Object.fromEntries(STATUS_FLOW.map(s => [s.key, s]));

function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [orders, setOrders] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const [notesDraft, setNotesDraft] = useState({});
  const [emailSending, setEmailSending] = useState({});
  const [emailResult, setEmailResult] = useState({});

  const applyOrders = (data) => {
    setOrders(data);
    const n = {};
    data.forEach(o => { if (o.admin_notes) n[o.id] = o.admin_notes; });
    setNotesDraft(prev => ({ ...n, ...prev }));
  };

  const reload = async () => {
    try { applyOrders(await fetchOrders()); } catch { setOrders([]); }
  };

  useEffect(() => {
    if (!authed) return;
    reload();
    if (!supabase) return;
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, reload)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [authed]);

  const login = () => {
    if (pw === "shelly") { setAuthed(true); setAuthError(false); }
    else setAuthError(true);
  };

  const setStatus = async (order, newStatus) => {
    await updateOrder(order.id, { status: newStatus });
    setOrders(prev => (prev||[]).map(o => o.id === order.id ? { ...o, status: newStatus } : o));
    // Send email to customer for key status transitions
    if (["making","ready","delivered"].includes(newStatus)) {
      sendStatusEmail(order, newStatus);
    }
  };

  const saveNotes = async (id) => {
    const notes = notesDraft[id] || "";
    await updateOrder(id, { admin_notes: notes });
    setOrders(prev => (prev||[]).map(o => o.id === id ? { ...o, admin_notes: notes } : o));
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order? This cannot be undone.")) return;
    await deleteOrderById(id);
    setOrders(prev => (prev||[]).filter(o => o.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const sendStatusEmail = async (order, status) => {
    setEmailSending(prev => ({ ...prev, [order.id]: true }));
    try {
      const res = await fetch("/.netlify/functions/send-status-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": ADMIN_SECRET,
        },
        body: JSON.stringify({ status, order }),
      });
      const result = await res.json();
      setEmailResult(prev => ({ ...prev, [order.id]: result.sent ? "✅ Email sent" : "⚠️ " + (result.reason || "Failed") }));
      setTimeout(() => setEmailResult(prev => { const n = {...prev}; delete n[order.id]; return n; }), 4000);
    } catch {
      setEmailResult(prev => ({ ...prev, [order.id]: "⚠️ Email unavailable" }));
      setTimeout(() => setEmailResult(prev => { const n = {...prev}; delete n[order.id]; return n; }), 4000);
    }
    setEmailSending(prev => ({ ...prev, [order.id]: false }));
  };

  // ── LOGIN SCREEN ──
  if (!authed) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a0800,#3d1f00)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif"}}>
      <div style={{background:"white",borderRadius:"20px",padding:"48px 40px",maxWidth:"360px",width:"90%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
        <div style={{fontSize:"40px",marginBottom:"12px"}}>🌺</div>
        <h2 style={{margin:"0 0 4px",color:"#3d1500",fontSize:"22px"}}>Admin Access</h2>
        <p style={{margin:"0 0 24px",color:"#9a7040",fontSize:"13px"}}>Buttons & Leis — Order Dashboard</p>
        <input
          type="password" placeholder="Password" value={pw}
          onChange={e => { setPw(e.target.value); setAuthError(false); }}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{width:"100%",padding:"13px 16px",borderRadius:"10px",border:`2px solid ${authError?"#e74c3c":"#e5c88a"}`,
            fontSize:"16px",boxSizing:"border-box",outline:"none",marginBottom:"12px",textAlign:"center",letterSpacing:"4px"}}/>
        {authError && <p style={{color:"#e74c3c",fontSize:"12px",margin:"-4px 0 10px"}}>Incorrect password</p>}
        <button onClick={login}
          style={{width:"100%",background:"linear-gradient(135deg,#c8833a,#a85200)",color:"white",border:"none",
            borderRadius:"10px",padding:"13px",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}>
          Enter Dashboard
        </button>
      </div>
    </div>
  );

  // ── COMPUTE STATS ──
  const counts = {};
  (orders || []).forEach(o => { const s = o.status || "new"; counts[s] = (counts[s]||0)+1; });

  const paidNeedingAction = (orders||[]).filter(o => o.status === "paid").length;
  const pendingPaymentOrders = (orders||[]).filter(o => o.status === "payment_pending");
  const abandonedCount = (orders||[]).filter(o => o.status === "payment_abandoned").length;
  const failedCount = (orders||[]).filter(o => o.status === "payment_failed").length;

  const filtered = !orders ? [] : filter === "all" ? orders : orders.filter(o => (o.status||"new") === filter);

  return (
    <div style={{minHeight:"100vh",background:"#f5f0e8",fontFamily:"sans-serif"}}>

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(135deg,#2d1200,#6a3000)",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{fontSize:"28px"}}>🌺</div>
          <div>
            <div style={{color:"#FFD166",fontSize:"15px",fontWeight:"800",letterSpacing:"1.5px"}}>BUTTONS & LEIS</div>
            <div style={{color:"rgba(255,220,150,0.6)",fontSize:"10px",marginTop:"1px",letterSpacing:"0.5px"}}>ORDER DASHBOARD</div>
          </div>
          {orders && <div style={{background:"rgba(255,209,102,0.2)",border:"1px solid rgba(255,209,102,0.3)",color:"#FFD166",borderRadius:"20px",padding:"3px 10px",fontSize:"12px",fontWeight:"700"}}>{orders.length} orders</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <button onClick={reload}
            style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:"white",borderRadius:"8px",padding:"8px 14px",cursor:"pointer",fontSize:"12px",fontWeight:"600"}}>
            ↺ Refresh
          </button>
          <button onClick={() => { window.location.hash=""; }}
            style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:"white",borderRadius:"8px",padding:"8px 14px",cursor:"pointer",fontSize:"12px",fontWeight:"600"}}>
            ← Back to Site
          </button>
        </div>
      </div>

      {/* ── ALERT BANNERS ── */}
      {paidNeedingAction > 0 && (
        <div onClick={() => setFilter("paid")}
          style={{background:"#dcfce7",borderLeft:"5px solid #16a34a",padding:"14px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:"10px",fontSize:"14px",fontWeight:"700",color:"#14532d"}}>
          <span style={{fontSize:"20px"}}>💰</span>
          {paidNeedingAction} paid order{paidNeedingAction!==1?"s":""} need{paidNeedingAction===1?"s":""} to be made! — Tap to view
        </div>
      )}
      {pendingPaymentOrders.length > 0 && (
        <div style={{background:"#fffbeb",borderLeft:"5px solid #f59e0b",padding:"12px 20px",fontFamily:"sans-serif"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",fontSize:"13px",fontWeight:"700",color:"#92400e",marginBottom:"6px",cursor:"pointer"}} onClick={() => setFilter("payment_pending")}>
            <span>⏳</span> {pendingPaymentOrders.length} order{pendingPaymentOrders.length!==1?"s":""} sent to Stripe — awaiting payment
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
            {pendingPaymentOrders.map(o => (
              <a key={o.id} href={`mailto:${o.contact?.email}`}
                style={{background:"#fef3c7",border:"1px solid #f59e0b",borderRadius:"20px",padding:"3px 10px",fontSize:"11px",fontWeight:"600",color:"#92400e",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"4px"}}>
                ✉️ {o.contact?.parentName || o.contact?.name || "Customer"} · {o.contact?.email}
              </a>
            ))}
          </div>
        </div>
      )}
      {abandonedCount > 0 && (
        <div onClick={() => setFilter("payment_abandoned")}
          style={{background:"#fef9c3",borderLeft:"5px solid #ca8a04",padding:"12px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:"10px",fontSize:"13px",fontWeight:"600",color:"#713f12"}}>
          <span>⚠️</span> {abandonedCount} abandoned cart{abandonedCount!==1?"s":""} — customer left without paying
        </div>
      )}
      {failedCount > 0 && (
        <div onClick={() => setFilter("payment_failed")}
          style={{background:"#fee2e2",borderLeft:"5px solid #dc2626",padding:"12px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:"10px",fontSize:"13px",fontWeight:"600",color:"#991b1b"}}>
          <span>🚨</span> {failedCount} failed payment{failedCount!==1?"s":""} — may need follow-up
        </div>
      )}

      {/* ── FILTER TABS ── */}
      <div style={{background:"white",borderBottom:"1px solid #e8d8b8",overflowX:"auto"}}>
        <div style={{display:"flex",gap:"0",padding:"0 16px"}}>
          {[{key:"all",label:"All",bg:"#f5f0e8",color:"#5a3000"},...STATUS_FLOW].map(s => {
            const isActive = filter === s.key;
            const cnt = s.key === "all" ? (orders||[]).length : (counts[s.key]||0);
            return (
              <button key={s.key} onClick={() => setFilter(s.key)}
                style={{padding:"11px 12px",border:"none",borderBottom:isActive?"3px solid #c8833a":"3px solid transparent",
                  background:"transparent",cursor:"pointer",whiteSpace:"nowrap",
                  fontSize:"11px",fontWeight:isActive?"700":"500",
                  color:isActive?"#c8833a":"#9a7040",transition:"all 0.15s",flexShrink:0}}>
                {s.label}
                {cnt > 0 && <span style={{background:isActive?"#c8833a":s.bg||"#eee",color:isActive?"white":s.color||"#666",borderRadius:"10px",padding:"1px 6px",fontSize:"10px",marginLeft:"4px"}}>{cnt}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ORDER LIST ── */}
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"16px 14px 60px"}}>
        {orders === null && (
          <div style={{textAlign:"center",padding:"60px",color:"#9a7040",fontSize:"15px"}}>Loading orders…</div>
        )}
        {orders !== null && filtered.length === 0 && (
          <div style={{textAlign:"center",padding:"50px",background:"white",borderRadius:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:"40px",marginBottom:"10px"}}>{orders.length === 0 ? "📭" : "🔍"}</div>
            <p style={{color:"#9a7040",fontSize:"14px",margin:0}}>
              {orders.length === 0 ? "No orders yet — they'll appear here when customers submit." : "No orders with this status."}
            </p>
          </div>
        )}

        {filtered.map(order => {
          const st = order.status || "new";
          const sc = STATUS_MAP[st] || STATUS_MAP["new"];
          const isOpen = expanded === order.id;
          const d = order.design || {};
          const c = order.contact || {};
          const submittedDate = new Date(order.submitted_at || order.submittedAt);
          const dateStr = submittedDate.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
          const timeStr = submittedDate.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
          const tierInfo = LEI_TIERS.find(t => t.key === d.leiTier);
          const isPaid = st === "paid";
          const isAbandoned = st === "payment_abandoned";
          const isFailed = st === "payment_failed";
          const fulfillmentLabel = order.fulfillment === "pickup" ? "📍 Pickup 98391" : order.fulfillment === "shipping" ? "🚚 Ship" : "—";

          // Card border color based on priority
          let cardBorder = isOpen ? "#c8833a" : "transparent";
          if (isPaid && !isOpen) cardBorder = "#16a34a";
          if (isAbandoned && !isOpen) cardBorder = "#ca8a04";
          if (isFailed && !isOpen) cardBorder = "#dc2626";

          return (
            <div key={order.id}
              style={{background:"white",borderRadius:"16px",marginBottom:"12px",boxShadow:"0 2px 10px rgba(0,0,0,0.07)",overflow:"hidden",
                border:`2px solid ${cardBorder}`,transition:"border-color 0.2s",
                ...(isPaid ? {boxShadow:"0 4px 20px rgba(22,163,74,0.15)"} : {})}}>

              {/* Order row (always visible) */}
              <div onClick={() => setExpanded(isOpen ? null : order.id)}
                className="admin-row"
                style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:"12px",alignItems:"center",padding:"14px 16px",cursor:"pointer"}}>
                <div>
                  <div style={{fontWeight:"700",fontSize:"14px",color:"#3d1500",display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
                    {order.type === "lei"
                      ? (c.recipientName ? `🌺 ${c.recipientName}` : "🌺 Lei Order")
                      : `🔘 ${c.parentName || "Button Order"}`}
                    <span style={{fontWeight:"400",color:"#9a7040",fontSize:"12px"}}>
                      {order.type === "lei" ? `for ${c.parentName||"—"}` : ""}
                    </span>
                    {/* Fulfillment badge */}
                    {order.fulfillment && (
                      <span style={{background:"#f0f9ff",color:"#0369a1",fontSize:"10px",padding:"2px 7px",borderRadius:"10px",fontWeight:"600",border:"1px solid #bae6fd"}}>
                        {fulfillmentLabel}
                      </span>
                    )}
                  </div>
                  <div style={{fontSize:"11px",color:"#9a7040",marginTop:"3px",display:"flex",flexWrap:"wrap",gap:"4px",alignItems:"center"}}>
                    <span>{dateStr} {timeStr}</span>
                    <span>·</span>
                    <a href={`mailto:${c.email}`} onClick={e=>e.stopPropagation()} style={{color:"#c8833a"}}>{c.email}</a>
                    <span>·</span>
                    <a href={`tel:${c.phone}`} onClick={e=>e.stopPropagation()} style={{color:"#c8833a"}}>{c.phone}</a>
                  </div>
                  <div style={{fontSize:"11px",color:"#b08050",marginTop:"3px"}}>
                    {order.type === "lei"
                      ? `${tierInfo?.label||d.leiTier||"Lei"} · ${(d.colors||[]).join(", ")||"—"}${d.occasion?` · ${d.occasion}`:""}${d.customText?` · "${d.customText}"`:""}${d.wantsButton?` · Button: "${d.buttonText}"`:""}`
                      : `Button: "${d.buttonText||"—"}" × ${d.quantity||1}`}
                  </div>
                </div>
                <div style={{fontWeight:"800",fontSize:"15px",color:"#3d1500",whiteSpace:"nowrap"}}>${(order.total||0).toFixed(2)}</div>
                <span style={{background:sc.bg,color:sc.color,padding:"4px 9px",borderRadius:"20px",fontSize:"11px",fontWeight:"700",whiteSpace:"nowrap",border:`1px solid ${sc.color}22`}}>
                  {sc.label}
                </span>
                <span style={{color:"#c8833a",fontSize:"18px",transform:isOpen?"rotate(90deg)":"",transition:"transform 0.2s",display:"inline-block"}}>›</span>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div style={{borderTop:"1px solid #f0e8d8",background:"#fffdf8"}}>

                  {/* Contact + Design */}
                  <div className="admin-detail" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0",borderBottom:"1px solid #f0e8d8"}}>
                    <div style={{padding:"16px",borderRight:"1px solid #f0e8d8"}}>
                      <h4 style={{margin:"0 0 10px",color:"#5a3000",fontSize:"11px",textTransform:"uppercase",letterSpacing:"1px"}}>📋 Contact</h4>
                      <div style={{fontSize:"13px",color:"#5a4020",lineHeight:"2"}}>
                        <div><strong>Ordered by:</strong> {c.parentName || c.name || "—"}</div>
                        {order.type === "lei" && c.recipientName && <div><strong>Recipient:</strong> {c.recipientName}</div>}
                        {c.shippingAddress && <div><strong>Address:</strong> {c.shippingAddress}</div>}
                        <div><strong>Email:</strong> <a href={`mailto:${c.email}`} style={{color:"#c8833a",fontWeight:"600"}}>{c.email}</a></div>
                        <div><strong>Phone:</strong> <a href={`tel:${c.phone}`} style={{color:"#c8833a",fontWeight:"600"}}>{c.phone}</a></div>
                        <div><strong>Email Promo List:</strong> <span style={{color: c.emailOptIn ? "#2d7020" : "#b08050", fontWeight:"600"}}>{c.emailOptIn ? "✅ Opted in" : "✗ Opted out"}</span></div>
                        {c.notes && <div style={{marginTop:"6px",background:"#fef9ec",borderRadius:"8px",padding:"8px 10px",border:"1px solid #f0d88a",lineHeight:"1.5"}}><strong>Notes:</strong> {c.notes}</div>}
                      </div>
                    </div>
                    <div style={{padding:"16px"}}>
                      <h4 style={{margin:"0 0 10px",color:"#5a3000",fontSize:"11px",textTransform:"uppercase",letterSpacing:"1px"}}>🎨 Order Details</h4>
                      <div style={{fontSize:"13px",color:"#5a4020",lineHeight:"2"}}>
                        <div><strong>Type:</strong> {order.type === "lei" ? `${tierInfo?.label||d.leiTier||"—"}${d.wantsButton?" + Button":""}` : "Button"}</div>
                        {order.type === "lei" && <>
                          <div><strong>Qty:</strong> {d.quantity||1}</div>
                          <div><strong>Colors:</strong> {(d.colors||[]).join(", ")||"—"}</div>
                          {d.occasion && <div><strong>Occasion:</strong> {d.occasion}</div>}
                          {d.customText && <div><strong>Custom Text:</strong> "{d.customText}"</div>}
                          {d.wantsButton && <>
                            <div><strong>Button Text:</strong> "{d.buttonText}"</div>
                            {d.buttonColors?.length > 0 && <div><strong>Button Colors:</strong> {d.buttonColors.join(", ")}</div>}
                          </>}
                        </>}
                        {order.type === "button" && <>
                          <div><strong>Button Text:</strong> "{d.buttonText||"—"}"</div>
                          <div><strong>Qty:</strong> {d.quantity||1}</div>
                          {d.colors?.length > 0 && <div><strong>Colors:</strong> {d.colors.join(", ")}</div>}
                        </>}
                        <div style={{marginTop:"4px",fontWeight:"700",fontSize:"14px",color:"#3d1500"}}>Total: ${(order.total||0).toFixed(2)}</div>
                        <div><strong>Fulfillment:</strong> {order.fulfillment === "pickup" ? "📍 Local Pickup (98391)" : order.fulfillment === "shipping" ? "🚚 USPS Shipping" : "— (not yet chosen)"}</div>
                        {order.paid_at && <div><strong>Paid:</strong> {new Date(order.paid_at).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</div>}
                        {order.stripe_session_id && <div style={{fontSize:"11px",color:"#9a9a9a"}}>{order.stripe_session_id}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Status buttons */}
                  <div style={{padding:"16px 18px",borderBottom:"1px solid #f0e8d8"}}>
                    <div style={{fontSize:"10px",color:"#b08050",fontWeight:"700",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"1px"}}>📌 Order Status</div>
                    <div className="admin-status-row" style={{display:"flex",gap:"7px",flexWrap:"wrap"}}>
                      {ADMIN_STATUS_OPTIONS.map(key => {
                        const s = STATUS_MAP[key];
                        const isActive = st === key;
                        return (
                          <button key={key} onClick={() => setStatus(order, key)}
                            style={{padding:"7px 14px",borderRadius:"20px",border:`2px solid ${isActive?s.color:"#e5d5b5"}`,
                              background:isActive?s.color:"white",color:isActive?"white":"#9a7040",
                              cursor:"pointer",fontSize:"12px",fontWeight:"600",transition:"all 0.15s",
                              boxShadow:isActive?`0 2px 8px ${s.color}44`:"none"}}>
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                    {["payment_abandoned","payment_failed"].includes(st) && (
                      <div style={{marginTop:"10px",fontSize:"12px",color:st==="payment_failed"?"#991b1b":"#92400e",fontWeight:"600",background:st==="payment_failed"?"#fee2e2":"#fef9c3",padding:"6px 10px",borderRadius:"6px",display:"inline-block"}}>
                        {sc.label} — set automatically by Stripe
                      </div>
                    )}
                    {emailResult[order.id] && (
                      <div style={{marginTop:"10px",fontSize:"13px",color:"#166534",fontWeight:"700",background:"#dcfce7",padding:"6px 12px",borderRadius:"8px",display:"inline-block"}}>{emailResult[order.id]}</div>
                    )}
                  </div>

                  {/* Manual email buttons */}
                  <div style={{padding:"16px 18px",borderBottom:"1px solid #f0e8d8",background:"linear-gradient(135deg,#fff8ee,#fff4e6)"}}>
                    <div style={{fontSize:"10px",color:"#b08050",fontWeight:"700",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"1px"}}>📧 Email Customer</div>
                    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                      {[
                        {status:"making",    label:"🔨 We're Making It!",    bg:"#7c3aed",shadow:"#7c3aed44"},
                        {status:"ready",     label: order.fulfillment==="pickup" ? "📍 Ready for Pickup" : "📦 Shipped!", bg:"#059669",shadow:"#05966944"},
                        {status:"delivered", label:"✅ Delivered",            bg:"#0369a1",shadow:"#0369a144"},
                      ].map(btn => (
                        <button key={btn.status}
                          disabled={emailSending[order.id]}
                          onClick={() => sendStatusEmail(order, btn.status)}
                          style={{padding:"9px 16px",borderRadius:"10px",border:"none",
                            background:emailSending[order.id]?"#e5e7eb":btn.bg,
                            color:"white",cursor:emailSending[order.id]?"not-allowed":"pointer",
                            fontSize:"13px",fontWeight:"700",
                            boxShadow:emailSending[order.id]?"none":`0 3px 10px ${btn.shadow}`,
                            transition:"all 0.15s",opacity:emailSending[order.id]?0.6:1}}>
                          {emailSending[order.id] ? "Sending…" : btn.label}
                        </button>
                      ))}
                    </div>
                    <div style={{marginTop:"8px",fontSize:"11px",color:"#b08050"}}>Sends an email to the customer and updates order status.</div>
                  </div>

                  {/* Admin notes */}
                  <div style={{padding:"16px 18px",borderBottom:"1px solid #f0e8d8"}}>
                    <div style={{fontSize:"10px",color:"#b08050",fontWeight:"700",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"1px"}}>📝 Admin Notes</div>
                    <div style={{display:"flex",gap:"8px",alignItems:"flex-start"}}>
                      <textarea
                        value={notesDraft[order.id]||""}
                        onChange={e => setNotesDraft(prev=>({...prev,[order.id]:e.target.value}))}
                        placeholder="Pickup date, tracking #, special instructions…"
                        rows={2}
                        style={{flex:1,padding:"10px 13px",borderRadius:"10px",border:"1.5px solid #e0c89a",fontSize:"13px",fontFamily:"sans-serif",resize:"vertical",outline:"none",background:"#fffdf8",lineHeight:"1.5"}}
                      />
                      <button onClick={() => saveNotes(order.id)}
                        style={{padding:"10px 16px",borderRadius:"10px",background:"linear-gradient(135deg,#c8833a,#a85200)",color:"white",border:"none",cursor:"pointer",fontSize:"13px",fontWeight:"700",whiteSpace:"nowrap",boxShadow:"0 2px 8px rgba(168,82,0,0.3)"}}>
                        Save
                      </button>
                    </div>
                    {order.admin_notes && (
                      <div style={{marginTop:"8px",fontSize:"12px",color:"#7a5520",background:"#fef9ec",padding:"8px 12px",borderRadius:"8px",border:"1px solid #f0d88a",lineHeight:"1.5"}}>
                        <strong>Saved:</strong> {order.admin_notes}
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <div style={{padding:"12px 18px",display:"flex",justifyContent:"flex-end",background:"#fafaf8"}}>
                    <button onClick={() => deleteOrder(order.id)}
                      style={{padding:"7px 16px",borderRadius:"20px",border:"1.5px solid #fca5a5",
                        background:"white",color:"#dc2626",cursor:"pointer",fontSize:"12px",fontWeight:"600",transition:"all 0.15s"}}>
                      🗑 Delete Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState(window.location.hash === "#admin" ? "admin" : "gallery");
  const [loading, setLoading] = useState(false);
  const [orderConfig, setOrderConfig] = useState(null);

  useEffect(() => {
    if (window.location.hash !== "#admin") setLoading(true);
  }, []);

  useEffect(() => {
    const handler = () => setPage(window.location.hash === "#admin" ? "admin" : "gallery");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const handleOrderItem = (config) => {
    window.scrollTo(0, 0);
    if (config && config.page === 'button-order') {
      setPage('button-order');
      setOrderConfig(null);
    } else {
      setOrderConfig(config);
      setPage('order');
    }
  };

  return (
    <>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      {page === "admin" && <AdminPage />}
      {page === "gallery" && <GalleryPage onOrderItem={handleOrderItem} />}
      {page === "order" && <LeiOrderForm prePopulate={orderConfig?.prePopulate} initialTier={orderConfig?.tier} onBack={() => setPage('gallery')} onNavigate={handleOrderItem} />}
      {page === "button-order" && <ButtonOrderForm onBack={() => setPage('gallery')} onNavigate={handleOrderItem} />}
    </>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default App;

function LeiOrderForm({ prePopulate, initialTier, onBack, onNavigate }) {
  const [leiTier, setLeiTier] = useState(prePopulate?.tier || initialTier || 'classic');
  const [pulseField, setPulseField] = useState(null);

  // Design selections
  const [selectedColors, setSelectedColors] = useState(prePopulate?.colors || []);
  const [occasion, setOccasion] = useState(prePopulate?.occasion || "");
  const [customWords, setCustomWords] = useState(prePopulate?.text ? [prePopulate.text] : [""]);

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Button add-on
  const [wantsButton, setWantsButton] = useState(null);
  const [buttonText, setButtonText] = useState("");
  const [buttonColors, setButtonColors] = useState([]);

  // Fulfillment
  const [fulfillment, setFulfillment] = useState(null); // null | "shipping" | "pickup"

  // Contact info
  const [form, setForm] = useState({ parentName:"", email:"", phone:"", recipientName:"", shippingAddress:"", notes:"", emailOptIn: true });
  const [submitted, setSubmitted] = useState(null); // null = not submitted, or the saved order object
  const [previewTier, setPreviewTier] = useState(null); // for lei type image modal
  const [zoomedImg, setZoomedImg] = useState(null);    // for single-image zoom overlay

  // ── CUSTOM TEXT LOGIC ──
  const combinedText = customWords.filter(w => w.trim()).join(" ");
  const totalChars = combinedText.length;
  const MAX_CHARS = 15;
  const canAddWord = customWords.length < 3 && totalChars < MAX_CHARS - 1;

  const addWord = () => { if (canAddWord) setCustomWords([...customWords, ""]); };
  const updateWord = (i, val) => {
    const newWords = [...customWords];
    newWords[i] = val;
    const combined = newWords.filter(w => w.trim()).join(" ");
    if (combined.length <= MAX_CHARS) setCustomWords(newWords);
  };
  const removeWord = (i) => setCustomWords(customWords.filter((_,idx) => idx !== i));

  // ── PRICING ──
  const tierPrice = LEI_TIERS.find(t => t.key === leiTier)?.price || 35;
  const buttonAddOn = wantsButton ? BUTTON_PRICE : 0;
  const shippingCost = fulfillment === "shipping" ? SHIPPING_PRICE : 0;
  const total = (tierPrice + buttonAddOn) * quantity + shippingCost;

  // ── VALIDATION ──
  const formValid = selectedColors.length >= 2
    && isValidName(form.parentName) && isValidEmail(form.email) && isValidPhone(form.phone) && isValidName(form.recipientName)
    && wantsButton !== null
    && (wantsButton === false || (buttonText.trim().length > 0 && buttonColors.length >= 2))
    && fulfillment !== null
    && (fulfillment === "pickup" || form.shippingAddress.trim().length >= 8);

  const checklistItems = [
    { done: !!leiTier,                                    label: "Choose a lei type" },
    { done: selectedColors.length >= 2,                   label: "Select exactly 2 colors" },
    { done: wantsButton !== null,                          label: "Answer: Add a button?" },
    { done: !wantsButton || buttonText.trim().length > 0, label: "Enter button text", show: wantsButton === true },
    { done: !wantsButton || buttonColors.length >= 2,     label: "Select 2 button colors", show: wantsButton === true },
    { done: fulfillment !== null,                          label: "Choose shipping or pickup" },
    { done: fulfillment === "pickup" || form.shippingAddress.trim().length >= 8, label: "Enter ship-to address", show: fulfillment === "shipping" },
    { done: isValidName(form.parentName),                  label: "Your name (2+ characters)" },
    { done: isValidEmail(form.email),                      label: "Valid email address" },
    { done: isValidPhone(form.phone),                      label: "Valid phone number (10+ digits)" },
    { done: isValidName(form.recipientName),               label: "Recipient name (2+ characters)" },
  ];

  // ── SUBMIT ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const order = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      status: "new",
      type: 'lei',
      fulfillment,
      contact: { ...form },
      design: {
        leiTier,
        quantity,
        colors: selectedColors.map(c => c.name),
        occasion,
        customText: combinedText,
        wantsButton,
        buttonText: wantsButton ? buttonText : "",
        buttonColors: wantsButton ? buttonColors.map(c => c.name) : [],
      },
      total,
    };
    try {
      await saveOrder(order);
      const fulfillmentKey = fulfillment === "shipping" ? "ship" : "pickup";
      const useCombo = wantsButton === true;
      const stripeKey = useCombo
        ? `${leiTier}_button_${fulfillmentKey}_q${quantity}`
        : `${leiTier}_${fulfillmentKey}_q${quantity}`;
      const stripeBase = STRIPE_LINKS[stripeKey];
      const emailEnc = encodeURIComponent(form.email || "");
      if (stripeBase) {
        await updateOrder(order.id, { status: "payment_pending" });
        window.location.href = `${stripeBase}?client_reference_id=${order.id}__${fulfillment}&prefilled_email=${emailEnc}`;
      } else {
        setSubmitted(order); // fallback: show confirmation page if link lookup fails
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── SUCCESS STATE (fallback only — normally user is redirected straight to Stripe) ──
  if (submitted) {
    const tierInfo = LEI_TIERS.find(t => t.key === submitted.design.leiTier) || LEI_TIERS[0];
    const ordId = submitted.id;
    const emailEnc = encodeURIComponent(submitted.contact.email || "");
    const chosenFulfillment = submitted.fulfillment || "shipping";
    const fulfillmentKey = chosenFulfillment === "shipping" ? "ship" : "pickup";
    const qty = submitted.design.quantity || 1;
    const useCombo = submitted.design.wantsButton === true;
    const stripeKey = useCombo
      ? `${submitted.design.leiTier}_button_${fulfillmentKey}_q${qty}`
      : `${submitted.design.leiTier}_${fulfillmentKey}_q${qty}`;
    const payLink = `${STRIPE_LINKS[stripeKey]}?client_reference_id=${ordId}__${chosenFulfillment}&prefilled_email=${emailEnc}`;
    const isPickup = chosenFulfillment === "pickup";
    return (
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fdf6ec,#fce4b8)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Georgia',serif",padding:"24px"}}>
        <div style={{background:"white",borderRadius:"24px",padding:"36px 28px",textAlign:"center",maxWidth:"480px",width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:"44px",marginBottom:"6px"}}>🌺</div>
          <h2 style={{fontSize:"22px",color:"#5a3e1b",marginBottom:"6px",fontStyle:"italic"}}>Order Received!</h2>
          <p style={{color:"#8a6a40",lineHeight:"1.6",marginBottom:"4px",fontFamily:"sans-serif",fontSize:"13px"}}>
            Thank you, <strong>{submitted.contact.parentName}</strong>! We can't wait to make this for <strong>{submitted.contact.recipientName}</strong>. 🌸
          </p>

          {/* ── ACTION REQUIRED BANNER ── */}
          <div style={{background:"linear-gradient(135deg,#fff3cd,#ffe69c)",border:"2px solid #f59e0b",borderRadius:"14px",padding:"14px 16px",margin:"16px 0",fontFamily:"sans-serif"}}>
            <div style={{fontSize:"16px",fontWeight:"800",color:"#92400e",marginBottom:"4px"}}>⚠️ One more step — complete payment!</div>
            <div style={{fontSize:"12px",color:"#78350f",lineHeight:"1.5"}}>Your order is saved but <strong>not confirmed until payment is complete.</strong> Tap the button below to pay securely via Stripe.</div>
          </div>

          {/* Order summary */}
          <div style={{background:"#fdf6ec",borderRadius:"12px",padding:"12px 14px",textAlign:"left",fontSize:"13px",color:"#6a4e2a",fontFamily:"sans-serif",lineHeight:"1.8",marginBottom:"14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"2px",color:"#7a5520",alignItems:"center"}}>
              <span>{qty > 1 ? `${qty} × ` : ""}{tierInfo.label} — {submitted.design.colors.join(", ")}</span>
              <span>${(tierInfo.price * qty).toFixed(2)}</span>
            </div>
            {submitted.design.wantsButton && (
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"2px",color:"#7a5520"}}>
                <span>{qty > 1 ? `${qty} × ` : ""}Button Add-on</span><span>+${(BUTTON_PRICE * qty).toFixed(2)}</span>
              </div>
            )}
            {!isPickup && (
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"2px",color:"#7a5520"}}>
                <span>USPS Shipping</span><span>+${SHIPPING_PRICE.toFixed(2)}</span>
              </div>
            )}
            {isPickup && (
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"2px",color:"#059669"}}>
                <span>📍 Local Pickup</span><span>FREE</span>
              </div>
            )}
            <div style={{borderTop:"1px dashed #ddd",marginTop:"4px",paddingTop:"4px",display:"flex",justifyContent:"space-between",fontWeight:"700",fontSize:"14px",color:"#3d1500"}}>
              <span>Total Due</span><span>${submitted.total.toFixed(2)}</span>
            </div>
          </div>

          {/* ── PAY BUTTON ── */}
          <a href={payLink} target="_blank" rel="noopener noreferrer"
            style={{display:"block",background:"linear-gradient(135deg,#16a34a,#15803d)",color:"white",textDecoration:"none",borderRadius:"14px",padding:"18px 28px",fontSize:"18px",fontWeight:"800",boxShadow:"0 6px 24px rgba(22,163,74,0.4)",marginBottom:"6px",letterSpacing:"0.3px"}}>
            💳 Pay Now — ${submitted.total.toFixed(2)}
          </a>
          <p style={{color:"#9a7040",fontSize:"11px",marginBottom:"18px",fontFamily:"sans-serif"}}>
            Secure checkout via Stripe · {isPickup ? "📍 Local Pickup" : "🚚 USPS Shipping"}
          </p>

          {/* ── SECONDARY ACTIONS ── */}
          <div style={{display:"flex",gap:"16px",justifyContent:"center",borderTop:"1px solid #f0e8d8",paddingTop:"14px"}}>
            <button onClick={() => { setSubmitted(null); setSelectedColors([]); setQuantity(1); setOccasion(""); setCustomWords([""]); setWantsButton(null); setButtonText(""); setButtonColors([]); setFulfillment(null); setForm({parentName:"",email:"",phone:"",recipientName:"",shippingAddress:"",notes:"",emailOptIn:true}); window.scrollTo(0,0); }}
              style={{background:"none",color:"#b08050",border:"none",cursor:"pointer",fontSize:"12px",fontFamily:"sans-serif",textDecoration:"underline",padding:"4px"}}>
              Place Another Order
            </button>
            <button onClick={onBack}
              style={{background:"none",color:"#b08050",border:"none",cursor:"pointer",fontSize:"12px",fontFamily:"sans-serif",textDecoration:"underline",padding:"4px"}}>
              ← Back to Gallery
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#fdf6ec 0%,#fce8c0 55%,#fad9a0 100%)",fontFamily:"'Georgia','Times New Roman',serif"}}>
      {/* Header */}
      <div className="site-header" style={{background:"linear-gradient(160deg,#1e0d00,#3d1f00,#6b3200)",padding:"20px 24px 18px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,opacity:0.03,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",backgroundSize:"14px 14px"}}/>
        <div style={{position:"relative"}}>
          <h1 onClick={onBack} style={{color:"#FFD166",fontSize:"clamp(20px,4vw,36px)",margin:"0 0 4px",fontFamily:"'Georgia','Times New Roman',serif",fontWeight:"400",letterSpacing:"clamp(2px,1.5vw,8px)",textTransform:"uppercase",textShadow:"0 2px 20px rgba(0,0,0,0.4)",lineHeight:1.1,cursor:"pointer"}}>
            Buttons & Leis
          </h1>
          <p style={{color:"rgba(255,220,150,0.65)",margin:"0 0 14px",fontSize:"clamp(9px,1.8vw,11px)",letterSpacing:"clamp(1.5px,1vw,3px)",textTransform:"uppercase",fontFamily:"sans-serif",fontWeight:"400"}}>
            Handmade &nbsp;·&nbsp; Custom &nbsp;·&nbsp; With Love
          </p>
          <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={() => onNavigate && onNavigate({ tier:'classic', prePopulate:null })}
              style={{background:"linear-gradient(135deg,#c8833a,#a85200)",color:"white",border:"none",borderRadius:"10px",padding:"8px 20px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"sans-serif",letterSpacing:"0.5px",boxShadow:"0 3px 12px rgba(168,82,0,0.4)",width:"170px"}}>
              🌺 Order Lei
            </button>
            <button onClick={() => onNavigate && onNavigate({ page:'button-order' })}
              style={{background:"rgba(255,255,255,0.12)",color:"#FFD166",border:"2px solid rgba(255,209,102,0.4)",borderRadius:"10px",padding:"8px 20px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"sans-serif",letterSpacing:"0.5px",backdropFilter:"blur(4px)",width:"170px"}}>
              🔘 Order Button
            </button>
          </div>
        </div>
      </div>

      <div className="order-container" style={{maxWidth:"960px",margin:"0 auto",padding:"24px 18px 60px"}}>

        <button onClick={onBack}
          style={{background:"none",border:"none",color:"#c8833a",cursor:"pointer",fontSize:"13px",fontFamily:"sans-serif",fontWeight:"600",padding:"0 0 18px",display:"flex",alignItems:"center",gap:"5px"}}>
          ← Back to Home
        </button>

        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:"24px",alignItems:"start"}} className="order-grid">
          {/* LEFT COLUMN */}
          <div style={{display:"flex",flexDirection:"column",gap:"20px",minWidth:0}}>

            {/* LEI TYPE SELECTOR */}
            <div style={{background:"white",borderRadius:"20px",padding:"24px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <h3 style={{margin:"0 0 16px",color:"#5a3000",fontSize:"17px",fontFamily:"'Georgia',serif"}}>🌺 Which type of lei?</h3>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {LEI_TIERS.map(tier => (
                  <button key={tier.key} onClick={() => setLeiTier(tier.key)}
                    style={{
                      display:"flex",alignItems:"flex-start",justifyContent:"space-between",
                      padding:"14px 16px",borderRadius:"14px",border:"2px solid",
                      borderColor: leiTier===tier.key ? "#c8833a" : "#e0c89a",
                      background: leiTier===tier.key ? "#fdf0e0" : "white",
                      cursor:"pointer",fontFamily:"sans-serif",textAlign:"left",transition:"all 0.2s",
                      width:"100%",minWidth:0,
                    }}>
                    <div style={{flex:1,minWidth:0,overflow:"hidden"}}>
                      <div style={{fontWeight:"700",fontSize:"15px",color:leiTier===tier.key?"#7a3a00":"#3d1500",wordBreak:"break-word"}}>{tier.label}</div>
                      <div style={{fontSize:"12px",color:"#9a7040",marginTop:"3px",wordBreak:"break-word",lineHeight:"1.4",whiteSpace:"normal"}}>{tier.description}</div>
                      <button
                        onClick={e => { e.stopPropagation(); setPreviewTier(tier.key); }}
                        style={{marginTop:"7px",background:"none",border:`1px solid ${leiTier===tier.key?"#c8833a":"#d0a875"}`,borderRadius:"8px",padding:"3px 10px",fontSize:"11px",color:leiTier===tier.key?"#c8833a":"#9a7040",cursor:"pointer",fontFamily:"sans-serif",fontWeight:"600",display:"inline-flex",alignItems:"center",gap:"4px"}}>
                        👁 See examples
                      </button>
                    </div>
                    <div style={{fontWeight:"800",fontSize:"18px",color:leiTier===tier.key?"#c8833a":"#9a7040",flexShrink:0,marginLeft:"10px",paddingTop:"2px"}}>${tier.price}</div>
                  </button>
                ))}
              </div>
              <div style={{marginTop:"20px",paddingTop:"18px",borderTop:"1px dashed #e5c88a"}}>
                <label style={{display:"block",marginBottom:"10px",fontSize:"13px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600"}}>
                  Quantity
                </label>
                <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
                  <button onClick={() => setQuantity(Math.max(1, quantity-1))}
                    style={{width:"38px",height:"38px",borderRadius:"50%",border:"2px solid #e0c89a",background:"white",cursor:"pointer",fontSize:"22px",color:"#c8833a",fontWeight:"bold",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                  <span style={{fontSize:"24px",fontWeight:"700",color:"#3d1500",fontFamily:"sans-serif",minWidth:"32px",textAlign:"center"}}>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(3, quantity+1))}
                    style={{width:"38px",height:"38px",borderRadius:"50%",border:"2px solid #e0c89a",background:"white",cursor:quantity>=3?"not-allowed":"pointer",fontSize:"22px",color:quantity>=3?"#d0b88a":"#c8833a",fontWeight:"bold",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}
                    disabled={quantity >= 3}>+</button>
                  <span style={{fontFamily:"sans-serif",fontSize:"13px",color:"#9a7040"}}>(max 3)</span>
                </div>
              </div>
            </div>

            {/* COLORS */}
            <div id="field-colors" style={{borderRadius:"20px",border: pulseField==="field-colors" ? "2px solid #c83a3a" : "2px solid transparent",transition:"border-color 0.2s"}}>
              <ColorSection selectedColors={selectedColors} setSelectedColors={setSelectedColors} />
            </div>

            {/* OCCASION */}
            <div style={{background:"white",borderRadius:"20px",padding:"24px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <h3 style={{margin:"0 0 4px",color:"#5a3000",fontSize:"17px",fontFamily:"'Georgia',serif"}}>🎊 What is this lei for?</h3>
              <p style={{margin:"0 0 14px",fontSize:"12px",color:"#9a7040",fontFamily:"sans-serif"}}>
                e.g. Graduation, Birthday, Sports — this helps us add a thoughtful touch
              </p>
              <input type="text" placeholder="e.g. Graduation, Birthday, Anniversary..."
                value={occasion} onChange={e => setOccasion(e.target.value)}
                style={{width:"100%",boxSizing:"border-box",padding:"12px 16px",borderRadius:"12px",border:"1.5px solid #e5c88a",fontSize:"14px",fontFamily:"sans-serif",color:"#3d1500",background:"#fffdf8",outline:"none"}}
                onFocus={e => e.target.style.borderColor="#c8833a"}
                onBlur={e => e.target.style.borderColor="#e5c88a"}
              />
            </div>

            {/* CUSTOM TEXT */}
            <div style={{background:"white",borderRadius:"20px",padding:"24px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"4px"}}>
                <h3 style={{margin:0,color:"#5a3000",fontSize:"17px",fontFamily:"'Georgia',serif"}}>✍️ Custom Text</h3>
                <span style={{background:"#f0f8e8",color:"#3a7020",fontSize:"11px",padding:"3px 10px",borderRadius:"20px",fontFamily:"sans-serif",fontWeight:"600"}}>Optional</span>
              </div>
              <p style={{margin:"0 0 14px",fontSize:"12px",color:"#9a7040",fontFamily:"sans-serif"}}>
                Names, messages, or words woven into your lei · Max {MAX_CHARS} characters
              </p>
              {customWords.map((word, i) => (
                <div key={i} style={{display:"flex",gap:"8px",marginBottom:"10px",alignItems:"center"}}>
                  <input value={word}
                    onChange={e => updateWord(i, e.target.value)}
                    placeholder={i===0 ? "e.g. ALEX or CONGRATS" : "Another word..."}
                    maxLength={MAX_CHARS}
                    style={{flex:1,padding:"11px 14px",borderRadius:"10px",border:"1.5px solid #e5c88a",
                      fontSize:"15px",fontFamily:"'Georgia',serif",color:"#4a3010",background:"#fffdf8",
                      boxSizing:"border-box",outline:"none",letterSpacing:"1px"}}
                    onFocus={e => e.target.style.borderColor="#c8833a"}
                    onBlur={e => e.target.style.borderColor="#e5c88a"}/>
                  {customWords.length > 1 && (
                    <button onClick={() => removeWord(i)}
                      style={{width:"32px",height:"32px",borderRadius:"50%",border:"1px solid #e5c88a",background:"white",cursor:"pointer",color:"#c8833a",fontSize:"18px",lineHeight:1,flexShrink:0}}>×</button>
                  )}
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
                {canAddWord && (
                  <button onClick={addWord}
                    style={{background:"none",border:"1.5px dashed #c8833a",borderRadius:"10px",padding:"7px 16px",cursor:"pointer",color:"#c8833a",fontFamily:"sans-serif",fontSize:"13px",fontWeight:"600"}}>
                    + Add word
                  </button>
                )}
                <div style={{fontFamily:"sans-serif",fontSize:"12px",
                  color: totalChars===0?"#bbb": totalChars<MAX_CHARS?"#c8833a":"#c83a3a",fontWeight:"600",marginLeft:"auto"}}>
                  {totalChars}/{MAX_CHARS} chars
                </div>
              </div>
              {combinedText && (
                <div style={{marginTop:"10px",background:"#fdf6ec",border:"1px dashed #c8d080",borderRadius:"10px",padding:"10px 14px",fontFamily:"sans-serif",fontSize:"12px",color:"#5a4010"}}>
                  Preview on lei: <strong style={{letterSpacing:"2px",fontFamily:"'Georgia',serif"}}>{combinedText.toUpperCase()}</strong>
                </div>
              )}
            </div>

            {/* BUTTON ADD-ON */}
            <div id="field-button" style={{background:"white",borderRadius:"20px",padding:"24px",boxShadow: pulseField==="field-button" ? "0 0 0 3px rgba(200,58,58,0.5)" : "0 4px 20px rgba(0,0,0,0.06)",transition:"box-shadow 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"4px"}}>
                <h3 style={{margin:0,color:"#5a3000",fontSize:"17px",fontFamily:"'Georgia',serif"}}>🔘 Add a Personalized Button?</h3>
                <span style={{background:"#e8f0ff",color:"#3a4a8c",fontSize:"11px",padding:"3px 10px",borderRadius:"20px",fontFamily:"sans-serif",fontWeight:"600"}}>+$5</span>
              </div>
              <p style={{margin:"0 0 14px",fontSize:"12px",color:"#9a7040",fontFamily:"sans-serif"}}>A custom button pin to complement your lei</p>
              <div style={{display:"flex",gap:"10px",marginBottom:"14px"}}>
                {["Yes","No"].map(opt => (
                  <button key={opt} onClick={() => {
                      const val = opt === "Yes";
                      setWantsButton(val);
                      if (val && buttonColors.length === 0) setButtonColors([...selectedColors].slice(0, 2));
                    }}
                    style={{flex:1,padding:"12px",borderRadius:"12px",border:"2px solid",
                      borderColor: wantsButton===(opt==="Yes") ? "#5c6bbf":"#e0c89a",
                      background: wantsButton===(opt==="Yes") ? "#eef0ff":"white",
                      color: wantsButton===(opt==="Yes") ? "#3a4a9c":"#9a7040",
                      cursor:"pointer",fontSize:"14px",fontWeight:"600",fontFamily:"sans-serif",transition:"all 0.2s"}}>
                    {opt==="Yes"?"✅ Yes, +$5":"❌ No thanks"}
                  </button>
                ))}
              </div>
              {wantsButton === true && (
                <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                  <div>
                    <label style={{display:"block",fontSize:"12px",color:"#7a5520",fontFamily:"sans-serif",fontWeight:"600",marginBottom:"8px"}}>
                      What would you like on your button?
                    </label>
                    <input type="text" placeholder="e.g. CLASS OF 2025, ALEX, GO BEARS"
                      value={buttonText} onChange={e => setButtonText(e.target.value)} maxLength={30}
                      style={{width:"100%",boxSizing:"border-box",padding:"11px 14px",borderRadius:"10px",border:"1.5px solid #e5c88a",fontSize:"14px",fontFamily:"sans-serif",color:"#3d1500",background:"#fffdf8",outline:"none"}}
                      onFocus={e => e.target.style.borderColor="#c8833a"}
                      onBlur={e => e.target.style.borderColor="#e5c88a"}
                    />
                  </div>
                  <div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"4px"}}>
                      <label style={{fontSize:"12px",color:"#7a5520",fontFamily:"sans-serif",fontWeight:"600"}}>Button Colors</label>
                      <span style={{fontFamily:"sans-serif",fontSize:"12px",color:buttonColors.length===2?"#2d7020":"#c8400a",fontWeight:"600"}}>{buttonColors.length}/2 selected</span>
                    </div>
                    <p style={{margin:"0 0 10px",fontSize:"11px",color:"#9a7040",fontFamily:"sans-serif"}}>Choose exactly 2 · Selecting a 3rd replaces the 1st</p>
                    <div style={{overflowX:"auto",padding:"6px 4px 6px 6px"}}>
                      <div style={{display:"flex",flexDirection:"column",gap:GRID_GAP,minWidth:"fit-content"}}>
                        {COLOR_ROWS.slice(0,2).map((row, ri) => (
                          <ColorRow key={ri} row={row} selectedColors={buttonColors} toggleColor={(color) => {
                            const isSel = buttonColors.find(c => c.name === color.name);
                            if (isSel) setButtonColors(buttonColors.filter(c => c.name !== color.name));
                            else if (buttonColors.length < 2) setButtonColors([...buttonColors, color]);
                            else setButtonColors([buttonColors[1], color]);
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {buttonText.trim() && buttonColors.length >= 2 && (
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"11px",color:"#9a7040",fontFamily:"sans-serif",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Button Preview</div>
                      <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"90px",height:"90px",borderRadius:"50%",background:buttonColors[0].hex,border:"3px solid #c8833a",boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>
                        <div style={{background:buttonColors[1].hex,borderRadius:"50%",width:"78px",height:"78px",display:"flex",alignItems:"center",justifyContent:"center",padding:"6px",boxSizing:"border-box"}}>
                          <span style={{color:"white",fontFamily:"sans-serif",fontWeight:"900",fontSize:buttonText.length > 12 ? "8px" : buttonText.length > 8 ? "10px" : "12px",textAlign:"center",textTransform:"uppercase",letterSpacing:"0.5px",lineHeight:"1.2",wordBreak:"break-word"}}>{buttonText}</span>
                        </div>
                      </div>
                      <div style={{fontSize:"11px",color:"#b08050",fontFamily:"sans-serif",marginTop:"6px"}}>Approximate preview</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FULFILLMENT SELECTOR */}
            <div id="field-fulfillment" style={{background:"white",borderRadius:"20px",padding:"28px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <h3 style={{margin:"0 0 6px",color:"#5a3000",fontSize:"18px",fontFamily:"'Georgia',serif"}}>📦 Shipping or Pickup?</h3>
              <p style={{margin:"0 0 18px",color:"#9a7040",fontSize:"13px",fontFamily:"sans-serif"}}>Choose how you'd like to receive your order</p>
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <button onClick={() => setFulfillment("shipping")}
                  style={{display:"flex",alignItems:"flex-start",gap:"14px",padding:"16px",borderRadius:"14px",border:`2px solid ${fulfillment==="shipping"?"#635bff":"#e5c88a"}`,background:fulfillment==="shipping"?"#f8f4ff":"white",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                  <span style={{fontSize:"24px",marginTop:"2px"}}>🚚</span>
                  <div>
                    <div style={{fontWeight:"700",fontSize:"14px",color:"#3d1500",fontFamily:"sans-serif"}}>Ship via USPS (+${SHIPPING_PRICE.toFixed(2)})</div>
                    <div style={{fontSize:"12px",color:"#9a7040",fontFamily:"sans-serif",marginTop:"2px"}}>Flat-rate priority shipping to anywhere in the US. Enter your address below.</div>
                  </div>
                  {fulfillment==="shipping" && <span style={{marginLeft:"auto",color:"#635bff",fontSize:"18px",fontWeight:"700"}}>✓</span>}
                </button>
                <button onClick={() => setFulfillment("pickup")}
                  style={{display:"flex",alignItems:"flex-start",gap:"14px",padding:"16px",borderRadius:"14px",border:`2px solid ${fulfillment==="pickup"?"#059669":"#e5c88a"}`,background:fulfillment==="pickup"?"#f0fdf4":"white",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                  <span style={{fontSize:"24px",marginTop:"2px"}}>📍</span>
                  <div>
                    <div style={{fontWeight:"700",fontSize:"14px",color:"#3d1500",fontFamily:"sans-serif"}}>Local Pickup — FREE</div>
                    <div style={{fontSize:"12px",color:"#9a7040",fontFamily:"sans-serif",marginTop:"2px"}}>Available in the <strong>98391 area only</strong> (Bonney Lake / Sumner, WA). Once your product is ready, we'll email you to coordinate a convenient drop-off time and location.</div>
                  </div>
                  {fulfillment==="pickup" && <span style={{marginLeft:"auto",color:"#059669",fontSize:"18px",fontWeight:"700"}}>✓</span>}
                </button>
              </div>
            </div>

            {/* CONTACT FORM */}
            <div id="field-contact" style={{background:"white",borderRadius:"20px",padding:"28px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <h3 style={{margin:"0 0 20px",color:"#5a3000",fontSize:"18px",fontFamily:"'Georgia',serif"}}>👤 Your Information</h3>
              {/* parentName */}
              <div id="field-parentName" style={{marginBottom:"16px"}}>
                <label style={{display:"block",marginBottom:"5px",fontSize:"12px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600",letterSpacing:"0.3px"}}>Your Name *</label>
                <input type="text" placeholder="Jane Smith" value={form.parentName}
                  onChange={e => setForm({...form, parentName:e.target.value})}
                  style={{width:"100%",padding:"12px 14px",borderRadius:"10px",border:`1.5px solid ${form.parentName && !isValidName(form.parentName) ? "#dc2626" : "#e5c88a"}`,
                    fontSize:"14px",fontFamily:"sans-serif",color:"#4a3010",background:"#fffdf8",boxSizing:"border-box",outline:"none"}}
                  onFocus={e=>e.target.style.borderColor="#c8833a"}
                  onBlur={e=>e.target.style.borderColor=(form.parentName && !isValidName(form.parentName) ? "#dc2626" : "#e5c88a")}/>
                {form.parentName && !isValidName(form.parentName) && (
                  <p style={{margin:"4px 0 0",fontSize:"11px",color:"#dc2626",fontFamily:"sans-serif"}}>Please enter your full name (at least 2 characters)</p>
                )}
              </div>

              {/* email */}
              <div id="field-email" style={{marginBottom:"8px"}}>
                <label style={{display:"block",marginBottom:"5px",fontSize:"12px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600",letterSpacing:"0.3px"}}>Email Address *</label>
                <input type="email" placeholder="jane@email.com" value={form.email}
                  onChange={e => setForm({...form, email:e.target.value})}
                  style={{width:"100%",padding:"12px 14px",borderRadius:"10px",border:`1.5px solid ${form.email && !isValidEmail(form.email) ? "#dc2626" : "#e5c88a"}`,
                    fontSize:"14px",fontFamily:"sans-serif",color:"#4a3010",background:"#fffdf8",boxSizing:"border-box",outline:"none"}}
                  onFocus={e=>e.target.style.borderColor="#c8833a"}
                  onBlur={e=>e.target.style.borderColor=(form.email && !isValidEmail(form.email) ? "#dc2626" : "#e5c88a")}/>
                {form.email && !isValidEmail(form.email) && (
                  <p style={{margin:"4px 0 0",fontSize:"11px",color:"#dc2626",fontFamily:"sans-serif"}}>Please enter a valid email address (e.g. jane@email.com)</p>
                )}
              </div>

              {/* email opt-in */}
              <div style={{marginBottom:"16px",padding:"10px 12px",background:"#fdf8ef",borderRadius:"8px",border:"1px solid #e5c88a"}}>
                <label style={{display:"flex",alignItems:"center",gap:"9px",cursor:"pointer",fontSize:"12px",color:"#7a5520",fontFamily:"sans-serif",fontWeight:"600",userSelect:"none"}}>
                  <input type="checkbox" checked={form.emailOptIn}
                    onChange={e => setForm({...form, emailOptIn:e.target.checked})}
                    style={{width:"16px",height:"16px",accentColor:"#c8833a",cursor:"pointer",flexShrink:0}}/>
                  ✉️ Send me order status & promotions via email
                </label>
              </div>

              {/* phone */}
              <div id="field-phone" style={{marginBottom:"16px"}}>
                <label style={{display:"block",marginBottom:"5px",fontSize:"12px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600",letterSpacing:"0.3px"}}>Phone Number *</label>
                <input type="tel" placeholder="(555) 123-4567" value={form.phone}
                  onChange={e => setForm({...form, phone:e.target.value})}
                  style={{width:"100%",padding:"12px 14px",borderRadius:"10px",border:`1.5px solid ${form.phone && !isValidPhone(form.phone) ? "#dc2626" : "#e5c88a"}`,
                    fontSize:"14px",fontFamily:"sans-serif",color:"#4a3010",background:"#fffdf8",boxSizing:"border-box",outline:"none"}}
                  onFocus={e=>e.target.style.borderColor="#c8833a"}
                  onBlur={e=>e.target.style.borderColor=(form.phone && !isValidPhone(form.phone) ? "#dc2626" : "#e5c88a")}/>
                {form.phone && !isValidPhone(form.phone) && (
                  <p style={{margin:"4px 0 0",fontSize:"11px",color:"#dc2626",fontFamily:"sans-serif"}}>Please enter a valid phone number (10+ digits)</p>
                )}
              </div>

              {/* recipientName */}
              <div id="field-recipientName" style={{marginBottom:"16px"}}>
                <label style={{display:"block",marginBottom:"5px",fontSize:"12px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600",letterSpacing:"0.3px"}}>Recipient's Name *</label>
                <input type="text" placeholder="Alex Smith" value={form.recipientName}
                  onChange={e => setForm({...form, recipientName:e.target.value})}
                  style={{width:"100%",padding:"12px 14px",borderRadius:"10px",border:`1.5px solid ${form.recipientName && !isValidName(form.recipientName) ? "#dc2626" : "#e5c88a"}`,
                    fontSize:"14px",fontFamily:"sans-serif",color:"#4a3010",background:"#fffdf8",boxSizing:"border-box",outline:"none"}}
                  onFocus={e=>e.target.style.borderColor="#c8833a"}
                  onBlur={e=>e.target.style.borderColor=(form.recipientName && !isValidName(form.recipientName) ? "#dc2626" : "#e5c88a")}/>
                {form.recipientName && !isValidName(form.recipientName) && (
                  <p style={{margin:"4px 0 0",fontSize:"11px",color:"#dc2626",fontFamily:"sans-serif"}}>Please enter the recipient's name (at least 2 characters)</p>
                )}
              </div>
              {/* Only show shipping address if shipping is selected */}
              {fulfillment === "shipping" && (
                <div id="field-shippingAddress" style={{marginBottom:"16px"}}>
                  <label style={{display:"block",marginBottom:"5px",fontSize:"12px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600",letterSpacing:"0.3px"}}>Ship-to Address *</label>
                  <input type="text" placeholder="123 Main St, City, State ZIP"
                    value={form.shippingAddress}
                    onChange={e => setForm({...form, shippingAddress:e.target.value})}
                    style={{width:"100%",padding:"12px 14px",borderRadius:"10px",border:"1.5px solid #e5c88a",
                      fontSize:"14px",fontFamily:"sans-serif",color:"#4a3010",background:"#fffdf8",
                      boxSizing:"border-box",outline:"none"}}
                    onFocus={e=>e.target.style.borderColor="#c8833a"}
                    onBlur={e=>e.target.style.borderColor="#e5c88a"}/>
                </div>
              )}
              <div style={{marginBottom:"20px"}}>
                <label style={{display:"block",marginBottom:"5px",fontSize:"12px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600"}}>Special Notes / Instructions</label>
                <textarea placeholder="Ceremony date, any other requests..."
                  value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={3}
                  style={{width:"100%",padding:"12px 14px",borderRadius:"10px",border:"1.5px solid #e5c88a",
                    fontSize:"14px",fontFamily:"sans-serif",color:"#4a3010",background:"#fffdf8",
                    boxSizing:"border-box",resize:"vertical",outline:"none"}}/>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN — Preview + Price + Checklist (sticky) */}
          <div className="sticky-right-col" style={{position:"sticky",top:"16px",alignSelf:"start",display:"flex",flexDirection:"column",gap:"16px",minWidth:0}}>
            <div style={{background:"white",borderRadius:"20px",padding:"22px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
                <h3 style={{margin:0,color:"#5a3000",fontSize:"15px",fontFamily:"'Georgia',serif"}}>🌺 Lei Preview</h3>
                <button onClick={() => setPreviewTier(leiTier)}
                  style={{background:"none",border:"1px solid #d0a875",borderRadius:"8px",padding:"4px 12px",fontSize:"11px",color:"#9a7040",cursor:"pointer",fontFamily:"sans-serif",fontWeight:"600",display:"inline-flex",alignItems:"center",gap:"4px"}}>
                  👁 See examples
                </button>
              </div>
              <LeiDrapePreview
                colors={selectedColors}
                hasMoney={leiTier==='money'} billDenom={1} billCount={20}
                themes={[]} customText={combinedText} />
            </div>
            <PricingCard leiTier={leiTier} wantsButton={wantsButton===true} colors={selectedColors} fulfillment={fulfillment} quantity={quantity} />

            {/* Submit card */}
            <div style={{background:"white",borderRadius:"20px",padding:"20px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <button onClick={formValid && !isSubmitting ? handleSubmit : () => {
                  if (!formValid) {
                    const candidates = [
                      { id: "field-colors",          incomplete: selectedColors.length < 2 },
                      { id: "field-button",           incomplete: wantsButton === null || (wantsButton === true && (!buttonText.trim() || buttonColors.length < 2)) },
                      { id: "field-fulfillment",      incomplete: fulfillment === null },
                      { id: "field-shippingAddress",  incomplete: fulfillment === "shipping" && !form.shippingAddress.trim() },
                      { id: "field-contact",          incomplete: !form.parentName || !form.email || !form.phone || !form.recipientName },
                    ];
                    const first = candidates.find(c => c.incomplete);
                    if (first) {
                      const el = document.getElementById(first.id);
                      if (el) {
                        const top = el.getBoundingClientRect().top + window.scrollY - 20;
                        window.scrollTo({top, behavior:"smooth"});
                      }
                      if (first.id === "field-colors" || first.id === "field-button") {
                        setPulseField(first.id);
                        setTimeout(() => setPulseField(null), 2000);
                      }
                    }
                  }
                }}
                disabled={isSubmitting}
                style={{
                  width:"100%",
                  background: formValid ? "linear-gradient(135deg,#c8833a,#a85200)":"#d9c4a0",
                  color:"white",border:"none",borderRadius:"14px",padding:"17px",
                  fontSize:"16px",fontWeight:"700",
                  cursor: isSubmitting ? "wait" : formValid ? "pointer" : "not-allowed",
                  fontFamily:"sans-serif",letterSpacing:"0.5px",
                  boxShadow: formValid ? "0 6px 20px rgba(168,82,0,0.35)":"none",
                  opacity: isSubmitting ? 0.7 : 1,
                  transition:"opacity 0.2s",
                }}>
                {isSubmitting ? "⏳ Saving & redirecting to payment…" : "🌺 Submit & Pay →"}
              </button>
              <div style={{background:"#fdf8f0",borderRadius:"10px",padding:"12px 14px",marginTop:"14px",marginBottom:"0",border:"1px solid #edd9a0",fontSize:"12px",color:"#7a5520",fontFamily:"sans-serif",lineHeight:"1.8"}}>
                💰 Payment via <strong>Stripe</strong> — no account required.
              </div>
              <ValidationChecklist items={checklistItems} />
            </div>
          </div>
        </div>
      </div>

      {/* ── SINGLE IMAGE ZOOM OVERLAY ── */}
      {zoomedImg && (
        <div onClick={() => setZoomedImg(null)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:99999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px"}}>
          <button onClick={() => setZoomedImg(null)}
            style={{position:"absolute",top:"14px",right:"14px",background:"rgba(255,255,255,0.18)",border:"2px solid rgba(255,255,255,0.3)",color:"white",width:"44px",height:"44px",borderRadius:"50%",fontSize:"20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>✕</button>
          <img src={zoomedImg.src} alt={zoomedImg.caption}
            style={{maxWidth:"100%",maxHeight:"82vh",objectFit:"contain",borderRadius:"14px",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}
            onClick={e => e.stopPropagation()}/>
          {zoomedImg.caption && (
            <div style={{color:"rgba(255,255,255,0.85)",fontSize:"13px",fontFamily:"sans-serif",marginTop:"12px",textAlign:"center",fontWeight:"600"}}>{zoomedImg.caption}</div>
          )}
        </div>
      )}

      {/* ── LEI TYPE PREVIEW MODAL ── */}
      {previewTier && (() => {
        const tierImages = GALLERY_ITEMS.filter(g => g.tier === previewTier);
        const tierLabel = LEI_TIERS.find(t => t.key === previewTier)?.label || previewTier;
        return (
          <div onClick={() => setPreviewTier(null)}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
            <div onClick={e => e.stopPropagation()}
              className="example-modal-inner"
              style={{background:"white",borderRadius:"20px",padding:"24px",maxWidth:"620px",width:"100%",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
                <h3 style={{margin:0,color:"#5a3000",fontFamily:"Georgia,serif",fontSize:"18px"}}>🌺 {tierLabel} — Examples</h3>
                <button onClick={() => setPreviewTier(null)}
                  style={{background:"none",border:"none",fontSize:"24px",cursor:"pointer",color:"#9a7040",lineHeight:1,padding:"4px"}}>✕</button>
              </div>
              {tierImages.length > 0 ? (
                <div className="example-modal-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"12px"}}>
                  {tierImages.map((img, i) => (
                    <div key={i} style={{borderRadius:"12px",overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.12)",cursor:"zoom-in"}}
                      onClick={() => setZoomedImg({src:img.src,caption:img.caption})}>
                      <img src={img.src} alt={img.caption} style={{width:"100%",display:"block",objectFit:"cover",aspectRatio:"1"}} />
                      <div style={{padding:"8px 10px",fontSize:"11px",color:"#7a5520",fontFamily:"sans-serif",textAlign:"center",lineHeight:"1.4"}}>{img.caption}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{textAlign:"center",color:"#9a7040",fontFamily:"sans-serif",padding:"20px 0"}}>No examples yet — check back soon! 🌸</p>
              )}
              <div style={{marginTop:"16px",textAlign:"center"}}>
                <button onClick={() => setPreviewTier(null)}
                  style={{background:"linear-gradient(135deg,#c8833a,#a85200)",color:"white",border:"none",borderRadius:"12px",padding:"10px 28px",fontSize:"14px",fontWeight:"700",cursor:"pointer",fontFamily:"sans-serif"}}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        * { box-sizing: border-box; }

        /* ── PREVENT HORIZONTAL OVERFLOW ── */
        html, body { overflow-x: clip; }

        /* ── HIDE STICKY COLUMN SCROLLBAR ── */
        .sticky-right-col::-webkit-scrollbar { display: none; }

        /* ── ORDER GRID RESPONSIVE ── */
        @media (max-width: 700px) {
          .order-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          /* On mobile, right column unsticks and loses its scroll wrapper */
          .order-grid > div:last-child {
            position: static !important;
            top: auto !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
          .order-grid > * { min-width: 0; }
        }

        /* ── TOUCH TARGETS ── */
        @media (hover: none) and (pointer: coarse) {
          input, textarea, select { font-size: 16px !important; }
          button { min-height: 44px; }
        }

        /* ── GALLERY GRID ── */
        @media (max-width: 520px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
        }
        @media (max-width: 340px) {
          .gallery-grid { grid-template-columns: 1fr !important; }
        }

        /* ── SITE HEADER (order forms) ── */
        @media (max-width: 480px) {
          .site-header { padding: 16px 12px 14px !important; }
          .site-header h1 { font-size: 20px !important; letter-spacing: 2px !important; margin-bottom: 3px !important; }
          .site-header p { font-size: 9px !important; letter-spacing: 1.5px !important; }
        }

        /* ── GALLERY HERO HEADER ── */
        @media (max-width: 480px) {
          .gallery-hero { padding: 28px 14px 24px !important; }
          .gallery-hero h1 { font-size: 26px !important; letter-spacing: 3px !important; margin-bottom: 8px !important; }
          .gallery-hero p { font-size: 9px !important; letter-spacing: 2px !important; margin-bottom: 16px !important; }
          .hero-btn { padding: 11px 16px !important; font-size: 13px !important; }
        }

        /* ── OUTER CONTAINER PADDING ── */
        @media (max-width: 480px) {
          .order-container { padding: 14px 10px 48px !important; }
          .gallery-container { padding: 20px 12px 48px !important; }
        }

        /* ── MODAL INNER ── */
        @media (max-width: 480px) {
          .example-modal-inner { padding: 18px 14px !important; border-radius: 16px !important; max-height: 90vh !important; }
          .example-modal-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
        }

        /* ── ADMIN ── */
        @media (max-width: 600px) {
          .admin-row { grid-template-columns: 1fr auto auto !important; gap: 8px !important; }
          .admin-row > span:last-child { grid-column: 3; }
          .admin-detail { grid-template-columns: 1fr !important; }
          .admin-status-row { flex-wrap: wrap !important; }
        }
        @media (max-width: 400px) {
          .admin-row { grid-template-columns: 1fr auto !important; }
        }

        /* ── LOADER ── */
        @media (max-width: 480px) {
          .loader-title { font-size: 28px !important; letter-spacing: 2px !important; white-space: nowrap !important; }
          .loader-subtitle { font-size: 11px !important; letter-spacing: 2px !important; }
        }

        /* ── FAQ ── */
        @media (max-width: 480px) {
          .faq-section { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}

function ButtonOrderForm({ onBack, onNavigate }) {
  const [buttonText, setButtonText] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);
  const [showMoreColors, setShowMoreColors] = useState(false);
  const [customBtnHex, setCustomBtnHex] = useState("#ff69b4");
  const [customBtnAdded, setCustomBtnAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [fulfillment, setFulfillment] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", phone:"", shippingAddress:"", notes:"", emailOptIn: true });
  const [submitted, setSubmitted] = useState(null);
  const [showButtonExamples, setShowButtonExamples] = useState(false);
  const [zoomedImg, setZoomedImg] = useState(null);

  const shippingCost = fulfillment === "shipping" ? SHIPPING_PRICE : 0;
  const total = quantity * BUTTON_PRICE + shippingCost;

  const toggleBtnColor = (color) => {
    const isSel = selectedColors.find(c => c.name === color.name);
    if (isSel) setSelectedColors(selectedColors.filter(c => c.name !== color.name));
    else if (selectedColors.length < 2) setSelectedColors([...selectedColors, color]);
    else setSelectedColors([selectedColors[1], color]);
  };

  const addCustomBtnColor = () => {
    const custom = { name: "Custom", hex: customBtnHex, dark: false, custom: true };
    const existing = selectedColors.findIndex(c => c.custom);
    if (existing >= 0) {
      const updated = [...selectedColors]; updated[existing] = custom; setSelectedColors(updated);
    } else if (selectedColors.length < 2) {
      setSelectedColors([...selectedColors, custom]);
    } else {
      setSelectedColors([selectedColors[1], custom]);
    }
    setCustomBtnAdded(true);
    setTimeout(() => setCustomBtnAdded(false), 1500);
  };

  const formValid = buttonText.trim().length > 0 && selectedColors.length >= 2
    && isValidName(form.name) && isValidEmail(form.email) && isValidPhone(form.phone)
    && fulfillment !== null
    && (fulfillment === "pickup" || form.shippingAddress.trim().length >= 8);

  const buttonChecklistItems = [
    { done: buttonText.trim().length > 0,  label: "Enter button text" },
    { done: selectedColors.length >= 2,    label: "Select exactly 2 colors" },
    { done: fulfillment !== null,           label: "Choose shipping or pickup" },
    { done: !!form.shippingAddress.trim(),  label: "Enter ship-to address", show: fulfillment === "shipping" },
    { done: isValidName(form.name),          label: "Your name (2+ characters)" },
    { done: isValidEmail(form.email),        label: "Valid email address" },
    { done: isValidPhone(form.phone),        label: "Valid phone number (10+ digits)" },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const order = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      status: "new",
      type: 'button',
      fulfillment,
      contact: { parentName: form.name, name: form.name, email: form.email, phone: form.phone, shippingAddress: form.shippingAddress, notes: form.notes },
      design: { buttonText, quantity, colors: selectedColors.map(c => c.name) },
      total,
    };
    try {
      await saveOrder(order);
      const fulfillmentKey = fulfillment === "shipping" ? "ship" : "pickup";
      const stripeBase = STRIPE_LINKS[`button_${fulfillmentKey}_q${quantity}`];
      const emailEnc = encodeURIComponent(form.email || "");
      if (stripeBase) {
        await updateOrder(order.id, { status: "payment_pending" });
        window.location.href = `${stripeBase}?client_reference_id=${order.id}__${fulfillment}&prefilled_email=${emailEnc}`;
      } else {
        setSubmitted(order); // fallback
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── SUCCESS STATE (fallback only — normally user is redirected straight to Stripe) ──
  if (submitted) {
    const ordId = submitted.id;
    const emailEnc = encodeURIComponent(submitted.contact.email || "");
    const chosenFulfillment = submitted.fulfillment || "shipping";
    const fulfillmentKey = chosenFulfillment === "shipping" ? "ship" : "pickup";
    const qty = submitted.design.quantity || 1;
    const payLink = `${STRIPE_LINKS[`button_${fulfillmentKey}_q${qty}`]}?client_reference_id=${ordId}__${chosenFulfillment}&prefilled_email=${emailEnc}`;
    const isPickup = chosenFulfillment === "pickup";
    return (
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fdf6ec,#fce4b8)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Georgia',serif",padding:"24px"}}>
        <div style={{background:"white",borderRadius:"24px",padding:"36px 28px",textAlign:"center",maxWidth:"440px",width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:"44px",marginBottom:"6px"}}>🔘</div>
          <h2 style={{fontSize:"22px",color:"#5a3e1b",marginBottom:"6px",fontStyle:"italic"}}>Order Received!</h2>
          <p style={{color:"#8a6a40",lineHeight:"1.6",marginBottom:"4px",fontFamily:"sans-serif",fontSize:"13px"}}>
            Thank you, <strong>{submitted.contact.name}</strong>! 🎉
          </p>

          {/* ── ACTION REQUIRED BANNER ── */}
          <div style={{background:"linear-gradient(135deg,#fff3cd,#ffe69c)",border:"2px solid #f59e0b",borderRadius:"14px",padding:"14px 16px",margin:"14px 0",fontFamily:"sans-serif"}}>
            <div style={{fontSize:"16px",fontWeight:"800",color:"#92400e",marginBottom:"4px"}}>⚠️ One more step — complete payment!</div>
            <div style={{fontSize:"12px",color:"#78350f",lineHeight:"1.5"}}>Your order is saved but <strong>not confirmed until payment is complete.</strong> Tap below to pay securely via Stripe.</div>
          </div>

          {/* Order summary */}
          <div style={{background:"#fdf6ec",borderRadius:"12px",padding:"12px 14px",textAlign:"left",fontSize:"13px",color:"#6a4e2a",fontFamily:"sans-serif",lineHeight:"1.8",marginBottom:"14px"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>{qty > 1 ? `${qty} × ` : ""}Button: "{submitted.design.buttonText}"</span><span>${(BUTTON_PRICE * qty).toFixed(2)}</span></div>
            {!isPickup && <div style={{display:"flex",justifyContent:"space-between",color:"#7a5520"}}><span>USPS Shipping</span><span>+${SHIPPING_PRICE.toFixed(2)}</span></div>}
            {isPickup && <div style={{display:"flex",justifyContent:"space-between",color:"#059669"}}><span>📍 Local Pickup</span><span>FREE</span></div>}
            <div style={{borderTop:"1px dashed #ddd",marginTop:"4px",paddingTop:"4px",display:"flex",justifyContent:"space-between",fontWeight:"700",fontSize:"14px",color:"#3d1500"}}>
              <span>Total Due</span><span>${submitted.total.toFixed(2)}</span>
            </div>
          </div>

          {/* ── PAY BUTTON ── */}
          <a href={payLink} target="_blank" rel="noopener noreferrer"
            style={{display:"block",background:"linear-gradient(135deg,#16a34a,#15803d)",color:"white",textDecoration:"none",borderRadius:"14px",padding:"18px 28px",fontSize:"18px",fontWeight:"800",boxShadow:"0 6px 24px rgba(22,163,74,0.4)",marginBottom:"6px",letterSpacing:"0.3px"}}>
            💳 Pay Now — ${submitted.total.toFixed(2)}
          </a>
          <p style={{color:"#9a7040",fontSize:"11px",marginBottom:"18px",fontFamily:"sans-serif"}}>
            Secure checkout via Stripe · {isPickup ? "📍 Local Pickup" : "🚚 USPS Shipping"}
          </p>

          {/* ── SECONDARY ACTIONS ── */}
          <div style={{display:"flex",gap:"16px",justifyContent:"center",borderTop:"1px solid #f0e8d8",paddingTop:"14px"}}>
            <button onClick={() => { setSubmitted(null); setButtonText(''); setSelectedColors([]); setQuantity(1); setFulfillment(null); setForm({name:"",email:"",phone:"",shippingAddress:"",notes:"",emailOptIn:true}); window.scrollTo(0,0); }}
              style={{background:"none",color:"#b08050",border:"none",cursor:"pointer",fontSize:"12px",fontFamily:"sans-serif",textDecoration:"underline",padding:"4px"}}>
              Order Another
            </button>
            <button onClick={onBack}
              style={{background:"none",color:"#b08050",border:"none",cursor:"pointer",fontSize:"12px",fontFamily:"sans-serif",textDecoration:"underline",padding:"4px"}}>
              ← Back to Gallery
            </button>
          </div>
        </div>
      </div>
    );
  }

  const col1 = selectedColors[0]?.hex || "#c8833a";
  const col2 = selectedColors[1]?.hex || "#a85200";

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#fdf6ec 0%,#fce8c0 55%,#fad9a0 100%)",fontFamily:"'Georgia','Times New Roman',serif"}}>
      <div className="site-header" style={{background:"linear-gradient(160deg,#1e0d00,#3d1f00,#6b3200)",padding:"20px 24px 18px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,opacity:0.03,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",backgroundSize:"14px 14px"}}/>
        <div style={{position:"relative"}}>
          <h1 onClick={onBack} style={{color:"#FFD166",fontSize:"clamp(20px,4vw,36px)",margin:"0 0 4px",fontFamily:"'Georgia',serif",fontWeight:"400",letterSpacing:"clamp(2px,1.5vw,8px)",textTransform:"uppercase",cursor:"pointer"}}>
            Buttons & Leis
          </h1>
          <p style={{color:"rgba(255,220,150,0.65)",margin:"0 0 14px",fontSize:"clamp(9px,1.8vw,11px)",letterSpacing:"clamp(1.5px,1vw,3px)",textTransform:"uppercase",fontFamily:"sans-serif"}}>
            Handmade &nbsp;·&nbsp; Custom &nbsp;·&nbsp; With Love
          </p>
          <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={() => onNavigate && onNavigate({ tier:'classic', prePopulate:null })}
              style={{background:"rgba(255,255,255,0.12)",color:"#FFD166",border:"2px solid rgba(255,209,102,0.4)",borderRadius:"10px",padding:"8px 20px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"sans-serif",letterSpacing:"0.5px",backdropFilter:"blur(4px)",width:"170px"}}>
              🌺 Order Lei
            </button>
            <button onClick={() => onNavigate && onNavigate({ page:'button-order' })}
              style={{background:"linear-gradient(135deg,#c8833a,#a85200)",color:"white",border:"none",borderRadius:"10px",padding:"8px 20px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"sans-serif",letterSpacing:"0.5px",boxShadow:"0 3px 12px rgba(168,82,0,0.4)",width:"170px"}}>
              🔘 Order Button
            </button>
          </div>
        </div>
      </div>

      <div className="order-container" style={{maxWidth:"960px",margin:"0 auto",padding:"24px 18px 60px"}}>

        <button onClick={onBack}
          style={{background:"none",border:"none",color:"#c8833a",cursor:"pointer",fontSize:"13px",fontFamily:"sans-serif",fontWeight:"600",padding:"0 0 18px",display:"flex",alignItems:"center",gap:"5px"}}>
          ← Back to Home
        </button>

        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:"24px",alignItems:"start"}} className="order-grid">

          {/* LEFT COLUMN */}
          <div style={{display:"flex",flexDirection:"column",gap:"20px",minWidth:0}}>

            {/* Button text + color picker + quantity */}
            <div id="field-btn-text" style={{background:"white",borderRadius:"20px",padding:"24px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <h3 style={{margin:"0 0 4px",color:"#5a3000",fontSize:"17px",fontFamily:"'Georgia',serif"}}>🔘 Order a Personalized Button</h3>
              <p style={{margin:"0 0 22px",color:"#9a7040",fontSize:"13px",fontFamily:"sans-serif"}}>${BUTTON_PRICE} per button — custom text, any occasion</p>

              <div style={{marginBottom:"20px"}}>
                <label style={{display:"block",marginBottom:"6px",fontSize:"13px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600"}}>
                  What would you like on your button? *
                </label>
                <input type="text" placeholder="e.g. CLASS OF 2025, GO BEARS, CONGRATS ALEX"
                  value={buttonText} onChange={e => setButtonText(e.target.value)} maxLength={30}
                  style={{width:"100%",boxSizing:"border-box",padding:"13px 16px",borderRadius:"12px",border:"1.5px solid #e5c88a",fontSize:"14px",fontFamily:"sans-serif",color:"#3d1500",background:"#fffdf8",outline:"none"}}
                  onFocus={e => e.target.style.borderColor="#c8833a"}
                  onBlur={e => e.target.style.borderColor="#e5c88a"}
                />
              </div>

              {/* Color picker */}
              <div id="field-btn-colors">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"4px"}}>
                  <h3 style={{margin:0,color:"#5a3000",fontSize:"17px",fontFamily:"'Georgia',serif"}}>🎨 Colors</h3>
                  <span style={{fontFamily:"sans-serif",fontSize:"12px",color:selectedColors.length===2?"#2d7020":"#c8400a",fontWeight:"600"}}>
                    {selectedColors.length}/2 selected
                  </span>
                </div>
                <p style={{margin:"0 0 12px",fontSize:"12px",color:"#9a7040",fontFamily:"sans-serif"}}>
                  Choose exactly 2 · Selecting a 3rd replaces the 1st
                </p>
                <div style={{overflowX:"auto",padding:"6px 4px 6px 6px"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:GRID_GAP,minWidth:"fit-content"}}>
                    <ColorRow row={COLOR_ROWS[0]} selectedColors={selectedColors} toggleColor={toggleBtnColor} />
                    <ColorRow row={COLOR_ROWS[1]} selectedColors={selectedColors} toggleColor={toggleBtnColor} />
                    {showMoreColors && (<>
                      <ColorRow row={COLOR_ROWS[2]} selectedColors={selectedColors} toggleColor={toggleBtnColor} />
                      <ColorRow row={COLOR_ROWS[3]} selectedColors={selectedColors} toggleColor={toggleBtnColor} />
                    </>)}
                  </div>
                </div>
                <button onClick={() => setShowMoreColors(!showMoreColors)}
                  style={{background:"none",border:"1px solid #e5c88a",borderRadius:"20px",padding:"5px 14px",
                    cursor:"pointer",fontSize:"12px",color:"#c8833a",fontFamily:"sans-serif",fontWeight:"600",marginTop:"12px",marginBottom:"4px"}}>
                  {showMoreColors ? "▲ Show fewer colors" : "▼ Show more colors (pastels & deeps)"}
                </button>

                {showMoreColors && (
                  <div style={{background:"#fdf8f0",borderRadius:"12px",padding:"14px",border:"1px solid #edd9a0",marginTop:"10px"}}>
                    <p style={{margin:"0 0 8px",fontSize:"12px",color:"#7a5520",fontFamily:"sans-serif",fontWeight:"600"}}>
                      🎨 Custom Color
                    </p>
                    <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
                      <input type="color" value={customBtnHex} onChange={e => setCustomBtnHex(e.target.value)}
                        style={{width:"42px",height:"36px",border:"none",borderRadius:"8px",cursor:"pointer",background:"none",padding:0}}/>
                      <span style={{fontSize:"12px",color:"#9a7040",fontFamily:"monospace"}}>{customBtnHex.toUpperCase()}</span>
                      <button onClick={addCustomBtnColor}
                        style={{background:"#c8833a",color:"white",border:"none",
                          borderRadius:"8px",padding:"6px 14px",cursor:"pointer",
                          fontSize:"12px",fontWeight:"600",fontFamily:"sans-serif",transition:"all 0.2s"}}>
                        {customBtnAdded ? "✓ Added!" : "+ Add Custom"}
                      </button>
                    </div>
                    <p style={{margin:"8px 0 0",fontSize:"11px",color:"#b05a20",fontFamily:"sans-serif",lineHeight:"1.4"}}>
                      ⚠️ We will do our best to match custom colors — exact shades may vary.
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div style={{marginTop:"24px"}}>
                <label style={{display:"block",marginBottom:"8px",fontSize:"13px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600"}}>
                  Quantity
                </label>
                <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
                  <button onClick={() => setQuantity(Math.max(1, quantity-1))}
                    style={{width:"40px",height:"40px",borderRadius:"50%",border:"2px solid #e0c89a",background:"white",cursor:"pointer",fontSize:"22px",color:"#c8833a",fontWeight:"bold",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                  <span style={{fontSize:"24px",fontWeight:"700",color:"#3d1500",fontFamily:"sans-serif",minWidth:"40px",textAlign:"center"}}>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(3, quantity+1))}
                    style={{width:"40px",height:"40px",borderRadius:"50%",border:"2px solid #e0c89a",background:"white",cursor:quantity>=3?"not-allowed":"pointer",fontSize:"22px",color:quantity>=3?"#d0b88a":"#c8833a",fontWeight:"bold",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}
                    disabled={quantity >= 3}>+</button>
                  <div style={{fontFamily:"sans-serif"}}>
                    <span style={{fontSize:"15px",color:"#7a5520"}}>{quantity} × $5 = </span>
                    <span style={{fontSize:"18px",fontWeight:"800",color:"#c8833a"}}>${quantity * BUTTON_PRICE}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fulfillment */}
            <div id="field-btn-fulfillment" style={{background:"white",borderRadius:"20px",padding:"28px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <h3 style={{margin:"0 0 6px",color:"#5a3000",fontSize:"17px",fontFamily:"'Georgia',serif"}}>📦 Shipping or Pickup?</h3>
              <p style={{margin:"0 0 18px",color:"#9a7040",fontSize:"13px",fontFamily:"sans-serif"}}>Choose how you'd like to receive your order</p>
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <button onClick={() => setFulfillment("shipping")}
                  style={{display:"flex",alignItems:"flex-start",gap:"14px",padding:"16px",borderRadius:"14px",border:`2px solid ${fulfillment==="shipping"?"#635bff":"#e5c88a"}`,background:fulfillment==="shipping"?"#f8f4ff":"white",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                  <span style={{fontSize:"24px",marginTop:"2px"}}>🚚</span>
                  <div>
                    <div style={{fontWeight:"700",fontSize:"14px",color:"#3d1500",fontFamily:"sans-serif"}}>Ship via USPS (+${SHIPPING_PRICE.toFixed(2)})</div>
                    <div style={{fontSize:"12px",color:"#9a7040",fontFamily:"sans-serif",marginTop:"2px"}}>Flat-rate priority shipping to anywhere in the US. Enter your address below.</div>
                  </div>
                  {fulfillment==="shipping" && <span style={{marginLeft:"auto",color:"#635bff",fontSize:"18px",fontWeight:"700"}}>✓</span>}
                </button>
                <button onClick={() => setFulfillment("pickup")}
                  style={{display:"flex",alignItems:"flex-start",gap:"14px",padding:"16px",borderRadius:"14px",border:`2px solid ${fulfillment==="pickup"?"#059669":"#e5c88a"}`,background:fulfillment==="pickup"?"#f0fdf4":"white",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                  <span style={{fontSize:"24px",marginTop:"2px"}}>📍</span>
                  <div>
                    <div style={{fontWeight:"700",fontSize:"14px",color:"#3d1500",fontFamily:"sans-serif"}}>Local Pickup — FREE</div>
                    <div style={{fontSize:"12px",color:"#9a7040",fontFamily:"sans-serif",marginTop:"2px"}}><strong>98391 area only</strong> (Bonney Lake / Sumner, WA). We'll email you to coordinate drop-off once ready.</div>
                  </div>
                  {fulfillment==="pickup" && <span style={{marginLeft:"auto",color:"#059669",fontSize:"18px",fontWeight:"700"}}>✓</span>}
                </button>
              </div>
            </div>

            {/* Contact info */}
            <div id="field-btn-contact" style={{background:"white",borderRadius:"20px",padding:"28px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <h3 style={{margin:"0 0 20px",color:"#5a3000",fontSize:"17px",fontFamily:"'Georgia',serif"}}>👤 Your Information</h3>
              {/* name */}
              <div style={{marginBottom:"14px"}}>
                <label style={{display:"block",marginBottom:"5px",fontSize:"12px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600"}}>Your Name *</label>
                <input type="text" placeholder="Jane Smith" value={form.name}
                  onChange={e => setForm({...form, name:e.target.value})}
                  style={{width:"100%",padding:"12px 14px",borderRadius:"10px",border:`1.5px solid ${form.name && !isValidName(form.name) ? "#dc2626" : "#e5c88a"}`,fontSize:"14px",fontFamily:"sans-serif",color:"#4a3010",background:"#fffdf8",boxSizing:"border-box",outline:"none"}}
                  onFocus={e=>e.target.style.borderColor="#c8833a"}
                  onBlur={e=>e.target.style.borderColor=(form.name && !isValidName(form.name) ? "#dc2626" : "#e5c88a")}/>
                {form.name && !isValidName(form.name) && (
                  <p style={{margin:"4px 0 0",fontSize:"11px",color:"#dc2626",fontFamily:"sans-serif"}}>Please enter your full name (at least 2 characters)</p>
                )}
              </div>

              {/* email */}
              <div style={{marginBottom:"8px"}}>
                <label style={{display:"block",marginBottom:"5px",fontSize:"12px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600"}}>Email Address *</label>
                <input type="email" placeholder="jane@email.com" value={form.email}
                  onChange={e => setForm({...form, email:e.target.value})}
                  style={{width:"100%",padding:"12px 14px",borderRadius:"10px",border:`1.5px solid ${form.email && !isValidEmail(form.email) ? "#dc2626" : "#e5c88a"}`,fontSize:"14px",fontFamily:"sans-serif",color:"#4a3010",background:"#fffdf8",boxSizing:"border-box",outline:"none"}}
                  onFocus={e=>e.target.style.borderColor="#c8833a"}
                  onBlur={e=>e.target.style.borderColor=(form.email && !isValidEmail(form.email) ? "#dc2626" : "#e5c88a")}/>
                {form.email && !isValidEmail(form.email) && (
                  <p style={{margin:"4px 0 0",fontSize:"11px",color:"#dc2626",fontFamily:"sans-serif"}}>Please enter a valid email address (e.g. jane@email.com)</p>
                )}
              </div>

              {/* email opt-in */}
              <div style={{marginBottom:"14px",padding:"10px 12px",background:"#fdf8ef",borderRadius:"8px",border:"1px solid #e5c88a"}}>
                <label style={{display:"flex",alignItems:"center",gap:"9px",cursor:"pointer",fontSize:"12px",color:"#7a5520",fontFamily:"sans-serif",fontWeight:"600",userSelect:"none"}}>
                  <input type="checkbox" checked={form.emailOptIn}
                    onChange={e => setForm({...form, emailOptIn:e.target.checked})}
                    style={{width:"16px",height:"16px",accentColor:"#c8833a",cursor:"pointer",flexShrink:0}}/>
                  ✉️ Send me order status & promotions via email
                </label>
              </div>

              {/* phone */}
              <div style={{marginBottom:"14px"}}>
                <label style={{display:"block",marginBottom:"5px",fontSize:"12px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600"}}>Phone Number *</label>
                <input type="tel" placeholder="(555) 123-4567" value={form.phone}
                  onChange={e => setForm({...form, phone:e.target.value})}
                  style={{width:"100%",padding:"12px 14px",borderRadius:"10px",border:`1.5px solid ${form.phone && !isValidPhone(form.phone) ? "#dc2626" : "#e5c88a"}`,fontSize:"14px",fontFamily:"sans-serif",color:"#4a3010",background:"#fffdf8",boxSizing:"border-box",outline:"none"}}
                  onFocus={e=>e.target.style.borderColor="#c8833a"}
                  onBlur={e=>e.target.style.borderColor=(form.phone && !isValidPhone(form.phone) ? "#dc2626" : "#e5c88a")}/>
                {form.phone && !isValidPhone(form.phone) && (
                  <p style={{margin:"4px 0 0",fontSize:"11px",color:"#dc2626",fontFamily:"sans-serif"}}>Please enter a valid phone number (10+ digits)</p>
                )}
              </div>
              {fulfillment === "shipping" && (
                <div id="field-btn-shippingAddress" style={{marginBottom:"14px"}}>
                  <label style={{display:"block",marginBottom:"5px",fontSize:"12px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600"}}>Ship-to Address *</label>
                  <input type="text" placeholder="123 Main St, City, State ZIP"
                    value={form.shippingAddress}
                    onChange={e => setForm({...form, shippingAddress:e.target.value})}
                    style={{width:"100%",padding:"12px 14px",borderRadius:"10px",border:"1.5px solid #e5c88a",fontSize:"14px",fontFamily:"sans-serif",color:"#4a3010",background:"#fffdf8",boxSizing:"border-box",outline:"none"}}
                    onFocus={e=>e.target.style.borderColor="#c8833a"}
                    onBlur={e=>e.target.style.borderColor="#e5c88a"}/>
                </div>
              )}
              <div style={{marginBottom:"8px"}}>
                <label style={{display:"block",marginBottom:"5px",fontSize:"12px",color:"#7a4a20",fontFamily:"sans-serif",fontWeight:"600"}}>Notes / Special Requests</label>
                <textarea placeholder="Any special requests or questions..."
                  value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2}
                  style={{width:"100%",padding:"11px 14px",borderRadius:"10px",border:"1.5px solid #e5c88a",fontSize:"14px",fontFamily:"sans-serif",color:"#4a3010",background:"#fffdf8",boxSizing:"border-box",resize:"vertical",outline:"none"}}/>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN — Preview + Pricing + Submit (sticky) */}
          <div className="sticky-right-col" style={{position:"sticky",top:"16px",alignSelf:"start",display:"flex",flexDirection:"column",gap:"16px",minWidth:0}}>

            {/* Button preview */}
            <div style={{background:"white",borderRadius:"20px",padding:"24px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
                <h3 style={{margin:0,color:"#5a3000",fontSize:"16px",fontFamily:"'Georgia',serif"}}>🔘 Button Preview</h3>
                <button onClick={() => setShowButtonExamples(true)}
                  style={{background:"none",border:"1px solid #d0a875",borderRadius:"8px",padding:"4px 12px",fontSize:"11px",color:"#9a7040",cursor:"pointer",fontFamily:"sans-serif",fontWeight:"600",display:"inline-flex",alignItems:"center",gap:"4px"}}>
                  👁 See examples
                </button>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"130px",height:"130px",borderRadius:"50%",background:col1,border:"4px solid #c8833a",boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>
                  <div style={{background:col2,borderRadius:"50%",width:"114px",height:"114px",display:"flex",alignItems:"center",justifyContent:"center",padding:"10px",boxSizing:"border-box"}}>
                    <span style={{color:"white",fontFamily:"sans-serif",fontWeight:"900",fontSize:buttonText.length > 12 ? "10px" : buttonText.length > 8 ? "13px" : "16px",textAlign:"center",textTransform:"uppercase",letterSpacing:"0.5px",lineHeight:"1.2",wordBreak:"break-word"}}>
                      {buttonText || "YOUR\nTEXT"}
                    </span>
                  </div>
                </div>
              </div>
              {selectedColors.length === 2 && (
                <div style={{display:"flex",justifyContent:"center",gap:"8px",marginTop:"12px"}}>
                  {selectedColors.map((c,i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:"5px",fontFamily:"sans-serif",fontSize:"11px",color:"#7a5520"}}>
                      <span style={{width:"12px",height:"12px",borderRadius:"50%",background:c.hex,display:"inline-block",border:"1px solid rgba(0,0,0,0.15)"}}/>
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
              <div style={{fontSize:"11px",color:"#b08050",fontFamily:"sans-serif",marginTop:"10px",textAlign:"center"}}>Approximate preview — final may vary slightly</div>
            </div>

            {/* Pricing */}
            <div style={{background:"white",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)",fontSize:"13px",fontFamily:"sans-serif"}}>
              <h4 style={{margin:"0 0 12px",color:"#5a3000",fontSize:"14px",fontWeight:"700",letterSpacing:"0.5px"}}>💰 Estimated Total</h4>
              <div style={{borderTop:"1px dashed #e5c88a",paddingTop:"10px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",color:"#7a5520",alignItems:"center"}}>
                  <span style={{display:"flex",alignItems:"center",gap:"6px"}}>
                    {quantity} × Button
                    {selectedColors.length > 0 && (
                      <span style={{display:"flex",gap:"3px"}}>
                        {selectedColors.map((c,i) => <span key={i} style={{width:"11px",height:"11px",borderRadius:"50%",background:c.hex,display:"inline-block",border:"1px solid rgba(0,0,0,0.15)"}}/>)}
                      </span>
                    )}
                  </span>
                  <span>${(quantity * BUTTON_PRICE).toFixed(2)}</span>
                </div>
              </div>
              {fulfillment === "shipping" && (
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",color:"#7a5520"}}>
                  <span>🚚 USPS Shipping</span><span>+${SHIPPING_PRICE.toFixed(2)}</span>
                </div>
              )}
              {fulfillment === "pickup" && (
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",color:"#059669",fontWeight:"600"}}>
                  <span>📍 Local Pickup</span><span>FREE</span>
                </div>
              )}
              {!fulfillment && (
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",color:"#9a7040",fontStyle:"italic"}}>
                  <span>+ Shipping (select below)</span><span>+${SHIPPING_PRICE.toFixed(2)} or FREE</span>
                </div>
              )}
              <div style={{borderTop:"2px solid #e5c88a",marginTop:"8px",paddingTop:"8px",display:"flex",justifyContent:"space-between",fontWeight:"800",fontSize:"16px",color:"#3d1500"}}>
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
              <p style={{margin:"8px 0 0",fontSize:"10px",color:"#b08050",lineHeight:"1.5"}}>
                Payment via Stripe — no account needed
              </p>
            </div>

            {/* Submit card */}
            <div style={{background:"white",borderRadius:"20px",padding:"20px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
            <button onClick={formValid && !isSubmitting ? handleSubmit : () => {
                if (!formValid) {
                  const candidates = [
                    { id: "field-btn-text",            incomplete: buttonText.trim().length === 0 },
                    { id: "field-btn-colors",           incomplete: selectedColors.length < 2 },
                    { id: "field-btn-fulfillment",      incomplete: fulfillment === null },
                    { id: "field-btn-shippingAddress",  incomplete: fulfillment === "shipping" && !form.shippingAddress.trim() },
                    { id: "field-btn-contact",          incomplete: !form.name || !form.email || !form.phone },
                  ];
                  const first = candidates.find(c => c.incomplete);
                  if (first) {
                    const el = document.getElementById(first.id);
                    if (el) {
                      const top = el.getBoundingClientRect().top + window.scrollY - 20;
                      window.scrollTo({top, behavior:"smooth"});
                    }
                  }
                }
              }}
              disabled={isSubmitting}
              style={{
                width:"100%",
                background: formValid ? "linear-gradient(135deg,#c8833a,#a85200)":"#d9c4a0",
                color:"white",border:"none",borderRadius:"14px",padding:"17px",
                fontSize:"16px",fontWeight:"700",
                cursor: isSubmitting ? "wait" : formValid ? "pointer" : "not-allowed",
                fontFamily:"sans-serif",letterSpacing:"0.5px",
                boxShadow: formValid ? "0 6px 20px rgba(168,82,0,0.35)":"none",
                opacity: isSubmitting ? 0.7 : 1,
                transition:"opacity 0.2s",
              }}>
              {isSubmitting ? "⏳ Saving & redirecting to payment…" : "🔘 Submit & Pay →"}
            </button>
            <div style={{background:"#fdf8f0",borderRadius:"10px",padding:"12px 14px",marginTop:"14px",border:"1px solid #edd9a0",fontSize:"12px",color:"#7a5520",fontFamily:"sans-serif",lineHeight:"1.8"}}>
              💰 Payment via <strong>Stripe</strong> — no account required.
            </div>
            <ValidationChecklist items={buttonChecklistItems} />
            </div>

          </div>
        </div>
      </div>

      {/* ── SINGLE IMAGE ZOOM OVERLAY ── */}
      {zoomedImg && (
        <div onClick={() => setZoomedImg(null)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:99999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px"}}>
          <button onClick={() => setZoomedImg(null)}
            style={{position:"absolute",top:"14px",right:"14px",background:"rgba(255,255,255,0.18)",border:"2px solid rgba(255,255,255,0.3)",color:"white",width:"44px",height:"44px",borderRadius:"50%",fontSize:"20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>✕</button>
          <img src={zoomedImg.src} alt={zoomedImg.caption}
            style={{maxWidth:"100%",maxHeight:"82vh",objectFit:"contain",borderRadius:"14px",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}
            onClick={e => e.stopPropagation()}/>
          {zoomedImg.caption && (
            <div style={{color:"rgba(255,255,255,0.85)",fontSize:"13px",fontFamily:"sans-serif",marginTop:"12px",textAlign:"center",fontWeight:"600"}}>{zoomedImg.caption}</div>
          )}
        </div>
      )}

      {/* ── BUTTON EXAMPLES MODAL ── */}
      {showButtonExamples && (() => {
        const buttonImages = GALLERY_ITEMS.filter(g => g.tier === 'button');
        return (
          <div onClick={() => setShowButtonExamples(false)}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
            <div onClick={e => e.stopPropagation()}
              className="example-modal-inner"
              style={{background:"white",borderRadius:"20px",padding:"24px",maxWidth:"580px",width:"100%",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
                <h3 style={{margin:0,color:"#5a3000",fontFamily:"Georgia,serif",fontSize:"18px"}}>🔘 Custom Button — Examples</h3>
                <button onClick={() => setShowButtonExamples(false)}
                  style={{background:"none",border:"none",fontSize:"24px",cursor:"pointer",color:"#9a7040",lineHeight:1,padding:"4px"}}>✕</button>
              </div>
              <p style={{margin:"0 0 16px",fontSize:"12px",color:"#9a7040",fontFamily:"sans-serif",lineHeight:"1.6"}}>
                These are sample buttons we've made — yours will have your custom text and chosen colors!
              </p>
              {buttonImages.length > 0 ? (
                <div className="example-modal-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"14px"}}>
                  {buttonImages.map((img, i) => (
                    <div key={i} style={{borderRadius:"12px",overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.12)",cursor:"zoom-in"}}
                      onClick={() => setZoomedImg({src:img.src,caption:img.caption})}>
                      <img src={img.src} alt={img.caption} style={{width:"100%",display:"block",objectFit:"cover",aspectRatio:"1"}} />
                      <div style={{padding:"8px 10px",fontSize:"11px",color:"#7a5520",fontFamily:"sans-serif",textAlign:"center",lineHeight:"1.4"}}>{img.caption}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{textAlign:"center",color:"#9a7040",fontFamily:"sans-serif",padding:"20px 0"}}>No examples yet — check back soon! 🔘</p>
              )}
              <div style={{marginTop:"16px",textAlign:"center"}}>
                <button onClick={() => setShowButtonExamples(false)}
                  style={{background:"linear-gradient(135deg,#c8833a,#a85200)",color:"white",border:"none",borderRadius:"12px",padding:"10px 28px",fontSize:"14px",fontWeight:"700",cursor:"pointer",fontFamily:"sans-serif"}}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        * { box-sizing: border-box; }
        html, body { overflow-x: clip; }
        .sticky-right-col::-webkit-scrollbar { display: none; }
        @media (max-width: 700px) {
          .order-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .order-grid > div:last-child {
            position: static !important;
            top: auto !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
          .order-grid > * { min-width: 0; }
        }
        @media (hover: none) and (pointer: coarse) {
          input, textarea, select { font-size: 16px !important; }
          button { min-height: 44px; }
        }
        @media (max-width: 480px) {
          .site-header { padding: 16px 12px 14px !important; }
          .site-header h1 { font-size: 20px !important; letter-spacing: 2px !important; }
          .site-header p { font-size: 9px !important; letter-spacing: 1.5px !important; }
          .order-container { padding: 14px 10px 48px !important; }
          .example-modal-inner { padding: 18px 14px !important; border-radius: 16px !important; max-height: 90vh !important; }
          .example-modal-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
        }
      `}</style>
    </div>
  );
}
