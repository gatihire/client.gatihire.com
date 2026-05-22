// Applicants — Table view + Kanban pipeline

const APPLICANTS = [
  {id:'C-04821',n:'Sunita Patil',loc:'Bhiwandi · 12km',exp:'6y · 3PL',skills:['SAP EWM','MHE','Shift'],ctc:'₹5.4',notice:'30d',score:92,stage:'shortlist',new:false,src:'DB unlock',ver:true,note:'Strong shift mgmt'},
  {id:'C-04822',n:'Rajesh Kumar',loc:'Thane · 18km',exp:'4y · WH ops',skills:['WMS','Cycle counts'],ctc:'₹4.8',notice:'15d',score:88,stage:'screen',new:true,src:'Applied',ver:true,note:''},
  {id:'C-04823',n:'Anjali Deshmukh',loc:'Kalyan · 22km',exp:'5y · 4PL',skills:['SAP EWM','5S','Hindi+Eng'],ctc:'₹5.8',notice:'45d',score:90,stage:'interview',new:false,src:'Applied',ver:true,note:'R1 done · ★★★★'},
  {id:'C-04824',n:'Karan Mehta',loc:'Mumbai · 35km',exp:'9y · 3PL',skills:['SAP EWM','P&L','Audit'],ctc:'₹6.2',notice:'60d',score:95,stage:'offer',new:false,src:'DB unlock',ver:true,note:'Offered ₹6.2 LPA'},
  {id:'C-04825',n:'Mohit Jain',loc:'Vasai · 8km',exp:'3y · WH',skills:['WMS','MHE'],ctc:'₹4.2',notice:'30d',score:74,stage:'screen',new:true,src:'Referral',ver:false,note:''},
  {id:'C-04826',n:'Pooja Singh',loc:'Bhiwandi · 4km',exp:'5y · 3PL',skills:['SAP EWM','Audit','Lean'],ctc:'₹5.2',notice:'30d',score:86,stage:'shortlist',new:false,src:'Applied',ver:true,note:''},
  {id:'C-04827',n:'Ankit Yadav',loc:'Bhiwandi · 6km',exp:'4y · WH',skills:['WMS','Shift'],ctc:'₹4.6',notice:'15d',score:80,stage:'new',new:true,src:'Applied',ver:true,note:''},
  {id:'C-04828',n:'Suresh Iyer',loc:'Pune · 140km',exp:'7y · 3PL',skills:['SAP EWM','Audit'],ctc:'₹6.5',notice:'90d',score:69,stage:'new',new:true,src:'Applied',ver:true,note:'High notice, far'},
];

const STAGES = [
  {id:'new',label:'New applies',count:14,tint:'#e5d4c2'},
  {id:'screen',label:'Screening',count:22,tint:G.brand},
  {id:'shortlist',label:'Shortlisted',count:18,tint:G.info},
  {id:'interview',label:'Interview',count:9,tint:'#a78bfa'},
  {id:'offer',label:'Offer',count:4,tint:G.ok},
  {id:'hired',label:'Hired',count:2,tint:G.ink},
];

function ApplicantsTable() {
  return (
    <Shell active="applicants">
      <TopBar
        title="Warehouse Supervisor — Bhiwandi DC"
        breadcrumb={['Jobs','Warehouse Supervisor','Applicants']}
        sub="86 candidates · 14 new · 7d to next interview"
        actions={<>
          <Btn variant="outline" size="sm" icon={<I name="download" size={13}/>}>Export</Btn>
          <Btn variant="primary" size="sm" icon={<I name="plus" size={13}/>}>Add candidate</Btn>
        </>}
      />

      {/* Stage funnel chips */}
      <div style={{display:'flex',gap:8,padding:'14px 24px 8px',borderBottom:`1px solid ${G.border}`,background:'#fff',alignItems:'center'}}>
        {STAGES.map((s,i)=>(
          <React.Fragment key={s.id}>
            <div style={{
              padding:'8px 12px',borderRadius:8,cursor:'pointer',
              background: i===2?G.cardAlt:'transparent',
              border:`1px solid ${i===2?G.borderStrong:'transparent'}`,
              display:'flex',alignItems:'center',gap:8,
            }}>
              <span style={{width:6,height:6,borderRadius:99,background:s.tint}}/>
              <span style={{fontSize:12.5,fontWeight:600}}>{s.label}</span>
              <span style={{fontSize:11,fontFamily:G.mono,color:G.mute}}>{s.count}</span>
            </div>
            {i<STAGES.length-1 && <span style={{color:G.faint,fontSize:11}}>›</span>}
          </React.Fragment>
        ))}
        <span style={{flex:1}}/>
        <div style={{display:'flex',background:G.cardAlt,borderRadius:8,padding:2,border:`1px solid ${G.border}`}}>
          <span style={{padding:'4px 10px',background:'#fff',borderRadius:6,fontSize:12,fontWeight:600,boxShadow:'0 1px 2px rgba(0,0,0,.05)'}}>Table</span>
          <span style={{padding:'4px 10px',fontSize:12,fontWeight:500,color:G.mute}}>Kanban</span>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{display:'flex',gap:8,padding:'12px 24px',borderBottom:`1px solid ${G.border}`,background:'#fff',alignItems:'center'}}>
        <div style={{
          display:'flex',alignItems:'center',gap:8,height:32,minWidth:240,
          border:`1px solid ${G.border}`,borderRadius:8,padding:'0 10px',background:G.cardAlt,color:G.mute,fontSize:12.5,flex:'0 1 320px'
        }}>
          <I name="search" size={13}/> Search by name, skill, location…
        </div>
        {[
          ['Sort: AI match',true],['Skills',false],['Location · 30km',true],['Notice ≤ 30d',true],['Verified',false],['+ Filter',false],
        ].map(([t,active],i)=>(
          <Pill key={i} tone={active?'brand':'neutral'} dot={active}>
            {t}
          </Pill>
        ))}
        <span style={{flex:1}}/>
        <span style={{fontSize:11.5,color:G.mute}}>Showing 8 of 86</span>
      </div>

      {/* Table */}
      <div className="gh-scroll" style={{flex:1,overflow:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12.5}}>
          <thead>
            <tr style={{background:G.paper}}>
              {['','Candidate','Match','Experience','Skills','CTC ask','Notice','Source','Stage',''].map((h,i)=>(
                <th key={i} style={{
                  textAlign:'left',padding:'10px 12px',
                  fontSize:10.5,letterSpacing:'.06em',color:G.mute,fontWeight:700,
                  borderBottom:`1px solid ${G.border}`,
                }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {APPLICANTS.map((c,i)=>(
              <tr key={c.id} style={{borderBottom:`1px solid ${G.border}`,background:i===0?G.cardAlt:(i%2?'#fff':G.paper)}}>
                <td style={{padding:'12px 12px',width:24}}><Checkbox checked={i===0}/></td>
                <td style={{padding:'12px 12px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <Avatar name={c.n} size={32} ring={i===0}/>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontWeight:700,fontSize:13}}>{c.n}</span>
                        {c.ver && <I name="verified" size={11} color={G.ok}/>}
                        {c.new && <Pill tone="brand">New</Pill>}
                      </div>
                      <div style={{fontSize:11,color:G.mute,marginTop:1}}><span className="mono" style={{fontFamily:G.mono}}>{c.id}</span> · {c.loc}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'12px 12px',width:90}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontWeight:800,letterSpacing:'-0.01em',color:c.score>=90?G.ok:c.score>=80?G.ink:G.mute}}>{c.score}</span>
                    <div style={{width:36,height:5,borderRadius:99,background:G.cardAlt,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${c.score}%`,background:c.score>=90?G.ok:c.score>=80?G.brand:G.faint}}/>
                    </div>
                  </div>
                </td>
                <td style={{padding:'12px 12px',color:G.ink2}}>{c.exp}</td>
                <td style={{padding:'12px 12px'}}>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                    {c.skills.slice(0,2).map(s=>(<Pill key={s} tone="neutral">{s}</Pill>))}
                    {c.skills.length>2 && <Pill tone="neutral">+{c.skills.length-2}</Pill>}
                  </div>
                </td>
                <td style={{padding:'12px 12px',fontFamily:G.mono,fontSize:12}}>{c.ctc}L</td>
                <td style={{padding:'12px 12px'}}>
                  <span style={{
                    color: c.notice==='90d'?G.danger:c.notice==='60d'?G.warn:G.ink2,
                    fontWeight:600,
                  }}>{c.notice}</span>
                </td>
                <td style={{padding:'12px 12px',color:G.ink2}}>{c.src}</td>
                <td style={{padding:'12px 12px'}}>
                  <Pill tone={
                    c.stage==='offer'?'ok':c.stage==='interview'?'info':c.stage==='shortlist'?'brand':'neutral'
                  } dot>{STAGES.find(s=>s.id===c.stage).label}</Pill>
                </td>
                <td style={{padding:'12px 12px',width:120,textAlign:'right'}}>
                  <div style={{display:'inline-flex',gap:4}}>
                    <IconBtn name="wa" size={28} iconSize={14}/>
                    <IconBtn name="mail" size={28} iconSize={14}/>
                    <IconBtn name="arrow" size={28} iconSize={14}/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk action bar (selected = 1 row) */}
      <div style={{
        position:'absolute',bottom:24,left:'50%',transform:'translateX(-50%)',
        background:G.ink900,color:'#fff',borderRadius:12,padding:'10px 14px',
        display:'flex',alignItems:'center',gap:12,boxShadow:'0 16px 40px -10px rgba(0,0,0,.35)',
      }}>
        <Pill tone="brand">1 selected</Pill>
        <Btn variant="ghost" size="sm" style={{color:'#fff'}}>Move to →</Btn>
        <Btn variant="ghost" size="sm" style={{color:'#fff'}}>Assign</Btn>
        <Btn variant="ghost" size="sm" style={{color:'#fff'}}>Message</Btn>
        <Btn variant="brand" size="sm">Schedule interview</Btn>
      </div>
    </Shell>
  );
}

function ApplicantsKanban() {
  // 8 candidates spread by stage; "new" stage rows
  const byStage = STAGES.map(s => ({
    ...s,
    list: APPLICANTS.filter(c => c.stage===s.id),
  }));
  return (
    <Shell active="applicants">
      <TopBar
        title="Warehouse Supervisor — Pipeline"
        breadcrumb={['Jobs','Warehouse Supervisor','Pipeline']}
        sub="Drag candidates between stages · auto-emails handled per stage"
        actions={<>
          <Btn variant="outline" size="sm">Stage rules</Btn>
          <Btn variant="primary" size="sm" icon={<I name="plus" size={13}/>}>Add candidate</Btn>
        </>}
      />
      <div style={{
        flex:1,padding:'18px 24px',display:'grid',gridTemplateColumns:`repeat(${STAGES.length},minmax(220px,1fr))`,gap:12,
        overflow:'auto',background:G.paper,
      }} className="gh-scroll">
        {byStage.map((s,si)=>(
          <div key={s.id} style={{display:'flex',flexDirection:'column',gap:8,minWidth:0}}>
            <div style={{
              display:'flex',alignItems:'center',gap:8,padding:'8px 10px',
              background:'#fff',border:`1px solid ${G.border}`,borderRadius:9,
            }}>
              <span style={{width:8,height:8,borderRadius:99,background:s.tint}}/>
              <span style={{fontSize:12.5,fontWeight:700,flex:1}}>{s.label}</span>
              <span style={{fontSize:11,fontFamily:G.mono,color:G.mute}}>{s.count}</span>
              <I name="plus" size={13} color={G.mute}/>
            </div>
            {/* Synthesize 2-4 cards per stage by recycling */}
            {(() => {
              const pool = APPLICANTS.filter(c => c.stage===s.id);
              const padded = pool.length ? pool : [APPLICANTS[(si*2)%APPLICANTS.length]];
              const final = [...padded];
              while (final.length < (si===0?3:si===1?3:si===2?3:si===3?2:si===4?2:1)) {
                final.push(APPLICANTS[(final.length*3+si)%APPLICANTS.length]);
              }
              return final.map((c,i)=>(
                <KanbanCard key={i} c={c} stage={s} dragging={si===2 && i===1}/>
              ));
            })()}
            <div style={{
              padding:'10px 12px',border:`1.5px dashed ${G.border}`,borderRadius:9,
              fontSize:11.5,color:G.mute,textAlign:'center',
            }}>+ Add card</div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function KanbanCard({c,stage,dragging}) {
  return (
    <div style={{
      background:'#fff',border:`1px solid ${dragging?G.brand:G.border}`,borderRadius:10,
      padding:10,boxShadow: dragging?'0 12px 30px -10px rgba(0,0,0,.2), 0 0 0 3px '+G.brandSoft:'0 1px 0 rgba(0,0,0,.02)',
      cursor:'grab',transform:dragging?'rotate(-1.5deg) scale(1.02)':'none',
    }}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
        <Avatar name={c.n} size={26}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <span style={{fontSize:12.5,fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.n}</span>
            {c.ver && <I name="verified" size={10} color={G.ok}/>}
          </div>
          <div style={{fontSize:10.5,color:G.mute,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.exp} · {c.loc.split(' · ')[0]}</div>
        </div>
        <span style={{fontSize:11,fontWeight:800,color:c.score>=90?G.ok:G.ink}}>{c.score}</span>
      </div>
      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:8}}>
        {c.skills.slice(0,2).map(s=>(<Pill key={s} tone="neutral">{s}</Pill>))}
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:10.5,color:G.mute}}>
        <span className="mono" style={{fontFamily:G.mono}}>{c.ctc}L · {c.notice}</span>
        {c.note ? <Pill tone={stage.id==='offer'?'ok':'neutral'}>{c.note}</Pill> : <span>·</span>}
      </div>
    </div>
  );
}

window.ApplicantsTable = ApplicantsTable;
window.ApplicantsKanban = ApplicantsKanban;
