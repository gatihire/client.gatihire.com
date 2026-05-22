// Company onboarding wizard — 4 steps shown as 4 artboards

function OnboardStep({ step=1, total=4, title, sub, children, primaryLabel='Continue' }) {
  const labels = ['Company','Hiring focus','Verify','Invite team'];
  return (
    <Frame style={{background:G.paper}}>
      <header style={{padding:'16px 28px',borderBottom:`1px solid ${G.border}`,background:'#fff',display:'flex',alignItems:'center',gap:18}}>
        <Logo/>
        <div style={{flex:1,display:'flex',alignItems:'center',gap:18,marginLeft:32}}>
          {labels.map((l,i)=>{
            const n = i+1;
            const done = n<step, active = n===step;
            return (
              <React.Fragment key={l}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{
                    width:22,height:22,borderRadius:99,
                    background: done?G.ok:active?G.ink:'transparent',
                    border:`1.5px solid ${done?G.ok:active?G.ink:G.borderStrong}`,
                    color: (done||active)?'#fff':G.mute,
                    display:'inline-flex',alignItems:'center',justifyContent:'center',
                    fontSize:11,fontWeight:700,
                  }}>
                    {done ? <I name="check" size={12}/> : n}
                  </span>
                  <span style={{fontSize:12.5,fontWeight: active?700:500, color: active?G.ink:G.ink2}}>{l}</span>
                </div>
                {i<labels.length-1 && <span style={{flex:1,maxWidth:48,height:1,background:done?G.ok:G.border}}/>}
              </React.Fragment>
            );
          })}
        </div>
        <Btn variant="ghost" size="sm">Save & exit</Btn>
      </header>

      <div style={{flex:1,overflow:'auto',padding:'40px 0',display:'flex',justifyContent:'center'}}>
        <div style={{width:'min(720px, 90%)'}}>
          <div style={{fontFamily:G.mono,fontSize:11,color:G.brand,letterSpacing:'.1em',marginBottom:8}}>STEP {step} / {total}</div>
          <h1 style={{fontSize:30,fontWeight:800,letterSpacing:'-0.025em',margin:'0 0 8px'}}>{title}</h1>
          <p style={{color:G.ink2,fontSize:14,margin:0,maxWidth:560}}>{sub}</p>
          <div style={{marginTop:28}}>{children}</div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:32,paddingTop:20,borderTop:`1px solid ${G.border}`}}>
            <Btn variant="ghost">← Back</Btn>
            <div style={{display:'flex',gap:8}}>
              <Btn variant="outline">Skip for now</Btn>
              <Btn variant="primary" iconRight={<I name="arrow"/>}>{primaryLabel}</Btn>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function CompanySetup1() {
  return (
    <OnboardStep step={1} title="Tell us about your company" sub="We auto-fill from GST/MCA records so you don't have to type the boring bits.">
      <div style={{display:'grid',gap:16}}>
        <div style={{
          padding:'14px 16px',borderRadius:10,background:G.okSoft,border:`1px solid oklch(0.85 0.07 155)`,
          display:'flex',gap:12,alignItems:'center',
        }}>
          <I name="verified" size={20} color={G.ok}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:13.5}}>We found your company</div>
            <div style={{fontSize:12,color:G.ink2}}>Matched on PAN <span className="mono" style={{fontFamily:G.mono}}>AABCM5783N</span> · GSTIN <span className="mono" style={{fontFamily:G.mono}}>27AABCM5783N1Z2</span></div>
          </div>
          <Pill tone="ok" dot>Verified</Pill>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Field label="Legal entity" required><Input value="Mahindra Logistics Limited"/></Field>
          <Field label="Display name"><Input value="Mahindra Logistics"/></Field>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:12}}>
          <Field label="Industry" required>
            <Select value="Third-party logistics (3PL)" options={['3PL','4PL','Manufacturer SCM','Freight forwarding']}/>
          </Field>
          <Field label="Sub-sector">
            <Select value="Contract logistics + transport"/>
          </Field>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
          <Field label="Company size"><Select value="5,000 – 10,000"/></Field>
          <Field label="HQ location"><Input value="Mumbai, MH" prefix={<I name="loc" size={14}/>}/></Field>
          <Field label="Hiring locations" hint="multi">
            <div style={{
              display:'flex',alignItems:'center',gap:6,minHeight:38,
              border:`1px solid ${G.border}`,borderRadius:8,padding:'4px 8px',background:'#fff',flexWrap:'wrap'
            }}>
              {['Bhiwandi','Chennai','Pune','+8'].map(c=>(
                <Pill key={c} tone="neutral">{c} <I name="x" size={10}/></Pill>
              ))}
            </div>
          </Field>
        </div>
        <Field label="One-line pitch" hint="shown on candidate-facing job pages">
          <Input value="India's largest integrated logistics partner — moving ops talent across 1,200+ sites."/>
        </Field>
        <Field label="Company website">
          <Input value="mahindralogistics.com" prefix={<I name="link" size={14}/>}/>
        </Field>
      </div>
    </OnboardStep>
  );
}

function CompanySetup2() {
  const fns = [
    {id:'warehouse',label:'Warehousing & DC ops',icon:'building',sel:true},
    {id:'transport',label:'Transport & fleet',icon:'truck',sel:true},
    {id:'ff',label:'Freight forwarding',icon:'globe'},
    {id:'scm',label:'Supply chain / S&OP',icon:'chart',sel:true},
    {id:'last',label:'Last mile / hub ops',icon:'loc'},
    {id:'proc',label:'Procurement & sourcing',icon:'briefcase'},
    {id:'cs',label:'Customer ops / control tower',icon:'inbox'},
    {id:'eng',label:'Engineering & automation',icon:'gear'},
  ];
  return (
    <OnboardStep step={2} title="What kind of roles will you hire?" sub="We use this to rank you in candidate feeds and pre-tag your dashboard.">
      <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:10}}>
        {fns.map(f=>(
          <div key={f.id} style={{
            padding:'14px 12px',borderRadius:10,
            border:`1.5px solid ${f.sel?G.ink:G.border}`,
            background:f.sel?'#fff':'#fff',
            position:'relative',cursor:'pointer',
          }}>
            <div style={{
              width:30,height:30,borderRadius:8,
              background:f.sel?G.ink:G.cardAlt,
              color:f.sel?'#fff':G.ink2,
              display:'flex',alignItems:'center',justifyContent:'center',
              marginBottom:8,
            }}><I name={f.icon} size={16}/></div>
            <div style={{fontWeight:600,fontSize:12.5,letterSpacing:'-0.005em',lineHeight:1.3}}>{f.label}</div>
            {f.sel && <I name="check" size={12} color="#fff"
              style={{position:'absolute',top:8,right:8,background:G.ink,borderRadius:99,padding:2}}/>}
          </div>
        ))}
      </div>

      <h3 style={{fontSize:14,fontWeight:700,margin:'28px 0 10px',letterSpacing:'-0.01em'}}>Typical hiring volume</h3>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {['1–10 / mo','10–25 / mo','25–50 / mo','50–100 / mo','100+ / mo'].map((v,i)=>(
          <span key={v} style={{
            padding:'8px 14px',borderRadius:99,
            border:`1.5px solid ${i===2?G.brand:G.border}`,
            background:i===2?G.brandSoft:'#fff',
            color:i===2?G.brandDeep:G.ink2,
            fontSize:12.5,fontWeight:600,cursor:'pointer'
          }}>{v}</span>
        ))}
      </div>

      <h3 style={{fontSize:14,fontWeight:700,margin:'28px 0 10px',letterSpacing:'-0.01em'}}>Seniority mix</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {[['Frontline ops','40%'],['Supervisor / TL','30%'],['Manager','22%'],['AGM+','8%']].map(([k,v])=>(
          <div key={k} style={{padding:'10px 12px',borderRadius:9,background:G.cardAlt,border:`1px solid ${G.border}`}}>
            <div style={{fontSize:18,fontWeight:800,letterSpacing:'-0.02em'}}>{v}</div>
            <div style={{fontSize:11.5,color:G.mute}}>{k}</div>
            <div style={{height:3,background:G.border,borderRadius:99,marginTop:6,overflow:'hidden'}}>
              <div style={{height:'100%',width:v,background:G.brand}}/>
            </div>
          </div>
        ))}
      </div>
    </OnboardStep>
  );
}

function CompanySetup3() {
  return (
    <OnboardStep step={3} title="Verify your company" sub="Verified employers get a badge, candidate trust, and 3× higher application rates.">
      <div style={{display:'grid',gap:10}}>
        {[
          {k:'GSTIN', v:'27AABCM5783N1Z2', state:'done', sub:'Pulled from GSTN portal · auto-verified'},
          {k:'PAN',   v:'AABCM5783N',     state:'done', sub:'Matched against MCA records'},
          {k:'Authorised signatory', v:'Priya Nair · priya@mahindralogistics.com', state:'pending', sub:'Email a verification link to authorised signatory'},
          {k:'Domain ownership', v:'mahindralogistics.com', state:'todo', sub:'Add a TXT record OR send from this domain'},
          {k:'GDP & CIN proof', v:'Optional · adds Premium Verified badge', state:'optional', sub:'Upload CIN certificate (PDF)'},
        ].map(row=>{
          const tone = row.state==='done'?'ok':row.state==='pending'?'warn':row.state==='todo'?'neutral':'info';
          const labels = {done:'Verified',pending:'In review',todo:'Action needed',optional:'Optional'};
          return (
            <div key={row.k} style={{
              display:'flex',alignItems:'center',gap:14,padding:'14px 16px',
              background:'#fff',border:`1px solid ${G.border}`,borderRadius:10,
            }}>
              <div style={{
                width:32,height:32,borderRadius:8,background:G.cardAlt,
                display:'flex',alignItems:'center',justifyContent:'center',color:G.ink,
              }}>
                <I name={row.state==='done'?'verified':row.state==='todo'?'upload':'building'} size={16}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontWeight:700,fontSize:13.5}}>{row.k}</span>
                  <Pill tone={tone} dot>{labels[row.state]}</Pill>
                </div>
                <div style={{fontSize:12,color:G.mute,marginTop:2}}>{row.v} · {row.sub}</div>
              </div>
              <Btn variant={row.state==='done'?'ghost':'outline'} size="sm">
                {row.state==='done'?'View':row.state==='todo'?'Add record':row.state==='optional'?'Upload':'Resend'}
              </Btn>
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop:20,padding:'14px 16px',borderRadius:10,background:G.ink900,color:'rgba(255,255,255,.85)',
        display:'flex',gap:14,alignItems:'center',
      }}>
        <div style={{width:36,height:36,borderRadius:8,background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <I name="verified" size={18} color={G.brand}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13.5,color:'#fff'}}>Verification takes ~2 hours during business hours</div>
          <div style={{fontSize:12,opacity:.7,marginTop:2}}>You can post jobs as <i>Pending verification</i> right now — they'll go live the moment you're approved.</div>
        </div>
        <Btn variant="brand" size="sm">Post anyway</Btn>
      </div>
    </OnboardStep>
  );
}

function CompanySetup4() {
  const team = [
    {n:'Priya Nair',e:'priya@mahindralogistics.com',r:'Owner · Admin',a:true,me:true},
    {n:'Rohit Sharma',e:'rohit.s@mahindralogistics.com',r:'Recruiter',a:true},
    {n:'invite@…',e:'tanvi.k@mahindralogistics.com',r:'Hiring manager',a:false},
  ];
  return (
    <OnboardStep step={4} total={4} title="Invite your hiring team" sub="Add recruiters, hiring managers, and approvers. You can change roles & seats anytime." primaryLabel="Finish setup →">
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:14}}>
        <Input placeholder="Add by email · separate with commas" prefix={<I name="mail" size={14}/>} style={{flex:1}}/>
        <Select value="Recruiter" style={{width:160}}/>
        <Btn variant="primary" icon={<I name="plus" size={14}/>}>Invite</Btn>
      </div>

      <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:10,overflow:'hidden'}}>
        {team.map((m,i)=>(
          <div key={m.e} style={{
            display:'flex',alignItems:'center',gap:12,padding:'12px 16px',
            borderTop:i?`1px solid ${G.border}`:'none',
          }}>
            <Avatar name={m.n} size={32}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontWeight:700,fontSize:13.5}}>{m.n}</span>
                {m.me && <Pill tone="brand">You</Pill>}
                {!m.a && <Pill tone="warn" dot>Invite sent</Pill>}
              </div>
              <div style={{fontSize:12,color:G.mute}}>{m.e}</div>
            </div>
            <Select value={m.r} style={{width:170}}/>
            <IconBtn name="more"/>
          </div>
        ))}
      </div>

      <h3 style={{fontSize:14,fontWeight:700,margin:'24px 0 10px'}}>Channels to wire up</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        {[
          {n:'WhatsApp Business',d:'Get applicant alerts in WhatsApp',sub:'Recommended',on:true,icon:'wa'},
          {n:'Slack',d:'Pipeline updates to #hiring-ops',sub:'Connected · workspace.slack',on:true,icon:'inbox'},
          {n:'Google Calendar',d:'Auto-schedule interview slots',sub:'Connect',on:false,icon:'calendar'},
        ].map(c=>(
          <div key={c.n} style={{padding:'14px',borderRadius:10,border:`1px solid ${G.border}`,background:'#fff'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
              <div style={{
                width:30,height:30,borderRadius:8,background:G.cardAlt,
                display:'flex',alignItems:'center',justifyContent:'center',
              }}><I name={c.icon} size={15}/></div>
              <Toggle on={c.on}/>
            </div>
            <div style={{fontWeight:700,fontSize:13.5,marginTop:10}}>{c.n}</div>
            <div style={{fontSize:11.5,color:G.mute,marginTop:2}}>{c.d}</div>
            <div style={{fontSize:11,color:c.on?G.ok:G.brand,marginTop:8,fontWeight:600}}>{c.sub}</div>
          </div>
        ))}
      </div>
    </OnboardStep>
  );
}

window.CompanySetup1 = CompanySetup1;
window.CompanySetup2 = CompanySetup2;
window.CompanySetup3 = CompanySetup3;
window.CompanySetup4 = CompanySetup4;
