const courtDetailsPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Outfit:wght@600;700;800&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config={darkMode:"class",theme:{extend:{colors:{"on-secondary":"#003919","primary-container":"#00e5ff","on-background":"#dfe2ee","on-tertiary-fixed":"#00174b","tertiary":"#e9ecff","tertiary-fixed":"#dbe1ff","tertiary-fixed-dim":"#b4c5ff","outline-variant":"#3b494c","surface":"#0f131c","error":"#ffb4ab","primary":"#c3f5ff","inverse-primary":"#006875","secondary-container":"#34ff8c","background":"#0f131c","on-secondary-fixed-variant":"#005227","error-container":"#93000a","inverse-on-surface":"#2c3039","on-primary-fixed":"#001f24","inverse-surface":"#dfe2ee","on-tertiary":"#002a78","primary-fixed-dim":"#00daf3","surface-container-high":"#262a33","on-surface-variant":"#bac9cc","surface-variant":"#31353e","on-secondary-fixed":"#00210c","surface-bright":"#353942","on-tertiary-fixed-variant":"#003ea8","secondary":"#f5fff3","on-primary-container":"#00626e","on-error":"#690005","on-secondary-container":"#007239","surface-tint":"#00daf3","outline":"#849396","surface-container-highest":"#31353e","surface-dim":"#0f131c","on-primary-fixed-variant":"#004f58","on-surface":"#dfe2ee","on-primary":"#00363d","secondary-fixed":"#60ff98","secondary-fixed-dim":"#00e478","surface-container-low":"#181c24","tertiary-container":"#c2cfff","surface-container":"#1c2028","primary-fixed":"#9cf0ff","surface-container-lowest":"#0a0e16","on-tertiary-container":"#004ecf","on-error-container":"#ffdad6"},borderRadius:{"DEFAULT":"0.25rem","lg":"0.5rem","xl":"0.75rem","full":"9999px"},spacing:{"margin-sm":"1rem","space-xs":"0.25rem","space-xl":"2rem","space-lg":"1.5rem","gutter-sm":"0.75rem","margin":"1.25rem","margin-lg":"2rem","space-md":"1rem","space-sm":"0.5rem","gutter":"1rem"},fontFamily:{"label-md":["Outfit"],"display-lg-mobile":["Outfit"],"display-lg":["Outfit"],"headline-md":["Outfit"],"headline-sm":["Outfit"],"label-sm":["Outfit"],"headline-lg":["Outfit"],"label-lg":["Outfit"],"body-lg":["Inter"],"body-sm":["Inter"],"body-md":["Inter"]},fontSize:{"label-md":["12px",{"lineHeight":"16px","letterSpacing":"0.06em","fontWeight":"600"}],"display-lg-mobile":["32px",{"lineHeight":"36px","letterSpacing":"-0.02em","fontWeight":"800"}],"display-lg":["44px",{"lineHeight":"48px","letterSpacing":"-0.03em","fontWeight":"800"}],"headline-md":["22px",{"lineHeight":"28px","letterSpacing":"-0.01em","fontWeight":"600"}],"headline-sm":["18px",{"lineHeight":"24px","fontWeight":"600"}],"label-sm":["10px",{"lineHeight":"12px","letterSpacing":"0.08em","fontWeight":"700"}],"headline-lg":["28px",{"lineHeight":"34px","letterSpacing":"-0.02em","fontWeight":"700"}],"label-lg":["14px",{"lineHeight":"18px","letterSpacing":"0.04em","fontWeight":"600"}],"body-lg":["16px",{"lineHeight":"24px","fontWeight":"400"}],"body-sm":["12px",{"lineHeight":"16px","fontWeight":"400"}],"body-md":["14px",{"lineHeight":"20px","fontWeight":"400"}]}}}}</script><style>img[alt^="SportNexus logo mark"]{display:none!important}</style></head><body class="bg-background font-body-md text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container"><div class="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.06),rgba(15,19,28,0))] pointer-events-none -z-10"></div><header class="fixed top-0 w-full z-50 bg-surface/75 backdrop-blur-2xl shadow-[0_1px_12px_rgba(0,0,0,0.45)]"><div class="h-16 w-full px-margin-lg flex items-center justify-between gap-space-md"><div class="flex items-center gap-space-lg"><a class="flex items-center gap-space-sm group" data-path="dashboard" href="#"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg"/><div class="flex flex-col"><span class="font-headline-sm text-headline-sm tracking-tight text-on-surface group-hover:text-primary transition-colors">SportNexus</span><span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Athletic Ecosystem</span></div></a><div class="hidden xl:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-low"><div class="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></div><span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Live Arena Node:</span><span class="font-label-sm text-label-sm text-secondary-fixed-dim uppercase">Active // 99.8%</span></div></div><nav class="hidden lg:flex items-center gap-space-xs" data-active-classes="text-primary-container bg-surface-container-high rounded-lg"><a aria-current="page" class="px-space-md py-space-xs font-label-lg transition-all text-primary-container bg-surface-container-high rounded-lg" data-path="explore-courts" href="#">Explore Courts</a><a class="px-space-md py-space-xs rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="tournaments" href="#">Tournaments</a><a class="px-space-md py-space-xs rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="lfg-feed" href="#">LFG Feed</a><a class="px-space-md py-space-xs rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="dashboard" href="#">Dashboard</a></nav><div class="flex items-center gap-space-md"><div class="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-surface-container-low"><span class="material-symbols-outlined text-primary-fixed-dim text-[18px]">account_balance_wallet</span><div class="flex flex-col leading-none"><span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Wallet</span><span class="font-label-md text-label-md text-primary font-bold">$45.00</span></div></div><button aria-label="Notifications" class="relative p-space-xs rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" type="button"><span class="material-symbols-outlined text-[20px]">notifications</span><span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_rgba(0,229,255,0.8)]"></span></button><div class="flex items-center gap-space-sm pl-space-xs"><div class="relative"><img alt="Profile" class="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/><span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary-container ring-2 ring-surface"></span></div></div></div></div></header><main class="w-full pt-16 bg-background min-h-screen"><div class="flex flex-col w-full">
<!-- Immersive Hero Media Banner bleeding subtly behind App Shell clearance -->
<section class="relative w-full -mt-16 pt-24 pb-12 px-margin-lg overflow-hidden bg-surface-container-lowest">
<!-- Ambient Stadium Lighting Flares -->
<div class="absolute -top-32 left-1/4 w-96 h-96 bg-primary-container/10 blur-[130px] pointer-events-none rounded-full"></div>
<div class="absolute top-10 right-10 w-80 h-80 bg-secondary-container/10 blur-[110px] pointer-events-none rounded-full"></div>
<div class="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-surface-container-low min-h-[380px] lg:min-h-[440px] flex flex-col justify-end">
<!-- Background Badminton Court Image -->
<div class="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105" style="background-image: url('https://lh3.googleusercontent.com/aida/AEtjO1WdQ1-KKfnvwaSO4limEZmMa4EYvWiwHJh-ee9W3R9MusGMY2e0qlgwXbsjqxoztcUlkiHxzOLU8Rj7fuDxe23FEJagcAhTZzSXyAJNqkf5YUHNbGPgjZPKwuCCO3EoHymYunbwsdWb_O_Z2P3Oj4yT_rItFinuMCXFEQB0i1oR2ufaSKbZ8FxN1mCuYZFgWIDhw1Yxoh1z054PmkESyxdccl2X-cYwTGBP4Oxk-GIVOkLs9bC3tbWYLg');">
</div>
<!-- Complex Kinetic Dark Scrim Gradient -->
<div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-surface-container-lowest/20"></div>
<div class="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_bottom_left,rgba(0,229,255,0.18),transparent)]"></div>
<!-- Hero Content Bar -->
<div class="relative z-10 p-space-lg lg:p-space-xl flex flex-col justify-between gap-space-lg">
<!-- Top Status Indicators inside Image Banner -->
<div class="flex flex-wrap items-center justify-between gap-space-md">
<div class="flex items-center gap-space-xs">
<span class="px-space-md py-space-xs rounded-full bg-surface-container-high/90 backdrop-blur-xl text-primary font-label-md text-label-md flex items-center gap-1.5 shadow-lg">
<span class="w-2 h-2 rounded-full bg-secondary-container animate-ping"></span>
              COURT NODE: ARENA-04 ACTIVE
            </span>
<span class="px-space-md py-space-xs rounded-full bg-surface-container-high/90 backdrop-blur-xl text-on-surface-variant font-label-md text-label-md flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-primary">verified</span>
              BWF Grade 1 Sanctioned
            </span>
</div>
<div class="flex items-center gap-space-xs">
<button aria-label="Share Court" class="p-space-xs rounded-xl bg-surface-container/80 backdrop-blur-md text-on-surface hover:text-primary-container transition-colors">
<span class="material-symbols-outlined text-[20px]">share</span>
</button>
<button aria-label="Save to Wishlist" class="p-space-xs rounded-xl bg-surface-container/80 backdrop-blur-md text-on-surface hover:text-error transition-colors">
<span class="material-symbols-outlined text-[20px]">bookmark</span>
</button>
</div>
</div>
<!-- Facility Typography & Technical Spec Tags -->
<div class="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
<div class="flex flex-col gap-space-xs max-w-2xl">
<div class="flex items-center gap-space-xs">
<span class="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">Premier Pro Facility</span>
<span class="text-on-surface-variant text-label-sm">•</span>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Metropolitan Sports Hub</span>
</div>
<h1 class="font-headline-lg text-display-lg text-on-surface tracking-tight leading-none">
              Kinetic Arena
            </h1>
<p class="font-headline-sm text-headline-sm text-on-surface-variant font-medium flex items-center gap-space-xs">
              Court 04 <span class="text-primary">•</span> BWF Certified Pro-Mat Synthetic Floor
            </p>
<!-- Verified Ratings & Technical Highlights -->
<div class="flex flex-wrap items-center gap-space-md pt-space-xs">
<div class="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/95 backdrop-blur-md shadow-md">
<span class="material-symbols-outlined text-primary-container text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-headline-sm text-headline-sm font-bold text-on-surface leading-none">4.8</span>
<span class="font-body-sm text-body-sm text-on-surface-variant font-medium">(342 verified reviews)</span>
</div>
<div class="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/70 backdrop-blur-md text-on-surface">
<span class="material-symbols-outlined text-primary-fixed-dim text-[16px]">wb_twilight</span>
<span class="font-label-md text-label-md">Olympic Grade 1200 Lux</span>
</div>
<div class="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/70 backdrop-blur-md text-on-surface">
<span class="material-symbols-outlined text-primary-fixed-dim text-[16px]">ac_unit</span>
<span class="font-label-md text-label-md">Climate Controlled 21°C</span>
</div>
<div class="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/70 backdrop-blur-md text-on-surface">
<span class="material-symbols-outlined text-secondary-container text-[16px]">sensors</span>
<span class="font-label-md text-label-md">Smart Line Sensors</span>
</div>
</div>
</div>
<!-- Quick Facility Amenities Horizontal Micro-Tray -->
<div class="flex items-center gap-space-sm bg-surface-container-high/80 backdrop-blur-md p-space-sm rounded-xl">
<div class="flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-surface-container-lowest text-on-surface-variant">
<span class="material-symbols-outlined text-[18px] text-primary">shower</span>
<span class="font-label-sm text-label-sm">Lockers &amp; Showers</span>
</div>
<div class="flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-surface-container-lowest text-on-surface-variant">
<span class="material-symbols-outlined text-[18px] text-primary">sports_tennis</span>
<span class="font-label-sm text-label-sm">Yonex Stringing</span>
</div>
<div class="flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-surface-container-lowest text-on-surface-variant">
<span class="material-symbols-outlined text-[18px] text-primary">wifi</span>
<span class="font-label-sm text-label-sm">Ultra WiFi</span>
</div>
<div class="flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-surface-container-lowest text-on-surface-variant">
<span class="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
<span class="font-label-sm text-label-sm">Racquet Pro-Rent</span>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- Main Booking Architecture Grid -->
<section class="w-full px-margin-lg py-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
<!-- LEFT COLUMN: Booking Controls, Surface Selector & Slot Grid (7 Cols on wide desktop) -->
<div class="lg:col-span-8 flex flex-col gap-space-xl">
<!-- Slot Selection Header with Category Switcher -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-xs">
<div>
<span class="font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold">Real-Time Allocation</span>
<h2 class="font-headline-lg text-headline-lg text-on-surface">Select Date &amp; Court Slot</h2>
</div>
<!-- Sport Filter Pills -->
<div class="inline-flex p-1 rounded-xl bg-surface-container-low shadow-inner">
<button class="px-space-md py-space-xs rounded-lg font-label-md text-label-md bg-primary-container text-on-primary font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)] flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">sports_tennis</span>
            Badminton
          </button>
<button class="px-space-md py-space-xs rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">sports_tennis</span>
            Pickleball
          </button>
<button class="px-space-md py-space-xs rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">sports_volleyball</span>
            Squash
          </button>
</div>
</div>
<!-- Kinetic Horizontal Week/Date Scroller -->
<div class="flex flex-col gap-space-sm p-space-md rounded-2xl bg-surface-container-low">
<div class="flex items-center justify-between px-space-xs">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold">October 2025</span>
</div>
<div class="flex items-center gap-1">
<button aria-label="Previous Week" class="p-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
<span class="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<button aria-label="Next Week" class="p-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
<span class="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
<!-- Days Horizontal Strip -->
<div class="grid grid-cols-6 gap-space-xs sm:gap-space-sm pt-space-xs">
<!-- Mon Oct 20 -->
<button class="flex flex-col items-center py-space-md px-space-xs rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all">
<span class="font-label-sm text-label-sm uppercase">Mon</span>
<span class="font-headline-md text-headline-md text-on-surface font-bold mt-1">20</span>
<span class="mt-2 font-label-sm text-label-sm text-on-surface-variant">4 slots</span>
</button>
<!-- Tue Oct 21 -->
<button class="flex flex-col items-center py-space-md px-space-xs rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all">
<span class="font-label-sm text-label-sm uppercase">Tue</span>
<span class="font-headline-md text-headline-md text-on-surface font-bold mt-1">21</span>
<span class="mt-2 font-label-sm text-label-sm text-on-surface-variant">8 slots</span>
</button>
<!-- Wed Oct 22 (Active Glowing Selection) -->
<button class="relative flex flex-col items-center py-space-md px-space-xs rounded-xl bg-surface-container-highest shadow-[0_0_20px_rgba(0,229,255,0.35)] transition-all">
<div class="absolute inset-0 rounded-xl bg-gradient-to-b from-primary-container/20 to-transparent pointer-events-none"></div>
<span class="font-label-sm text-label-sm uppercase text-primary font-bold">Wed</span>
<span class="font-headline-md text-headline-md text-primary font-extrabold mt-1">22</span>
<div class="mt-2 flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
<span class="font-label-sm text-label-sm text-secondary-container font-semibold">12 open</span>
</div>
</button>
<!-- Thu Oct 23 -->
<button class="flex flex-col items-center py-space-md px-space-xs rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all">
<span class="font-label-sm text-label-sm uppercase">Thu</span>
<span class="font-headline-md text-headline-md text-on-surface font-bold mt-1">23</span>
<span class="mt-2 font-label-sm text-label-sm text-on-surface-variant">7 slots</span>
</button>
<!-- Fri Oct 24 -->
<button class="flex flex-col items-center py-space-md px-space-xs rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all">
<span class="font-label-sm text-label-sm uppercase">Fri</span>
<span class="font-headline-md text-headline-md text-on-surface font-bold mt-1">24</span>
<span class="mt-2 font-label-sm text-label-sm text-primary font-semibold">Limited</span>
</button>
<!-- Sat Oct 25 -->
<button class="flex flex-col items-center py-space-md px-space-xs rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all">
<span class="font-label-sm text-label-sm uppercase">Sat</span>
<span class="font-headline-md text-headline-md text-on-surface font-bold mt-1">25</span>
<span class="mt-2 font-label-sm text-label-sm text-error font-medium">Sold Out</span>
</button>
</div>
</div>
<!-- Court / Surface Sub-Selector Tabs -->
<div class="flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Arena Court Layout</span>
<span class="font-label-sm text-label-sm text-primary">BWF Standard Synthetic Cushioning</span>
</div>
<div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
<!-- Court 01 -->
<div class="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex items-center justify-between">
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Court 01</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Standard Wooden Parquet</span>
</div>
<span class="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">Available</span>
</div>
<!-- Court 02 -->
<div class="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex items-center justify-between">
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Court 02</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Pro Court Mat • Green</span>
</div>
<span class="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">Available</span>
</div>
<!-- Court 04 (Selected) -->
<div class="relative p-space-md rounded-xl bg-surface-container-high shadow-[0_0_15px_rgba(0,229,255,0.2)] cursor-pointer flex items-center justify-between overflow-hidden">
<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
<div class="flex flex-col pl-1">
<span class="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-1.5">
                Court 04
                <span class="material-symbols-outlined text-primary text-[18px]">check_circle</span>
</span>
<span class="font-body-sm text-body-sm text-on-surface font-medium">Kinetic Pro Shock-Absorb</span>
</div>
<span class="font-label-sm text-label-sm px-2 py-0.5 rounded bg-primary-container/20 text-primary font-bold">Selected</span>
</div>
</div>
</div>
<!-- Time Slots Grid -->
<div class="flex flex-col gap-space-lg">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<span class="material-symbols-outlined text-primary text-[22px]">schedule</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Available Match Slots (Wednesday, Oct 22)</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Prices exclude peak surge</span>
</div>
<!-- Section: Afternoon Slots -->
<div class="flex flex-col gap-space-xs">
<div class="flex items-center gap-space-xs text-on-surface-variant">
<span class="material-symbols-outlined text-[16px]">wb_sunny</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Afternoon Standard Slots</span>
</div>
<div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
<!-- Slot 14:00 -->
<button class="p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-all flex flex-col text-left group">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">14:00 - 15:00</span>
<div class="flex items-center justify-between mt-2 pt-2 bg-surface-container-lowest/50 px-2 py-1 rounded-lg">
<span class="font-label-md text-label-md text-on-surface font-bold">$15.00</span>
<span class="font-label-sm text-label-sm text-secondary-container">Open</span>
</div>
</button>
<!-- Slot 15:00 -->
<button class="p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-all flex flex-col text-left group">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">15:00 - 16:00</span>
<div class="flex items-center justify-between mt-2 pt-2 bg-surface-container-lowest/50 px-2 py-1 rounded-lg">
<span class="font-label-md text-label-md text-on-surface font-bold">$15.00</span>
<span class="font-label-sm text-label-sm text-secondary-container">Open</span>
</div>
</button>
<!-- Slot 16:00 -->
<button class="p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-all flex flex-col text-left group">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">16:00 - 17:00</span>
<div class="flex items-center justify-between mt-2 pt-2 bg-surface-container-lowest/50 px-2 py-1 rounded-lg">
<span class="font-label-md text-label-md text-on-surface font-bold">$15.00</span>
<span class="font-label-sm text-label-sm text-secondary-container">Open</span>
</div>
</button>
<!-- Slot 17:00 (Occupied / Disabled) -->
<div class="p-space-md rounded-xl bg-surface-container-lowest opacity-40 cursor-not-allowed flex flex-col text-left">
<span class="font-headline-sm text-headline-sm text-on-surface-variant font-medium line-through">17:00 - 18:00</span>
<div class="flex items-center justify-between mt-2 pt-2 px-2 py-1">
<span class="font-label-md text-label-md text-on-surface-variant">$16.00</span>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">Occupied</span>
</div>
</div>
</div>
</div>
<!-- Section: Prime Evening Slots (With Highlighted Active and Surge Peak hours) -->
<div class="flex flex-col gap-space-xs">
<div class="flex items-center justify-between text-on-surface-variant">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[16px] text-primary">mode_night</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Prime Evening Hours (High Demand)</span>
</div>
<span class="font-label-sm text-label-sm text-error flex items-center gap-1 font-semibold">
<span class="material-symbols-outlined text-[14px]">local_fire_department</span>
              Surge Surge Protection Active
            </span>
</div>
<div class="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
<!-- 18:00 - 19:00 (SELECTED POD: Glowing Electric Neon Green) -->
<button class="relative p-space-md rounded-2xl bg-surface-container-high shadow-[0_0_28px_rgba(52,255,140,0.3)] flex flex-col justify-between text-left transition-transform scale-[1.02] overflow-hidden">
<div class="absolute inset-0 bg-gradient-to-br from-secondary-container/15 via-transparent to-transparent pointer-events-none"></div>
<div class="absolute top-0 right-0 w-24 h-24 bg-secondary-container/10 blur-xl pointer-events-none"></div>
<div class="flex items-start justify-between relative z-10">
<div class="flex flex-col">
<span class="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">18:00 - 19:00</span>
<span class="font-label-sm text-label-sm text-secondary-container font-semibold flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">check_circle</span>
                    Selected Slot (1.0 hr)
                  </span>
</div>
<span class="p-1 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center">
<span class="material-symbols-outlined text-[16px] font-bold">check</span>
</span>
</div>
<div class="mt-4 pt-3 flex items-center justify-between bg-surface-container-lowest/80 px-space-sm py-2 rounded-xl relative z-10">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Regular Rate</span>
<span class="font-headline-sm text-headline-sm font-extrabold text-secondary-container">$18.00</span>
</div>
<span class="font-label-sm text-label-sm px-2 py-1 rounded bg-secondary-container/20 text-secondary-container font-bold uppercase tracking-wider">
                  Confirmed Pick
                </span>
</div>
</button>
<!-- 19:00 - 20:00 (PEAK HOUR POD: Vibrant Amber Flame Glow) -->
<button class="relative p-space-md rounded-2xl bg-surface-container-low shadow-[0_0_20px_rgba(255,153,0,0.15)] flex flex-col justify-between text-left hover:bg-surface-container transition-all group overflow-hidden">
<div class="absolute top-0 right-0 px-3 py-0.5 rounded-bl-xl bg-error-container text-on-error font-label-sm text-label-sm font-bold flex items-center gap-1 uppercase tracking-wider shadow-sm">
<span class="material-symbols-outlined text-[14px]">local_fire_department</span>
                Peak (+20%)
              </div>
<div class="flex flex-col mt-2">
<span class="font-headline-md text-headline-md font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">19:00 - 20:00</span>
<span class="font-label-sm text-label-sm text-error font-medium">High Competition Arena</span>
</div>
<div class="mt-4 pt-3 flex items-center justify-between bg-surface-container-lowest/60 px-space-sm py-2 rounded-xl">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant line-through">$18.00</span>
<span class="font-headline-sm text-headline-sm font-bold text-on-surface">$21.60</span>
</div>
<span class="font-label-sm text-label-sm px-2 py-1 rounded bg-surface-container text-on-surface-variant font-semibold">
                  Tap to Switch
                </span>
</div>
</button>
<!-- 20:00 - 21:00 (PEAK HOUR POD 2) -->
<button class="relative p-space-md rounded-2xl bg-surface-container-low shadow-[0_0_20px_rgba(255,153,0,0.15)] flex flex-col justify-between text-left hover:bg-surface-container transition-all group overflow-hidden">
<div class="absolute top-0 right-0 px-3 py-0.5 rounded-bl-xl bg-error-container text-on-error font-label-sm text-label-sm font-bold flex items-center gap-1 uppercase tracking-wider shadow-sm">
<span class="material-symbols-outlined text-[14px]">local_fire_department</span>
                Peak (+20%)
              </div>
<div class="flex flex-col mt-2">
<span class="font-headline-md text-headline-md font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">20:00 - 21:00</span>
<span class="font-label-sm text-label-sm text-error font-medium">Ranked League Block</span>
</div>
<div class="mt-4 pt-3 flex items-center justify-between bg-surface-container-lowest/60 px-space-sm py-2 rounded-xl">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant line-through">$18.00</span>
<span class="font-headline-sm text-headline-sm font-bold text-on-surface">$21.60</span>
</div>
<span class="font-label-sm text-label-sm px-2 py-1 rounded bg-surface-container text-on-surface-variant font-semibold">
                  Tap to Switch
                </span>
</div>
</button>
</div>
</div>
<!-- Section: Night Slots -->
<div class="grid grid-cols-2 sm:grid-cols-2 gap-space-sm">
<!-- 21:00 - 22:00 -->
<button class="p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-all flex flex-col text-left group">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">21:00 - 22:00</span>
<div class="flex items-center justify-between mt-2 pt-2 bg-surface-container-lowest/50 px-2 py-1 rounded-lg">
<span class="font-label-md text-label-md text-on-surface font-bold">$16.00</span>
<span class="font-label-sm text-label-sm text-secondary-container">Late Owl Disc.</span>
</div>
</button>
<!-- 22:00 - 23:00 (Occupied) -->
<div class="p-space-md rounded-xl bg-surface-container-lowest opacity-40 cursor-not-allowed flex flex-col text-left">
<span class="font-headline-sm text-headline-sm text-on-surface-variant font-medium line-through">22:00 - 23:00</span>
<div class="flex items-center justify-between mt-2 pt-2 px-2 py-1">
<span class="font-label-md text-label-md text-on-surface-variant">$15.00</span>
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">Facility Maintenance</span>
</div>
</div>
</div>
<!-- Visual Legend Indicator Bar -->
<div class="flex flex-wrap items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Legend Indicators:</span>
<div class="flex flex-wrap items-center gap-space-md">
<div class="flex items-center gap-2">
<span class="w-3 h-3 rounded-full bg-surface-container-high"></span>
<span class="font-label-sm text-label-sm text-on-surface">Available</span>
</div>
<div class="flex items-center gap-2">
<span class="w-3 h-3 rounded-full bg-secondary-container shadow-[0_0_8px_rgba(52,255,140,0.8)]"></span>
<span class="font-label-sm text-label-sm text-secondary-container font-semibold">Active Selection</span>
</div>
<div class="flex items-center gap-2">
<span class="w-3 h-3 rounded-full bg-error shadow-[0_0_8px_rgba(255,180,171,0.6)]"></span>
<span class="font-label-sm text-label-sm text-error font-semibold">Peak Hour (+20%)</span>
</div>
<div class="flex items-center gap-2">
<span class="w-3 h-3 rounded-full bg-surface-container-lowest opacity-60"></span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Booked / Locked</span>
</div>
</div>
</div>
</div>
<!-- Court Features & Facility Specifications Bento Section -->
<div class="p-space-lg rounded-2xl bg-surface-container-low flex flex-col gap-space-md">
<h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[20px]">tune</span>
          Court 04 Sensor &amp; Surface Telemetry
        </h3>
<div class="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
<div class="p-space-md rounded-xl bg-surface-container flex flex-col gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Floor Absorption</span>
<span class="font-headline-sm text-headline-sm text-primary font-bold">62% Shock Absorption</span>
<p class="font-body-sm text-body-sm text-on-surface-variant">Reduces knee joint stress during high impact jumps.</p>
</div>
<div class="p-space-md rounded-xl bg-surface-container flex flex-col gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Speed Factor</span>
<span class="font-headline-sm text-headline-sm text-secondary-container font-bold">0.82 Slip Index</span>
<p class="font-body-sm text-body-sm text-on-surface-variant">Optimal lateral friction for precision smashes and lunges.</p>
</div>
<div class="p-space-md rounded-xl bg-surface-container flex flex-col gap-1">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">AI Hawk-Eye Telemetry</span>
<span class="font-headline-sm text-headline-sm text-primary font-bold">Line Sensor Active</span>
<p class="font-body-sm text-body-sm text-on-surface-variant">Automatic in/out call tracking via SportNexus mobile app.</p>
</div>
</div>
</div>
</div>
<!-- RIGHT COLUMN: Sticky Booking Summary & Split Checkout Panel (4 Cols on wide desktop) -->
<div class="lg:col-span-4 sticky top-20 flex flex-col gap-space-md">
<!-- Primary Summary Card -->
<div class="relative p-space-lg rounded-2xl bg-surface-container-low backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col gap-space-lg">
<!-- Subtle Neon Perimeter Accents -->
<div class="absolute top-0 right-10 w-32 h-32 bg-primary-container/10 blur-2xl pointer-events-none"></div>
<!-- Card Header -->
<div class="flex items-center justify-between pb-space-sm">
<div class="flex items-center gap-space-xs">
<span class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Booking Summary</h3>
</div>
<span class="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-mono uppercase">
            #SN-7842
          </span>
</div>
<!-- Mini Court & Session Capsule Preview -->
<div class="p-space-md rounded-xl bg-surface-container flex items-center gap-space-md">
<div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-lowest">
<img alt="Court 04 Preview" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1WdQ1-KKfnvwaSO4limEZmMa4EYvWiwHJh-ee9W3R9MusGMY2e0qlgwXbsjqxoztcUlkiHxzOLU8Rj7fuDxe23FEJagcAhTZzSXyAJNqkf5YUHNbGPgjZPKwuCCO3EoHymYunbwsdWb_O_Z2P3Oj4yT_rItFinuMCXFEQB0i1oR2ufaSKbZ8FxN1mCuYZFgWIDhw1Yxoh1z054PmkESyxdccl2X-cYwTGBP4Oxk-GIVOkLs9bC3tbWYLg"/>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-primary font-bold uppercase">Court 04 • Kinetic Pro</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold leading-snug">Kinetic Arena Metro</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Wednesday, Oct 22, 2025</span>
</div>
</div>
<!-- Selected Time Confirmation Pod -->
<div class="p-space-md rounded-xl bg-surface-container-highest flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-secondary-container text-[20px]">timer</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Reserved Slot</span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">18:00 - 19:00 (60 Mins)</span>
</div>
</div>
<button class="font-label-sm text-label-sm text-primary hover:underline uppercase font-bold">
            Change
          </button>
</div>
<!-- Dynamic Cost Calculation Breakdown -->
<div class="flex flex-col gap-space-xs py-space-xs">
<div class="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
<span>Court Base Rate (1 hr standard)</span>
<span class="font-medium text-on-surface">$18.00</span>
</div>
<div class="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
<span>Peak Hour Surcharge</span>
<span class="font-medium text-secondary-container">$0.00 (Standard)</span>
</div>
<div class="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
<span class="flex items-center gap-1">
              Arena Sensor &amp; Ball Telemetry
              <span class="material-symbols-outlined text-[14px] text-primary">info</span>
</span>
<span class="font-mono text-label-md text-label-md text-primary line-through">$4.00</span>
</div>
<div class="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
<span>Community Ecosystem Fee</span>
<span class="font-label-sm text-label-sm text-secondary-container uppercase font-bold">Free Pass</span>
</div>
<!-- Total Highlight -->
<div class="pt-space-md mt-space-xs flex items-baseline justify-between">
<div class="flex flex-col">
<span class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-bold">Total Amount</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Taxes &amp; Arena Surcharges included</span>
</div>
<div class="flex items-baseline gap-1">
<span class="font-headline-sm text-headline-sm text-primary font-bold">USD</span>
<span class="font-display-lg text-display-lg font-extrabold text-on-surface leading-none tracking-tight">$18.00</span>
</div>
</div>
</div>
<!-- SPLIT BILL INTERACTION TRAY -->
<div class="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm" id="split-bill-card">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[20px]">group_add</span>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg font-bold text-on-surface">Split Bill with Friends</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Divide cost automatically</span>
</div>
</div>
<!-- Custom Styled Toggle Switch (Active by default) -->
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" id="splitToggle" type="checkbox"/>
<div class="w-12 h-7 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-fixed-dim peer-checked:to-primary-container shadow-inner"></div>
</label>
</div>
<!-- Dynamic Split Details Drawer -->
<div class="flex flex-col gap-space-xs pt-space-xs" id="splitContent">
<div class="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-lowest">
<span class="font-label-md text-label-md text-secondary-container font-bold flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">pie_chart</span>
                Split 4 Ways ($4.50 / player)
              </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Doubles Match</span>
</div>
<!-- Player Avatars Horizontal Roster -->
<div class="flex items-center justify-between pt-1">
<div class="flex items-center -space-x-2">
<img alt="Player 1" class="w-8 h-8 rounded-full ring-2 ring-surface object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/>
<div class="w-8 h-8 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold flex items-center justify-center ring-2 ring-surface">MK</div>
<div class="w-8 h-8 rounded-full bg-secondary-container text-on-secondary font-label-sm text-label-sm font-bold flex items-center justify-center ring-2 ring-surface">TR</div>
<div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-bold flex items-center justify-center ring-2 ring-surface">?</div>
</div>
<button class="px-space-sm py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors">
<span class="material-symbols-outlined text-[14px]">person_add</span>
                + Invite 4th
              </button>
</div>
</div>
</div>
<!-- Primary High-Impact Checkout CTA -->
<div class="flex flex-col gap-space-xs pt-space-xs">
<button class="w-full py-space-md rounded-xl bg-primary-container hover:bg-primary-fixed text-on-primary font-headline-sm text-headline-sm font-extrabold flex items-center justify-center gap-space-sm transition-all shadow-[0_0_28px_rgba(0,229,255,0.45)] hover:shadow-[0_0_36px_rgba(0,229,255,0.6)] active:scale-[0.99]">
            Proceed to Checkout
            <span class="material-symbols-outlined text-[22px]">arrow_forward</span>
</button>
<div class="flex items-center justify-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm pt-1">
<span class="material-symbols-outlined text-[14px] text-secondary-container">lock</span>
<span>Your wallet balance ($45.00) covers this reservation</span>
</div>
</div>
<!-- Trust & Escrow Micro-Assurances -->
<div class="flex flex-col gap-space-xs pt-space-xs">
<div class="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[18px] text-primary">qr_code_2</span>
<span>Instant Digital QR Pass Issued via Wallet</span>
</div>
<div class="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[18px] text-secondary-container">published_with_changes</span>
<span>Free cancellation up to 4 hrs before game</span>
</div>
<div class="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[18px] text-primary-fixed-dim">verified_user</span>
<span>256-Bit Escrow Protection on Host Match</span>
</div>
</div>
</div>
<!-- Live Court Host & Location Capsule -->
<div class="p-space-md rounded-2xl bg-surface-container-low flex items-center justify-between">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[24px]">location_on</span>
</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Arena Zone 3B</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Gate 4 Entrance • 200m to Metro</span>
</div>
</div>
<button aria-label="Open Navigation Directions" class="p-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-primary transition-colors">
<span class="material-symbols-outlined text-[20px]">near_me</span>
</button>
</div>
</div>
</section>
<!-- Interactive script to toggle split-bill details effortlessly -->
<script>
    (function() {
      const splitToggle = document.getElementById('splitToggle');
      const splitContent = document.getElementById('splitContent');
      if (splitToggle && splitContent) {
        splitToggle.addEventListener('change', function(e) {
          if (e.target.checked) {
            splitContent.classList.remove('hidden');
          } else {
            splitContent.classList.add('hidden');
          }
        });
      }
    })();
  </script>
</div></main><footer class="w-full bg-surface-container-lowest mt-space-xl py-space-xl"><div class="w-full px-margin-lg flex flex-col md:flex-row items-center justify-between gap-space-md"><div class="flex items-center gap-space-sm"><span class="font-headline-sm text-headline-sm text-on-surface">SportNexus</span><span class="font-body-sm text-body-sm text-on-surface-variant">© 2025 SportNexus Performance Network. All rights reserved.</span></div><div class="flex items-center gap-space-lg"><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="terms" href="#">Platform Rules</a><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="support" href="#">Arena Telemetry</a><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="security" href="#">Fair Play Protocol</a></div></div></footer></body></html>`

function CourtDetails() {
  return <iframe title="SportNexus CourtDetails" srcDoc={courtDetailsPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default CourtDetails
