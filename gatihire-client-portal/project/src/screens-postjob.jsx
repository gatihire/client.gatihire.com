// Post a job — two variations
// A: guided full-form (single canvas, sectioned)
// B: AI-assisted side-by-side composer with live candidate preview

function PostJobA() {
  return (
    <Shell active="jobs">
      <TopBar
        title="New job · Warehouse Supervisor"
        breadcrumb={['Jobs','Drafts','New']}
        sub="Step 2 of 3 · Job details"
        actions={<>
          <Btn variant="ghost" size="sm">Save draft</Btn>
          <Btn variant="outline" size="sm">Preview</Btn>
          <Btn variant="primary" size="sm" iconRight={<I name="arrow" size={13}/>}>Continue</Btn>
        </>}
      />
      <div className="gh-scroll" style={{flex:1,overflow:'auto',padding:'20px 24px',display:'grid',gridTemplateColumns:'200px 1fr 280px',gap:20}}>
        {/* Left section nav */}
        <aside style={{position:'sticky',top:0}}>
          <div style={{fontSize:11,color:G.mute,fontWeight:700,letterSpacing:'.08em',marginBottom:10}}>SECTIONS</div>
          {[
            ['Basics','done'],['Role & responsibilities','active'],['Compensation','idle'],
            ['Screening questions','idle'],['Hiring team','idle'],['Visibility & boost','idle'],
          ].map(([t,s])=>(
            <div key={t} style={{
              display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:7,
              background: s==='active'?G.cardAlt:'transparent',
              color: s==='idle'?G.mute:G.ink,
              fontWeight: s==='active'?700:500, fontSize:13,
            }}>
              <span style={{
                width:18,height:18,borderRadius:99,
                background:s==='done'?G.ok:s==='active'?G.ink:G.cardAlt,
                color: s==='idle'?G.mute:'#fff',
                display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,
                border:s==='idle'?`1px solid ${G.borderStrong}`:'none',
              }}>{s==='done'?<I name="check" size={10}/>:s==='active'?'→':''}</span>
              {t}
            </div>
          ))}
        </aside>

        {/* Center form */}
        <div style={{display:'grid',gap:18}}>
          <FormSection title="Role & responsibilities" sub="Be specific — generic JDs cut applies by ~40%.">
            <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:12}}>
              <Field label="Job title" required>
                <Input value="Warehouse Supervisor" suffix={<Pill tone="ok" dot>Good</Pill>}/>
              </Field>
              <Field label="Function" required>
                <Select value="Warehousing & DC ops"/>
              </Field>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginTop:12}}>
              <Field label="Employment type" required><Select value="Full-time"/></Field>
              <Field label="Seniority"><Select value="Supervisor / Team lead"/></Field>
              <Field label="Experience required"><Input value="3 – 6 years" prefix={<I name="briefcase" size={14}/>}/></Field>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginTop:12}}>
              <Field label="Work location" required><Input value="Bhiwandi DC, MH" prefix={<I name="loc" size={14}/>}/></Field>
              <Field label="Shift pattern"><Select value="Rotational · 3 shifts"/></Field>
              <Field label="Notice period accepted"><Select value="≤ 30 days"/></Field>
            </div>

            <Field label="Job description" hint="3–5 short paragraphs work best" style={{marginTop:14}}>
              <div style={{border:`1px solid ${G.border}`,borderRadius:10,background:'#fff'}}>
                <div style={{display:'flex',gap:4,padding:'6px 8px',borderBottom:`1px solid ${G.border}`,alignItems:'center'}}>
                  {['B','I','U','•','1.','"'].map(c=>(
                    <span key={c} style={{padding:'3px 7px',borderRadius:5,fontSize:12,fontWeight:600,color:G.ink2}}>{c}</span>
                  ))}
                  <span style={{flex:1}}/>
                  <Pill tone="brand" dot>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/></svg>
                    Write with AI
                  </Pill>
                </div>
                <div style={{padding:'12px 14px',fontSize:13,lineHeight:1.55,color:G.ink2,minHeight:120}}>
                  <p style={{margin:'0 0 10px'}}>You'll lead a shift of 40–60 associates at our Bhiwandi DC, ensuring inbound, putaway and outbound SLAs are hit daily. You report into the DC Manager.</p>
                  <p style={{margin:'0 0 10px'}}>This role suits someone who has run a 200K+ sqft warehouse, knows WMS workflows hands-on (SAP EWM preferred), and is comfortable with peak-day surges.</p>
                  <p style={{margin:0,opacity:.5}}>Day-to-day: dock scheduling, slotting, cycle counts, audit prep…</p>
                </div>
              </div>
            </Field>

            <Field label="Must-have skills" hint="we'll auto-match against the talent DB" style={{marginTop:12}}>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',border:`1px solid ${G.border}`,borderRadius:8,padding:8,background:'#fff'}}>
                {['SAP EWM','WMS','5S / Kaizen','Inbound + Outbound','MHE certification','Shift management','Hindi + English'].map(s=>(
                  <Pill key={s} tone="neutral">{s} <I name="x" size={10}/></Pill>
                ))}
                <span style={{fontSize:12,color:G.mute,padding:'2px 6px'}}>+ add</span>
              </div>
            </Field>
          </FormSection>

          <FormSection title="Compensation" sub="Hidden from candidates by default. Toggle to disclose." action={<Toggle on/>}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <Field label="CTC range (LPA)" required>
                <Input value="₹ 4.5 – 6.0 LPA" prefix={<span style={{color:G.ink2,fontWeight:600}}>₹</span>}/>
              </Field>
              <Field label="Variable / bonus"><Input value="up to 12% on KPIs"/></Field>
              <Field label="Joining bonus"><Input value="₹ 25,000 on day 30" placeholder="optional"/></Field>
            </div>
            <div style={{marginTop:12,display:'flex',gap:8,flexWrap:'wrap'}}>
              {['PF + Gratuity','Health insurance · ₹3L family','Transport allowance','Night shift allowance','5-day week','Meal voucher','+ add benefit'].map((b,i)=>(
                <Pill key={i} tone={i<5?'neutral':'brand'} dot={i<5}>{b}</Pill>
              ))}
            </div>
          </FormSection>
        </div>

        {/* Right helper */}
        <aside style={{display:'grid',gap:14,alignContent:'flex-start'}}>
          <div style={{background:G.ink900,color:'rgba(255,255,255,.85)',borderRadius:12,padding:'14px 16px'}}>
            <Pill tone="brand" dot>Smart preview</Pill>
            <div style={{fontSize:13.5,fontWeight:700,color:'#fff',marginTop:8}}>~210 candidates match this draft</div>
            <div style={{display:'flex',gap:2,height:5,marginTop:10,borderRadius:3,overflow:'hidden'}}>
              <div style={{flex:5,background:G.brand}}/><div style={{flex:3,background:'rgba(255,255,255,.5)'}}/><div style={{flex:2,background:'rgba(255,255,255,.2)'}}/>
            </div>
            <div style={{fontSize:11,opacity:.7,marginTop:8,lineHeight:1.5}}>
              42 within Bhiwandi · 96 within 30 km · 72 elsewhere in MH
            </div>
          </div>

          <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,padding:14}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <I name="verified" size={15} color={G.ok}/>
              <span style={{fontSize:13,fontWeight:700}}>Quality checks</span>
              <Pill tone="ok" dot style={{marginLeft:'auto'}}>4 / 5</Pill>
            </div>
            {[
              ['Title is specific','done'],
              ['JD over 120 words','done'],
              ['Salary disclosed','done'],
              ['Has at least 3 must-haves','done'],
              ['Add a screening question for shift comfort','warn'],
            ].map(([t,s])=>(
              <div key={t} style={{display:'flex',gap:8,alignItems:'center',padding:'5px 0',fontSize:12}}>
                {s==='done' ? <I name="check" size={13} color={G.ok}/> : <span style={{
                  width:13,height:13,borderRadius:99,border:`1.5px solid ${G.warn}`,
                  display:'inline-flex',alignItems:'center',justifyContent:'center',
                  color:G.warn,fontSize:9,fontWeight:700
                }}>!</span>}
                <span style={{color:s==='done'?G.ink2:G.ink}}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,padding:14}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>Similar live jobs · what works</div>
            {[
              ['DHL Supply Chain · Sup, Bhiwandi','86 applies / 8d'],
              ['DTDC · Floor Sup, Vapi','62 applies / 11d'],
              ['Delhivery · TL, Bhiwandi','144 applies / 5d'],
            ].map(([t,m])=>(
              <div key={t} style={{padding:'7px 0',borderTop:`1px solid ${G.border}`,fontSize:12}}>
                <div style={{fontWeight:600,fontSize:12.5}}>{t}</div>
                <div style={{color:G.mute,fontSize:11}}>{m}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function FormSection({title,sub,action,children}) {
  return (
    <div style={{background:'#fff',border:`1px solid ${G.border}`,borderRadius:12,padding:'18px 20px'}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
        <div>
          <h3 style={{fontSize:15,fontWeight:700,margin:0,letterSpacing:'-0.015em'}}>{title}</h3>
          {sub && <div style={{fontSize:12,color:G.mute,marginTop:2}}>{sub}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// Variation B — AI co-pilot split view with live job preview
function PostJobB() {
  return (
    <Shell active="jobs">
      <TopBar title="Compose with AI" breadcrumb={['Jobs','New']} actions={<>
        <Btn variant="ghost" size="sm">Switch to form</Btn>
        <Btn variant="primary" size="sm" iconRight={<I name="arrow" size={13}/>}>Publish · ₹0 boost</Btn>
      </>}/>

      <div style={{flex:1,display:'flex',minHeight:0}}>
        {/* Left: chat-style composer */}
        <section style={{flex:'0 0 46%',borderRight:`1px solid ${G.border}`,display:'flex',flexDirection:'column',background:'#fff'}}>
          <div className="gh-scroll" style={{flex:1,overflow:'auto',padding:'24px 28px',display:'flex',flexDirection:'column',gap:18}}>
            <ChatBubble who="ai">Tell me about the role — title, location, and band level. I'll draft the rest. <span style={{fontStyle:'italic',color:G.mute}}>(English or Hinglish both fine.)</span></ChatBubble>
            <ChatBubble who="me">Warehouse Supervisor for Bhiwandi DC, 3-6 yrs exp, SAP EWM. 4.5 to 6 LPA. Rotational shift.</ChatBubble>
            <ChatBubble who="ai">
              Got it. Drafted a JD anchored to your Bhiwandi roles. I noticed 3 things — want to fix?
              <div style={{display:'grid',gap:6,marginTop:10}}>
                {[
                  ['Add "MHE / Forklift certification preferred"','suggest'],
                  ['Bhiwandi candidates avg ₹5.2 LPA — your band is competitive','info'],
                  ['Add 1 screening question on night-shift comfort','suggest'],
                ].map(([s,k])=>(
                  <div key={s} style={{
                    display:'flex',alignItems:'center',gap:8,padding:'8px 10px',
                    background:k==='info'?G.infoSoft:G.brandSoft,
                    borderRadius:8,fontSize:12.5,color:G.ink,
                  }}>
                    <span style={{width:6,height:6,borderRadius:99,background:k==='info'?G.info:G.brand}}/>
                    <span style={{flex:1}}>{s}</span>
                    {k!=='info' && <Btn variant="outline" size="sm">Apply</Btn>}
                  </div>
                ))}
              </div>
            </ChatBubble>
            <ChatBubble who="me">Apply all 3, and also add a screening on WMS hands-on years.</ChatBubble>
            <ChatBubble who="ai" thinking/>
          </div>

          {/* Composer input */}
          <div style={{borderTop:`1px solid ${G.border}`,padding:14,background:G.cardAlt}}>
            <div style={{
              background:'#fff',border:`1px solid ${G.borderStrong}`,borderRadius:12,
              padding:'10px 12px',display:'flex',alignItems:'flex-end',gap:8,
            }}>
              <span style={{flex:1,minHeight:36,fontSize:13.5,color:G.mute,paddingTop:10}}>Ask Gati to tweak — "make the JD more candidate-friendly"…</span>
              <Btn variant="outline" size="sm" icon={<I name="upload" size={13}/>}>Attach JD</Btn>
              <Btn variant="primary" size="sm" iconRight={<I name="arrow" size={13}/>}>Send</Btn>
            </div>
            <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
              {['Make it shorter','Translate to Hindi','Add diversity statement','Rewrite tone — energetic'].map(q=>(
                <Pill key={q} tone="neutral">{q}</Pill>
              ))}
            </div>
          </div>
        </section>

        {/* Right: live job preview */}
        <section style={{flex:1,background:G.paper,padding:'24px 28px',overflow:'auto'}} className="gh-scroll">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <Pill tone="brand" dot>Live preview · what candidates see</Pill>
            <div style={{display:'flex',gap:6}}>
              <Pill tone="neutral" dot>Desktop</Pill>
              <Pill tone="neutral">Mobile</Pill>
            </div>
          </div>
          <article style={{background:'#fff',borderRadius:14,border:`1px solid ${G.border}`,padding:'24px 28px',boxShadow:'0 1px 0 rgba(0,0,0,.02)'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
              <div style={{width:42,height:42,borderRadius:10,background:G.brand,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:16}}>ML</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontWeight:700,fontSize:13}}>Mahindra Logistics</span>
                  <I name="verified" size={13} color={G.ok}/>
                </div>
                <div style={{fontSize:11.5,color:G.mute}}>3PL · 5,000–10,000 employees</div>
              </div>
              <Btn variant="outline" size="sm" icon={<I name="star" size={13}/>}>Save</Btn>
              <Btn variant="brand" size="sm">Apply</Btn>
            </div>

            <h1 style={{fontSize:22,fontWeight:800,letterSpacing:'-0.02em',margin:'4px 0 8px'}}>Warehouse Supervisor — Bhiwandi DC</h1>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
              <Pill tone="neutral" dot><I name="loc" size={10}/> Bhiwandi, MH</Pill>
              <Pill tone="neutral">Full-time</Pill>
              <Pill tone="neutral">Rotational shift</Pill>
              <Pill tone="brand" dot>₹4.5 – 6.0 LPA</Pill>
              <Pill tone="info">Apply by 8 Jun</Pill>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:18,padding:'12px 14px',background:G.cardAlt,borderRadius:10}}>
              {[['Exp','3–6 yrs'],['Notice','≤ 30 days'],['Openings','4']].map(([k,v])=>(
                <div key={k}><div style={{fontSize:10.5,color:G.mute,fontWeight:600}}>{k}</div><div style={{fontSize:13,fontWeight:700,marginTop:2}}>{v}</div></div>
              ))}
            </div>

            <h3 style={{fontSize:14,fontWeight:700,margin:'14px 0 6px'}}>About the role</h3>
            <p style={{fontSize:12.5,lineHeight:1.55,color:G.ink2,margin:'0 0 10px'}}>
              You'll lead a shift of 40–60 associates at our Bhiwandi DC, ensuring inbound, putaway and outbound SLAs are hit daily. You report into the DC Manager and partner closely with the Transport Control Tower for evening cut-offs.
            </p>

            <h3 style={{fontSize:14,fontWeight:700,margin:'14px 0 6px'}}>Must-haves</h3>
            <ul style={{margin:0,paddingLeft:18,fontSize:12.5,lineHeight:1.7,color:G.ink2}}>
              <li>3+ years running a 200K+ sqft warehouse, ideally 3PL</li>
              <li>Hands-on SAP EWM or comparable WMS (Manhattan, Blue Yonder)</li>
              <li>Comfort with rotational shifts; can read a daily P&L</li>
              <li>MHE / Forklift certification preferred</li>
            </ul>

            <div style={{marginTop:14,padding:'10px 12px',background:G.brandSoft,borderRadius:10,fontSize:12.5,color:G.brandDeep,display:'flex',gap:8,alignItems:'center'}}>
              <I name="verified" size={14}/> Verified employer · 87% offer acceptance · usually responds in 2 days
            </div>
          </article>
        </section>
      </div>
    </Shell>
  );
}

function ChatBubble({who,children,thinking}) {
  const me = who==='me';
  return (
    <div style={{display:'flex',gap:10,alignItems:'flex-start',flexDirection:me?'row-reverse':'row'}}>
      <div style={{
        width:28,height:28,borderRadius:8,flex:'0 0 auto',
        background: me ? G.cardAlt : G.ink,
        color: me?G.ink:'#fff',
        display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,
      }}>{me?'P':<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/></svg>}</div>
      <div style={{
        maxWidth:'80%',
        background: me?G.ink:G.cardAlt,
        color: me?'#fff':G.ink,
        borderRadius: me?'14px 14px 4px 14px':'14px 14px 14px 4px',
        padding:'10px 14px',
        fontSize:13,lineHeight:1.5,
        border: me?'none':`1px solid ${G.border}`,
      }}>
        {thinking ? (
          <span style={{display:'inline-flex',gap:4,padding:'2px 4px'}}>
            <span style={{width:6,height:6,borderRadius:99,background:G.mute,opacity:.8}}/>
            <span style={{width:6,height:6,borderRadius:99,background:G.mute,opacity:.5}}/>
            <span style={{width:6,height:6,borderRadius:99,background:G.mute,opacity:.3}}/>
          </span>
        ) : children}
      </div>
    </div>
  );
}

window.PostJobA = PostJobA;
window.PostJobB = PostJobB;
