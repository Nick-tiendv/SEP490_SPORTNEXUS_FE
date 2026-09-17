const loginPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Outfit:wght@600;700;800&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "outline": "#849396",
        "inverse-primary": "#006875",
        "surface-dim": "#0f131c",
        "primary-fixed-dim": "#00daf3",
        "on-primary-container": "#00626e",
        "primary-fixed": "#9cf0ff",
        "surface-container": "#1c2028",
        "error-container": "#93000a",
        "secondary": "#f5fff3",
        "surface-container-highest": "#31353e",
        "secondary-fixed-dim": "#00e478",
        "tertiary": "#e9ecff",
        "on-secondary-fixed": "#00210c",
        "surface-variant": "#31353e",
        "tertiary-container": "#c2cfff",
        "on-tertiary": "#002a78",
        "on-secondary": "#003919",
        "secondary-container": "#34ff8c",
        "on-tertiary-fixed": "#00174b",
        "surface-container-low": "#181c24",
        "on-tertiary-container": "#004ecf",
        "on-surface": "#dfe2ee",
        "primary-container": "#00e5ff",
        "tertiary-fixed": "#dbe1ff",
        "surface": "#0f131c",
        "on-error-container": "#ffdad6",
        "on-secondary-fixed-variant": "#005227",
        "inverse-on-surface": "#2c3039",
        "error": "#ffb4ab",
        "surface-container-high": "#262a33",
        "background": "#0f131c",
        "on-secondary-container": "#007239",
        "on-primary": "#00363d",
        "on-background": "#dfe2ee",
        "tertiary-fixed-dim": "#b4c5ff",
        "primary": "#c3f5ff",
        "on-primary-fixed": "#001f24",
        "surface-bright": "#353942",
        "secondary-fixed": "#60ff98",
        "outline-variant": "#3b494c",
        "on-error": "#690005",
        "surface-tint": "#00daf3",
        "on-tertiary-fixed-variant": "#003ea8",
        "on-surface-variant": "#bac9cc",
        "on-primary-fixed-variant": "#004f58",
        "inverse-surface": "#dfe2ee",
        "surface-container-lowest": "#0a0e16"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "space-lg": "1.5rem",
        "space-xs": "0.25rem",
        "gutter-sm": "0.75rem",
        "gutter": "1rem",
        "margin": "1.25rem",
        "space-md": "1rem",
        "margin-sm": "1rem",
        "space-sm": "0.5rem",
        "space-xl": "2rem",
        "margin-lg": "2rem"
      },
      "fontFamily": {
        "headline-lg": ["Outfit"],
        "display-lg-mobile": ["Outfit"],
        "label-md": ["Outfit"],
        "body-lg": ["Inter"],
        "headline-sm": ["Outfit"],
        "display-lg": ["Outfit"],
        "body-md": ["Inter"],
        "label-lg": ["Outfit"],
        "label-sm": ["Outfit"],
        "headline-md": ["Outfit"],
        "body-sm": ["Inter"]
      },
      "fontSize": {
        "headline-lg": ["28px", {"lineHeight": "34px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "display-lg-mobile": ["32px", {"lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "800"}],
        "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.06em", "fontWeight": "600"}],
        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "headline-sm": ["18px", {"lineHeight": "24px", "fontWeight": "600"}],
        "display-lg": ["44px", {"lineHeight": "48px", "letterSpacing": "-0.03em", "fontWeight": "800"}],
        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "label-lg": ["14px", {"lineHeight": "18px", "letterSpacing": "0.04em", "fontWeight": "600"}],
        "label-sm": ["10px", {"lineHeight": "12px", "letterSpacing": "0.08em", "fontWeight": "700"}],
        "headline-md": ["22px", {"lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "body-sm": ["12px", {"lineHeight": "16px", "fontWeight": "400"}]
      }
    }
  }
}</script></head><body class="bg-surface-container-lowest font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container relative min-h-screen"><div class="fixed inset-0 pointer-events-none overflow-hidden z-0"><div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary-container/5 rounded-full blur-[140px]"></div><div class="absolute -bottom-40 right-1/4 w-[600px] h-[450px] bg-secondary-container/5 rounded-full blur-[160px]"></div><div class="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#c3f5ff_1px,transparent_1px),linear-gradient(to_bottom,#c3f5ff_1px,transparent_1px)] bg-[size:4rem_4rem]"></div></div><div class="relative z-10 min-h-screen flex flex-col justify-between p-margin lg:p-margin-lg"><header class="w-full flex items-center justify-between"><a class="flex items-center gap-space-sm group" data-path="login" href="#"><div class="w-10 h-10 rounded-xl bg-surface-container-high/80 backdrop-blur-xl flex items-center justify-center shadow-[0_1px_8px_rgba(0,0,0,0.04)] group-hover:bg-surface-bright transition-all"><span class="material-symbols-outlined text-primary-container text-[24px]">bolt</span></div><div class="flex flex-col"><span class="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">SPORTNEXUS</span><span class="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase mt-0.5">KINETIC PORTAL</span></div></a><div class="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low/60 backdrop-blur-md"><span class="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span><span class="font-label-sm text-label-sm text-secondary-fixed-dim tracking-wider uppercase">ESCROW MESH ONLINE</span></div></header><main class="w-full flex items-center justify-center my-space-lg flex-1"><div class="flex flex-col w-full items-center justify-center relative">
<div class="absolute -top-24 -left-20 w-80 h-80 bg-primary-container/10 rounded-full blur-[100px] pointer-events-none"></div>
<div class="absolute -bottom-28 -right-20 w-96 h-96 bg-secondary-container/10 rounded-full blur-[110px] pointer-events-none"></div>
<div class="w-full max-w-lg relative z-10">
<div class="relative rounded-2xl bg-surface-container-low/80 backdrop-blur-2xl p-space-md sm:p-space-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
<div class="flex items-start justify-between gap-space-sm mb-space-md">
<div class="flex items-center gap-space-sm">
<div class="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center relative shadow-[0_0_20px_rgba(0,229,255,0.25)]">
<span class="material-symbols-outlined text-primary-container text-[26px]">sports_tennis</span>
<span class="absolute -top-1 -right-1 flex h-3 w-3">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
<span class="relative inline-flex rounded-full h-3 w-3 bg-secondary-container"></span>
</span>
</div>
<div>
<div class="flex items-center gap-1.5">
<span class="font-headline-sm text-headline-sm text-on-surface tracking-tight">SPORTNEXUS</span>
<span class="text-primary-container text-body-sm font-semibold tracking-wider">v3.8</span>
</div>
<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Kinetic Escrow Mesh</p>
</div>
</div>
<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest/60 backdrop-blur-md">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse"></span>
<span class="font-label-sm text-label-sm text-secondary tracking-wider uppercase">Live Grid</span>
</div>
</div>
<div class="mb-space-lg">
<h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">Welcome Back, Athlete</h1>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
          Authenticate to sync court telemetry, unlock active smart escrow matches, and resume ranking matches.
        </p>
</div>
<form class="space-y-space-md" id="auth-form" onsubmit="event.preventDefault(); handleAuthSubmit();">
<div class="space-y-1.5">
<label class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center justify-between" for="athlete-id">
<span>Athlete ID / Secure Email</span>
<span class="text-primary-container font-label-sm text-label-sm">BWF / WPT ID Sync</span>
</label>
<div class="relative group">
<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary-container transition-colors">
<span class="material-symbols-outlined text-[20px]">badge</span>
</div>
<input autocomplete="username" class="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container transition-all shadow-inner" id="athlete-id" name="athlete-id" placeholder="athlete@kinetic.io or #NX-8821" required="" type="text"/>
</div>
</div>
<div class="space-y-1.5">
<label class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center justify-between" for="athlete-pass">
<span>Key Passcode</span>
<a class="text-primary-container hover:text-primary transition-colors font-label-sm text-label-sm normal-case" href="#">Forgot passcode?</a>
</label>
<div class="relative group">
<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary-container transition-colors">
<span class="material-symbols-outlined text-[20px]">lock</span>
</div>
<input autocomplete="current-password" class="w-full pl-11 pr-11 py-3 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container transition-all shadow-inner" id="athlete-pass" name="athlete-pass" placeholder="••••••••••••••••" required="" type="password"/>
<button aria-label="Toggle password visibility" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none" id="toggle-pwd-btn" onclick="togglePasswordVisibility()" type="button">
<span class="material-symbols-outlined text-[20px]" id="toggle-pwd-icon">visibility</span>
</button>
</div>
</div>
<div class="flex items-center justify-between pt-1">
<label class="flex items-center gap-2.5 cursor-pointer select-none group">
<input checked="" class="peer sr-only" id="remember-me" name="remember-me" type="checkbox"/>
<div class="w-5 h-5 rounded bg-surface-container-lowest peer-checked:bg-primary-container flex items-center justify-center transition-all">
<span class="material-symbols-outlined text-on-primary-container text-[16px] scale-0 peer-checked:scale-100 transition-transform">check</span>
</div>
<span class="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface transition-colors">
              Keep telemetry session linked
            </span>
</label>
<span class="font-label-sm text-label-sm text-secondary-fixed-dim bg-surface-container-high px-2 py-0.5 rounded">
            256-AES
          </span>
</div>
<button class="w-full py-3.5 px-6 rounded-xl bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container font-label-lg text-label-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(52,255,140,0.35)] transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer" id="submit-btn" type="submit">
<span class="material-symbols-outlined text-[20px]">bolt</span>
<span>Access SportNexus Arena</span>
</button>
</form>
<div class="relative my-space-md flex items-center justify-center">
<div class="w-full h-px bg-surface-container-highest"></div>
<span class="absolute px-3 bg-surface-container-low font-label-sm text-label-sm text-outline uppercase tracking-widest">
          Hardware &amp; Passkey Gateway
        </span>
</div>
<div class="space-y-2.5">
<button class="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface font-label-md text-label-md uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer" onclick="triggerBiometricMock()" type="button">
<span class="material-symbols-outlined text-primary-container text-[18px]">fingerprint</span>
<span>Fast Passkey / Face ID Vault Sign-in</span>
</button>
<div class="grid grid-cols-2 gap-2.5">
<button class="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer" type="button">
<svg class="w-4 h-4 fill-current" viewbox="0 0 24 24">
<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"></path>
<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"></path>
</svg>
<span>Google Athlete</span>
</button>
<button class="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer" type="button">
<svg class="w-4 h-4 fill-current" viewbox="0 0 24 24">
<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.6-1.02.99-2.45.81-3.87-1.2.05-2.61.8-3.44 1.77-.55.64-.99 1.93-.81 3.33 1.34.1 2.66-.67 3.44-1.23z"></path>
</svg>
<span>Apple ID</span>
</button>
</div>
</div>
<div class="mt-space-md pt-space-sm text-center">
<p class="font-body-sm text-body-sm text-on-surface-variant">
          New to the competitive circuit?
          <a class="text-primary-container font-label-md text-label-md hover:underline ml-1" href="#">Claim Athlete Passport</a>
</p>
</div>
</div>
<div class="mt-space-md px-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-outline font-label-sm text-label-sm uppercase tracking-wider">
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[14px] text-primary-container">shield</span>
<span>Escrow Mesh Authenticated</span>
</div>
<div class="flex items-center gap-2">
<span>BWF Verified</span>
<span class="opacity-40">•</span>
<span>WPT Telemetry</span>
<span class="opacity-40">•</span>
<span class="text-secondary-fixed-dim">0ms Desync</span>
</div>
</div>
</div>
<script>
    function togglePasswordVisibility() {
      const input = document.getElementById('athlete-pass');
      const icon = document.getElementById('toggle-pwd-icon');
      if (!input || !icon) return;

      if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
      } else {
        input.type = 'password';
        icon.textContent = 'visibility';
      }
    }

    function triggerBiometricMock() {
      const btn = event.currentTarget;
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined text-primary-container text-[18px] animate-spin">progress_activity</span><span>Scanning Secure Biometrics...</span>';
      setTimeout(() => {
        btn.innerHTML = '<span class="material-symbols-outlined text-secondary-container text-[18px]">verified</span><span>Biometrics Accepted • Redirecting...</span>';
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 1800);
      }, 1200);
    }

    function handleAuthSubmit() {
      const btn = document.getElementById('submit-btn');
      if (!btn) return;
      const original = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span><span>Connecting To Vault Mesh...</span>';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>Portal Connected</span>';
        setTimeout(() => {
          btn.innerHTML = original;
          btn.disabled = false;
        }, 2000);
      }, 1400);
    }
  </script>
</div></main><footer class="w-full flex flex-col sm:flex-row items-center justify-between gap-space-sm py-space-sm"><div class="flex items-center gap-space-md"><div class="flex items-center gap-space-xs text-on-surface-variant"><span class="material-symbols-outlined text-[16px] text-primary">lock</span><span class="font-label-sm text-label-sm tracking-wider uppercase">256-Bit Encrypted</span></div><div class="flex items-center gap-space-xs text-on-surface-variant"><span class="material-symbols-outlined text-[16px] text-secondary-fixed-dim">verified_user</span><span class="font-label-sm text-label-sm tracking-wider uppercase">Smart Escrow Auth</span></div></div><div class="flex items-center gap-space-md text-on-surface-variant"><a class="font-label-sm text-label-sm hover:text-on-surface transition-colors uppercase tracking-wider" data-path="terms-of-service" href="#">Terms</a><span class="font-label-sm text-label-sm opacity-40">/</span><a class="font-label-sm text-label-sm hover:text-on-surface transition-colors uppercase tracking-wider" data-path="privacy-protocol" href="#">Privacy Protocol</a><span class="font-label-sm text-label-sm opacity-40">/</span><span class="font-label-sm text-label-sm uppercase tracking-wider opacity-60">© 2025 The Kinetic</span></div></footer></div></body></html>`

function Login() {
  return <iframe title="SportNexus Login" srcDoc={loginPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default Login