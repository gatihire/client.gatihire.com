// Talent database — search, unlock paywall modal, unlocked profile detail

const DB_CANDIDATES = [
  {n:'Sunita Patil',init:'SP',role:'Warehouse Supervisor',co:'DHL Supply Chain',exp:'6y',loc:'Bhiwandi, MH',ctc:'5.4',ask:'7.0',notice:'30d',skills:['SAP EWM','MHE Cert','5S','Shift mgmt'],ver:true,score:96,active:'2d ago',edu:'B.Com · Mumbai Univ',unlocked:false,fresh:true},
  {n:'Karan Mehta',init:'KM',role:'Asst Manager · 3PL Ops',co:'Allcargo Logistics',exp:'9y',loc:'Mumbai, MH',ctc:'12.8',ask:'15.0',notice:'60d',skills:['SAP EWM','P&L','Audit','Lean'],ver:true,score:93,active:'1d ago',edu:'MBA Ops · NMIMS',unlocked:true,fresh:false},
  {n:'Anish Verma',init:'AV',role:'Logistics Coordinator',co:'Blue Dart',exp:'4y',loc:'Mumbai, MH',ctc:'4.6',ask:'6.2',notice:'15d',skills:['WMS','Tally','Hindi+Eng'],ver:false,score:84,active:'5d ago',edu:'BA · Mumbai',unlocked:false,fresh:false},
  {n:'Pooja Singh',init:'PS',role:'WH Supervisor',co:'Delhivery',exp:'5y',loc:'Bhiwandi, MH',ctc:'5.0',ask:'6.5',notice:'30d',skills:['SAP EWM','Audit','Lean'],ver:true,score:91,active:'today',edu:'B.Sc · Pune Univ',unlocked:false,fresh:true},
  {n:'Mohit Jain',init:'MJ',role:'Floor Supervisor',co:'DTDC',exp:'3y',loc:'Vasai, MH',ctc:'3.8',ask:'5.0',notice:'30d',skills:['WMS','MHE','Cycle counts'],ver:true,score:79,active:'1w ago',edu:'Diploma',unlocked:false,fresh:false},
  {n:'Suresh Iyer',init:'SI',role:'WH TL',co:'Mahindra Logistics',exp:'7y',loc:'Pune, MH',ctc:'6.2',ask:'8.5',notice:'90d',skills:['SAP EWM','Audit'],ver:true,score:71,active:'3w ago',edu:'B.Tech · COEP',unlocked:false,fresh:false},
];

function TalentDB() {
  return (
    <Shell active="database">
      <TopBar
        title="Talent database"
        sub="1,24,820 verified profiles · 36,420 actively looking · refreshed daily"
        actions={<>
          <Btn variant="outline" size="sm" icon={<I name="star" size={13}/>}>Saved searches</Btn>
          <Btn variant="brand" size="sm" icon={<I name="unlock" size={13}/>}>Buy credits</Btn>
        </>}
      />

      <div style={{flex:1,display:'grid',gridTemplateColumns:'260px 1fr',minHeight:0}}>
        {/* Filters */}
        <aside className="gh-scroll" style={{
          background:'#fff',borderRight:`1px solid ${G.border}`,padding:'18px 18px',
          overflow:'auto',display:'flex',flexDirection:'column',gap:18,
        }}>
          <div>
            <div style={{fontSize:11,color:G.mute,fontWeight:700,letterSpacing:'.08em',marginBottom:8}}>SEARCH</div>
            <Input placeholder="Boolean OK · SAP EWM AND 5y…" prefix={<I name="search" size={14}/>} size="sm"/>
          </div>
          <FilterGroup t="Function" items={[
            ['Warehousing & DC ops',true,3420],
            ['Transport & fleet',false,1820],
            ['Freight forwarding',false,940],
            ['Supply chain / S&OP',false,2210],
            ['Last-mile / hub ops',false,1180],
          ]}/>
          <FilterGroup t="Seniority" items={[
            ['Frontline',false,7820],
            ['Team lead / Supervisor',true,2410],
            ['Manager',false,1520],
            ['AGM+',false,310],
          ]}/>
          <FilterGroup t="Experience (yrs)">
            <div style={{padding:'4px 2px'}}>
              <div style={{height:5,borderRadius:99,background:G.cardAlt,position:'relative',marginBottom:8}}>
                <div style={{position:'absolute',left:'20%',right:'30%',height:5,borderRadius:99,background:G.ink}}/>
                <span style={{position:'absolute',left:'18%',top:-4,width:13,height:13,borderRadius:99,background:'#fff',border:`2px solid ${G.ink}`}}/>
                <span style={{position:'absolute',right:'28%',top:-4,width:13,height:13,borderRadius:99,background:'#fff',border:`2px solid ${G.ink}`}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11.5,color:G.ink2}}>
                <span><b>3y</b></span><span>—</span><span><b>7y</b></span>
              </div>
            </div>
          </FilterGroup>
          <FilterGroup t="Location" items={[
            ['Mumbai metro',true,1820],
            ['Pune',false,920],
            ['Within 30km of Bhiwandi',true,612],
            ['Willing to relocate',false,4200],
          ]}/>
          <FilterGroup t="Skills (must)" items={[
            ['SAP EWM',true,1240],
            ['Manhattan WMS',false,420],
            ['MHE certification',false,820],
            ['Shift management',false,2210],
          ]}/>
          <FilterGroup t="Notice period">
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['Immediate','≤15d','≤30d','≤60d','≤90d'].map((v,i)=>(
                <Pill key={v} tone={i<3?'brand':'neutral'} dot={i<3}>{v}</Pill>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup t="Other">
            <div style={{display:'grid',gap:8}}>
              <Checkbox checked label="Verified by Aadhaar / PAN"/>
              <Checkbox checked label="Active in last 30 days"/>
              <Checkbox label="Female candidates · diversity"/>
              <Checkbox label="Differently-abled friendly"/>
            </div>
          </FilterGroup>
        </aside>

        {/* Results */}
        <div className="gh-scroll" style={{overflow:'auto',padding:'18px 24px'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,flexWrap:'wrap'}}>
            <Pill tone="brand" dot>Warehousing</Pill>
            <Pill tone="brand" dot>TL / Supervisor</Pill>
            <Pill tone="brand" dot>3–7 yrs</Pill>
            <Pill tone="brand" dot>Within 30km · Bhiwandi</Pill>
            <Pill tone="brand" dot>Active 30d</Pill>
            <span style={{marginLeft:'auto',fontSize:11.5,color:G.mute}}>
              <b style={{color:G.ink}}>612 matches</b> · 42 active today
            </span>
            <Btn variant="outline" size="sm" icon={<I name="star" size={13}/>}>Save search</Btn>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,padding:'10px 14px',borderRadius:10,background:G.cardAlt,border:`1px solid ${G.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{
                width:32,height:32,borderRadius:8,background:G.brand,color:'#fff',
                display:'flex',alignItems:'center',justifyContent:'center',
              }}><I name="unlock" size={16}/></span>
              <div>
                <div style={{fontWeight:700,fontSize:13}}>42 credits left · enough for 42 unlocks</div>
                <div style={{fontSize:11.5,color:G.mute}}>Resets 1 Jun · Growth plan</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <Btn variant="ghost" size="sm">View plan</Btn>
              <Btn variant="primary" size="sm">Top up · 100 for ₹4,999</Btn>
            </div>
          </div>

          <div style={{display:'grid',gap:10}}>
            {DB_CANDIDATES.map(c => <DBRow key={c.n} c={c}/>)}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function FilterGroup({t,items,children}) {
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <span style={{fontSize:11.5,fontWeight:700,letterSpacing:'-0.005em'}}>{t}</span>
        {items && <span style={{fontSize:10.5,color:G.mute}}>collapse</span>}
      </div>
      {children}
      {items && (
        <div style={{display:'grid',gap:6}}>
          {items.map(([l,checked,n])=>(
            <label key={l} style={{display:'flex',alignItems:'center',gap:8,fontSize:12.5,color:G.ink2,cursor:'pointer'}}>
              <Checkbox checked={checked}/>
              <span style={{flex:1}}>{l}</span>
              <span style={{fontSize:10.5,color:G.mute,fontFamily:G.mono}}>{n.toLocaleString()}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function DBRow({c}) {
  const locked = !c.unlocked;
  const blur = locked ? {filter:'blur(4px)', userSelect:'none'} : {};
  return (
    <div style={{
      display:'grid',gridTemplateColumns:'auto 1.4fr 1fr 130px 100px 130px',gap:14,alignItems:'center',
      padding:'14px 16px',background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,
      position:'relative',
    }}>
      <div style={{position:'relative'}}>
        <Avatar name={c.unlocked?c.n:c.init} size={42}/>
        {locked && (
          <span style={{
            position:'absolute',right:-4,bottom:-4,width:18,height:18,borderRadius:99,
            background:G.ink,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',
            border:'2px solid #fff',
          }}><I name="lock" size={10}/></span>
        )}
      </div>
      <div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontWeight:700,fontSize:14,...blur}}>{c.unlocked?c.n:'Anish ●●●●●'}</span>
          {c.ver && <I name="verified" size={12} color={G.ok}/>}
          {c.fresh && <Pill tone="brand" dot>Active today</Pill>}
        </div>
        <div style={{fontSize:12,color:G.ink2,marginTop:2}}>
          {c.role} · {c.exp} at <span style={blur}>{c.unlocked?c.co:'••••••• Logistics'}</span>
        </div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:8}}>
          {c.skills.slice(0,4).map(s=>(<Pill key={s} tone="neutral">{s}</Pill>))}
        </div>
      </div>
      <div>
        <div style={{fontSize:11.5,color:G.mute}}>Location · Education</div>
        <div style={{fontSize:12.5,marginTop:2}}>{c.loc}</div>
        <div style={{fontSize:11.5,color:G.mute,marginTop:1,...blur}}>{c.unlocked?c.edu:'••• ••• ••••••'}</div>
      </div>
      <div>
        <div style={{fontSize:11.5,color:G.mute}}>Current · ask</div>
        <div style={{fontSize:13,fontWeight:700,fontFamily:G.mono,marginTop:2}}>₹{c.ctc}L → ₹{c.ask}L</div>
        <div style={{fontSize:11.5,color:G.mute,marginTop:1}}>Notice {c.notice}</div>
      </div>
      <div>
        <div style={{fontSize:11.5,color:G.mute}}>Match</div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginTop:2}}>
          <span style={{fontSize:18,fontWeight:800,color:c.score>=90?G.ok:G.ink}}>{c.score}</span>
          <div style={{flex:1,height:4,borderRadius:99,background:G.cardAlt,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${c.score}%`,background:c.score>=90?G.ok:G.brand}}/>
          </div>
        </div>
        <div style={{fontSize:10.5,color:G.mute,marginTop:3}}>Active {c.active}</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {c.unlocked ? (
          <>
            <Btn variant="primary" size="sm" full>View profile</Btn>
            <Btn variant="outline" size="sm" full icon={<I name="wa" size={13}/>}>Reach out</Btn>
          </>
        ) : (
          <>
            <Btn variant="brand" size="sm" full icon={<I name="unlock" size={13}/>}>Unlock · 1 credit</Btn>
            <Btn variant="ghost" size="sm" full>Add to list</Btn>
          </>
        )}
      </div>
    </div>
  );
}

// Unlock confirmation modal (overlaid on talent DB)
function TalentDBUnlockModal() {
  return (
    <div style={{position:'relative',width:'100%',height:'100%'}}>
      <TalentDB/>
      <div style={{
        position:'absolute',inset:0,background:'rgba(20,18,15,0.45)',
        display:'flex',alignItems:'center',justifyContent:'center',padding:24,
        backdropFilter:'blur(2px)',
      }}>
        <div style={{
          width:'min(540px, 90%)',background:'#fff',borderRadius:14,padding:'24px 28px',
          boxShadow:'0 30px 80px -10px rgba(0,0,0,.3)',
        }}>
          <div style={{display:'flex',alignItems:'center',gap:14,paddingBottom:16,borderBottom:`1px solid ${G.border}`}}>
            <Avatar name="Sunita Patil" size={48} ring/>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontWeight:700,fontSize:16}}>Sunita Patil</span>
                <I name="verified" size={13} color={G.ok}/>
                <Pill tone="brand" dot>Active today</Pill>
              </div>
              <div style={{fontSize:12.5,color:G.ink2,marginTop:2}}>Warehouse Supervisor · 6y at DHL Supply Chain · Bhiwandi</div>
            </div>
            <IconBtn name="x" size={28} iconSize={12}/>
          </div>

          <h3 style={{fontSize:17,fontWeight:700,margin:'16px 0 8px',letterSpacing:'-0.01em'}}>Unlock full profile</h3>
          <p style={{fontSize:13,color:G.ink2,margin:0,lineHeight:1.5}}>
            See verified contact, full work history, education, certifications, and message her on WhatsApp.
          </p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:16}}>
            {[
              ['Mobile (verified)','+91 98●●● ●●321'],
              ['Email (verified)','sun●●●●@gmail.com'],
              ['Resume','Sunita_P_Resume.pdf'],
              ['LinkedIn','linkedin.com/in/●●●●●'],
            ].map(([k,v])=>(
              <div key={k} style={{padding:'10px 12px',background:G.cardAlt,borderRadius:9,border:`1px solid ${G.border}`,display:'flex',alignItems:'center',gap:8}}>
                <I name="lock" size={13} color={G.mute}/>
                <div>
                  <div style={{fontSize:10.5,color:G.mute,fontWeight:600}}>{k}</div>
                  <div style={{fontSize:12,fontFamily:G.mono,color:G.ink2}}>{v}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop:18,padding:'12px 14px',background:G.ink900,color:'#fff',borderRadius:10,
            display:'flex',alignItems:'center',gap:12,
          }}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <Pill tone="brand" dot>1 credit</Pill>
                <span style={{fontWeight:700}}>Unlocks this profile</span>
              </div>
              <div style={{fontSize:11.5,opacity:.7,marginTop:4}}>You'll have <b>41 credits</b> left after this. Profile stays unlocked forever.</div>
            </div>
            <Btn variant="brand" iconRight={<I name="arrow" size={13}/>}>Unlock now</Btn>
          </div>

          <div style={{marginTop:14,display:'flex',gap:8,alignItems:'center',fontSize:11.5,color:G.mute}}>
            <I name="verified" size={13} color={G.ok}/>
            Verified by Aadhaar & PAN · GDPR-compliant · Sunita has opted in to recruiter contact.
          </div>
        </div>
      </div>
    </div>
  );
}

window.TalentDB = TalentDB;
window.TalentDBUnlockModal = TalentDBUnlockModal;
