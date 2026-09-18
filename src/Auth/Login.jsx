import './auth-pages.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const navigate = useNavigate()
  return (
    <>
      <div className="bg-surface text-on-surface min-h-screen relative overflow-hidden">
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0"><div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary-container/5 rounded-full blur-[140px]" /><div className="absolute -bottom-40 right-1/4 w-[600px] h-[450px] bg-secondary-container/5 rounded-full blur-[160px]" /><div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#c3f5ff_1px,transparent_1px),linear-gradient(to_bottom,#c3f5ff_1px,transparent_1px)] bg-[size:4rem_4rem]" /></div><div className="relative z-10 min-h-screen flex flex-col justify-between p-margin lg:p-margin-lg"><header className="w-full flex items-center justify-between"><a className="flex items-center gap-space-sm group" data-path="login" href="#"><div className="w-10 h-10 rounded-xl bg-surface-container-high/80 backdrop-blur-xl flex items-center justify-center shadow-[0_1px_8px_rgba(0,0,0,0.04)] group-hover:bg-surface-bright transition-all"><span className="material-symbols-outlined text-primary-container text-[24px]">bolt</span></div><div className="flex flex-col"><span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">SPORTNEXUS</span><span className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase mt-0.5">KINETIC PORTAL</span></div></a><div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low/60 backdrop-blur-md"><span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse" /><span className="font-label-sm text-label-sm text-secondary-fixed-dim tracking-wider uppercase">ESCROW MESH ONLINE</span></div></header><main className="w-full flex items-center justify-center my-space-lg flex-1"><div className="flex flex-col w-full items-center justify-center relative">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-primary-container/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-28 -right-20 w-96 h-96 bg-secondary-container/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="w-full max-w-lg relative z-10">
          <div className="relative rounded-2xl bg-surface-container-low/80 backdrop-blur-2xl p-space-md sm:p-space-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
            <div className="flex items-start justify-between gap-space-sm mb-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center relative shadow-[0_0_20px_rgba(0,229,255,0.25)]">
                  <span className="material-symbols-outlined text-primary-container text-[26px]">sports_tennis</span>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary-container" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight">SPORTNEXUS</span>
                    <span className="text-primary-container text-body-sm font-semibold tracking-wider">v3.8</span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Kinetic Escrow Mesh</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest/60 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse" />
                <span className="font-label-sm text-label-sm text-secondary tracking-wider uppercase">Live Grid</span>
              </div>
            </div>
            <div className="mb-space-lg">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Welcome Back, Athlete</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                Authenticate to sync court telemetry, unlock active smart escrow matches, and resume ranking matches.
              </p>
            </div>
            <form className="space-y-space-md" id="auth-form"  onSubmit={(event) => { event.preventDefault(); navigate('/player-dashboard') }}>
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center justify-between" htmlFor="athlete-id">
                  <span>Athlete ID / Secure Email</span>
                  <span className="text-primary-container font-label-sm text-label-sm">BWF / WPT ID Sync</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary-container transition-colors">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <input autoComplete="username" className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container transition-all shadow-inner" id="athlete-id" name="athlete-id" placeholder="athlete@kinetic.io or #NX-8821" required type="text" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center justify-between" htmlFor="athlete-pass">
                  <span>Key Passcode</span>
                  <a className="text-primary-container hover:text-primary transition-colors font-label-sm text-label-sm normal-case" href="/forgot-password">Forgot passcode?</a>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary-container transition-colors">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input autoComplete="current-password" className="w-full pl-11 pr-11 py-3 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container transition-all shadow-inner" id="athlete-pass" name="athlete-pass" required type={passwordVisible ? 'text' : 'password'} />
                  <button aria-label="Toggle password visibility" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none" id="toggle-pwd-btn" onClick={() => setPasswordVisible((visible) => !visible)} type="button">
                    <span className="material-symbols-outlined text-[20px]" id="toggle-pwd-icon">{passwordVisible ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <input defaultChecked className="peer sr-only" id="remember-me" name="remember-me" type="checkbox" />
                  <div className="w-5 h-5 rounded bg-surface-container-lowest peer-checked:bg-primary-container flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined text-on-primary-container text-[16px] scale-0 peer-checked:scale-100 transition-transform">check</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface transition-colors">
                    Keep telemetry session linked
                  </span>
                </label>
                <span className="font-label-sm text-label-sm text-secondary-fixed-dim bg-surface-container-high px-2 py-0.5 rounded">
                  256-AES
                </span>
              </div>
              <button className="w-full py-3.5 px-6 rounded-xl bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container font-label-lg text-label-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(52,255,140,0.35)] transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer" id="submit-btn" type="submit">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                <span>Access SportNexus Arena</span>
              </button>
            </form>
            <div className="relative my-space-md flex items-center justify-center">
              <div className="w-full h-px bg-surface-container-highest" />
              <span className="absolute px-3 bg-surface-container-low font-label-sm text-label-sm text-outline uppercase tracking-widest">
                Hardware &amp; Passkey Gateway
              </span>
            </div>
            <div className="space-y-2.5">
              <button className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface font-label-md text-label-md uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"  type="button">
                <span className="material-symbols-outlined text-primary-container text-[18px]">fingerprint</span>
                <span>Fast Passkey / Face ID Vault Sign-in</span>
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <button className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer" type="button">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google Athlete</span>
                </button>
                <button className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer" type="button">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.6-1.02.99-2.45.81-3.87-1.2.05-2.61.8-3.44 1.77-.55.64-.99 1.93-.81 3.33 1.34.1 2.66-.67 3.44-1.23z" />
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>
            </div>
            <div className="mt-space-md pt-space-sm text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                New to the competitive circuit?
                <a className="text-primary-container font-label-md text-label-md hover:underline ml-1" href="/register">Claim Athlete Passport</a>
              </p>
            </div>
          </div>
          <div className="mt-space-md px-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-outline font-label-sm text-label-sm uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary-container">shield</span>
              <span>Escrow Mesh Authenticated</span>
            </div>
            <div className="flex items-center gap-2">
              <span>BWF Verified</span>
              <span className="opacity-40">GÃ‡Ã³</span>
              <span>WPT Telemetry</span>
              <span className="opacity-40">GÃ‡Ã³</span>
              <span className="text-secondary-fixed-dim">0ms Desync</span>
            </div>
          </div>
        </div>
      </div></main><footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-space-sm py-space-sm"><div className="flex items-center gap-space-md"><div className="flex items-center gap-space-xs text-on-surface-variant"><span className="material-symbols-outlined text-[16px] text-primary">lock</span><span className="font-label-sm text-label-sm tracking-wider uppercase">256-Bit Encrypted</span></div><div className="flex items-center gap-space-xs text-on-surface-variant"><span className="material-symbols-outlined text-[16px] text-secondary-fixed-dim">verified_user</span><span className="font-label-sm text-label-sm tracking-wider uppercase">Smart Escrow Auth</span></div></div><div className="flex items-center gap-space-md text-on-surface-variant"><a className="font-label-sm text-label-sm hover:text-on-surface transition-colors uppercase tracking-wider" data-path="terms-of-service" href="#">Terms</a><span className="font-label-sm text-label-sm opacity-40">/</span><a className="font-label-sm text-label-sm hover:text-on-surface transition-colors uppercase tracking-wider" data-path="privacy-protocol" href="#">Privacy Protocol</a><span className="font-label-sm text-label-sm opacity-40">/</span><span className="font-label-sm text-label-sm uppercase tracking-wider opacity-60">-Â¬ 2025 The Kinetic</span></div></footer></div>
</div>
    </>
  )
}

export default Login
