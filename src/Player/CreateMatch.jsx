const createMatchPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Outfit:wght@600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base { html, body { margin: 0; padding: 0; } body { overscroll-behavior: none; } main > :first-child { margin-top: 0 !important; } main > :last-child { margin-bottom: 0 !important; } } ::-webkit-scrollbar { display: none; }</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config = { darkMode: "class", theme: { extend: { colors: { "tertiary": "#e9ecff", "error": "#ffb4ab", "on-tertiary-container": "#004ecf", "on-primary": "#00363d", "on-secondary-container": "#007239", "secondary": "#f5fff3", "on-background": "#dfe2ee", "secondary-fixed-dim": "#00e478", "on-secondary-fixed-variant": "#005227", "on-tertiary-fixed-variant": "#003ea8", "outline": "#849396", "inverse-primary": "#006875", "outline-variant": "#3b494c", "primary-fixed-dim": "#00daf3", "on-surface": "#dfe2ee", "inverse-surface": "#dfe2ee", "tertiary-fixed-dim": "#b4c5ff", "secondary-fixed": "#60ff98", "surface-container-low": "#181c24", "surface": "#0f131c", "secondary-container": "#34ff8c", "on-error": "#690005", "on-surface-variant": "#bac9cc", "tertiary-container": "#c2cfff", "on-primary-fixed-variant": "#004f58", "primary": "#c3f5ff", "surface-container-highest": "#31353e", "surface-container": "#1c2028", "surface-container-lowest": "#0a0e16", "surface-variant": "#31353e", "on-secondary-fixed": "#00210c", "surface-container-high": "#262a33", "surface-tint": "#00daf3", "primary-fixed": "#9cf0ff", "inverse-on-surface": "#2c3039", "surface-bright": "#353942", "on-tertiary": "#002a78", "background": "#0f131c", "surface-dim": "#0f131c", "on-secondary": "#003919", "on-error-container": "#ffdad6", "error-container": "#93000a", "on-tertiary-fixed": "#00174b", "primary-container": "#00e5ff", "on-primary-container": "#00626e", "tertiary-fixed": "#dbe1ff", "on-primary-fixed": "#001f24" }, borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" }, spacing: { "space-sm": "0.5rem", "space-lg": "1.5rem", "gutter": "1rem", "space-xs": "0.25rem", "margin-sm": "1rem", "margin": "1.25rem", "gutter-sm": "0.75rem", "space-md": "1rem", "margin-lg": "2rem", "space-xl": "2rem" }, fontFamily: { "body-md": ["Inter"], "label-lg": ["Outfit"], "label-sm": ["Outfit"], "body-lg": ["Inter"], "label-md": ["Outfit"], "headline-md": ["Outfit"], "headline-sm": ["Outfit"], "display-lg-mobile": ["Outfit"], "headline-lg": ["Outfit"], "body-sm": ["Inter"], "display-lg": ["Outfit"] }, fontSize: { "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }], "label-lg": ["14px", { "lineHeight": "18px", "letterSpacing": "0.04em", "fontWeight": "600" }], "label-sm": ["10px", { "lineHeight": "12px", "letterSpacing": "0.08em", "fontWeight": "700" }], "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }], "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.06em", "fontWeight": "600" }], "headline-md": ["22px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }], "headline-sm": ["18px", { "lineHeight": "24px", "fontWeight": "600" }], "display-lg-mobile": ["32px", { "lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "800" }], "headline-lg": ["28px", { "lineHeight": "34px", "letterSpacing": "-0.02em", "fontWeight": "700" }], "body-sm": ["12px", { "lineHeight": "16px", "fontWeight": "400" }], "display-lg": ["44px", { "lineHeight": "48px", "letterSpacing": "-0.03em", "fontWeight": "800" }] } } } };</script></head><body class="bg-background font-body-md text-on-surface min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container relative"><header class="fixed top-0 left-0 right-0 z-50 bg-surface/75 backdrop-blur-2xl shadow-[0_16px_32px_-8px_rgba(0,0,0,0.6)]"><div class="h-20 w-full px-margin-lg flex items-center justify-between gap-space-lg"><div class="flex items-center gap-space-xl"><div class="flex items-center gap-space-sm cursor-pointer select-none"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzQIFi7nDQnO8SSJBstMKK4yyqmrqSJPirDkWfU7uZK3hNF-bB3Wguj2hKdOw0k9wfPY_tm_C6pJyhKKMmOBAQqZDRAM0hphS_y1jP9kf_idHBZBWd4NNRsm1r3CdwDR99zuC1tvPsKr1VeFrjIQlXIFgP9VvvIA8E8o4Cdudo5JTKLH3fAR5bnD29lBB52_7QWyWxEtKd08KBz5rHIe9Vl0mO-Ku-li6FXKPGl20jHkkBQ4GjnfgL"/><div class="flex flex-col"><span class="font-headline-sm text-headline-sm tracking-tight text-primary uppercase">SportNexus</span><span class="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">The Kinetic</span></div></div><nav class="hidden xl:flex items-center gap-space-xs p-space-xs bg-surface-container-lowest/60 rounded-xl" data-active-classes="bg-primary-container text-on-primary-container font-label-lg text-label-lg rounded-xl shadow-[0_0_20px_-2px_rgba(0,229,255,0.45)]"><a class="px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-xl transition-all duration-200" data-path="matches-and-lfg" href="#">Matches &amp; LFG</a><a class="px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-xl transition-all duration-200" data-path="courts-and-bookings" href="#">Courts &amp; Bookings</a><a class="px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-xl transition-all duration-200" data-path="tournaments" href="#">Tournaments</a><a class="px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-xl transition-all duration-200" data-path="wallet" href="#">Wallet</a><a class="px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-xl transition-all duration-200" data-path="community" href="#">Community</a></nav></div><div class="flex items-center gap-space-md"><div class="hidden md:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-lowest/80 text-secondary-fixed shadow-[0_0_12px_rgba(96,255,152,0.15)]"><span class="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span><span class="font-label-sm text-label-sm tracking-wider font-bold">18MS</span><span class="font-label-sm text-label-sm text-on-surface-variant">US-EAST</span></div><button aria-label="Notifications" class="relative p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant transition-colors" type="button"><span class="material-symbols-outlined text-headline-sm">notifications</span><span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#00e5ff]"></span></button><div class="flex items-center gap-space-md pl-space-sm bg-surface-container-low/70 py-space-xs pr-space-md rounded-full"><img alt="Profile" class="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWFWxSjEaxLLf8LN4aBuCap87AchZa2Wipx-VdKQPuHHq1NfNi4nNtDViJezFNHqVnJMgK1eEQykz3w7D4oeynA10er16-JlqyrubCoDoL9IzWT0i9fGwd1y1CbHlGvjQ0xpD7mt9JxQdzPwCZJW72uJjccl9Nd5Wh8QxUHeF_goS-Id56_5iHTFBHG4EdLtNwTBd7giqA_uUupanAcUhHLuG2EIev9Kl-kT4ZWIvP3o1mOOJJtOS7"/><div class="hidden sm:flex flex-col text-left"><span class="font-label-md text-label-md text-on-surface leading-none">Hoang An</span><span class="font-label-sm text-label-sm text-primary font-bold tracking-wider leading-none mt-1">PRO TIER</span></div></div></div></div></header><main class="w-full pt-20 bg-background relative z-10"><div class="flex flex-col w-full">
<div class="relative w-full overflow-hidden px-margin-sm md:px-margin-lg py-space-xl flex justify-center items-center">
<div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-primary-container/15 via-primary-container/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
<div class="absolute top-1/3 -right-40 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
<div class="absolute bottom-10 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
<div class="w-full max-w-3xl flex flex-col gap-space-lg relative z-10">
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs">
<div class="flex items-center gap-space-sm">
<div class="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high shadow-inner text-primary-container">
<span class="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_#00e5ff]"></span>
<span class="font-label-sm text-label-sm tracking-widest uppercase font-bold">LFG Dispatch Beacon</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider hidden sm:inline-block">Protocol v2.4</span>
</div>
<div class="flex items-center gap-space-xs text-on-surface-variant">
<span class="material-symbols-outlined text-body-sm text-secondary-fixed">radar</span>
<span class="font-label-sm text-label-sm tracking-wide text-secondary-fixed">1,420 Active Players in Radius</span>
</div>
</div>
<div class="relative rounded-xl bg-surface-container/70 backdrop-blur-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)] p-space-lg md:p-space-xl flex flex-col gap-space-lg">
<div class="flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight flex items-center gap-space-sm">
              Host a New Match
              <span class="text-primary-container font-body-sm text-body-sm px-space-xs py-0.5 rounded bg-surface-container-high font-semibold">LIVE SETUP</span>
</h1>
<button aria-label="Reset Match Setup" class="p-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" type="button">
<span class="material-symbols-outlined text-headline-sm">refresh</span>
</button>
</div>
<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Broadcast an open match beacon to the Kinetic network. Matched players are escrow-verified, skill-calibrated, and guaranteed by auto-refereeing.
          </p>
</div>
<form class="flex flex-col gap-space-lg" id="lfg-form" onsubmit="event.preventDefault();">
<div class="flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<label class="font-label-lg text-label-lg text-on-surface uppercase tracking-wider flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary-container text-body-lg">sports_tennis</span>
                Select Sport Discipline
              </label>
<span class="font-label-sm text-label-sm text-primary-container uppercase font-semibold">Racquet Court Mode</span>
</div>
<div class="grid grid-cols-2 sm:grid-cols-5 gap-space-xs" id="sport-selector">
<button class="sport-chip active flex flex-col items-center justify-center p-space-sm rounded-xl bg-primary-container text-on-primary-container shadow-[0_0_20px_-2px_rgba(0,229,255,0.4)] transition-all" data-sport="badminton" type="button">
<span class="material-symbols-outlined text-headline-sm mb-1">sports_tennis</span>
<span class="font-label-md text-label-md font-bold">Badminton</span>
<span class="font-label-sm text-label-sm opacity-80 mt-0.5">2-4 P</span>
</button>
<button class="sport-chip flex flex-col items-center justify-center p-space-sm rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-sport="football" type="button">
<span class="material-symbols-outlined text-headline-sm mb-1">sports_soccer</span>
<span class="font-label-md text-label-md font-bold">Football</span>
<span class="font-label-sm text-label-sm text-on-surface-variant/80 mt-0.5">5v5 / 11v11</span>
</button>
<button class="sport-chip flex flex-col items-center justify-center p-space-sm rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-sport="tennis" type="button">
<span class="material-symbols-outlined text-headline-sm mb-1">sports_baseball</span>
<span class="font-label-md text-label-md font-bold">Tennis</span>
<span class="font-label-sm text-label-sm text-on-surface-variant/80 mt-0.5">Clay/Hard</span>
</button>
<button class="sport-chip flex flex-col items-center justify-center p-space-sm rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-sport="basketball" type="button">
<span class="material-symbols-outlined text-headline-sm mb-1">sports_basketball</span>
<span class="font-label-md text-label-md font-bold">Basketball</span>
<span class="font-label-sm text-label-sm text-on-surface-variant/80 mt-0.5">3v3 Half</span>
</button>
<button class="sport-chip flex flex-col items-center justify-center p-space-sm rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all col-span-2 sm:col-span-1" data-sport="padel" type="button">
<span class="material-symbols-outlined text-headline-sm mb-1">sports_handball</span>
<span class="font-label-md text-label-md font-bold">Padel</span>
<span class="font-label-sm text-label-sm text-on-surface-variant/80 mt-0.5">Double 4P</span>
</button>
</div>
</div>
<div class="flex flex-col gap-space-xs">
<label class="font-label-lg text-label-lg text-on-surface uppercase tracking-wider flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary-container text-body-lg">calendar_month</span>
              Match Schedule &amp; Window
            </label>
<div class="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
<div class="flex flex-col gap-space-xs">
<div class="flex items-center bg-surface-container-low rounded-xl px-space-md py-space-sm shadow-sm focus-within:bg-surface-container-high transition-colors">
<span class="material-symbols-outlined text-on-surface-variant mr-space-sm">event</span>
<div class="flex flex-col flex-1">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Date Slot</span>
<input class="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none w-full" type="text" value="Tonight, Oct 24, 2025"/>
</div>
<span class="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-surface-container-highest text-primary">TODAY</span>
</div>
</div>
<div class="flex flex-col gap-space-xs">
<div class="flex items-center bg-surface-container-low rounded-xl px-space-md py-space-sm shadow-sm focus-within:bg-surface-container-high transition-colors">
<span class="material-symbols-outlined text-on-surface-variant mr-space-sm">schedule</span>
<div class="flex flex-col flex-1">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Time Slot Duration</span>
<input class="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none w-full" type="text" value="19:30 - 21:30 (2 Hours)"/>
</div>
<span class="material-symbols-outlined text-on-surface-variant cursor-pointer">expand_more</span>
</div>
</div>
</div>
<div class="flex flex-wrap items-center gap-space-xs mt-1">
<span class="font-label-sm text-label-sm text-on-surface-variant">Instant Presets:</span>
<button class="quick-time px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary-container transition-all" type="button">Now (Immediate)</button>
<button class="quick-time px-space-sm py-0.5 rounded-full bg-primary-container/20 text-primary font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary-container transition-all" type="button">Tonight (20:00)</button>
<button class="quick-time px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary-container transition-all" type="button">Tomorrow Morning (07:00)</button>
<button class="quick-time px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary-container transition-all" type="button">Tomorrow Eve (18:30)</button>
</div>
</div>
<div class="flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<label class="font-label-lg text-label-lg text-on-surface uppercase tracking-wider flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary-container text-body-lg">stadium</span>
                Court Venue Location
              </label>
<span class="font-label-sm text-label-sm text-secondary-fixed flex items-center gap-1 font-bold">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span> Auto-Gate Ready
              </span>
</div>
<div class="relative bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div class="flex items-start gap-space-sm">
<span class="material-symbols-outlined text-primary-container mt-1">location_on</span>
<div class="flex flex-col flex-1 min-w-0">
<span class="font-headline-sm text-headline-sm text-on-surface truncate">Kinetic Arena - Court 3</span>
<span class="font-body-sm text-body-sm text-on-surface-variant truncate">Downtown Metro Hub, Sector 4 • Synthetic Hydro-Cushion System</span>
</div>
<button class="px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary font-label-md text-label-md transition-colors whitespace-nowrap" type="button">
                  Change Court
                </button>
</div>
<div class="flex flex-wrap items-center gap-space-sm pt-space-xs">
<div class="flex items-center gap-space-xs px-space-sm py-0.5 rounded bg-surface-container-highest text-secondary-fixed font-label-sm text-label-sm">
<span class="material-symbols-outlined text-body-sm">bolt</span>
                  Verified Smart Court
                </div>
<div class="flex items-center gap-space-xs px-space-sm py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-body-sm">lightbulb</span>
                  Automated LED Floodlights Included
                </div>
<div class="flex items-center gap-space-xs px-space-sm py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-body-sm">videocam</span>
                  AI Highlight Recording
                </div>
</div>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-12 gap-space-md items-stretch">
<div class="md:col-span-6 flex flex-col justify-between bg-surface-container-low rounded-xl p-space-md shadow-sm">
<div class="flex items-center justify-between mb-space-xs">
<span class="font-label-lg text-label-lg text-on-surface uppercase tracking-wider flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary-container text-body-lg">group_add</span>
                  Missing Squad Members
                </span>
<span class="font-label-md text-label-md text-secondary-fixed bg-surface-container-highest px-space-xs py-0.5 rounded font-bold" id="player-count-badge">3 Needed</span>
</div>
<div class="flex items-center justify-between py-space-sm">
<div class="flex flex-col">
<span class="font-headline-md text-headline-md text-on-surface font-bold" id="needed-display">3 Players Needed</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Squad size: 4 players total (Badminton Doubles)</span>
</div>
<div class="flex items-center gap-space-xs bg-surface-container-high p-space-xs rounded-xl shadow-inner">
<button aria-label="Decrease Players" class="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface hover:bg-surface-bright flex items-center justify-center transition-colors" id="btn-dec-player" type="button">
<span class="material-symbols-outlined text-body-lg">remove</span>
</button>
<span class="font-headline-sm text-headline-sm text-primary w-6 text-center font-bold" id="numeric-needed">3</span>
<button aria-label="Increase Players" class="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface hover:bg-surface-bright flex items-center justify-center transition-colors" id="btn-inc-player" type="button">
<span class="material-symbols-outlined text-body-lg">add</span>
</button>
</div>
</div>
<div class="grid grid-cols-4 gap-space-xs pt-space-xs" id="avatar-slots">
<div class="flex flex-col items-center justify-center p-space-xs rounded-lg bg-surface-container-highest text-primary">
<img alt="Host Profile" class="w-8 h-8 rounded-full object-cover shadow-sm mb-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPUUqcbkyxbMdomVhQWsh70dBGRAWKF04ImLdIEM_drDe8qOMPcahP9UYW_stKmc9ymUwqIOCyGmRwpF39JxUfGbtOjwWM3sI27rXFJdreUQ9CMwnzRHKC97K_FPSEkxN1fyIydr2FMuAR2h8WA0n7rq5RGoB3wMmTv-EGHXxB9u0GCtP1lIpZB4-UJBk1jZ9RYjISy0DB-c_vQ-BoKhKe9eLXhGhqB_B4uaqRuh695tUnNc29FIqQ"/>
<span class="font-label-sm text-label-sm font-bold leading-none">Host (You)</span>
<span class="text-[9px] text-secondary-fixed mt-0.5">READY</span>
</div>
<div class="slot-beacon flex flex-col items-center justify-center p-space-xs rounded-lg bg-surface-container text-primary-container shadow-[0_0_12px_rgba(0,229,255,0.2)]">
<div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center mb-1">
<span class="material-symbols-outlined text-body-md animate-pulse">radar</span>
</div>
<span class="font-label-sm text-label-sm font-bold leading-none text-on-surface-variant">Slot #2</span>
<span class="text-[9px] text-primary-container mt-0.5">SEEKING</span>
</div>
<div class="slot-beacon flex flex-col items-center justify-center p-space-xs rounded-lg bg-surface-container text-primary-container shadow-[0_0_12px_rgba(0,229,255,0.2)]">
<div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center mb-1">
<span class="material-symbols-outlined text-body-md animate-pulse">radar</span>
</div>
<span class="font-label-sm text-label-sm font-bold leading-none text-on-surface-variant">Slot #3</span>
<span class="text-[9px] text-primary-container mt-0.5">SEEKING</span>
</div>
<div class="slot-beacon flex flex-col items-center justify-center p-space-xs rounded-lg bg-surface-container text-primary-container shadow-[0_0_12px_rgba(0,229,255,0.2)]">
<div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center mb-1">
<span class="material-symbols-outlined text-body-md animate-pulse">radar</span>
</div>
<span class="font-label-sm text-label-sm font-bold leading-none text-on-surface-variant">Slot #4</span>
<span class="text-[9px] text-primary-container mt-0.5">SEEKING</span>
</div>
</div>
</div>
<div class="md:col-span-6 flex flex-col justify-between bg-surface-container-low rounded-xl p-space-md shadow-sm">
<div class="flex items-center justify-between mb-space-xs">
<span class="font-label-lg text-label-lg text-on-surface uppercase tracking-wider flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary-container text-body-lg">speed</span>
                  Minimum Skill Calibration
                </span>
<span class="font-label-md text-label-md text-primary bg-primary-container/20 px-space-xs py-0.5 rounded font-bold" id="elo-tag">1200+ Elo</span>
</div>
<div class="flex flex-col gap-space-xs py-space-sm">
<div class="flex items-baseline justify-between">
<span class="font-headline-md text-headline-md text-on-surface font-bold" id="elo-display">1200 Elo</span>
<span class="font-label-md text-label-md text-primary font-semibold" id="tier-display">Intermediate / Competitive</span>
</div>
<div class="relative w-full py-2 flex items-center">
<input aria-label="Minimum Elo Requirement" class="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-[#00e5ff] focus:outline-none" id="elo-slider" max="2000" min="0" step="50" type="range" value="1200"/>
</div>
<div class="flex justify-between text-on-surface-variant font-label-sm text-label-sm tracking-wider">
<span>Open (0)</span>
<span>Beg (800)</span>
<span class="text-primary-container font-bold">Mid (1200)</span>
<span>Adv (1600)</span>
<span>Pro (2000)</span>
</div>
</div>
<div class="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container-highest text-on-surface-variant">
<span class="material-symbols-outlined text-body-md text-secondary-fixed">verified_user</span>
<span class="font-label-sm text-label-sm">Algorithmic Precision: ±150 Elo Fairplay Guard active</span>
</div>
</div>
</div>
<div class="rounded-xl bg-surface-container-lowest/80 p-space-md shadow-inner flex flex-col md:flex-row items-center justify-between gap-space-md">
<div class="flex items-center gap-space-md w-full md:w-auto">
<div class="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary-fixed flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(96,255,152,0.2)]">
<span class="material-symbols-outlined text-headline-sm">account_balance_wallet</span>
</div>
<div class="flex flex-col">
<div class="flex items-baseline gap-space-xs">
<span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Cost per Player:</span>
<span class="font-display-lg text-display-lg text-secondary-fixed font-black tracking-tight" id="cost-display">$5.00</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">/ player</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                  Court Rate $20.00 split uniformly among <span class="text-on-surface font-bold" id="split-count">4 slots</span>
</span>
</div>
</div>
<div class="flex flex-col gap-1 text-left md:text-right w-full md:w-auto">
<div class="flex items-center md:justify-end gap-space-xs text-secondary-fixed">
<span class="material-symbols-outlined text-body-sm">check_circle</span>
<span class="font-label-sm text-label-sm font-bold">Automated Smart Escrow Protection</span>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">Zero Host Liability • Automatic split upon entry</span>
<span class="font-label-sm text-label-sm text-primary">100% Refund guaranteed if unfilled 60m before start</span>
</div>
</div>
<div class="flex flex-col sm:flex-row items-center gap-space-md pt-space-sm">
<button class="w-full sm:flex-1 py-space-md px-space-lg rounded-xl bg-primary-container hover:bg-primary-fixed text-on-primary-container font-headline-sm text-headline-sm tracking-wide shadow-[0_0_28px_rgba(0,229,255,0.45)] hover:shadow-[0_0_36px_rgba(0,229,255,0.65)] transition-all flex items-center justify-center gap-space-sm" id="publish-btn" type="button">
<span class="material-symbols-outlined font-bold">podcasts</span>
<span>Publish Match to Feed</span>
</button>
<button class="w-full sm:w-auto py-space-md px-space-lg rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg transition-colors flex items-center justify-center gap-space-xs" type="button">
<span class="material-symbols-outlined text-body-lg">visibility</span>
<span>Preview Beacon</span>
</button>
</div>
<div class="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs text-on-surface-variant">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-body-sm text-primary">lock</span>
<span class="font-label-sm text-label-sm tracking-wider uppercase">Kinetic Quantum Escrow Protocol v2.4 Encrypted</span>
</div>
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-body-sm text-secondary-fixed">bolt</span>
<span class="font-label-sm text-label-sm tracking-wider uppercase">Priority Dispatch to High-Rep Players</span>
</div>
</div>
</form>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
<div class="rounded-xl bg-surface-container/40 backdrop-blur-md p-space-md flex items-start gap-space-sm">
<div class="p-space-xs rounded-lg bg-surface-container-high text-primary-container">
<span class="material-symbols-outlined text-headline-sm">verified</span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface font-semibold">Reliability Rating</span>
<span class="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Players forfeit deposits if no-showing within 10 minutes of session launch.
            </span>
</div>
</div>
<div class="rounded-xl bg-surface-container/40 backdrop-blur-md p-space-md flex items-start gap-space-sm">
<div class="p-space-xs rounded-lg bg-surface-container-high text-secondary-fixed">
<span class="material-symbols-outlined text-headline-sm">sensors</span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface font-semibold">Smart Net Radar</span>
<span class="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Court 3 records real-time smash speed and rally stats straight to your player card.
            </span>
</div>
</div>
<div class="rounded-xl bg-surface-container/40 backdrop-blur-md p-space-md flex items-start gap-space-sm">
<div class="p-space-xs rounded-lg bg-surface-container-high text-tertiary-fixed">
<span class="material-symbols-outlined text-headline-sm">sync_saved_locally</span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface font-semibold">Instant Check-in</span>
<span class="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Automated NFC &amp; Bluetooth BLE gate access unlock when all 4 players arrive.
            </span>
</div>
</div>
</div>
</div>
</div>
</div>
<script>
  (function() {
    const eloSlider = document.getElementById('elo-slider');
    const eloDisplay = document.getElementById('elo-display');
    const eloTag = document.getElementById('elo-tag');
    const tierDisplay = document.getElementById('tier-display');
    
    function updateElo(val) {
      eloDisplay.textContent = val + ' Elo';
      eloTag.textContent = val + '+ Elo';
      
      if (val < 800) {
        tierDisplay.textContent = 'Casual / Novice';
      } else if (val < 1200) {
        tierDisplay.textContent = 'Beginner / Regular';
      } else if (val < 1600) {
        tierDisplay.textContent = 'Intermediate / Competitive';
      } else if (val < 1900) {
        tierDisplay.textContent = 'Advanced / Tournament';
      } else {
        tierDisplay.textContent = 'Master / Semi-Pro';
      }
    }

    if (eloSlider) {
      eloSlider.addEventListener('input', function(e) {
        updateElo(e.target.value);
      });
    }

    let neededCount = 3;
    const totalCourtFee = 20.00;
    const btnDec = document.getElementById('btn-dec-player');
    const btnInc = document.getElementById('btn-inc-player');
    const numericNeeded = document.getElementById('numeric-needed');
    const neededDisplay = document.getElementById('needed-display');
    const playerCountBadge = document.getElementById('player-count-badge');
    const costDisplay = document.getElementById('cost-display');
    const splitCount = document.getElementById('split-count');
    const avatarSlots = document.getElementById('avatar-slots');

    function updatePlayers(count) {
      neededCount = Math.max(1, Math.min(count, 5));
      numericNeeded.textContent = neededCount;
      neededDisplay.textContent = neededCount + ' Player' + (neededCount > 1 ? 's' : '') + ' Needed';
      playerCountBadge.textContent = neededCount + ' Needed';
      
      const totalSquad = neededCount + 1;
      const perPlayerCost = (totalCourtFee / totalSquad).toFixed(2);
      costDisplay.textContent = '$' + perPlayerCost;
      splitCount.textContent = totalSquad + ' slots';

      let slotsHtml = ${String.fromCharCode(96)}
        <div class="flex flex-col items-center justify-center p-space-xs rounded-lg bg-surface-container-highest text-primary">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Host Profile" class="w-8 h-8 rounded-full object-cover shadow-sm mb-1" />
          <span class="font-label-sm text-label-sm font-bold leading-none">Host (You)</span>
          <span class="text-[9px] text-secondary-fixed mt-0.5">READY</span>
        </div>
      ${String.fromCharCode(96)};

      for (let i = 1; i <= neededCount; i++) {
        slotsHtml += ${String.fromCharCode(96)}
          <div class="slot-beacon flex flex-col items-center justify-center p-space-xs rounded-lg bg-surface-container text-primary-container shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            <div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center mb-1">
              <span class="material-symbols-outlined text-body-md animate-pulse">radar</span>
            </div>
            <span class="font-label-sm text-label-sm font-bold leading-none text-on-surface-variant">Slot #${String.fromCharCode(36)}{i + 1}</span>
            <span class="text-[9px] text-primary-container mt-0.5">SEEKING</span>
          </div>
        ${String.fromCharCode(96)};
      }
      avatarSlots.innerHTML = slotsHtml;
    }

    if (btnDec) {
      btnDec.addEventListener('click', function() {
        updatePlayers(neededCount - 1);
      });
    }

    if (btnInc) {
      btnInc.addEventListener('click', function() {
        updatePlayers(neededCount + 1);
      });
    }

    const sportButtons = document.querySelectorAll('#sport-selector .sport-chip');
    sportButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        sportButtons.forEach(b => {
          b.className = 'sport-chip flex flex-col items-center justify-center p-space-sm rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all';
        });
        this.className = 'sport-chip active flex flex-col items-center justify-center p-space-sm rounded-xl bg-primary-container text-on-primary-container shadow-[0_0_20px_-2px_rgba(0,229,255,0.4)] transition-all';
      });
    });

    const quickTimeButtons = document.querySelectorAll('.quick-time');
    quickTimeButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        quickTimeButtons.forEach(b => {
          b.className = 'quick-time px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary-container transition-all';
        });
        this.className = 'quick-time px-space-sm py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold transition-all';
      });
    });

    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
      publishBtn.addEventListener('click', function() {
        const originalHtml = publishBtn.innerHTML;
        publishBtn.innerHTML = ${String.fromCharCode(96)}
          <span class="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></span>
          <span>Broadcasting Beacon...</span>
        ${String.fromCharCode(96)};
        publishBtn.classList.add('opacity-90', 'cursor-not-allowed');

        setTimeout(() => {
          publishBtn.innerHTML = ${String.fromCharCode(96)}
            <span class="material-symbols-outlined text-headline-sm font-bold">check_circle</span>
            <span>Beacon Broadcasted!</span>
          ${String.fromCharCode(96)};
          publishBtn.classList.remove('bg-primary-container');
          publishBtn.classList.add('bg-secondary-fixed', 'text-on-secondary-fixed');
          
          setTimeout(() => {
            publishBtn.innerHTML = originalHtml;
            publishBtn.classList.remove('bg-secondary-fixed', 'text-on-secondary-fixed', 'opacity-90', 'cursor-not-allowed');
            publishBtn.classList.add('bg-primary-container');
          }, 3000);
        }, 1200);
      });
    }
  })();
</script></main><footer class="w-full bg-surface-container-lowest py-space-xl mt-space-xl relative z-10"><div class="w-full px-margin-lg flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant"><div class="flex items-center gap-space-sm"><span class="font-headline-sm text-headline-sm text-primary uppercase">SportNexus</span><span class="font-body-sm text-body-sm">© 2025 High-Performance Athletic Ecosystem</span></div><div class="flex items-center gap-space-lg"><a class="font-label-sm text-label-sm hover:text-on-surface uppercase tracking-wider transition-colors" href="#">Telemetry Status</a><a class="font-label-sm text-label-sm hover:text-on-surface uppercase tracking-wider transition-colors" href="#">Court Protocol</a><a class="font-label-sm text-label-sm hover:text-on-surface uppercase tracking-wider transition-colors" href="#">Legal &amp; Privacy</a></div></div></footer></body></html>`



function CreateMatch() {
  return <iframe title="SportNexus Create Match" srcDoc={createMatchPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default CreateMatch
