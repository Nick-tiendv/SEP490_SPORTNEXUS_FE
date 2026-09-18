const walletPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Outfit:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config={darkMode:"class",theme:{extend:{"colors":{"on-secondary-container":"#007239","on-error-container":"#ffdad6","tertiary":"#e9ecff","secondary-fixed":"#60ff98","on-surface":"#dfe2ee","surface-tint":"#00daf3","on-surface-variant":"#bac9cc","tertiary-container":"#c2cfff","on-secondary-fixed-variant":"#005227","background":"#0f131c","tertiary-fixed":"#dbe1ff","surface-variant":"#31353e","on-secondary-fixed":"#00210c","outline":"#849396","error":"#ffb4ab","on-primary-container":"#00626e","error-container":"#93000a","surface-container":"#1c2028","on-primary-fixed":"#001f24","secondary":"#f5fff3","surface-container-high":"#262a33","on-background":"#dfe2ee","primary-fixed":"#9cf0ff","on-primary-fixed-variant":"#004f58","primary-fixed-dim":"#00daf3","primary-container":"#00e5ff","surface-container-low":"#181c24","surface-container-lowest":"#0a0e16","secondary-container":"#34ff8c","on-tertiary-fixed":"#00174b","inverse-on-surface":"#2c3039","inverse-surface":"#dfe2ee","on-tertiary":"#002a78","tertiary-fixed-dim":"#b4c5ff","primary":"#c3f5ff","surface-bright":"#353942","surface":"#0f131c","secondary-fixed-dim":"#00e478","on-tertiary-container":"#004ecf","outline-variant":"#3b494c","on-error":"#690005","on-tertiary-fixed-variant":"#003ea8","on-secondary":"#003919","on-primary":"#00363d","surface-container-highest":"#31353e","surface-dim":"#0f131c","inverse-primary":"#006875"},"borderRadius":{"DEFAULT":"0.25rem","lg":"0.5rem","xl":"0.75rem","full":"9999px"},"spacing":{"space-md":"1rem","space-sm":"0.5rem","margin-sm":"1rem","margin":"1.25rem","gutter-sm":"0.75rem","space-lg":"1.5rem","margin-lg":"2rem","space-xl":"2rem","space-xs":"0.25rem","gutter":"1rem"},"fontFamily":{"body-lg":["Inter"],"label-md":["Outfit"],"headline-md":["Outfit"],"body-sm":["Inter"],"label-lg":["Outfit"],"label-sm":["Outfit"],"body-md":["Inter"],"display-lg":["Outfit"],"headline-sm":["Outfit"],"headline-lg":["Outfit"],"display-lg-mobile":["Outfit"]},"fontSize":{"body-lg":["16px",{"lineHeight":"24px","fontWeight":"400"}],"label-md":["12px",{"lineHeight":"16px","letterSpacing":"0.06em","fontWeight":"600"}],"headline-md":["22px",{"lineHeight":"28px","letterSpacing":"-0.01em","fontWeight":"600"}],"body-sm":["12px",{"lineHeight":"16px","fontWeight":"400"}],"label-lg":["14px",{"lineHeight":"18px","letterSpacing":"0.04em","fontWeight":"600"}],"label-sm":["10px",{"lineHeight":"12px","letterSpacing":"0.08em","fontWeight":"700"}],"body-md":["14px",{"lineHeight":"20px","fontWeight":"400"}],"display-lg":["44px",{"lineHeight":"48px","letterSpacing":"-0.03em","fontWeight":"800"}],"headline-sm":["18px",{"lineHeight":"24px","fontWeight":"600"}],"headline-lg":["28px",{"lineHeight":"34px","letterSpacing":"-0.02em","fontWeight":"700"}],"display-lg-mobile":["32px",{"lineHeight":"36px","letterSpacing":"-0.02em","fontWeight":"800"}]}}}};</script><style>img[alt^="SportNexus logo mark"]{display:none!important}</style></head><body class="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container"><header class="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div class="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-lg"><div class="flex items-center gap-space-lg"><a class="flex items-center gap-space-sm group" data-path="dashboard" href="#"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg"/><div class="flex flex-col"><span class="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold group-hover:text-primary transition-colors">The SportNexus</span><span class="font-label-sm text-label-sm text-surface-tint uppercase -mt-1">Athletic Fintech</span></div></a><nav class="hidden xl:flex items-center gap-space-xs p-space-xs bg-surface-container-lowest/60 rounded-xl" data-active-classes="bg-primary-container text-on-primary-container font-label-lg text-label-lg rounded-lg"><a class="font-label-lg text-label-lg px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" data-path="dashboard" href="#">Dashboard</a><a class="font-label-lg text-label-lg px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" data-path="court-finder" href="#">Court Finder</a><a class="font-label-lg text-label-lg px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" data-path="tournaments" href="#">Tournaments</a><a aria-current="page" class="px-space-md py-space-xs transition-colors bg-primary-container text-on-primary-container font-label-lg text-label-lg rounded-lg" data-path="wallet" href="#">Wallet</a><a class="font-label-lg text-label-lg px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" data-path="community" href="#">Community</a></nav></div><div class="flex items-center gap-space-md"><div class="hidden md:flex items-center bg-surface-container-low px-space-md py-1.5 rounded-xl w-64 focus-within:ring-1 focus-within:ring-primary-container"><span class="material-symbols-outlined text-on-surface-variant text-[18px] mr-space-sm">search</span><input class="bg-transparent w-full text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm focus:outline-none" placeholder="Search matches, courts, assets..." type="text"/></div><button class="relative p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors" type="button"><span class="material-symbols-outlined text-[20px] block">notifications</span><span class="absolute top-1.5 right-1.5 flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span></span></button><div class="flex items-center gap-space-sm pl-space-xs"><div class="relative rounded-full p-[1px] bg-primary-container/40"><img alt="Profile" class="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/></div><div class="hidden lg:flex flex-col text-left"><span class="font-label-sm text-label-sm text-on-surface leading-none">Alex Rivera</span><span class="font-label-sm text-label-sm text-secondary-container leading-none mt-1">Pro Tier</span></div></div></div></div></header><main class="w-full pt-16 bg-surface flex-1"><div class="flex flex-col w-full max-w-7xl mx-auto px-margin py-space-lg space-y-space-xl text-on-surface">
<!-- TOP HEADER & SECURITY PROTOCOL BAR -->
<section class="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
<div class="space-y-space-xs">
<div class="flex items-center gap-space-xs">
<span class="font-label-sm text-label-sm uppercase tracking-widest text-primary-container">Fintech Subsystem</span>
<span class="text-on-surface-variant font-label-sm text-label-sm">â€¢</span>
<span class="font-label-sm text-label-sm text-secondary-container tracking-wider uppercase font-semibold">Ledger Synchronized</span>
</div>
<h1 class="font-display-lg text-display-lg text-on-surface font-extrabold tracking-tight">Player Digital Wallet &amp; Escrow</h1>
<p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
        Instant court settlements, escrow protection, and peer-to-peer split payment ledger backed by smart contracts.
      </p>
</div>
<!-- Live Security Status Badge -->
<div class="flex items-center gap-space-sm px-space-md py-space-sm bg-surface-container-low rounded-xl shadow-md backdrop-blur-md">
<div class="relative flex h-3 w-3 items-center justify-center">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface font-bold tracking-wide flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-secondary-container">verified_user</span>
          256-Bit Escrow Vault Active
        </span>
<span class="font-body-sm text-body-sm text-on-surface-variant text-[11px] leading-none">Protocol v8.4 â€¢ 0 Arbitrum Slippage</span>
</div>
</div>
</section>
<!-- HERO CARDS / DIGITAL WALLET HUB -->
<section class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
<!-- Holographic Kinetic Credit Card & Action Suite (7 Cols) -->
<div class="lg:col-span-7 flex flex-col justify-between p-space-lg rounded-2xl bg-surface-container-low shadow-xl relative overflow-hidden group">
<!-- Cyber circuit decorative gradient backdrops -->
<div class="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
<div class="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>
<!-- Holographic Digital Card Presentation -->
<div class="relative rounded-2xl p-space-lg bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest text-on-surface shadow-2xl overflow-hidden transition-all duration-300 group-hover:scale-[1.01]">
<!-- Micro-pattern SVG Grid Circuit -->
<svg class="absolute inset-0 w-full h-full opacity-15 pointer-events-none mix-blend-overlay" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
<defs>
<pattern height="24" id="cardGrid" patternunits="userSpaceOnUse" width="24">
<path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" stroke-width="0.8"></path>
<circle cx="24" cy="24" fill="currentColor" r="1.2"></circle>
</pattern>
</defs>
<rect fill="url(#cardGrid)" height="100%" width="100%"></rect>
</svg>
<!-- Card Top Bar: Chips, Contactless, Brand -->
<div class="relative z-10 flex items-center justify-between pb-space-lg">
<div class="flex items-center gap-space-md">
<!-- Metallic Smart Chip Graphic -->
<div class="w-11 h-9 rounded-md bg-gradient-to-tr from-amber-400/90 via-yellow-200 to-amber-500 shadow-inner flex items-center justify-center relative overflow-hidden">
<div class="w-full h-[1px] bg-amber-900/40 absolute top-3"></div>
<div class="w-full h-[1px] bg-amber-900/40 absolute bottom-3"></div>
<div class="h-full w-[1px] bg-amber-900/40 absolute left-3"></div>
<div class="h-full w-[1px] bg-amber-900/40 absolute right-3"></div>
<div class="w-3 h-2 rounded-[2px] bg-amber-600/30"></div>
</div>
<!-- Contactless Icon -->
<span class="material-symbols-outlined text-primary-fixed-dim text-[24px]">contactless</span>
</div>
<div class="flex items-center gap-space-xs">
<span class="h-2 w-2 rounded-full bg-primary-container"></span>
<span class="font-headline-sm text-headline-sm tracking-tighter text-on-surface font-extrabold uppercase">SportNexus</span>
<span class="font-label-sm text-label-sm bg-primary-container/20 text-primary-container px-2 py-0.5 rounded uppercase">Pass</span>
</div>
</div>
<!-- Balance Section -->
<div class="relative z-10 my-space-md space-y-1">
<span class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Available Player Liquid Assets</span>
<div class="flex flex-wrap items-baseline gap-space-md">
<h2 class="font-display-lg text-display-lg text-on-surface font-black tracking-tight flex items-center">
<span class="text-primary-container text-headline-lg font-medium mr-1">$</span>120.00
            </h2>
<span class="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary-container bg-secondary-container/10 px-2 py-1 rounded-full">
<span class="material-symbols-outlined text-[14px]">lock_clock</span>
              +$14.50 pending escrow refund
            </span>
</div>
</div>
<!-- Card Bottom Metadata -->
<div class="relative z-10 pt-space-lg flex flex-wrap items-end justify-between gap-space-sm">
<div class="space-y-0.5">
<p class="font-headline-sm text-headline-sm tracking-widest text-on-surface font-mono font-medium">â€¢â€¢â€¢â€¢ Â â€¢â€¢â€¢â€¢ Â â€¢â€¢â€¢â€¢ Â 8842</p>
<p class="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider font-mono">HOANG AN // ATHLETE ID: NX-9021</p>
</div>
<div class="text-right">
<span class="font-label-sm text-label-sm text-on-surface-variant block uppercase text-[10px]">Exp Date</span>
<span class="font-label-md text-label-md text-on-surface font-mono font-semibold">12/28</span>
</div>
</div>
</div>
<!-- Quick Action Deck -->
<div class="mt-space-lg pt-space-md flex flex-wrap items-center justify-between gap-space-sm">
<!-- Main Glowing Primary CTA -->
<button class="flex-1 min-w-[160px] flex items-center justify-center gap-space-xs bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-label-lg text-label-lg px-space-lg py-3.5 rounded-xl transition-all shadow-[0_0_24px_rgba(0,229,255,0.4)] active:scale-[0.98]" type="button">
<span class="material-symbols-outlined text-[20px] font-bold">bolt</span>
<span>âš¡ Top-Up Wallet</span>
</button>
<!-- Secondary Glass Buttons -->
<div class="flex items-center gap-space-xs flex-wrap">
<button class="flex items-center gap-1 px-space-md py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm" type="button">
<span class="material-symbols-outlined text-[18px] text-primary">call_split</span>
<span>Send / Split</span>
</button>
<button class="flex items-center gap-1 px-space-md py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm" type="button">
<span class="material-symbols-outlined text-[18px] text-secondary-container">sync</span>
<span>Auto-Reload (On)</span>
</button>
<button class="flex items-center gap-1 px-space-md py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm" type="button">
<span class="material-symbols-outlined text-[18px] text-on-surface-variant">arrow_outward</span>
<span>Withdraw</span>
</button>
</div>
</div>
</div>
<!-- Quick Analytics & One-Click Top-Up Deck (5 Cols) -->
<div class="lg:col-span-5 flex flex-col justify-between gap-space-md">
<!-- Trio Metric Pods -->
<div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-space-sm flex-1">
<!-- Metric 1 -->
<div class="p-space-md rounded-2xl bg-surface-container-low flex items-center justify-between shadow-md">
<div class="space-y-1">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Monthly Court Spend</span>
<div class="font-headline-lg text-headline-lg text-on-surface font-bold">$340.00</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">14 Match slots secured</span>
</div>
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[24px]">sports_tennis</span>
</div>
</div>
<!-- Metric 2 -->
<div class="p-space-md rounded-2xl bg-surface-container-low flex items-center justify-between shadow-md">
<div class="space-y-1">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Escrow Locked On-Hold</span>
<div class="font-headline-lg text-headline-lg text-secondary-container font-bold">$24.00</div>
<span class="font-body-sm text-body-sm text-secondary-container/80 flex items-center gap-1">
<span class="h-1.5 w-1.5 rounded-full bg-secondary-container"></span>
              2 pending tournament matches
            </span>
</div>
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary-container">
<span class="material-symbols-outlined text-[24px]">lock</span>
</div>
</div>
<!-- Metric 3 -->
<div class="p-space-md rounded-2xl bg-surface-container-low flex items-center justify-between shadow-md">
<div class="space-y-1">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Fairplay Cash Rebates</span>
<div class="font-headline-lg text-headline-lg text-primary-fixed-dim font-bold">+$15.20</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">5.0 Star Punctuality Index</span>
</div>
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary-fixed-dim">
<span class="material-symbols-outlined text-[24px]">military_tech</span>
</div>
</div>
</div>
<!-- Instant One-Click Top-Up Preset Block -->
<div class="p-space-md rounded-2xl bg-surface-container-low shadow-md space-y-space-sm">
<div class="flex items-center justify-between">
<span class="font-label-md text-label-md text-on-surface uppercase tracking-wider">Instant Express Reload</span>
<span class="font-label-sm text-label-sm text-primary">Apple Pay Linked</span>
</div>
<div class="grid grid-cols-4 gap-space-xs">
<button class="py-2.5 rounded-xl bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label-md text-label-md font-semibold transition-all duration-200 text-center shadow-sm" type="button">
            +$25
          </button>
<button class="py-2.5 rounded-xl bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label-md text-label-md font-semibold transition-all duration-200 text-center shadow-sm" type="button">
            +$50
          </button>
<button class="py-2.5 rounded-xl bg-primary-container/20 text-primary-container hover:bg-primary-container hover:text-on-primary-container font-label-md text-label-md font-semibold transition-all duration-200 text-center shadow-sm" type="button">
            +$100
          </button>
<button class="py-2.5 rounded-xl bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label-md text-label-md font-semibold transition-all duration-200 text-center shadow-sm" type="button">
            +$200
          </button>
</div>
</div>
</div>
</section>
<!-- MAIN BODY: TRANSACTION LEDGER & PAYMENT ECOSYSTEM SIDEBAR -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
<!-- TRANSACTION HISTORY LEDGER (8 COLS) -->
<div class="lg:col-span-8 space-y-space-md">
<!-- Filter Nav Bar & Search -->
<div class="p-space-md rounded-2xl bg-surface-container-low shadow-md space-y-space-md">
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Transaction History Ledger</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">Immutable athletic settlement records</p>
</div>
<!-- Date Filter Dropdown / Action -->
<button class="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors shadow-sm self-start sm:self-auto" type="button">
<span class="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
<span>Current Billing Cycle (Oct 2025)</span>
<span class="material-symbols-outlined text-[16px]">expand_more</span>
</button>
</div>
<!-- Filter Tabs Carousel -->
<div class="flex items-center gap-space-xs overflow-x-auto pb-1 text-nowrap">
<button class="px-space-md py-1.5 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold shadow-sm" type="button">
            All Transactions
          </button>
<button class="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors" type="button">
            Court Bookings
          </button>
<button class="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors" type="button">
            Top-Ups
          </button>
<button class="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors" type="button">
            Split Reimbursements
          </button>
<button class="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors" type="button">
            Refunds
          </button>
</div>
<!-- Search Bar -->
<div class="relative flex items-center bg-surface-container-lowest px-space-md py-2 rounded-xl shadow-inner">
<span class="material-symbols-outlined text-on-surface-variant text-[20px] mr-space-xs">search</span>
<input class="bg-transparent w-full font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none" placeholder="Filter by match, player handle, or transaction hash..." type="text"/>
</div>
</div>
<!-- LEDGER LIST ENTRIES -->
<div class="space-y-space-xs">
<!-- Entry 1 -->
<div class="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between gap-space-md shadow-sm">
<div class="flex items-center gap-space-md min-w-0">
<!-- Down Arrow Circle -->
<div class="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(255,180,171,0.2)]">
<span class="material-symbols-outlined text-error text-[20px]">south_east</span>
</div>
<div class="min-w-0">
<div class="flex items-center gap-space-xs flex-wrap">
<h4 class="font-label-lg text-label-lg text-on-surface font-bold truncate">Flash Claim Slot - Badminton Arena 3</h4>
<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-container/15 text-secondary-container flex items-center gap-1">
<span class="h-1.5 w-1.5 rounded-full bg-secondary-container"></span> Success
                </span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">Today, 18:42 â€¢ Court #3 Peak Claim â€¢ Instant Escrow Debit</p>
</div>
</div>
<div class="text-right flex-shrink-0">
<div class="font-headline-sm text-headline-sm text-error font-extrabold tracking-tight">-$5.00</div>
<span class="font-label-sm text-label-sm text-on-surface-variant font-mono">ID: #NX-99302</span>
</div>
</div>
<!-- Entry 2 -->
<div class="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between gap-space-md shadow-sm">
<div class="flex items-center gap-space-md min-w-0">
<!-- Up Arrow Circle -->
<div class="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_14px_rgba(52,255,140,0.3)]">
<span class="material-symbols-outlined text-secondary-container text-[20px]">north_west</span>
</div>
<div class="min-w-0">
<div class="flex items-center gap-space-xs flex-wrap">
<h4 class="font-label-lg text-label-lg text-on-surface font-bold truncate">Wallet Top-Up - Apple Pay</h4>
<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-container/15 text-secondary-container flex items-center gap-1">
<span class="h-1.5 w-1.5 rounded-full bg-secondary-container"></span> Success
                </span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">Yesterday, 14:15 â€¢ Trans ID #NX-88291 â€¢ Direct Gateway</p>
</div>
</div>
<div class="text-right flex-shrink-0">
<div class="font-headline-sm text-headline-sm text-secondary-container font-extrabold tracking-tight">+$50.00</div>
<span class="font-label-sm text-label-sm text-on-surface-variant font-mono">Vault Influx</span>
</div>
</div>
<!-- Entry 3 -->
<div class="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between gap-space-md shadow-sm">
<div class="flex items-center gap-space-md min-w-0">
<div class="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(255,180,171,0.2)]">
<span class="material-symbols-outlined text-error text-[20px]">call_split</span>
</div>
<div class="min-w-0">
<div class="flex items-center gap-space-xs flex-wrap">
<h4 class="font-label-lg text-label-lg text-on-surface font-bold truncate">Split Payment - Kinetic Arena Court 2</h4>
<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-container/15 text-secondary-container flex items-center gap-1">
<span class="h-1.5 w-1.5 rounded-full bg-secondary-container"></span> Success
                </span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">Oct 24, 2025 â€¢ 4-Way Match Split with @alex @sarah â€¢ Split Match Settlement</p>
</div>
</div>
<div class="text-right flex-shrink-0">
<div class="font-headline-sm text-headline-sm text-error font-extrabold tracking-tight">-$12.50</div>
<span class="font-label-sm text-label-sm text-on-surface-variant font-mono">Net Share</span>
</div>
</div>
<!-- Entry 4 -->
<div class="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between gap-space-md shadow-sm">
<div class="flex items-center gap-space-md min-w-0">
<div class="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_14px_rgba(52,255,140,0.3)]">
<span class="material-symbols-outlined text-secondary-container text-[20px]">credit_card</span>
</div>
<div class="min-w-0">
<div class="flex items-center gap-space-xs flex-wrap">
<h4 class="font-label-lg text-label-lg text-on-surface font-bold truncate">Wallet Top-Up - Visa Debit (â€¢â€¢â€¢â€¢ 4012)</h4>
<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-container/15 text-secondary-container flex items-center gap-1">
<span class="h-1.5 w-1.5 rounded-full bg-secondary-container"></span> Success
                </span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">Oct 22, 2025 â€¢ Trans ID #NX-87110 â€¢ Bank Card</p>
</div>
</div>
<div class="text-right flex-shrink-0">
<div class="font-headline-sm text-headline-sm text-secondary-container font-extrabold tracking-tight">+$100.00</div>
<span class="font-label-sm text-label-sm text-on-surface-variant font-mono">Chase Primary</span>
</div>
</div>
<!-- Entry 5 -->
<div class="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between gap-space-md shadow-sm">
<div class="flex items-center gap-space-md min-w-0">
<div class="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(255,180,171,0.2)]">
<span class="material-symbols-outlined text-error text-[20px]">emoji_events</span>
</div>
<div class="min-w-0">
<div class="flex items-center gap-space-xs flex-wrap">
<h4 class="font-label-lg text-label-lg text-on-surface font-bold truncate">Tournament Registration - Fall Open 2025</h4>
<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-container/15 text-secondary-container flex items-center gap-1">
<span class="h-1.5 w-1.5 rounded-full bg-secondary-container"></span> Success
                </span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">Oct 20, 2025 â€¢ Singles Division A â€¢ Tournament Escrow</p>
</div>
</div>
<div class="text-right flex-shrink-0">
<div class="font-headline-sm text-headline-sm text-error font-extrabold tracking-tight">-$35.00</div>
<span class="font-label-sm text-label-sm text-on-surface-variant font-mono">Prize Pool Locked</span>
</div>
</div>
<!-- Entry 6 -->
<div class="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between gap-space-md shadow-sm">
<div class="flex items-center gap-space-md min-w-0">
<div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 text-surface-tint">
<span class="material-symbols-outlined text-[20px] animate-spin">cyclone</span>
</div>
<div class="min-w-0">
<div class="flex items-center gap-space-xs flex-wrap">
<h4 class="font-label-lg text-label-lg text-on-surface font-bold truncate">Court Rainout Cancellation Refund</h4>
<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-tint/15 text-surface-tint flex items-center gap-1 animate-pulse">
<span class="h-1.5 w-1.5 rounded-full bg-surface-tint"></span> Processing Node
                </span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">Oct 18, 2025 â€¢ Automated Weather Clause â€¢ Smart Escrow Reversal</p>
</div>
</div>
<div class="text-right flex-shrink-0">
<div class="font-headline-sm text-headline-sm text-secondary-container font-extrabold tracking-tight">+$18.00</div>
<span class="font-label-sm text-label-sm text-surface-tint font-mono">Mempool Syncing</span>
</div>
</div>
</div>
<!-- Ledger Footer Navigation -->
<div class="flex items-center justify-between pt-space-sm px-space-xs">
<span class="font-body-sm text-body-sm text-on-surface-variant">Showing 6 of 128 ledger interactions</span>
<button class="font-label-md text-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1" type="button">
          Load Full Escrow Audit Trail
          <span class="material-symbols-outlined text-[16px]">arrow_downward</span>
</button>
</div>
</div>
<!-- PAYMENT METHODS & SECURITY ECOSYSTEM SIDEBAR (4 COLS) -->
<div class="lg:col-span-4 space-y-space-md">
<!-- Linked Payment Rails -->
<div class="p-space-lg rounded-2xl bg-surface-container-low shadow-md space-y-space-md">
<div class="flex items-center justify-between">
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Funding Sources</h3>
<button class="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-0.5" type="button">
<span class="material-symbols-outlined text-[14px]">add</span> Add Method
          </button>
</div>
<div class="space-y-space-sm">
<!-- Method 1: Apple Pay -->
<div class="p-space-sm rounded-xl bg-surface-container flex items-center justify-between shadow-sm">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface">
<span class="material-symbols-outlined text-[20px]">phone_iphone</span>
</div>
<div>
<div class="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1.5">
                  Apple Pay
                  <span class="font-label-sm text-label-sm bg-primary-container/20 text-primary-container px-1.5 py-0.2 rounded text-[10px]">DEFAULT</span>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">Instant 0-gas execution</span>
</div>
</div>
<span class="material-symbols-outlined text-secondary-container text-[20px]">check_circle</span>
</div>
<!-- Method 2: Smart Pass Vault -->
<div class="p-space-sm rounded-xl bg-surface-container flex items-center justify-between shadow-sm">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary-container">
<span class="material-symbols-outlined text-[20px]">token</span>
</div>
<div>
<div class="font-label-md text-label-md text-on-surface font-bold">Kinetic Smart Pass</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">L2 Gasless Staking Vault</span>
</div>
</div>
<span class="material-symbols-outlined text-on-surface-variant text-[18px]">more_horiz</span>
</div>
<!-- Method 3: Visa Card -->
<div class="p-space-sm rounded-xl bg-surface-container flex items-center justify-between shadow-sm">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface">
<span class="material-symbols-outlined text-[20px]">credit_card</span>
</div>
<div>
<div class="font-label-md text-label-md text-on-surface font-bold">Visa Ending in 4012</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">Expires 09/27</span>
</div>
</div>
<span class="material-symbols-outlined text-on-surface-variant text-[18px]">more_horiz</span>
</div>
</div>
</div>
<!-- Quantum Escrow Guarantee Module -->
<div class="p-space-lg rounded-2xl bg-gradient-to-br from-surface-container-low to-surface-container shadow-xl relative overflow-hidden space-y-space-md">
<div class="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-secondary-container/10 blur-2xl pointer-events-none"></div>
<div class="flex items-start gap-space-sm">
<div class="w-10 h-10 rounded-xl bg-secondary-container/10 text-secondary-container flex items-center justify-center flex-shrink-0">
<span class="material-symbols-outlined text-[24px]">shield_lock</span>
</div>
<div class="space-y-1">
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Quantum Escrow Guard</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant">
              Every court dollar staked is safeguarded in verifiable smart contracts. Rainout cancellations, host no-shows, and split disputes trigger autonomous restitution.
            </p>
</div>
</div>
<!-- Inline Escrow Verification Metrics -->
<div class="p-space-sm rounded-xl bg-surface-container-lowest/80 flex items-center justify-between text-on-surface">
<div>
<span class="font-label-sm text-label-sm text-on-surface-variant block uppercase text-[10px]">Protocol Solvency</span>
<span class="font-headline-sm text-headline-sm text-secondary-container font-mono font-bold">100% AUDITED</span>
</div>
<div class="text-right">
<span class="font-label-sm text-label-sm text-on-surface-variant block uppercase text-[10px]">Auto-Refund Speed</span>
<span class="font-headline-sm text-headline-sm text-primary font-mono font-bold">&lt; 120s</span>
</div>
</div>
<!-- Download Statement CTA -->
<button class="w-full py-3 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-md text-label-md flex items-center justify-center gap-space-xs transition-colors shadow-sm" type="button">
<span class="material-symbols-outlined text-[18px] text-primary">download</span>
<span>Download Oct 2025 Statement (PDF)</span>
</button>
</div>
<!-- Facility Access Pass Feature Widget -->
<div class="p-space-md rounded-2xl bg-surface-container-low shadow-md flex items-center gap-space-md">
<img class="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-md" data-alt="Futuristic glowing neon NFC athletic turnstile terminal scanned by a smartphone in a high-tech illuminated sports arena with electric cyan and lime stadium lights in a dark mode ambiance." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZeQXCVGaWgQQ700143xVVXknG7MgPpCiqhwcfUF-wzQgul-xzHIfS_mbPM1T3CpqmIDfg9QCMgyElPSjsmiJDQiRBuVIE3Ei3kuDCnqTlBKwd1vvRNPqcqlRVgSw4QHB6WQfx-snGCvPd-JC7ZZqYzGZz100CdjmMX6YF0X4jU5i8dtyTMyE7_yWiPDbIz0nGEOZbV5FA801imtHlDqRYXiTiwzAwF__DTQgdeia__mp-_497rZWr"/>
<div class="space-y-0.5 min-w-0">
<span class="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">NFC Smart Turnstile</span>
<p class="font-label-md text-label-md text-on-surface font-bold truncate">Instant Turnstile Unlocking</p>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">Tap phone at 42 affiliated club turnstiles.</p>
</div>
</div>
</div>
</div>
</div></main><footer class="w-full bg-surface-container-lowest py-space-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)]"><div class="max-w-7xl mx-auto px-margin"><div class="grid grid-cols-1 md:grid-cols-4 gap-space-xl pb-space-lg"><div class="space-y-space-sm md:col-span-1"><div class="flex items-center gap-space-xs"><span class="font-headline-sm text-headline-sm text-on-surface font-bold">The SportNexus</span></div><p class="font-body-sm text-body-sm text-on-surface-variant">Next-generation athletic liquidity, automated tournament staking, and precision court infrastructure protocol.</p></div><div><h4 class="font-label-md text-label-md text-primary uppercase mb-space-sm">Protocol</h4><ul class="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant"><li><a class="hover:text-on-surface transition-colors" data-path="court-finder" href="#">Court Liquidity</a></li><li><a class="hover:text-on-surface transition-colors" data-path="tournaments" href="#">Dynamic Brackets</a></li><li><a class="hover:text-on-surface transition-colors" data-path="wallet" href="#">Vault &amp; Staking</a></li></ul></div><div><h4 class="font-label-md text-label-md text-primary uppercase mb-space-sm">Ecosystem</h4><ul class="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant"><li><a class="hover:text-on-surface transition-colors" data-path="community" href="#">Matchmaking Hub</a></li><li><a class="hover:text-on-surface transition-colors" href="#">Player Rankings</a></li><li><a class="hover:text-on-surface transition-colors" href="#">API Integration</a></li></ul></div><div><h4 class="font-label-md text-label-md text-primary uppercase mb-space-sm">Network Status</h4><div class="flex items-center gap-space-xs mb-space-xs"><span class="h-2 w-2 rounded-full bg-secondary-container animate-pulse"></span><span class="font-label-sm text-label-sm text-on-surface">Arbitrum Nova â€¢ Operational</span></div><p class="font-body-sm text-body-sm text-on-surface-variant">Block Latency: 42ms â€¢ Daily Staked: $4.2M</p></div></div><div class="pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm font-body-sm text-body-sm text-on-surface-variant"><p>Â© 2025 The SportNexus Financial Protocol. All athletic rights reserved.</p><div class="flex items-center gap-space-lg"><a class="hover:text-on-surface transition-colors" href="#">Smart Contract Audit</a><a class="hover:text-on-surface transition-colors" href="#">Terms of Liquidity</a><a class="hover:text-on-surface transition-colors" href="#">Privacy Shield</a></div></div></div></footer></body></html>`

function Wallet() {
  return <iframe title="SportNexus Wallet" srcDoc={walletPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default Wallet
