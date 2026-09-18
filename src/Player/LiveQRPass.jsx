const liveQRPassPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Outfit:wght@600;700;800&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "surface-bright": "#353942",
        "on-tertiary": "#002a78",
        "surface-dim": "#0f131c",
        "on-secondary": "#003919",
        "tertiary-fixed-dim": "#b4c5ff",
        "on-primary-fixed": "#001f24",
        "on-secondary-fixed": "#00210c",
        "on-primary-fixed-variant": "#004f58",
        "primary-fixed": "#9cf0ff",
        "error": "#ffb4ab",
        "secondary-fixed-dim": "#00e478",
        "on-primary-container": "#00626e",
        "tertiary-container": "#c2cfff",
        "inverse-surface": "#dfe2ee",
        "inverse-primary": "#006875",
        "on-secondary-fixed-variant": "#005227",
        "on-primary": "#00363d",
        "tertiary-fixed": "#dbe1ff",
        "surface-tint": "#00daf3",
        "surface-container": "#1c2028",
        "primary": "#c3f5ff",
        "surface-container-highest": "#31353e",
        "outline-variant": "#3b494c",
        "background": "#0f131c",
        "on-tertiary-fixed": "#00174b",
        "on-error": "#690005",
        "on-surface": "#dfe2ee",
        "surface": "#0f131c",
        "secondary": "#f5fff3",
        "secondary-container": "#34ff8c",
        "on-secondary-container": "#007239",
        "surface-container-high": "#262a33",
        "on-tertiary-fixed-variant": "#003ea8",
        "surface-variant": "#31353e",
        "surface-container-low": "#181c24",
        "on-background": "#dfe2ee",
        "on-surface-variant": "#bac9cc",
        "surface-container-lowest": "#0a0e16",
        "outline": "#849396",
        "tertiary": "#e9ecff",
        "secondary-fixed": "#60ff98",
        "error-container": "#93000a",
        "inverse-on-surface": "#2c3039",
        "primary-container": "#00e5ff",
        "on-tertiary-container": "#004ecf",
        "on-error-container": "#ffdad6",
        "primary-fixed-dim": "#00daf3"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "space-xs": "0.25rem",
        "gutter": "1rem",
        "space-sm": "0.5rem",
        "margin-sm": "1rem",
        "space-xl": "2rem",
        "margin-lg": "2rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "gutter-sm": "0.75rem",
        "margin": "1.25rem"
      },
      "fontFamily": {
        "headline-lg": [
          "Outfit"
        ],
        "label-md": [
          "Outfit"
        ],
        "headline-sm": [
          "Outfit"
        ],
        "display-lg": [
          "Outfit"
        ],
        "label-sm": [
          "Outfit"
        ],
        "label-lg": [
          "Outfit"
        ],
        "display-lg-mobile": [
          "Outfit"
        ],
        "headline-md": [
          "Outfit"
        ],
        "body-md": [
          "Inter"
        ],
        "body-sm": [
          "Inter"
        ],
        "body-lg": [
          "Inter"
        ]
      },
      "fontSize": {
        "headline-lg": [
          "28px",
          {
            "lineHeight": "34px",
            "letterSpacing": "-0.02em",
            "fontWeight": "700"
          }
        ],
        "label-md": [
          "12px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0.06em",
            "fontWeight": "600"
          }
        ],
        "headline-sm": [
          "18px",
          {
            "lineHeight": "24px",
            "fontWeight": "600"
          }
        ],
        "display-lg": [
          "44px",
          {
            "lineHeight": "48px",
            "letterSpacing": "-0.03em",
            "fontWeight": "800"
          }
        ],
        "label-sm": [
          "10px",
          {
            "lineHeight": "12px",
            "letterSpacing": "0.08em",
            "fontWeight": "700"
          }
        ],
        "label-lg": [
          "14px",
          {
            "lineHeight": "18px",
            "letterSpacing": "0.04em",
            "fontWeight": "600"
          }
        ],
        "display-lg-mobile": [
          "32px",
          {
            "lineHeight": "36px",
            "letterSpacing": "-0.02em",
            "fontWeight": "800"
          }
        ],
        "headline-md": [
          "22px",
          {
            "lineHeight": "28px",
            "letterSpacing": "-0.01em",
            "fontWeight": "600"
          }
        ],
        "body-md": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "400"
          }
        ],
        "body-sm": [
          "12px",
          {
            "lineHeight": "16px",
            "fontWeight": "400"
          }
        ],
        "body-lg": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "400"
          }
        ]
      }
    }
  }
}</script><style>img[alt^="SportNexus logo mark"]{display:none!important}</style></head><body class="bg-background font-body-md text-on-surface antialiased min-h-screen"><header class="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div class="h-16 w-full px-margin-lg flex items-center justify-between gap-gutter"><div class="flex items-center gap-space-lg"><div class="flex items-center gap-space-sm"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg"/><span class="font-headline-sm text-headline-sm text-on-surface tracking-tight">SPORT<span class="text-primary-container">NEXUS</span></span></div><nav class="hidden xl:flex items-center gap-space-xs" data-active-classes="bg-surface-container-high text-on-surface rounded-lg"><a class="font-label-lg text-label-lg px-space-md py-space-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="dashboard" href="#">Dashboard</a><a class="font-label-lg text-label-lg px-space-md py-space-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="courts-and-bookings" href="#">Courts &amp; Bookings</a><a aria-current="page" class="font-label-lg px-space-md py-space-sm transition-colors bg-surface-container-high text-on-surface rounded-lg" data-path="qr-access-pass" href="#">QR Access Pass</a><a class="font-label-lg text-label-lg px-space-md py-space-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="matches-and-lfg" href="#">Matches &amp; LFG</a><a class="font-label-lg text-label-lg px-space-md py-space-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="wallet" href="#">Wallet</a></nav></div><div class="flex items-center gap-space-md"><div class="hidden sm:flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container-low rounded-full"><span class="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span><span class="font-label-sm text-label-sm text-secondary-container uppercase tracking-wider">18ms</span><span class="font-label-sm text-label-sm text-on-surface-variant">US-EAST</span></div><button class="p-space-sm rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">notifications</span></button><div class="flex items-center gap-space-sm pl-space-xs"><div class="flex flex-col items-end hidden md:flex"><span class="font-label-md text-label-md text-on-surface">Alex Vance</span><span class="font-label-sm text-label-sm text-primary-container">PRO TIER</span></div><img alt="Profile" class="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/></div></div></div></header><main class="w-full pt-16 bg-surface"><div class="flex flex-col w-full">
<div class="relative w-full overflow-hidden px-margin-lg py-space-xl">
<div class="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-primary-container/15 via-primary-fixed-dim/5 to-transparent blur-3xl opacity-60"></div>
<div class="pointer-events-none absolute top-1/3 -right-24 w-80 h-80 bg-secondary-container/10 blur-3xl rounded-full"></div>
<div class="relative z-10 max-w-7xl mx-auto flex flex-col gap-space-xl">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b-0 pb-2">
<div class="flex flex-col gap-space-xs">
<div class="flex items-center gap-space-sm">
<span class="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high text-primary-container font-label-sm text-label-sm uppercase tracking-widest">
<span class="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
              Secure Beacon Active
            </span>
<span class="font-label-sm text-label-sm text-on-surface-variant tracking-wider">PROTOCOL NX-SEC-V4</span>
</div>
<h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">Your Access Pass</h1>
<p class="font-body-md text-body-md text-on-surface-variant max-w-xl">
            Dynamic Rolling Cryptographic Token • Verified Gate Access Turnstiles B1–B6
          </p>
</div>
<div class="flex items-center gap-space-md bg-surface-container-low px-space-md py-space-sm rounded-xl">
<div class="flex flex-col items-start">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Biometric Link</span>
<span class="font-label-md text-label-md text-secondary-fixed flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">fingerprint</span> Encrypted Ready
            </span>
</div>
<div class="h-6 w-px bg-surface-container-highest"></div>
<div class="flex flex-col items-start">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Terminal Node</span>
<span class="font-label-md text-label-md text-primary-container font-mono">B3-NORTH-TX</span>
</div>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
<div class="lg:col-span-7 flex flex-col items-center">
<div class="w-full max-w-md relative group">
<div class="absolute -inset-1 rounded-2xl bg-gradient-to-b from-primary-container/30 via-primary-fixed-dim/10 to-transparent blur-md group-hover:blur-lg transition-all duration-500"></div>
<div class="relative bg-surface-container-low/95 rounded-2xl p-space-lg shadow-2xl flex flex-col items-center backdrop-blur-2xl">
<div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary-container/80"></div>
<div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-primary-container/80"></div>
<div class="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-primary-container/80"></div>
<div class="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary-container/80"></div>
<div class="w-full flex items-center justify-between pb-space-md mb-space-md">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary-container text-[20px]">stream</span>
<span class="font-label-md text-label-md text-on-surface tracking-wider uppercase">SPORTNEXUS PASSKEY</span>
</div>
<div class="flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-highest">
<span class="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
<span class="font-label-sm text-label-sm text-secondary-fixed">LIVE REFRESH</span>
</div>
</div>
<div class="relative w-64 h-64 bg-surface-container-lowest rounded-xl p-space-md flex items-center justify-center overflow-hidden group/qr">
<div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,229,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,229,255,0.05)_1px,transparent_1px)] bg-[size:12px_12px]"></div>
<div class="absolute -inset-y-2 w-full bg-gradient-to-b from-transparent via-primary-container/20 to-transparent animate-[bounce_3s_infinite] pointer-events-none opacity-80"></div>
<div class="absolute top-0 left-0 right-0 h-0.5 bg-primary-container shadow-[0_0_12px_#00e5ff] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
<svg class="w-52 h-52 text-primary-container relative z-10 drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]" fill="currentColor" viewbox="0 0 100 100">
<rect fill="none" height="26" rx="4" stroke="currentColor" stroke-width="4" width="26" x="5" y="5"></rect>
<rect fill="currentColor" height="14" rx="2" width="14" x="11" y="11"></rect>
<rect fill="none" height="26" rx="4" stroke="currentColor" stroke-width="4" width="26" x="69" y="5"></rect>
<rect fill="currentColor" height="14" rx="2" width="14" x="75" y="11"></rect>
<rect fill="none" height="26" rx="4" stroke="currentColor" stroke-width="4" width="26" x="5" y="69"></rect>
<rect fill="currentColor" height="14" rx="2" width="14" x="11" y="75"></rect>
<rect height="6" rx="1" width="6" x="38" y="8"></rect>
<rect height="6" rx="1" width="8" x="48" y="8"></rect>
<rect height="6" rx="1" width="6" x="42" y="18"></rect>
<rect height="6" rx="1" width="10" x="52" y="18"></rect>
<rect height="6" rx="1" width="6" x="8" y="38"></rect>
<rect height="6" rx="1" width="12" x="18" y="42"></rect>
<rect height="6" rx="1" width="8" x="8" y="52"></rect>
<rect height="10" rx="2" width="10" x="38" y="38"></rect>
<rect height="8" rx="1" width="8" x="52" y="38"></rect>
<rect height="6" rx="1" width="6" x="64" y="38"></rect>
<rect height="12" rx="1" width="6" x="42" y="52"></rect>
<rect height="6" rx="1" width="12" x="52" y="50"></rect>
<rect height="8" rx="1" width="8" x="68" y="48"></rect>
<rect height="6" rx="1" width="12" x="80" y="38"></rect>
<rect height="14" rx="1" width="6" x="86" y="48"></rect>
<rect height="10" rx="1" width="6" x="38" y="68"></rect>
<rect height="6" rx="1" width="12" x="48" y="74"></rect>
<rect height="8" rx="1" width="8" x="64" y="68"></rect>
<rect height="6" rx="1" width="6" x="76" y="68"></rect>
<rect height="12" rx="1" width="6" x="86" y="68"></rect>
<rect height="8" rx="1" width="8" x="48" y="84"></rect>
<rect height="6" rx="1" width="14" x="60" y="82"></rect>
<rect height="8" rx="1" width="14" x="78" y="84"></rect>
</svg>
<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
<div class="w-10 h-10 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-center text-primary-container shadow-lg">
<span class="material-symbols-outlined text-[20px]">lock</span>
</div>
</div>
</div>
<div class="mt-space-md flex flex-col items-center gap-space-xs text-center w-full">
<span class="font-mono text-label-sm text-primary-container bg-surface-container px-space-md py-1 rounded-md tracking-wider select-all">
                  TOKEN #NX-8839-KYC-VERIFIED
                </span>
<span class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">shield</span> Anti-screenshot dynamic roll enabled
                </span>
</div>
<div class="mt-space-md pt-space-md w-full flex items-center justify-between bg-surface-container rounded-xl px-space-md py-space-sm">
<div class="flex items-center gap-space-sm">
<div class="relative w-8 h-8 flex items-center justify-center">
<svg class="w-8 h-8 transform -rotate-90" viewbox="0 0 36 36">
<path class="text-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3"></path>
<path class="text-primary-container transition-all duration-1000 ease-linear" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="100, 100" stroke-dashoffset="28" stroke-linecap="round" stroke-width="3"></path>
</svg>
<span class="material-symbols-outlined absolute text-primary-container text-[14px] animate-spin">refresh</span>
</div>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">Refreshes in <span class="text-primary-container font-mono" id="token-timer">29s</span></span>
<span class="font-label-sm text-label-sm text-on-surface-variant">SHA-256 Synchronized</span>
</div>
</div>
<button class="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-primary-container transition-colors" id="manual-refresh-btn" title="Force Token Re-sync">
<span class="material-symbols-outlined text-[18px]">sync</span>
</button>
</div>
<div class="mt-space-md w-full grid grid-cols-2 gap-space-sm">
<button class="flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all">
<span class="material-symbols-outlined text-[18px]">wallet</span>
                  Add to Wallet
                </button>
<button class="flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all">
<span class="material-symbols-outlined text-[18px]">share</span>
                  Share Escrow Pass
                </button>
</div>
</div>
</div>
<div class="mt-space-md flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-primary-container text-[16px]">sensors</span>
<span>Present screen at 15–20cm distance directly to Turnstile Scanner B3</span>
</div>
</div>
<div class="lg:col-span-5 flex flex-col gap-space-md">
<div class="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-md relative overflow-hidden">
<div class="flex items-start justify-between">
<div>
<span class="font-label-sm text-label-sm text-primary-container uppercase tracking-wider">Booked Session</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface mt-0.5">Kinetic Arena - Court 3</h2>
<span class="font-body-sm text-body-sm text-on-surface-variant">Level 2 • Synthetic Hydro-Cushion Surface</span>
</div>
<span class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-secondary-container/15 text-on-secondary-container font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse"></span>
                Check-in: Pending
              </span>
</div>
<div class="grid grid-cols-2 gap-space-sm bg-surface-container rounded-lg p-space-md">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Time Slot</span>
<span class="font-headline-sm text-headline-sm text-on-surface mt-1 font-mono">19:00 - 20:00</span>
<span class="font-label-sm text-label-sm text-primary-container mt-0.5 flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">timer</span> Starts in 16 mins
                </span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Assigned Locker</span>
<span class="font-headline-sm text-headline-sm text-on-surface mt-1 font-mono">#L-42</span>
<span class="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Auto-unlocked upon entry</span>
</div>
</div>
<div class="flex items-center gap-space-sm pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[18px] text-on-surface">info</span>
<span>Court lights auto-activate at 18:55. Early access opens 10m prior to match start.</span>
</div>
</div>
<div class="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between gap-space-md">
<div class="flex items-center gap-space-md">
<div class="relative">
<img class="w-12 h-12 rounded-full object-cover" data-alt="Futuristic competitive athlete male profile headshot in dark high-tech athletic gear with subtle neon cyber lighting reflections in cyan and deep navy, studio portrait style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSZBA4Zm41gZv4FvPh9rdwkA3BXML43la2-OC5d5B3zGcyigbAst9DtpM8vyDnTh2zwOOVty_A-SGWR_QUMfxaR97c93cZaH1eN-MwklTnmKSuDctqSwX3yJ48Ml1H0fCkjIyt6pUDMFLNvALW2DJamADKU-l4GGtBHQ1Jcm07f1cGx_b3dtUZZ9MVUY8E0MecAORYbk_zNLyFXchr91x_bgE30xkmMmU_EfpFN8HFwxGwiNV1jI8d"/>
<span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-secondary-container border-2 border-surface-container-low"></span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-space-xs">
<span class="font-label-lg text-label-lg text-on-surface">Hoang An</span>
<span class="material-symbols-outlined text-primary-container text-[16px]">verified</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Tier 1 Verified Athlete • ELO 1840</span>
<span class="font-label-sm text-label-sm text-secondary-fixed">NFC Auto-Handshake Enabled</span>
</div>
</div>
<div class="p-2 rounded-lg bg-surface-container text-primary-container">
<span class="material-symbols-outlined text-[24px]">contactless</span>
</div>
</div>
<div class="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-md">
<div class="flex items-center justify-between">
<span class="font-label-md text-label-md text-on-surface uppercase tracking-wider flex items-center gap-1.5">
<span class="material-symbols-outlined text-primary-container text-[18px]">dns</span> Gate Telemetry
              </span>
<span class="font-label-sm text-label-sm text-secondary-fixed flex items-center gap-1">
<span class="w-2 h-2 rounded-full bg-secondary-fixed"></span> 9ms Latency
              </span>
</div>
<div class="space-y-space-sm font-label-md text-label-md">
<div class="flex items-center justify-between py-1.5 border-b-0 bg-surface-container/60 px-space-sm rounded-lg">
<span class="text-on-surface-variant">Gate Sector</span>
<span class="text-on-surface font-medium">Gate 4 • North Concourse</span>
</div>
<div class="flex items-center justify-between py-1.5 border-b-0 bg-surface-container/60 px-space-sm rounded-lg">
<span class="text-on-surface-variant">Active Turnstile</span>
<span class="text-secondary-fixed font-mono font-medium">Scanner B3 [READY]</span>
</div>
<div class="flex items-center justify-between py-1.5 border-b-0 bg-surface-container/60 px-space-sm rounded-lg">
<span class="text-on-surface-variant">Sensor Firmware</span>
<span class="text-on-surface font-mono">v4.18.2-SECURE</span>
</div>
</div>
<div class="pt-space-xs">
<button class="w-full py-space-sm px-space-md rounded-lg bg-surface-container hover:bg-error-container/20 text-error font-label-md text-label-md transition-colors flex items-center justify-center gap-space-xs">
<span class="material-symbols-outlined text-[18px]">emergency</span>
                Emergency Turnstile Buzzer
              </button>
</div>
</div>
</div>
</div>
<div class="mt-space-md grid grid-cols-1 md:grid-cols-3 gap-space-md">
<div class="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-md">
<div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container shrink-0">
<span class="material-symbols-outlined text-[20px]">wifi_tethering</span>
</div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface truncate">High Speed Offline Mode</span>
<span class="font-body-sm text-body-sm text-on-surface-variant truncate">Cached crypto seed valid for 3 hours</span>
</div>
</div>
<div class="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-md">
<div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary-fixed shrink-0">
<span class="material-symbols-outlined text-[20px]">groups</span>
</div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface truncate">Squad Access</span>
<span class="font-body-sm text-body-sm text-on-surface-variant truncate">2 of 4 guest tokens scanned at Gate 4</span>
</div>
</div>
<div class="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-md">
<div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container shrink-0">
<span class="material-symbols-outlined text-[20px]">directions_run</span>
</div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface truncate">Next Match Ready</span>
<span class="font-body-sm text-body-sm text-on-surface-variant truncate">Court 3 ball machine set to Drill 04</span>
</div>
</div>
</div>
</div>
</div>
<script>
    (function() {
      let secondsRemaining = 29;
      const timerElement = document.getElementById('token-timer');
      const manualBtn = document.getElementById('manual-refresh-btn');

      function updateCountdown() {
        if (!timerElement) return;
        secondsRemaining--;
        if (secondsRemaining <= 0) {
          secondsRemaining = 30;
          timerElement.parentElement.classList.add('opacity-50');
          setTimeout(() => {
            timerElement.parentElement.classList.remove('opacity-50');
          }, 300);
        }
        timerElement.textContent = secondsRemaining + 's';
      }

      const timerInterval = setInterval(updateCountdown, 1000);

      if (manualBtn) {
        manualBtn.addEventListener('click', function() {
          secondsRemaining = 30;
          if (timerElement) timerElement.textContent = '30s';
          this.classList.add('rotate-180');
          setTimeout(() => {
            this.classList.remove('rotate-180');
          }, 400);
        });
      }
    })();
  </script>
</div></main><footer class="w-full bg-surface-container-low py-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div class="w-full px-margin-lg flex flex-col md:flex-row items-center justify-between gap-gutter"><div class="flex items-center gap-space-sm"><span class="font-label-md text-label-md text-on-surface-variant">© 2024 SportNexus Technologies Inc. High-velocity athletic network.</span></div><div class="flex items-center gap-space-lg"><a class="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Telemetry Status</a><a class="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Court API</a><a class="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms of Competition</a></div></div></footer></body></html>`

function LiveQRPass() {
  return <iframe title="SportNexus LiveQRPass" srcDoc={liveQRPassPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default LiveQRPass
