const forgotPasswordPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config={darkMode:"class",theme:{extend:{"colors":{"on-surface":"#dfe2ee","outline":"#849396","tertiary-fixed":"#dbe1ff","secondary-fixed":"#60ff98","on-secondary":"#003919","on-surface-variant":"#bac9cc","on-background":"#dfe2ee","surface-container-lowest":"#0a0e16","on-tertiary-fixed-variant":"#003ea8","background":"#0f131c","tertiary":"#e9ecff","tertiary-container":"#c2cfff","surface":"#0f131c","on-primary-container":"#00626e","on-primary-fixed-variant":"#004f58","on-tertiary-container":"#004ecf","surface-dim":"#0f131c","outline-variant":"#3b494c","inverse-primary":"#006875","tertiary-fixed-dim":"#b4c5ff","primary-container":"#00e5ff","surface-container":"#1c2028","secondary-container":"#34ff8c","on-primary":"#00363d","secondary-fixed-dim":"#00e478","surface-container-highest":"#31353e","error-container":"#93000a","surface-tint":"#00daf3","primary-fixed":"#9cf0ff","surface-bright":"#353942","on-primary-fixed":"#001f24","on-secondary-fixed":"#00210c","surface-container-low":"#181c24","error":"#ffb4ab","surface-container-high":"#262a33","surface-variant":"#31353e","on-tertiary-fixed":"#00174b","on-error":"#690005","primary":"#c3f5ff","on-error-container":"#ffdad6","inverse-on-surface":"#2c3039","on-secondary-container":"#007239","secondary":"#f5fff3","primary-fixed-dim":"#00daf3","on-secondary-fixed-variant":"#005227","on-tertiary":"#002a78","inverse-surface":"#dfe2ee"},"borderRadius":{"DEFAULT":"0.25rem","lg":"0.5rem","xl":"0.75rem","full":"9999px"},"spacing":{"margin-sm":"1rem","space-md":"1rem","space-sm":"0.5rem","space-lg":"1.5rem","gutter-sm":"0.75rem","margin-lg":"2rem","space-xs":"0.25rem","margin":"1.25rem","gutter":"1rem","space-xl":"2rem"},"fontFamily":{"headline-sm":["Outfit"],"display-lg-mobile":["Outfit"],"label-lg":["Outfit"],"label-md":["Outfit"],"label-sm":["Outfit"],"body-lg":["Inter"],"headline-lg":["Outfit"],"headline-md":["Outfit"],"display-lg":["Outfit"],"body-md":["Inter"],"body-sm":["Inter"]},"fontSize":{"headline-sm":["18px",{"lineHeight":"24px","fontWeight":"600"}],"display-lg-mobile":["32px",{"lineHeight":"36px","letterSpacing":"-0.02em","fontWeight":"800"}],"label-lg":["14px",{"lineHeight":"18px","letterSpacing":"0.04em","fontWeight":"600"}],"label-md":["12px",{"lineHeight":"16px","letterSpacing":"0.06em","fontWeight":"600"}],"label-sm":["10px",{"lineHeight":"12px","letterSpacing":"0.08em","fontWeight":"700"}],"body-lg":["16px",{"lineHeight":"24px","fontWeight":"400"}],"headline-lg":["28px",{"lineHeight":"34px","letterSpacing":"-0.02em","fontWeight":"700"}],"headline-md":["22px",{"lineHeight":"28px","letterSpacing":"-0.01em","fontWeight":"600"}],"display-lg":["44px",{"lineHeight":"48px","letterSpacing":"-0.03em","fontWeight":"800"}],"body-md":["14px",{"lineHeight":"20px","fontWeight":"400"}],"body-sm":["12px",{"lineHeight":"16px","fontWeight":"400"}]}}}};</script><style>img[alt^="SportNexus logo mark"]{display:none!important}</style></head><body class="bg-surface font-body-md text-on-surface min-h-screen relative flex flex-col justify-between selection:bg-primary-container selection:text-on-primary"><div class="fixed inset-0 pointer-events-none bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]"></div><div class="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(0,229,255,0.06),transparent_60%)]"></div><header class="w-full z-20 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div class="h-16 max-w-7xl mx-auto px-margin lg:px-margin-lg flex items-center justify-between"><a class="flex items-center gap-space-sm group" data-path="login" href="#"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg"/><span class="font-headline-sm text-headline-sm tracking-tight text-on-surface uppercase">Sport<span class="text-primary-container">Nexus</span></span></a><div class="flex items-center gap-space-md"><div class="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm tracking-wider uppercase"><span class="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span><span>Protocol 8.4 Online</span></div></div></div></header><main class="w-full flex-1 flex flex-col items-center justify-center relative z-10 px-margin py-margin-lg"><div class="flex flex-col w-full items-center justify-center py-margin-lg px-margin">
<!-- Atmospheric Glow Accents Behind the Card -->
<div class="relative w-full max-w-lg flex items-center justify-center">
<div class="absolute -top-16 -left-12 w-64 h-64 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
<div class="absolute -bottom-16 -right-12 w-72 h-72 rounded-full bg-tertiary-container/10 blur-3xl pointer-events-none"></div>
<div class="absolute inset-0 bg-gradient-to-b from-primary-container/5 via-transparent to-secondary-container/5 rounded-2xl blur-xl pointer-events-none"></div>
<!-- Main Glassmorphism Authentication Shield Card -->
<div class="relative w-full bg-surface-container/60 backdrop-blur-xl rounded-2xl p-margin lg:p-space-xl shadow-2xl flex flex-col items-center text-center overflow-hidden">
<!-- Precision Top Refraction Highlight -->
<div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<!-- Athletic Telemetry Node Watermark -->
<div class="absolute top-4 right-5 flex items-center gap-space-xs text-on-surface-variant/40 font-label-sm text-label-sm uppercase tracking-widest pointer-events-none">
<span class="w-1.5 h-1.5 rounded-full bg-primary-container/50"></span>
<span>SEC-NODE 09</span>
</div>
<!-- Lock Emblem with Multi-Layered Neon Halo -->
<div class="relative mt-space-sm mb-space-lg flex items-center justify-center">
<div class="absolute inset-0 rounded-full bg-primary-container/20 blur-md animate-pulse"></div>
<div class="relative w-16 h-16 rounded-full bg-surface-container-high/80 flex items-center justify-center shadow-lg">
<span class="material-symbols-outlined text-primary-container text-[30px]" style="font-variation-settings: 'FILL' 1;">lock_reset</span>
</div>
<div class="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary-container/30 to-secondary-container/20 blur-xs -z-10"></div>
</div>
<!-- Card Title & Athletic Subtext -->
<h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">
        Reset Your <span class="text-primary-container">Password</span>
</h1>
<p class="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-xl">
        Enter your registered email address to receive a password reset link.
      </p>
<!-- Interactive Form Container -->
<form class="w-full flex flex-col gap-space-lg text-left" id="resetForm" onsubmit="event.preventDefault(); handleResetSubmit();">
<div class="flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<label class="font-label-md text-label-md uppercase tracking-wider text-on-surface" for="athleteIdentity">
              Athlete ID or Email
            </label>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
              Required
            </span>
</div>
<div class="relative flex items-center">
<span class="material-symbols-outlined absolute left-4 text-on-surface-variant text-[20px] pointer-events-none transition-colors duration-200" id="inputGlyph">
              alternate_email
            </span>
<input class="w-full bg-surface-container-lowest/80 text-on-surface font-body-md text-body-md rounded-xl pl-12 pr-4 py-3.5 outline-none placeholder:text-on-surface-variant/40 transition-all duration-200 focus:bg-surface-container-low shadow-inner" id="athleteIdentity" onblur="document.getElementById('inputGlyph').classList.remove('text-primary-container');" onfocus="document.getElementById('inputGlyph').classList.add('text-primary-container');" placeholder="e.g. athlete@kinetic.io" required="" type="text"/>
</div>
</div>
<!-- Submission Feedback Zone (Hidden by Default) -->
<div class="hidden w-full p-space-md rounded-xl bg-secondary-container/10 flex items-start gap-space-sm text-left" id="feedbackBanner">
<span class="material-symbols-outlined text-secondary-fixed-dim text-[20px] mt-0.5" style="font-variation-settings: 'FILL' 1;">check_circle</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-secondary-fixed-dim">Reset Link Dispatched</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Check your inbox for cryptographic access instructions.</span>
</div>
</div>
<!-- High-Velocity Neon Action Button -->
<button class="relative w-full group overflow-hidden bg-primary-container text-on-primary font-label-lg text-label-lg rounded-xl py-3.5 px-space-lg flex items-center justify-center gap-space-xs transition-all duration-200 hover:shadow-[0_0_24px_rgba(0,229,255,0.45)] active:scale-[0.99] cursor-pointer" id="submitBtn" type="submit">
<span class="relative z-10 font-bold uppercase tracking-wider">Send Reset Link</span>
<span class="material-symbols-outlined relative z-10 text-[18px] transition-transform duration-200 group-hover:translate-x-1">
            arrow_forward
          </span>
<!-- Ambient Button Sheen -->
<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
</button>
<!-- Secondary Navigation Return Link -->
<div class="flex items-center justify-center pt-space-xs">
<a class="group inline-flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary-container transition-colors duration-200 py-1" data-path="login" href="/login">
<span class="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-x-1">
              west
            </span>
<span>Back to Login</span>
</a>
</div>
</form>
<!-- Trust Metrics & Escrow Proof Badges -->
<div class="w-full mt-space-xl pt-space-lg bg-gradient-to-b from-surface-container-high/40 to-transparent rounded-xl p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
<div class="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-primary-container text-[16px]">
            enhanced_encryption
          </span>
<span>256-Bit SSL Encrypted Protocol</span>
</div>
<div class="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-secondary-fixed-dim text-[16px]">
            security
          </span>
<span>Instant Escrow Recovery Guard</span>
</div>
</div>
</div>
</div>
<!-- Micro-Interactive Form Handler Script -->
<script>
    function handleResetSubmit() {
      const btn = document.getElementById('submitBtn');
      const banner = document.getElementById('feedbackBanner');
      const input = document.getElementById('athleteIdentity');
      
      if (!input.value) return;

      btn.classList.add('opacity-75', 'pointer-events-none');
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>';

      setTimeout(() => {
        btn.classList.remove('opacity-75', 'pointer-events-none');
        btn.innerHTML = '<span class="font-bold uppercase tracking-wider">Dispatched</span><span class="material-symbols-outlined text-[18px]">done</span>';
        banner.classList.remove('hidden');
      }, 700);
    }
  </script>
</div></main><footer class="w-full z-20 bg-surface-container-lowest/60 backdrop-blur-md py-space-lg"><div class="max-w-7xl mx-auto px-margin lg:px-margin-lg flex flex-col md:flex-row items-center justify-between gap-space-md"><div class="flex items-center gap-space-sm text-on-surface-variant font-label-md text-label-md"><span class="material-symbols-outlined text-primary-container text-[16px]">verified_user</span><span>Telemetry Shielded • AES-256 Protocol</span></div><div class="flex items-center gap-space-lg"><a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="terms-of-service" href="#">Terms of Service</a><a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="privacy-policy" href="#">Security Protocol</a><a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="system-status" href="#">Node Status</a></div><div class="text-on-surface-variant font-label-sm text-label-sm">© 2025 SportNexus Inc. All rights reserved.</div></div></footer></body></html>


`
function ForgotPassword() {
  return <iframe title="SportNexus Forgot Password" srcDoc={forgotPasswordPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default ForgotPassword