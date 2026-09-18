const profilePage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Outfit:wght@600;700;800&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config={darkMode:"class",theme:{extend:{colors:{"on-tertiary":"#002a78","surface-container-high":"#262a33","surface-container":"#1c2028","inverse-surface":"#dfe2ee","primary-fixed":"#9cf0ff","surface-dim":"#0f131c","on-background":"#dfe2ee","on-primary-fixed-variant":"#004f58","on-primary-container":"#00626e","on-secondary-container":"#007239","on-surface":"#dfe2ee","primary-container":"#00e5ff","on-primary":"#00363d","on-secondary":"#003919","on-tertiary-fixed":"#00174b","secondary":"#f5fff3","outline":"#849396","error-container":"#93000a","on-error-container":"#ffdad6","surface":"#0f131c","secondary-container":"#34ff8c","secondary-fixed-dim":"#00e478","surface-bright":"#353942","tertiary-fixed":"#dbe1ff","on-surface-variant":"#bac9cc","tertiary":"#e9ecff","tertiary-fixed-dim":"#b4c5ff","on-secondary-fixed-variant":"#005227","secondary-fixed":"#60ff98","surface-container-low":"#181c24","tertiary-container":"#c2cfff","on-secondary-fixed":"#00210c","on-error":"#690005","surface-tint":"#00daf3","outline-variant":"#3b494c","inverse-primary":"#006875","surface-variant":"#31353e","surface-container-highest":"#31353e","on-tertiary-container":"#004ecf","error":"#ffb4ab","surface-container-lowest":"#0a0e16","on-tertiary-fixed-variant":"#003ea8","primary-fixed-dim":"#00daf3","primary":"#c3f5ff","inverse-on-surface":"#2c3039","background":"#0f131c","on-primary-fixed":"#001f24"},borderRadius:{"DEFAULT":"0.25rem","lg":"0.5rem","xl":"0.75rem","full":"9999px"},spacing:{"space-xl":"2rem","margin-lg":"2rem","space-lg":"1.5rem","gutter":"1rem","space-xs":"0.25rem","margin-sm":"1rem","space-sm":"0.5rem","gutter-sm":"0.75rem","margin":"1.25rem","space-md":"1rem"},fontFamily:{"label-lg":["Outfit"],"body-sm":["Inter"],"headline-lg":["Outfit"],"label-sm":["Outfit"],"headline-md":["Outfit"],"display-lg-mobile":["Outfit"],"display-lg":["Outfit"],"headline-sm":["Outfit"],"body-md":["Inter"],"body-lg":["Inter"],"label-md":["Outfit"]},fontSize:{"label-lg":["14px",{lineHeight:"18px",letterSpacing:"0.04em",fontWeight:"600"}],"body-sm":["12px",{lineHeight:"16px",fontWeight:"400"}],"headline-lg":["28px",{lineHeight:"34px",letterSpacing:"-0.02em",fontWeight:"700"}],"label-sm":["10px",{lineHeight:"12px",letterSpacing:"0.08em",fontWeight:"700"}],"headline-md":["22px",{lineHeight:"28px",letterSpacing:"-0.01em",fontWeight:"600"}],"display-lg-mobile":["32px",{lineHeight:"36px",letterSpacing:"-0.02em",fontWeight:"800"}],"display-lg":["44px",{lineHeight:"48px",letterSpacing:"-0.03em",fontWeight:"800"}],"headline-sm":["18px",{lineHeight:"24px",fontWeight:"600"}],"body-md":["14px",{lineHeight:"20px",fontWeight:"400"}],"body-lg":["16px",{lineHeight:"24px",fontWeight:"400"}],"label-md":["12px",{lineHeight:"16px",letterSpacing:"0.06em",fontWeight:"600"}]}}}}</script><style>img[alt^="SportNexus logo mark"]{display:none!important}</style></head><body class="bg-background font-body-md text-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container"><header class="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-2xl shadow-[0_1px_16px_rgba(0,0,0,0.45)]"><div class="h-16 w-full px-margin-lg flex items-center justify-between"><div class="flex items-center gap-space-lg"><div class="flex items-center gap-space-sm"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg"/><div class="flex flex-col"><span class="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none uppercase font-bold">The Sport<span class="text-primary-container">Nexus</span></span><span class="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase">Athletic Matrix</span></div></div><div class="hidden xl:flex items-center gap-space-sm pl-space-md py-space-xs"><div class="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-full"><span class="w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_8px_#34ff8c] animate-pulse"></span><span class="font-label-sm text-label-sm text-secondary-container uppercase tracking-wider">Protocol v4.2 Live</span></div><div class="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-full text-on-surface-variant"><span class="material-symbols-outlined text-sm text-primary-container">speed</span><span class="font-label-sm text-label-sm">12ms Latency</span></div></div></div><nav class="hidden lg:flex items-center gap-space-xs bg-surface-container-lowest/70 p-1.5 rounded-full" data-active-classes="bg-primary-container text-on-primary-container font-headline-sm shadow-[0_0_20px_rgba(0,229,255,0.45)]"><a class="px-space-md py-1.5 rounded-full font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="dashboard" href="#">Dashboard</a><a class="px-space-md py-1.5 rounded-full font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="courts-and-bookings" href="#">Courts &amp; Bookings</a><a class="px-space-md py-1.5 rounded-full font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="matches-and-lfg" href="#">Matches &amp; LFG</a><a class="px-space-md py-1.5 rounded-full font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="tournaments" href="#">Tournaments</a><a aria-current="page" class="px-space-md py-1.5 rounded-full transition-all bg-primary-container text-on-primary-container font-headline-sm shadow-[0_0_20px_rgba(0,229,255,0.45)]" data-path="profile" href="#">Profile</a></nav><div class="flex items-center gap-space-md"><button aria-label="Notifications" class="relative p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"><span class="material-symbols-outlined">notifications</span><span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary-container rounded-full shadow-[0_0_10px_#00e5ff]"></span></button><div class="flex items-center gap-space-sm pl-space-xs"><div class="flex items-center gap-space-sm bg-surface-container-low hover:bg-surface-container px-space-sm py-1 rounded-full cursor-pointer transition-colors"><img alt="Profile" class="w-8 h-8 rounded-full object-cover shadow-[0_0_10px_rgba(0,229,255,0.3)]" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/><div class="hidden md:flex flex-col text-left pr-space-xs"><span class="font-label-md text-label-md text-on-surface leading-tight font-semibold">Hoang An</span><span class="font-label-sm text-label-sm text-primary-container uppercase tracking-wider">Pro Tier</span></div><span class="material-symbols-outlined text-on-surface-variant hidden md:inline-block text-base">expand_more</span></div></div></div></div></header><main class="w-full pt-16 bg-surface"><div class="flex flex-col w-full">
<div class="w-full px-margin md:px-margin-lg py-space-lg flex flex-col gap-space-xl max-w-[1600px] mx-auto">
<!-- Top Identity / Profile Kinetic Hub -->
<div class="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
<!-- Athlete Profile Hero Card -->
<div class="xl:col-span-4 flex flex-col justify-between bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-lg shadow-xl relative overflow-hidden group">
<!-- High-tech cyan ambient blur -->
<div class="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
<div class="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>
<div class="flex flex-col gap-space-md relative z-10">
<div class="flex items-start justify-between">
<div class="relative">
<div class="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary-container via-surface-bright to-secondary-container shadow-[0_0_24px_rgba(0,229,255,0.4)]">
<img class="w-full h-full rounded-full object-cover" data-alt="Athletic portrait of competitive Vietnamese badminton athlete Hoang An wearing sleek dark aerodynamic performance sportswear with subtle cyan neon rim illumination and high contrast futuristic sports arena backdrop" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaL9m0aF6p6ZCDAVXgtv5GGbcHB6YqWM64qr2CH2Xj7oiT-krG10srAIkhmT1e3yWXTMzHpp-1AkCZz0LU8M_wQphD11H-5DC3z-5vev8pDQ37OuKK9oGLbnhqdrKF1JxnZopn9-AYatwpWArVfIZtPSHr2H0wtcfYgbog1vW465emENxgE8T8aUuXQ0xKV5be_JvJig9pqgNQ1Bs1MfYhU-kZDR8IqlNtYe7rcx4EK8FiKRYEK7sI"/>
</div>
<span class="absolute bottom-0 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-lowest text-secondary-container shadow-[0_0_12px_#34ff8c]">
<span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">verified</span>
</span>
</div>
<div class="flex flex-col items-end gap-1">
<span class="px-space-sm py-0.5 rounded-full bg-primary-container/10 text-primary-container font-label-sm text-label-sm tracking-wider uppercase shadow-[0_0_12px_rgba(0,229,255,0.2)]">
                Division Gold II
              </span>
<span class="text-on-surface-variant font-label-sm text-label-sm tracking-widest uppercase">
                Regional Seed #14
              </span>
</div>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-2">
<h1 class="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">Hoang An</h1>
<span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">VN // APAC</span>
</div>
<p class="font-body-md text-body-md text-primary-container">@hoangan_smash</p>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
<span class="material-symbols-outlined text-xs text-secondary-container">history_toggle_off</span>
              Active Athlete since Jan 2024 • Verified Kinetic ID: 884-KX
            </p>
</div>
</div>
<!-- Quick Profile Ribbon Metrics -->
<div class="grid grid-cols-4 gap-2 pt-space-md mt-space-md bg-surface-container-lowest/60 rounded-lg p-space-sm relative z-10">
<div class="flex flex-col items-center justify-center text-center">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">142</span>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Matches</span>
</div>
<div class="flex flex-col items-center justify-center text-center">
<span class="font-headline-sm text-headline-sm text-secondary-container font-bold">68.4%</span>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Win Rate</span>
</div>
<div class="flex flex-col items-center justify-center text-center">
<span class="font-headline-sm text-headline-sm text-primary-container font-bold">5</span>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Cups</span>
</div>
<div class="flex flex-col items-center justify-center text-center">
<div class="flex items-center text-secondary-container">
<span class="font-headline-sm text-headline-sm font-bold">4W</span>
<span class="material-symbols-outlined text-xs ml-0.5">local_fire_department</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Streak</span>
</div>
</div>
</div>
<!-- Circular Radial Performance Gauges -->
<div class="xl:col-span-4 flex flex-col md:flex-row xl:flex-col gap-space-md">
<!-- Metric 1: Elo Rating Circular Ring -->
<div class="flex-1 bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-md flex items-center justify-between shadow-lg relative overflow-hidden">
<div class="flex flex-col gap-1 z-10">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#00e5ff]"></span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Global Rating Matrix</span>
</div>
<span class="font-headline-md text-headline-md text-on-surface font-bold">Badminton Elo</span>
<div class="flex items-center gap-2 mt-1">
<span class="px-2 py-0.5 rounded bg-primary-container/10 text-primary-container font-label-md text-label-md">Top 8% Global</span>
<span class="font-body-sm text-body-sm text-secondary-container flex items-center font-semibold">
<span class="material-symbols-outlined text-sm">trending_up</span>+65 this week
              </span>
</div>
</div>
<!-- SVG Radial Gauge Elo: 1450 / 2000 -->
<div class="relative w-28 h-28 flex items-center justify-center shrink-0">
<svg class="w-full h-full -rotate-90" viewbox="0 0 100 100">
<circle class="text-surface-container" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" stroke-width="8"></circle>
<circle class="text-primary-container transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" stroke-dasharray="251.2" stroke-dashoffset="69.0" stroke-linecap="round" stroke-width="8"></circle>
</svg>
<div class="absolute flex flex-col items-center justify-center">
<span class="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">1450</span>
<span class="font-label-sm text-label-sm text-primary-container uppercase">ELO</span>
</div>
</div>
</div>
<!-- Metric 2: Fairplay Score Circular Ring -->
<div class="flex-1 bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-md flex items-center justify-between shadow-lg relative overflow-hidden">
<div class="flex flex-col gap-1 z-10">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_8px_#34ff8c]"></span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Kinetic Sportsmanship</span>
</div>
<span class="font-headline-md text-headline-md text-on-surface font-bold">Fairplay Score</span>
<div class="flex items-center gap-2 mt-1">
<span class="px-2 py-0.5 rounded bg-secondary-container/10 text-secondary-container font-label-md text-label-md flex items-center gap-1">
<span class="material-symbols-outlined text-xs">shield</span>Prime Conduct
              </span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Zero Violations</span>
</div>
</div>
<!-- SVG Radial Gauge Fairplay: 95/100 -->
<div class="relative w-28 h-28 flex items-center justify-center shrink-0">
<svg class="w-full h-full -rotate-90" viewbox="0 0 100 100">
<circle class="text-surface-container" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" stroke-width="8"></circle>
<circle class="text-secondary-container transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" stroke-dasharray="251.2" stroke-dashoffset="12.5" stroke-linecap="round" stroke-width="8"></circle>
</svg>
<div class="absolute flex flex-col items-center justify-center">
<span class="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">95</span>
<span class="font-label-sm text-label-sm text-secondary-container uppercase">/100</span>
</div>
</div>
</div>
</div>
<!-- Hexagon Skill Telemetry Radar Chart -->
<div class="xl:col-span-4 bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-md shadow-xl flex flex-col justify-between relative overflow-hidden">
<div class="flex items-center justify-between mb-2">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary-container text-lg">radar</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Athletic Radar</h2>
</div>
<span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
            6-Axis Telemetry
          </span>
</div>
<!-- High-tech SVG Radar Visual -->
<div class="relative w-full aspect-square max-h-[220px] flex items-center justify-center">
<svg class="w-full h-full drop-shadow-[0_0_12px_rgba(0,229,255,0.25)]" viewbox="0 0 320 300">
<defs>
<lineargradient id="radarGrad" x1="0%" x2="100%" y1="0%" y2="100%">
<stop offset="0%" stop-color="#00e5ff" stop-opacity="0.55"></stop>
<stop offset="100%" stop-color="#34ff8c" stop-opacity="0.35"></stop>
</lineargradient>
</defs>
<!-- Concentric Grid Polygons (60%, 80%, 100%) -->
<polygon class="text-outline-variant/40" fill="none" points="160,50 245,100 245,200 160,250 75,200 75,100" stroke="currentColor" stroke-width="1"></polygon>
<polygon class="text-outline-variant/30" fill="none" points="160,70 227,110 227,190 160,230 93,190 93,110" stroke="currentColor" stroke-width="1"></polygon>
<polygon class="text-outline-variant/20" fill="none" points="160,90 210,120 210,180 160,210 110,180 110,120" stroke="currentColor" stroke-width="1"></polygon>
<!-- Axis radiating lines -->
<line class="text-outline-variant/30" stroke="currentColor" stroke-dasharray="2,2" stroke-width="1" x1="160" x2="160" y1="150" y2="50"></line>
<line class="text-outline-variant/30" stroke="currentColor" stroke-dasharray="2,2" stroke-width="1" x1="160" x2="245" y1="150" y2="100"></line>
<line class="text-outline-variant/30" stroke="currentColor" stroke-dasharray="2,2" stroke-width="1" x1="160" x2="245" y1="150" y2="200"></line>
<line class="text-outline-variant/30" stroke="currentColor" stroke-dasharray="2,2" stroke-width="1" x1="160" x2="160" y1="150" y2="250"></line>
<line class="text-outline-variant/30" stroke="currentColor" stroke-dasharray="2,2" stroke-width="1" x1="160" x2="75" y1="150" y2="200"></line>
<line class="text-outline-variant/30" stroke="currentColor" stroke-dasharray="2,2" stroke-width="1" x1="160" x2="75" y1="150" y2="100"></line>
<!-- Player Polygon Shape
                 Axes:
                 1. Smash Power (top): 88% -> 160, 62
                 2. Agility (top-right): 94% -> 240, 103
                 3. Net Precision (bottom-right): 82% -> 230, 191
                 4. Stamina (bottom): 90% -> 160, 240
                 5. Tactical IQ (bottom-left): 86% -> 87, 193
                 6. Reaction Time (top-left): 92% -> 82, 104
            -->
<polygon class="transition-all duration-700" fill="url(#radarGrad)" points="160,62 240,103 230,191 160,240 87,193 82,104" stroke="#00e5ff" stroke-width="2.5"></polygon>
<!-- Highlight Vertex Nodes -->
<circle class="fill-primary-container shadow-[0_0_8px_#00e5ff]" cx="160" cy="62" r="3.5"></circle>
<circle class="fill-secondary-container" cx="240" cy="103" r="3.5"></circle>
<circle class="fill-primary-container" cx="230" cy="191" r="3.5"></circle>
<circle class="fill-secondary-container" cx="160" cy="240" r="3.5"></circle>
<circle class="fill-primary-container" cx="87" cy="193" r="3.5"></circle>
<circle class="fill-secondary-container" cx="82" cy="104" r="3.5"></circle>
<!-- Axis Labels -->
<text class="fill-on-surface font-label-sm text-[11px] font-bold" text-anchor="middle" x="160" y="38">SMASH 88</text>
<text class="fill-secondary-container font-label-sm text-[10px] font-semibold" text-anchor="start" x="252" y="98">AGILITY 94</text>
<text class="fill-on-surface-variant font-label-sm text-[10px]" text-anchor="start" x="252" y="208">NET 82</text>
<text class="fill-on-surface font-label-sm text-[11px] font-semibold" text-anchor="middle" x="160" y="272">STAMINA 90</text>
<text class="fill-on-surface-variant font-label-sm text-[10px]" text-anchor="end" x="68" y="208">TACTICS 86</text>
<text class="fill-primary-container font-label-sm text-[10px] font-semibold" text-anchor="end" x="68" y="98">REACTION 92</text>
</svg>
</div>
<div class="flex items-center justify-between text-on-surface-variant pt-2">
<span class="font-body-sm text-body-sm">Calibrated via Arena OptoTrackers</span>
<span class="font-label-sm text-label-sm text-primary-container uppercase font-semibold">Top Decile</span>
</div>
</div>
</div>
<!-- Match History & Telemetry Section -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
<!-- Primary Match Feed (8 Cols) -->
<div class="lg:col-span-8 flex flex-col gap-space-md">
<!-- Filter and Search Action Control Bar -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-low/80 backdrop-blur-xl p-space-sm rounded-xl">
<div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
<button class="px-space-md py-1.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)]">
              All Matches
            </button>
<button class="px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md whitespace-nowrap">
              Badminton Singles
            </button>
<button class="px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md whitespace-nowrap">
              Badminton Doubles
            </button>
<button class="px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md whitespace-nowrap">
              Tournament Ranked
            </button>
</div>
<div class="flex items-center gap-2 shrink-0">
<div class="relative flex items-center">
<span class="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-sm">search</span>
<input class="bg-surface-container-highest/60 text-on-surface placeholder:text-on-surface-variant/60 text-body-sm font-body-sm pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-container w-44 sm:w-52" placeholder="Search opponent or court..." type="text"/>
</div>
<button class="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Date Range Filter">
<span class="material-symbols-outlined text-base">tune</span>
</button>
</div>
</div>
<div class="flex items-center justify-between px-1">
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">Recent Matches &amp; Verified Telemetry</h2>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Showing 5 of 142 Recorded</span>
</div>
<!-- Match Cards List -->
<div class="flex flex-col gap-space-sm">
<!-- Match 1 (WIN) -->
<div class="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-md shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high/60 transition-all">
<div class="flex items-center gap-space-md">
<div class="relative">
<img class="w-12 h-12 rounded-full object-cover" data-alt="Athletic portrait of competitive male badminton rival Marcus Vance in active training apparel with focused expression against gym backdrop" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPHIoH-pnmdZU-mmWT6F0A6xdwbVLDGNblSMzMAYkemdfGkv7Q8Gayt-O3eMVK9mbYcf4CF8uCHNackSX9Pv2xcKeQRuj1YHvOdDIGJ38NJBfCwC-bZcZCGkAzAsWYmY04brpcKcRuhhI0e4Cn-4XykX_CEShnLk0bRQTzr_Es3zHcqAOKzIHeuf0kVglYvxofBc6I5A9aNlVNjVB_va4V84vSVCwdEf7LJshZsvS6GCVb3Iz6u-Z3"/>
<span class="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface-container-lowest text-primary-container text-[10px]">
                  #18
                </span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold leading-tight">Marcus Vance</span>
<span class="text-on-surface-variant font-label-sm text-label-sm">Elo 1420</span>
</div>
<div class="flex items-center gap-2 mt-0.5">
<span class="font-body-sm text-body-sm text-on-surface-variant">Today, 18:30 • Kinetic Arena Court 3</span>
<span class="px-1.5 py-0.5 rounded bg-surface-container text-primary-container font-label-sm text-label-sm">Singles Ranked</span>
</div>
</div>
</div>
<div class="flex items-center justify-between md:justify-end w-full md:w-auto gap-space-lg">
<div class="flex flex-col items-start md:items-end">
<div class="flex items-center gap-2">
<span class="px-2.5 py-0.5 rounded-full bg-secondary-container/15 text-secondary-container font-label-md text-label-md font-bold uppercase shadow-[0_0_10px_rgba(52,255,140,0.2)]">
                    WIN
                  </span>
<span class="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">
                    21-18, 19-21, 21-16
                  </span>
</div>
<div class="flex items-center gap-2 mt-1">
<span class="font-label-md text-label-md text-secondary-container font-bold flex items-center">
<span class="material-symbols-outlined text-sm">arrow_upward</span>+12 ELO
                  </span>
<span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span class="material-symbols-outlined text-xs text-secondary-container">verified_user</span>Settled
                  </span>
</div>
</div>
<button class="px-space-md py-2 rounded-lg bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label-md text-label-md font-semibold transition-all whitespace-nowrap">
                Replay &amp; Telemetry
              </button>
</div>
</div>
<!-- Match 2 (WIN) -->
<div class="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-md shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high/60 transition-all">
<div class="flex items-center gap-space-md">
<div class="relative">
<img class="w-12 h-12 rounded-full object-cover" data-alt="Athletic portrait of female European badminton player Elena Rostova with intense focus in dark sports jersey" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp4igp4V13LoP_jedcQfAjWW7dOVQxwy9Z0FvUgHbYxg32lcnHDqvHj0q_kK5PpWSUoWfC1qOzDpfg6Pqsgp5jt8yvLX1dBPSrWhg60AHG7jGh5cAyyygYHXcHan1iz19iHCjIrWxbAI8GddVFK3DGRzn5CnmudxjS9Zk36L2Ven8IAG8iZjEjfrB7cl2Rpv_FKodNzO4KL6HhDGIHOGtjvnLNs_EMevZSA0qK08r07g-GRZIsooOs"/>
<span class="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface-container-lowest text-primary-container text-[10px]">
                  #11
                </span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold leading-tight">Elena Rostova</span>
<span class="text-on-surface-variant font-label-sm text-label-sm">Elo 1485</span>
</div>
<div class="flex items-center gap-2 mt-0.5">
<span class="font-body-sm text-body-sm text-on-surface-variant">Yesterday, 20:15 • Metro Badminton Hub</span>
<span class="px-1.5 py-0.5 rounded bg-surface-container text-primary-container font-label-sm text-label-sm">Singles Ranked</span>
</div>
</div>
</div>
<div class="flex items-center justify-between md:justify-end w-full md:w-auto gap-space-lg">
<div class="flex flex-col items-start md:items-end">
<div class="flex items-center gap-2">
<span class="px-2.5 py-0.5 rounded-full bg-secondary-container/15 text-secondary-container font-label-md text-label-md font-bold uppercase shadow-[0_0_10px_rgba(52,255,140,0.2)]">
                    WIN
                  </span>
<span class="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">
                    21-19, 21-14
                  </span>
</div>
<div class="flex items-center gap-2 mt-1">
<span class="font-label-md text-label-md text-secondary-container font-bold flex items-center">
<span class="material-symbols-outlined text-sm">arrow_upward</span>+18 ELO
                  </span>
<span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span class="material-symbols-outlined text-xs text-secondary-container">check_circle</span>Verified
                  </span>
</div>
</div>
<button class="px-space-md py-2 rounded-lg bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label-md text-label-md font-semibold transition-all whitespace-nowrap">
                View Stats
              </button>
</div>
</div>
<!-- Match 3 (LOSS) -->
<div class="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-md shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high/60 transition-all">
<div class="flex items-center gap-space-md">
<div class="relative">
<img class="w-12 h-12 rounded-full object-cover" data-alt="Athletic portrait of competitive Japanese badminton tournament finalist Daisuke Tanaka wearing dark charcoal athletic head wrap and jersey" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9e-QLDVmA2AG-cEBZVe1aL2NvvCVxEUtBdE7lTGU-wdR7NiWHu9Z-6etbcwMCQ_5xswURuDK-RWXb9pPEoMLdKrmfZIrJUtL89QZs4xfgUdAsUU0be5CTrUrTWRrLohb9FMVApGpZCnOK9yipjTX7NXQ94kbdVZbWrsa6waMxki-coaZ5mLbWxwNgsOgM6jBgRuciFwJKKz0Hlw0at4XjYYjE44VIcO2c7lUaFTiM9hPVRLQrD-IX"/>
<span class="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface-container-lowest text-primary-container text-[10px]">
                  #07
                </span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold leading-tight">Daisuke Tanaka</span>
<span class="text-on-surface-variant font-label-sm text-label-sm">Elo 1510</span>
</div>
<div class="flex items-center gap-2 mt-0.5">
<span class="font-body-sm text-body-sm text-on-surface-variant">Oct 12, 17:00 • Nexus Prime Court 1</span>
<span class="px-1.5 py-0.5 rounded bg-tertiary-container/20 text-tertiary-fixed font-label-sm text-label-sm">Tournament Semis</span>
</div>
</div>
</div>
<div class="flex items-center justify-between md:justify-end w-full md:w-auto gap-space-lg">
<div class="flex flex-col items-start md:items-end">
<div class="flex items-center gap-2">
<span class="px-2.5 py-0.5 rounded-full bg-error-container/40 text-error font-label-md text-label-md font-bold uppercase shadow-[0_0_10px_rgba(255,180,171,0.15)]">
                    LOSS
                  </span>
<span class="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">
                    18-21, 21-17, 19-21
                  </span>
</div>
<div class="flex items-center gap-2 mt-1">
<span class="font-label-md text-label-md text-error font-bold flex items-center">
<span class="material-symbols-outlined text-sm">arrow_downward</span>-8 ELO
                  </span>
<span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span class="material-symbols-outlined text-xs text-primary-container">gavel</span>BWF Standard
                  </span>
</div>
</div>
<button class="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface font-label-md text-label-md font-semibold transition-all whitespace-nowrap">
                Match Analysis
              </button>
</div>
</div>
<!-- Match 4 (WIN) -->
<div class="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-md shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high/60 transition-all">
<div class="flex items-center gap-space-md">
<div class="relative flex -space-x-4">
<img class="w-12 h-12 rounded-full object-cover" data-alt="Athletic avatar of badminton doubles competitor Liam O'Connor in high dynamic lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtU-4SzSs1lh9ajkew-_hNcZP-C51JdrHTsewCWBxQESV50v2WiAkfM406ELjmmnw53t6uJHuI8v_SUNfATMRqmbLeMSYabtbARfhzQShS0rRuIVZkDGSaZU3_Bh6SvIxGZbzcBXhITPaoX2gBBWSq1Bj1T7VPPi4RzWbhP-CgwW80dnjAeS3dvTQEOWJM57pHwG0eDYfJBBasj8qArqGA2Ie5M-qmDh1Istk21NwYw6iPtvPUG1Ki"/>
<img class="w-12 h-12 rounded-full object-cover ring-2 ring-surface-dim" data-alt="Athletic avatar of doubles teammate Alex R. in matching performance apparel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2Xx6lgYNBiwuapnqadWz0rvya2mDsmsMjFvhOfPGoLLiUu0OPhokBDkhxIr7568mxeQHAjFIP5KZMhMQHlipeM5vgTJKT3M_hXkPfA-Y-2wUwp4tjoAmxlCia3ZzDbu-2NNqQbEIO9Vey9wbE1sV3tMvV7RYIl0370vynXmLnvMYdSdivTrM2wiBuIke4rZuU85jhC9G0pZOdmNIqPmUlffYN6TBxZPr1qVUL4mfBQyuBN6ge0wSh"/>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold leading-tight">Liam O'Connor &amp; Alex R.</span>
<span class="text-on-surface-variant font-label-sm text-label-sm">Avg Elo 1435</span>
</div>
<div class="flex items-center gap-2 mt-0.5">
<span class="font-body-sm text-body-sm text-on-surface-variant">Oct 10, 19:45 • CyberTurf Arena</span>
<span class="px-1.5 py-0.5 rounded bg-surface-container text-primary-container font-label-sm text-label-sm">Doubles Ranked</span>
</div>
</div>
</div>
<div class="flex items-center justify-between md:justify-end w-full md:w-auto gap-space-lg">
<div class="flex flex-col items-start md:items-end">
<div class="flex items-center gap-2">
<span class="px-2.5 py-0.5 rounded-full bg-secondary-container/15 text-secondary-container font-label-md text-label-md font-bold uppercase shadow-[0_0_10px_rgba(52,255,140,0.2)]">
                    WIN
                  </span>
<span class="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">
                    21-15, 21-13
                  </span>
</div>
<div class="flex items-center gap-2 mt-1">
<span class="font-label-md text-label-md text-secondary-container font-bold flex items-center">
<span class="material-symbols-outlined text-sm">arrow_upward</span>+14 ELO
                  </span>
<span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span class="material-symbols-outlined text-xs text-secondary-container">verified_user</span>Settled
                  </span>
</div>
</div>
<button class="px-space-md py-2 rounded-lg bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label-md text-label-md font-semibold transition-all whitespace-nowrap">
                View Details
              </button>
</div>
</div>
<!-- Match 5 (WIN) -->
<div class="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-md shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high/60 transition-all">
<div class="flex items-center gap-space-md">
<div class="relative">
<img class="w-12 h-12 rounded-full object-cover" data-alt="Athletic avatar of Asian badminton athlete Chen Wei wearing training tank top in indoor stadium lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkus1eieHVal3kbaUCJErQ6C95lGsMcSlCW_qoOlVJuDzLDC4HJlQXqd0w4sZ4W0XL6XzmOlxN0t0IXVoFvZWzSh9NbTSIP1wuYbr7Z6jXuD63ahP_oNNiCpoICpzRjudX280d8590dYkZIB506WOAYE59lYvSJxtNlx1XapKi_eiAFeyxp1wKLDsD8jsH6OS5GbvmLzILlvnLb6ccJJHSbPNOQT7ZTnqg6Rtd0pDt1hytYRPG1V2I"/>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold leading-tight">Chen Wei</span>
<span class="text-on-surface-variant font-label-sm text-label-sm">Elo 1440</span>
</div>
<div class="flex items-center gap-2 mt-0.5">
<span class="font-body-sm text-body-sm text-on-surface-variant">Oct 08, 16:30 • Olympic Park Facility</span>
<span class="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Friendly LFG</span>
</div>
</div>
</div>
<div class="flex items-center justify-between md:justify-end w-full md:w-auto gap-space-lg">
<div class="flex flex-col items-start md:items-end">
<div class="flex items-center gap-2">
<span class="px-2.5 py-0.5 rounded-full bg-secondary-container/15 text-secondary-container font-label-md text-label-md font-bold uppercase shadow-[0_0_10px_rgba(52,255,140,0.2)]">
                    WIN
                  </span>
<span class="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">
                    21-12, 21-16
                  </span>
</div>
<div class="flex items-center gap-2 mt-1">
<span class="font-label-md text-label-md text-secondary-container font-bold flex items-center">
<span class="material-symbols-outlined text-sm">arrow_upward</span>+9 ELO
                  </span>
<span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span class="material-symbols-outlined text-xs text-secondary-container">check_circle</span>Verified
                  </span>
</div>
</div>
<button class="px-space-md py-2 rounded-lg bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label-md text-label-md font-semibold transition-all whitespace-nowrap">
                View Details
              </button>
</div>
</div>
</div>
</div>
<!-- Tactical Analytics Sidebar (4 Cols) -->
<div class="lg:col-span-4 flex flex-col gap-space-md">
<!-- Performance Trends Sparkline Card -->
<div class="bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-lg shadow-xl flex flex-col gap-space-md">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary-container">show_chart</span>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Elo Trajectory</h3>
</div>
<span class="px-2 py-0.5 rounded bg-surface-container text-secondary-container font-label-sm text-label-sm font-semibold">+65 Net</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant">7-day competitive rating momentum based on verified matches.</p>
<!-- SVG Bar Sparkline Visual -->
<div class="h-32 w-full flex items-end justify-between gap-2 pt-4 px-1">
<div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
<div class="w-full bg-surface-container rounded-t group-hover:bg-primary-container transition-all" style="height: 48%"></div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Mon</span>
</div>
<div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
<div class="w-full bg-surface-container rounded-t group-hover:bg-primary-container transition-all" style="height: 60%"></div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Tue</span>
</div>
<div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
<div class="w-full bg-surface-container rounded-t group-hover:bg-primary-container transition-all" style="height: 52%"></div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Wed</span>
</div>
<div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
<div class="w-full bg-surface-container rounded-t group-hover:bg-primary-container transition-all" style="height: 75%"></div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Thu</span>
</div>
<div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
<div class="w-full bg-surface-container rounded-t group-hover:bg-primary-container transition-all" style="height: 68%"></div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Fri</span>
</div>
<div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
<div class="w-full bg-secondary-container/80 rounded-t shadow-[0_0_10px_#34ff8c] transition-all" style="height: 86%"></div>
<span class="font-label-sm text-label-sm text-secondary-container font-bold">Sat</span>
</div>
<div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
<div class="w-full bg-primary-container rounded-t shadow-[0_0_12px_#00e5ff] transition-all" style="height: 94%"></div>
<span class="font-label-sm text-label-sm text-primary-container font-bold">Today</span>
</div>
</div>
</div>
<!-- Venue Dominance / Favorite Court Card -->
<div class="bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-md shadow-xl flex items-center justify-between gap-space-md">
<div class="flex items-center gap-space-md">
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary-container">
<span class="material-symbols-outlined text-2xl">stadium</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm uppercase text-on-surface-variant">Dominant Ground</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">Kinetic Arena</span>
<span class="font-body-sm text-body-sm text-secondary-container">64% of total matches played</span>
</div>
</div>
<span class="px-2 py-1 rounded bg-surface-container-high text-primary-container font-label-md text-label-md font-semibold">
            Home Court
          </span>
</div>
<!-- Nemesis / Rival Encounter Card -->
<div class="bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-md shadow-xl flex items-center justify-between gap-space-md">
<div class="flex items-center gap-space-md">
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary-container">
<span class="material-symbols-outlined text-2xl">swords</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm uppercase text-on-surface-variant">Most Frequent Rival</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">Marcus Vance</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">5 Encounters • 4W - 1L Head-to-Head</span>
</div>
</div>
<button class="p-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-primary-container transition-colors" title="View Rivalry Dossier">
<span class="material-symbols-outlined text-base">chevron_right</span>
</button>
</div>
<!-- Kinetic Challenge CTA Panel -->
<div class="bg-gradient-to-br from-surface-container to-surface-container-lowest rounded-xl p-space-md shadow-xl flex flex-col gap-space-sm relative overflow-hidden">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
<span class="font-label-sm text-label-sm text-primary-container uppercase font-bold tracking-wider">Instant Queue Ready</span>
</div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Issue Open Arena Challenge</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant">Dispatch an algorithmic open match invitation to players within +/-50 Elo range at Kinetic Arena.</p>
<button class="mt-2 w-full py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-lg">bolt</span>
            Deploy Match Beacon
          </button>
</div>
</div>
</div>
</div>
</div></main><footer class="w-full bg-surface-container-lowest mt-space-xl py-space-xl"><div class="w-full px-margin-lg flex flex-col md:flex-row items-center justify-between gap-space-md"><div class="flex items-center gap-space-sm"><span class="font-headline-sm text-headline-sm text-on-surface uppercase tracking-tight">The SportNexus</span><span class="font-body-sm text-body-sm text-on-surface-variant">— Next-Gen Sports Infrastructure &amp; Kinetic Arena Network</span></div><div class="flex items-center gap-space-lg"><span class="font-body-sm text-body-sm text-on-surface-variant">© 2024 The SportNexus OS. All protocols active.</span><div class="flex items-center gap-space-xs"><span class="w-2 h-2 rounded-full bg-secondary-container"></span><span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Network Operational</span></div></div></div></footer></body></html>`

function Profile() {
  return <iframe title="SportNexus Profile" srcDoc={profilePage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default Profile
