// Dashboard — 2 variations (Direction A: overview cards, Direction B: dense ops cockpit)

function StatCard({label,value,delta,sub,sparkline,tone='neutral'}) {
  return (
    <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,padding:'14px 16px'}}>
      <div style={{fontSize:11.5,color:G.mute,fontWeight:600,letterSpacing:'-0.005em'}}>{label}</div>
      <div style={{display:'flex',alignItems:'baseline',gap:10,marginTop:6}}>
        <span style={{fontSize:26,fontWeight:800,letterSpacing:'-0.02em'}}>{value}</span>
        {delta && (
          <span style={{
            fontSize:11.5,fontWeight:700,padding:'1px 6px',borderRadius:5,
            background: tone==='down'?G.dangerSoft:G.okSoft,
            color: tone==='down'?G.danger:G.ok,
          }}>{delta}</span>
        )}
      </div>
      {sub && <div style={{fontSize:11.5,color:G.mute,marginTop:3}}>{sub}</div>}
      {sparkline && (
        <svg viewBox="0 0 120 30" style={{width:'100%',height:30,marginTop:8}}>
          <polyline points={sparkline} fill="none" stroke={G.brand} strokeWidth="1.5"/>
          <polyline points={`${sparkline} 120,30 0,30`} fill={G.brandSoft} opacity=".4" stroke="none"/>
        </svg>
      )}
    </div>
  );
}

function DashboardA() {
  return (
    <Shell active="dashboard">
      <TopBar title="Good morning, Priya" sub="Mon 26 May · 14 new applicants overnight" actions={
        <>
          <Btn variant="outline" icon={<I name="download" size={14}/>}>Export</Btn>
          <Btn variant="primary" icon={<I name="plus" size={14}/>}>Post a job</Btn>
        </>
      }/>
      <div className="gh-scroll" style={{flex:1,overflow:'auto',padding:'20px 24px'}}>
        {/* Verification banner */}
        <div style={{
          display:'flex',alignItems:'center',gap:14,padding:'12px 16px',
          background:G.ink900,color:'#fff',borderRadius:12,marginBottom:18,
        }}>
          <I name="verified" size={18} color={G.brand}/>
          <div style={{flex:1}}>
            <span style={{fontWeight:700}}>Domain verification pending</span>
            <span style={{opacity:.7,marginLeft:8,fontSize:12.5}}>· Add a TXT record to unlock the Verified Employer badge on all live jobs.</span>
          </div>
          <Btn variant="brand" size="sm">Finish in 30s</Btn>
          <IconBtn name="x" size={28} iconSize={12}/>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          <StatCard label="Active jobs" value="8" delta="+2" sub="6 verified · 2 draft" sparkline="0,20 10,18 20,22 30,15 40,17 50,12 60,14 70,8 80,10 90,5 100,7 110,4 120,3"/>
          <StatCard label="New applicants (7d)" value="142" delta="+38%" sub="vs last week" sparkline="0,25 10,22 20,18 30,20 40,15 50,10 60,12 70,8 80,11 90,6 100,9 110,3 120,5"/>
          <StatCard label="In pipeline" value="61" sub="14 in interview · 6 in offer" sparkline="0,15 10,18 20,14 30,17 40,12 50,15 60,9 70,11 80,8 90,10 100,5 110,8 120,6"/>
          <StatCard label="Time to hire" value="11d" delta="-3d" sub="median across closed roles" sparkline="0,5 10,8 20,7 30,12 40,9 50,14 60,11 70,16 80,13 90,18 100,15 110,20 120,17" tone="down"/>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:14,marginTop:14}}>
          <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,padding:'16px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div>
                <h3 style={{fontSize:14,fontWeight:700,margin:0}}>Open roles</h3>
                <div style={{fontSize:11.5,color:G.mute,marginTop:2}}>Sorted by stalled candidates</div>
              </div>
              <div style={{display:'flex',gap:6}}>
                <Pill tone="brand" dot>All sites</Pill>
                <Pill tone="neutral">Bhiwandi</Pill>
                <Pill tone="neutral">Pune</Pill>
                <Pill tone="neutral">+5</Pill>
              </div>
            </div>
            {[
              {t:'Warehouse Supervisor',l:'Bhiwandi DC · Full-time',new:24,total:86,pipe:[5,12,4,2,1],owner:'Rohit',days:3,stall:false},
              {t:'Manager — Last Mile Ops',l:'Pune Hub · Full-time',new:11,total:42,pipe:[3,5,3,1,0],owner:'Priya',days:7,stall:true},
              {t:'Customs Clearance Exec',l:'JNPT, Mumbai · Full-time',new:8,total:54,pipe:[2,4,2,0,0],owner:'Tanvi',days:5,stall:false},
              {t:'AGM — Supply Chain',l:'Chennai HQ · Confidential',new:2,total:18,pipe:[0,2,1,1,0],owner:'Priya',days:14,stall:true},
            ].map((r,i)=>(
              <div key={i} style={{
                display:'grid',gridTemplateColumns:'1.4fr 1fr 110px 100px 90px',gap:12,
                alignItems:'center',padding:'12px 0',borderTop:i?`1px solid ${G.border}`:'none',
              }}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontWeight:700,fontSize:13.5}}>{r.t}</span>
                    {r.stall && <Pill tone="warn" dot>stalled</Pill>}
                  </div>
                  <div style={{fontSize:11.5,color:G.mute,marginTop:2}}>{r.l}</div>
                </div>
                <div>
                  <div style={{fontSize:11,color:G.mute,marginBottom:5,display:'flex',justifyContent:'space-between'}}>
                    <span>Pipeline · {r.total} candidates</span><span>{r.new} new</span>
                  </div>
                  <div style={{display:'flex',gap:2,height:6,borderRadius:3,overflow:'hidden'}}>
                    {['#e5d4c2',G.brand,G.info,G.ok,G.ink].map((c,j)=>(
                      <div key={j} style={{background:c,flex:r.pipe[j]||0.05,opacity:r.pipe[j]?1:.15}}/>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <Avatar name={r.owner} size={22}/>
                  <span style={{fontSize:12}}>{r.owner}</span>
                </div>
                <div style={{fontSize:12,color:r.stall?G.danger:G.ink2,fontWeight:600}}>{r.days}d open</div>
                <Btn variant="outline" size="sm">View</Btn>
              </div>
            ))}
          </div>

          <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,padding:'16px'}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:'0 0 14px'}}>Today's tasks</h3>
            {[
              {p:'high',t:'Approve offer · Rajesh K.',sub:'Manager — Last Mile · ₹14.2 LPA'},
              {p:'mid', t:'Review 14 new applicants',sub:'Warehouse Supervisor · Bhiwandi'},
              {p:'mid', t:'Schedule round 2 · Anjali D.',sub:'Customs Clearance Exec'},
              {p:'low', t:'Renew premium credits',sub:'12 unlocks left · refills in 4d'},
            ].map((t,i)=>(
              <div key={i} style={{display:'flex',gap:10,padding:'10px 0',borderTop:i?`1px solid ${G.border}`:'none'}}>
                <span style={{
                  width:6,height:6,borderRadius:99,marginTop:7,flex:'0 0 auto',
                  background:t.p==='high'?G.danger:t.p==='mid'?G.brand:G.faint,
                }}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{t.t}</div>
                  <div style={{fontSize:11.5,color:G.mute}}>{t.sub}</div>
                </div>
                <I name="arrow" size={14} color={G.mute}/>
              </div>
            ))}

            <h3 style={{fontSize:14,fontWeight:700,margin:'18px 0 10px'}}>Talent database · suggested</h3>
            {[
              {n:'Sunita Patil',role:'Supervisor · Bhiwandi · 6y exp',u:false},
              {n:'Karan Mehta',role:'Asst Manager · 3PL · 9y exp',u:true},
              {n:'Anish Verma',role:'Logistics Coord · 4y exp',u:false},
            ].map((c,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderTop:i?`1px solid ${G.border}`:'none'}}>
                <Avatar name={c.n} size={28}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:600}}>{c.u?c.n:'•'.repeat(4)+' '+'•'.repeat(5)}</div>
                  <div style={{fontSize:11,color:G.mute}}>{c.role}</div>
                </div>
                <Btn variant={c.u?'soft':'brand'} size="sm">{c.u?'View':'Unlock'}</Btn>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginTop:14}}>
          <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,padding:'16px'}}>
            <h3 style={{fontSize:13,fontWeight:700,margin:'0 0 10px'}}>Funnel · last 30 days</h3>
            {[['Sourced',1240,1],['Applied',420,.34],['Shortlisted',182,.15],['Interview',61,.05],['Offer',24,.019],['Hired',16,.013]].map(([k,v,p])=>(
              <div key={k} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0'}}>
                <div style={{flex:1}}>
                  <div style={{height:6,borderRadius:3,background:G.cardAlt,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${p*100}%`,background:G.ink}}/>
                  </div>
                </div>
                <span style={{fontSize:12,minWidth:90}}>{k}</span>
                <span style={{fontSize:12,fontFamily:G.mono,minWidth:36,textAlign:'right',color:G.ink2}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,padding:'16px'}}>
            <h3 style={{fontSize:13,fontWeight:700,margin:'0 0 10px'}}>Top sources</h3>
            {[['Talent DB unlocks',38,G.brand],['Job board',32,G.ink],['Referral',18,G.info],['LinkedIn import',12,G.ok]].map(([k,v,c])=>(
              <div key={k} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0'}}>
                <span style={{width:8,height:8,borderRadius:2,background:c}}/>
                <span style={{flex:1,fontSize:12.5}}>{k}</span>
                <span style={{fontSize:12,color:G.mute}}>{v}%</span>
              </div>
            ))}
          </div>
          <div style={{background:G.ink900,color:'#fff',borderRadius:12,padding:'16px',position:'relative',overflow:'hidden'}}>
            <Pill tone="brand" dot>Credits</Pill>
            <div style={{fontSize:30,fontWeight:800,letterSpacing:'-0.02em',marginTop:10}}>42 <span style={{fontSize:14,opacity:.5,fontWeight:500}}>/ 100 unlocks</span></div>
            <div style={{height:6,borderRadius:3,background:'rgba(255,255,255,.1)',marginTop:8,overflow:'hidden'}}>
              <div style={{height:'100%',width:'42%',background:G.brand}}/>
            </div>
            <div style={{fontSize:11.5,opacity:.6,marginTop:8}}>Refills 1 Jun · Growth plan</div>
            <Btn variant="brand" size="sm" style={{marginTop:14}}>Top up · ₹4,999</Btn>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// Direction B: dense ops cockpit (dark sidebar + denser tables)
function DashboardB() {
  return (
    <Shell active="dashboard" dark>
      <TopBar title="Hiring cockpit" sub="Mahindra Logistics · 8 active reqs · 7-day view" breadcrumb={['Workspace','Cockpit']} actions={
        <>
          <Btn variant="outline" icon={<I name="filter" size={14}/>}>Filters</Btn>
          <Btn variant="brand" icon={<I name="plus" size={14}/>}>New req</Btn>
        </>
      }/>
      <div className="gh-scroll" style={{flex:1,overflow:'auto',padding:'18px 24px',display:'grid',gap:14}}>
        {/* Top strip */}
        <div style={{
          background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,
          padding:'16px 18px',display:'grid',gridTemplateColumns:'1.6fr repeat(5,1fr)',gap:18,alignItems:'center',
        }}>
          <div>
            <div style={{fontFamily:G.mono,fontSize:10.5,color:G.mute,letterSpacing:'.08em'}}>NORTH STAR · WEEK 21</div>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:'-0.025em',marginTop:6}}>On pace to close <span style={{color:G.brand}}>23 of 28</span> reqs this quarter</div>
            <div style={{display:'flex',gap:10,marginTop:8,alignItems:'center'}}>
              <div style={{flex:1,height:6,borderRadius:99,background:G.cardAlt,overflow:'hidden'}}>
                <div style={{height:'100%',width:'71%',background:`linear-gradient(90deg, ${G.ink}, ${G.brand})`}}/>
              </div>
              <span style={{fontSize:11.5,color:G.mute,fontWeight:600}}>71% of plan</span>
            </div>
          </div>
          {[['Applies/req',18,G.ok],['Shortlist %',24,G.ok],['Interview %',13,G.warn],['Offer accept',81,G.ok],['Drop-off d3',9,G.danger]].map(([k,v,c])=>(
            <div key={k} style={{borderLeft:`1px solid ${G.border}`,paddingLeft:14}}>
              <div style={{fontSize:11,color:G.mute,fontWeight:600}}>{k}</div>
              <div style={{fontSize:20,fontWeight:800,marginTop:4,letterSpacing:'-0.02em'}}>{v}{k.includes('%')||k.includes('off')?'%':''}</div>
              <div style={{height:3,borderRadius:99,background:G.cardAlt,marginTop:6,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.min(v*2,100)}%`,background:c}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Dense req table */}
        <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'12px 16px',borderBottom:`1px solid ${G.border}`}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:0,flex:1}}>All open requisitions</h3>
            <Pill tone="brand" dot>8 active</Pill>
            <Pill tone="neutral">3 draft</Pill>
            <Pill tone="warn" dot>2 stalled</Pill>
            <Btn variant="ghost" size="sm" iconRight={<I name="arrow" size={12}/>}>Open ATS</Btn>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'24px 1.6fr 1fr 100px 110px 100px 80px 90px 80px',
            padding:'8px 16px',background:G.cardAlt,fontSize:10.5,color:G.mute,letterSpacing:'.06em',fontWeight:700}}>
            <span/><span>ROLE</span><span>PIPELINE</span><span>NEW</span><span>STAGE</span><span>OWNER</span><span>SLA</span><span>BUDGET</span><span/>
          </div>
          {[
            {t:'Warehouse Supervisor · Bhiwandi DC',f:'WH ops',n:24,total:86,o:'Rohit',sla:'on',budget:'₹4.2L',pipe:[24,28,18,9,5,2]},
            {t:'Manager — Last Mile Ops · Pune',f:'Transport',n:11,total:42,o:'Priya',sla:'breach',budget:'₹14L',pipe:[8,14,10,5,3,2]},
            {t:'Customs Clearance Exec · JNPT',f:'Freight',n:8,total:54,o:'Tanvi',sla:'on',budget:'₹6L',pipe:[12,18,14,6,2,2]},
            {t:'AGM — Supply Chain · Chennai',f:'SCM',n:2,total:18,o:'Priya',sla:'breach',budget:'₹38L',pipe:[2,6,6,2,1,1]},
            {t:'Fleet Controller · Hyderabad',f:'Transport',n:9,total:31,o:'Rohit',sla:'on',budget:'₹8L',pipe:[5,10,9,4,2,1]},
            {t:'Sr. Demand Planner · Mumbai HQ',f:'SCM',n:6,total:22,o:'Anita',sla:'warn',budget:'₹18L',pipe:[3,7,6,3,2,1]},
          ].map((r,i)=>(
            <div key={i} style={{
              display:'grid',gridTemplateColumns:'24px 1.6fr 1fr 100px 110px 100px 80px 90px 80px',
              padding:'10px 16px',alignItems:'center',borderTop:`1px solid ${G.border}`,fontSize:12.5,
            }}>
              <I name="briefcase" size={14} color={G.mute}/>
              <div>
                <div style={{fontWeight:600}}>{r.t}</div>
                <div style={{fontSize:11,color:G.mute,marginTop:1}}>{r.f}</div>
              </div>
              <div style={{display:'flex',gap:2,height:18}}>
                {r.pipe.map((v,j)=>{
                  const tones = [G.faint,G.brand,G.info,'#a78bfa',G.ok,G.ink];
                  return <div key={j} title={`${v}`} style={{
                    flex:Math.max(v,1), background:tones[j],
                    fontSize:9.5,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',
                    fontWeight:700,
                  }}>{v}</div>;
                })}
              </div>
              <span style={{fontWeight:700}}>{r.n} <span style={{color:G.mute,fontWeight:500,fontSize:11}}>/ {r.total}</span></span>
              <Pill tone={r.sla==='breach'?'danger':r.sla==='warn'?'warn':'ok'} dot>{r.sla==='breach'?'Stalled':r.sla==='warn'?'Risky':'On track'}</Pill>
              <div style={{display:'flex',gap:6,alignItems:'center'}}><Avatar name={r.o} size={20}/><span style={{fontSize:12}}>{r.o}</span></div>
              <span className="mono" style={{fontFamily:G.mono,fontSize:11.5,color:G.ink2}}>{r.budget}</span>
              <span style={{fontSize:11,color:G.mute}}>—</span>
              <Btn variant="ghost" size="sm" iconRight={<I name="arrow" size={12}/>}>Open</Btn>
            </div>
          ))}
        </div>

        {/* Two side panels */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
          <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,padding:'16px'}}>
            <h3 style={{fontSize:13,fontWeight:700,margin:'0 0 12px'}}>Activity feed</h3>
            {[
              {a:'Rohit S.',t:'moved 4 candidates',j:'Warehouse Supervisor',w:'to Shortlist',m:'2m'},
              {a:'System',t:'auto-screened 18 applies',j:'Last Mile Ops',w:'· 6 qualified',m:'14m'},
              {a:'Tanvi K.',t:'sent offer to',j:'Anjali D.',w:'₹6.2 LPA · 30d',m:'1h'},
              {a:'You',t:'unlocked 3 profiles',j:'Talent DB',w:'· -3 credits',m:'3h'},
              {a:'Priya N.',t:'posted a new job',j:'Sr. Demand Planner',w:'goes live in 2h',m:'4h'},
            ].map((e,i)=>(
              <div key={i} style={{display:'flex',gap:10,padding:'8px 0',borderTop:i?`1px solid ${G.border}`:'none'}}>
                <Avatar name={e.a} size={24}/>
                <div style={{flex:1,fontSize:12.5,lineHeight:1.45}}>
                  <b>{e.a}</b> {e.t} <span style={{color:G.brandDeep,fontWeight:600}}>{e.j}</span> <span style={{color:G.mute}}>{e.w}</span>
                  <div style={{fontSize:11,color:G.mute,marginTop:1}}>{e.m} ago</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,padding:'16px'}}>
            <h3 style={{fontSize:13,fontWeight:700,margin:'0 0 12px'}}>Interviews today</h3>
            {[
              {t:'10:30',c:'Rajesh K.',r:'Manager — LM Ops · R2',mode:'In person · Pune',l:'Tanvi'},
              {t:'13:00',c:'Sunita Patil',r:'Warehouse Sup · R1',mode:'Video · Meet',l:'Rohit'},
              {t:'15:30',c:'Anish Verma',r:'Customs Clearance · R1',mode:'Phone',l:'Tanvi'},
              {t:'17:00',c:'Ananya G.',r:'AGM — SCM · Panel',mode:'Video · Meet',l:'Priya'},
            ].map((iv,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderTop:i?`1px solid ${G.border}`:'none'}}>
                <div style={{
                  width:38,textAlign:'center',fontFamily:G.mono,fontSize:12,fontWeight:700,color:G.brand,
                  background:G.brandSoft,borderRadius:6,padding:'4px 0',
                }}>{iv.t}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:600}}>{iv.c}</div>
                  <div style={{fontSize:11,color:G.mute}}>{iv.r} · {iv.mode}</div>
                </div>
                <Avatar name={iv.l} size={22}/>
              </div>
            ))}
          </div>

          <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,padding:'16px'}}>
            <h3 style={{fontSize:13,fontWeight:700,margin:'0 0 12px'}}>Saved searches · Talent DB</h3>
            {[
              {n:'Warehouse TL, 3-6y, NCR',c:412,fresh:18},
              {n:'Customs analyst, JNPT/NSCT',c:96,fresh:4},
              {n:'Last-mile manager, Tier 2',c:271,fresh:9},
              {n:'Demand planner, FMCG bg',c:138,fresh:6},
            ].map((s,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderTop:i?`1px solid ${G.border}`:'none'}}>
                <I name="search" size={14} color={G.mute}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:600}}>{s.n}</div>
                  <div style={{fontSize:11,color:G.mute}}>{s.c} matches · <b style={{color:G.brand}}>+{s.fresh} new</b></div>
                </div>
                <Btn variant="outline" size="sm">Run</Btn>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

window.DashboardA = DashboardA;
window.DashboardB = DashboardB;
