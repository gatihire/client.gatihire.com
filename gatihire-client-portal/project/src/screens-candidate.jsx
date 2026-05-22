// Candidate detail (post-unlock) + ATS-style drawer view

function CandidateDetail() {
  return (
    <Shell active="applicants">
      <TopBar
        title="Sunita Patil"
        breadcrumb={['Applicants','Warehouse Supervisor','Sunita Patil']}
        sub="Stage: Interview · Round 2 scheduled Thu 29 May, 11:00"
        actions={<>
          <Btn variant="ghost" size="sm" icon={<I name="x" size={13}/>}>Reject</Btn>
          <Btn variant="outline" size="sm" icon={<I name="calendar" size={13}/>}>Schedule</Btn>
          <Btn variant="primary" size="sm" iconRight={<I name="arrow" size={13}/>}>Move to Offer</Btn>
        </>}
      />

      <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 340px',minHeight:0,background:G.paper}}>
        <div className="gh-scroll" style={{overflow:'auto',padding:'20px 24px'}}>
          {/* Header card */}
          <div style={{background:'#fff',borderRadius:14,border:`1px solid ${G.border}`,padding:'22px 24px',display:'flex',gap:18,alignItems:'flex-start'}}>
            <Avatar name="Sunita Patil" size={64} ring/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                <h2 style={{fontSize:22,fontWeight:800,letterSpacing:'-0.025em',margin:0}}>Sunita Patil</h2>
                <I name="verified" size={15} color={G.ok}/>
                <Pill tone="ok" dot>Aadhaar verified</Pill>
                <Pill tone="brand" dot>Active today</Pill>
                <Pill tone="info">★ AI match 96</Pill>
              </div>
              <div style={{fontSize:13.5,color:G.ink2,marginTop:6}}>Warehouse Supervisor at DHL Supply Chain · 6 yrs · Bhiwandi, MH</div>
              <div style={{display:'flex',gap:14,marginTop:12,flexWrap:'wrap',fontSize:12.5,color:G.ink2}}>
                <span style={{display:'inline-flex',alignItems:'center',gap:6}}><I name="phone" size={13}/> +91 98321 45821</span>
                <span style={{display:'inline-flex',alignItems:'center',gap:6}}><I name="mail" size={13}/> sunita.patil@gmail.com</span>
                <span style={{display:'inline-flex',alignItems:'center',gap:6}}><I name="loc" size={13}/> Bhiwandi · 12km from DC</span>
                <span style={{display:'inline-flex',alignItems:'center',gap:6}}><I name="link" size={13}/> linkedin/sunitapatil</span>
              </div>
              <div style={{display:'flex',gap:8,marginTop:14}}>
                <Btn variant="primary" size="sm" icon={<I name="wa" size={13}/>}>WhatsApp</Btn>
                <Btn variant="outline" size="sm" icon={<I name="mail" size={13}/>}>Email</Btn>
                <Btn variant="outline" size="sm" icon={<I name="phone" size={13}/>}>Call</Btn>
                <Btn variant="ghost" size="sm" icon={<I name="download" size={13}/>}>Resume</Btn>
              </div>
            </div>
            <div style={{
              padding:'12px 14px',borderRadius:10,background:G.cardAlt,border:`1px solid ${G.border}`,
              minWidth:160,
            }}>
              <div style={{fontSize:10.5,color:G.mute,fontWeight:700,letterSpacing:'.06em'}}>EXPECTATIONS</div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:12.5}}>
                <span style={{color:G.mute}}>Current</span>
                <span style={{fontFamily:G.mono,fontWeight:700}}>₹5.4 LPA</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontSize:12.5}}>
                <span style={{color:G.mute}}>Expected</span>
                <span style={{fontFamily:G.mono,fontWeight:700,color:G.brand}}>₹7.0 LPA</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontSize:12.5}}>
                <span style={{color:G.mute}}>Notice</span>
                <span style={{fontFamily:G.mono,fontWeight:700}}>30 days</span>
              </div>
            </div>
          </div>

          {/* Stage timeline */}
          <div style={{marginTop:14,background:'#fff',borderRadius:14,border:`1px solid ${G.border}`,padding:'16px 20px'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {[
                ['New',true],['Screen',true],['Shortlist',true],['Interview',true,'current'],['Offer',false],['Hired',false],
              ].map(([l,done,cur],i,arr)=>(
                <React.Fragment key={l}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,minWidth:64}}>
                    <span style={{
                      width:24,height:24,borderRadius:99,
                      background: cur?G.brand:done?G.ok:'transparent',
                      border:`2px solid ${cur?G.brand:done?G.ok:G.borderStrong}`,
                      color:'#fff',display:'inline-flex',alignItems:'center',justifyContent:'center',
                      fontSize:11,fontWeight:800,
                    }}>{done&&!cur?<I name="check" size={11}/>:cur?'•':''}</span>
                    <span style={{fontSize:11.5,fontWeight:cur?700:500,color:cur?G.ink:done?G.ink2:G.mute}}>{l}</span>
                  </div>
                  {i<arr.length-1 && <span style={{flex:1,height:2,background: done?G.ok:G.border,borderRadius:99}}/>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:4,margin:'18px 0 0',borderBottom:`1px solid ${G.border}`}}>
            {['Profile','Resume','Activity','Notes & feedback','Documents'].map((t,i)=>(
              <span key={t} style={{
                padding:'10px 14px',fontSize:13,fontWeight:i===0?700:500,
                color:i===0?G.ink:G.mute,
                borderBottom:`2px solid ${i===0?G.ink:'transparent'}`,marginBottom:-1,
              }}>{t}{i===2&&<span style={{
                marginLeft:6,padding:'1px 6px',borderRadius:99,background:G.cardAlt,color:G.ink2,fontSize:11
              }}>8</span>}</span>
            ))}
          </div>

          {/* Two-col content */}
          <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:14,marginTop:18}}>
            <div style={{display:'grid',gap:14}}>
              {/* AI match summary */}
              <div style={{background:'#fff',borderRadius:12,border:`1px solid ${G.border}`,padding:18}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontFamily:G.mono,fontSize:10.5,color:G.brand,letterSpacing:'.08em',fontWeight:700}}>AI MATCH ANALYSIS</span>
                  <Pill tone="ok" dot>96 · Excellent fit</Pill>
                </div>
                <p style={{fontSize:13.5,lineHeight:1.55,margin:'10px 0 0',color:G.ink2}}>
                  6 years running a 280K sqft DC at DHL — directly mirrors your Bhiwandi role. SAP EWM hands-on confirmed in last 3 stints. Lives 12 km from the site, 30-day notice, and her ask (₹7.0L) is within your band.
                </p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:14}}>
                  {[['Skills overlap','96%',G.ok],['Location fit','strong',G.ok],['Comp gap','+₹1L stretch',G.warn]].map(([k,v,c])=>(
                    <div key={k} style={{padding:'10px 12px',background:G.cardAlt,borderRadius:9}}>
                      <div style={{fontSize:10.5,color:G.mute,fontWeight:700}}>{k.toUpperCase()}</div>
                      <div style={{fontSize:14,fontWeight:700,marginTop:4,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div style={{background:'#fff',borderRadius:12,border:`1px solid ${G.border}`,padding:18}}>
                <h3 style={{fontSize:14,fontWeight:700,margin:'0 0 14px'}}>Experience</h3>
                {[
                  {c:'DHL Supply Chain',r:'Warehouse Supervisor',d:'Jan 2022 — Present · 2y 5m',n:'Bhiwandi DC · 280K sqft · 60 associates across 2 shifts. SAP EWM. Held inbound SLA at 98% across 8 quarters.',cur:true},
                  {c:'Allcargo Logistics',r:'Asst Supervisor',d:'Jul 2019 — Dec 2021 · 2y 5m',n:'JNPT-feeder DC. Cycle counts, audit prep, MHE fleet ownership.'},
                  {c:'Future Supply Chain',r:'WH Executive',d:'Apr 2018 — Jun 2019 · 1y 2m',n:'Outbound dispatch + courier liaison'},
                ].map((e,i)=>(
                  <div key={i} style={{display:'flex',gap:14,padding:'12px 0',borderTop:i?`1px solid ${G.border}`:'none'}}>
                    <div style={{
                      width:40,height:40,borderRadius:8,background:G.cardAlt,
                      display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,
                      fontSize:11,color:G.ink2,flex:'0 0 auto',
                    }}>{e.c.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontWeight:700,fontSize:13.5}}>{e.r}</span>
                        {e.cur && <Pill tone="brand">Current</Pill>}
                      </div>
                      <div style={{fontSize:12.5,color:G.ink2,marginTop:2}}>{e.c} · {e.d}</div>
                      <div style={{fontSize:12.5,color:G.ink2,marginTop:6,lineHeight:1.5}}>{e.n}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills + Edu side by side */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div style={{background:'#fff',borderRadius:12,border:`1px solid ${G.border}`,padding:18}}>
                  <h3 style={{fontSize:14,fontWeight:700,margin:'0 0 12px'}}>Skills</h3>
                  {[['SAP EWM',5],['Warehouse ops',6],['MHE / Forklift','cert'],['Inbound SLA',5],['Audit & 5S',4],['Hindi + English',6]].map(([s,y])=>(
                    <div key={s} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0'}}>
                      <span style={{flex:1,fontSize:12.5}}>{s}</span>
                      <span style={{fontSize:11,color:G.mute,fontFamily:G.mono}}>{typeof y==='number'?`${y}y`:y}</span>
                      <div style={{width:80,height:5,borderRadius:99,background:G.cardAlt,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${typeof y==='number'?y/6*100:100}%`,background:G.ink}}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{background:'#fff',borderRadius:12,border:`1px solid ${G.border}`,padding:18}}>
                  <h3 style={{fontSize:14,fontWeight:700,margin:'0 0 12px'}}>Education & certs</h3>
                  <div style={{padding:'10px 0'}}>
                    <div style={{fontSize:13,fontWeight:600}}>B.Com</div>
                    <div style={{fontSize:11.5,color:G.mute}}>Mumbai University · 2014–2017</div>
                  </div>
                  <div style={{padding:'10px 0',borderTop:`1px solid ${G.border}`}}>
                    <div style={{fontSize:13,fontWeight:600}}>Forklift operator certification</div>
                    <div style={{fontSize:11.5,color:G.mute}}>MSDC · 2020 · valid till 2027</div>
                  </div>
                  <div style={{padding:'10px 0',borderTop:`1px solid ${G.border}`}}>
                    <div style={{fontSize:13,fontWeight:600}}>SAP EWM functional</div>
                    <div style={{fontSize:11.5,color:G.mute}}>DHL internal · 2022</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column · interviews + notes */}
            <div style={{display:'grid',gap:14,alignContent:'flex-start'}}>
              <div style={{background:'#fff',borderRadius:12,border:`1px solid ${G.border}`,padding:18}}>
                <h3 style={{fontSize:14,fontWeight:700,margin:'0 0 12px'}}>Interviews</h3>
                <div style={{padding:'10px 12px',borderRadius:9,background:G.brandSoft,border:`1px solid oklch(0.88 0.07 60)`}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <Pill tone="brand" dot>Upcoming · R2</Pill>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,marginTop:6}}>Thu 29 May · 11:00 – 11:45</div>
                  <div style={{fontSize:11.5,color:G.ink2,marginTop:2}}>In person · Bhiwandi DC · with DC Manager + Priya</div>
                  <div style={{display:'flex',gap:6,marginTop:10}}>
                    <Btn variant="outline" size="sm">Reschedule</Btn>
                    <Btn variant="primary" size="sm">Send reminder</Btn>
                  </div>
                </div>
                <div style={{padding:'12px 0',borderTop:`1px solid ${G.border}`,marginTop:12}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:12.5,fontWeight:600}}>R1 · Phone screen · 22 May</span>
                    <Pill tone="ok" dot>★ 4 / 5</Pill>
                  </div>
                  <div style={{fontSize:11.5,color:G.mute,marginTop:4,lineHeight:1.5}}>
                    Rohit: "Strong on SAP EWM. Honest about the gap on returns process. Move ahead."
                  </div>
                </div>
              </div>

              <div style={{background:'#fff',borderRadius:12,border:`1px solid ${G.border}`,padding:18}}>
                <h3 style={{fontSize:14,fontWeight:700,margin:'0 0 10px'}}>Notes & @mentions</h3>
                {[
                  {a:'Rohit',t:'Confirmed she can do rotational shifts. Comfort with night runs verified.',m:'1d'},
                  {a:'Priya',t:'Ask DC mgr to assess audit-prep depth in R2.',m:'1d'},
                  {a:'You',t:'Reference check pending · DHL HR responded ☑',m:'3h'},
                ].map((n,i)=>(
                  <div key={i} style={{display:'flex',gap:8,padding:'8px 0',borderTop:i?`1px solid ${G.border}`:'none'}}>
                    <Avatar name={n.a} size={24}/>
                    <div style={{flex:1,fontSize:12.5,lineHeight:1.5}}>
                      <b>{n.a}</b> <span style={{color:G.mute}}>· {n.m} ago</span>
                      <div>{n.t}</div>
                    </div>
                  </div>
                ))}
                <div style={{
                  marginTop:10,padding:'8px 10px',border:`1px solid ${G.border}`,borderRadius:9,
                  fontSize:12,color:G.mute,
                }}>Add a note · @mention a teammate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <aside className="gh-scroll" style={{
          background:'#fff',borderLeft:`1px solid ${G.border}`,padding:'18px 18px',overflow:'auto',
          display:'flex',flexDirection:'column',gap:14,
        }}>
          <div>
            <div style={{fontSize:10.5,color:G.mute,fontWeight:700,letterSpacing:'.08em'}}>NEXT BEST ACTION</div>
            <div style={{fontSize:13.5,fontWeight:700,marginTop:6,letterSpacing:'-0.005em'}}>Send offer template at ₹6.8 LPA</div>
            <div style={{fontSize:11.5,color:G.mute,marginTop:2}}>Predicted accept-rate: <b style={{color:G.ok}}>84%</b></div>
            <Btn variant="brand" size="sm" full style={{marginTop:10}}>Generate offer</Btn>
          </div>

          <div style={{borderTop:`1px solid ${G.border}`,paddingTop:14}}>
            <div style={{fontSize:11.5,color:G.mute,fontWeight:600,marginBottom:8}}>STATE</div>
            <div style={{display:'grid',gap:8,fontSize:12}}>
              {[
                ['Source','Talent DB unlock'],
                ['Recruiter','Rohit Sharma'],
                ['Hiring mgr','Aman Khurana'],
                ['Req','Warehouse Sup · Bhiwandi'],
                ['Applied','19 May 2026'],
                ['Days in stage','5'],
              ].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{color:G.mute}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{borderTop:`1px solid ${G.border}`,paddingTop:14}}>
            <div style={{fontSize:11.5,color:G.mute,fontWeight:600,marginBottom:8}}>TAGS</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              <Pill tone="brand">High intent</Pill>
              <Pill tone="ok">Bhiwandi local</Pill>
              <Pill tone="neutral">Female</Pill>
              <Pill tone="neutral">SAP EWM</Pill>
              <Pill tone="neutral">+ tag</Pill>
            </div>
          </div>

          <div style={{borderTop:`1px solid ${G.border}`,paddingTop:14}}>
            <div style={{fontSize:11.5,color:G.mute,fontWeight:600,marginBottom:8}}>RECENT ACTIVITY</div>
            {[
              ['Stage moved → Interview','Rohit · 1d'],
              ['R1 feedback added','Rohit · 1d'],
              ['Profile unlocked','You · 4d'],
              ['Applied to job','19 May'],
            ].map(([k,v])=>(
              <div key={k} style={{display:'flex',gap:8,padding:'6px 0',fontSize:12}}>
                <span style={{width:6,height:6,borderRadius:99,background:G.brand,marginTop:6,flex:'0 0 auto'}}/>
                <div style={{flex:1}}>
                  <div>{k}</div>
                  <div style={{fontSize:10.5,color:G.mute}}>{v}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Shell>
  );
}

window.CandidateDetail = CandidateDetail;
