import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './auth-pages.css'

function Register() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [role, setRole] = useState('player') // 'player' | 'owner'
  const navigate = useNavigate()

  return (
    <>
      <main className="w-full min-h-screen flex flex-col lg:flex-row relative bg-surface text-on-surface">
        {/* BEGIN: LeftHeroSide (45%-50% desktop split) */}
        <section aria-label="Visual Showcase" className="relative hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between overflow-hidden bg-surface-container-lowest border-r border-outline-variant/30 select-none">
          {/* Background Badminton Action Imagery */}
          <div className="absolute inset-0 z-0">
            <img alt="Intense athletic badminton player executing a powerful high-flying jump smash" className="w-full h-full object-cover object-center scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnaZ3R7jloKq_--dDononhiUgmLnFkvkOXBrb4uShJOS3oDxnnTfc5txWfrOR8OlplB9tPAua_XFznFHyxnnRjprmSdaFLXEjcc2ub5LSfRhh9BQUDW9ASnGrXbWvWs8fC6KI6WhZb9DSFafJERwMJKwKrVEZSGHRjszK787EDhN5nIPXBYzV9Kj9L3jR_tjg_RqPkB77TQsv1TDo9ak9vFMbu-N-QEpCAUvfqlYfpco9ejomPKwov" />
            {/* Multi-layer Gradient Overlays for High-Tech Mood */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/70 to-surface-container-lowest/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/90 via-transparent to-surface-container-lowest/20" />
            <div className="absolute inset-0 court-grid-lines opacity-50" />
          </div>
          
          {/* Top Overlay: Brand Header */}
          <div className="relative z-10 p-8 xl:p-12 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                <span className="material-symbols-outlined text-primary-container text-[20px]">bolt</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-headline-md tracking-wider text-on-surface leading-none">SPORTNEXUS</span>
                  <span className="text-[10px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/30">KINETIC</span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-mono tracking-wider mt-0.5">NEXT-GEN ATHLETIC PROTOCOL</p>
              </div>
            </div>
            {/* Live Court Telemetry Dot */}
            <div className="flex items-center space-x-2 bg-surface-container/80 border border-outline-variant/50 rounded-full px-3 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
              </span>
              <span className="text-xs font-mono text-primary-container/90 tracking-wide font-medium">LIVE TELEMETRY</span>
            </div>
          </div>
          
          {/* Center Float: Metrics & Floating Badges */}
          <div className="relative z-10 px-8 xl:px-12 space-y-4 my-auto">
            {/* Primary Stat Card */}
            <div className="glass-panel p-5 rounded-2xl max-w-sm border border-primary-container/20 shadow-[0_0_20px_rgba(0,229,255,0.15)] transform translate-y-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">Match Node Status</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold text-secondary-fixed bg-secondary-fixed/10 rounded-full border border-secondary-fixed/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed inline-block" /> 99.98% Synced
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-headline-lg text-on-surface tracking-tight">48,290+</span>
                <span className="text-xs text-primary-container font-medium">Verified Matches</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Smart court sensors & automated escrow settled across 340+ certified hubs.</p>
            </div>
            {/* Floating Secondary Micro-Pill */}
            <div className="inline-flex items-center gap-2 bg-surface-container/80 border border-outline-variant/50 rounded-xl px-4 py-2 backdrop-blur-md text-xs font-mono text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary-container">shield</span>
              <span>BWF Standard Telemetry & Escrow Integrated</span>
            </div>
          </div>
          
          {/* Bottom Overlay: Motivational Statement */}
          <div className="relative z-10 p-8 xl:p-12 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/90 to-transparent">
            <blockquote className="text-lg xl:text-xl font-headline-sm text-on-surface leading-relaxed tracking-normal">
              "Elevate your game. Connect with elite players, unlock smart court access, and climb the verified leaderboards."
            </blockquote>
            <div className="flex items-center gap-3 mt-4 text-xs font-mono text-on-surface-variant">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-flex h-6 w-6 rounded-full bg-primary-container/20 ring-2 ring-surface-container-lowest border border-primary-container/40 text-[10px] text-primary-container items-center justify-center font-bold">AN</div>
                <div className="inline-flex h-6 w-6 rounded-full bg-tertiary-container/30 ring-2 ring-surface-container-lowest border border-tertiary-container/40 text-[10px] text-tertiary-container items-center justify-center font-bold">MK</div>
                <div className="inline-flex h-6 w-6 rounded-full bg-secondary-fixed/20 ring-2 ring-surface-container-lowest border border-secondary-fixed/40 text-[10px] text-secondary-fixed items-center justify-center font-bold">RL</div>
              </div>
              <span>Joined by 12,000+ registered athletes this month</span>
            </div>
          </div>
        </section>
        
        {/* BEGIN: RightFormSide (55%-50% split) */}
        <section aria-label="Registration Portal" className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-14 py-10 lg:py-12 overflow-y-auto no-scrollbar relative bg-surface">
          {/* Ambient Glow Behind Form */}
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary-container/5 rounded-full blur-[100px] pointer-events-none z-0" />
          
          <div className="w-full max-w-xl mx-auto relative z-10">
            {/* Navigation Header */}
            <header className="mb-8">
              <a className="inline-flex items-center text-xs font-mono text-on-surface-variant hover:text-primary-container transition-colors duration-200 group mb-4" href="/login">
                <span className="material-symbols-outlined text-[16px] mr-1 transition-transform duration-200 group-hover:-translate-x-1">arrow_back</span>
                BACK TO LOGIN
              </a>
              <div className="flex items-baseline gap-3">
                <h1 className="text-3xl sm:text-4xl font-headline-lg text-on-surface tracking-tight">
                  Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-fixed-dim">The SportNexus</span>
                </h1>
              </div>
              <p className="font-body-sm text-on-surface-variant mt-2">
                Create your athlete passport or register your facility to unlock verified tournaments and smart matches.
              </p>
            </header>
            
            {/* Registration Glass Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-[0_8px_30px_rgb(0,0,0,0.4)] bg-surface-container/40">
              
              {/* Role Selector (Segmented Cards) */}
              <div className="mb-6">
                <label className="block font-label-sm uppercase tracking-wider text-on-surface-variant mb-2.5">
                  Select Profile Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: Player */}
                  <button onClick={() => setRole('player')} className={`group relative flex flex-col p-3.5 rounded-xl border text-left transition-all duration-200 focus:outline-none ${role === 'player' ? 'border-primary-container bg-primary-container/10 shadow-[0_0_15px_rgba(0,229,255,0.15)]' : 'border-outline-variant/40 bg-surface-container-low hover:border-outline-variant'}`} type="button">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${role === 'player' ? 'bg-primary-container/20 border-primary-container/40 text-primary-container' : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant group-hover:text-on-surface'}`}>
                        <span className="material-symbols-outlined text-[16px]">sports_tennis</span>
                      </div>
                      <span className={`text-[10px] font-mono tracking-wider font-semibold px-2 py-0.5 rounded-full border ${role === 'player' ? 'text-primary-container bg-primary-container/20 border-primary-container/40' : 'text-on-surface-variant bg-surface-container-high border-outline-variant/30'}`}>
                        COMPETE & LFG
                      </span>
                    </div>
                    <div className={`font-headline-sm text-sm ${role === 'player' ? 'text-on-surface' : 'text-on-surface-variant'}`}>I am a Player</div>
                    <div className="font-body-sm text-[11px] text-on-surface-variant leading-tight mt-0.5">Find games, rank up & join ladders</div>
                  </button>
                  
                  {/* Option 2: Court Owner */}
                  <button onClick={() => setRole('owner')} className={`group relative flex flex-col p-3.5 rounded-xl border text-left transition-all duration-200 focus:outline-none ${role === 'owner' ? 'border-primary-container bg-primary-container/10 shadow-[0_0_15px_rgba(0,229,255,0.15)]' : 'border-outline-variant/40 bg-surface-container-low hover:border-outline-variant'}`} type="button">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${role === 'owner' ? 'bg-primary-container/20 border-primary-container/40 text-primary-container' : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant group-hover:text-on-surface'}`}>
                        <span className="material-symbols-outlined text-[16px]">domain</span>
                      </div>
                      <span className={`text-[10px] font-mono tracking-wider font-medium px-2 py-0.5 rounded-full border ${role === 'owner' ? 'text-primary-container bg-primary-container/20 border-primary-container/40' : 'text-on-surface-variant bg-surface-container-high border-outline-variant/30'}`}>
                        MONETIZE
                      </span>
                    </div>
                    <div className={`font-headline-sm text-sm ${role === 'owner' ? 'text-on-surface' : 'text-on-surface-variant'}`}>I am a Court Owner</div>
                    <div className="font-body-sm text-[11px] text-on-surface-variant leading-tight mt-0.5">Smart court gates & booking fees</div>
                  </button>
                </div>
              </div>
              
              {/* Form Fields */}
              <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); navigate('/onboarding') }}>
                {/* Full Name Field */}
                <div>
                  <label className="block font-label-sm uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="full-name">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary-container transition-colors">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <input className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder-outline font-body-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all duration-150 outline-none" id="full-name" placeholder="e.g., Hoang An" required type="text" />
                  </div>
                </div>
                
                {/* Email Field */}
                <div>
                  <label className="block font-label-sm uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary-container transition-colors">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </div>
                    <input className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder-outline font-body-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all duration-150 outline-none" id="email" placeholder="athlete@kinetic.io" required type="email" />
                  </div>
                </div>
                
                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-label-sm uppercase tracking-wider text-on-surface-variant" htmlFor="password">
                      Password
                    </label>
                    <span className="text-[11px] font-mono text-primary-container">Strong</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary-container transition-colors">
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </div>
                    <input className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder-outline font-body-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all duration-150 outline-none" id="password" placeholder="Enter secure password" required type={passwordVisible ? 'text' : 'password'} />
                    {/* Show / Hide Password Toggle */}
                    <button aria-label="Toggle password visibility" className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary-container transition-colors" onClick={() => setPasswordVisible(!passwordVisible)} type="button">
                      <span className="material-symbols-outlined text-[18px]">{passwordVisible ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {/* Password Strength Indicator Bars */}
                  <div aria-hidden="true" className="mt-2 grid grid-cols-3 gap-1.5">
                    <div className="h-1 rounded-full bg-primary-container transition-colors" />
                    <div className="h-1 rounded-full bg-primary-container transition-colors" />
                    <div className="h-1 rounded-full bg-primary-container transition-colors" />
                  </div>
                </div>
                
                {/* Confirm Password Field */}
                <div>
                  <label className="block font-label-sm uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary-container transition-colors">
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    </div>
                    <input className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder-outline font-body-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all duration-150 outline-none" id="confirm-password" placeholder="Repeat secure password" required type={passwordVisible ? 'text' : 'password'} />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-fixed pointer-events-none">
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                  </div>
                </div>
                
                {/* Agreement Checkbox */}
                <div className="pt-1 flex items-start group cursor-pointer" onClick={() => document.getElementById('terms').click()}>
                  <div className="flex items-center h-5">
                    <input defaultChecked className="w-4 h-4 rounded bg-surface-container border-outline-variant text-primary-container focus:ring-primary-container focus:ring-offset-surface cursor-pointer" id="terms" name="terms" type="checkbox" onClick={e => e.stopPropagation()} />
                  </div>
                  <label className="ml-2.5 text-xs text-on-surface-variant leading-snug cursor-pointer group-hover:text-on-surface transition-colors" htmlFor="terms" onClick={e => e.preventDefault()}>
                    I agree to the SportNexus{' '}
                    <span className="text-primary-container hover:underline">Terms of Service</span>,{' '}
                    <span className="text-primary-container hover:underline">Fairplay Protocol</span>, and{' '}
                    <span className="text-primary-container hover:underline">Privacy Policy</span>.
                  </label>
                </div>
                
                {/* Primary Create Account Button */}
                <div className="pt-2">
                  <button className="w-full py-3.5 px-6 rounded-xl font-headline-sm font-bold text-sm tracking-wide text-on-primary-container bg-primary-container hover:bg-primary-fixed shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2" type="submit">
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                    <span>CREATE ACCOUNT</span>
                  </button>
                </div>
              </form>
              
              {/* Social Divider */}
              <div className="my-6 relative flex py-1 items-center">
                <div className="flex-grow border-t border-outline-variant/30" />
                <span className="flex-shrink mx-4 font-label-sm uppercase tracking-widest text-outline">Or register with</span>
                <div className="flex-grow border-t border-outline-variant/30" />
              </div>
              
              {/* Social Auth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 hover:border-outline hover:bg-surface-container transition-colors font-label-md text-on-surface" type="button">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" fill="#EA4335" />
                    <path d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" fill="#4285F4" />
                    <path d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" fill="#FBBC05" />
                    <path d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z" fill="#34A853" />
                  </svg>
                  <span>Google</span>
                </button>
                <button className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 hover:border-outline hover:bg-surface-container transition-colors font-label-md text-on-surface" type="button">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.95 1.07.08 2.16-.54 2.79-1.29z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            </div>
            
            {/* Bottom Sign In & Security Badges */}
            <footer className="mt-6 text-center space-y-3">
              <p className="font-body-sm text-on-surface-variant">
                Already have an athlete passport? 
                <a className="text-primary-container font-headline-sm text-sm hover:underline ml-1" href="/login">Sign In</a>
              </p>
              <div className="flex items-center justify-center gap-3 font-label-sm text-outline tracking-wider">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary-fixed">lock</span>
                  256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary-container">shield</span>
                  Smart Escrow Ready
                </span>
              </div>
            </footer>
            
          </div>
        </section>
      </main>
    </>
  )
}

export default Register
