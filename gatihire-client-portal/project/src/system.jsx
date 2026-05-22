// Gatihire design system — tokens + atoms
// Declared aesthetic: modern operational SaaS with warm character.
// Amber-orange motion accent (gati = speed; Indian highway signage) over
// warm off-white + deep cool ink. Manrope (UI) + JetBrains Mono (IDs/data).

const G = {
  // surfaces
  paper:    'oklch(0.985 0.004 80)',    // app bg
  card:     '#ffffff',
  cardAlt:  'oklch(0.975 0.005 80)',
  ink:      'oklch(0.20 0.015 260)',    // primary text
  ink2:     'oklch(0.38 0.012 260)',    // secondary text
  mute:     'oklch(0.58 0.010 260)',
  faint:    'oklch(0.78 0.008 260)',
  border:   'oklch(0.92 0.006 80)',
  borderStrong: 'oklch(0.86 0.008 80)',
  // brand
  brand:    'oklch(0.68 0.175 52)',     // amber-orange
  brandDeep:'oklch(0.55 0.18 45)',
  brandSoft:'oklch(0.96 0.04 60)',
  ink900:   'oklch(0.18 0.02 260)',     // dark surface
  ink800:   'oklch(0.24 0.02 260)',
  // status
  ok:       'oklch(0.62 0.13 155)',
  okSoft:   'oklch(0.95 0.05 155)',
  warn:     'oklch(0.78 0.14 80)',
  warnSoft: 'oklch(0.96 0.07 85)',
  danger:   'oklch(0.58 0.20 25)',
  dangerSoft:'oklch(0.96 0.05 25)',
  info:     'oklch(0.55 0.12 240)',
  infoSoft: 'oklch(0.96 0.04 240)',
  // type
  sans:     '"Manrope", ui-sans-serif, system-ui, sans-serif',
  mono:     '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
};
window.G = G;

// Inject Google fonts + base reset once
(function injectFonts(){
  if (document.getElementById('gh-fonts')) return;
  const link = document.createElement('link');
  link.id = 'gh-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(link);
  const css = document.createElement('style');
  css.id = 'gh-base';
  css.textContent = `
    .gh, .gh * { box-sizing: border-box; }
    .gh { font-family: ${G.sans}; color: ${G.ink}; font-feature-settings: "ss01","cv11"; -webkit-font-smoothing: antialiased; }
    .gh button { font-family: inherit; }
    .gh input, .gh textarea, .gh select { font-family: inherit; color: inherit; }
    .gh .mono { font-family: ${G.mono}; font-feature-settings: "zero","ss02"; }
    .gh ::placeholder { color: ${G.mute}; }
    .gh-scroll::-webkit-scrollbar { display: none; }
  `;
  document.head.appendChild(css);
})();

// ── Logo (original placeholder wordmark) ────────────────────────────
function Logo({ size = 22, mono = false, withWord = true }) {
  const fg = mono ? 'currentColor' : G.brand;
  const ink = mono ? 'currentColor' : G.ink;
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,color:ink}}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <rect x="1" y="1" width="30" height="30" rx="8" fill={fg}/>
        <path d="M8 20 L14 12 L14 17 L20 17 L20 12 L26 20"
              fill="none" stroke="#fff" strokeWidth="2.6"
              strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8" cy="20" r="1.6" fill="#fff"/>
      </svg>
      {withWord && (
        <span style={{fontWeight:800,fontSize:size*0.78,letterSpacing:'-0.02em'}}>
          gatihire<span style={{color:G.brand}}>.</span>
        </span>
      )}
    </div>
  );
}

// ── Tiny icons (stroke-only, 16px viewBox 24) ────────────────────────
const Ico = {
  search:  <path d="M11 19a8 8 0 1 1 5.3-2L21 21" strokeLinecap="round" strokeLinejoin="round"/>,
  bell:    <path d="M6 16h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v4L6 16zM10 19a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round"/>,
  plus:    <path d="M12 5v14M5 12h14" strokeLinecap="round"/>,
  check:   <path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round"/>,
  arrow:   <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>,
  filter:  <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round"/>,
  lock:    <path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5z" strokeLinejoin="round"/>,
  unlock:  <path d="M7 11V8a5 5 0 0 1 9.6-2M5 11h14v9H5z" strokeLinejoin="round" strokeLinecap="round"/>,
  star:    <path d="M12 4l2.5 5 5.5.8-4 3.9.95 5.5L12 16.6 7.05 19.2 8 13.7 4 9.8 9.5 9z" strokeLinejoin="round"/>,
  more:    <path d="M5 12h.01M12 12h.01M19 12h.01" strokeLinecap="round" strokeWidth="3"/>,
  briefcase: <path d="M3 8h18v12H3zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinejoin="round"/>,
  users:   <path d="M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M16 14a3 3 0 1 0 0-6M21 20c0-2.5-2-4-4.5-4.5" strokeLinecap="round" strokeLinejoin="round"/>,
  chart:   <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round"/>,
  db:      <path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" strokeLinejoin="round"/>,
  inbox:   <path d="M4 4h16v12H4zM4 13l4 3h8l4-3" strokeLinejoin="round"/>,
  gear:    <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M19 12l2-1-1-2-2 .5-1-1 .5-2-2-1-1 2h-1l-1-2-2 1 .5 2-1 1-2-.5-1 2 2 1v1l-2 1 1 2 2-.5 1 1-.5 2 2 1 1-2h1l1 2 2-1-.5-2 1-1 2 .5 1-2-2-1z" strokeLinejoin="round"/>,
  pin:     <path d="M12 21v-7M8 14h8l-1-3V5h-6v6z" strokeLinejoin="round"/>,
  truck:   <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M6 19a2 2 0 1 0 0-1M17 19a2 2 0 1 0 0-1" strokeLinejoin="round" strokeLinecap="round"/>,
  globe:   <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" strokeLinejoin="round"/>,
  calendar:<path d="M4 6h16v14H4zM8 3v4M16 3v4M4 11h16" strokeLinejoin="round"/>,
  mail:    <path d="M3 6h18v12H3zM3 7l9 7 9-7" strokeLinejoin="round"/>,
  phone:   <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinejoin="round"/>,
  wa:      <path d="M5 19l1.5-4a8 8 0 1 1 3.5 3.5L5 19zM9 10c0 4 3 6 6 6l1.5-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2L9.5 8.5C9.2 9 9 9.5 9 10z" strokeLinejoin="round" strokeLinecap="round"/>,
  pencil:  <path d="M4 20h4L20 8l-4-4L4 16zM14 6l4 4" strokeLinejoin="round"/>,
  upload:  <path d="M12 16V4M7 9l5-5 5 5M4 20h16" strokeLinecap="round" strokeLinejoin="round"/>,
  verified:<path d="M12 3l2 2 3-0.5 1 3 2.5 1.5L19 12l1.5 3-2.5 1.5-1 3-3-.5-2 2-2-2-3 .5-1-3L3 15l1.5-3L3 9l2.5-1.5 1-3 3 .5z M9 12l2 2 4-4" strokeLinejoin="round"/>,
  x:       <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/>,
  download:<path d="M12 4v12M7 11l5 5 5-5M4 20h16" strokeLinecap="round" strokeLinejoin="round"/>,
  loc:     <path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" strokeLinejoin="round"/>,
  building:<path d="M5 21V5h8v16M13 11h6v10M8 8h2M8 12h2M8 16h2M16 14h1M16 17h1" strokeLinejoin="round"/>,
  link:    <path d="M10 14a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-1 1M14 10a4 4 0 0 1 0 6l-2 2a4 4 0 0 1-6-6l1-1" strokeLinejoin="round"/>,
};
function I({ name, size = 16, color = 'currentColor', stroke = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={stroke} aria-hidden style={{flex:'0 0 auto'}}>
      {Ico[name] || null}
    </svg>
  );
}

// ── Buttons ─────────────────────────────────────────────────────────
function Btn({ children, variant = 'primary', size = 'md', icon, iconRight, full, style, ...rest }) {
  const sz = {
    sm: { h:30, px:10, fs:12.5, gap:6, r:7 },
    md: { h:36, px:14, fs:13.5, gap:8, r:8 },
    lg: { h:44, px:18, fs:15, gap:10, r:10 },
  }[size];
  const v = {
    primary: { bg: G.ink, c: '#fff', bd: G.ink },
    brand:   { bg: G.brand, c: '#fff', bd: G.brand },
    ghost:   { bg: 'transparent', c: G.ink, bd: 'transparent' },
    outline: { bg: '#fff', c: G.ink, bd: G.borderStrong },
    soft:    { bg: G.cardAlt, c: G.ink, bd: G.border },
    danger:  { bg: '#fff', c: G.danger, bd: G.border },
  }[variant];
  return (
    <button {...rest} style={{
      display:'inline-flex',alignItems:'center',justifyContent:'center',gap:sz.gap,
      height:sz.h, padding:`0 ${sz.px}px`, fontSize:sz.fs, fontWeight:600,
      borderRadius:sz.r, border:`1px solid ${v.bd}`, background:v.bg, color:v.c,
      cursor:'pointer', width: full?'100%':'auto', letterSpacing:'-0.005em',
      ...style,
    }}>
      {icon}{children}{iconRight}
    </button>
  );
}

function IconBtn({ name, size = 32, iconSize = 16, ...rest }) {
  return (
    <button {...rest} style={{
      width:size, height:size, borderRadius:8, border:`1px solid ${G.border}`,
      background:'#fff', color:G.ink2, display:'inline-flex',
      alignItems:'center', justifyContent:'center', cursor:'pointer'
    }}>
      <I name={name} size={iconSize}/>
    </button>
  );
}

// ── Pill / Tag / Status ─────────────────────────────────────────────
function Pill({ children, tone = 'neutral', dot, style }) {
  const t = {
    neutral: { bg: G.cardAlt, fg: G.ink2, bd: G.border, dot: G.mute },
    brand:   { bg: G.brandSoft, fg: G.brandDeep, bd: 'transparent', dot: G.brand },
    ok:      { bg: G.okSoft, fg: G.ok, bd:'transparent', dot: G.ok },
    warn:    { bg: G.warnSoft, fg: 'oklch(0.5 0.13 70)', bd:'transparent', dot: G.warn },
    danger:  { bg: G.dangerSoft, fg: G.danger, bd:'transparent', dot: G.danger },
    info:    { bg: G.infoSoft, fg: G.info, bd:'transparent', dot: G.info },
    dark:    { bg: G.ink, fg:'#fff', bd: G.ink, dot:'#fff' },
  }[tone];
  return (
    <span style={{
      display:'inline-flex',alignItems:'center',gap:6,height:22,
      padding:'0 8px', borderRadius:999, fontSize:11.5, fontWeight:600,
      background:t.bg, color:t.fg, border:`1px solid ${t.bd}`,
      letterSpacing:'-0.005em', ...style,
    }}>
      {dot && <span style={{width:6,height:6,borderRadius:99,background:t.dot}}/>}
      {children}
    </span>
  );
}

// ── Form fields ─────────────────────────────────────────────────────
function Field({ label, hint, error, children, required, style }) {
  return (
    <label style={{display:'flex',flexDirection:'column',gap:6,...style}}>
      {label && (
        <span style={{fontSize:12,fontWeight:600,color:G.ink2,letterSpacing:'-0.005em'}}>
          {label}{required && <span style={{color:G.brand}}> *</span>}
          {hint && <span style={{color:G.mute,fontWeight:500}}> · {hint}</span>}
        </span>
      )}
      {children}
      {error && <span style={{fontSize:11.5,color:G.danger}}>{error}</span>}
    </label>
  );
}

function Input({ placeholder, value, prefix, suffix, style, size='md', ...rest }) {
  const h = size==='lg'?44:size==='sm'?30:38;
  return (
    <div style={{
      display:'flex',alignItems:'center',height:h,
      background:'#fff', border:`1px solid ${G.border}`, borderRadius:8,
      padding:`0 ${prefix?8:12}px ${suffix?0:0} ${prefix?8:12}px`,
      gap:8, ...style,
    }}>
      {prefix && <span style={{display:'flex',color:G.mute}}>{prefix}</span>}
      <input placeholder={placeholder} defaultValue={value} {...rest}
        style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:13.5,height:'100%'}}/>
      {suffix && <span style={{display:'flex',color:G.mute,paddingRight:10}}>{suffix}</span>}
    </div>
  );
}

function Select({ value, options=[], style }) {
  return (
    <div style={{
      display:'flex',alignItems:'center',justifyContent:'space-between',height:38,
      background:'#fff', border:`1px solid ${G.border}`, borderRadius:8,
      padding:'0 12px', fontSize:13.5, color:G.ink, ...style,
    }}>
      <span>{value || options[0]}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.mute} strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round"/></svg>
    </div>
  );
}

function Checkbox({ checked, label, style }) {
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:8,fontSize:13,...style}}>
      <span style={{
        width:16,height:16,borderRadius:4,
        background: checked?G.ink:'#fff',
        border:`1.5px solid ${checked?G.ink:G.borderStrong}`,
        display:'inline-flex',alignItems:'center',justifyContent:'center',color:'#fff'
      }}>
        {checked && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
      <span>{label}</span>
    </span>
  );
}

function Toggle({ on }) {
  return (
    <span style={{
      width:30,height:18,borderRadius:99,
      background: on?G.ink:G.faint,
      display:'inline-flex',alignItems:'center',padding:2,
      transition:'.15s', flex:'0 0 auto',
    }}>
      <span style={{width:14,height:14,borderRadius:99,background:'#fff',
        marginLeft: on?12:0,transition:'.15s',boxShadow:'0 1px 2px rgba(0,0,0,.2)'}}/>
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────
function Avatar({ name='AB', size=32, tone, ring }) {
  const palette = ['oklch(0.7 0.12 30)','oklch(0.65 0.10 220)','oklch(0.68 0.11 150)','oklch(0.68 0.13 290)','oklch(0.72 0.13 60)','oklch(0.6 0.1 180)'];
  const seed = (name||'').charCodeAt(0) % palette.length;
  const bg = tone || palette[seed];
  const initials = (name||'').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
  return (
    <span style={{
      width:size,height:size,borderRadius:99,background:bg,color:'#fff',
      fontSize:size*0.38,fontWeight:700,display:'inline-flex',
      alignItems:'center',justifyContent:'center',flex:'0 0 auto',
      boxShadow: ring?`0 0 0 2px #fff, 0 0 0 3.5px ${G.brand}`:'none',
      letterSpacing:'-0.01em',
    }}>{initials}</span>
  );
}

// ── App shell (sidebar + topbar) ────────────────────────────────────
function Shell({ active='dashboard', orgName='Mahindra Logistics', user='Priya Nair', children, dark=false }) {
  const nav = [
    {id:'dashboard', label:'Home', icon:'chart'},
    {id:'jobs',      label:'Jobs', icon:'briefcase', badge:8},
    {id:'applicants',label:'Applicants', icon:'users', badge:142},
    {id:'database',  label:'Talent database', icon:'db'},
    {id:'inbox',     label:'Inbox', icon:'inbox', badge:3},
    {id:'interviews',label:'Interviews', icon:'calendar'},
    {id:'analytics', label:'Analytics', icon:'chart'},
  ];
  const bottom = [
    {id:'team', label:'Team & billing', icon:'gear'},
  ];
  const sb = dark ? {
    bg: G.ink900, fg:'rgba(255,255,255,.7)', fgActive:'#fff',
    activeBg:'rgba(255,255,255,.08)', border:'rgba(255,255,255,.08)',
    section:'rgba(255,255,255,.4)',
  } : {
    bg:'#fff', fg:G.ink2, fgActive:G.ink,
    activeBg:G.cardAlt, border:G.border, section:G.mute,
  };
  return (
    <div className="gh" style={{
      display:'flex', width:'100%', height:'100%', background:G.paper,
      color:G.ink, fontSize:13.5,
    }}>
      <aside style={{
        width:228, flex:'0 0 228px', height:'100%',
        background:sb.bg, borderRight:`1px solid ${sb.border}`,
        display:'flex',flexDirection:'column',padding:'14px 12px',gap:4,
      }}>
        <div style={{padding:'4px 8px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <Logo mono={dark}/>
          <span style={{
            fontSize:9.5,fontWeight:700,letterSpacing:'.06em',
            color:dark?'rgba(255,255,255,.5)':G.mute,
            padding:'2px 6px',border:`1px solid ${sb.border}`,borderRadius:4,
          }}>BETA</span>
        </div>
        <div style={{
          margin:'4px 0 12px', padding:'9px 10px', borderRadius:9,
          border:`1px solid ${sb.border}`,
          background: dark?'rgba(255,255,255,.04)':G.cardAlt,
          display:'flex',alignItems:'center',gap:8,
        }}>
          <div style={{
            width:24,height:24,borderRadius:6,background:G.brand,color:'#fff',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontWeight:800,fontSize:11,
          }}>ML</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12.5,fontWeight:700,color:sb.fgActive,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{orgName}</div>
            <div style={{fontSize:10.5,color:sb.section,marginTop:1}}>Workspace · Growth</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={sb.fg} strokeWidth="2"><path d="M8 9l4-4 4 4M8 15l4 4 4-4" strokeLinecap="round"/></svg>
        </div>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:'.08em',color:sb.section,padding:'8px 10px 4px'}}>HIRING</div>
        {nav.map(n => (
          <div key={n.id} style={{
            display:'flex',alignItems:'center',gap:10,
            padding:'8px 10px',borderRadius:8,cursor:'pointer',
            background: active===n.id?sb.activeBg:'transparent',
            color: active===n.id?sb.fgActive:sb.fg,
            fontWeight: active===n.id?600:500,
            position:'relative',
          }}>
            {active===n.id && <span style={{position:'absolute',left:-12,top:8,bottom:8,width:2.5,background:G.brand,borderRadius:99}}/>}
            <I name={n.icon} size={15.5}/>
            <span style={{flex:1}}>{n.label}</span>
            {n.badge && (
              <span style={{
                fontSize:10.5,fontWeight:700,
                background: active===n.id?G.brand:(dark?'rgba(255,255,255,.1)':G.cardAlt),
                color: active===n.id?'#fff':(dark?'rgba(255,255,255,.7)':G.ink2),
                padding:'1px 6px',borderRadius:99,minWidth:18,textAlign:'center'
              }}>{n.badge}</span>
            )}
          </div>
        ))}
        <div style={{flex:1}}/>
        {bottom.map(n => (
          <div key={n.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:8,color:sb.fg}}>
            <I name={n.icon} size={15.5}/>{n.label}
          </div>
        ))}
        <div style={{
          margin:'4px 0 0',padding:10,borderRadius:9,
          background:dark?'rgba(255,255,255,.05)':G.cardAlt,
          border:`1px solid ${sb.border}`,
          display:'flex',alignItems:'center',gap:8,
        }}>
          <Avatar name={user} size={28}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:600,color:sb.fgActive}}>{user}</div>
            <div style={{fontSize:10.5,color:sb.section}}>TA · Recruiter</div>
          </div>
        </div>
      </aside>
      <main style={{flex:1,minWidth:0,height:'100%',display:'flex',flexDirection:'column'}}>
        {children}
      </main>
    </div>
  );
}

// ── Top bar inside the main area ────────────────────────────────────
function TopBar({ title, sub, breadcrumb, actions, search=true }) {
  return (
    <header style={{
      display:'flex',alignItems:'center',gap:14,
      padding:'14px 24px',borderBottom:`1px solid ${G.border}`,background:'#fff',
      flex:'0 0 auto',
    }}>
      <div style={{flex:1,minWidth:0}}>
        {breadcrumb && (
          <div style={{fontSize:11.5,color:G.mute,fontWeight:500,marginBottom:3,display:'flex',alignItems:'center',gap:6}}>
            {breadcrumb.map((b,i) => (
              <React.Fragment key={i}>
                <span style={{color:i===breadcrumb.length-1?G.ink2:G.mute}}>{b}</span>
                {i<breadcrumb.length-1 && <span>/</span>}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 style={{fontSize:18.5,fontWeight:700,margin:0,letterSpacing:'-0.02em'}}>{title}</h1>
        {sub && <div style={{fontSize:12.5,color:G.mute,marginTop:2}}>{sub}</div>}
      </div>
      {search && (
        <div style={{
          display:'flex',alignItems:'center',gap:8,height:34,width:280,
          background:G.cardAlt,border:`1px solid ${G.border}`,borderRadius:8,padding:'0 10px',
          color:G.mute,fontSize:12.5
        }}>
          <I name="search" size={14}/> Search jobs, candidates…
          <span style={{marginLeft:'auto',fontFamily:G.mono,fontSize:11}}>⌘K</span>
        </div>
      )}
      <IconBtn name="bell"/>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>{actions}</div>
    </header>
  );
}

// ── Image placeholder (striped) ─────────────────────────────────────
function PH({ w='100%', h=120, label='photo', style }) {
  return (
    <div style={{
      width:w, height:h,
      background:`repeating-linear-gradient(45deg, ${G.cardAlt} 0 8px, ${G.paper} 8px 16px)`,
      border:`1px dashed ${G.borderStrong}`, borderRadius:8,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:G.mono,fontSize:11,color:G.mute,letterSpacing:'.04em',
      ...style,
    }}>{label}</div>
  );
}

// ── Frame helper for artboard backgrounds ───────────────────────────
function Frame({ children, bg=G.paper, style }) {
  return (
    <div className="gh" style={{
      width:'100%',height:'100%',background:bg,overflow:'hidden',
      display:'flex',flexDirection:'column',...style,
    }}>
      {children}
    </div>
  );
}

Object.assign(window, { G, Logo, I, Btn, IconBtn, Pill, Field, Input, Select, Checkbox, Toggle, Avatar, Shell, TopBar, PH, Frame });
