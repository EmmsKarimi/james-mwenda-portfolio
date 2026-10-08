import { useState, useEffect, useRef } from "react";
import portraitSrc from "@/imports/AMN-46421-1.jpg";
import executiveBriefSrc from "@/imports/James_Mugambi_CV.pdf";

type Page = "home" | "leadership" | "policy" | "contact";
interface DrawerData { title: string; category: string; summary: string; impacts: string[]; }

/* ── Design tokens ── */
const T = {
  canvas:    "#0B1D3A",   /* hero / dark sections */
  canvasMid: "#112348",   /* slightly lighter dark */
  paper:     "#F5F3EE",   /* warm off-white body */
  paperDark: "#EAE7E0",   /* card backgrounds */
  ink:       "#0D1B2A",   /* body text on light */
  body:      "#4A5568",
  muted:     "#8A97A8",
  gold:      "#C09127",
  goldLight: "#D4A843",
  goldFaint: "#F5EBD0",
  border:    "#DDD8CE",
  borderDark:"rgba(255,255,255,0.10)",
  white:     "#FFFFFF",
};

/* ── Fonts ── */
const F = {
  serif:  "'Plus Jakarta Sans', system-ui, sans-serif",
  sans:   "'Inter', system-ui, sans-serif",
  mono:   "'DM Mono', 'JetBrains Mono', monospace",
};

/* ── Scroll reveal ── */
function useReveal(threshold = 0.07) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`reveal transition-all duration-[450ms] ease-out ${visible ? "is-visible opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function useCounter(target: number, duration = 1600, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return val;
}

function Ticker({ items }: { items: string[] }) {
  const [idx, setIdx] = useState(0);
  const [out, setOut] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setOut(true);
      setTimeout(() => { setIdx(i => (i + 1) % items.length); setOut(false); }, 280);
    }, 3200);
    return () => clearInterval(t);
  }, [items.length]);
  return (
    <span className="inline-block overflow-hidden align-baseline" style={{ height: "1.15em" }}>
      <span className="block transition-all duration-280" style={{ transform: out ? "translateY(-110%)" : "translateY(0)", opacity: out ? 0 : 1 }}>
        {items[idx]}
      </span>
    </span>
  );
}

/* ── Animated line chart ── */
function LineChart({ light = false }: { light?: boolean }) {
  const stroke1 = light ? T.white : T.canvas;
  const stroke2 = light ? T.goldLight : T.gold;
  const gridLine = light ? "rgba(255,255,255,0.15)" : T.border;
  return (
    <svg viewBox="0 0 300 72" fill="none" className="w-full h-full">
      {[18,36,54].map(y => <line key={y} x1="0" y1={y} x2="300" y2={y} stroke={gridLine} strokeWidth="0.6" strokeDasharray="4 3"/>)}
      <path d="M0 64 C35 52,55 36,90 30 C120 24,138 40,168 22 C198 4,222 14,258 4 C272 1,286 3,300 2"
        fill="none" stroke={stroke1} strokeWidth="2" strokeLinecap="round" className="chart-path"/>
      <path d="M0 64 C35 52,55 36,90 30 C120 24,138 40,168 22 C198 4,222 14,258 4 C272 1,286 3,300 2 L300 72 L0 72 Z"
        fill={stroke1} opacity="0.07"/>
      <path d="M0 68 C45 58,75 50,108 46 C138 42,158 52,190 40 C222 28,258 36,300 26"
        fill="none" stroke={stroke2} strokeWidth="1.5" strokeDasharray="5 3" strokeLinecap="round" className="chart-path-2"/>
      {[[90,30],[168,22],[258,4],[300,2]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={stroke1} stroke={light ? T.canvas : T.white} strokeWidth="1.5"/>
      ))}
    </svg>
  );
}

/* ── Stat counter pill ── */
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, visible } = useReveal();
  const n = useCounter(value, 1400, visible);
  return (
    <div ref={ref} className="text-center py-6 px-4">
      <div className="font-bold leading-none mb-1.5 tabular-nums"
        style={{ fontFamily: F.serif, fontSize: "clamp(28px,3vw,40px)", color: T.canvas }}>
        {n}{suffix}
      </div>
      <div className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: F.mono, color: T.muted }}>{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════
   NAV
═══════════════════════════════════ */
function Nav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);
  const links: [Page, string][] = [["home","Overview"],["leadership","Leadership"],["policy","Policy & Research"],["contact","Contact"]];
  return (
    <header className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(11,29,58,0.97)" : T.canvas,
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.25)" : "none",
      }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-8">
        {/* Wordmark — initials only, no name repeat */}
        <button onClick={() => setPage("home")} className="text-left group flex-shrink-0 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-md flex-shrink-0"
            style={{ background: T.gold }}>
            <span style={{ fontFamily: F.serif, fontWeight: 800, fontSize: 13, color: T.canvas, lineHeight: 1 }}>JM</span>
          </div>
          <div className="text-[8px] uppercase tracking-[0.20em]" style={{ fontFamily: F.mono, color: "rgba(255,255,255,0.45)" }}>
            Tax &amp; Finance Executive
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {links.map(([p, label]) => (
            <button key={p} onClick={() => setPage(p)}
              className={`nav-link text-[13px] font-medium relative pb-1 ${page === p ? "is-active" : ""}`}
              style={{ color: page === p ? T.white : "rgba(255,255,255,0.50)" }}>
              {label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <a href={executiveBriefSrc} download="James-Mwenda-Executive-Brief.pdf"
          className="interactive-button hidden md:flex items-center gap-2 text-[11px] font-semibold px-5 py-2.5 tracking-wide flex-shrink-0"
          style={{ fontFamily: F.mono, background: T.gold, color: T.canvas, borderRadius: 6 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Executive Brief
        </a>

        <button className="md:hidden" style={{ color: T.white }} onClick={() => setOpen(!open)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 py-5 flex flex-col gap-4 border-t" style={{ background: T.canvas, borderColor: T.borderDark }}>
          {links.map(([p, label]) => (
            <button key={p} onClick={() => { setPage(p); setOpen(false); }}
              className="text-sm font-medium text-left transition-opacity hover:opacity-70"
              style={{ fontFamily: F.sans, color: page === p ? T.gold : "rgba(255,255,255,0.65)" }}>{label}</button>
          ))}
        </div>
      )}
    </header>
  );
}

/* ═══════════════════════════════════
   HOME
═══════════════════════════════════ */
function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <main>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden" style={{ background: T.canvas, minHeight: "100vh", marginTop: -64 }}>

        {/* Noise / grain texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "180px" }}/>

        {/* Drifting ambient orbs */}
        <div className="absolute pointer-events-none" style={{ top: "5%", left: "2%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, rgba(192,145,39,0.09) 0%, transparent 65%)` }}/>
        <div className="absolute pointer-events-none" style={{ bottom: "10%", left: "15%", width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(circle, rgba(192,145,39,0.06) 0%, transparent 65%)` }}/>
        <div className="absolute pointer-events-none" style={{ top: "-8%", right: "2%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, rgba(192,145,39,0.07) 0%, transparent 60%)` }}/>

        {/* Radial glow behind portrait */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 40%, rgba(192,145,39,0.08) 0%, transparent 60%)" }}/>

        {/* Hero grid: content | portrait */}
        <div className="hero-grid relative max-w-screen-xl mx-auto px-6 lg:px-12 flex items-stretch" style={{ minHeight: "100vh" }}>

          {/* ── Left content ── */}
          <div className="hero-left flex flex-col justify-center flex-1 py-32 pr-10 lg:pr-20" style={{ maxWidth: "58%" }}>

            {/* Status */}
            <div className="animate-fade-up flex items-center gap-3 mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" style={{ boxShadow: "0 0 0 4px rgba(52,211,153,0.15)" }}/>
              <span className="text-[10px] uppercase tracking-[0.22em]" style={{ fontFamily: F.mono, color: "rgba(255,255,255,0.40)" }}>
                Available for Board Advisory
              </span>
            </div>

            {/* Name */}
            <h1 className="animate-fade-up leading-[0.95] mb-6"
              style={{ fontFamily: F.serif, fontWeight: 800, color: T.white, fontSize: "clamp(48px,7vw,96px)", letterSpacing: "-0.01em" }}>
              James<br/>
              <span className="gold-text-shimmer">Mwenda</span>
            </h1>

            {/* Title bar */}
            <div className="animate-fade-up-d1 flex items-center gap-3 mb-8">
              <span className="draw-line flex-shrink-0" style={{ width: 40 }}/>
              <span className="text-[11px] uppercase tracking-[0.24em] font-semibold" style={{ fontFamily: F.mono, color: T.gold }}>
                Senior Tax &amp; Finance Executive
              </span>
            </div>

            {/* Bio */}
            <div className="animate-fade-up-d1 mb-8" style={{ fontFamily: F.sans, fontSize: 15, color: "rgba(255,255,255,0.60)", maxWidth: 520 }}>
              <p className="font-semibold leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.78)" }}>
                PhD in Economics. Masters in Tax Administration. CPA-K
              </p>
              <p className="leading-relaxed">
                Financial leadership | Operational leadership | Tax policy Research | Tax Policy advice | Board level engagement.
              </p>
            </div>

            {/* Credential chips — stagger in */}
            <div className="flex flex-wrap gap-2 mb-10">
              {["Finance","Tax","Operations","Compliance","Policy","Strategy","Research"].map((c, i) => (
                <span key={c} className="chip-hover text-[10px] px-3 py-1.5 font-medium"
                  style={{ fontFamily: F.mono, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)", borderRadius: 5, border: "1px solid rgba(255,255,255,0.10)", animation: `chipIn 0.5s ${0.4 + i * 0.08}s cubic-bezier(0.33,1,0.68,1) both` }}>
                  {c}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="animate-fade-up-d2 flex flex-wrap items-center gap-4 mb-12">
              <button onClick={() => setPage("leadership")}
                className="btn-gold interactive-button font-semibold px-7 py-3.5 flex items-center gap-2"
                style={{ fontFamily: F.sans, fontSize: 14, background: T.gold, color: T.canvas, borderRadius: 6, boxShadow: "0 4px 24px rgba(192,145,39,0.35)" }}>
                Leadership Record
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button onClick={() => setPage("policy")}
                className="interactive-button font-semibold px-7 py-3.5 hover:bg-white/10"
                style={{ fontFamily: F.sans, fontSize: 14, color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 6 }}>
                Research &amp; Policy
              </button>
            </div>

            {/* Focus ticker */}
            <div className="animate-fade-up-d3 flex items-center gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
              <span className="text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: F.mono, color: "rgba(255,255,255,0.25)" }}>Current focus</span>
              <span className="w-px h-3" style={{ background: "rgba(255,255,255,0.15)" }}/>
              <span className="text-[11px] font-medium" style={{ fontFamily: F.mono, color: T.goldLight }}>
                <Ticker items={["OECD BEPS Compliance","Pillar Two · DMTT","Transfer Pricing","Digital Economy Tax","Corporate Finance Strategy"]}/>
              </span>
            </div>
          </div>

          {/* ── Right: portrait ── */}
          <div className="hero-photo hero-right flex flex-col justify-center flex-shrink-0 relative" style={{ width: "42%" }}>
            {/* Tall portrait */}
            <div className="relative" style={{ height: "88vh", maxHeight: 860, marginTop: "-80px" }}>
              <img
                src={portraitSrc}
                alt="James Mwenda"
                className="absolute top-0 left-0 right-0 w-full"
                style={{ height: "100%", objectFit: "cover", objectPosition: "center top", display: "block", minHeight: 400 }}
              />
              {/* Fade bottom into section bg */}
              <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                style={{ background: `linear-gradient(to top, ${T.canvas} 0%, transparent 100%)` }}/>
              {/* Fade left edge into content */}
              <div className="absolute inset-y-0 left-0 w-20 pointer-events-none"
                style={{ background: `linear-gradient(to right, ${T.canvas} 0%, transparent 100%)` }}/>

              {/* Badge: 13+ yrs */}
              <div className="absolute top-10 right-6 text-center px-4 py-3"
                style={{ background: T.gold, borderRadius: 10, boxShadow: "0 8px 30px rgba(192,145,39,0.40)", animation: "badgePop 0.5s 0.8s ease-out both" }}>
                <div className="font-bold leading-none" style={{ fontFamily: F.serif, fontSize: 28, color: T.canvas }}>13+</div>
                <div className="text-[8px] uppercase tracking-widest mt-1" style={{ fontFamily: F.mono, color: "rgba(11,29,58,0.70)" }}>Years</div>
              </div>

              {/* Badge: CPA-K */}
              <div className="absolute top-10 left-6 px-3 py-2.5"
                style={{ background: T.white, borderRadius: 8, boxShadow: "0 6px 24px rgba(0,0,0,0.20)", animation: "badgePop 0.5s 1s ease-out both" }}>
                <div className="text-[10px] font-bold" style={{ fontFamily: F.mono, color: T.canvas }}>CPA-K</div>
                <div className="text-[8px]" style={{ fontFamily: F.mono, color: T.muted }}>ICPAK</div>
              </div>

              {/* Bottom info strip */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.18em] mb-0.5" style={{ fontFamily: F.mono, color: "rgba(255,255,255,0.35)" }}>Nairobi, Kenya</div>
                  <div className="text-[11px] font-medium" style={{ fontFamily: F.mono, color: "rgba(255,255,255,0.50)" }}>East Africa</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-[0.18em] mb-0.5" style={{ fontFamily: F.mono, color: "rgba(255,255,255,0.35)" }}>CPA, PhD</div>
                  <div className="text-[11px] font-medium" style={{ fontFamily: F.mono, color: T.goldLight }}>Economics</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint — animated ring */}
        <div className="scroll-ring absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up-d3">
          <div className="text-[8px] uppercase tracking-[0.22em]" style={{ fontFamily: F.mono, color: "rgba(255,255,255,0.22)" }}>Scroll</div>
          <div className="flex items-start justify-center" style={{ width: 22, height: 34, border: "1px solid rgba(255,255,255,0.20)", borderRadius: 11 }}>
            <div className="scroll-ring-dot mt-2" style={{ width: 3, height: 7, borderRadius: 2, background: T.goldLight }}/>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <section style={{ background: T.paper, borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x" style={{ borderColor: T.border }}>
            <StatCounter value={13} suffix="+" label="Years Experience"/>
            <StatCounter value={2}  suffix=""  label="C-Suite Roles"/>
            <StatCounter value={2} suffix="" label="Award winning companies"/>
            <StatCounter value={4}  suffix="+" label="Publications"/>
          </div>
        </div>
      </section>

      {/* ══ QUOTE BAND ══ */}
      <section className="relative overflow-hidden" style={{ background: T.canvasMid }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(192,145,39,0.06) 0%, transparent 60%)" }}/>
        <div className="relative max-w-screen-xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <Reveal>
            <div className="text-[9px] uppercase tracking-[0.20em] mb-6" style={{ fontFamily: F.mono, color: T.goldLight }}>
              CFO East Africa · Featured
            </div>
            <blockquote className="leading-tight max-w-3xl" style={{ fontFamily: F.serif, fontStyle: "normal", fontSize: "clamp(20px,2.6vw,32px)", color: T.white, fontWeight: 600 }}>
              "If I wasn&apos;t in Finance, I would probably be a plant pathologist."
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ══ COMPANIES + THOUGHT LEADERSHIP ══ */}
      <section style={{ background: T.paper }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

            {/* Companies */}
            <div>
              <Reveal>
                <div className="text-[9px] uppercase tracking-[0.18em] mb-2" style={{ fontFamily: F.mono, color: T.gold }}>C-Suite Engagements</div>
                <h2 className="font-bold mb-3" style={{ fontFamily: F.serif, fontSize: "clamp(22px,2.5vw,30px)", color: T.canvas }}>Concurrent Leadership</h2>
                <span className="draw-line mb-6" style={{ width: 48 }}/>
              </Reveal>
              <div className="space-y-5">
                {[
                  { co:"Yakwetu Online Limited", role:"Head of Finance & Operations", period:"2016 — Present", sector:"Content Distribution", accent: T.canvas, items:["Established the finance department","Developed company reporting processes","Supported company fundraising","High level stakeholder engagement"] },
                  { co:"PHAT! Music & Entertainment Ltd", role:"Head of Finance & Operations", period:"2015 — Present", sector:"Music & Entertainment", accent: T.gold, items:["Established the finance department","Streamlined company compliance","Developed company policies and values","Designed modeling tools for planning & decision making"] },
                ].map(({ co, role, period, sector, accent, items }) => (
                  <Reveal key={co}>
                    <div className="hover-lift border p-6 group cursor-pointer"
                      style={{ background: T.white, borderColor: T.border, borderRadius: 10, borderTop: `3px solid ${accent}` }}
                      onClick={() => setPage("leadership")}>
                      <div className="flex items-start justify-between mb-3 gap-4">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 mb-2 inline-block"
                            style={{ fontFamily: F.mono, background: accent === T.gold ? T.goldFaint : "#EEF1F8", color: accent, borderRadius: 4 }}>
                            {sector}
                          </span>
                          <div className="font-semibold text-sm mb-0.5" style={{ fontFamily: F.sans, color: T.canvas }}>{co}</div>
                          <div className="text-[11px]" style={{ fontFamily: F.mono, color: T.muted }}>{role} · {period}</div>
                        </div>
                        <svg className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {items.map(a => (
                          <div key={a} className="flex items-start gap-2 text-[11px]" style={{ fontFamily: F.sans, color: T.body }}>
                            <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: accent }}/>
                            {a}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Thought Leadership */}
            <div>
              <Reveal>
                <div className="text-[9px] uppercase tracking-[0.18em] mb-2" style={{ fontFamily: F.mono, color: T.gold }}>Thought Leadership</div>
                <h2 className="font-bold mb-3" style={{ fontFamily: F.serif, fontSize: "clamp(22px,2.5vw,30px)", color: T.canvas }}>Making Tax Accessible</h2>
                <span className="draw-line mb-6" style={{ width: 48 }}/>
              </Reveal>
              <div className="space-y-5">
                {[
                  { label:"Substack Newsletter", title:"Tax and More", desc:"Demystifying tax policy, economic research, and finance strategy for professionals and the curious public.", href:"https://substack.com/@arsenemwenda", bg: T.white },
                  { label:"Academic Research", title:"4+ Peer-Reviewed Publications", desc:"Papers on robot tax viability, distributed profit tax models, and human capital efficiency in East Africa.", href:"https://scholar.google.com", bg: "#EEF1F8" },
                ].map(({ label, title, desc, href, bg }) => (
                  <Reveal key={label}>
                    <a href={href} target="_blank" rel="noreferrer"
                      className="hover-lift block border p-6 group"
                      style={{ background: bg, borderColor: T.border, borderRadius: 10 }}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ fontFamily: F.mono, color: T.gold }}>{label}</div>
                          <div className="font-semibold text-sm mb-1.5" style={{ fontFamily: F.sans, color: T.canvas }}>{title}</div>
                          <p className="text-[12px] leading-relaxed" style={{ fontFamily: F.sans, color: T.body }}>{desc}</p>
                        </div>
                        <svg className="flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.canvas} strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                      </div>
                    </a>
                  </Reveal>
                ))}

                {/* Trend chart */}
                <Reveal>
                  <div className="border p-5" style={{ background: T.canvas, borderColor: T.canvas, borderRadius: 10 }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-[8px] uppercase tracking-widest mb-0.5" style={{ fontFamily: F.mono, color: "rgba(255,255,255,0.35)" }}>Compliance Trend</div>
                        <div className="font-semibold text-sm" style={{ fontFamily: F.serif, color: T.white }}>East Africa 2020–2024</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg" style={{ fontFamily: F.serif, color: T.gold }}>+34.2%</div>
                        <div className="text-[8px] text-emerald-400 font-medium">↑ YoY avg</div>
                      </div>
                    </div>
                    <div className="h-14"><LineChart light/></div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer setPage={setPage}/>
    </main>
  );
}

/* ═══════════════════════════════════
   PAGE BANNER (shared)
═══════════════════════════════════ */
function PageBanner({ tag, title }: { tag: string; title: string }) {
  return (
    <section className="relative overflow-hidden" style={{ background: T.canvas }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(192,145,39,0.07) 0%, transparent 65%)" }}/>
      <div className="relative max-w-screen-xl mx-auto px-6 lg:px-12 py-8">
        <div className="text-[9px] uppercase tracking-[0.22em] mb-3 animate-fade-up" style={{ fontFamily: F.mono, color: T.goldLight }}>{tag}</div>
        <h1 className="animate-fade-up-d1 font-bold leading-tight max-w-3xl" style={{ fontFamily: F.serif, fontSize: "clamp(28px,4vw,48px)", color: T.white }}>
          {title}
        </h1>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════
   LEADERSHIP
═══════════════════════════════════ */
function LeadershipPage() {
  return (
    <main style={{ background: T.paper }}>
      <PageBanner tag="C-Suite Leadership Record" title="Executive Leadership, Systems Architecture, Policy & Compliance"/>

      {/* Yakwetu */}
      <section style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
            <Reveal>
              <div className="text-[9px] uppercase tracking-[0.18em] mb-3" style={{ fontFamily: F.mono, color: T.canvas }}>Spotlight 01</div>
              <div className="w-8 h-px mb-5" style={{ background: T.canvas }}/>
              <h2 className="font-bold mb-1" style={{ fontFamily: F.serif, fontSize: 20, color: T.canvas }}>Yakwetu Online Limited</h2>
              <div className="text-[11px] mb-0.5" style={{ fontFamily: F.mono, color: T.muted }}>Head of Finance &amp; Operations</div>
              <div className="text-[10px] uppercase tracking-widest mb-5" style={{ fontFamily: F.mono, color: T.gold }}>2016 — Present</div>
              <p className="text-[13px] leading-relaxed" style={{ fontFamily: F.sans, color: T.body }}>Oversaw the company's Finance, Operations, and Compliance functions, ensuring financial integrity, operational efficiency, and regulatory adherence.</p>
            </Reveal>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {[
                { n:"01", t:"Company Registration", d:"Co-led the company's registration process." },
                { n:"02", t:"Management Advisory", d:"Advised company directors on organisational performance, risk and Compliance." },
                { n:"03", t:"Compliance Management", d:"Managed the full spectrum of company compliance." },
                { n:"04", t:"Reporting Architecture", d:"Built the company's financial and operational reporting architecture." },
              ].map(({ n, t, d }, i) => (
                <Reveal key={t} delay={i * 70}>
                  <div className="hover-lift card-hover border p-5 h-full"
                    style={{ background: T.paper, borderColor: T.border, borderRadius: 10 }}>
                    <div className="text-[9px] font-semibold mb-3" style={{ fontFamily: F.mono, color: T.muted }}>{n}</div>
                    <div className="font-semibold text-[13px] mb-2" style={{ fontFamily: F.sans, color: T.canvas }}>{t}</div>
                    <div className="text-[12px] leading-relaxed" style={{ fontFamily: F.sans, color: T.body }}>{d}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PHAT! */}
      <section style={{ background: T.paper, borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
            <Reveal>
              <div className="text-[9px] uppercase tracking-[0.18em] mb-3" style={{ fontFamily: F.mono, color: T.gold }}>Spotlight 02</div>
              <div className="w-8 h-px mb-5" style={{ background: T.gold }}/>
              <h2 className="font-bold mb-1" style={{ fontFamily: F.serif, fontSize: 20, color: T.canvas }}>PHAT! Music &amp; Entertainment Ltd</h2>
              <div className="text-[11px] mb-0.5" style={{ fontFamily: F.mono, color: T.muted }}>Head of Finance &amp; Operations</div>
              <div className="text-[10px] uppercase tracking-widest mb-5" style={{ fontFamily: F.mono, color: T.gold }}>2015 — Present</div>
              <p className="text-[13px] leading-relaxed" style={{ fontFamily: F.sans, color: T.body }}>Managed the full spectrum of the company's finance and operations. This includes developing financial strategies, overseeing reporting and audits, and ensuring compliance with tax laws and regulatory frameworks. Also served as an internal advisor on financial and statutory matters, helping to align operations with both business goals and legal obligations.</p>
            </Reveal>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {[
                { n:"01", t:"Finance department establishment", d:"Created the finance department and embedded it to the administration to adequately cater to company financial reporting." },
                { n:"02", t:"Company compliance", d:"Created compliance monitoring systems to improve company compliance." },
                { n:"03", t:"Internal Control Framework", d:"Established the company internal control systems and processes." },
                { n:"04", t:"Digitalisation", d:"Digitalised the company financial recording and reporting." },
              ].map(({ n, t, d }, i) => (
                <Reveal key={t} delay={i * 70}>
                  <div className="hover-lift card-hover border p-5 h-full"
                    style={{ background: T.white, borderColor: T.border, borderRadius: 10 }}>
                    <div className="text-[9px] font-semibold mb-3" style={{ fontFamily: F.mono, color: T.goldLight }}>{n}</div>
                    <div className="font-semibold text-[13px] mb-2" style={{ fontFamily: F.sans, color: T.canvas }}>{t}</div>
                    <div className="text-[12px] leading-relaxed" style={{ fontFamily: F.sans, color: T.body }}>{d}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Operational Philosophy */}
      <section style={{ background: T.white }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <Reveal className="mb-10">
            <div className="text-[9px] uppercase tracking-[0.18em] mb-2" style={{ fontFamily: F.mono, color: T.gold }}>Operational Philosophy</div>
          </Reveal>
          <div className="grid lg:grid-cols-3 gap-5">
            {[
              { icon:"⚖️", t:"Tax Beyond Compliance", b:"Tax is not treated as a filing exercise. Compliance, planning and risk are considered together so that tax decisions support the wider financial position of the organisation." },
              { icon:"📈", t:"Finance as Strategy", b:"Finance should inform decisions, not simply report them. Financial analysis, controls and performance information are used alongside contracts, risk and operational considerations." },
              { icon:"🏛️", t:"Board as the Client", b:"Financial information ultimately has to serve decision-makers. Reporting, financial models and risk assessments are therefore presented with the clarity required for Board and executive decisions." },
              { icon:"🛡️", t:"Controls", b:"Good financial management starts with the right systems and structures. Finance functions, controls, reporting processes and compliance frameworks are built to remain effective as organisations grow." },
              { icon:"📋", t:"Regulatory Engagement", b:"Regulatory matters are managed through direct engagement and evidence. Experience with audits, assessments, objections and compliance reviews informs a practical approach to resolving regulatory issues." },
              { icon:"🌍", t:"Policy Beyond the Balance Sheet", b:"Tax decisions affect businesses, governments and the wider economy. Professional and research work therefore extends beyond financial administration into tax policy, economic analysis and international tax developments." },
            ].map(({ icon, t, b }, i) => (
              <Reveal key={t} delay={i * 60}>
                <div className="hover-lift card-hover border p-6 h-full"
                  style={{ background: i % 2 === 0 ? T.paper : T.white, borderColor: T.border, borderRadius: 10 }}>
                  <div className="text-2xl mb-4">{icon}</div>
                  <div className="font-semibold text-[13px] mb-2" style={{ fontFamily: F.sans, color: T.canvas }}>{t}</div>
                  <div className="text-[12px] leading-relaxed" style={{ fontFamily: F.sans, color: T.body }}>{b}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer setPage={() => {}}/>
    </main>
  );
}

/* ═══════════════════════════════════
   POLICY
═══════════════════════════════════ */
function PolicyPage({ setDrawer }: { setDrawer: (d: DrawerData) => void }) {
  const subs = [
    { year:"2023–26", title:"Finance Bill Recommendations", cat:"Annual Parliamentary Submission", desc:"Annual written submissions to Parliament and National Treasury on the Finance Bill.", impacts:["Income tax rate and bracket analysis","VAT on digital services","Withholding tax on platform economy","SME tax burden impact assessment"] },
    { year:"2024", title:"Tax Laws (Amendment) Bill 2024", cat:"Legislative Engagement", desc:"Technical commentary on proposed amendments to the Income Tax ACT, Value Added Tax ACT, Tax Procedures ACT.", impacts:["Administrative efficiency proposals","Compliance burden analysis","SME impact modelling","Objection and dispute procedures"] },
    { year:"2025", title:"Income Tax (Domestic Minimum Top-Up Tax) Regulations 2025", cat:"OECD Pillar Two", desc:"Analysis of Kenya's Domestic Minimum Top-Up Tax implementing OECD Pillar Two global minimum tax framework.", impacts:["Pillar Two implementation analysis","Qualifying domestic minimum top-up tax","GloBE model rules application","Compliance for MNEs in Kenya"] },
    { year:"2026", title:"Income Tax (Residential Rental Income Tax) Regulations 2026", cat:"Property Taxation", desc:"Feedback on regulations governing taxation of residential rental income — rate structures, filing obligations, and landlord compliance.", impacts:["Rental income tax rate analysis","Filing and compliance obligations","Landlord sector impact","Enforcement mechanism review"] },
    { year:"2026", title:"OECD Model Reporting Rules for Digital Platforms (Amendments 2026)", cat:"OECD Digital Platforms", desc:"Technical response to OECD amendments to the Model Reporting Rules for Digital Platforms — DAC7-aligned obligations for platform operators in Kenya.", impacts:["DAC7-aligned platform reporting","Digital operator obligations in Kenya","Cross-border income reporting","Transfer pricing documentation"] },
  ];
  const pubs = [
    { title:"The Robot Tax in Sub-Saharan Africa: Concept, Context, and Viability", venue:"7th ICPAK Annual Tax Symposium", year:"2026", abstract:"Examines the conceptual basis and policy viability of taxing automation in Sub-Saharan African economies, considering labour market displacement and revenue implications.", actions:[{ label:"View Presentation", href:"https://x.com/ICPAK_Kenya/status/2087528837584159102", primary:true }] },
    { title:"Deferred Until Distribution: The Distributed Profit Tax Model", venue:"IJESSS", year:"2026", abstract:"Proposes and evaluates a distributed profit tax as an alternative corporate income tax structure, with modelled application to East African jurisdictions.", actions:[{ label:"Download", href:"https://ijesssjournal.com/index.php/ijesss/article/download/51/42", primary:true, download:true }, { label:"Abstract", href:"https://ijesssjournal.com/index.php/ijesss/article/view/51", primary:false }] },
    { title:"Human Capital Efficiency and Firm-Level Labour Productivity: Panel Evidence from Publicly Listed Firms in East Africa", venue:"Journal of Frontiers in Humanities and Social Sciences, 4(2), 257-272", year:"2026", abstract:"Investigates the relationship between human capital investment efficiency and firm-level productivity outcomes across East African firms.", actions:[{ label:"Download", href:"https://bluprintpub.com/index.php/JOFHSCS/article/download/385/492", primary:true, download:true }] },
    { title:"Organizational Capital Efficiency and Labour Productivity: Evidence from Publicly Listed Firms in East Africa", venue:"Journal of Business, Economics and Management Research Studies, 4(2), 100-112", year:"2026", abstract:"Examines how organizational capital efficiency influences labour productivity among publicly listed firms in East Africa.", actions:[{ label:"View Paper", href:"https://bluprintpub.com/index.php/JOBEMRS/article/view/383", primary:true }] },
  ];

  return (
    <main style={{ background: T.paper }}>
      <PageBanner tag="Policy & Research" title="Tax Policy Engagement and Research"/>

      {/* Timeline */}
      <section style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <Reveal className="mb-10">
            <div className="text-[9px] uppercase tracking-[0.18em] mb-2" style={{ fontFamily: F.mono, color: T.gold }}>Legislative Submissions</div>
            <h2 className="font-bold" style={{ fontFamily: F.serif, fontSize: "clamp(20px,2.5vw,28px)", color: T.canvas }}>Tax Law &amp; Policy Engagements</h2>
          </Reveal>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-px hidden md:block" style={{ background: T.border }}/>
            <div className="space-y-4">
              {subs.map((s, i) => (
                <Reveal key={s.title} delay={i * 60}>
                  <div onClick={() => setDrawer({ title: s.title, category: s.cat, summary: s.desc, impacts: s.impacts })}
                    className="group cursor-pointer md:pl-24 relative">
                    <div className="hidden md:block absolute left-[60px] top-5 w-2.5 h-2.5 rounded-full border-2 z-10 transition-all group-hover:scale-125"
                      style={{ borderColor: T.canvas, background: T.white }}/>
                    <div className="hidden md:block absolute left-0 top-4 text-[9px] font-semibold text-right pr-5 leading-tight"
                      style={{ width: 60, fontFamily: F.mono, color: T.muted }}>{s.year}</div>
                    <div className="border p-5 transition-all group-hover:border-[#0B1D3A] group-hover:-translate-y-0.5 group-hover:shadow-sm"
                      style={{ background: T.paper, borderColor: T.border, borderRadius: 10 }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="md:hidden text-[9px] font-semibold" style={{ fontFamily: F.mono, color: T.muted }}>{s.year}</span>
                            <span className="text-[8px] font-semibold uppercase tracking-wide px-2 py-0.5"
                              style={{ fontFamily: F.mono, background: T.goldFaint, color: T.gold, borderRadius: 4 }}>{s.cat}</span>
                          </div>
                          <div className="font-semibold text-[13px] mb-1" style={{ fontFamily: F.sans, color: T.canvas }}>{s.title}</div>
                          <p className="text-[12px] leading-relaxed" style={{ fontFamily: F.sans, color: T.body }}>{s.desc}</p>
                        </div>
                        <svg className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.canvas} strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Publications */}
      <section style={{ background: T.paper }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <Reveal className="mb-10">
            <div className="text-[9px] uppercase tracking-[0.18em] mb-2" style={{ fontFamily: F.mono, color: T.gold }}>Peer-Reviewed Research</div>
            <h2 className="font-bold" style={{ fontFamily: F.serif, fontSize: "clamp(20px,2.5vw,28px)", color: T.canvas }}>Publications</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            {pubs.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <div className="hover-lift card-hover border p-6 h-full flex flex-col"
                  style={{ background: T.white, borderColor: T.border, borderRadius: 10 }}>
                  <div className="text-[9px] uppercase tracking-wide font-semibold mb-3" style={{ fontFamily: F.mono, color: T.canvas }}>{p.year} · {p.venue}</div>
                  <h3 className="font-semibold text-[14px] leading-snug mb-3" style={{ fontFamily: F.serif, color: T.canvas }}>{p.title}</h3>
                  <p className="text-[12px] leading-relaxed flex-1 mb-5" style={{ fontFamily: F.sans, color: T.body }}>{p.abstract}</p>
                  <div className="flex gap-2">
                    {p.actions.map(action => (
                      <a key={action.label} href={action.href} target="_blank" rel="noopener noreferrer"
                        className={`interactive-button text-[9px] font-semibold px-4 py-2 ${action.primary ? "flex items-center gap-1.5" : "border"}`}
                        style={action.primary
                          ? { fontFamily: F.mono, background: T.canvas, color: T.white, borderRadius: 6 }
                          : { fontFamily: F.mono, borderColor: T.border, color: T.body, borderRadius: 6 }}>
                        {action.download && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
                        {action.label}
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: T.white, borderTop: `1px solid ${T.border}` }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <Reveal>
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-12 items-center">
              <div>
                <div className="text-[9px] uppercase tracking-[0.18em] mb-2" style={{ fontFamily: F.mono, color: T.gold }}>Newsletter</div>
                <h2 className="font-bold" style={{ fontFamily: F.serif, fontSize: "clamp(20px,2.5vw,28px)", color: T.canvas }}>Tax and More</h2>
              </div>
              <a
                href="https://linkedin.com/newsletters/tax-and-more-7366750008982888448"
                target="_blank"
                rel="noreferrer"
                className="hover-lift card-hover border p-6 lg:col-span-2 group"
                style={{ background: T.paper, borderColor: T.border, borderRadius: 10 }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] mb-3" style={{ fontFamily: F.mono, color: T.gold }}>LinkedIn Newsletter</div>
                    <div className="font-semibold text-[14px] mb-2" style={{ fontFamily: F.serif, color: T.canvas }}>Tax and More</div>
                    <p className="text-[12px] leading-relaxed" style={{ fontFamily: F.sans, color: T.body }}>
                      Practical perspectives on tax policy, economic research, and finance strategy.
                    </p>
                  </div>
                  <svg className="flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.canvas} strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </div>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer setPage={() => {}}/>
    </main>
  );
}

/* ═══════════════════════════════════
   CONTACT
═══════════════════════════════════ */
function ContactPage() {
  const links = [
    { l:"LinkedIn", v:"linkedin.com/in/mwendajames", h:"https://www.linkedin.com/in/mwendajames/" },
    { l:"Substack", v:"substack.com/@arsenemwenda", h:"https://substack.com/@arsenemwenda" },
    { l:"Scholar", v:"Google Scholar — James Mwenda", h:"https://scholar.google.com/citations?view_op=list_works&hl=en&user=k0Lh7_cAAAAJ" },
    { l:"Newsletter", v:"Tax and More on LinkedIn", h:"https://linkedin.com/newsletters/tax-and-more-7366750008982888448" },
    { l:"ICPAK", v:"ICPAK Kenya on X", h:"https://x.com/ICPAK_Kenya/status/2087528837584159102?s=20" },
  ];
  return (
    <main style={{ background: T.paper }}>
      <PageBanner tag="Contact" title="Get in Touch"/>

      <section className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <Reveal>
            <div className="max-w-lg">
              <h2 className="font-bold mb-3" style={{ fontFamily: F.serif, fontSize: 22, color: T.canvas }}>Board Advisory, Speaking &amp; Consulting</h2>
              <p className="text-[13px] leading-relaxed mb-8" style={{ fontFamily: F.sans, color: T.body }}>
                13+ years of executive experience in tax compliance, financial systems architecture, and policy engagement.
              </p>
              <div className="flex flex-wrap gap-2">
                {["CPA-K","PhD — Economics","CFO East Africa"].map(b => (
                  <div key={b} className="tag-pill border text-[10px] px-3 py-1.5"
                    style={{ fontFamily: F.mono, borderColor: T.border, color: T.body, borderRadius: 999 }}>{b}</div>
                ))}
              </div>
            </div>
            <div className="contact-card overflow-hidden border mt-8" style={{ background: T.white, borderColor: T.border, borderRadius: 10 }}>
              {links.map(({ l, v, h }, i) => (
                <a key={l} href={h} target="_blank" rel="noreferrer"
                  className="contact-row reveal-item group grid grid-cols-[88px_1fr_auto] items-center gap-4 px-5 py-4"
                  style={{ borderTop: i === 0 ? "none" : `1px solid ${T.border}`, transitionDelay: `${i * 45}ms` }}>
                  <div className="text-[9px] uppercase tracking-[0.18em] font-semibold" style={{ fontFamily: F.mono, color: T.gold }}>{l}</div>
                  <div className="contact-link-text text-[13px] font-medium" style={{ fontFamily: F.sans, color: T.canvas }}>{v}</div>
                  <svg className="contact-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <Footer setPage={() => {}}/>
    </main>
  );
}

/* ═══════════════════════════════════
   FOOTER
═══════════════════════════════════ */
function Footer({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <footer style={{ background: T.canvas }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
        <div className="md:max-w-sm md:flex-1">
          <div className="font-bold mb-1" style={{ fontFamily: F.serif, fontSize: 18, color: T.white }}>James Mwenda</div>
          <div className="text-[9px] uppercase tracking-[0.18em] mb-2" style={{ fontFamily: F.mono, color: T.goldLight }}>Tax &amp; Finance Executive</div>
          <p className="text-[12px] leading-relaxed" style={{ fontFamily: F.sans, color: "rgba(255,255,255,0.38)" }}>
            Senior Taxation &amp; Finance Executive. PhD in Economics. CPA‑K. 13+ years leading financial systems and tax policy across East Africa.
          </p>
        </div>
        <div className="flex flex-wrap md:flex-nowrap items-center gap-x-5 gap-y-2 md:justify-center md:flex-1">
          {([["home","Overview"],["leadership","Leadership"],["policy","Policy & Research"],["contact","Contact"]] as [Page,string][]).map(([p,l]) => (
            <button key={p} onClick={() => setPage(p)} className="footer-nav-link text-[12px] whitespace-nowrap"
              style={{ fontFamily: F.sans, color: "rgba(255,255,255,0.50)" }}>{l}</button>
          ))}
        </div>
        <div className="md:ml-auto md:pr-16">
          <a
            href="https://www.linkedin.com/in/mwendajames/"
            target="_blank"
            rel="noreferrer"
            aria-label="James Mwenda on LinkedIn"
            className="footer-linkedin flex items-center justify-center rounded-full border"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29ZM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.1 20.45H3.54V8.98H7.1v11.47Z"/>
            </svg>
          </a>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-6 pr-24 lg:pl-12 lg:pr-24 py-2.5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <span className="text-[9px]" style={{ fontFamily: F.mono, color: "rgba(255,255,255,0.22)" }}>© 2026 James Mwenda. All rights reserved.</span>
        <span className="text-[9px]" style={{ fontFamily: F.mono, color: "rgba(255,255,255,0.22)" }}>Nairobi, Kenya · East Africa</span>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════
   DRAWER
═══════════════════════════════════ */
function Drawer({ data, onClose }: { data: DrawerData; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-overlay-in">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "rgba(11,29,58,0.55)" }} onClick={onClose}/>
      <div className="relative w-full max-w-[500px] border-l h-full overflow-y-auto flex flex-col animate-drawer-in"
        style={{ background: T.white, borderColor: T.border, boxShadow: "-16px 0 48px rgba(11,29,58,0.14)" }}>
        <div className="sticky top-0 border-b px-7 py-4 flex items-center justify-between"
          style={{ background: T.white, borderColor: T.border }}>
          <span className="px-3 py-1 text-[9px] font-semibold uppercase tracking-wide"
            style={{ fontFamily: F.mono, background: T.goldFaint, color: T.gold, borderRadius: 5 }}>{data.category}</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center transition-opacity hover:opacity-50" style={{ color: T.muted }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 px-7 py-8">
          <h2 className="font-bold leading-tight mb-4" style={{ fontFamily: F.serif, fontSize: 18, color: T.canvas }}>{data.title}</h2>
          <p className="text-[13px] leading-relaxed mb-8" style={{ fontFamily: F.sans, color: T.body }}>{data.summary}</p>
          <div className="mb-8">
            <div className="text-[9px] uppercase tracking-[0.18em] mb-4" style={{ fontFamily: F.mono, color: T.muted }}>Core Policy Impacts</div>
            <div className="space-y-3">
              {data.impacts.map(imp => (
                <div key={imp} className="flex items-start gap-3 text-[13px]" style={{ fontFamily: F.sans, color: T.body }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: T.gold }}/>
                  {imp}
                </div>
              ))}
            </div>
          </div>
          <button className="w-full text-sm font-semibold py-3.5 flex items-center justify-center gap-2 mb-7 transition-opacity hover:opacity-90"
            style={{ fontFamily: F.sans, background: T.canvas, color: T.white, borderRadius: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Full Submission PDF
          </button>
          <div className="border-t pt-5 flex items-center gap-3" style={{ borderColor: T.border }}>
            <div className="w-9 h-9 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ fontFamily: F.serif, background: T.canvas, borderRadius: 8 }}>JM</div>
            <div>
              <div className="font-semibold text-[13px]" style={{ fontFamily: F.sans, color: T.canvas }}>James Mwenda</div>
              <div className="text-[9px] mt-0.5" style={{ fontFamily: F.mono, color: T.muted }}>PhD Candidate · CPA-K · Tax & Finance Executive</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Floating WhatsApp ── */
function WhatsAppButton() {
  return (
    <a href="https://wa.me/254700000000" target="_blank" rel="noreferrer"
      className="whatsapp-button fixed bottom-6 right-6 z-50 flex items-center justify-center"
      style={{ width: 52, height: 52, borderRadius: "50%", background: "#25D366", boxShadow: "0 4px 24px rgba(37,211,102,0.40)" }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}

/* ═══════════════════════════════════
   ROOT
═══════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [drawer, setDrawer] = useState<DrawerData | null>(null);
  const go = (p: Page) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <div style={{ background: T.paper, minHeight: "100vh" }}>
      <Nav page={page} setPage={go}/>
      <div key={page} className="animate-fade-in">
        {page === "home"       && <HomePage       setPage={go}/>}
        {page === "leadership" && <LeadershipPage/>}
        {page === "policy"     && <PolicyPage     setDrawer={setDrawer}/>}
        {page === "contact"    && <ContactPage/>}
      </div>
      {drawer && <Drawer data={drawer} onClose={() => setDrawer(null)}/>}
      <WhatsAppButton/>
    </div>
  );
}
