const communityFeedPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Outfit:wght@600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base { html, body { margin: 0; padding: 0; } body { overscroll-behavior: none; } main > :first-child { margin-top: 0 !important; } main > :last-child { margin-bottom: 0 !important; } } ::-webkit-scrollbar { display: none; }</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config = { darkMode: "class", theme: { extend: { "colors": { "on-surface-variant": "#bac9cc", "tertiary-fixed-dim": "#b4c5ff", "on-primary": "#00363d", "on-tertiary-fixed": "#00174b", "primary-fixed": "#9cf0ff", "primary-container": "#00e5ff", "outline": "#849396", "secondary-container": "#34ff8c", "primary": "#c3f5ff", "on-secondary": "#003919", "on-error": "#690005", "inverse-on-surface": "#2c3039", "on-secondary-container": "#007239", "surface-container-highest": "#31353e", "surface-container-high": "#262a33", "surface-tint": "#00daf3", "secondary": "#f5fff3", "on-secondary-fixed-variant": "#005227", "surface-container-low": "#181c24", "tertiary": "#e9ecff", "error-container": "#93000a", "tertiary-fixed": "#dbe1ff", "background": "#0f131c", "inverse-surface": "#dfe2ee", "inverse-primary": "#006875", "tertiary-container": "#c2cfff", "on-primary-container": "#00626e", "on-tertiary-container": "#004ecf", "on-tertiary-fixed-variant": "#003ea8", "surface-bright": "#353942", "secondary-fixed-dim": "#00e478", "on-background": "#dfe2ee", "error": "#ffb4ab", "on-secondary-fixed": "#00210c", "outline-variant": "#3b494c", "on-error-container": "#ffdad6", "on-primary-fixed": "#001f24", "surface-dim": "#0f131c", "on-tertiary": "#002a78", "surface-variant": "#31353e", "on-surface": "#dfe2ee", "on-primary-fixed-variant": "#004f58", "surface": "#0f131c", "secondary-fixed": "#60ff98", "surface-container-lowest": "#0a0e16", "primary-fixed-dim": "#00daf3", "surface-container": "#1c2028" }, "borderRadius": { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" }, "spacing": { "gutter": "1rem", "space-lg": "1.5rem", "gutter-sm": "0.75rem", "margin": "1.25rem", "space-xl": "2rem", "space-sm": "0.5rem", "margin-lg": "2rem", "margin-sm": "1rem", "space-md": "1rem", "space-xs": "0.25rem" }, "fontFamily": { "label-lg": [ "Outfit" ], "display-lg": [ "Outfit" ], "body-sm": [ "Inter" ], "headline-md": [ "Outfit" ], "headline-sm": [ "Outfit" ], "label-md": [ "Outfit" ], "label-sm": [ "Outfit" ], "headline-lg": [ "Outfit" ], "body-md": [ "Inter" ], "display-lg-mobile": [ "Outfit" ], "body-lg": [ "Inter" ] }, "fontSize": { "label-lg": [ "14px", { "lineHeight": "18px", "letterSpacing": "0.04em", "fontWeight": "600" } ], "display-lg": [ "44px", { "lineHeight": "48px", "letterSpacing": "-0.03em", "fontWeight": "800" } ], "body-sm": [ "12px", { "lineHeight": "16px", "fontWeight": "400" } ], "headline-md": [ "22px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" } ], "headline-sm": [ "18px", { "lineHeight": "24px", "fontWeight": "600" } ], "label-md": [ "12px", { "lineHeight": "16px", "letterSpacing": "0.06em", "fontWeight": "600" } ], "label-sm": [ "10px", { "lineHeight": "12px", "letterSpacing": "0.08em", "fontWeight": "700" } ], "headline-lg": [ "28px", { "lineHeight": "34px", "letterSpacing": "-0.02em", "fontWeight": "700" } ], "body-md": [ "14px", { "lineHeight": "20px", "fontWeight": "400" } ], "display-lg-mobile": [ "32px", { "lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "800" } ], "body-lg": [ "16px", { "lineHeight": "24px", "fontWeight": "400" } ] } } } };</script><style>img[alt^="SportNexus logo mark"]{display:none!important}</style></head><body class="bg-background font-body-md text-on-surface min-h-screen"><header class="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]"><div class="h-20 w-full px-margin-lg flex items-center justify-between gap-space-lg"><div class="flex items-center gap-space-xl"><div class="flex items-center gap-space-sm"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg"/><div class="flex flex-col"><span class="font-headline-sm text-headline-sm tracking-tight text-on-surface font-extrabold">SPORT<span class="text-primary-container">NEXUS</span></span><span class="font-label-sm text-label-sm text-primary uppercase tracking-widest">Athletic OS</span></div></div><nav class="hidden xl:flex items-center gap-space-xs p-space-xs rounded-xl bg-surface-container-low/60 backdrop-blur-md" data-active-classes="bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-[0_0_16px_rgba(0,229,255,0.35)]"><a class="px-space-md py-space-sm rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200" data-path="dashboard" href="#">Dashboard</a><a class="px-space-md py-space-sm rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200" data-path="courts-and-bookings" href="#">Courts &amp; Bookings</a><a class="px-space-md py-space-sm rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200" data-path="lfg-and-matchmaking" href="#">LFG &amp; Matchmaking</a><a class="px-space-md py-space-sm rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200" data-path="community" href="#">Community</a><a class="px-space-md py-space-sm rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200" data-path="tournaments" href="#">Tournaments</a><a class="px-space-md py-space-sm rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200" data-path="wallet" href="#">Wallet</a></nav></div><div class="flex items-center gap-space-md"><div class="hidden sm:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-low/80"><span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-secondary-fixed-dim"></span></span><span class="font-label-sm text-label-sm text-secondary-container uppercase tracking-wider font-bold">Grid Live 12ms</span></div><button class="relative p-space-sm rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest hover:text-on-surface text-on-surface-variant transition-colors flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">notifications</span><span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#00e5ff]"></span></button><div class="flex items-center gap-space-sm pl-space-xs py-space-xs pr-space-md rounded-full bg-surface-container-high/50 hover:bg-surface-container-high transition-colors cursor-pointer"><img alt="Profile" class="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/><div class="flex flex-col text-left"><div class="flex items-center gap-space-xs"><span class="font-label-lg text-label-lg text-on-surface leading-none">Alex Rivera</span><span class="px-space-xs py-0.5 rounded-full bg-secondary-container/20 text-secondary-container font-label-sm text-[9px] leading-tight font-extrabold uppercase">Pro</span></div><span class="font-body-sm text-body-sm text-on-surface-variant leading-tight">99.4 ELO</span></div></div></div></div></header><main class="w-full pt-20 bg-background"><div class="flex flex-col w-full">
<!-- Dynamic Atmospheric Glow Orbs (Contained) -->
<div class="relative w-full overflow-hidden px-margin sm:px-margin-lg py-space-md">
<div class="pointer-events-none absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-primary-container/10 blur-[130px]"></div>
<div class="pointer-events-none absolute top-1/2 right-10 w-80 h-80 rounded-full bg-secondary-fixed/10 blur-[140px]"></div>
<!-- Page Context Ribbon / Kinetic Live Pulse -->
<div class="w-full flex flex-wrap items-center justify-between gap-space-sm mb-space-lg pb-space-xs">
<div class="flex items-center gap-space-sm">
<div class="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high/80 backdrop-blur-md shadow-sm">
<span class="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
<span class="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-wider">Live Mesh: 2,418 Active Athletes</span>
</div>
<span class="hidden sm:inline text-outline-variant">•</span>
<span class="hidden sm:inline font-body-sm text-body-sm text-on-surface-variant">Metro Region Node: Virginia Prime</span>
</div>
<div class="flex items-center gap-space-sm">
<span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Match Sync</span>
<span class="px-space-xs py-0.5 rounded bg-surface-container-highest font-label-sm text-label-sm text-primary-container font-mono">0.08s REALTIME</span>
</div>
</div>
<!-- 2-Column Responsive Layout Grid -->
<div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg xl:gap-space-xl items-start">
<!-- ============================================================== -->
<!-- MAIN CENTER FEED (8 Cols on Desktop) -->
<!-- ============================================================== -->
<div class="w-full lg:col-span-7 xl:col-span-8 flex flex-col gap-space-lg min-w-0">
<!-- COMPOSER CARD (Kinetic Glass) -->
<section class="w-full bg-surface-container/70 backdrop-blur-2xl rounded-xl p-space-md sm:p-space-lg shadow-xl relative overflow-hidden">
<div class="absolute -right-16 -bottom-16 w-44 h-44 rounded-full bg-primary-container/5 blur-3xl pointer-events-none"></div>
<!-- Composer Header / Input Trigger -->
<div class="flex items-start gap-space-md mb-space-md">
<div class="relative shrink-0">
<img alt="Alex Rivera" class="w-11 h-11 rounded-full object-cover shadow-md" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/>
<span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-secondary-fixed-dim shadow-[0_0_8px_#00e478]"></span>
</div>
<div class="flex-1 min-w-0">
<input class="w-full bg-surface-container-low/80 text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md rounded-xl px-space-md py-space-sm focus:outline-none focus:ring-1 focus:ring-primary-container transition-all shadow-inner" placeholder="What's your match plan, Alex? Broadcast a beacon..." type="text"/>
</div>
</div>
<!-- Composer Tool Ribbons -->
<div class="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
<div class="flex items-center gap-space-xs overflow-x-auto py-1">
<button class="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">
<span class="material-symbols-outlined text-[18px] text-primary-container">cell_tower</span>
<span>Beacon</span>
</button>
<button class="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors">
<span class="material-symbols-outlined text-[18px] text-secondary-fixed">photo_camera</span>
<span>Court Photo</span>
</button>
<button class="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors">
<span class="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">poll</span>
<span>Poll</span>
</button>
<button class="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors">
<span class="material-symbols-outlined text-[18px] text-primary">edit_note</span>
<span>Update</span>
</button>
</div>
<!-- Composer Actions -->
<div class="flex items-center gap-space-sm">
<button class="hidden sm:inline-flex px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-lg text-label-lg transition-colors">
                Post Update
              </button>
<button class="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-gradient-to-r from-secondary-fixed-dim to-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_28px_rgba(0,229,255,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all">
<span class="material-symbols-outlined text-[18px]">add_circle</span>
<span>+ Create LFG Card</span>
</button>
</div>
</div>
<!-- Quick Sports Filter Bar -->
<div class="mt-space-md pt-space-sm overflow-x-auto flex items-center gap-space-xs">
<button class="px-space-md py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold shrink-0 shadow-[0_0_12px_rgba(0,229,255,0.35)]">
              All Sports (34)
            </button>
<button class="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm shrink-0 transition-colors">
<span>🏸</span> Badminton (12)
            </button>
<button class="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm shrink-0 transition-colors">
<span>🎾</span> Tennis (8)
            </button>
<button class="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm shrink-0 transition-colors">
<span>🏓</span> Pickleball (6)
            </button>
<button class="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm shrink-0 transition-colors">
<span>⚽</span> Futsal (5)
            </button>
<button class="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm shrink-0 transition-colors">
<span>🏀</span> Basketball (3)
            </button>
</div>
</section>
<!-- PRIMARY LFG CARD: FEATURED / URGENT MATCH -->
<article class="w-full bg-surface-container/90 backdrop-blur-2xl rounded-xl p-space-md sm:p-space-lg shadow-2xl relative overflow-hidden">
<!-- Ambient accent edge line -->
<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-container via-secondary-fixed-dim to-transparent"></div>
<!-- Header Pill / Meta Tier -->
<div class="flex flex-wrap items-center justify-between gap-space-xs mb-space-md">
<div class="flex items-center gap-space-xs flex-wrap">
<span class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-secondary-fixed/15 text-secondary-fixed font-label-sm text-label-sm font-extrabold uppercase tracking-wide shadow-sm">
<span class="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-ping"></span>
                🔥 HOT LFG • 1 SLOT LEFT • ESCROW BACKED
              </span>
<span class="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-surface-container-highest text-primary-fixed-dim font-label-sm text-[11px] font-mono">
                BADMINTON DOUBLES
              </span>
</div>
<div class="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[16px] text-primary-container">timer</span>
<span>Starts in <strong class="text-on-surface font-bold">1h 45m</strong></span>
</div>
</div>
<!-- Host & Match Primary Bio -->
<div class="flex flex-col sm:flex-row items-start justify-between gap-space-md mb-space-lg">
<div class="flex items-center gap-space-md">
<div class="relative">
<img class="w-14 h-14 rounded-xl object-cover bg-surface-container-high shadow-md" data-alt="Close-up portrait of athletic male badminton player named Kiro, high performance gear, neon blue ambient lighting, determined expression, futuristic athletic aesthetics" src="https://lh3.googleusercontent.com/aida/AEtjO1XmUqgQx8U14aZtF8F_n5Q1L7_V8Jb32fA4R6K0X9Y8z5qO3m8XkL4v7a2j1B6H2p8c9e4V1f5m9a1"/>
<span class="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-secondary-container text-on-secondary font-label-sm text-[9px] font-black uppercase">T1</span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-space-xs">
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">Kiro Takahashi</h3>
<span class="material-symbols-outlined text-[18px] text-primary-container" title="Verified Tier 1 Athlete">verified</span>
</div>
<div class="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
<span class="font-mono text-primary-container font-semibold">1,480 ELO</span>
<span>•</span>
<span class="flex items-center gap-0.5 text-secondary-fixed">
<span class="material-symbols-outlined text-[14px]">shield</span>
                    99% Reliability
                  </span>
</div>
</div>
</div>
<!-- Compatibility Metric Pill -->
<div class="px-space-sm py-space-xs rounded-xl bg-surface-container-high/90 flex flex-col items-end text-right self-stretch sm:self-auto justify-center">
<span class="font-label-sm text-label-sm text-secondary-container uppercase tracking-wider font-bold">Elo Match: 98.4%</span>
<span class="font-body-sm text-body-sm text-on-surface">Compat with your 1,450 ELO</span>
</div>
</div>
<!-- Match Specifications Bento Grid -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm mb-space-lg">
<div class="p-space-sm rounded-lg bg-surface-container-low/90 flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Court &amp; Venue</span>
<span class="font-headline-sm text-[15px] leading-tight text-on-surface font-bold mt-0.5">Kinetic Arena • Court 3</span>
<span class="font-body-sm text-[11px] text-outline">Synthetic Hydro-Cushion</span>
</div>
<div class="p-space-sm rounded-lg bg-surface-container-low/90 flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Time Slot</span>
<span class="font-headline-sm text-[15px] leading-tight text-on-surface font-bold mt-0.5">Tonight, 20:00 - 21:30</span>
<span class="font-body-sm text-[11px] text-primary-fixed-dim">90 Min High Intensity</span>
</div>
<div class="p-space-sm rounded-lg bg-surface-container-low/90 flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Staked Escrow</span>
<span class="font-headline-sm text-[15px] leading-tight text-secondary-fixed font-bold mt-0.5">$5.00 / Player</span>
<span class="font-body-sm text-[11px] text-outline">Instant smart-contract refund</span>
</div>
</div>
<!-- Roster Slot Visualizer -->
<div class="mb-space-lg p-space-md rounded-xl bg-surface-container-low/60 backdrop-blur-md">
<div class="flex items-center justify-between mb-space-sm">
<span class="font-label-md text-label-md text-on-surface font-bold">Roster Allocation</span>
<span class="font-label-sm text-label-sm text-secondary-fixed font-mono">3 / 4 FILLED (1 NEEDED)</span>
</div>
<!-- Player Pods -->
<div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
<!-- Player 1: Host -->
<div class="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container-high/60">
<div class="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center font-bold text-primary-container text-xs">KT</div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface truncate">Kiro (Host)</span>
<span class="font-body-sm text-[10px] text-secondary-fixed-dim font-mono">1480 ELO</span>
</div>
</div>
<!-- Player 2 -->
<div class="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container-high/60">
<div class="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center font-bold text-on-surface text-xs">MT</div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface truncate">Minh T.</span>
<span class="font-body-sm text-[10px] text-secondary-fixed-dim font-mono">1410 ELO</span>
</div>
</div>
<!-- Player 3 -->
<div class="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container-high/60">
<div class="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center font-bold text-on-surface text-xs">SL</div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface truncate">Sarah L.</span>
<span class="font-body-sm text-[10px] text-secondary-fixed-dim font-mono">1520 ELO</span>
</div>
</div>
<!-- Player 4: OPEN SLOT PULSE -->
<div class="flex items-center gap-space-xs p-space-xs rounded-lg bg-secondary-fixed/10 ring-1 ring-secondary-fixed-dim/50 animate-pulse">
<div class="w-8 h-8 rounded-lg bg-secondary-fixed/20 flex items-center justify-center text-secondary-fixed">
<span class="material-symbols-outlined text-[18px]">person_add</span>
</div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-secondary-fixed font-bold truncate">Open Slot</span>
<span class="font-body-sm text-[10px] text-secondary-fixed font-mono font-bold">CLAIM NOW</span>
</div>
</div>
</div>
</div>
<!-- CTAs -->
<div class="flex flex-col sm:flex-row items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm w-full sm:w-auto">
<span class="material-symbols-outlined text-[16px] text-secondary-fixed">verified_user</span>
<span>Host anti-ghosting stake locked</span>
</div>
<div class="flex items-center gap-space-sm w-full sm:w-auto justify-end">
<button class="px-space-md py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-lg text-label-lg transition-colors">
                View Match Details
              </button>
<button class="flex items-center justify-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-secondary-container text-on-secondary-container font-label-lg text-label-lg font-black tracking-wide shadow-[0_0_24px_rgba(52,255,140,0.5)] hover:shadow-[0_0_32px_rgba(52,255,140,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all">
<span class="material-symbols-outlined text-[20px]">bolt</span>
<span>⚡ Flash Claim Slot - $5</span>
</button>
</div>
</div>
</article>
<!-- COMMUNITY STATUS POST (Rich Visual & Social Interaction) -->
<article class="w-full bg-surface-container/70 backdrop-blur-2xl rounded-xl p-space-md sm:p-space-lg shadow-xl relative overflow-hidden">
<!-- Author Info & Timestamp -->
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-sm">
<img class="w-11 h-11 rounded-full object-cover shadow" data-alt="Portrait of Marcus Vance, athletic tennis club captain in dark high-tech sporty polo, focused dynamic look, indoor arena backdrop with neon accents" src="https://lh3.googleusercontent.com/aida/AEtjO1XmUqgQx8U14aZtF8F_n5Q1L7_V8Jb32fA4R6K0X9Y8z5qO3m8XkL4v7a2j1B6H2p8c9e4V1f5m9a2"/>
<div class="flex flex-col">
<div class="flex items-center gap-space-xs">
<span class="font-headline-sm text-[16px] text-on-surface font-bold">Marcus Vance</span>
<span class="px-1.5 py-0.5 rounded bg-surface-container-highest text-primary-container font-label-sm text-[10px] uppercase font-bold">Tennis Captain</span>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">2 hours ago • Kinetic Arena Network</span>
</div>
</div>
<button class="text-on-surface-variant hover:text-on-surface p-1 rounded-full">
<span class="material-symbols-outlined text-[20px]">more_horiz</span>
</button>
</div>
<!-- Post Content -->
<p class="font-body-lg text-body-lg text-on-surface mb-space-md leading-relaxed">
            Just wrapped a 3-set thriller under the floodlights at <span class="text-primary-container font-semibold">Kinetic Arena Court 2</span>! New synthetic surface has unreal grip and shock absorption. Big shoutout to <span class="text-secondary-fixed font-semibold">@Sarah</span> and <span class="text-secondary-fixed font-semibold">@Kenji</span> for the high-octane rallies! 🏸🔥 Who's dropping in tomorrow night?
          </p>
<!-- High Resolution Attached Court Image (Referencing photo inspiration) -->
<div class="relative w-full rounded-xl overflow-hidden shadow-2xl mb-space-md group">
<img class="w-full h-80 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-[1.01]" data-alt="A cinematic wide-angle photograph inside a cavernous modern indoor badminton arena with multiple illuminated green tournament courts. Players are actively mid-rally with rackets raised, shuttlecocks in motion, spectators watching from upper mezzanine glass balconies. Striking cool neon cyan strip lighting rings the sleek dark architecture, with high-definition digital scoreboards glowing in the midnight atmosphere." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQACVu4g_GmnsZAr2r5GOxlk61Rz2RVxxMmzBJSmhNBZTheszhO1jkWV_AESgogkf070ZFOTpKob_AsR7p5-0bZ1HuobrVSzQPeNMkKYorpIzG5sjJ5sEKozGHQAR0uRcK-zNdFfOF3BC91hbXk5mtvSvmRyZV9ZRePn_l-olHP7oqAo4WQoBk_OH6GTUv6-6klHhJikGp1Vwvw0oRzOy2xOIyK1ZdvDoOnQ_8Wu7P_0VUvr4DpllG"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent"></div>
<div class="absolute bottom-3 left-4 flex items-center gap-space-xs">
<span class="px-space-sm py-1 rounded-md bg-surface-container-lowest/80 backdrop-blur-md font-label-sm text-label-sm text-primary-container font-bold shadow">
                Kinetic Arena • Court 2
              </span>
<span class="px-space-sm py-1 rounded-md bg-surface-container-lowest/80 backdrop-blur-md font-label-sm text-label-sm text-secondary-container font-bold shadow">
                Tournament Synthetic Hydro
              </span>
</div>
</div>
<!-- Social Engagement Metrics & Actions -->
<div class="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
<div class="flex items-center gap-space-md">
<!-- Like Button -->
<button class="flex items-center gap-1.5 text-on-surface-variant hover:text-primary-container transition-colors">
<span class="material-symbols-outlined text-[20px] text-primary-container">favorite</span>
<span class="font-label-md text-label-md font-bold text-on-surface">42</span>
</button>
<!-- Comments -->
<button class="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors">
<span class="material-symbols-outlined text-[20px]">chat_bubble</span>
<span class="font-label-md text-label-md font-bold text-on-surface">9</span>
</button>
<!-- Share -->
<button class="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors">
<span class="material-symbols-outlined text-[20px]">share</span>
<span class="font-label-md text-label-md font-bold text-on-surface">5</span>
</button>
</div>
<!-- Gamified Tip XP Action -->
<button class="flex items-center gap-1.5 px-space-sm py-1 rounded-lg bg-surface-container-high/80 hover:bg-surface-container-highest text-secondary-fixed font-label-sm text-label-sm font-bold transition-all shadow-sm">
<span class="material-symbols-outlined text-[16px]">stars</span>
<span>Tip Fairplay XP (+10 XP)</span>
</button>
</div>
<!-- Inline Comment Preview -->
<div class="mt-space-md pt-space-sm flex items-start gap-space-sm bg-surface-container-low/50 p-space-sm rounded-lg">
<div class="w-6 h-6 rounded-full bg-secondary-fixed/20 flex items-center justify-center font-bold text-[10px] text-secondary-fixed">SL</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface font-bold">Sarah L.</span>
<p class="font-body-sm text-body-sm text-on-surface-variant">Epic game! My calves are completely on fire 🔥 Same time Thursday?</p>
</div>
</div>
</article>
<!-- ADDITIONAL LFG CARD: TENNIS SINGLES -->
<article class="w-full bg-surface-container/70 backdrop-blur-2xl rounded-xl p-space-md sm:p-space-lg shadow-xl relative overflow-hidden">
<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
<div class="flex flex-wrap items-center justify-between gap-space-xs mb-space-sm">
<div class="flex items-center gap-space-xs">
<span class="px-space-xs py-0.5 rounded bg-primary-container/15 text-primary-container font-label-sm text-label-sm font-bold uppercase">
                🎾 TENNIS SINGLES • 1V1 DUEL
              </span>
<span class="text-on-surface-variant font-body-sm text-body-sm">Tomorrow, 08:30 AM</span>
</div>
<span class="font-label-sm text-label-sm text-secondary-fixed font-mono font-bold">1 / 2 SLOTS NEEDED</span>
</div>
<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
<div class="flex items-center gap-space-md">
<img class="w-12 h-12 rounded-xl object-cover shadow" data-alt="Portrait of Elena Rostova, female competitive tennis athlete with visor and focused gaze, dark atmospheric lighting with neon cyber accents" src="https://lh3.googleusercontent.com/aida/AEtjO1XmUqgQx8U14aZtF8F_n5Q1L7_V8Jb32fA4R6K0X9Y8z5qO3m8XkL4v7a2j1B6H2p8c9e4V1f5m9a3"/>
<div class="flex flex-col">
<h4 class="font-headline-sm text-[17px] text-on-surface font-bold">Elena Rostova</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">Kinetic Arena • Red Clay Court 1 • <strong class="text-on-surface">1,350 - 1,550 ELO</strong></span>
</div>
</div>
<div class="flex items-center gap-space-sm self-stretch sm:self-auto justify-end">
<div class="text-right mr-space-xs hidden sm:block">
<span class="block font-headline-sm text-headline-sm font-bold text-on-surface">$8.00</span>
<span class="block font-label-sm text-[10px] text-outline uppercase">Entry Escrow</span>
</div>
<button class="w-full sm:w-auto px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_28px_rgba(0,229,255,0.65)] hover:scale-[1.02] transition-all">
                ⚡ Flash Claim Slot - $8
              </button>
</div>
</div>
</article>
</div>
<!-- ============================================================== -->
<!-- RIGHT SIDEBAR (Community Telemetry & Widgets - 4 Cols) -->
<!-- ============================================================== -->
<aside class="w-full lg:col-span-5 xl:col-span-4 flex flex-col gap-space-lg">
<!-- RADAR & MATCHMAKING DISPATCH WIDGET -->
<section class="w-full bg-surface-container/70 backdrop-blur-2xl rounded-xl p-space-md shadow-xl relative overflow-hidden">
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[20px] text-primary-container">radar</span>
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">Matchmaking Radar</h3>
</div>
<span class="px-space-xs py-0.5 rounded bg-secondary-fixed/15 text-secondary-fixed font-label-sm text-[10px] uppercase font-bold tracking-widest">Radius 5km</span>
</div>
<!-- Live Visual Radar Graphic (Inline Micro SVG) -->
<div class="relative w-full h-44 rounded-lg bg-surface-container-low/90 overflow-hidden flex items-center justify-center mb-space-md shadow-inner">
<svg class="w-full h-full text-outline-variant/30" fill="none" viewbox="0 0 200 160">
<!-- Radar concentric circles -->
<circle cx="100" cy="80" r="25" stroke="currentColor" stroke-width="1"></circle>
<circle cx="100" cy="80" r="50" stroke="currentColor" stroke-width="1"></circle>
<circle cx="100" cy="80" r="72" stroke="currentColor" stroke-width="1"></circle>
<line stroke="currentColor" stroke-width="1" x1="100" x2="100" y1="8" y2="152"></line>
<line stroke="currentColor" stroke-width="1" x1="28" x2="172" y1="80" y2="80"></line>
<!-- Radar Sweep beam -->
<path d="M100 80 L160 30 A72 72 0 0 0 100 8 Z" fill="url(#radar-sweep)" opacity="0.35"></path>
<defs>
<lineargradient gradientunits="userSpaceOnUse" id="radar-sweep" x1="100" x2="160" y1="80" y2="30">
<stop stop-color="#00e5ff" stop-opacity="0.8"></stop>
<stop offset="1" stop-color="#00e5ff" stop-opacity="0"></stop>
</lineargradient>
</defs>
<!-- Blips for active LFGs -->
<circle class="animate-ping" cx="120" cy="65" fill="#00e5ff" r="4"></circle>
<circle cx="120" cy="65" fill="#00e5ff" r="3"></circle>
<circle cx="75" cy="50" fill="#34ff8c" r="3.5"></circle>
<circle cx="135" cy="105" fill="#34ff8c" r="3"></circle>
<circle cx="60" cy="110" fill="#00e5ff" r="2.5"></circle>
<!-- User Position Center -->
<circle cx="100" cy="80" fill="#ffffff" r="4"></circle>
</svg>
<div class="absolute bottom-2 left-3 right-3 flex items-center justify-between text-on-surface-variant font-label-sm text-[11px]">
<span>18 Active Nodes</span>
<span class="text-secondary-fixed">Dispatch: ~4.2 mins</span>
</div>
</div>
<!-- Summon AI Matchmaker Button -->
<button class="w-full flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary-container font-label-lg text-label-lg font-bold shadow-md transition-all group">
<span class="material-symbols-outlined text-[20px] group-hover:rotate-45 transition-transform duration-300">smart_toy</span>
<span>Summon Kinetic AI Matchmaker</span>
</button>
</section>
<!-- WEEKLY ELO LEADERBOARD & FAIRPLAY CHAMPIONS -->
<section class="w-full bg-surface-container/70 backdrop-blur-2xl rounded-xl p-space-md shadow-xl">
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[20px] text-secondary-fixed">military_tech</span>
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">Elo Leaderboard</h3>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Week 14</span>
</div>
<!-- Top Athletes Stack -->
<div class="flex flex-col gap-space-xs">
<!-- Rank 1 -->
<div class="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-low/80 hover:bg-surface-container-high transition-colors">
<div class="flex items-center gap-space-sm">
<span class="w-6 font-mono font-bold text-secondary-fixed text-center">#1</span>
<div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-xs text-on-surface">JD</div>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">Jin-Woo D.</span>
<span class="font-body-sm text-[11px] text-on-surface-variant">Badminton • 89% WR</span>
</div>
</div>
<div class="text-right">
<span class="font-label-md text-label-md font-mono font-bold text-primary-container">1,820</span>
<span class="block font-body-sm text-[10px] text-secondary-fixed">+340 XP</span>
</div>
</div>
<!-- Rank 2 -->
<div class="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-low/80 hover:bg-surface-container-high transition-colors">
<div class="flex items-center gap-space-sm">
<span class="w-6 font-mono font-bold text-on-surface-variant text-center">#2</span>
<div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-xs text-on-surface">MS</div>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">Maya Sterling</span>
<span class="font-body-sm text-[11px] text-on-surface-variant">Tennis • 84% WR</span>
</div>
</div>
<div class="text-right">
<span class="font-label-md text-label-md font-mono font-bold text-primary-container">1,795</span>
<span class="block font-body-sm text-[10px] text-secondary-fixed">+280 XP</span>
</div>
</div>
<!-- Rank 3 -->
<div class="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-low/80 hover:bg-surface-container-high transition-colors">
<div class="flex items-center gap-space-sm">
<span class="w-6 font-mono font-bold text-on-surface-variant text-center">#3</span>
<div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-xs text-on-surface">AR</div>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">Alex Rivera (You)</span>
<span class="font-body-sm text-[11px] text-primary-container">Pro Class • 78% WR</span>
</div>
</div>
<div class="text-right">
<span class="font-label-md text-label-md font-mono font-bold text-primary-container">1,740</span>
<span class="block font-body-sm text-[10px] text-secondary-fixed">+210 XP</span>
</div>
</div>
</div>
</section>
<!-- TRENDING ARENAS -->
<section class="w-full bg-surface-container/70 backdrop-blur-2xl rounded-xl p-space-md shadow-xl">
<div class="flex items-center justify-between mb-space-md">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[20px] text-primary-fixed-dim">stadium</span>
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">Trending Arenas</h3>
</div>
<a class="font-label-sm text-label-sm text-primary-container hover:underline" href="#">Explore All</a>
</div>
<div class="flex flex-col gap-space-sm">
<!-- Arena 1 -->
<div class="p-space-sm rounded-lg bg-surface-container-low/80 flex items-center justify-between">
<div class="flex flex-col">
<span class="font-label-lg text-label-lg font-bold text-on-surface">Kinetic Arena - Court 3</span>
<span class="font-body-sm text-[11px] text-on-surface-variant">High Demand Peak • +15% ELO Multiplier</span>
</div>
<span class="px-space-xs py-1 rounded bg-error-container/40 text-error font-label-sm text-[10px] uppercase font-bold">
                92% Booked
              </span>
</div>
<!-- Arena 2 -->
<div class="p-space-sm rounded-lg bg-surface-container-low/80 flex items-center justify-between">
<div class="flex flex-col">
<span class="font-label-lg text-label-lg font-bold text-on-surface">Metro Sportplex</span>
<span class="font-body-sm text-[11px] text-on-surface-variant">4 Badminton &amp; 2 Clay Tennis Courts</span>
</div>
<span class="px-space-xs py-1 rounded bg-secondary-fixed/20 text-secondary-fixed font-label-sm text-[10px] uppercase font-bold">
                Open Slots
              </span>
</div>
</div>
</section>
</aside>
</div>
</div>
</div></main><footer class="w-full bg-surface-container-lowest/90 backdrop-blur-2xl py-space-xl shadow-[0_-1px_12px_rgba(0,0,0,0.5)]"><div class="w-full px-margin-lg flex flex-col md:flex-row items-center justify-between gap-space-lg"><div class="flex flex-col sm:flex-row items-center gap-space-md text-center sm:text-left"><div class="flex items-center gap-space-sm"><span class="font-headline-sm text-headline-sm text-on-surface font-black tracking-tight">SPORT<span class="text-primary-container">NEXUS</span></span><span class="font-label-sm text-label-sm text-on-surface-variant font-bold">OS v4.2.1-KINETIC</span></div><div class="hidden sm:block w-px h-4 bg-surface-container-highest"></div><div class="flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm"><span class="flex items-center gap-space-xs"><span class="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim"></span>Global Node US-East (Virginia)</span><span>Latency: 14ms</span><span>Mesh Status: Nominal</span></div></div><div class="flex items-center gap-space-md flex-wrap justify-center"><div class="flex items-center gap-space-xs px-space-sm py-1 rounded-md bg-surface-container-high/80 font-label-sm text-label-sm text-on-surface-variant"><span class="material-symbols-outlined text-[16px] text-primary-container">lock</span>E2E Encrypted Protocol</div><div class="flex items-center gap-space-xs px-space-sm py-1 rounded-md bg-surface-container-high/80 font-label-sm text-label-sm text-on-surface-variant"><span class="material-symbols-outlined text-[16px] text-secondary-fixed-dim">verified_user</span>Anti-Cheat Guard v9</div><span class="font-body-sm text-body-sm text-on-surface-variant/70">© 2025 SportNexus Technologies Inc.</span></div></div></footer></body></html>`

function CommunityFeed() {
  return <iframe title="SportNexus CommunityFeed" srcDoc={communityFeedPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default CommunityFeed
