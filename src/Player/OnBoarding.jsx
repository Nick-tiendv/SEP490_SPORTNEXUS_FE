const onBoardingPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Outfit:wght@500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config = { darkMode: "class", theme: { extend: { "colors": { "on-tertiary-fixed-variant": "#003ea8", "secondary-container": "#34ff8c", "surface-variant": "#31353e", "surface-container": "#1c2028", "tertiary-fixed-dim": "#b4c5ff", "on-surface-variant": "#bac9cc", "primary-fixed": "#9cf0ff", "error-container": "#93000a", "outline": "#849396", "surface": "#0f131c", "on-error-container": "#ffdad6", "secondary-fixed-dim": "#00e478", "on-surface": "#dfe2ee", "on-primary-container": "#00626e", "surface-bright": "#353942", "outline-variant": "#3b494c", "on-tertiary-container": "#004ecf", "primary-container": "#00e5ff", "on-tertiary": "#002a78", "inverse-surface": "#dfe2ee", "surface-container-highest": "#31353e", "on-secondary-fixed": "#00210c", "inverse-on-surface": "#2c3039", "on-primary-fixed-variant": "#004f58", "secondary": "#f5fff3", "tertiary-fixed": "#dbe1ff", "surface-dim": "#0f131c", "primary-fixed-dim": "#00daf3", "surface-tint": "#00daf3", "on-primary-fixed": "#001f24", "inverse-primary": "#006875", "surface-container-lowest": "#0a0e16", "secondary-fixed": "#60ff98", "on-secondary-container": "#007239", "on-background": "#dfe2ee", "tertiary": "#e9ecff", "on-secondary": "#003919", "surface-container-low": "#181c24", "on-tertiary-fixed": "#00174b", "on-secondary-fixed-variant": "#005227", "primary": "#c3f5ff", "surface-container-high": "#262a33", "error": "#ffb4ab", "on-primary": "#00363d", "on-error": "#690005", "background": "#0f131c", "tertiary-container": "#c2cfff" }, "borderRadius": { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" }, "spacing": { "space-lg": "1.5rem", "space-xs": "0.25rem", "space-xl": "2rem", "gutter": "1rem", "gutter-sm": "0.75rem", "margin-lg": "2rem", "margin-sm": "1rem", "space-sm": "0.5rem", "space-md": "1rem", "margin": "1.25rem" }, "fontFamily": { "label-md": ["Outfit"], "body-md": ["Inter"], "display-lg-mobile": ["Outfit"], "headline-sm": ["Outfit"], "body-sm": ["Inter"], "headline-md": ["Outfit"], "display-lg": ["Outfit"], "headline-lg": ["Outfit"], "body-lg": ["Inter"], "label-sm": ["Outfit"], "label-lg": ["Outfit"] }, "fontSize": { "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.06em", "fontWeight": "600" }], "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }], "display-lg-mobile": ["32px", { "lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "800" }], "headline-sm": ["18px", { "lineHeight": "24px", "fontWeight": "600" }], "body-sm": ["12px", { "lineHeight": "16px", "fontWeight": "400" }], "headline-md": ["22px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }], "display-lg": ["44px", { "lineHeight": "48px", "letterSpacing": "-0.03em", "fontWeight": "800" }], "headline-lg": ["28px", { "lineHeight": "34px", "letterSpacing": "-0.02em", "fontWeight": "700" }], "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }], "label-sm": ["10px", { "lineHeight": "12px", "letterSpacing": "0.08em", "fontWeight": "700" }], "label-lg": ["14px", { "lineHeight": "18px", "letterSpacing": "0.04em", "fontWeight": "600" }] } } } };</script><style>img[alt^="SportNexus logo mark"]{display:none!important}</style></head><body class="bg-surface font-body-md text-body-md text-on-surface min-h-screen relative selection:bg-primary-container selection:text-on-primary-container"><div class="fixed inset-0 pointer-events-none overflow-hidden z-0"><div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-container/5 rounded-full blur-[140px]"></div><div class="absolute top-1/2 right-10 w-[500px] h-[350px] bg-secondary-container/5 rounded-full blur-[130px]"></div></div><header class="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-2xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]"><div class="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between"><div class="flex items-center gap-space-md"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg"/><div class="flex items-center gap-space-sm"><span class="font-headline-sm text-headline-sm text-on-surface tracking-tight uppercase">SportNexus</span><span class="hidden sm:inline-block font-label-sm text-label-sm uppercase px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">Athletic OS</span></div></div><div class="hidden md:flex items-center gap-space-md bg-surface-container/60 backdrop-blur-md px-space-md py-1.5 rounded-full"><div class="flex items-center gap-space-xs"><span class="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span><span class="font-label-sm text-label-sm uppercase text-on-surface-variant">Setup Flow</span></div><span class="w-1 h-1 rounded-full bg-outline-variant"></span><nav class="flex items-center gap-space-md" data-active-classes="text-primary-container font-headline-sm"><a aria-current="page" class="transition-colors text-primary-container font-headline-sm" data-path="profile-setup" href="#">Profile</a><a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="sport-preferences" href="#">Preferences</a><a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="skill-assessment" href="#">Skill Matrix</a><a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" data-path="club-connection" href="#">Venues</a></nav></div><div class="flex items-center gap-space-md"><div class="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low"><span class="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim"></span><span class="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">System Online</span></div><div class="flex items-center gap-space-sm pl-space-xs"><img alt="Profile" class="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/20" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/><div class="hidden lg:flex flex-col text-left"><span class="font-label-sm text-label-sm text-on-surface leading-none">Cadet Alpha</span><span class="font-body-sm text-body-sm text-on-surface-variant leading-none mt-0.5">Unranked</span></div></div></div></div></header><main class="w-full pt-16 relative z-10 min-h-screen flex flex-col justify-center"><div class="flex flex-col w-full relative">
<div class="relative w-full py-space-xl px-margin flex items-center justify-center overflow-hidden">
<div class="absolute inset-0 z-0">
<img alt="Cybernetic arena" class="w-full h-full object-cover object-center opacity-35 filter brightness-75 contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL_ctv9ZLHc4RU6zm385aSGcsOGMClC0ruU45DGoyZA6mH7s52AETuUgajkDbDgJZxPA4zaLFQbVpCPg04ZiB58wj0Tfgi2w7zpAKOE_bM9hAHRQt3o6RQ_mQDqJrmTZ_9sBz4y21PSegs2G88H37MYn68RaOHsLCK86PSiKvAfQdTmVqaGYG3SCzD1DeiZS66IBQ4-ZZyz2te9kudx9DroFVp63P3HDPHbJACjaJrXDtrhbiV39OT"/>
<div class="absolute inset-0 bg-gradient-to-b from-surface/90 via-surface/80 to-surface-container-lowest"></div>
<div class="absolute -top-40 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
<div class="absolute -bottom-40 right-1/4 w-96 h-96 bg-secondary-fixed/10 rounded-full blur-[140px] pointer-events-none"></div>
</div>
<div class="relative z-10 w-full max-w-5xl">
<div class="relative rounded-2xl bg-surface-container-low/75 backdrop-blur-2xl shadow-2xl overflow-hidden p-space-md sm:p-space-lg md:p-space-xl transition-all">
<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-secondary-fixed to-primary-fixed-dim"></div>
<div class="flex flex-col gap-space-sm mb-space-lg">
<div class="flex items-center justify-between flex-wrap gap-space-sm">
<div class="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high/80">
<span class="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed">Calibration Protocol • Step 01/02</span>
</div>
<div class="flex items-center gap-space-sm">
<span class="font-label-sm text-label-sm uppercase text-on-surface-variant">Profile Accuracy</span>
<span class="font-label-md text-label-md text-primary-container">65% Active</span>
</div>
</div>
<div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-xs">
<h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Welcome to SportNexus, <span class="bg-gradient-to-r from-primary-container to-secondary-fixed bg-clip-text text-transparent">Hoang An</span>. Let's calibrate.
            </h1>
</div>
<p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Personalize your athletic passport to unlock algorithmic matchmaking, smart venue dispatching, and dynamic Elo progression.
          </p>
<div class="mt-space-sm w-full bg-surface-container rounded-full h-1.5 overflow-hidden flex">
<div class="bg-gradient-to-r from-primary-container to-secondary-fixed h-full w-[65%] transition-all duration-700"></div>
</div>
</div>
<section aria-labelledby="step-sports-heading" class="mb-space-xl">
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-md">
<div>
<div class="flex items-center gap-space-xs">
<span class="flex items-center justify-center w-5 h-5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm">1</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface" id="step-sports-heading">Select Your Disciplines</h2>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Choose primary or secondary focus sports (multi-select active).</p>
</div>
<span class="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider self-start sm:self-auto px-space-sm py-0.5 rounded bg-secondary-fixed/10">2 Selected</span>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md" id="sportsGrid">
<button class="sport-card group text-left relative p-space-md rounded-xl transition-all duration-300 flex flex-col justify-between h-48 bg-surface-container-high/60 shadow-lg shadow-primary-container/5 hover:scale-[1.02]" data-sport="badminton" type="button">
<div class="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-md">
<span class="material-symbols-outlined text-sm font-bold">check</span>
</div>
<div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary-container shadow-inner">
<svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewbox="0 0 24 24">
<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity="0.3"></path>
<circle cx="12" cy="12" fill="currentColor" r="3"></circle>
<path d="m14 14 5 5m-2-7 4 4m-7-2 4 4" stroke-width="2.5"></path>
</svg>
</div>
<div>
<span class="inline-block font-label-sm text-label-sm uppercase px-space-xs py-0.5 rounded bg-primary-container/15 text-primary-container mb-1">Primary Focus</span>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Badminton</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">Fast-Paced Racquet</p>
</div>
</button>
<button class="sport-card group text-left relative p-space-md rounded-xl transition-all duration-300 flex flex-col justify-between h-48 bg-surface-container/50 hover:bg-surface-container-high/70 hover:scale-[1.02]" data-sport="football" type="button">
<div class="badge-check hidden absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-md">
<span class="material-symbols-outlined text-sm font-bold">check</span>
</div>
<div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-secondary-fixed transition-colors">
<svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewbox="0 0 24 24">
<circle cx="12" cy="12" r="9"></circle>
<polygon fill="currentColor" fill-opacity="0.2" points="12 7 15 9.5 14 13.5 10 13.5 9 9.5"></polygon>
<path d="M12 7V3M15 9.5l3.5-1.5M14 13.5l2.5 3M10 13.5l-2.5 3M9 9.5L5.5 8"></path>
</svg>
</div>
<div>
<span class="inline-block font-label-sm text-label-sm uppercase px-space-xs py-0.5 rounded bg-surface-container-highest text-on-surface-variant mb-1">Casual / League</span>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Football</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">11v11 &amp; 5v5 Turf</p>
</div>
</button>
<button class="sport-card group text-left relative p-space-md rounded-xl transition-all duration-300 flex flex-col justify-between h-48 bg-surface-container-high/60 shadow-lg shadow-secondary-fixed/5 hover:scale-[1.02]" data-sport="tennis" type="button">
<div class="absolute top-3 right-3 w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary shadow-md">
<span class="material-symbols-outlined text-sm font-bold">check</span>
</div>
<div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-secondary-fixed shadow-inner">
<svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewbox="0 0 24 24">
<circle cx="12" cy="12" r="9"></circle>
<path d="M5.5 8C8 10 9 14 8 18.5"></path>
<path d="M18.5 5.5C16 8 15 12 16 16.5"></path>
</svg>
</div>
<div>
<span class="inline-block font-label-sm text-label-sm uppercase px-space-xs py-0.5 rounded bg-secondary-fixed/20 text-secondary-fixed mb-1">Ranked Ready</span>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Tennis</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">Clay, Hard &amp; Grass</p>
</div>
</button>
<button class="sport-card group text-left relative p-space-md rounded-xl transition-all duration-300 flex flex-col justify-between h-48 bg-surface-container/50 hover:bg-surface-container-high/70 hover:scale-[1.02]" data-sport="basketball" type="button">
<div class="badge-check hidden absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-md">
<span class="material-symbols-outlined text-sm font-bold">check</span>
</div>
<div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary-container transition-colors">
<svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewbox="0 0 24 24">
<circle cx="12" cy="12" r="9"></circle>
<path d="M3 12h18M12 3a9 9 0 0 1 0 18M12 3a9 9 0 0 0 0 18"></path>
<path d="M5 5l14 14M5 19L19 5" opacity="0.3" stroke-dasharray="2 2"></path>
</svg>
</div>
<div>
<span class="inline-block font-label-sm text-label-sm uppercase px-space-xs py-0.5 rounded bg-surface-container-highest text-on-surface-variant mb-1">Pick-up Games</span>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Basketball</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">Half &amp; Full Court</p>
</div>
</button>
</div>
</section>
<section aria-labelledby="step-elo-heading" class="mb-space-xl p-space-lg rounded-xl bg-surface-container/40 backdrop-blur-md">
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-lg">
<div>
<div class="flex items-center gap-space-xs">
<span class="flex items-center justify-center w-5 h-5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm">2</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface" id="step-elo-heading">Self-Assess Skill Matrix</h2>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Calibrates your starting matchmaking bracket &amp; dynamic handicap.</p>
</div>
<div class="flex items-center gap-space-sm bg-surface-container-high px-space-md py-1.5 rounded-full">
<span class="font-label-sm text-label-sm uppercase text-on-surface-variant">Current Target:</span>
<span class="font-label-md text-label-md text-primary-container" id="tierLabel">Intermediate Competitive</span>
<span class="font-label-sm text-label-sm bg-primary-container/20 text-primary-container px-2 py-0.5 rounded-full font-bold" id="eloValueBadge">1450 Elo</span>
</div>
</div>
<div class="relative py-space-sm mb-space-md px-1">
<div class="relative w-full h-3 bg-surface-container-highest rounded-full overflow-visible">
<div class="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-container via-primary-fixed-dim to-secondary-fixed rounded-full w-[65%]" id="sliderFill"></div>
<div class="absolute top-1/2 left-[65%] -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary shadow-xl shadow-primary-container/50 cursor-pointer flex items-center justify-center ring-4 ring-primary-container/30" id="sliderThumb">
<div class="w-2 h-2 rounded-full bg-surface-container-lowest"></div>
</div>
</div>
<input aria-label="Elo calibration slider" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" id="eloRange" max="2200" min="800" step="25" type="range" value="1450"/>
</div>
<div class="grid grid-cols-2 md:grid-cols-5 gap-space-sm pt-space-xs text-left" id="tierDescriptions">
<div class="p-space-xs rounded-lg transition-colors" data-tier="beginner">
<span class="font-label-sm text-label-sm uppercase text-on-surface-variant block">Beginner</span>
<span class="font-label-sm text-label-sm text-on-surface block font-bold">800 - 1000</span>
<p class="font-body-sm text-body-sm text-on-surface-variant/80 mt-1 line-clamp-2">Learning court rules &amp; basic swings.</p>
</div>
<div class="p-space-xs rounded-lg transition-colors" data-tier="novice">
<span class="font-label-sm text-label-sm uppercase text-on-surface-variant block">Novice</span>
<span class="font-label-sm text-label-sm text-on-surface block font-bold">1001 - 1250</span>
<p class="font-body-sm text-body-sm text-on-surface-variant/80 mt-1 line-clamp-2">Sustained rallies &amp; zone awareness.</p>
</div>
<div class="p-space-xs rounded-lg bg-surface-container-high/80 transition-colors" data-tier="intermediate">
<span class="font-label-sm text-label-sm uppercase text-primary-container block">Intermediate</span>
<span class="font-label-sm text-label-sm text-on-surface block font-bold">1251 - 1500</span>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">Controlled smashes, tactical footwork.</p>
</div>
<div class="p-space-xs rounded-lg transition-colors" data-tier="advanced">
<span class="font-label-sm text-label-sm uppercase text-on-surface-variant block">Advanced</span>
<span class="font-label-sm text-label-sm text-on-surface block font-bold">1501 - 1800</span>
<p class="font-body-sm text-body-sm text-on-surface-variant/80 mt-1 line-clamp-2">High velocity, tournament regular.</p>
</div>
<div class="p-space-xs rounded-lg transition-colors" data-tier="pro">
<span class="font-label-sm text-label-sm uppercase text-on-surface-variant block">Pro Circuit</span>
<span class="font-label-sm text-label-sm text-on-surface block font-bold">1801 - 2200+</span>
<p class="font-body-sm text-body-sm text-on-surface-variant/80 mt-1 line-clamp-2">State / National circuit ranked.</p>
</div>
</div>
<div class="flex flex-wrap items-center gap-space-sm mt-space-md pt-space-md">
<div class="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-high/60">
<span class="material-symbols-outlined text-secondary-fixed text-base">bolt</span>
<span class="font-label-sm text-label-sm text-on-surface">Queue: Instant Dispatch</span>
</div>
<div class="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-high/60">
<span class="material-symbols-outlined text-primary-container text-base">verified_user</span>
<span class="font-label-sm text-label-sm text-on-surface">Escrow: Tier 1 Protected</span>
</div>
<div class="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-high/60">
<span class="material-symbols-outlined text-secondary-container text-base">military_tech</span>
<span class="font-label-sm text-label-sm text-on-surface">Fairplay Seed: +25 XP</span>
</div>
</div>
</section>
<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md pt-space-sm">
<div class="flex flex-col">
<div class="flex items-center gap-space-xs text-on-surface-variant">
<span class="material-symbols-outlined text-sm">lock</span>
<span class="font-body-sm text-body-sm">Recalibration enabled after 3 ranked placements.</span>
</div>
<a class="font-label-sm text-label-sm text-outline hover:text-primary-container transition-colors mt-1 underline underline-offset-4" href="#">
              Skip calibration (Seed default 1200 Elo)
            </a>
</div>
<div class="flex items-center gap-space-md">
<button class="group relative px-space-lg py-3 rounded-xl bg-gradient-to-r from-primary-container via-primary-fixed to-secondary-fixed text-on-primary-container font-headline-sm text-headline-sm uppercase tracking-wider flex items-center justify-center gap-space-sm shadow-xl shadow-primary-container/20 hover:shadow-primary-container/40 hover:scale-[1.02] active:scale-[0.99] transition-all" id="submitSetup" onclick="window.top.location.href='/dashboard'" type="button">
<span>Complete Setup &amp; Enter Hub</span>
<span class="material-symbols-outlined font-bold group-hover:translate-x-1 transition-transform">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>
</div>
<div class="fixed bottom-8 right-8 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none" id="toastNotification">
<div class="flex items-center gap-space-sm bg-surface-container-highest/95 backdrop-blur-xl text-on-surface px-space-md py-space-sm rounded-xl shadow-2xl">
<span class="material-symbols-outlined text-secondary-fixed">check_circle</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md">Passport Saved</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Routing to Matchmaking Core...</span>
</div>
</div>
</div>
<script>
    (function() {
      const slider = document.getElementById('eloRange');
      const fill = document.getElementById('sliderFill');
      const thumb = document.getElementById('sliderThumb');
      const label = document.getElementById('tierLabel');
      const badge = document.getElementById('eloValueBadge');
      const tierDivs = document.querySelectorAll('#tierDescriptions > div');

      function updateEloUI(val) {
        const min = 800;
        const max = 2200;
        const percent = ((val - min) / (max - min)) * 100;
        fill.style.width = percent + '%';
        thumb.style.left = percent + '%';
        badge.textContent = val + ' Elo';

        let tierKey = 'intermediate';
        let tierName = 'Intermediate Competitive';

        if (val <= 1000) {
          tierKey = 'beginner';
          tierName = 'Beginner Foundations';
        } else if (val <= 1250) {
          tierKey = 'novice';
          tierName = 'Novice Competitor';
        } else if (val <= 1500) {
          tierKey = 'intermediate';
          tierName = 'Intermediate Competitive';
        } else if (val <= 1800) {
          tierKey = 'advanced';
          tierName = 'Advanced Contender';
        } else {
          tierKey = 'pro';
          tierName = 'Pro Circuit Tier';
        }

        label.textContent = tierName;

        tierDivs.forEach(div => {
          if (div.dataset.tier === tierKey) {
            div.classList.add('bg-surface-container-high/80');
          } else {
            div.classList.remove('bg-surface-container-high/80');
          }
        });
      }

      if (slider) {
        slider.addEventListener('input', (e) => {
          updateEloUI(parseInt(e.target.value, 10));
        });
      }

      const sportCards = document.querySelectorAll('.sport-card');
      sportCards.forEach(card => {
        card.addEventListener('click', () => {
          const badgeCheck = card.querySelector('.badge-check');
          if (badgeCheck) {
            const isSelected = !badgeCheck.classList.contains('hidden');
            if (isSelected) {
              badgeCheck.classList.add('hidden');
              card.classList.remove('bg-surface-container-high/60');
              card.classList.add('bg-surface-container/50');
            } else {
              badgeCheck.classList.remove('hidden');
              card.classList.add('bg-surface-container-high/60');
              card.classList.remove('bg-surface-container/50');
            }
          }
        });
      });

      const submitBtn = document.getElementById('submitSetup');
      const toast = document.getElementById('toastNotification');
      if (submitBtn && toast) {
        submitBtn.addEventListener('click', () => {
          toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
          setTimeout(() => {
            toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
          }, 3500);
        });
      }
    })();
  </script>
</div></main><footer class="w-full relative z-10 bg-surface-container-lowest/80 backdrop-blur-xl py-space-md mt-auto shadow-[0_-1px_6px_rgba(0,0,0,0.3)]"><div class="max-w-7xl mx-auto px-margin flex flex-col sm:flex-row items-center justify-between gap-space-sm"><div class="flex items-center gap-space-md"><span class="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">© 2025 SportNexus Performance Systems</span><span class="hidden md:inline font-label-sm text-label-sm text-outline">|</span><span class="hidden md:inline font-label-sm text-label-sm text-on-surface-variant">Global Matchmaking Core v2.4</span></div><div class="flex items-center gap-space-lg"><a class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Assisted Setup</a><a class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy &amp; Telemetry</a><a class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Support</a></div></div></footer></body></html>`

function OnBoarding() {
  return <iframe title="SportNexus OnBoarding" srcDoc={onBoardingPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default OnBoarding
