// Auth — sign up & sign in

function SignUp() {
  return (
    <Frame style={{flexDirection:'row'}}>
      {/* Left: marketing/ops imagery panel */}
      <div style={{
        flex:'0 0 44%',background:G.ink900,color:'#fff',
        padding:'34px 36px',display:'flex',flexDirection:'column',
        position:'relative',overflow:'hidden',
      }}>
        <Logo mono/>
        <div style={{flex:1}}/>
        <div style={{fontFamily:G.mono,fontSize:10.5,letterSpacing:'.1em',color:'rgba(255,255,255,.5)',marginBottom:12}}>
          ★ INDIA'S SUPPLY-CHAIN HIRING NETWORK
        </div>
        <h2 style={{fontSize:32,fontWeight:800,margin:0,letterSpacing:'-0.025em',lineHeight:1.1,maxWidth:380}}>
          Hire warehouse, freight & SCM talent <span style={{color:G.brand}}>4× faster</span>.
        </h2>
        <p style={{color:'rgba(255,255,255,.7)',marginTop:14,fontSize:13.5,maxWidth:380,lineHeight:1.55}}>
          Verified profiles. Industry-tagged. From TL on the floor to AGM Supply Chain — only logistics.
        </p>
        <div style={{display:'flex',gap:20,marginTop:28,paddingTop:20,borderTop:'1px solid rgba(255,255,255,.1)'}}>
          {[
            ['1.2L+','verified profiles'],
            ['340+','client companies'],
            ['11 d','median time-to-hire'],
          ].map(([n,l])=>(
            <div key={l}>
              <div style={{fontSize:22,fontWeight:800,letterSpacing:'-0.02em'}}>{n}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.55)',marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{
          position:'absolute',right:-80,top:60,opacity:.08,
          fontSize:340,fontWeight:800,color:G.brand,
          fontFamily:G.sans,letterSpacing:'-0.05em',lineHeight:1,
          pointerEvents:'none',
        }}>g.</div>
      </div>

      {/* Right: form */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 48px',background:'#fff'}}>
        <div style={{width:'100%',maxWidth:380}}>
          <Pill tone="brand" dot style={{marginBottom:14}}>For employers</Pill>
          <h1 style={{fontSize:26,fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.025em'}}>Create your hiring workspace</h1>
          <p style={{color:G.mute,fontSize:13,margin:0}}>Free for 14 days. No card.</p>

          <div style={{display:'flex',gap:8,marginTop:18}}>
            <Btn variant="outline" full icon={<svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22 12c0-1-.1-1.7-.2-2.5H12v4.7h5.6c-.2 1.3-1 3-2.7 4l4 3.2c2.4-2.2 3.8-5.4 3.8-9.4z"/><path fill="#34A853" d="M12 22c3.5 0 6.4-1.2 8.5-3.1l-4-3.2c-1 .7-2.6 1.3-4.5 1.3-3.4 0-6.3-2.3-7.3-5.4H.5v3.4C2.6 19.5 7 22 12 22z"/><path fill="#FBBC04" d="M4.7 11.6c-.3-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3V3.6H.5C-.3 5.3-.7 7.1-.7 9.3s.5 4 1.2 5.7l4.2-3.4z"/><path fill="#EA4335" d="M12 4.5c1.9 0 3.6.7 4.9 2l3.6-3.6C18.4 1 15.5 0 12 0 7 0 2.6 2.5.5 6.4l4.2 3.4C5.7 6.8 8.6 4.5 12 4.5z"/></svg>}>Google</Btn>
            <Btn variant="outline" full icon={<I name="building" size={14}/>}>SSO</Btn>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:10,margin:'18px 0 16px',color:G.mute,fontSize:11.5}}>
            <span style={{flex:1,height:1,background:G.border}}/>or with email<span style={{flex:1,height:1,background:G.border}}/>
          </div>

          <div style={{display:'grid',gap:12}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Field label="First name"><Input placeholder="Priya"/></Field>
              <Field label="Last name"><Input placeholder="Nair"/></Field>
            </div>
            <Field label="Work email" hint="use your company domain">
              <Input placeholder="priya@mahindralogistics.com" prefix={<I name="mail" size={14}/>}/>
            </Field>
            <Field label="Mobile" hint="WhatsApp updates">
              <Input placeholder="98XXX 12345" prefix={<span style={{fontSize:13,color:G.ink2,fontWeight:600}}>+91</span>}/>
            </Field>
            <Field label="Company">
              <Input placeholder="Start typing — we'll find your GST'd entity" suffix={<I name="search" size={14}/>}/>
            </Field>
            <div style={{display:'flex',alignItems:'flex-start',gap:8,marginTop:2}}>
              <Checkbox checked/>
              <span style={{fontSize:11.5,color:G.ink2,lineHeight:1.5}}>
                I agree to the <u>Terms</u> and <u>Privacy Policy</u>, and to receiving hiring updates on WhatsApp.
              </span>
            </div>
            <Btn variant="brand" size="lg" full iconRight={<I name="arrow"/>}>Create workspace</Btn>
            <div style={{textAlign:'center',fontSize:12,color:G.mute,marginTop:4}}>
              Already have one? <span style={{color:G.ink,fontWeight:600}}>Sign in</span>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function VerifyOTP() {
  return (
    <Frame>
      <div style={{
        flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px',background:G.paper,
      }}>
        <div style={{
          width:440,background:'#fff',borderRadius:14,padding:'32px 36px',
          border:`1px solid ${G.border}`,boxShadow:'0 1px 0 rgba(0,0,0,.02), 0 30px 60px -30px rgba(0,0,0,.15)',
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
            <Logo/>
            <Pill tone="ok" dot>Step 2 of 4</Pill>
          </div>
          <h2 style={{fontSize:22,fontWeight:800,margin:'4px 0 6px',letterSpacing:'-0.02em'}}>Verify your number</h2>
          <p style={{color:G.mute,fontSize:13,margin:0}}>
            We sent a 6-digit code to <b style={{color:G.ink}}>+91 98XXX 12345</b> on WhatsApp & SMS.
          </p>

          <div style={{display:'flex',gap:8,margin:'24px 0 8px'}}>
            {['4','8','2','1','',''].map((d,i)=>(
              <div key={i} style={{
                flex:1,height:54,borderRadius:10,
                border:`1.5px solid ${i===4?G.ink:G.border}`,
                background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:24,fontWeight:700,color:d?G.ink:G.mute,fontFamily:G.mono,
                boxShadow: i===4?`0 0 0 4px ${G.brandSoft}`:'none',
              }}>{d||<span style={{width:2,height:24,background:G.ink,animation:''}}/>}</div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11.5,color:G.mute,marginBottom:18}}>
            <span>Didn't get it? <b style={{color:G.ink}}>Resend in 0:24</b></span>
            <span style={{display:'inline-flex',alignItems:'center',gap:4}}><I name="wa" size={12}/> Sent via WhatsApp</span>
          </div>

          <Btn variant="primary" size="lg" full iconRight={<I name="arrow"/>}>Verify & continue</Btn>

          <div style={{marginTop:18,padding:'10px 12px',background:G.cardAlt,borderRadius:8,fontSize:11.5,color:G.ink2,display:'flex',gap:8,alignItems:'flex-start'}}>
            <I name="verified" size={14} color={G.ok}/>
            <span><b>Tip:</b> We'll auto-verify your company against MCA & GST after onboarding. Hiring goes live in &lt;2 hours.</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

window.SignUp = SignUp;
window.VerifyOTP = VerifyOTP;
