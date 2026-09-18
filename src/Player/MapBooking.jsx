const mapBookingPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Outfit:wght@500;600;700;800&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config={darkMode:"class",theme:{extend:{colors:{"on-error":"#690005","outline-variant":"#3b494c","inverse-surface":"#dfe2ee","on-background":"#dfe2ee","background":"#0f131c","secondary-container":"#34ff8c","error-container":"#93000a","on-surface-variant":"#bac9cc","surface-container":"#1c2028","primary-fixed":"#9cf0ff","on-secondary":"#003919","secondary":"#f5fff3","surface-container-low":"#181c24","on-primary":"#00363d","inverse-on-surface":"#2c3039","on-tertiary-fixed":"#00174b","primary":"#c3f5ff","primary-container":"#00e5ff","secondary-fixed":"#60ff98","on-primary-fixed-variant":"#004f58","on-secondary-fixed-variant":"#005227","secondary-fixed-dim":"#00e478","tertiary-container":"#c2cfff","primary-fixed-dim":"#00daf3","on-secondary-container":"#007239","surface-dim":"#0f131c","error":"#ffb4ab","surface-variant":"#31353e","outline":"#849396","surface-container-high":"#262a33","on-surface":"#dfe2ee","on-tertiary":"#002a78","tertiary-fixed-dim":"#b4c5ff","surface-bright":"#353942","surface":"#0f131c","tertiary":"#e9ecff","inverse-primary":"#006875","surface-tint":"#00daf3","tertiary-fixed":"#dbe1ff","surface-container-highest":"#31353e","on-tertiary-fixed-variant":"#003ea8","on-primary-container":"#00626e","on-error-container":"#ffdad6","on-primary-fixed":"#001f24","surface-container-lowest":"#0a0e16","on-tertiary-container":"#004ecf","on-secondary-fixed":"#00210c"},borderRadius:{DEFAULT:"0.25rem",lg:"0.5rem",xl:"0.75rem",full:"9999px"},spacing:{gutter:"1rem","space-sm":"0.5rem","space-xl":"2rem","margin-sm":"1rem","space-md":"1rem","margin-lg":"2rem","gutter-sm":"0.75rem","space-lg":"1.5rem",margin:"1.25rem","space-xs":"0.25rem"},fontFamily:{"display-lg":["Outfit"],"label-lg":["Outfit"],"label-sm":["Outfit"],"label-md":["Outfit"],"body-lg":["Inter"],"display-lg-mobile":["Outfit"],"headline-sm":["Outfit"],"headline-md":["Outfit"],"body-sm":["Inter"],"body-md":["Inter"],"headline-lg":["Outfit"]},fontSize:{"display-lg":["44px",{lineHeight:"48px",letterSpacing:"-0.03em",fontWeight:"800"}],"label-lg":["14px",{lineHeight:"18px",letterSpacing:"0.04em",fontWeight:"600"}],"label-sm":["10px",{lineHeight:"12px",letterSpacing:"0.08em",fontWeight:"700"}],"label-md":["12px",{lineHeight:"16px",letterSpacing:"0.06em",fontWeight:"600"}],"body-lg":["16px",{lineHeight:"24px",fontWeight:"400"}],"display-lg-mobile":["32px",{lineHeight:"36px",letterSpacing:"-0.02em",fontWeight:"800"}],"headline-sm":["18px",{lineHeight:"24px",fontWeight:"600"}],"headline-md":["22px",{lineHeight:"28px",letterSpacing:"-0.01em",fontWeight:"600"}],"body-sm":["12px",{lineHeight:"16px",fontWeight:"400"}],"body-md":["14px",{lineHeight:"20px",fontWeight:"400"}],"headline-lg":["28px",{lineHeight:"34px",letterSpacing:"-0.02em",fontWeight:"700"}]}}}};</script></head><body class="bg-surface font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container"><header class="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]"><div class="h-16 w-full px-margin flex items-center justify-between gap-space-md"><div class="flex items-center gap-space-lg"><a class="flex items-center gap-space-sm focus:outline-none" data-path="map-booking" href="#"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg"/><span class="font-headline-sm text-headline-sm tracking-tight text-secondary uppercase hidden sm:inline-block">Sport<span class="text-primary-container">Nexus</span></span></a><nav class="hidden xl:flex items-center gap-space-xs p-1 bg-surface-container-low rounded-xl" data-active-classes="bg-primary-container text-on-primary-container font-label-md text-label-md shadow-[0_0_16px_rgba(0,229,255,0.35)]"><a aria-current="page" class="px-space-md py-space-sm rounded-lg transition-colors bg-primary-container text-on-primary-container font-label-md text-label-md shadow-[0_0_16px_rgba(0,229,255,0.35)]" data-path="map-booking" href="#">Map Booking</a><a class="px-space-md py-space-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" data-path="courts-and-venues" href="#">Courts &amp; Venues</a><a class="px-space-md py-space-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" data-path="ai-concierge" href="#">AI Concierge</a><a class="px-space-md py-space-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" data-path="pass-and-qr" href="#">Pass &amp; QR</a><a class="px-space-md py-space-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" data-path="wallet" href="#">Wallet</a><a class="px-space-md py-space-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" data-path="community" href="#">Community</a></nav></div><div class="flex items-center gap-space-md"><div class="hidden md:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high"><span class="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse shadow-[0_0_8px_#60ff98]"></span><span class="font-label-sm text-label-sm text-on-surface-variant tracking-wider">9ms US-EAST</span></div><button aria-label="Notifications" class="relative p-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors focus:outline-none" type="button"><span class="material-symbols-outlined text-[20px]">notifications</span><span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_6px_#00e5ff]"></span></button><div class="flex items-center gap-space-sm pl-space-xs py-1 pr-space-sm rounded-full bg-surface-container-low"><img alt="Profile" class="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/><div class="hidden sm:flex flex-col text-left"><span class="font-label-md text-label-md text-on-surface leading-none">Hoang An</span><span class="font-label-sm text-label-sm text-primary-container leading-tight uppercase">Pro Tier</span></div></div></div></div></header><main class="w-full pt-16 bg-surface"><div class="flex flex-col w-full">
<!-- Interactive Split Viewport -->
<div class="w-full h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-surface">
<!-- LEFT PANEL: Court Directory & Kinetic Filter Stream (~44% desktop width) -->
<aside class="w-full lg:w-[44%] xl:w-[42%] h-full flex flex-col bg-surface-container-lowest border-r border-outline-variant/20 shadow-2xl relative z-10 shrink-0">
<!-- Sticky Filter & Header Section -->
<div class="p-margin-sm md:p-margin pb-space-sm bg-surface-container-low/95 backdrop-blur-xl border-b border-outline-variant/15 flex flex-col gap-space-sm shrink-0">
<!-- Search Input Bar with Command Key Hint -->
<div class="relative flex items-center group">
<span class="material-symbols-outlined absolute left-space-md text-on-surface-variant group-focus-within:text-primary-container transition-colors text-[20px]">search</span>
<input class="w-full pl-11 pr-20 py-space-sm bg-surface-container-highest/60 rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-high transition-all shadow-inner" placeholder="Search courts, arenas, neighborhoods (e.g. Kinetic Arena)..." type="text" value="Kinetic Arena, Downtown"/>
<div class="absolute right-space-sm flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm border border-outline-variant/30">
<span>⌘</span><span>K</span>
</div>
</div>
<!-- Filter Chips Carousel / Bar -->
<div class="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1 text-on-surface">
<!-- Date Filter (Active) -->
<button class="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-all shrink-0" type="button">
<span class="material-symbols-outlined text-primary-container text-[16px]">calendar_today</span>
<span>Today, Oct 22</span>
<span class="material-symbols-outlined text-[14px] text-on-surface-variant">expand_more</span>
</button>
<!-- Sport Chip (Active Badminton Neon) -->
<button class="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-secondary-container/15 text-secondary-fixed font-label-md text-label-md shadow-[0_0_12px_rgba(52,255,140,0.25)] shrink-0" type="button">
<span class="material-symbols-outlined text-[16px]">sports_tennis</span>
<span>Badminton</span>
<span class="w-1.5 h-1.5 rounded-full bg-secondary-fixed shadow-[0_0_6px_#60ff98]"></span>
</button>
<!-- Distance Radius -->
<button class="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all shrink-0" type="button">
<span class="material-symbols-outlined text-[16px]">near_me</span>
<span>Within 5 km</span>
<span class="material-symbols-outlined text-[14px]">expand_more</span>
</button>
<!-- Availability (Open slots) -->
<button class="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all shrink-0" type="button">
<span class="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<span>Slots Open</span>
</button>
</div>
<!-- Telemetry & Sorting Sub-Bar -->
<div class="flex items-center justify-between pt-1 font-body-sm text-body-sm text-on-surface-variant">
<div class="flex items-center gap-1.5">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-secondary-fixed"></span>
</span>
<span class="font-label-sm text-label-sm text-on-surface">5 ARENAS NEARBY</span>
<span class="text-outline-variant">• Real-time GPS sync</span>
</div>
<div class="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md">
<span>Sort:</span>
<button class="text-primary-container font-label-md text-label-md hover:underline flex items-center gap-0.5" type="button">
              Distance (Nearest)
              <span class="material-symbols-outlined text-[14px]">tune</span>
</button>
</div>
</div>
</div>
<!-- Court Cards List (Scrollable Area) -->
<div class="flex-1 overflow-y-auto px-margin-sm md:px-margin py-space-md space-y-space-md">
<!-- CARD 1: Kinetic Arena (Active State) -->
<article class="group relative rounded-xl bg-surface-container-high/90 hover:bg-surface-container-highest transition-all duration-300 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] cursor-pointer">
<!-- Active Indicator Bar -->
<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-container via-secondary-fixed to-primary-container shadow-[0_0_12px_#00e5ff]"></div>
<div class="p-space-md flex flex-col gap-space-sm pl-space-lg">
<!-- Header Row with Photo & Details -->
<div class="flex gap-space-md items-start">
<!-- Court Thumbnail -->
<div class="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container-lowest shadow-md">
<img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="Modern indoor badminton arena courts viewed from above with luminous green court lines, professional blue synthetic floor mats, dark architectural walls, neon perimeter lighting, and players competing in evening doubles match." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC8UZexi28kOzki75_NsHQQKSceyQwyJlX7nIZrZ-xjvJ-NUl_eA4NKqqhGYviTDACEhk4TSNRRRQOtc5qDglqUcUdpjQ4wic81EBy7JhtBySugbJP0u124e6rnbPFic_vw4bOFefd5_J0B5wBzoMGXg6_H2qYF28LnjWSdxvH1f6nKCXfxchSuphBgbEKwXqQEV8zC3sQHeDVUtf_15VZjnPNwlcG7F9rmoWewp1gd2Ykc81LnGeh"/>
<div class="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md font-label-sm text-label-sm text-secondary-fixed">
                  BWF Gr.1
                </div>
</div>
<!-- Title and Metadata -->
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between gap-1">
<h2 class="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-primary-container transition-colors">
                    Kinetic Arena
                  </h2>
<div class="flex items-center gap-1 text-secondary-fixed font-label-md text-label-md bg-secondary-container/10 px-1.5 py-0.5 rounded shrink-0">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span>4.8</span>
<span class="text-on-surface-variant font-body-sm text-body-sm">(342)</span>
</div>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">
                  Courts 3 &amp; 4 • Sector 4, Metro Downtown
                </p>
<!-- Distance Tag -->
<div class="flex items-center gap-2 mt-1.5 font-label-sm text-label-sm text-outline-variant">
<span class="flex items-center gap-1 text-on-surface">
<span class="material-symbols-outlined text-[14px] text-primary-container">location_on</span>
                    2.5 km away
                  </span>
<span>•</span>
<span class="text-secondary-fixed">Instant Confirmation</span>
</div>
</div>
</div>
<!-- Amenities Badges -->
<div class="flex flex-wrap items-center gap-1.5 pt-1">
<span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
<span class="material-symbols-outlined text-[12px] text-primary-container">ac_unit</span> Climate Control A/C
              </span>
<span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
<span class="material-symbols-outlined text-[12px] text-primary-container">lock</span> Locker #L-42
              </span>
<span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
<span class="material-symbols-outlined text-[12px] text-secondary-fixed">sensors</span> Smart Line Sensor
              </span>
</div>
<!-- Slot Info & Price Action -->
<div class="pt-space-xs flex items-center justify-between border-t border-outline-variant/15 mt-1">
<div>
<div class="flex items-baseline gap-1">
<span class="font-headline-md text-headline-md text-primary-container font-display-lg">$15</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">/ hour</span>
</div>
<div class="font-label-sm text-label-sm text-secondary-fixed flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span> Next: 19:00 - 20:00
                </div>
</div>
<button class="px-space-md py-space-sm rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-lg text-label-lg shadow-[0_0_18px_rgba(0,229,255,0.4)] transition-all flex items-center gap-1 transform active:scale-95" type="button">
<span>Book Now</span>
<span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
</article>
<!-- CARD 2: Metro Smash Hub (Peak Surge State) -->
<article class="group relative rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 overflow-hidden shadow-lg cursor-pointer">
<div class="p-space-md flex flex-col gap-space-sm">
<div class="flex gap-space-md items-start">
<!-- Court Thumbnail -->
<div class="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container-lowest">
<img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="Spectacular high ceiling Olympic badminton training facility with glowing emerald green courts, tournament stadium seating, clean wooden spectator decks, and dynamic sport lighting in high contrast deep blues." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeIuCDQG6J-x2xKF2n05NBQY00pbcVkPlihkySe38d44Qe0qWkNeyNvZoWnoo0fsfS97PN0csyYI0YMp7vB2l038WkqLZyrZdW23ionGMN3Qy2C2bTGzm02yxI53Mn6Y6fJJRB-rwV42LkK225O1S5KyiJ2IBbhvBZ8rBac7pwM_KzMgOWe2V_MsL8jorFEruO2MRv0kid-pMknm1xS6H7BoIqLZrLrAVVDMQEESvQYAMlckQK1JJp"/>
<!-- Peak Surge Tag Overlay -->
<div class="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-error-container/90 backdrop-blur-md font-label-sm text-label-sm text-on-error flex items-center gap-0.5">
<span class="material-symbols-outlined text-[12px]">bolt</span> +20%
                </div>
</div>
<!-- Title & Meta -->
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between gap-1">
<h2 class="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-primary-container transition-colors">
                    Metro Smash Hub
                  </h2>
<div class="flex items-center gap-1 text-secondary-fixed font-label-md text-label-md bg-secondary-container/10 px-1.5 py-0.5 rounded shrink-0">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span>4.9</span>
<span class="text-on-surface-variant font-body-sm text-body-sm">(189)</span>
</div>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">
                  Olympic Hall • Olympic Sports Park
                </p>
<div class="flex items-center gap-2 mt-1.5 font-label-sm text-label-sm text-outline-variant">
<span class="flex items-center gap-1 text-on-surface">
<span class="material-symbols-outlined text-[14px] text-primary-container">location_on</span>
                    3.4 km away
                  </span>
<span>•</span>
<span class="text-on-surface-variant">Shower &amp; Sauna Inc.</span>
</div>
</div>
</div>
<!-- Peak Surge Banner -->
<div class="flex items-center justify-between px-space-sm py-1 rounded-lg bg-surface-variant/40 text-on-surface-variant">
<div class="flex items-center gap-1.5 text-on-error font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">trending_up</span>
<span>Peak Hour Surge (18:00 - 21:00)</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant">High demand window</span>
</div>
<!-- Price & Button -->
<div class="pt-space-xs flex items-center justify-between border-t border-outline-variant/15 mt-0.5">
<div>
<div class="flex items-baseline gap-1.5">
<span class="font-headline-md text-headline-md text-on-surface font-display-lg">$18</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">/ hr</span>
<span class="font-label-sm text-label-sm text-outline-variant line-through">$15 base</span>
</div>
<div class="font-label-sm text-label-sm text-on-surface-variant">
                  2 courts left for 20:00
                </div>
</div>
<button class="px-space-md py-space-sm rounded-lg bg-surface-container-highest hover:bg-surface-bright text-primary font-label-lg text-label-lg transition-all flex items-center gap-1 shadow-sm" type="button">
<span>Book Now</span>
<span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
</article>
<!-- CARD 3: Apex Racquet Club (Urgency State) -->
<article class="group relative rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 overflow-hidden shadow-lg cursor-pointer">
<div class="p-space-md flex flex-col gap-space-sm">
<div class="flex gap-space-md items-start">
<div class="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container-lowest">
<img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="Modern boutique sports club indoor wooden court with green badminton mats, dramatic overhead track lighting, minimalist dark architecture, spectator glass walls and training ball machines." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV7FkfhLzwVdJF3JGN79vB6iD7rTZePkyWWqdhMHhTWnTUyBbFLNYNX2jIxg7mzADm-Qspltny2wWT3nX-IgIBzoNCgsiPwvhsWfmNhYzNKt6DMCw0BhNKidDYt0wJmfc0uCAxUo-DFgLSdGxhrJ5gQoH_siXU6MODpgYR76rXW8-hrz40coq74EVtiUhUyudXHK8ragHqq4tTKgs8FpqEejruolWRIQSjHSzRpoyp8VetU6qbtAf1"/>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between gap-1">
<h2 class="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-primary-container transition-colors">
                    Apex Racquet Club
                  </h2>
<div class="flex items-center gap-1 text-secondary-fixed font-label-md text-label-md bg-secondary-container/10 px-1.5 py-0.5 rounded shrink-0">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span>4.7</span>
<span class="text-on-surface-variant font-body-sm text-body-sm">(95)</span>
</div>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">
                  Hall B • Central District
                </p>
<div class="flex items-center gap-2 mt-1.5 font-label-sm text-label-sm text-outline-variant">
<span class="flex items-center gap-1 text-on-surface">
<span class="material-symbols-outlined text-[14px] text-primary-container">location_on</span>
                    1.8 km away
                  </span>
<span>•</span>
<span class="px-1.5 py-0.2 rounded bg-error-container/20 text-error font-label-sm text-label-sm">⚡ 1 Slot Left</span>
</div>
</div>
</div>
<!-- Price & Button -->
<div class="pt-space-xs flex items-center justify-between border-t border-outline-variant/15 mt-0.5">
<div>
<div class="flex items-baseline gap-1">
<span class="font-headline-md text-headline-md text-on-surface font-display-lg">$14</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">/ hour</span>
</div>
<div class="font-label-sm text-label-sm text-secondary-fixed">
                  Slot: 18:30 - 19:30
                </div>
</div>
<button class="px-space-md py-space-sm rounded-lg bg-surface-container-highest hover:bg-surface-bright text-primary font-label-lg text-label-lg transition-all flex items-center gap-1 shadow-sm" type="button">
<span>Book Now</span>
<span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
</article>
<!-- CARD 4: CyberDome Sports Center (Night Owl Discount) -->
<article class="group relative rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 overflow-hidden shadow-lg cursor-pointer">
<div class="p-space-md flex flex-col gap-space-sm">
<div class="flex gap-space-md items-start">
<div class="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container-lowest">
<img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="Futuristic indoor multi-sport dome with luminous court boundaries, illuminated badminton netting, sleek acoustic dark ceiling panels, energetic blue atmospheric lighting and night athletic session ambiance." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7fBbtO8P2WS_CplOEAc0-mumrNfs4Ym4nZ82Ly4v7026PCOEvYVO3Mg2f9RX9kEpEFMvGCEl4nmI27SbCkoSyLqeu72wV_ZNkfXnCMaZJhNDL_JXsJO6WPJUua5f0bpdBnE5WNSpnRXY7bD5FpdW81Kn2aZk8mnGzwqUMorU4opusJsihJqKUY9Y_TkJSc7_RgRuEXoVOuAkeHd6FGli5kT0_405F-qP8Mv4fYJKZL-vyKuu5yBBD"/>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between gap-1">
<h2 class="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-primary-container transition-colors">
                    CyberDome Sports Center
                  </h2>
<div class="flex items-center gap-1 text-secondary-fixed font-label-md text-label-md bg-secondary-container/10 px-1.5 py-0.5 rounded shrink-0">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span>4.6</span>
<span class="text-on-surface-variant font-body-sm text-body-sm">(64)</span>
</div>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">
                  Courts A1-A4 • West Concourse
                </p>
<div class="flex items-center gap-2 mt-1.5 font-label-sm text-label-sm text-outline-variant">
<span class="flex items-center gap-1 text-on-surface">
<span class="material-symbols-outlined text-[14px] text-primary-container">location_on</span>
                    4.2 km away
                  </span>
<span>•</span>
<span class="text-primary-container">Late Owl Promo</span>
</div>
</div>
</div>
<!-- Price & Button -->
<div class="pt-space-xs flex items-center justify-between border-t border-outline-variant/15 mt-0.5">
<div>
<div class="flex items-baseline gap-1">
<span class="font-headline-md text-headline-md text-on-surface font-display-lg">$12</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">/ hour</span>
</div>
<div class="font-label-sm text-label-sm text-on-surface-variant">
                  Open till 01:00 AM
                </div>
</div>
<button class="px-space-md py-space-sm rounded-lg bg-surface-container-highest hover:bg-surface-bright text-primary font-label-lg text-label-lg transition-all flex items-center gap-1 shadow-sm" type="button">
<span>Book Now</span>
<span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
</article>
</div>
</aside>
<!-- RIGHT PANEL: Full Interactive Urban Sport GPS Map (~56% desktop width) -->
<main class="w-full lg:w-[56%] xl:w-[58%] h-full relative overflow-hidden bg-surface-container-lowest flex flex-col justify-between select-none">
<!-- High-Tech Cyber Map Canvas Simulation -->
<div class="absolute inset-0 z-0 bg-surface-container-lowest overflow-hidden">
<!-- Urban Vector Map Grid & Roadways -->
<svg class="w-full h-full object-cover opacity-85" fill="none" viewbox="0 0 1000 800" xmlns="http://www.w3.org/2000/svg">
<defs>
<!-- Cyan Glowing Road Filter -->
<filter height="140%" id="neon-cyan-glow" width="140%" x="-20%" y="-20%">
<fegaussianblur result="blur" stddeviation="3"></fegaussianblur>
<femerge>
<femergenode in="blur"></femergenode>
<femergenode in="SourceGraphic"></femergenode>
</femerge>
</filter>
<!-- Lime Glowing Road Filter -->
<filter height="140%" id="neon-lime-glow" width="140%" x="-20%" y="-20%">
<fegaussianblur result="blur" stddeviation="4"></fegaussianblur>
<femerge>
<femergenode in="blur"></femergenode>
<femergenode in="SourceGraphic"></femergenode>
</femerge>
</filter>
<!-- Radial Map Scrim -->
<radialgradient cx="50%" cy="50%" id="mapVignette" r="70%">
<stop offset="0%" stop-color="#0f131c" stop-opacity="0"></stop>
<stop offset="100%" stop-color="#0a0e16" stop-opacity="0.8"></stop>
</radialgradient>
</defs>
<!-- Background Building Blocks & Land Parcel Geometry -->
<g fill="#141822" opacity="0.6">
<rect height="90" rx="4" width="120" x="50" y="40"></rect>
<rect height="110" rx="6" width="160" x="200" y="30"></rect>
<rect height="85" rx="4" width="220" x="390" y="45"></rect>
<rect height="120" rx="6" width="180" x="640" y="20"></rect>
<rect height="90" rx="4" width="110" x="850" y="40"></rect>
<rect height="150" rx="8" width="140" x="40" y="160"></rect>
<rect height="130" rx="6" width="150" x="210" y="170"></rect>
<rect height="140" rx="6" width="110" x="390" y="160"></rect>
<rect height="130" rx="6" width="170" x="530" y="170"></rect>
<rect height="145" rx="8" width="130" x="730" y="165"></rect>
<rect height="180" rx="6" width="120" x="60" y="340"></rect>
<rect height="190" rx="8" width="180" x="210" y="330"></rect>
<rect height="170" rx="6" width="140" x="420" y="340"></rect>
<rect height="180" rx="8" width="160" x="590" y="330"></rect>
<rect height="160" rx="6" width="170" x="780" y="350"></rect>
<rect height="200" rx="8" width="130" x="70" y="550"></rect>
<rect height="180" rx="6" width="150" x="230" y="560"></rect>
<rect height="200" rx="8" width="210" x="410" y="540"></rect>
<rect height="190" rx="6" width="150" x="650" y="550"></rect>
<rect height="210" rx="8" width="130" x="830" y="540"></rect>
</g>
<!-- Waterway / Urban Bay Feature -->
<path d="M 0,220 C 120,240 280,180 340,110 C 370,70 410,20 460,0 L 0,0 Z" fill="#00e5ff" fill-opacity="0.04"></path>
<path d="M 0,220 C 120,240 280,180 340,110 C 370,70 410,20 460,0" stroke="#00e5ff" stroke-dasharray="4 4" stroke-opacity="0.15" stroke-width="2"></path>
<!-- High-Tech Neon Roadway Network (Cyan & Cobalt Lines) -->
<!-- Secondary Corridors -->
<g stroke="#1e293b" stroke-linecap="round" stroke-linejoin="round" stroke-width="8">
<line x1="30" x2="980" y1="150" y2="150"></line>
<line x1="30" x2="980" y1="320" y2="320"></line>
<line x1="30" x2="980" y1="530" y2="530"></line>
<line x1="190" x2="190" y1="20" y2="780"></line>
<line x1="380" x2="380" y1="20" y2="780"></line>
<line x1="720" x2="720" y1="20" y2="780"></line>
</g>
<!-- Glowing Transit Conduits -->
<g fill="none" filter="url(#neon-cyan-glow)" stroke="#00e5ff" stroke-opacity="0.45" stroke-width="2.5">
<!-- Diagonal Expressway -->
<path d="M 20,720 L 250,530 L 480,420 L 720,240 L 980,120"></path>
<path d="M 190,40 L 190,760"></path>
<path d="M 30,320 L 970,320"></path>
<path d="M 720,30 L 720,770"></path>
</g>
<!-- Super-Active Kinetic Arteries (Bright Neon Core) -->
<path d="M 20,720 L 250,530 L 480,420 L 720,240 L 980,120" fill="none" stroke="#c3f5ff" stroke-width="1.2"></path>
<path d="M 190,280 L 190,560" filter="url(#neon-cyan-glow)" stroke="#00e5ff" stroke-width="2"></path>
<path d="M 400,320 L 780,320" filter="url(#neon-lime-glow)" stroke="#00ff87" stroke-opacity="0.7" stroke-width="2.5"></path>
<!-- Downtown Sports Hub Radar Range Ring (5km Radius) -->
<circle cx="480" cy="420" fill="none" r="280" stroke="#00e5ff" stroke-dasharray="6 8" stroke-opacity="0.15" stroke-width="1.5"></circle>
<circle cx="480" cy="420" fill="none" r="140" stroke="#00e5ff" stroke-opacity="0.2" stroke-width="1"></circle>
<!-- Crosshair Ticks -->
<line stroke="#00e5ff" stroke-opacity="0.4" stroke-width="1.5" x1="480" x2="480" y1="130" y2="150"></line>
<line stroke="#00e5ff" stroke-opacity="0.4" stroke-width="1.5" x1="480" x2="480" y1="690" y2="710"></line>
<line stroke="#00e5ff" stroke-opacity="0.4" stroke-width="1.5" x1="190" x2="210" y1="420" y2="420"></line>
<line stroke="#00e5ff" stroke-opacity="0.4" stroke-width="1.5" x1="750" x2="770" y1="420" y2="420"></line>
<!-- Dark Map Vignette Layer -->
<rect fill="url(#mapVignette)" height="800" width="1000"></rect>
</svg>
<!-- Dynamic GPS Radar Sweep Effect Originating from User Location -->
<div class="absolute left-[47%] top-[51%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
<div class="w-80 h-80 rounded-full bg-gradient-to-tr from-primary-container/10 via-transparent to-transparent animate-spin [animation-duration:8s]"></div>
</div>
<!-- USER GPS LOCATION PIN -->
<div class="absolute left-[48%] top-[52.5%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto group">
<div class="relative flex items-center justify-center">
<!-- Pulsing Wave -->
<div class="absolute w-10 h-10 rounded-full bg-primary-container/30 animate-ping"></div>
<!-- Core Dot -->
<div class="w-4 h-4 rounded-full bg-primary-container border-2 border-surface shadow-[0_0_12px_#00e5ff] relative z-10"></div>
</div>
<div class="mt-1 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-label-sm border border-primary-container/30 flex items-center gap-1 shadow-lg whitespace-nowrap">
<span class="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
<span>You Are Here</span>
</div>
</div>
<!-- ================= MAP COURT PINS ================= -->
<!-- PIN 1 (SELECTED / ACTIVE): Kinetic Arena ($15/hr) -->
<div class="absolute left-[36%] top-[34%] -translate-x-1/2 -translate-y-full z-30 flex flex-col items-center cursor-pointer group">
<!-- Hover / Active Preview Snippet Card -->
<div class="mb-2 px-3 py-2 rounded-xl bg-surface-container-high/95 backdrop-blur-xl border border-secondary-fixed/40 shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center gap-3 transition-transform transform group-hover:-translate-y-1">
<div class="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary-fixed">
<span class="material-symbols-outlined text-[18px]">sports_tennis</span>
</div>
<div class="flex flex-col text-left leading-tight">
<span class="font-label-md text-label-md text-on-surface">Kinetic Arena</span>
<span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span class="text-secondary-fixed">★ 4.8</span> • 2.5 km away
              </span>
</div>
<div class="pl-2 border-l border-outline-variant/30 text-right">
<span class="font-headline-sm text-headline-sm text-secondary-fixed font-display-lg">$15</span>
<span class="text-[10px] text-on-surface-variant block -mt-1">/hr</span>
</div>
</div>
<!-- Glowing Neon Lime Pin with Pulse Halo -->
<div class="relative flex items-center justify-center">
<!-- Pulsing Halo Rings -->
<div class="absolute -inset-2 rounded-full bg-secondary-fixed/30 animate-ping"></div>
<!-- Pin Pill Capsule -->
<div class="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary font-label-lg text-label-lg shadow-[0_0_24px_#34ff8c] flex items-center gap-1 border-2 border-surface">
<span class="material-symbols-outlined text-[14px]">sports_tennis</span>
<span>$15/hr</span>
</div>
</div>
<!-- Pointer Stem Triangle -->
<div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-secondary-fixed -mt-[1px]"></div>
</div>
<!-- PIN 2: Metro Smash Hub ($18/hr - Peak Hour Surge) -->
<div class="absolute left-[68%] top-[27%] -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center cursor-pointer group">
<div class="relative flex items-center justify-center">
<div class="px-2.5 py-1 rounded-full bg-surface-container-high/90 hover:bg-surface-bright backdrop-blur-md text-on-surface font-label-md text-label-md border border-error/50 shadow-[0_0_16px_rgba(255,180,171,0.25)] flex items-center gap-1.5 transition-all group-hover:scale-105">
<span class="w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_6px_#ffb4ab]"></span>
<span class="text-primary-container font-label-md text-label-md">$18/hr</span>
<span class="text-error font-label-sm text-label-sm font-bold">+20%</span>
</div>
</div>
<div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-surface-container-high -mt-[1px]"></div>
<span class="mt-1 px-1.5 py-0.5 rounded bg-surface-container-lowest/80 text-[10px] text-on-surface-variant font-label-sm">Metro Smash</span>
</div>
<!-- PIN 3: Apex Racquet Club ($14/hr - 1 Slot Left) -->
<div class="absolute left-[31%] top-[63%] -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center cursor-pointer group">
<div class="relative flex items-center justify-center">
<div class="px-2.5 py-1 rounded-full bg-surface-container-high/90 hover:bg-surface-bright backdrop-blur-md text-on-surface font-label-md text-label-md border border-primary-container/40 shadow-[0_0_16px_rgba(0,229,255,0.25)] flex items-center gap-1.5 transition-all group-hover:scale-105">
<span class="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<span class="text-primary-container font-label-md text-label-md">$14/hr</span>
<span class="text-error font-label-sm text-label-sm">⚡ 1 left</span>
</div>
</div>
<div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-surface-container-high -mt-[1px]"></div>
<span class="mt-1 px-1.5 py-0.5 rounded bg-surface-container-lowest/80 text-[10px] text-on-surface-variant font-label-sm">Apex Racquet</span>
</div>
<!-- PIN 4: CyberDome Sports ($12/hr - Night Owl) -->
<div class="absolute left-[79%] top-[68%] -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center cursor-pointer group">
<div class="relative flex items-center justify-center">
<div class="px-2.5 py-1 rounded-full bg-surface-container-high/90 hover:bg-surface-bright backdrop-blur-md text-on-surface font-label-md text-label-md border border-outline-variant/50 shadow-md flex items-center gap-1.5 transition-all group-hover:scale-105">
<span class="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<span class="text-on-surface font-label-md text-label-md">$12/hr</span>
<span class="material-symbols-outlined text-[12px] text-primary-container">nightlight</span>
</div>
</div>
<div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-surface-container-high -mt-[1px]"></div>
<span class="mt-1 px-1.5 py-0.5 rounded bg-surface-container-lowest/80 text-[10px] text-on-surface-variant font-label-sm">CyberDome</span>
</div>
</div>
<!-- ================= HUD OVERLAY CONTROLS ================= -->
<!-- Top Map Controls Bar -->
<div class="relative z-30 p-margin-sm md:p-margin flex items-center justify-between pointer-events-none">
<!-- Search this area button -->
<button class="pointer-events-auto px-space-md py-space-sm rounded-full bg-surface-container-high/90 hover:bg-surface-bright backdrop-blur-xl border border-outline-variant/30 text-on-surface font-label-md text-label-md shadow-[0_8px_20px_rgba(0,0,0,0.4)] flex items-center gap-2 transition-all active:scale-95" type="button">
<span class="material-symbols-outlined text-[16px] text-primary-container">refresh</span>
<span>Search in this area</span>
</button>
<!-- Map Layer Switcher Chips -->
<div class="pointer-events-auto flex items-center p-1 rounded-xl bg-surface-container-lowest/80 backdrop-blur-2xl border border-outline-variant/30 shadow-xl">
<button class="px-space-sm py-1 rounded-lg bg-surface-container-high text-primary-container font-label-sm text-label-sm shadow-sm flex items-center gap-1" type="button">
<span class="material-symbols-outlined text-[14px]">grid_4x4</span>
<span>Dark Vector</span>
</button>
<button class="px-space-sm py-1 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1" type="button">
<span class="material-symbols-outlined text-[14px]">satellite_alt</span>
<span>Satellite</span>
</button>
<button class="px-space-sm py-1 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1" type="button">
<span class="material-symbols-outlined text-[14px]">local_fire_department</span>
<span>Heatmap</span>
</button>
</div>
</div>
<!-- Bottom Map Floating HUD (Zoom, Compass, Radius & Legend) -->
<div class="relative z-30 p-margin-sm md:p-margin flex flex-col md:flex-row items-end md:items-end justify-between gap-space-md pointer-events-none">
<!-- Legend Pill -->
<div class="pointer-events-auto px-space-md py-space-sm rounded-xl bg-surface-container-lowest/85 backdrop-blur-xl border border-outline-variant/30 shadow-xl flex items-center gap-space-md font-label-sm text-label-sm">
<div class="flex items-center gap-1.5 text-on-surface">
<span class="w-2.5 h-2.5 rounded-full bg-secondary-fixed shadow-[0_0_6px_#60ff98]"></span>
<span>Available Now</span>
</div>
<div class="flex items-center gap-1.5 text-on-surface">
<span class="w-2.5 h-2.5 rounded-full bg-error shadow-[0_0_6px_#ffb4ab]"></span>
<span>Peak Surge</span>
</div>
<div class="flex items-center gap-1.5 text-on-surface">
<span class="w-2.5 h-2.5 rounded-full bg-primary-container shadow-[0_0_6px_#00e5ff]"></span>
<span>Your GPS</span>
</div>
<div class="hidden sm:flex items-center gap-1 pl-2 border-l border-outline-variant/30 text-on-surface-variant">
<span>Scan Radius:</span>
<span class="text-primary-container font-semibold">5.0 km</span>
</div>
</div>
<!-- Zoom and Locate Tools -->
<div class="pointer-events-auto flex flex-col gap-1.5">
<div class="flex flex-col rounded-xl bg-surface-container-lowest/85 backdrop-blur-xl border border-outline-variant/30 shadow-xl overflow-hidden">
<button aria-label="Zoom In" class="p-2.5 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors" type="button">
<span class="material-symbols-outlined text-[18px]">add</span>
</button>
<div class="h-[1px] bg-outline-variant/20"></div>
<button aria-label="Zoom Out" class="p-2.5 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors" type="button">
<span class="material-symbols-outlined text-[18px]">remove</span>
</button>
</div>
<!-- Recenter GPS Button -->
<button aria-label="Center on Location" class="p-2.5 rounded-xl bg-surface-container-lowest/85 hover:bg-primary-container hover:text-on-primary-container backdrop-blur-xl border border-outline-variant/30 text-on-surface-variant shadow-xl transition-all group" type="button">
<span class="material-symbols-outlined text-[18px] group-hover:rotate-45 transition-transform">my_location</span>
</button>
</div>
</div>
</main>
</div>
</div></main><footer class="w-full bg-surface-container-lowest py-space-lg"><div class="w-full px-margin flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant"><div class="flex items-center gap-space-sm"><span class="w-2 h-2 rounded-full bg-primary-container"></span><span class="font-label-md text-label-md text-on-surface">SportNexus OS v3.4</span><span>• High-Velocity Athletic Booking Engine</span></div><div class="flex items-center gap-space-lg font-label-md text-label-md"><a class="text-on-surface-variant hover:text-primary-container transition-colors" href="#">Telemetry Network</a><a class="text-on-surface-variant hover:text-primary-container transition-colors" href="#">Fair Play Protocol</a><a class="text-on-surface-variant hover:text-primary-container transition-colors" href="#">Support Node</a></div></div></footer></body></html>`

function MapBooking() {
  return <iframe title="SportNexus MapBooking" srcDoc={mapBookingPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default MapBooking
