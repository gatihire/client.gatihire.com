// Brand & system overview artboard — type, color, components

function BrandSystem() {
  return (
    <Frame bg="#fff" style={{padding:'36px 44px', overflow:'auto'}}>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:24,paddingBottom:24,borderBottom:`1px solid ${G.border}`}}>
        <div>
          <Logo size={32}/>
          <h2 style={{fontSize:30,fontWeight:800,margin:'18px 0 4px',letterSpacing:'-0.03em',maxWidth:720}}>
            The hiring OS for India's supply chain & logistics teams.
          </h2>
          <p style={{margin:0,color:G.ink2,fontSize:14,maxWidth:640}}>
            Client portal · employer side · v0.1 — system tokens, components, and visual direction.
          </p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <Pill tone="brand" dot>Live system</Pill>
          <Pill tone="neutral" dot>R-1 / 26 May</Pill>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.1fr 1fr 1fr',gap:32,marginTop:28}}>
        {/* Type */}
        <div>
          <SectionLabel>Type · Manrope + JetBrains Mono</SectionLabel>
          <div style={{fontSize:60,fontWeight:800,letterSpacing:'-0.04em',lineHeight:1,marginTop:8}}>Aa</div>
          <div style={{display:'flex',gap:18,marginTop:10,color:G.mute,fontSize:12}}>
            <span>400 / Regular</span><span>600 / Semibold</span><span>800 / Extrabold</span>
          </div>
          <div style={{marginTop:18,display:'grid',gap:8}}>
            {[
              ['Display · 30/800', 'A faster way to hire ops', 30, 800],
              ['H1 · 22/700',      'Warehouse Supervisor — Bhiwandi', 22, 700],
              ['H2 · 16/600',      'Applicants this week', 16, 600],
              ['Body · 13.5/500',  'Verified by Aadhaar & PAN. 4y exp in 3PL.', 13.5, 500],
              ['Mono · 12',        'CAN-04821 · LPA ₹6.4–8.2 · 30d notice', 12, 500, true],
            ].map(([k,t,sz,w,m]) => (
              <div key={k} style={{display:'flex',alignItems:'baseline',gap:14,paddingBottom:8,borderBottom:`1px solid ${G.border}`}}>
                <span style={{fontSize:10.5,fontFamily:G.mono,color:G.mute,minWidth:110}}>{k}</span>
                <span style={{fontSize:sz,fontWeight:w,letterSpacing:'-0.015em',fontFamily:m?G.mono:G.sans}}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <SectionLabel>Color · warm neutrals + amber motion accent</SectionLabel>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
            <Swatch name="brand" hex={G.brand} label="Brand · gati amber"/>
            <Swatch name="brand-deep" hex={G.brandDeep} label="Brand deep"/>
            <Swatch name="ink-900" hex={G.ink900} label="Ink 900"/>
            <Swatch name="ink" hex={G.ink} label="Ink 700 · text"/>
            <Swatch name="paper" hex={G.paper} label="Paper · app bg" dark/>
            <Swatch name="card-alt" hex={G.cardAlt} label="Card alt" dark/>
            <Swatch name="ok" hex={G.ok} label="OK · verified"/>
            <Swatch name="warn" hex={G.warn} label="Warn · expiring"/>
          </div>
        </div>

        {/* Components */}
        <div>
          <SectionLabel>Components</SectionLabel>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10}}>
            <Pill tone="brand" dot>Active</Pill>
            <Pill tone="ok" dot>Verified</Pill>
            <Pill tone="warn" dot>Expiring</Pill>
            <Pill tone="info" dot>Interviewing</Pill>
            <Pill tone="danger" dot>Rejected</Pill>
            <Pill tone="neutral" dot>Draft</Pill>
            <Pill tone="dark">Premium</Pill>
          </div>
          <div style={{display:'flex',gap:8,marginTop:14,flexWrap:'wrap'}}>
            <Btn variant="primary" icon={<I name="plus"/>}>Post a job</Btn>
            <Btn variant="brand">Unlock profile</Btn>
            <Btn variant="outline">Shortlist</Btn>
            <Btn variant="ghost">Skip</Btn>
          </div>
          <div style={{marginTop:14,display:'grid',gap:8}}>
            <Field label="Job title" hint="be specific">
              <Input placeholder="e.g. Warehouse Supervisor"/>
            </Field>
            <div style={{display:'flex',gap:8}}>
              <Checkbox checked label="Email"/>
              <Checkbox label="WhatsApp"/>
              <Checkbox checked label="SMS"/>
            </div>
          </div>
          <div style={{marginTop:18,padding:'12px 14px',background:G.ink900,borderRadius:10,color:'rgba(255,255,255,.85)',fontSize:12.5,display:'flex',alignItems:'center',gap:10}}>
            <span style={{width:6,height:6,borderRadius:99,background:G.brand}}/>
            <span style={{fontWeight:600,color:'#fff'}}>Voice</span>
            <span style={{opacity:0.7}}>Direct. Operational. Speaks ops vocabulary — "Bhiwandi DC", "30d notice", "TL/SL/AGM".</span>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginTop:30,paddingTop:24,borderTop:`1px solid ${G.border}`}}>
        {[
          ['Sign up & verify',  '2 variants'],
          ['Company setup',     '4-step wizard'],
          ['Dashboard',         '2 directions'],
          ['Post a job',        '2 composers'],
          ['Applicants → ATS',  'Table + Kanban'],
        ].map(([t,s],i) => (
          <div key={t} style={{padding:'12px 14px',background:G.cardAlt,borderRadius:10,border:`1px solid ${G.border}`}}>
            <div style={{fontFamily:G.mono,fontSize:10.5,color:G.mute,marginBottom:6}}>{String(i+1).padStart(2,'0')}</div>
            <div style={{fontWeight:700,fontSize:13.5}}>{t}</div>
            <div style={{color:G.mute,fontSize:11.5,marginTop:2}}>{s}</div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function SectionLabel({children}) {
  return (
    <div style={{fontFamily:G.mono,fontSize:10.5,color:G.mute,letterSpacing:'.08em',textTransform:'uppercase',display:'flex',alignItems:'center',gap:8}}>
      <span style={{width:6,height:6,borderRadius:99,background:G.brand}}/>{children}
    </div>
  );
}

function Swatch({hex,label,dark}) {
  return (
    <div style={{borderRadius:10,overflow:'hidden',border:`1px solid ${G.border}`}}>
      <div style={{background:hex,height:54}}/>
      <div style={{padding:'8px 10px',background:'#fff'}}>
        <div style={{fontSize:11.5,fontWeight:600}}>{label}</div>
        <div style={{fontSize:10,color:G.mute,fontFamily:G.mono,marginTop:1}}>{hex.replace(/^oklch\(|\)$/g,'')}</div>
      </div>
    </div>
  );
}

window.BrandSystem = BrandSystem;
