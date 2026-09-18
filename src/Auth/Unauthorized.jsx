import './auth-pages.css'

function Unauthorized() {
  return (
    <>
      <div>
  <header className="w-full bg-surface-dim/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]"><div className="h-16 w-full px-margin md:px-margin-lg flex items-center justify-between"><div className="flex items-center gap-space-sm"><div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.2)]"><span className="material-symbols-outlined text-primary-container text-[20px]">bolt</span></div><div className="flex flex-col"><span className="font-headline-sm text-headline-sm text-on-surface tracking-tight uppercase">SportNexus</span><span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Secure Gateway</span></div></div><div className="flex items-center gap-space-md"><div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-full"><span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" /><span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider">Node: Isolated</span></div><div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-xs rounded-full"><span className="material-symbols-outlined text-primary-container text-[16px]">shield_lock</span><span className="font-label-sm text-label-sm text-on-surface uppercase">Encrypted Session</span></div></div></div></header><main className="w-full flex-1 flex items-center justify-center bg-background relative px-margin py-margin-lg"><div className="flex flex-col w-full relative items-center justify-center py-space-xl overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none">
        <div className="absolute w-[680px] h-[680px] rounded-full bg-error/5 blur-[120px] -translate-y-12" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-primary-container/5 blur-[100px] translate-y-24 translate-x-24" />
        <span className="font-display-lg text-[160px] md:text-[280px] lg:text-[340px] leading-none text-surface-container-highest/20 tracking-tighter mix-blend-screen select-none translate-y-4">
          403
        </span>
      </div>
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center">
        <div className="relative mb-space-lg">
          <div className="absolute -inset-3 rounded-full bg-error/20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-xl">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-error-container/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[36px] md:text-[44px]" style={{fontVariationSettings: '"FILL" 1'}}>gpp_bad</span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-primary-container text-[16px]">lock</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high shadow-md mb-space-md">
          <span className="w-2 h-2 rounded-full bg-error animate-ping" />
          <span className="font-label-sm text-label-sm text-primary-container tracking-wider font-mono uppercase">
            ERR_HTTP_403 // FORBIDDEN_RESOURCE_ACCESS
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg md:text-[36px] md:leading-[42px] text-on-surface uppercase tracking-tight mb-space-sm">
          Access Denied
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto mb-space-xl">
          Oops! You don't have permission to view this page. This area is restricted to Court Owners and System Admins.
        </p>
        <div className="w-full bg-surface-container-low rounded-xl p-space-lg shadow-xl mb-space-xl text-left">
          <div className="flex items-center justify-between pb-space-sm mb-space-md bg-surface-container-high px-space-md py-space-xs rounded-lg">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary-container text-[18px]">terminal</span>
              <span className="font-label-sm text-label-sm text-on-surface tracking-wider uppercase">Security Diagnostic Telemetry</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-error" />
              <span className="font-label-sm text-label-sm text-error uppercase">Gate Enforced</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div className="bg-surface-container-high/60 p-space-md rounded-lg">
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider mb-space-xs">Identified Role</span>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">sports_tennis</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Athlete / Player (Tier 1)</span>
              </div>
            </div>
            <div className="bg-surface-container-high/60 p-space-md rounded-lg">
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider mb-space-xs">Required Clearance</span>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-error text-[18px]">verified_user</span>
                <span className="font-headline-sm text-headline-sm text-error">Court Owner / SysAdmin (Level 4+)</span>
              </div>
            </div>
            <div className="bg-surface-container-high/60 p-space-md rounded-lg">
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider mb-space-xs">Session Node Token</span>
              <span className="font-label-md text-label-md font-mono text-primary-container block truncate">#NX-SEC-9921-ESCROW</span>
            </div>
            <div className="bg-surface-container-high/60 p-space-md rounded-lg">
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider mb-space-xs">Timestamp / Relay</span>
              <span className="font-label-md text-label-md font-mono text-on-surface block" id="telemetry-timestamp">2025-02-23T14:48:02.812Z</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-space-md w-full sm:w-auto">
          <a className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg uppercase tracking-wider shadow-lg hover:shadow-[0_0_24px_rgba(96,255,152,0.4)] transition-all" href="#dashboard">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Return to Dashboard
          </a>
          <a className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-space-md rounded-full bg-surface-container-high text-on-surface font-label-lg text-label-lg uppercase tracking-wider shadow-md hover:bg-surface-bright transition-all" href="#switch-account">
            <span className="material-symbols-outlined text-[20px]">switch_account</span>
            Switch Account
          </a>
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-space-md rounded-full bg-surface-container-low text-primary-container font-label-lg text-label-lg uppercase tracking-wider shadow-sm hover:bg-surface-container transition-all" id="dispatch-secops" type="button">
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
            Contact Protocol
          </button>
        </div>
        <div className="hidden mt-space-md px-space-md py-space-xs rounded-full bg-surface-container text-primary text-body-sm font-body-sm items-center gap-space-xs" id="dispatch-notice">
          <span className="material-symbols-outlined text-[16px] text-primary-container">check_circle</span>
          SecOps ticket initiated. Escalation code: <span className="font-mono text-on-surface">#TK-403-AUTO</span>
        </div>
      </div>
    </div>
  </main><footer className="w-full bg-surface-container-lowest/90 backdrop-blur-md"><div className="w-full px-margin md:px-margin-lg py-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm"><span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">End-to-End Quantum Grid Vault</span><span className="font-body-sm text-body-sm text-on-surface-variant">SecOps Dispatch: active-duty 24/7/365</span></div></footer>
</div>
    </>
  )
}

export default Unauthorized
