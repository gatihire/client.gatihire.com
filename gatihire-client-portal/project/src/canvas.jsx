// Canvas composition — the Gatihire client portal design tour

function App() {
  return (
    <DesignCanvas>
      <DCSection id="system" title="System" subtitle="Visual direction · type · color · components">
        <DCArtboard id="brand" label="01 · System overview" width={1280} height={780}>
          <BrandSystem/>
        </DCArtboard>
      </DCSection>

      <DCSection id="auth" title="01 · Sign up & verify" subtitle="Employer-side sign-up · GST/PAN auto-lookup · WhatsApp OTP">
        <DCArtboard id="signup" label="A · Sign up · split brand panel" width={1280} height={820}>
          <SignUp/>
        </DCArtboard>
        <DCArtboard id="otp" label="B · Verify number" width={1280} height={820}>
          <VerifyOTP/>
        </DCArtboard>
      </DCSection>

      <DCSection id="onboard" title="02 · Company onboarding" subtitle="4-step wizard · auto-populated from GSTN + MCA records">
        <DCArtboard id="cs1" label="Step 1 · Company" width={1280} height={820}>
          <CompanySetup1/>
        </DCArtboard>
        <DCArtboard id="cs2" label="Step 2 · Hiring focus" width={1280} height={820}>
          <CompanySetup2/>
        </DCArtboard>
        <DCArtboard id="cs3" label="Step 3 · Verify entity" width={1280} height={820}>
          <CompanySetup3/>
        </DCArtboard>
        <DCArtboard id="cs4" label="Step 4 · Invite team + channels" width={1280} height={820}>
          <CompanySetup4/>
        </DCArtboard>
      </DCSection>

      <DCSection id="dash" title="03 · Dashboard · Home" subtitle="Two directions explored · pick & remix">
        <DCArtboard id="dashA" label="A · Overview cards · light shell" width={1280} height={840}>
          <DashboardA/>
        </DCArtboard>
        <DCArtboard id="dashB" label="B · Dense ops cockpit · dark sidebar" width={1280} height={840}>
          <DashboardB/>
        </DCArtboard>
      </DCSection>

      <DCSection id="post" title="04 · Post a job" subtitle="Long-form composer vs AI-assisted side-by-side">
        <DCArtboard id="postA" label="A · Guided composer + live quality checks" width={1280} height={840}>
          <PostJobA/>
        </DCArtboard>
        <DCArtboard id="postB" label="B · Gati AI co-pilot + live preview" width={1280} height={840}>
          <PostJobB/>
        </DCArtboard>
      </DCSection>

      <DCSection id="apply" title="05 · See applicants" subtitle="Table for triage · Kanban for moving people">
        <DCArtboard id="appT" label="Table · ranked by AI match" width={1280} height={820}>
          <ApplicantsTable/>
        </DCArtboard>
        <DCArtboard id="appK" label="Kanban · stage pipeline" width={1280} height={820}>
          <ApplicantsKanban/>
        </DCArtboard>
      </DCSection>

      <DCSection id="db" title="06 · Unlock from talent database" subtitle="Search 1.2L+ verified profiles · spend a credit to reveal contact">
        <DCArtboard id="dbList" label="DB · search results · blurred contact" width={1280} height={840}>
          <TalentDB/>
        </DCArtboard>
        <DCArtboard id="dbUnlock" label="DB · unlock confirmation" width={1280} height={840}>
          <TalentDBUnlockModal/>
        </DCArtboard>
      </DCSection>

      <DCSection id="ats" title="07 · Applicant tracking · candidate detail" subtitle="The drawer your recruiter lives in all day">
        <DCArtboard id="detail" label="Candidate detail · interview & offer" width={1280} height={840}>
          <CandidateDetail/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
