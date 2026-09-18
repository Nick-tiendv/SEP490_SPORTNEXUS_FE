const dashboardPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Outfit:wght@500;600;700;800&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base { html, body { margin: 0; padding: 0; } body { overscroll-behavior: none; } main > :first-child { margin-top: 0 !important; } main > :last-child { margin-bottom: 0 !important; } } ::-webkit-scrollbar { display: none; }</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config = { darkMode: "class", theme: { extend: { "colors": { "on-secondary": "#003919", "surface-container-highest": "#31353e", "surface-container-lowest": "#0a0e16", "on-secondary-fixed-variant": "#005227", "surface-container-low": "#181c24", "tertiary-container": "#c2cfff", "inverse-primary": "#006875", "surface": "#0f131c", "primary-container": "#00e5ff", "background": "#0f131c", "surface-variant": "#31353e", "on-primary-fixed-variant": "#004f58", "secondary-fixed-dim": "#00e478", "on-surface-variant": "#bac9cc", "on-error-container": "#ffdad6", "surface-container": "#1c2028", "error-container": "#93000a", "on-error": "#690005", "tertiary": "#e9ecff", "on-tertiary": "#002a78", "primary": "#c3f5ff", "outline": "#849396", "secondary-container": "#34ff8c", "on-tertiary-fixed": "#00174b", "tertiary-fixed-dim": "#b4c5ff", "error": "#ffb4ab", "inverse-on-surface": "#2c3039", "secondary": "#f5fff3", "outline-variant": "#3b494c", "surface-bright": "#353942", "on-secondary-container": "#007239", "on-tertiary-fixed-variant": "#003ea8", "primary-fixed": "#9cf0ff", "on-tertiary-container": "#004ecf", "on-primary": "#00363d", "inverse-surface": "#dfe2ee", "surface-dim": "#0f131c", "tertiary-fixed": "#dbe1ff", "surface-container-high": "#262a33", "on-surface": "#dfe2ee", "surface-tint": "#00daf3", "on-background": "#dfe2ee", "primary-fixed-dim": "#00daf3", "secondary-fixed": "#60ff98", "on-primary-fixed": "#001f24", "on-primary-container": "#00626e", "on-secondary-fixed": "#00210c" }, "borderRadius": { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" }, "spacing": { "space-xl": "2rem", "space-lg": "1.5rem", "margin-sm": "1rem", "space-xs": "0.25rem", "margin-lg": "2rem", "gutter": "1rem", "gutter-sm": "0.75rem", "space-sm": "0.5rem", "space-md": "1rem", "margin": "1.25rem" }, "fontFamily": { "headline-lg": ["Outfit"], "headline-md": ["Outfit"], "label-md": ["Outfit"], "body-md": ["Inter"], "label-sm": ["Outfit"], "label-lg": ["Outfit"], "display-lg": ["Outfit"], "body-lg": ["Inter"], "display-lg-mobile": ["Outfit"], "headline-sm": ["Outfit"], "body-sm": ["Inter"] }, "fontSize": { "headline-lg": ["28px", { "lineHeight": "34px", "letterSpacing": "-0.02em", "fontWeight": "700" }], "headline-md": ["22px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }], "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.06em", "fontWeight": "600" }], "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }], "label-sm": ["10px", { "lineHeight": "12px", "letterSpacing": "0.08em", "fontWeight": "700" }], "label-lg": ["14px", { "lineHeight": "18px", "letterSpacing": "0.04em", "fontWeight": "600" }], "display-lg": ["44px", { "lineHeight": "48px", "letterSpacing": "-0.03em", "fontWeight": "800" }], "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }], "display-lg-mobile": ["32px", { "lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "800" }], "headline-sm": ["18px", { "lineHeight": "24px", "fontWeight": "600" }], "body-sm": ["12px", { "lineHeight": "16px", "fontWeight": "400" }] } } } };</script><style>img[alt^="SportNexus logo mark"]{display:none!important}</style></head><body class="bg-surface text-on-surface antialiased"><aside class="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest/80 backdrop-blur-xl z-50 flex flex-col justify-between p-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div class="flex flex-col gap-space-lg"><div class="flex items-center gap-space-sm px-space-xs py-space-xs"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg"/><div class="flex flex-col"><span class="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">The Kinetic</span><span class="font-label-sm text-label-sm text-primary-container tracking-wider uppercase">Athletic OS</span></div></div><nav class="flex flex-col gap-space-xs" data-active-classes="bg-primary-container text-on-primary-container font-label-lg rounded-xl shadow-[0_0_20px_-2px_rgba(0,229,255,0.45)]"><a aria-current="page" class="flex items-center gap-space-sm px-space-md py-space-sm transition-all bg-primary-container text-on-primary-container font-label-lg rounded-xl shadow-[0_0_20px_-2px_rgba(0,229,255,0.45)]" data-path="home" href="#"><span class="material-symbols-outlined text-[20px]">grid_view</span><span>Home</span></a><a class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="explore-courts" href="#"><span class="material-symbols-outlined text-[20px]">sports_tennis</span><span>Explore Courts</span></a><a class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="wallet" href="#"><span class="material-symbols-outlined text-[20px]">account_balance_wallet</span><span>Wallet</span></a><a class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="community" href="#"><span class="material-symbols-outlined text-[20px]">groups</span><span>Community</span></a><a class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="profile" href="#"><span class="material-symbols-outlined text-[20px]">person</span><span>Profile</span></a></nav></div><div class="flex flex-col gap-space-sm"><div class="bg-surface-container-low/70 rounded-xl p-space-sm flex flex-col gap-space-xs"><div class="flex items-center justify-between"><span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">System Status</span><span class="flex h-2 w-2 relative"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span></span></div><div class="flex items-center justify-between"><span class="font-body-sm text-body-sm text-on-surface">Arena Node-01</span><span class="font-label-sm text-label-sm text-secondary-container">ONLINE</span></div></div><a class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="settings" href="#"><span class="material-symbols-outlined text-[20px]">settings</span><span>Settings</span></a></div></aside><div class="pl-64"><header class="fixed top-0 left-64 right-0 z-40 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div class="h-16 w-full px-space-lg flex items-center justify-between gap-space-md"><div class="flex items-center flex-1 max-w-lg"><div class="relative w-full flex items-center"><span class="material-symbols-outlined absolute left-space-sm text-on-surface-variant text-[20px]">search</span><input class="w-full bg-surface-container-low/60 rounded-xl pl-10 pr-space-md py-space-xs text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary-container transition-all" placeholder="Search courts, players, tournaments..." type="text"/></div></div><div class="flex items-center gap-space-md"><div class="hidden sm:flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-low/60 rounded-full"><span class="inline-block w-1.5 h-1.5 rounded-full bg-secondary-container shadow-[0_0_8px_rgba(52,255,140,0.8)]"></span><span class="font-label-sm text-label-sm text-on-surface-variant">24ms</span><span class="font-label-sm text-label-sm text-outline">•</span><span class="font-label-sm text-label-sm text-secondary-container uppercase">Ultra Latency</span></div><button class="relative p-space-xs rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"><span class="material-symbols-outlined text-[22px]">notifications</span><span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_rgba(0,229,255,0.9)]"></span></button><div class="flex items-center gap-space-sm pl-space-xs"><div class="flex flex-col items-end"><div class="flex items-center gap-space-xs"><span class="font-label-lg text-label-lg text-on-surface">Hoàng Ân</span><span class="px-1.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary-container font-label-sm text-label-sm uppercase tracking-wide">Pro</span></div><span class="font-body-sm text-body-sm text-on-surface-variant">Challenger Lvl 4</span></div><div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span class="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></div></header><main class="w-full pt-16 bg-surface min-h-screen"><div class="flex flex-col w-full px-space-lg py-space-lg gap-space-xl relative overflow-hidden">
<!-- Subtle Ambient Glow Orbs -->
<div class="absolute -top-32 -left-32 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
<div class="absolute top-80 right-0 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>
<!-- SECTION 1: WELCOME BANNER & TELEMETRY STATUS -->
<section class="relative rounded-2xl bg-surface-container-low/70 backdrop-blur-xl p-space-lg md:p-space-xl shadow-xl overflow-hidden flex flex-col gap-space-md">
<!-- Inner stadium atmospheric glow line -->
<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-secondary-container to-transparent"></div>
<div class="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-6">
<span class="material-symbols-outlined text-[160px] text-primary">sports_tennis</span>
</div>
<!-- Top Status Pills Row -->
<div class="flex flex-wrap items-center gap-space-sm">
<div class="flex items-center gap-space-xs px-3 py-1 rounded-full bg-secondary-container/15 text-secondary-fixed shadow-[0_0_12px_rgba(52,255,140,0.25)]">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-80"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider">Kinetic Mesh Online • Virginia Prime Hub</span>
</div>
<div class="flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
<span class="material-symbols-outlined text-[14px] text-primary-container">military_tech</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-primary">Current Season: S4 Championship</span>
</div>
<div class="ml-auto hidden xl:flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
<span class="material-symbols-outlined text-[16px] text-secondary-container">bolt</span>
<span>LATENCY: 14MS</span>
<span class="text-outline">•</span>
<span class="text-on-surface">SYNCHRONIZED NODE #088</span>
</div>
</div>
<!-- Welcome Content -->
<div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
<div class="flex flex-col gap-space-xs max-w-2xl">
<h1 class="font-display-lg text-display-lg text-on-surface tracking-tight">
          Welcome back, <span class="bg-gradient-to-r from-primary-container via-secondary-container to-secondary-fixed bg-clip-text text-transparent">Hoàng Ân!</span>
</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant">
          “Relentless velocity beats raw talent. Step onto the court and claim your edge.”
        </p>
</div>
<div class="flex items-center gap-space-sm">
<button class="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-container-highest transition-all shadow-md">
<span class="material-symbols-outlined text-[20px] text-primary-container">calendar_month</span>
<span>My Schedule</span>
</button>
<button class="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg hover:brightness-110 transition-all shadow-[0_0_24px_rgba(0,229,255,0.45)]">
<span class="material-symbols-outlined text-[20px]">add_circle</span>
<span>Book Instant Slot</span>
</button>
</div>
</div>
</section>
<!-- SECTION 2: TOP METRIC WIDGETS (2 COLUMNS) -->
<section class="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
<!-- Widget 1: Digital Kinetic Vault (Wallet Card) -->
<div class="relative rounded-2xl bg-surface-container-low/80 backdrop-blur-xl p-space-lg flex flex-col justify-between gap-space-md shadow-lg overflow-hidden group">
<!-- Glow ambient accent -->
<div class="absolute -right-12 -top-12 w-44 h-44 bg-primary-container/10 rounded-full blur-2xl group-hover:bg-primary-container/20 transition-all"></div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-xl bg-primary-container/15 flex items-center justify-center text-primary-container shadow-[0_0_12px_rgba(0,229,255,0.2)]">
<span class="material-symbols-outlined text-[24px]">account_balance_wallet</span>
</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface">Digital Kinetic Vault</span>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Automated Match Escrow</span>
</div>
</div>
<div class="px-2.5 py-1 rounded-full bg-surface-container-high text-secondary-container font-label-sm text-label-sm flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
<span>Auto-Recharge Active</span>
</div>
</div>
<!-- Balance Display -->
<div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-xs pt-space-xs">
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Available Balance</span>
<div class="flex items-baseline gap-space-xs">
<span class="font-display-lg text-display-lg text-on-surface tracking-tight leading-none">$120.00</span>
<span class="font-label-md text-label-md text-secondary-fixed">USDC / FIAT</span>
</div>
</div>
<div class="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-high/90">
<span class="material-symbols-outlined text-primary text-[18px]">verified_user</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">
            Locked Escrow: <strong class="text-on-surface font-semibold">$5.00</strong> • Instant Refund Protected
          </span>
</div>
</div>
<!-- Actions & Quick Deposit Badges -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs">
<div class="flex items-center gap-2">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Quick Top-up:</span>
<button class="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest hover:text-primary-container font-label-md text-label-md transition-all">+ $20</button>
<button class="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest hover:text-primary-container font-label-md text-label-md transition-all">+ $50</button>
<button class="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest hover:text-primary-container font-label-md text-label-md transition-all">+ $100</button>
</div>
<button class="flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg hover:brightness-110 shadow-[0_0_20px_rgba(52,255,140,0.4)] transition-all">
<span class="material-symbols-outlined text-[20px]">add</span>
<span>Top Up Vault</span>
</button>
</div>
</div>
<!-- Widget 2: Performance & Calibration (Stats Card) -->
<div class="relative rounded-2xl bg-surface-container-low/80 backdrop-blur-xl p-space-lg flex flex-col justify-between gap-space-md shadow-lg overflow-hidden group">
<div class="absolute -right-12 -top-12 w-44 h-44 bg-secondary-container/10 rounded-full blur-2xl group-hover:bg-secondary-container/20 transition-all"></div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-xl bg-secondary-container/15 flex items-center justify-center text-secondary-container shadow-[0_0_12px_rgba(52,255,140,0.2)]">
<span class="material-symbols-outlined text-[24px]">monitoring</span>
</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface">Performance &amp; Calibration</span>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Real-time Biometrics &amp; Elo</span>
</div>
</div>
<div class="px-2.5 py-1 rounded-full bg-secondary-container/15 text-secondary-fixed font-label-sm text-label-sm flex items-center gap-1 shadow-sm">
<span class="material-symbols-outlined text-[14px]">shield</span>
<span>Honor Elite Tier</span>
</div>
</div>
<!-- Stats Grid Inside Card -->
<div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
<!-- Fairplay Meter with SVG Ring -->
<div class="flex items-center gap-space-md p-space-sm rounded-xl bg-surface-container-high/60">
<div class="relative w-16 h-16 flex items-center justify-center shrink-0">
<svg class="w-16 h-16 -rotate-90" viewbox="0 0 36 36">
<path class="text-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3.5"></path>
<path class="text-secondary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="98, 100" stroke-linecap="round" stroke-width="3.5"></path>
</svg>
<div class="absolute flex flex-col items-center">
<span class="font-label-lg text-label-lg font-bold text-on-surface leading-none">98</span>
<span class="font-label-sm text-[8px] text-secondary-container">PTS</span>
</div>
</div>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface font-semibold">Fairplay Score</span>
<span class="font-body-sm text-body-sm text-secondary-fixed">98 / 100 Absolute</span>
<span class="font-label-sm text-[11px] text-on-surface-variant">0 Court Penalties Recorded</span>
</div>
</div>
<!-- Elo Metric & Momentum Sparkline -->
<div class="flex flex-col justify-between p-space-sm rounded-xl bg-surface-container-high/60">
<div class="flex items-center justify-between">
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Badminton Elo</span>
<div class="flex items-baseline gap-1.5">
<span class="font-headline-lg text-headline-lg text-primary-container leading-none">1,450</span>
<span class="font-label-sm text-label-sm text-secondary-container font-bold">+24 pts</span>
</div>
</div>
<div class="text-right">
<span class="px-2 py-0.5 rounded-full bg-primary-container/15 text-primary text-label-sm font-semibold">Silver Tier</span>
<p class="font-label-sm text-[10px] text-on-surface-variant mt-0.5">Top 12% in Region</p>
</div>
</div>
<!-- Win rate bar & sparkline preview -->
<div class="flex items-center justify-between pt-2">
<div class="flex items-center gap-1 text-on-surface font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px] text-secondary-container">trending_up</span>
<span>76% Win Rate</span>
<span class="text-outline">•</span>
<span class="text-on-surface-variant">34 Matches</span>
</div>
<!-- Mini SVG Sparkline -->
<svg class="w-20 h-5 text-primary-container" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 80 20">
<polyline points="0,15 15,14 30,17 45,9 60,11 75,3"></polyline>
</svg>
</div>
</div>
</div>
<!-- Quick sub-link -->
<div class="flex items-center justify-between pt-space-xs font-label-md text-label-md text-on-surface-variant">
<span class="flex items-center gap-1">
<span class="w-2 h-2 rounded-full bg-secondary-container"></span>
<span>Telemetry node verified via Hawk-Eye Vision</span>
</span>
<a class="text-primary-container hover:underline flex items-center gap-0.5" href="#">
<span>Full Performance Graph</span>
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
</a>
</div>
</div>
</section>
<!-- SECTION 3: UPCOMING MATCH SECTION (HERO MATCH POD) -->
<section class="flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary-container text-[24px]">stadium</span>
<h2 class="font-headline-md text-headline-md text-on-surface tracking-tight">Active Deployment</h2>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Slot ID #KN-88219</span>
</div>
<div class="relative rounded-2xl bg-surface-container-low/90 backdrop-blur-2xl p-space-lg md:p-space-xl shadow-2xl overflow-hidden group">
<!-- Glow Refraction Effect on left edge -->
<div class="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-primary-container via-secondary-container to-primary-container"></div>
<div class="absolute -right-20 -bottom-20 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
<!-- Card Inner Layout: 2 Columns (Info & Media/QR) -->
<div class="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-center">
<!-- Left Column: Match Details -->
<div class="xl:col-span-8 flex flex-col gap-space-md">
<!-- Reservation Status Pill -->
<div class="flex flex-wrap items-center gap-space-sm">
<div class="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/15 text-secondary-fixed shadow-[0_0_12px_rgba(52,255,140,0.3)]">
<span class="relative flex h-2.5 w-2.5">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-90"></span>
<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-container"></span>
</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider font-bold">Confirmed Reservation • Starts in 2h 15m</span>
</div>
<div class="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
              Court 3 • Synthetic Hydro-Cushion
            </div>
</div>
<!-- Main Title & Location -->
<div class="flex flex-col gap-1">
<h3 class="font-headline-lg text-display-lg-mobile md:text-headline-lg text-on-surface font-bold">
              Next Match: Badminton at Kinetic Arena
            </h3>
<div class="flex items-center gap-space-xs text-on-surface-variant font-body-md text-body-md">
<span class="material-symbols-outlined text-[18px] text-primary-container">pin_drop</span>
<span>Kinetic Central Stadium • High-Velocity Hall B, Sector 4</span>
</div>
</div>
<!-- Key Details Grid -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
<div class="flex flex-col p-space-sm rounded-xl bg-surface-container-high/70">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Match Schedule</span>
<span class="font-label-lg text-label-lg text-on-surface font-semibold">Tonight, 19:00 - 20:30</span>
<span class="font-body-sm text-body-sm text-secondary-container">90 Min Standard Fast-Pace</span>
</div>
<div class="flex flex-col p-space-sm rounded-xl bg-surface-container-high/70">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Roster Status</span>
<span class="font-label-lg text-label-lg text-on-surface font-semibold">4 / 4 Confirmed Full</span>
<span class="font-body-sm text-body-sm text-primary-container">Doubles Competitive Ladder</span>
</div>
<div class="flex flex-col p-space-sm rounded-xl bg-surface-container-high/70">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Access Gate</span>
<span class="font-label-lg text-label-lg text-on-surface font-semibold">Turnstile Gate B3</span>
<span class="font-body-sm text-body-sm text-secondary-fixed">NFC Tap Enabled</span>
</div>
</div>
<!-- Squad Avatars and Names -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs">
<div class="flex items-center gap-space-sm">
<div class="flex -space-x-3 overflow-hidden">
<div class="inline-block h-10 w-10 rounded-full bg-primary-fixed-dim text-on-primary font-bold text-center leading-10 shadow-md">KT</div>
<div class="inline-block h-10 w-10 rounded-full bg-secondary-fixed-dim text-on-secondary font-bold text-center leading-10 shadow-md">MV</div>
<div class="inline-block h-10 w-10 rounded-full bg-tertiary-fixed text-on-tertiary font-bold text-center leading-10 shadow-md">SL</div>
<div class="inline-block h-10 w-10 rounded-full bg-primary text-on-primary font-bold text-center leading-10 ring-2 ring-primary-container shadow-md">HÂ</div>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Confirmed Players</span>
<span class="font-body-sm text-body-sm text-on-surface font-medium">Kiro T., Marcus V., Sarah L., Hoàng Ân (You)</span>
</div>
</div>
<!-- Lock in Rules tag -->
<div class="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px] text-secondary-container">verified</span>
<span>Official Referee AI System Active</span>
</div>
</div>
</div>
<!-- Right Column: Visual Arena Preview & QR Turnstile Trigger -->
<div class="xl:col-span-4 flex flex-col items-center justify-center p-space-md rounded-xl bg-surface-container-high/50 backdrop-blur-md gap-space-md text-center">
<div class="relative w-full h-40 rounded-xl overflow-hidden shadow-inner">
<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="High-tech indoor badminton court with modern synthetic green turf, vibrant neon stadium lights, sleek glass walls and electronic scoreboards, dynamic tournament atmosphere" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKWNpoUp2khbpM-VNOJLoJqoNoM1bShmlJOwAkm4PLZhi2KskMhAHyAoDYQJUEfnk9Rgqk-lCzV_5ncwSDfYyLzmKqeFxjVrnS_bqaUTf4vcV9ge5hHJm9sWou5IQEBGGNBqAxX3BoGMdekbfk6dJgYTH6Oio9T4wKydQHZWx2oASoOB31huQeueZm5hcTKV2XN4ATnKOMQWHwLt_b6GIXAAC8xQWSta2NcjV-DXyKlW_NlARAsjql"/>
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent"></div>
<div class="absolute bottom-2 left-3 right-3 flex items-center justify-between text-left">
<span class="font-label-sm text-label-sm text-on-surface px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-sm">Court 3 Vision Feed</span>
<span class="font-label-sm text-label-sm text-secondary-container flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                LIVE
              </span>
</div>
</div>
<!-- Primary CTA Button with high neon glow -->
<button class="w-full flex items-center justify-center gap-space-sm px-space-lg py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-fixed font-label-lg text-label-lg font-bold tracking-wide hover:brightness-110 shadow-[0_0_28px_rgba(0,229,255,0.45)] transition-all">
<span class="material-symbols-outlined text-[24px]">qr_code_2</span>
<span>View QR Pass • Turnstile Unlock</span>
</button>
<span class="font-label-sm text-label-sm text-on-surface-variant">Tap device on arena gate reader or show dynamic barcode</span>
</div>
</div>
</div>
</section>
<!-- SECTION 4: QUICK MATCHMAKING (LFG - LOOKING FOR GROUP) -->
<section class="flex flex-col gap-space-md">
<!-- Header with Action -->
<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-space-xs">
<div class="flex flex-col gap-0.5">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-secondary-container text-[24px]">podium</span>
<h2 class="font-headline-md text-headline-md text-on-surface tracking-tight">Quick Matchmaking (LFG)</h2>
</div>
<p class="font-body-md text-body-md text-on-surface-variant">Active community beacons ready for instant flash entry • Auto escrow held</p>
</div>
<a class="flex items-center gap-1 font-label-lg text-label-lg text-primary-container hover:underline" href="#">
<span>View All LFG (18 Beacons)</span>
<span class="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
</div>
<!-- Active LFG Cards Grid -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
<!-- LFG Card 1: Badminton Doubles -->
<div class="relative rounded-2xl bg-surface-container-low/75 backdrop-blur-xl p-space-lg shadow-lg flex flex-col justify-between gap-space-md overflow-hidden group">
<!-- Accent Glow Line -->
<div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary-container/80 via-primary-container/80 to-transparent"></div>
<!-- Host Header Row -->
<div class="flex items-start justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">
<div class="relative">
<div class="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center font-headline-sm text-headline-sm text-primary font-bold overflow-hidden shadow-md">
                KT
              </div>
<span class="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 rounded-full bg-secondary-container ring-2 ring-surface"></span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-space-xs">
<span class="font-headline-sm text-headline-sm text-on-surface">Kiro Takahashi</span>
<span class="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary-container font-label-sm text-label-sm">99% Reliability</span>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">Host • 1,480 Elo Competitive</span>
</div>
</div>
<!-- Compatibility Pill -->
<div class="flex flex-col items-end">
<span class="px-2.5 py-1 rounded-full bg-secondary-container/15 text-secondary-fixed font-label-sm text-label-sm font-bold shadow-sm">
              98.4% Match Affinity
            </span>
<span class="font-label-sm text-[10px] text-on-surface-variant mt-1">Based on Court Pace</span>
</div>
</div>
<!-- Sport Details & Roster Visual -->
<div class="grid grid-cols-2 sm:grid-cols-3 gap-space-xs p-space-sm rounded-xl bg-surface-container-high/60">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Discipline</span>
<span class="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-primary">sports_tennis</span>
              Badminton Doubles
            </span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Schedule</span>
<span class="font-label-lg text-label-lg text-on-surface font-semibold">Tonight, 20:30</span>
<span class="font-body-sm text-[11px] text-secondary-fixed">Starts in 3h 15m</span>
</div>
<div class="col-span-2 sm:col-span-1 flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Requirement</span>
<span class="font-label-lg text-label-lg text-primary-container font-semibold">1,200+ Elo Range</span>
</div>
</div>
<!-- Slot Occupancy Visualizer (3 Filled + 1 Open Glowing) -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm p-space-sm rounded-xl bg-surface-container-low">
<div class="flex flex-col gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Court Roster: <strong class="text-secondary-fixed font-semibold">1 / 4 Needed</strong></span>
<div class="flex items-center gap-2">
<div class="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm font-bold">K</div>
<div class="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm font-bold">A</div>
<div class="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm font-bold">J</div>
<!-- Glowing empty slot -->
<div class="w-8 h-8 rounded-lg bg-secondary-container/20 text-secondary-container flex items-center justify-center font-label-sm text-label-sm font-bold animate-pulse shadow-[0_0_12px_rgba(52,255,140,0.5)]">
<span class="material-symbols-outlined text-[16px]">person_add</span>
</div>
</div>
</div>
<!-- Flash Claim Action Button -->
<button class="flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg font-bold hover:brightness-110 shadow-[0_0_20px_rgba(52,255,140,0.4)] transition-all">
<span class="material-symbols-outlined text-[20px]">bolt</span>
<span>Flash Claim • $5.00</span>
</button>
</div>
</div>
<!-- LFG Card 2: Tennis Singles -->
<div class="relative rounded-2xl bg-surface-container-low/75 backdrop-blur-xl p-space-lg shadow-lg flex flex-col justify-between gap-space-md overflow-hidden group">
<!-- Accent Glow Line -->
<div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-container/80 via-tertiary-container/80 to-transparent"></div>
<!-- Host Header Row -->
<div class="flex items-start justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">
<div class="relative">
<div class="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center font-headline-sm text-headline-sm text-secondary-container font-bold overflow-hidden shadow-md">
                ER
              </div>
<span class="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 rounded-full bg-secondary-container ring-2 ring-surface"></span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-space-xs">
<span class="font-headline-sm text-headline-sm text-on-surface">Elena Rostova</span>
<span class="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary-container font-label-sm text-label-sm">97% Reliability</span>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">Host • 1,410 Elo Competitive</span>
</div>
</div>
<!-- Compatibility Pill -->
<div class="flex flex-col items-end">
<span class="px-2.5 py-1 rounded-full bg-primary-container/15 text-primary font-label-sm text-label-sm font-bold shadow-sm">
              95.0% Match Affinity
            </span>
<span class="font-label-sm text-[10px] text-on-surface-variant mt-1">Direct Rank Pairing</span>
</div>
</div>
<!-- Sport Details & Roster Visual -->
<div class="grid grid-cols-2 sm:grid-cols-3 gap-space-xs p-space-sm rounded-xl bg-surface-container-high/60">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Discipline</span>
<span class="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-primary-container">sports_baseball</span>
              Tennis Fast Rally
            </span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Schedule</span>
<span class="font-label-lg text-label-lg text-on-surface font-semibold">Tomorrow, 08:30</span>
<span class="font-body-sm text-[11px] text-primary">Morning Kinetic Heat</span>
</div>
<div class="col-span-2 sm:col-span-1 flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Requirement</span>
<span class="font-label-lg text-label-lg text-primary-container font-semibold">1,350+ Elo Range</span>
</div>
</div>
<!-- Slot Occupancy Visualizer (1 Filled + 1 Open Glowing) -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm p-space-sm rounded-xl bg-surface-container-low">
<div class="flex flex-col gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Court Roster: <strong class="text-secondary-fixed font-semibold">1 / 2 Needed (Singles)</strong></span>
<div class="flex items-center gap-2">
<div class="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm font-bold">E</div>
<!-- Glowing empty slot -->
<div class="w-8 h-8 rounded-lg bg-secondary-container/20 text-secondary-container flex items-center justify-center font-label-sm text-label-sm font-bold animate-pulse shadow-[0_0_12px_rgba(52,255,140,0.5)]">
<span class="material-symbols-outlined text-[16px]">person_add</span>
</div>
</div>
</div>
<!-- Flash Claim Action Button -->
<button class="flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg font-bold hover:brightness-110 shadow-[0_0_20px_rgba(52,255,140,0.4)] transition-all">
<span class="material-symbols-outlined text-[20px]">bolt</span>
<span>Flash Claim • $8.00</span>
</button>
</div>
</div>
</div>
</section>
<!-- SECTION 5: LIVE VENUE TELEMETRY BAR -->
<section class="rounded-xl bg-surface-container-low/60 p-space-md flex flex-wrap items-center justify-between gap-space-md shadow-sm">
<div class="flex items-center gap-space-md">
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 rounded-full bg-secondary-container shadow-[0_0_8px_rgba(52,255,140,0.8)]"></span>
<span class="font-label-md text-label-md text-on-surface">Kinetic Arena - Court Node Live Status</span>
</div>
<div class="hidden md:flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
<span>Court 1: <strong class="text-on-surface">In Play (18-19)</strong></span>
<span class="text-outline">•</span>
<span>Court 2: <strong class="text-on-surface">Warmup</strong></span>
<span class="text-outline">•</span>
<span>Court 3: <strong class="text-secondary-fixed">Reserved (Your Slot)</strong></span>
<span class="text-outline">•</span>
<span>Court 4: <strong class="text-primary-container">Open for Flash</strong></span>
</div>
</div>
<div class="flex items-center gap-space-sm ml-auto">
<span class="font-label-sm text-label-sm text-on-surface-variant">Air Conditioning: 21°C • Humidity: 48% Optimal</span>
<button class="p-1 rounded-lg bg-surface-container-high text-on-surface hover:text-primary-container transition-colors">
<span class="material-symbols-outlined text-[18px]">refresh</span>
</button>
</div>
</section>
</div></main></div>
<script>
  document.querySelectorAll('[data-path="explore-courts"]').forEach((link) => { link.href = '/court'; });
  document.querySelectorAll('[data-path="community"]').forEach((link) => { link.href = '/community'; });
  document.querySelectorAll('[data-path="profile"]').forEach((link) => { link.href = '/profile'; });
  document.querySelectorAll('[data-path="wallet"]').forEach((link) => { link.href = '/wallet'; });
</script>
</body></html>`

function Dashboard() {
  return <iframe title="SportNexus Dashboard" srcDoc={dashboardPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default Dashboard