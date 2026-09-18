const splitPaymentPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Outfit:wght@600;700;800&amp;display=swap" rel="stylesheet"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config={darkMode:"class",theme:{extend:{"colors":{"on-primary":"#00363d","surface-bright":"#353942","on-primary-container":"#00626e","on-tertiary-container":"#004ecf","surface-container":"#1c2028","on-surface-variant":"#bac9cc","on-secondary":"#003919","on-tertiary":"#002a78","tertiary":"#e9ecff","secondary":"#f5fff3","tertiary-fixed-dim":"#b4c5ff","on-error":"#690005","surface-container-highest":"#31353e","tertiary-container":"#c2cfff","on-error-container":"#ffdad6","on-secondary-fixed":"#00210c","outline-variant":"#3b494c","surface-dim":"#0f131c","on-tertiary-fixed-variant":"#003ea8","error":"#ffb4ab","on-primary-fixed-variant":"#004f58","inverse-surface":"#dfe2ee","surface-container-high":"#262a33","on-primary-fixed":"#001f24","surface":"#0f131c","inverse-primary":"#006875","primary":"#c3f5ff","outline":"#849396","secondary-fixed":"#60ff98","surface-container-lowest":"#0a0e16","secondary-fixed-dim":"#00e478","primary-fixed":"#9cf0ff","primary-container":"#00e5ff","surface-container-low":"#181c24","on-secondary-container":"#007239","on-surface":"#dfe2ee","on-tertiary-fixed":"#00174b","surface-variant":"#31353e","surface-tint":"#00daf3","error-container":"#93000a","secondary-container":"#34ff8c","background":"#0f131c","primary-fixed-dim":"#00daf3","on-background":"#dfe2ee","tertiary-fixed":"#dbe1ff","on-secondary-fixed-variant":"#005227","inverse-on-surface":"#2c3039"},"borderRadius":{"DEFAULT":"0.25rem","lg":"0.5rem","xl":"0.75rem","full":"9999px"},"spacing":{"gutter-sm":"0.75rem","margin-lg":"2rem","margin":"1.25rem","gutter":"1rem","space-md":"1rem","space-xl":"2rem","space-sm":"0.5rem","space-lg":"1.5rem","margin-sm":"1rem","space-xs":"0.25rem"},"fontFamily":{"headline-lg":["Outfit"],"body-lg":["Inter"],"display-lg-mobile":["Outfit"],"headline-sm":["Outfit"],"headline-md":["Outfit"],"display-lg":["Outfit"],"body-md":["Inter"],"body-sm":["Inter"],"label-md":["Outfit"],"label-sm":["Outfit"],"label-lg":["Outfit"]},"fontSize":{"headline-lg":["28px",{"lineHeight":"34px","letterSpacing":"-0.02em","fontWeight":"700"}],"body-lg":["16px",{"lineHeight":"24px","fontWeight":"400"}],"display-lg-mobile":["32px",{"lineHeight":"36px","letterSpacing":"-0.02em","fontWeight":"800"}],"headline-sm":["18px",{"lineHeight":"24px","fontWeight":"600"}],"headline-md":["22px",{"lineHeight":"28px","letterSpacing":"-0.01em","fontWeight":"600"}],"display-lg":["44px",{"lineHeight":"48px","letterSpacing":"-0.03em","fontWeight":"800"}],"body-md":["14px",{"lineHeight":"20px","fontWeight":"400"}],"body-sm":["12px",{"lineHeight":"16px","fontWeight":"400"}],"label-md":["12px",{"lineHeight":"16px","letterSpacing":"0.06em","fontWeight":"600"}],"label-sm":["10px",{"lineHeight":"12px","letterSpacing":"0.08em","fontWeight":"700"}],"label-lg":["14px",{"lineHeight":"18px","letterSpacing":"0.04em","fontWeight":"600"}]}}}}</script><style>img[alt^="SportNexus logo mark"]{display:none!important}</style></head><body class="bg-background font-body-md text-body-md text-on-surface antialiased"><header class="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/70 backdrop-blur-2xl shadow-[0_1px_12px_rgba(0,0,0,0.4)]"><div class="h-20 w-full px-8 flex items-center justify-between"><div class="flex items-center gap-space-lg"><div class="flex items-center gap-space-sm"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff - Font: outfit - Mode: dark - Roundness: rounded-md" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg"/><span class="font-headline-sm text-headline-sm uppercase tracking-wider text-primary">The Kinetic</span></div><nav class="hidden md:flex items-center gap-space-xs ml-space-md" data-active-classes="bg-primary-container text-on-primary-container font-label-lg text-label-lg rounded-lg shadow-[0_0_20px_-2px_rgba(0,229,255,0.45)]"><a class="px-space-md py-space-sm font-label-lg text-label-lg rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="dashboard" href="#">Dashboard</a><a class="px-space-md py-space-sm font-label-lg text-label-lg rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="courts-and-bookings" href="#">Courts &amp; Bookings</a><a class="px-space-md py-space-sm font-label-lg text-label-lg rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="matches-and-lfg" href="#">Matches &amp; LFG</a><a class="px-space-md py-space-sm font-label-lg text-label-lg rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="wallet" href="#">Wallet</a></nav></div><div class="flex items-center gap-space-md"><div class="flex items-center gap-space-xs"><button aria-label="Search" class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" type="button"><span class="material-symbols-outlined text-[20px]">search</span></button><button aria-label="Notifications" class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" type="button"><span class="material-symbols-outlined text-[20px]">notifications</span></button></div><div class="flex items-center gap-space-sm pl-space-sm"><div class="relative flex items-center"><img alt="Profile" class="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/><span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary-container ring-2 ring-surface-container-lowest animate-pulse"></span></div><div class="hidden lg:flex flex-col text-left"><span class="font-label-md text-label-md text-on-surface leading-tight">Alex Chen</span><span class="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-wider">Online</span></div></div></div></div></header><main class="w-full pt-20 bg-background"><div class="flex flex-col w-full relative min-h-[calc(100vh-5rem)] px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
<!-- Dynamic Atmospheric Glows inspired by cyber arena lighting -->
<div class="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary-container/10 blur-[130px] rounded-full"></div>
<div class="pointer-events-none absolute top-1/3 -left-32 w-96 h-96 bg-secondary-fixed-dim/10 blur-[140px] rounded-full"></div>
<div class="pointer-events-none absolute bottom-10 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full"></div>
<!-- Breadcrumb & Escrow Security Ribbon -->
<div class="w-full max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<div class="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
<span class="hover:text-primary transition-colors cursor-pointer">Courts &amp; Bookings</span>
<span class="material-symbols-outlined text-[14px]">chevron_right</span>
<span class="hover:text-primary transition-colors cursor-pointer">Kinetic Arena</span>
<span class="material-symbols-outlined text-[14px]">chevron_right</span>
<span class="text-primary font-semibold">Checkout &amp; Escrow Settlement</span>
</div>
<div class="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-surface-container-high/70 backdrop-blur-md shadow-sm">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed-dim opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-secondary-fixed"></span>
</span>
<span class="material-symbols-outlined text-[16px] text-secondary-fixed">verified_user</span>
<span class="font-label-sm text-label-sm tracking-wider uppercase text-on-surface">256-Bit Escrow Vault Active • Auto-Reimbursement Protected</span>
</div>
</div>
<!-- Central Checkout Card / Container -->
<div class="w-full max-w-5xl mx-auto rounded-xl bg-surface-container-low/75 backdrop-blur-2xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] p-6 sm:p-8 lg:p-10 flex flex-col gap-8 relative">
<!-- Top Section: Booking Summary & Kinetic Venue Overview -->
<div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 bg-gradient-to-b from-transparent to-surface-container/30 rounded-xl p-6">
<div class="flex items-start gap-4">
<div class="w-16 h-16 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary-container shadow-inner flex-shrink-0">
<span class="material-symbols-outlined text-[34px]">sports_tennis</span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-2 flex-wrap mb-1">
<span class="px-2.5 py-0.5 rounded-full bg-secondary-fixed/15 text-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse"></span>
              Indoor Synthetic Pro
            </span>
<span class="px-2.5 py-0.5 rounded-full bg-primary-container/15 text-primary-container font-label-sm text-label-sm uppercase tracking-wider">
              Split Escrow Protocol: Active (4 Players)
            </span>
</div>
<h1 class="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Kinetic Arena — Badminton Court 1</h1>
<div class="flex items-center gap-4 text-on-surface-variant font-body-sm text-body-sm mt-1">
<span class="flex items-center gap-1 text-on-surface">
<span class="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
              Today, Oct 24
            </span>
<span>•</span>
<span class="flex items-center gap-1 text-on-surface">
<span class="material-symbols-outlined text-[16px] text-primary">schedule</span>
              18:00 - 20:00 (2 Hours)
            </span>
<span>•</span>
<span class="flex items-center gap-1 text-on-surface-variant">
<span class="material-symbols-outlined text-[16px]">pin_drop</span>
              Sector 7 • Neon Tier
            </span>
</div>
</div>
</div>
<!-- Price Breakdown Panel -->
<div class="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-6 bg-surface-container-lowest/80 px-6 py-4 rounded-lg shadow-sm">
<div class="flex flex-col text-left">
<span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Court Fee Rate</span>
<span class="font-body-md text-body-md text-on-surface-variant">$20.00 / hr × 2 hrs</span>
</div>
<div class="h-8 w-px bg-surface-variant"></div>
<div class="flex flex-col text-right">
<span class="font-label-sm text-label-sm uppercase tracking-wider text-primary">Total Escrow Target</span>
<span class="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">$40.00</span>
</div>
</div>
</div>
<!-- Middle Section: The Split Logic & Avatars -->
<div class="flex flex-col gap-6">
<!-- Split Switch Header -->
<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface-container/60">
<div class="flex items-center gap-3.5">
<div class="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
<span class="material-symbols-outlined text-[22px]">pie_chart</span>
</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Split Bill with Friends</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">
              Evenly distribute court fees across 4 players (<span class="text-primary font-semibold">$10.00 each</span>) via smart escrow contract.
            </span>
</div>
</div>
<!-- Custom Cybernetic Toggle Switch -->
<label class="relative inline-flex items-center cursor-pointer select-none">
<input checked="" class="sr-only peer" id="splitToggle" type="checkbox"/>
<div class="w-14 h-7 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-container peer-checked:to-secondary-fixed shadow-[0_0_15px_-2px_rgba(0,229,255,0.4)]"></div>
<span class="ml-3 font-label-md text-label-md uppercase text-secondary-fixed font-bold tracking-wider">ACTIVE</span>
</label>
</div>
<!-- 4 User Player Slots Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<!-- Slot 1: Host (Paid) -->
<div class="rounded-xl bg-surface-container/80 p-5 flex flex-col justify-between relative shadow-sm overflow-hidden group">
<div class="absolute top-0 left-0 right-0 h-1 bg-secondary-fixed shadow-[0_0_12px_rgba(96,255,152,0.8)]"></div>
<div class="flex items-start justify-between mb-4">
<div class="relative">
<img class="w-14 h-14 rounded-full object-cover shadow-md" data-alt="Close up cyber athletic male player avatar, focused expression, futuristic neon stadium lighting reflections, vibrant cyan and dark midnight aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgTJqgtn9voBKodWiwOsFPnOW233dNFTEa_GhIcl1kdzw2zXh1-1dx9MBj5HQDON3jW3HOMMNhW9I4XoocDUZ-NlnN3gAgeB77OHsIF8cB5ZkuUgOXVW4PeB73PEtZzo_7LScDQAYbPUaUiwUAUIg9C8t__T0gljDvRXfeBem__PGwmyIHT2Ud3GbsbPHR7cci0lUvqoIRJ8uEUj5FgdeCsfLqmHgBkM9mldE4--AvDTcZ8fA4udh3"/>
<span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary-fixed text-on-secondary flex items-center justify-center shadow-lg">
<span class="material-symbols-outlined text-[13px] font-black">check</span>
</span>
</div>
<span class="px-2.5 py-1 rounded-full bg-secondary-fixed/20 text-secondary-fixed font-label-sm text-label-sm uppercase font-bold tracking-wider flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">done_all</span>
              Paid $10.00
            </span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface font-bold">Hoang An</span>
<span class="font-body-sm text-body-sm text-secondary-fixed font-medium">You • Host</span>
<div class="mt-3 pt-3 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm bg-surface-container-highest/40 -mx-5 -mb-5 px-5 py-2.5">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-on-surface-variant">credit_card</span>
                Apple Pay
              </span>
<span class="font-mono text-on-surface-variant">#NX-8821</span>
</div>
</div>
</div>
<!-- Slot 2: Invited Player (Waiting/Pending) -->
<div class="rounded-xl bg-surface-container/80 p-5 flex flex-col justify-between relative shadow-sm overflow-hidden group">
<div class="absolute top-0 left-0 right-0 h-1 bg-amber-400/70"></div>
<div class="flex items-start justify-between mb-4">
<div class="relative">
<img class="w-14 h-14 rounded-full object-cover" data-alt="Digital portrait of dynamic female sports player wearing dark sports gear with vibrant neon ambient lighting, athletic profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnU-rpB2xc79kNNcLRo7P11kdW4NtHtSGUp8xYTVXqN8QuRxpC7Q3lPlUc-qH5ix1vF_TuTAi2nnmGAoJHhUuGRRwlc45MyftvB1-agtsimy006mVmHYPlarUnqw9kZKCVEIFSAh0csSHLiQ7eWMAIUzxHIQBp3NyOVKxwT29IJ6reU8x6fPf0Ge8GUV03DgkzfUO25U7agKIS9gGY6T2IbkBElIdsbNtFiqCIf8B282Da9XKwDzSm"/>
<span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-surface-container-lowest flex items-center justify-center animate-spin">
<span class="material-symbols-outlined text-[13px]">sync</span>
</span>
</div>
<span class="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-label-sm text-label-sm uppercase font-bold tracking-wider flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              Waiting...
            </span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface font-bold">Alex Rivera</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Invited Player ($10.00)</span>
<div class="mt-3 pt-3 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm bg-surface-container-highest/40 -mx-5 -mb-5 px-5 py-2">
<span class="text-on-surface-variant">Sent 3m ago</span>
<button class="flex items-center gap-1 text-primary hover:text-primary-container transition-colors py-0.5 px-2 rounded bg-primary-container/10" type="button">
<span class="material-symbols-outlined text-[14px]">notifications_active</span>
                Resend Ping
              </button>
</div>
</div>
</div>
<!-- Slot 3: Open Slot -->
<div class="rounded-xl bg-surface-container-lowest/50 p-5 flex flex-col justify-between relative shadow-sm hover:bg-surface-container/60 transition-all group">
<div class="flex items-start justify-between mb-4">
<div class="w-14 h-14 rounded-full bg-surface-container-high/40 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[24px]">person_add</span>
</div>
<span class="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              Unclaimed ($10.00)
            </span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface font-medium">Player 3 (Open)</span>
<span class="font-body-sm text-body-sm text-on-surface-variant mb-3">Awaiting member link claim</span>
<button class="w-full py-2 px-3 rounded-lg bg-primary-container/15 hover:bg-primary-container/25 text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all shadow-sm" type="button">
<span class="material-symbols-outlined text-[16px]">share</span>
              Share Invite Link
            </button>
</div>
</div>
<!-- Slot 4: Open Slot -->
<div class="rounded-xl bg-surface-container-lowest/50 p-5 flex flex-col justify-between relative shadow-sm hover:bg-surface-container/60 transition-all group">
<div class="flex items-start justify-between mb-4">
<div class="w-14 h-14 rounded-full bg-surface-container-high/40 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[24px]">person_add</span>
</div>
<span class="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              Unclaimed ($10.00)
            </span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface font-medium">Player 4 (Open)</span>
<span class="font-body-sm text-body-sm text-on-surface-variant mb-3">Awaiting member link claim</span>
<button class="w-full py-2 px-3 rounded-lg bg-primary-container/15 hover:bg-primary-container/25 text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all shadow-sm" type="button">
<span class="material-symbols-outlined text-[16px]">share</span>
              Share Invite Link
            </button>
</div>
</div>
</div>
<!-- Quick Invite Link Bar -->
<div class="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md">
<div class="flex items-center gap-2 px-2 text-primary">
<span class="material-symbols-outlined text-[20px]">link</span>
<span class="font-label-md text-label-md uppercase tracking-wider text-on-surface font-semibold whitespace-nowrap">Direct Match Invite:</span>
</div>
<div class="flex-1 w-full flex items-center bg-surface-container px-3.5 py-2 rounded-lg font-mono text-body-sm text-on-surface-variant select-all overflow-x-auto whitespace-nowrap">
          https://kinetic.sportnexus.io/match/split-8839
        </div>
<div class="flex items-center gap-2 w-full sm:w-auto">
<button class="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all" onclick="navigator.clipboard &amp;&amp; navigator.clipboard.writeText('https://kinetic.sportnexus.io/match/split-8839')" type="button">
<span class="material-symbols-outlined text-[16px]">content_copy</span>
            Copy Link
          </button>
<button class="p-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary flex items-center justify-center transition-all" title="View Match QR Code" type="button">
<span class="material-symbols-outlined text-[20px]">qr_code_2</span>
</button>
</div>
</div>
</div>
<!-- Bottom Section: Escrow Funding Gauge & Actions -->
<div class="flex flex-col gap-6 pt-4">
<!-- Funding Progress Block -->
<div class="flex flex-col gap-2.5 p-5 rounded-xl bg-surface-container-lowest/70 backdrop-blur-md">
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div class="flex items-center gap-2">
<span class="font-label-lg text-label-lg text-on-surface font-bold">Escrow Funding Status:</span>
<span class="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-mono text-label-md font-bold">25% Complete</span>
</div>
<span class="font-headline-sm text-headline-sm text-primary font-bold">
            $10.00 <span class="text-on-surface-variant font-body-sm text-body-sm font-normal">of $40.00 Locked</span>
</span>
</div>
<!-- High-Tech Glowing Progress Bar with Track -->
<div class="w-full h-3.5 bg-surface-container-highest rounded-full overflow-hidden relative shadow-inner flex">
<div class="h-full bg-gradient-to-r from-primary-container to-secondary-fixed shadow-[0_0_20px_rgba(0,229,255,0.7)] rounded-full transition-all duration-500" style="width: 25%;"></div>
<!-- Grid Hash marks across progress track -->
<div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(15,19,28,0.5)_25%)] bg-[length:20px_100%] pointer-events-none opacity-40"></div>
</div>
<div class="flex items-center justify-between text-body-sm text-body-sm text-on-surface-variant mt-1 flex-wrap gap-2">
<div class="flex items-center gap-1.5 text-error">
<span class="material-symbols-outlined text-[18px]">timer</span>
<span class="font-medium">Court reservation expires in <span class="font-mono font-bold text-on-surface">14:32</span></span>
</div>
<span class="text-on-surface-variant">All 4 player slots must be satisfied or covered by host prior to kick-off.</span>
</div>
</div>
<!-- Action Buttons Row -->
<div class="flex flex-col-reverse lg:flex-row items-center justify-between gap-4">
<!-- Cancel Action Button -->
<button class="w-full lg:w-auto px-5 py-3 rounded-lg bg-surface-container-high/80 hover:bg-error/20 text-on-surface-variant hover:text-error transition-all font-label-lg text-label-lg flex items-center justify-center gap-2" type="button">
<span class="material-symbols-outlined text-[18px]">delete_sweep</span>
          Cancel Booking
        </button>
<!-- Right Side Primary & Secondary Group -->
<div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
<!-- Secondary: Host Cover Full -->
<button class="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95" type="button">
<span class="material-symbols-outlined text-[20px] text-secondary-fixed">shield</span>
            Host Cover Full Remaining ($30.00)
          </button>
<!-- Primary: Confirm Booking (Locked / Incomplete state) -->
<button class="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-surface-variant/40 text-on-surface-variant/50 font-label-lg text-label-lg font-bold flex items-center justify-center gap-2.5 cursor-not-allowed opacity-60" disabled="" title="Requires 100% funding or host guarantee" type="button">
<span class="material-symbols-outlined text-[18px]">lock</span>
            Confirm Booking
          </button>
</div>
</div>
<!-- Trust & Escrow Guarantee Footer inside Card -->
<div class="mt-4 pt-6 bg-surface-container-lowest/40 -mx-6 sm:-mx-8 lg:-mx-10 -mb-6 sm:-mb-8 lg:-mb-10 px-6 sm:px-8 lg:px-10 py-5 rounded-b-xl flex flex-wrap items-center justify-around gap-4 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[18px] text-primary-container">money_off</span>
<span>Zero Platform Fees</span>
</div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[18px] text-secondary-fixed">history</span>
<span>Instant Automated Refund If Unfilled</span>
</div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[18px] text-primary">sensors</span>
<span>Contactless Arena Turnstile Pass Issued</span>
</div>
</div>
</div>
</div>
<!-- Real-Time Interactive Micro-Script -->
<script>
    (function() {
      const toggle = document.getElementById('splitToggle');
      if (toggle) {
        toggle.addEventListener('change', function(e) {
          const isChecked = e.target.checked;
          const statusText = toggle.parentElement.querySelector('span');
          if (statusText) {
            statusText.textContent = isChecked ? 'ACTIVE' : 'OFF';
            statusText.className = isChecked 
              ? 'ml-3 font-label-md text-label-md uppercase text-secondary-fixed font-bold tracking-wider' 
              : 'ml-3 font-label-md text-label-md uppercase text-on-surface-variant font-bold tracking-wider';
          }
        });
      }
    })();
  </script>
</div></main><footer class="w-full bg-surface-container-lowest/80 backdrop-blur-md py-space-xl"><div class="w-full px-8 flex flex-col md:flex-row items-center justify-between gap-space-md"><div class="flex items-center gap-space-sm"><span class="font-headline-sm text-headline-sm text-on-surface">The Kinetic</span><span class="font-body-sm text-body-sm text-on-surface-variant">• Next-Gen Sports Ecosystem</span></div><div class="flex items-center gap-space-lg font-label-md text-label-md text-on-surface-variant"><a class="hover:text-on-surface transition-colors" href="#">Facility Network</a><a class="hover:text-on-surface transition-colors" href="#">Player Rating Rules</a><a class="hover:text-on-surface transition-colors" href="#">Privacy Policy</a><a class="hover:text-on-surface transition-colors" href="#">Support</a></div><div class="font-body-sm text-body-sm text-on-surface-variant">© 2025 SportNexus Inc. High-velocity matchmaking protocol.</div></div></footer></body></html>`

function SplitPayment() {
  return <iframe title="SportNexus SplitPayment" srcDoc={splitPaymentPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default SplitPayment
