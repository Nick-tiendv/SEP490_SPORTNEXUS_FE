import './auth-pages.css'

function ForgotPassword() {
  return (
    <>
      <div>
  <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" /><div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(0,229,255,0.06),transparent_60%)]" /><header className="w-full z-20 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div className="h-16 max-w-7xl mx-auto px-margin lg:px-margin-lg flex items-center justify-between"><a className="flex items-center gap-space-sm group" data-path="login" href="/login"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg" /><span className="font-headline-sm text-headline-sm tracking-tight text-on-surface uppercase">Sport<span className="text-primary-container">Nexus</span></span></a><div className="flex items-center gap-space-md"><div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm tracking-wider uppercase"><span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse" /><span>Protocol 8.4 Online</span></div></div></div></header><main className="w-full flex-1 flex flex-col items-center justify-center relative z-10 px-margin py-margin-lg"><div className="flex flex-col w-full items-center justify-center py-margin-lg px-margin">
      {/* Atmospheric Glow Accents Behind the Card */}
      <div className="relative w-full max-w-lg flex items-center justify-center">
        <div className="absolute -top-16 -left-12 w-64 h-64 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-12 w-72 h-72 rounded-full bg-tertiary-container/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-container/5 via-transparent to-secondary-container/5 rounded-2xl blur-xl pointer-events-none" />
        {/* Main Glassmorphism Authentication Shield Card */}
        <div className="relative w-full bg-surface-container/60 backdrop-blur-xl rounded-2xl p-margin lg:p-space-xl shadow-2xl flex flex-col items-center text-center overflow-hidden">
          {/* Precision Top Refraction Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent" />
          {/* Athletic Telemetry Node Watermark */}
          <div className="absolute top-4 right-5 flex items-center gap-space-xs text-on-surface-variant/40 font-label-sm text-label-sm uppercase tracking-widest pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container/50" />
            <span>SEC-NODE 09</span>
          </div>
          {/* Lock Emblem with Multi-Layered Neon Halo */}
          <div className="relative mt-space-sm mb-space-lg flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary-container/20 blur-md animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-surface-container-high/80 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-primary-container text-[30px]" style={{fontVariationSettings: '"FILL" 1'}}>lock_reset</span>
            </div>
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary-container/30 to-secondary-container/20 blur-xs -z-10" />
          </div>
          {/* Card Title & Athletic Subtext */}
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">
            Reset Your <span className="text-primary-container">Password</span>
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-xl">
            Enter your registered email address to receive a password reset link.
          </p>
          {/* Interactive Form Container */}
          <form className="w-full flex flex-col gap-space-lg text-left" id="resetForm" >
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface" htmlFor="athleteIdentity">
                  Athlete ID or Email
                </label>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Required
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[20px] pointer-events-none transition-colors duration-200" id="inputGlyph">
                  alternate_email
                </span>
                <input className="w-full bg-surface-container-lowest/80 text-on-surface font-body-md text-body-md rounded-xl pl-12 pr-4 py-3.5 outline-none placeholder:text-on-surface-variant/40 transition-all duration-200 focus:bg-surface-container-low shadow-inner" id="athleteIdentity"   placeholder="e.g. athlete@kinetic.io" required type="text" />
              </div>
            </div>
            {/* Submission Feedback Zone (Hidden by Default) */}
            <div className="hidden w-full p-space-md rounded-xl bg-secondary-container/10 flex items-start gap-space-sm text-left" id="feedbackBanner">
              <span className="material-symbols-outlined text-secondary-fixed-dim text-[20px] mt-0.5" style={{fontVariationSettings: '"FILL" 1'}}>check_circle</span>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-secondary-fixed-dim">Reset Link Dispatched</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Check your inbox for cryptographic access instructions.</span>
              </div>
            </div>
            {/* High-Velocity Neon Action Button */}
            <button className="relative w-full group overflow-hidden bg-primary-container text-on-primary font-label-lg text-label-lg rounded-xl py-3.5 px-space-lg flex items-center justify-center gap-space-xs transition-all duration-200 hover:shadow-[0_0_24px_rgba(0,229,255,0.45)] active:scale-[0.99] cursor-pointer" id="submitBtn" type="submit">
              <span className="relative z-10 font-bold uppercase tracking-wider">Send Reset Link</span>
              <span className="material-symbols-outlined relative z-10 text-[18px] transition-transform duration-200 group-hover:translate-x-1">
                arrow_forward
              </span>
              {/* Ambient Button Sheen */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            </button>
            {/* Secondary Navigation Return Link */}
            <div className="flex items-center justify-center pt-space-xs">
              <a className="group inline-flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary-container transition-colors duration-200 py-1" data-path="login" href="/login">
                <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-x-1">
                  west
                </span>
                <span>Back to Login</span>
              </a>
            </div>
          </form>
          {/* Trust Metrics & Escrow Proof Badges */}
          <div className="w-full mt-space-xl pt-space-lg bg-gradient-to-b from-surface-container-high/40 to-transparent rounded-xl p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-primary-container text-[16px]">
                enhanced_encryption
              </span>
              <span>256-Bit SSL Encrypted Protocol</span>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-secondary-fixed-dim text-[16px]">
                security
              </span>
              <span>Instant Escrow Recovery Guard</span>
            </div>
          </div>
        </div>
      </div>
      {/* Micro-Interactive Form Handler Script */}
    </div></main><footer className="w-full z-20 bg-surface-container-lowest/60 backdrop-blur-md py-space-lg"><div className="max-w-7xl mx-auto px-margin lg:px-margin-lg flex flex-col md:flex-row items-center justify-between gap-space-md"><div className="flex items-center gap-space-sm text-on-surface-variant font-label-md text-label-md"><span className="material-symbols-outlined text-primary-container text-[16px]">verified_user</span><span>Telemetry Shielded GÃ‡Ã³ AES-256 Protocol</span></div><div className="flex items-center gap-space-lg"><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="terms-of-service" href="#">Terms of Service</a><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="privacy-policy" href="#">Security Protocol</a><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="system-status" href="#">Node Status</a></div><div className="text-on-surface-variant font-label-sm text-label-sm">-Â¬ 2025 SportNexus Inc. All rights reserved.</div></div></footer>
</div>
    </>
  )
}

export default ForgotPassword
