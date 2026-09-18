const tournamentListPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Outfit:wght@600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config={darkMode:"class",theme:{extend:{"colors":{"error":"#ffb4ab","on-background":"#dfe2ee","tertiary-fixed":"#dbe1ff","on-primary-fixed-variant":"#004f58","secondary-container":"#34ff8c","on-error-container":"#ffdad6","secondary-fixed-dim":"#00e478","outline":"#849396","on-secondary-fixed-variant":"#005227","background":"#0f131c","primary":"#c3f5ff","surface-dim":"#0f131c","primary-fixed":"#9cf0ff","on-error":"#690005","surface-container-highest":"#31353e","on-tertiary-container":"#004ecf","surface-bright":"#353942","inverse-primary":"#006875","on-secondary-fixed":"#00210c","surface-container-high":"#262a33","secondary":"#f5fff3","error-container":"#93000a","on-primary":"#00363d","surface-container-low":"#181c24","outline-variant":"#3b494c","surface-container-lowest":"#0a0e16","surface-tint":"#00daf3","tertiary-fixed-dim":"#b4c5ff","primary-fixed-dim":"#00daf3","surface":"#0f131c","inverse-surface":"#dfe2ee","surface-variant":"#31353e","on-secondary":"#003919","secondary-fixed":"#60ff98","on-primary-fixed":"#001f24","surface-container":"#1c2028","on-tertiary-fixed-variant":"#003ea8","inverse-on-surface":"#2c3039","tertiary":"#e9ecff","on-surface-variant":"#bac9cc","primary-container":"#00e5ff","on-secondary-container":"#007239","on-surface":"#dfe2ee","on-tertiary":"#002a78","on-primary-container":"#00626e","tertiary-container":"#c2cfff","on-tertiary-fixed":"#00174b"},"borderRadius":{"DEFAULT":"0.25rem","lg":"0.5rem","xl":"0.75rem","full":"9999px"},"spacing":{"margin-lg":"2rem","space-sm":"0.5rem","gutter":"1rem","space-md":"1rem","space-lg":"1.5rem","space-xl":"2rem","margin":"1.25rem","space-xs":"0.25rem","gutter-sm":"0.75rem","margin-sm":"1rem"},"fontFamily":{"display-lg-mobile":["Outfit"],"body-md":["Inter"],"label-md":["Outfit"],"body-lg":["Inter"],"headline-lg":["Outfit"],"headline-md":["Outfit"],"headline-sm":["Outfit"],"body-sm":["Inter"],"label-sm":["Outfit"],"label-lg":["Outfit"],"display-lg":["Outfit"]},"fontSize":{"display-lg-mobile":["32px",{"lineHeight":"36px","letterSpacing":"-0.02em","fontWeight":"800"}],"body-md":["14px",{"lineHeight":"20px","fontWeight":"400"}],"label-md":["12px",{"lineHeight":"16px","letterSpacing":"0.06em","fontWeight":"600"}],"body-lg":["16px",{"lineHeight":"24px","fontWeight":"400"}],"headline-lg":["28px",{"lineHeight":"34px","letterSpacing":"-0.02em","fontWeight":"700"}],"headline-md":["22px",{"lineHeight":"28px","letterSpacing":"-0.01em","fontWeight":"600"}],"headline-sm":["18px",{"lineHeight":"24px","fontWeight":"600"}],"body-sm":["12px",{"lineHeight":"16px","fontWeight":"400"}],"label-sm":["10px",{"lineHeight":"12px","letterSpacing":"0.08em","fontWeight":"700"}],"label-lg":["14px",{"lineHeight":"18px","letterSpacing":"0.04em","fontWeight":"600"}],"display-lg":["44px",{"lineHeight":"48px","letterSpacing":"-0.03em","fontWeight":"800"}]}}}};</script></head><body class="bg-background font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen"><header class="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.6)]"><div class="h-20 w-full px-margin-lg flex items-center justify-between gap-space-lg"><div class="flex items-center gap-space-xl"><a class="flex items-center gap-space-sm" data-path="dashboard" href="#"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg"/><div class="flex flex-col leading-none"><span class="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Sport<span class="text-primary-container">Nexus</span></span><span class="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed-dim">The Kinetic</span></div></a><nav class="hidden lg:flex items-center gap-space-xs" data-active-classes="bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(0,229,255,0.45)]"><a class="px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="dashboard" href="#">Dashboard</a><a class="px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="courts-and-bookings" href="#">Courts &amp; Bookings</a><a class="px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="matches-and-lfg" href="#">Matches &amp; LFG</a><a aria-current="page" class="px-space-md py-space-sm rounded-xl font-label-lg transition-all bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(0,229,255,0.45)]" data-path="tournaments" href="#">Tournaments</a><a class="px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="wallet" href="#">Wallet</a></nav></div><div class="flex items-center gap-space-md"><div class="relative hidden md:flex items-center"><span class="material-symbols-outlined absolute left-space-md text-outline pointer-events-none text-xl">search</span><input class="w-64 xl:w-80 bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-body-sm pl-11 pr-space-md py-2.5 rounded-xl focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary-container transition-all" placeholder="Search courts, rivals, brackets..." type="text"/></div><button class="relative p-2.5 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"><span class="material-symbols-outlined text-xl leading-none flex items-center justify-center">notifications</span><span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary-fixed shadow-[0_0_8px_#60ff98]"></span></button><a class="hidden xl:flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="wallet" href="#"><span class="material-symbols-outlined text-secondary-fixed text-lg">bolt</span><span class="font-label-md text-label-md text-on-surface">1,420 PTS</span></a><div class="h-8 w-[1px] bg-surface-container-highest hidden sm:block"></div><a class="flex items-center gap-space-sm pl-space-xs py-space-xs rounded-full hover:bg-surface-container-low transition-colors" data-path="player-profile" href="#"><div class="relative"><img alt="Profile" class="w-9 h-9 rounded-full object-cover ring-2 ring-primary-container/40" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/><span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-secondary-fixed-dim rounded-full ring-2 ring-background"></span></div><div class="hidden 2xl:flex flex-col text-left pr-space-xs"><span class="font-label-md text-label-md text-on-surface leading-tight">Alex Rivera</span><span class="font-label-sm text-label-sm text-outline leading-tight">Tier 1 Elite</span></div></a></div></div></header><main class="w-full pt-20 bg-background min-h-[calc(100vh-80px)]"><div class="flex flex-col w-full">
<!-- Top Hero Banner (Bleeds seamlessly under the shell header) -->
<section class="relative w-full -mt-20 pt-24 pb-16 overflow-hidden bg-surface-container-lowest">
<!-- Atmospheric Underlays & Backdrop Image -->
<div class="absolute inset-0 bg-cover bg-center pointer-events-none opacity-30 mix-blend-luminosity scale-105 transform duration-1000" style="background-image: url('https://lh3.googleusercontent.com/aida/AEtjO1UUKxLkHzZlpCptmoJI3T1Ve_Xpng3mi_5R0puB559RsWk99enPo8K_LK7T2FF2yZmeE3lPaVvbnrgv5sUnBOgQUg7ZC0qnyCTV8vGNGBtjpJy9R7YXt8ALhxwa5QDGDC6CTZUYMBMHcbigIeJC9Jw8-Dv7Ih9ZXv_l6pYyNCqTqcyq7DQpekn8NHMsavkiF6Pm7YKdln5d8jYIjnblhAlqaHXMUTyFAkP5n4AVro-E9gIXhgonEhcBDQ');"></div>
<div class="absolute inset-0 bg-gradient-to-b from-surface-dim/95 via-surface-dim/80 to-background"></div>
<div class="absolute top-0 right-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
<div class="absolute bottom-0 left-10 w-80 h-80 bg-secondary-fixed/10 rounded-full blur-[100px] pointer-events-none"></div>
<div class="relative w-full px-margin-lg max-w-7xl mx-auto flex flex-col gap-space-lg">
<!-- Live Status Capsule & Breadcrumbs -->
<div class="flex flex-wrap items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/10 text-secondary-fixed font-label-sm text-label-sm uppercase tracking-widest">
<span class="w-2 h-2 rounded-full bg-secondary-fixed shadow-[0_0_8px_#60ff98] animate-pulse"></span>
            Kinetic Tournament Network
          </span>
<span class="text-outline font-label-md text-label-md hidden sm:inline">•</span>
<span class="text-outline font-label-md text-label-md uppercase tracking-wider hidden sm:inline">Season 04 Regional Qualifier Series</span>
</div>
<div class="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-sm text-primary-container">shield</span>
<span>Verified Kinetic Escrow Protocol</span>
</div>
</div>
<!-- Headline Block with Visual Punch -->
<div class="max-w-3xl flex flex-col gap-space-xs">
<h1 class="font-display-lg text-display-lg uppercase tracking-tight text-on-surface">
          Join Upcoming <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-container via-primary to-secondary-fixed">Tournaments</span>
</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Compete in rated community brackets, climb the regional Elo leaderboard, and claim verified cash prize pools backed by Kinetic Escrow vaults.
        </p>
</div>
<!-- Quick Highlights Metric Strip -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-space-sm pt-space-xs">
<div class="p-space-md rounded-xl bg-surface-container/60 backdrop-blur-md flex flex-col gap-1 shadow-sm">
<div class="flex items-center justify-between text-outline">
<span class="font-label-sm text-label-sm uppercase tracking-wider">Active Prize Pool</span>
<span class="material-symbols-outlined text-base text-primary-container">monetization_on</span>
</div>
<span class="font-headline-lg text-headline-lg text-primary-container">$14,800</span>
<span class="font-body-sm text-body-sm text-outline">Escrow-locked &amp; guaranteed</span>
</div>
<div class="p-space-md rounded-xl bg-surface-container/60 backdrop-blur-md flex flex-col gap-1 shadow-sm">
<div class="flex items-center justify-between text-outline">
<span class="font-label-sm text-label-sm uppercase tracking-wider">Live Brackets</span>
<span class="material-symbols-outlined text-base text-secondary-fixed">sports_score</span>
</div>
<span class="font-headline-lg text-headline-lg text-on-surface">18 Active</span>
<span class="font-body-sm text-body-sm text-secondary-fixed flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span> 6 closing today
          </span>
</div>
<div class="p-space-md rounded-xl bg-surface-container/60 backdrop-blur-md flex flex-col gap-1 shadow-sm">
<div class="flex items-center justify-between text-outline">
<span class="font-label-sm text-label-sm uppercase tracking-wider">Certified Venues</span>
<span class="material-symbols-outlined text-base text-tertiary-fixed">stadium</span>
</div>
<span class="font-headline-lg text-headline-lg text-on-surface">42 Arenas</span>
<span class="font-body-sm text-body-sm text-outline">Metro &amp; Regional hubs</span>
</div>
<div class="p-space-md rounded-xl bg-surface-container/60 backdrop-blur-md flex flex-col gap-1 shadow-sm">
<div class="flex items-center justify-between text-outline">
<span class="font-label-sm text-label-sm uppercase tracking-wider">Current Standing</span>
<span class="material-symbols-outlined text-base text-secondary-fixed-dim">trending_up</span>
</div>
<div class="flex items-baseline gap-2">
<span class="font-headline-lg text-headline-lg text-secondary-fixed">1,350</span>
<span class="font-label-sm text-label-sm text-outline uppercase">Elo Tier 2</span>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">Top 14% this season</span>
</div>
</div>
<!-- Quick Search & Smart Elo Filter Pill Tray -->
<div class="p-2 rounded-xl bg-surface-container-low/90 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-space-sm">
<div class="relative w-full md:flex-1 flex items-center">
<span class="material-symbols-outlined absolute left-4 text-outline pointer-events-none">search</span>
<input class="w-full bg-surface-container text-on-surface placeholder:text-outline font-body-md text-body-md pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:bg-surface-container-high transition-all" id="tournament-search" placeholder="Search tournaments, venues, formats, or organizers..." type="text"/>
</div>
<div class="flex items-center justify-between w-full md:w-auto gap-space-md px-3 py-2 bg-surface-container rounded-lg">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary-container text-lg">verified_user</span>
<span class="font-label-md text-label-md text-on-surface">Only Eligible for My Elo (1350)</span>
</div>
<button aria-pressed="true" class="w-12 h-7 rounded-full bg-primary-container p-0.5 transition-colors relative flex items-center" id="elo-toggle" onclick="toggleEloFilter()">
<span class="w-6 h-6 rounded-full bg-surface shadow-md transform translate-x-5 transition-transform flex items-center justify-center" id="elo-knob">
<span class="material-symbols-outlined text-xs text-primary-container">check</span>
</span>
</button>
</div>
</div>
</div>
</section>
<!-- Interactive Multi-Tier Filter Section -->
<section class="w-full px-margin-lg max-w-7xl mx-auto py-6 flex flex-col gap-space-md">
<!-- Sport Category Chips -->
<div class="flex flex-col gap-2">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm uppercase tracking-widest text-outline">Discipline</span>
<span class="font-body-sm text-body-sm text-primary-container cursor-pointer hover:underline" onclick="resetAllFilters()">Reset Filters</span>
</div>
<div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-nowrap">
<button class="sport-filter px-4 py-2 rounded-xl font-label-md text-label-md bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all" onclick="selectSport(this, 'all')">
          All Sports
        </button>
<button class="sport-filter px-4 py-2 rounded-xl font-label-md text-label-md bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(0,229,255,0.35)] transition-all flex items-center gap-1.5" onclick="selectSport(this, 'badminton')">
<span class="material-symbols-outlined text-base">sports_tennis</span>
          Badminton
          <span class="w-2 h-2 rounded-full bg-surface"></span>
</button>
<button class="sport-filter px-4 py-2 rounded-xl font-label-md text-label-md bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all" onclick="selectSport(this, 'padel')">
          Padel
        </button>
<button class="sport-filter px-4 py-2 rounded-xl font-label-md text-label-md bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all" onclick="selectSport(this, 'tennis')">
          Tennis
        </button>
<button class="sport-filter px-4 py-2 rounded-xl font-label-md text-label-md bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all" onclick="selectSport(this, 'pickleball')">
          Pickleball
        </button>
<button class="sport-filter px-4 py-2 rounded-xl font-label-md text-label-md bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all" onclick="selectSport(this, 'basketball')">
          Basketball 3x3
        </button>
<button class="sport-filter px-4 py-2 rounded-xl font-label-md text-label-md bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all" onclick="selectSport(this, 'futsal')">
          Futsal
        </button>
</div>
</div>
<!-- Secondary Meta Filters (Entry Fee, Elo Bracket, Date & Format) -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-space-sm pt-2">
<!-- Entry Fee Tier -->
<div class="bg-surface-container-low p-3 rounded-xl flex flex-col gap-2">
<span class="font-label-sm text-label-sm uppercase tracking-widest text-outline">Entry Fee Tier</span>
<div class="flex flex-wrap gap-1.5">
<button class="fee-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-surface-container-highest text-on-surface" onclick="toggleChip(this)">All Fees</button>
<button class="fee-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high" onclick="toggleChip(this)">Free</button>
<button class="fee-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high" onclick="toggleChip(this)">&lt; $15</button>
<button class="fee-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high" onclick="toggleChip(this)">$15 - $30</button>
<button class="fee-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high" onclick="toggleChip(this)">High Roller ($50+)</button>
</div>
</div>
<!-- Elo Class -->
<div class="bg-surface-container-low p-3 rounded-xl flex flex-col gap-2">
<span class="font-label-sm text-label-sm uppercase tracking-widest text-outline">Skill Calibration</span>
<div class="flex flex-wrap gap-1.5">
<button class="elo-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high" onclick="toggleChip(this)">Open Tier</button>
<button class="elo-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high" onclick="toggleChip(this)">Novice (&lt;1100)</button>
<button class="elo-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-secondary-container/20 text-secondary-fixed" onclick="toggleChip(this)">Intermediate (1100-1400)</button>
<button class="elo-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high" onclick="toggleChip(this)">Elite (1500+)</button>
</div>
</div>
<!-- Schedule & Format -->
<div class="bg-surface-container-low p-3 rounded-xl flex flex-col gap-2">
<span class="font-label-sm text-label-sm uppercase tracking-widest text-outline">Format &amp; Window</span>
<div class="flex flex-wrap gap-1.5">
<button class="fmt-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-surface-container-highest text-on-surface" onclick="toggleChip(this)">This Weekend</button>
<button class="fmt-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high" onclick="toggleChip(this)">Next 14 Days</button>
<button class="fmt-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high" onclick="toggleChip(this)">Knockout Cup</button>
<button class="fmt-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high" onclick="toggleChip(this)">Round Robin</button>
</div>
</div>
</div>
</section>
<!-- Main Tournament Cards 3-Column Bento Grid -->
<section class="w-full px-margin-lg max-w-7xl mx-auto py-8">
<div class="flex items-center justify-between pb-6">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Available Brackets</span>
<span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary-container font-label-sm text-label-sm">6 Showing</span>
</div>
<div class="flex items-center gap-2 text-outline font-label-md text-label-md">
<span>Sort by:</span>
<select class="bg-surface-container text-on-surface px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-container cursor-pointer font-body-sm text-body-sm">
<option>Closing Soonest</option>
<option>Highest Prize Pool</option>
<option>Elo Match Compatibility</option>
<option>Entry Fee: Low to High</option>
</select>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
<!-- CARD 1: Summer Badminton Cup (Featured / Urgent) -->
<div class="group relative rounded-2xl bg-surface-container-low/90 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,229,255,0.15)] hover:-translate-y-1">
<!-- Top Visual Edge Glow Line -->
<div class="h-1.5 w-full bg-gradient-to-r from-error via-primary-container to-secondary-fixed"></div>
<div class="p-space-lg flex flex-col gap-space-md flex-1">
<!-- Urgency Badge + Sport -->
<div class="flex items-center justify-between gap-2">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container/20 text-error font-label-sm text-label-sm">
<span class="w-2 h-2 rounded-full bg-error animate-ping"></span>
              Registration Closing Soon • 2 Days Left
            </span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Badminton</span>
</div>
<!-- Tournament Title & Organizer -->
<div class="flex flex-col gap-1">
<h2 class="font-headline-md text-headline-md text-on-surface group-hover:text-primary-container transition-colors">
              Summer Badminton Cup
            </h2>
<div class="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-base text-primary-container">verified</span>
<span>Organized by <strong class="text-on-surface font-label-md text-label-md">Kinetic Arena</strong></span>
</div>
<span class="font-label-sm text-label-sm text-outline">Badminton • Singles &amp; Doubles Format</span>
</div>
<!-- Schedule & Venue Information -->
<div class="p-3 rounded-xl bg-surface-container flex items-start gap-3">
<span class="material-symbols-outlined text-primary-container text-xl mt-0.5">calendar_clock</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">Sat, Jul 19 • 09:00 - 18:00</span>
<span class="font-body-sm text-body-sm text-outline">Kinetic Arena - Hall A (Air Conditioned)</span>
</div>
</div>
<!-- Key Metrics Badges Grid -->
<div class="grid grid-cols-3 gap-2 text-center">
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Prize Pool</span>
<span class="font-headline-sm text-headline-sm text-primary-container font-bold">$500</span>
<span class="text-[10px] text-outline">Escrow Lock</span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Entry Fee</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">$10</span>
<span class="text-[10px] text-outline">Per player</span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Elo Bracket</span>
<span class="font-headline-sm text-headline-sm text-secondary-fixed font-bold">1200-1500</span>
<span class="text-[10px] text-outline">Intermediate</span>
</div>
</div>
<!-- Participant Capacity & Custom Micro-Progress -->
<div class="flex flex-col gap-1.5 pt-1">
<div class="flex items-center justify-between text-body-sm font-body-sm">
<span class="text-on-surface flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<strong>12 / 16</strong> Registered
              </span>
<span class="text-secondary-fixed font-label-sm text-label-sm">Only 4 slots remaining!</span>
</div>
<div class="w-full h-2 rounded-full bg-surface-container overflow-hidden">
<div class="h-full bg-gradient-to-r from-secondary-fixed-dim to-secondary-fixed rounded-full shadow-[0_0_8px_#60ff98]" style="width: 75%"></div>
</div>
</div>
</div>
<!-- Action Tray -->
<div class="p-space-lg pt-0 flex items-center gap-space-sm">
<button class="flex-1 py-3 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_28px_rgba(0,229,255,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" onclick="handleJoinModal('Summer Badminton Cup', '$10')">
<span>Join Tournament</span>
<span class="material-symbols-outlined text-lg">arrow_forward</span>
</button>
<button class="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" onclick="handleViewBracket('Summer Badminton Cup')" title="View Current Seeds &amp; Bracket">
<span class="material-symbols-outlined text-xl">account_tree</span>
</button>
</div>
</div>
<!-- CARD 2: Metro Neon Padel Masters (High Stakes Pro) -->
<div class="group relative rounded-2xl bg-surface-container-low/90 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,229,255,0.15)] hover:-translate-y-1">
<div class="h-1.5 w-full bg-gradient-to-r from-primary-container via-tertiary-fixed to-primary"></div>
<div class="p-space-lg flex flex-col gap-space-md flex-1">
<div class="flex items-center justify-between gap-2">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 text-primary-container font-label-sm text-label-sm">
<span class="material-symbols-outlined text-xs">local_fire_department</span>
              High Stakes • Pro Tier
            </span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Padel</span>
</div>
<div class="flex flex-col gap-1">
<h2 class="font-headline-md text-headline-md text-on-surface group-hover:text-primary-container transition-colors">
              Metro Neon Padel Masters
            </h2>
<div class="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-base text-primary-container">verified</span>
<span>Organized by <strong class="text-on-surface font-label-md text-label-md">CyberCourt Downtown</strong></span>
</div>
<span class="font-label-sm text-label-sm text-outline">Padel • Open Doubles</span>
</div>
<div class="p-3 rounded-xl bg-surface-container flex items-start gap-3">
<span class="material-symbols-outlined text-primary-container text-xl mt-0.5">schedule</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">Sun, Jul 20 • 14:00 Start</span>
<span class="font-body-sm text-body-sm text-outline">Downtown Kinetic Hub • Court 3 &amp; 4</span>
</div>
</div>
<div class="grid grid-cols-3 gap-2 text-center">
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Prize Pool</span>
<span class="font-headline-sm text-headline-sm text-primary-container font-bold">$1,200</span>
<span class="text-[10px] text-outline">Instant Payout</span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Entry Fee</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">$25</span>
<span class="text-[10px] text-outline">Per team</span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Elo Bracket</span>
<span class="font-headline-sm text-headline-sm text-tertiary-fixed font-bold">1450+</span>
<span class="text-[10px] text-outline">Elite Masters</span>
</div>
</div>
<div class="flex flex-col gap-1.5 pt-1">
<div class="flex items-center justify-between text-body-sm font-body-sm">
<span class="text-on-surface flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<strong>28 / 32</strong> Registered
              </span>
<span class="text-secondary-fixed font-label-sm text-label-sm">4 slots left!</span>
</div>
<div class="w-full h-2 rounded-full bg-surface-container overflow-hidden">
<div class="h-full bg-gradient-to-r from-primary-container to-secondary-fixed rounded-full shadow-[0_0_8px_#60ff98]" style="width: 88%"></div>
</div>
</div>
</div>
<div class="p-space-lg pt-0 flex items-center gap-space-sm">
<button class="flex-1 py-3 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_28px_rgba(0,229,255,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" onclick="handleJoinModal('Metro Neon Padel Masters', '$25')">
<span>Join Tournament ($25)</span>
<span class="material-symbols-outlined text-lg">arrow_forward</span>
</button>
<button class="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" onclick="handleViewBracket('Metro Neon Padel Masters')" title="View Current Seeds &amp; Bracket">
<span class="material-symbols-outlined text-xl">account_tree</span>
</button>
</div>
</div>
<!-- CARD 3: Kinetic Smash Open Series #4 (Weekly Flash) -->
<div class="group relative rounded-2xl bg-surface-container-low/90 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,229,255,0.15)] hover:-translate-y-1">
<div class="h-1.5 w-full bg-gradient-to-r from-secondary-fixed-dim via-primary-container to-primary"></div>
<div class="p-space-lg flex flex-col gap-space-md flex-1">
<div class="flex items-center justify-between gap-2">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/10 text-secondary-fixed font-label-sm text-label-sm">
<span class="material-symbols-outlined text-xs">bolt</span>
              Weekly Flash Tournament
            </span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Badminton</span>
</div>
<div class="flex flex-col gap-1">
<h2 class="font-headline-md text-headline-md text-on-surface group-hover:text-primary-container transition-colors">
              Kinetic Smash Open #4
            </h2>
<div class="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-base text-primary-container">verified</span>
<span>Organized by <strong class="text-on-surface font-label-md text-label-md">Kinetic Arena</strong></span>
</div>
<span class="font-label-sm text-label-sm text-outline">Badminton • Mixed Doubles</span>
</div>
<div class="p-3 rounded-xl bg-surface-container flex items-start gap-3">
<span class="material-symbols-outlined text-primary-container text-xl mt-0.5">event</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">Fri, Jul 25 • 19:30</span>
<span class="font-body-sm text-body-sm text-outline">Kinetic Arena • Main Synthetic Court</span>
</div>
</div>
<div class="grid grid-cols-3 gap-2 text-center">
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Prize Pool</span>
<span class="font-headline-sm text-headline-sm text-primary-container font-bold">$350</span>
<span class="text-[10px] text-outline">Verified</span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Entry Fee</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">$8</span>
<span class="text-[10px] text-outline">Community</span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Elo Bracket</span>
<span class="font-headline-sm text-headline-sm text-secondary-fixed font-bold">1000-1300</span>
<span class="text-[10px] text-outline">Amateur</span>
</div>
</div>
<div class="flex flex-col gap-1.5 pt-1">
<div class="flex items-center justify-between text-body-sm font-body-sm">
<span class="text-on-surface flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-primary-container"></span>
<strong>8 / 16</strong> Registered
              </span>
<span class="text-outline font-label-sm text-label-sm">50% capacity</span>
</div>
<div class="w-full h-2 rounded-full bg-surface-container overflow-hidden">
<div class="h-full bg-primary-container rounded-full shadow-[0_0_8px_rgba(0,229,255,0.4)]" style="width: 50%"></div>
</div>
</div>
</div>
<div class="p-space-lg pt-0 flex items-center gap-space-sm">
<button class="flex-1 py-3 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_28px_rgba(0,229,255,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" onclick="handleJoinModal('Kinetic Smash Open Series #4', '$8')">
<span>Join Tournament ($8)</span>
<span class="material-symbols-outlined text-lg">arrow_forward</span>
</button>
<button class="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" onclick="handleViewBracket('Kinetic Smash Open Series #4')" title="View Current Seeds &amp; Bracket">
<span class="material-symbols-outlined text-xl">account_tree</span>
</button>
</div>
</div>
<!-- CARD 4: Pickleball Sunset Showdown (Free Entry) -->
<div class="group relative rounded-2xl bg-surface-container-low/90 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,229,255,0.15)] hover:-translate-y-1">
<div class="h-1.5 w-full bg-gradient-to-r from-secondary-fixed via-secondary to-primary-container"></div>
<div class="p-space-lg flex flex-col gap-space-md flex-1">
<div class="flex items-center justify-between gap-2">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/10 text-secondary-fixed font-label-sm text-label-sm">
<span class="material-symbols-outlined text-xs">celebration</span>
              Free Entry Community Cup
            </span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Pickleball</span>
</div>
<div class="flex flex-col gap-1">
<h2 class="font-headline-md text-headline-md text-on-surface group-hover:text-primary-container transition-colors">
              Sunset Showdown
            </h2>
<div class="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-base text-primary-container">verified</span>
<span>Organized by <strong class="text-on-surface font-label-md text-label-md">Skyline Sports Hub</strong></span>
</div>
<span class="font-label-sm text-label-sm text-outline">Pickleball • Casual Open Round</span>
</div>
<div class="p-3 rounded-xl bg-surface-container flex items-start gap-3">
<span class="material-symbols-outlined text-primary-container text-xl mt-0.5">wb_twilight</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">Sat, Jul 26 • 16:00</span>
<span class="font-body-sm text-body-sm text-outline">Skyline Sports • Rooftop Arena</span>
</div>
</div>
<div class="grid grid-cols-3 gap-2 text-center">
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Prize</span>
<span class="font-label-md text-label-md text-secondary-fixed font-bold leading-5">$200 Gear</span>
<span class="text-[10px] text-outline">Pro Voucher</span>
</div>
<div class="p-2.5 rounded-xl bg-secondary-container/15 flex flex-col items-center">
<span class="font-label-sm text-label-sm text-secondary-fixed uppercase">Entry Fee</span>
<span class="font-headline-sm text-headline-sm text-secondary-fixed font-bold">FREE</span>
<span class="text-[10px] text-secondary-fixed-dim">Sponsored</span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Elo Bracket</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">ALL</span>
<span class="text-[10px] text-outline">Open to All</span>
</div>
</div>
<div class="flex flex-col gap-1.5 pt-1">
<div class="flex items-center justify-between text-body-sm font-body-sm">
<span class="text-on-surface flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<strong>22 / 24</strong> Registered
              </span>
<span class="text-secondary-fixed font-label-sm text-label-sm">2 slots left!</span>
</div>
<div class="w-full h-2 rounded-full bg-surface-container overflow-hidden">
<div class="h-full bg-secondary-fixed rounded-full shadow-[0_0_8px_#60ff98]" style="width: 92%"></div>
</div>
</div>
</div>
<div class="p-space-lg pt-0 flex items-center gap-space-sm">
<button class="flex-1 py-3 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_28px_rgba(0,229,255,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" onclick="handleJoinModal('Pickleball Sunset Showdown', 'FREE')">
<span>Register For Free</span>
<span class="material-symbols-outlined text-lg">arrow_forward</span>
</button>
<button class="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" onclick="handleViewBracket('Pickleball Sunset Showdown')" title="View Current Seeds &amp; Bracket">
<span class="material-symbols-outlined text-xl">account_tree</span>
</button>
</div>
</div>
<!-- CARD 5: Velocity 3x3 Street Ball Clash (High Stakes Basketball) -->
<div class="group relative rounded-2xl bg-surface-container-low/90 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,229,255,0.15)] hover:-translate-y-1">
<div class="h-1.5 w-full bg-gradient-to-r from-primary via-primary-container to-secondary-fixed"></div>
<div class="p-space-lg flex flex-col gap-space-md flex-1">
<div class="flex items-center justify-between gap-2">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 text-primary-container font-label-sm text-label-sm">
<span class="material-symbols-outlined text-xs">lock</span>
              Escrow Guaranteed • 16 Teams
            </span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Basketball 3x3</span>
</div>
<div class="flex flex-col gap-1">
<h2 class="font-headline-md text-headline-md text-on-surface group-hover:text-primary-container transition-colors">
              Velocity 3x3 Street Clash
            </h2>
<div class="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-base text-primary-container">verified</span>
<span>Organized by <strong class="text-on-surface font-label-md text-label-md">The Kinetic Urban Hub</strong></span>
</div>
<span class="font-label-sm text-label-sm text-outline">FIBA 3x3 Fast-Break Rules</span>
</div>
<div class="p-3 rounded-xl bg-surface-container flex items-start gap-3">
<span class="material-symbols-outlined text-primary-container text-xl mt-0.5">sports_basketball</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">Aug 02 • 11:00</span>
<span class="font-body-sm text-body-sm text-outline">The Urban Hub • Sector 9 Cage</span>
</div>
</div>
<div class="grid grid-cols-3 gap-2 text-center">
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Prize Pool</span>
<span class="font-headline-sm text-headline-sm text-primary-container font-bold">$2,000</span>
<span class="text-[10px] text-outline">Winner takes $1.4k</span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Entry Fee</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">$40</span>
<span class="text-[10px] text-outline">Team ($10/player)</span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Elo Bracket</span>
<span class="font-headline-sm text-headline-sm text-secondary-fixed font-bold">1300+</span>
<span class="text-[10px] text-outline">Competitive</span>
</div>
</div>
<div class="flex flex-col gap-1.5 pt-1">
<div class="flex items-center justify-between text-body-sm font-body-sm">
<span class="text-on-surface flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-primary-container"></span>
<strong>10 / 16</strong> Teams Registered
              </span>
<span class="text-outline font-label-sm text-label-sm">6 slots open</span>
</div>
<div class="w-full h-2 rounded-full bg-surface-container overflow-hidden">
<div class="h-full bg-primary-container rounded-full shadow-[0_0_8px_rgba(0,229,255,0.4)]" style="width: 62.5%"></div>
</div>
</div>
</div>
<div class="p-space-lg pt-0 flex items-center gap-space-sm">
<button class="flex-1 py-3 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_28px_rgba(0,229,255,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" onclick="handleJoinModal('Velocity 3x3 Street Ball Clash', '$40 / Team')">
<span>Register Team ($40)</span>
<span class="material-symbols-outlined text-lg">arrow_forward</span>
</button>
<button class="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" onclick="handleViewBracket('Velocity 3x3 Street Ball Clash')" title="View Current Seeds &amp; Bracket">
<span class="material-symbols-outlined text-xl">account_tree</span>
</button>
</div>
</div>
<!-- CARD 6: All-Star Badminton Duo Invitational -->
<div class="group relative rounded-2xl bg-surface-container-low/90 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,229,255,0.15)] hover:-translate-y-1">
<div class="h-1.5 w-full bg-gradient-to-r from-secondary-fixed to-primary-container"></div>
<div class="p-space-lg flex flex-col gap-space-md flex-1">
<div class="flex items-center justify-between gap-2">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/10 text-secondary-fixed font-label-sm text-label-sm">
<span class="material-symbols-outlined text-xs">military_tech</span>
              Weekend Championship
            </span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Badminton</span>
</div>
<div class="flex flex-col gap-1">
<h2 class="font-headline-md text-headline-md text-on-surface group-hover:text-primary-container transition-colors">
              All-Star Badminton Duo
            </h2>
<div class="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-base text-primary-container">verified</span>
<span>Organized by <strong class="text-on-surface font-label-md text-label-md">Kinetic Arena</strong></span>
</div>
<span class="font-label-sm text-label-sm text-outline">Badminton • Mens &amp; Womens Doubles</span>
</div>
<div class="p-3 rounded-xl bg-surface-container flex items-start gap-3">
<span class="material-symbols-outlined text-primary-container text-xl mt-0.5">military_tech</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">Aug 08 • 10:00 Start</span>
<span class="font-body-sm text-body-sm text-outline">Kinetic Arena • Championship Hall B</span>
</div>
</div>
<div class="grid grid-cols-3 gap-2 text-center">
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Prize Pool</span>
<span class="font-headline-sm text-headline-sm text-primary-container font-bold">$800</span>
<span class="text-[10px] text-outline">Escrow Lock</span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Entry Fee</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">$15</span>
<span class="text-[10px] text-outline">Per pair</span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container flex flex-col items-center">
<span class="font-label-sm text-label-sm text-outline uppercase">Elo Bracket</span>
<span class="font-headline-sm text-headline-sm text-secondary-fixed font-bold">1250-1600</span>
<span class="text-[10px] text-outline">High Competitive</span>
</div>
</div>
<div class="flex flex-col gap-1.5 pt-1">
<div class="flex items-center justify-between text-body-sm font-body-sm">
<span class="text-on-surface flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<strong>14 / 16</strong> Registered
              </span>
<span class="text-secondary-fixed font-label-sm text-label-sm">Only 2 pairs left!</span>
</div>
<div class="w-full h-2 rounded-full bg-surface-container overflow-hidden">
<div class="h-full bg-gradient-to-r from-secondary-fixed to-primary-container rounded-full shadow-[0_0_8px_#60ff98]" style="width: 87.5%"></div>
</div>
</div>
</div>
<div class="p-space-lg pt-0 flex items-center gap-space-sm">
<button class="flex-1 py-3 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_28px_rgba(0,229,255,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" onclick="handleJoinModal('All-Star Badminton Duo Invitational', '$15')">
<span>Join Tournament ($15)</span>
<span class="material-symbols-outlined text-lg">arrow_forward</span>
</button>
<button class="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" onclick="handleViewBracket('All-Star Badminton Duo Invitational')" title="View Current Seeds &amp; Bracket">
<span class="material-symbols-outlined text-xl">account_tree</span>
</button>
</div>
</div>
</div>
</section>
<!-- Interactive Modal Slot (Join / Registration Confirmation) -->
<div class="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md hidden items-center justify-center p-4" id="join-modal">
<div class="w-full max-w-md bg-surface-container-low rounded-2xl p-space-xl flex flex-col gap-space-md shadow-2xl relative">
<button class="absolute top-4 right-4 text-outline hover:text-on-surface" onclick="closeModal()">
<span class="material-symbols-outlined">close</span>
</button>
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-xl bg-primary-container/20 text-primary-container flex items-center justify-center">
<span class="material-symbols-outlined text-2xl">trophy</span>
</div>
<div>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed">Kinetic Escrow Registry</span>
<h3 class="font-headline-sm text-headline-sm text-on-surface" id="modal-title">Confirm Entry</h3>
</div>
</div>
<div class="p-space-md rounded-xl bg-surface-container flex flex-col gap-2">
<div class="flex justify-between items-center text-body-sm font-body-sm">
<span class="text-outline">Player / Captain</span>
<span class="text-on-surface font-label-md text-label-md">Alex Rivera (Elo 1,350)</span>
</div>
<div class="flex justify-between items-center text-body-sm font-body-sm">
<span class="text-outline">Calculated Entry Fee</span>
<span class="text-primary-container font-headline-sm text-headline-sm" id="modal-fee">$10</span>
</div>
<div class="flex justify-between items-center text-body-sm font-body-sm">
<span class="text-outline">Kinetic Points Balance</span>
<span class="text-secondary-fixed font-label-md text-label-md">1,420 PTS (Covers Entry)</span>
</div>
</div>
<div class="flex items-start gap-2 p-2 rounded-lg bg-surface-container-high/40 text-outline text-body-sm font-body-sm">
<span class="material-symbols-outlined text-primary-container text-base mt-0.5">lock_clock</span>
<span>Funds held securely in Kinetic Smart Escrow and automatically refunded if bracket is cancelled or rescheduled.</span>
</div>
<div class="flex items-center gap-space-sm pt-2">
<button class="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors" onclick="closeModal()">
          Cancel
        </button>
<button class="flex-1 py-3 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_28px_rgba(0,229,255,0.65)] transition-all" onclick="confirmEntry()">
          Authorize Entry
        </button>
</div>
</div>
</div>
<!-- Bottom Guarantee & Organizer Promo Section -->
<section class="w-full px-margin-lg max-w-7xl mx-auto py-16">
<div class="relative rounded-3xl p-8 md:p-12 overflow-hidden bg-gradient-to-br from-surface-container to-surface-container-low shadow-2xl flex flex-col md:flex-row items-center justify-between gap-space-xl">
<!-- Decorative radial ambient -->
<div class="absolute -right-20 -bottom-20 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
<div class="absolute -left-20 -top-20 w-80 h-80 bg-secondary-fixed/10 rounded-full blur-3xl pointer-events-none"></div>
<div class="flex flex-col gap-space-sm max-w-2xl relative z-10">
<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/10 text-secondary-fixed font-label-sm text-label-sm uppercase tracking-widest w-fit">
<span class="material-symbols-outlined text-sm">hub</span>
          Host &amp; Monetize Events
        </div>
<h2 class="font-headline-lg text-headline-lg uppercase text-on-surface">
          Are you a Court Owner or Club Organizer?
        </h2>
<p class="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
          Host your official tournament bracket on The Kinetic. Experience automated Swiss &amp; Single-Elimination scheduling, multi-sig escrow prize vaults, and real-time regional Elo calibration.
        </p>
<!-- Trust Micro-Badges -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary-container text-lg">verified</span>
<span class="font-label-sm text-label-sm text-on-surface">Instant Escrow Payouts</span>
</div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-secondary-fixed text-lg">sync_saved_locally</span>
<span class="font-label-sm text-label-sm text-on-surface">Official Elo Calibration</span>
</div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-tertiary-fixed text-lg">account_tree</span>
<span class="font-label-sm text-label-sm text-on-surface">Automated Bracket Seeding</span>
</div>
</div>
</div>
<div class="flex flex-col sm:flex-row md:flex-col gap-space-sm w-full md:w-auto shrink-0 relative z-10">
<button class="px-8 py-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-[0_0_20px_rgba(0,229,255,0.45)] hover:shadow-[0_0_30px_rgba(0,229,255,0.7)] hover:scale-105 transition-all text-center flex items-center justify-center gap-2">
<span>Host a Tournament</span>
<span class="material-symbols-outlined text-lg">add_circle</span>
</button>
<button class="px-8 py-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg transition-all text-center flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-lg text-outline">shield_with_heart</span>
<span>Learn About Escrow Vaults</span>
</button>
</div>
</div>
</section>
<!-- Client-Side Micro-Interactions Script -->
<script>
    function selectSport(element, sportName) {
      document.querySelectorAll('.sport-filter').forEach(btn => {
        btn.classList.remove('bg-primary-container', 'text-on-primary-container', 'shadow-[0_0_16px_rgba(0,229,255,0.35)]');
        btn.classList.add('bg-surface-container', 'text-on-surface-variant');
        const dot = btn.querySelector('.rounded-full');
        if (dot) dot.remove();
      });

      element.classList.remove('bg-surface-container', 'text-on-surface-variant');
      element.classList.add('bg-primary-container', 'text-on-primary-container', 'shadow-[0_0_16px_rgba(0,229,255,0.35)]');
      
      const indicator = document.createElement('span');
      indicator.className = 'w-2 h-2 rounded-full bg-surface';
      element.appendChild(indicator);
    }

    function toggleChip(element) {
      const parent = element.parentElement;
      parent.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('bg-surface-container-highest', 'text-on-surface', 'bg-secondary-container/20', 'text-secondary-fixed');
        btn.classList.add('bg-surface-container', 'text-on-surface-variant');
      });
      element.classList.remove('bg-surface-container', 'text-on-surface-variant');
      element.classList.add('bg-surface-container-highest', 'text-on-surface');
    }

    let eloFiltered = true;
    function toggleEloFilter() {
      eloFiltered = !eloFiltered;
      const toggle = document.getElementById('elo-toggle');
      const knob = document.getElementById('elo-knob');
      if (eloFiltered) {
        toggle.classList.remove('bg-surface-container-highest');
        toggle.classList.add('bg-primary-container');
        knob.classList.remove('translate-x-0.5');
        knob.classList.add('translate-x-5');
      } else {
        toggle.classList.remove('bg-primary-container');
        toggle.classList.add('bg-surface-container-highest');
        knob.classList.remove('translate-x-5');
        knob.classList.add('translate-x-0.5');
      }
    }

    function resetAllFilters() {
      const firstSport = document.querySelector('.sport-filter');
      if (firstSport) selectSport(firstSport, 'all');
      const searchInput = document.getElementById('tournament-search');
      if (searchInput) searchInput.value = '';
    }

    function handleJoinModal(tournamentName, fee) {
      document.getElementById('modal-title').innerText = tournamentName;
      document.getElementById('modal-fee').innerText = fee;
      const modal = document.getElementById('join-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeModal() {
      const modal = document.getElementById('join-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function confirmEntry() {
      alert('Tournament entry authorized! Your escrow slot has been reserved.');
      closeModal();
    }

    function handleViewBracket(title) {
      alert('Generating dynamic Swiss/Single-Elimination bracket preview for: ' + title);
    }
  </script>
</div></main><footer class="w-full bg-surface-container-lowest py-space-xl"><div class="w-full px-margin-lg flex flex-col md:flex-row items-center justify-between gap-space-md"><div class="flex items-center gap-space-sm"><span class="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Sport<span class="text-primary-container">Nexus</span></span><span class="text-outline text-body-sm font-body-sm">• Kinetic Performance Hub</span></div><p class="text-outline font-body-sm text-body-sm">© 2025 The Kinetic Network. Engineered for competitive precision.</p><div class="flex items-center gap-space-lg"><a class="text-outline hover:text-primary-container font-label-md text-label-md transition-colors" href="#">Security Matrix</a><a class="text-outline hover:text-primary-container font-label-md text-label-md transition-colors" href="#">Terms of Arena</a><a class="text-outline hover:text-primary-container font-label-md text-label-md transition-colors" href="#">API Feeds</a></div></div></footer></body></html>`

function TournamentList() {
  return <iframe title="SportNexus TournamentList" srcDoc={tournamentListPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default TournamentList
