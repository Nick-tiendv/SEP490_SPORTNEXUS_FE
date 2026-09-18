const postMatchRatingPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Outfit:wght@600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
          "on-error-container": "#ffdad6",
          "inverse-surface": "#dfe2ee",
          "on-error": "#690005",
          "primary": "#c3f5ff",
          "on-surface-variant": "#bac9cc",
          "on-background": "#dfe2ee",
          "on-primary-fixed": "#001f24",
          "surface-container-low": "#181c24",
          "background": "#0f131c",
          "on-secondary-fixed-variant": "#005227",
          "tertiary": "#e9ecff",
          "secondary-fixed": "#60ff98",
          "on-secondary": "#003919",
          "surface-container": "#1c2028",
          "secondary": "#f5fff3",
          "primary-fixed": "#9cf0ff",
          "surface": "#0f131c",
          "primary-container": "#00e5ff",
          "tertiary-container": "#c2cfff",
          "on-tertiary-fixed-variant": "#003ea8",
          "outline-variant": "#3b494c",
          "on-primary-container": "#00626e",
          "on-tertiary": "#002a78",
          "secondary-container": "#34ff8c",
          "surface-bright": "#353942",
          "primary-fixed-dim": "#00daf3",
          "on-primary-fixed-variant": "#004f58",
          "error-container": "#93000a",
          "on-tertiary-container": "#004ecf",
          "surface-container-high": "#262a33",
          "on-secondary-fixed": "#00210c",
          "surface-container-lowest": "#0a0e16",
          "on-primary": "#00363d",
          "surface-dim": "#0f131c",
          "surface-tint": "#00daf3",
          "secondary-fixed-dim": "#00e478",
          "on-secondary-container": "#007239",
          "inverse-primary": "#006875",
          "inverse-on-surface": "#2c3039",
          "tertiary-fixed-dim": "#b4c5ff",
          "error": "#ffb4ab",
          "surface-variant": "#31353e",
          "outline": "#849396",
          "tertiary-fixed": "#dbe1ff",
          "on-surface": "#dfe2ee",
          "on-tertiary-fixed": "#00174b",
          "surface-container-highest": "#31353e"
        },
        "borderRadius": {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
          "full": "9999px"
        },
        "spacing": {
          "space-sm": "0.5rem",
          "space-md": "1rem",
          "space-xs": "0.25rem",
          "gutter": "1rem",
          "space-lg": "1.5rem",
          "margin-sm": "1rem",
          "margin-lg": "2rem",
          "margin": "1.25rem",
          "gutter-sm": "0.75rem",
          "space-xl": "2rem"
        },
        "fontFamily": {
          "label-lg": [
            "Outfit"
          ],
          "headline-sm": [
            "Outfit"
          ],
          "body-lg": [
            "Inter"
          ],
          "label-md": [
            "Outfit"
          ],
          "label-sm": [
            "Outfit"
          ],
          "body-sm": [
            "Inter"
          ],
          "headline-md": [
            "Outfit"
          ],
          "display-lg-mobile": [
            "Outfit"
          ],
          "body-md": [
            "Inter"
          ],
          "headline-lg": [
            "Outfit"
          ],
          "display-lg": [
            "Outfit"
          ]
        },
        "fontSize": {
          "label-lg": [
            "14px",
            {
              "lineHeight": "18px",
              "letterSpacing": "0.04em",
              "fontWeight": "600"
            }
          ],
          "headline-sm": [
            "18px",
            {
              "lineHeight": "24px",
              "fontWeight": "600"
            }
          ],
          "body-lg": [
            "16px",
            {
              "lineHeight": "24px",
              "fontWeight": "400"
            }
          ],
          "label-md": [
            "12px",
            {
              "lineHeight": "16px",
              "letterSpacing": "0.06em",
              "fontWeight": "600"
            }
          ],
          "label-sm": [
            "10px",
            {
              "lineHeight": "12px",
              "letterSpacing": "0.08em",
              "fontWeight": "700"
            }
          ],
          "body-sm": [
            "12px",
            {
              "lineHeight": "16px",
              "fontWeight": "400"
            }
          ],
          "headline-md": [
            "22px",
            {
              "lineHeight": "28px",
              "letterSpacing": "-0.01em",
              "fontWeight": "600"
            }
          ],
          "display-lg-mobile": [
            "32px",
            {
              "lineHeight": "36px",
              "letterSpacing": "-0.02em",
              "fontWeight": "800"
            }
          ],
          "body-md": [
            "14px",
            {
              "lineHeight": "20px",
              "fontWeight": "400"
            }
          ],
          "headline-lg": [
            "28px",
            {
              "lineHeight": "34px",
              "letterSpacing": "-0.02em",
              "fontWeight": "700"
            }
          ],
          "display-lg": [
            "44px",
            {
              "lineHeight": "48px",
              "letterSpacing": "-0.03em",
              "fontWeight": "800"
            }
          ]
        }
      },
    },
  }</script></head><body class="bg-background font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container"><header class="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div class="h-20 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-md"><div class="flex items-center gap-space-md"><img alt="SportNexus logo mark, glowing dynamic neon electric blue and cyber lime geometric nexus monogram, dark background. Brand logo. - Primary color: #00e5ff
- Font: outfit
- Mode: dark
- Roundness: rounded-md
" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VSDw_VQ2aeyVy2eTeHIBiPgCoYSRoR-yR6DSDNWnYW7f3gSg7F6hy5IOp0LXq1d-Ip03Rc-7Wcrmq5mfPa3R2XyOJqCoCl157e9cBKGrwESLnj7ZT1-ONsSBYw5_A7-4KeBSfURaKkCyB5z1QA-X_TzS5heL9OSagNTOCITeszgT87Hs1tFgu_EMx9KoogZrhrg6FYxAgHZ3g-WHAt-EV-hsTB4oW2-2C_LSLoBvnVyWdNU9c8nZt3kg"/><div class="flex flex-col"><span class="font-headline-sm text-headline-sm tracking-tight text-on-surface">The Kinetic</span><span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">SportNexus OS</span></div></div><nav class="hidden lg:flex items-center gap-space-xs bg-surface-container-lowest/70 p-1.5 rounded-full" data-active-classes="bg-surface-container-high text-primary font-bold shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)]"><a aria-current="page" class="px-space-md py-space-xs rounded-full transition-all bg-surface-container-high text-primary font-bold shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)]" data-path="dashboard" href="#">Dashboard</a><a class="px-space-md py-space-xs rounded-full font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="courts-and-booking" href="#">Courts &amp; Booking</a><a class="px-space-md py-space-xs rounded-full font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="lfg-matches" href="#">LFG Matches</a><a class="px-space-md py-space-xs rounded-full font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="tournaments" href="#">Tournaments</a><a class="px-space-md py-space-xs rounded-full font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="wallet" href="#">Wallet</a></nav><div class="flex items-center gap-space-md"><button class="relative p-2.5 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" type="button"><span class="material-symbols-outlined text-[20px] leading-none">notifications</span><span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#00e5ff]"></span></button><div class="flex items-center gap-space-sm pl-space-xs"><img alt="Profile" class="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/><div class="hidden xl:flex flex-col text-left"><span class="font-label-md text-label-md text-on-surface">Alex Rivera</span><span class="font-label-sm text-label-sm text-secondary-container">PRO TIER</span></div></div></div></div></header><main class="relative w-full pt-20 bg-background min-h-screen"><div class="fixed inset-0 pointer-events-none z-0 overflow-hidden"><div class="absolute -top-40 left-1/4 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl"></div><div class="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-secondary-container/5 rounded-full blur-3xl"></div></div><div class="relative z-10"><div class="flex flex-col w-full relative min-h-screen">
<!-- Background Dashboard Layer (Simulated Post-Match Telemetry Screen) -->
<div class="w-full max-w-7xl mx-auto px-margin py-space-lg select-none opacity-40 filter blur-sm pointer-events-none transition-all">
<!-- Top Bar Telemetry -->
<div class="flex flex-wrap items-center justify-between gap-space-md mb-space-lg">
<div class="flex items-center gap-space-md">
<span class="px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md tracking-wider uppercase flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
          Match Concluded • Arena 04
        </span>
<span class="text-on-surface-variant font-body-sm text-body-sm">ID: #KT-99420-BAD</span>
</div>
<div class="flex items-center gap-space-sm font-label-md text-label-md text-on-surface-variant">
<span class="material-symbols-outlined text-[18px]">calendar_today</span> Oct 24, 2024 • 20:45 EST
      </div>
</div>
<!-- Match Arena Scoreboard Mockup -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-space-lg mb-space-xl">
<div class="bg-surface-container/70 rounded-2xl p-space-lg flex flex-col items-center justify-center text-center">
<div class="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container mb-space-sm">
<span class="material-symbols-outlined text-[32px]">sports_tennis</span>
</div>
<span class="font-headline-md text-headline-md text-on-surface">Alex Rivera (You)</span>
<span class="font-label-sm text-label-sm text-secondary-container mt-1">WINNER (+32 ELO)</span>
<span class="font-display-lg text-display-lg text-primary-container mt-2">2</span>
</div>
<div class="bg-surface-container-low/80 rounded-2xl p-space-lg flex flex-col items-center justify-center text-center">
<span class="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mb-space-xs">Set Breakdown</span>
<div class="flex items-center justify-center gap-space-md my-space-sm">
<div class="flex flex-col items-center">
<span class="font-label-sm text-label-sm text-on-surface-variant">SET 1</span>
<span class="font-headline-sm text-headline-sm text-on-surface">21 - 19</span>
</div>
<div class="h-8 w-px bg-surface-variant"></div>
<div class="flex flex-col items-center">
<span class="font-label-sm text-label-sm text-on-surface-variant">SET 2</span>
<span class="font-headline-sm text-headline-sm text-error">18 - 21</span>
</div>
<div class="h-8 w-px bg-surface-variant"></div>
<div class="flex flex-col items-center">
<span class="font-label-sm text-label-sm text-on-surface-variant">SET 3</span>
<span class="font-headline-sm text-headline-sm text-on-surface">21 - 17</span>
</div>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">Total Duration: 48m 12s</span>
</div>
<div class="bg-surface-container/70 rounded-2xl p-space-lg flex flex-col items-center justify-center text-center">
<div class="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant mb-space-sm">
<span class="material-symbols-outlined text-[32px]">person</span>
</div>
<span class="font-headline-md text-headline-md text-on-surface">Marcus Vance</span>
<span class="font-label-sm text-label-sm text-on-surface-variant mt-1">RUNNER UP (-18 ELO)</span>
<span class="font-display-lg text-display-lg text-on-surface-variant mt-2">1</span>
</div>
</div>
<!-- Telemetry Cards -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-space-md">
<div class="bg-surface-container-low/70 p-space-md rounded-xl">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Longest Rally</span>
<p class="font-headline-sm text-headline-sm text-on-surface mt-1">34 Shots</p>
</div>
<div class="bg-surface-container-low/70 p-space-md rounded-xl">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Smash Peak Speed</span>
<p class="font-headline-sm text-headline-sm text-primary-container mt-1">284 km/h</p>
</div>
<div class="bg-surface-container-low/70 p-space-md rounded-xl">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Court Coverage</span>
<p class="font-headline-sm text-headline-sm text-on-surface mt-1">3.42 km</p>
</div>
<div class="bg-surface-container-low/70 p-space-md rounded-xl">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Net Accuracy</span>
<p class="font-headline-sm text-headline-sm text-secondary-container mt-1">79.2%</p>
</div>
</div>
</div>
<!-- Interactive Gamified Post-Match Rating Modal Overlay -->
<div class="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 py-6 overflow-y-auto bg-surface-container-lowest/80 backdrop-blur-2xl" id="modalBackdrop">
<!-- Modal Card -->
<div class="relative w-full max-w-xl bg-surface-container-low/95 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl transition-all duration-300 transform scale-100 shadow-[0_0_60px_rgba(0,229,255,0.18)]">
<!-- Ambient Top Glowing Flares -->
<div class="absolute -top-12 left-1/4 w-48 h-24 bg-primary-container/25 rounded-full blur-2xl pointer-events-none"></div>
<div class="absolute -top-10 right-1/4 w-40 h-20 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none"></div>
<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-container to-secondary-container opacity-80"></div>
<!-- Dismiss Button (Ghost) -->
<button aria-label="Close modal" class="absolute top-5 right-5 p-2 text-on-surface-variant hover:text-on-surface bg-surface-container/60 hover:bg-surface-container-high rounded-full transition-all" id="closeModalBtn" type="button">
<span class="material-symbols-outlined text-[20px] block leading-none">close</span>
</button>
<!-- Modal Content Wrapper -->
<div class="flex flex-col gap-5 relative z-10">
<!-- Header Section -->
<div class="flex flex-col items-center text-center">
<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/15 text-primary-container font-label-sm text-label-sm tracking-wider uppercase mb-3 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
<span class="material-symbols-outlined text-[16px]">emoji_events</span>
<span>Match Concluded • Victory Report</span>
</div>
<h2 class="font-headline-lg text-headline-lg text-on-surface tracking-tight leading-tight">
            Rate Opponent Sportsmanship
          </h2>
<p class="font-body-md text-body-md text-on-surface-variant mt-1 max-w-md">
            Your verification calibrates the Kinetic Elo engine and secures fair matchmaking for the entire community.
          </p>
</div>
<!-- Opponent Info Badge Glass Pod -->
<div class="bg-surface-container/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)]">
<div class="flex items-center gap-3 min-w-0">
<div class="relative shrink-0">
<img alt="Opponent Avatar" class="w-12 h-12 rounded-full object-cover shadow-[0_0_12px_rgba(0,229,255,0.4)] ring-2 ring-primary-container/40" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI"/>
<span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-secondary-container shadow-[0_0_8px_#34ff8c] border-2 border-surface-container-low"></span>
</div>
<div class="flex flex-col min-w-0">
<div class="flex items-center gap-1.5 flex-wrap">
<span class="font-headline-sm text-headline-sm text-on-surface truncate">Marcus Vance</span>
<span class="font-label-sm text-label-sm text-primary-container bg-primary-container/10 px-2 py-0.5 rounded-full">Elite III</span>
</div>
<div class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
<span>1,385 Elo</span>
<span>•</span>
<span class="truncate">Badminton Singles</span>
</div>
</div>
</div>
<div class="hidden sm:flex flex-col items-end shrink-0 pl-2">
<span class="font-label-md text-label-md text-secondary-container font-semibold">2 - 1 Defeat</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">48 min match</span>
</div>
</div>
<!-- Rating Section 1: Sportsmanship (5-Star Interactive Rating) -->
<div class="flex flex-col items-center bg-surface-container/40 rounded-2xl p-4">
<div class="w-full flex items-center justify-between mb-2">
<span class="font-label-md text-label-md text-on-surface uppercase tracking-wider flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px] text-primary-container">handshake</span>
              Fairplay &amp; Court Etiquette
            </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Required</span>
</div>
<!-- Stars Container -->
<div class="flex items-center justify-center gap-2 sm:gap-3 my-2" id="starRatingGroup">
<button aria-label="1 star" class="star-btn p-1 text-surface-variant hover:scale-125 transition-transform duration-150 focus:outline-none" data-star="1" type="button">
<span class="material-symbols-outlined text-[36px] sm:text-[40px] leading-none transition-colors">star</span>
</button>
<button aria-label="2 stars" class="star-btn p-1 text-surface-variant hover:scale-125 transition-transform duration-150 focus:outline-none" data-star="2" type="button">
<span class="material-symbols-outlined text-[36px] sm:text-[40px] leading-none transition-colors">star</span>
</button>
<button aria-label="3 stars" class="star-btn p-1 text-surface-variant hover:scale-125 transition-transform duration-150 focus:outline-none" data-star="3" type="button">
<span class="material-symbols-outlined text-[36px] sm:text-[40px] leading-none transition-colors">star</span>
</button>
<button aria-label="4 stars" class="star-btn p-1 text-surface-variant hover:scale-125 transition-transform duration-150 focus:outline-none" data-star="4" type="button">
<span class="material-symbols-outlined text-[36px] sm:text-[40px] leading-none transition-colors">star</span>
</button>
<button aria-label="5 stars" class="star-btn p-1 text-surface-variant hover:scale-125 transition-transform duration-150 focus:outline-none" data-star="5" type="button">
<span class="material-symbols-outlined text-[36px] sm:text-[40px] leading-none transition-colors">star</span>
</button>
</div>
<!-- Dynamic Rating Label -->
<p class="font-label-md text-label-md text-secondary-container mt-1 text-center h-5 transition-all" id="starRatingDescriptor">
            Select a rating
          </p>
<!-- Quick Compliment Tags -->
<div class="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 w-full">
<button class="compliment-chip px-3 py-1.5 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors" data-selected="false" type="button">
              + Punctual
            </button>
<button class="compliment-chip px-3 py-1.5 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors" data-selected="false" type="button">
              + Respectful Calls
            </button>
<button class="compliment-chip px-3 py-1.5 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors" data-selected="false" type="button">
              + High Intensity
            </button>
<button class="compliment-chip px-3 py-1.5 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors" data-selected="false" type="button">
              + Great Rallies
            </button>
</div>
</div>
<!-- Rating Section 2: Skill Calibration Elo Check -->
<div class="flex flex-col gap-2.5">
<div class="flex items-center justify-between">
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface uppercase tracking-wider flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px] text-primary-container">tune</span>
                Elo Skill Calibration
              </span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Did their actual skill level match the 1,385 Elo rating?</span>
</div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
<!-- Accurate Button -->
<button class="elo-btn group text-left p-3.5 rounded-2xl bg-surface-container/60 hover:bg-surface-container transition-all flex flex-col gap-2 relative overflow-hidden" data-selected="true" id="eloAccurateBtn" type="button">
<div class="flex items-center justify-between w-full">
<div class="w-8 h-8 rounded-full bg-secondary-container/20 text-secondary-container flex items-center justify-center">
<span class="material-symbols-outlined text-[18px]">thumb_up</span>
</div>
<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary-container" id="eloAccurateBadge">Selected</span>
</div>
<div>
<p class="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">Accurate</p>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Matched ~1350-1420 tier. Balanced play.</p>
</div>
</button>
<!-- Inaccurate Button -->
<button class="elo-btn group text-left p-3.5 rounded-2xl bg-surface-container/60 hover:bg-surface-container transition-all flex flex-col gap-2 relative overflow-hidden" data-selected="false" id="eloInaccurateBtn" type="button">
<div class="flex items-center justify-between w-full">
<div class="w-8 h-8 rounded-full bg-error/20 text-error flex items-center justify-center">
<span class="material-symbols-outlined text-[18px]">thumb_down</span>
</div>
<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant hidden" id="eloInaccurateBadge">Flag</span>
</div>
<div>
<p class="font-headline-sm text-headline-sm text-on-surface group-hover:text-error transition-colors">Miscalibrated</p>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Significantly higher or lower than stated.</p>
</div>
</button>
</div>
<!-- Micro Smurf / Calibration Detail Drawer (Hidden initially, toggles if Inaccurate selected) -->
<div class="hidden flex-col gap-2 p-3 bg-surface-container-lowest/80 rounded-xl" id="miscalibratedDrawer">
<span class="font-label-sm text-label-sm text-on-surface-variant">Observed skill tier discrepancy:</span>
<div class="flex gap-2">
<button class="miscalibration-tag flex-1 py-1.5 px-2 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm text-center hover:bg-surface-variant transition-colors" data-active="false" type="button">
                Over-ranked (Sub 1300)
              </button>
<button class="miscalibration-tag flex-1 py-1.5 px-2 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm text-center hover:bg-surface-variant transition-colors" data-active="true" type="button">
                Under-ranked / Smurf (~1500+)
              </button>
</div>
</div>
</div>
<!-- Optional Arbiter Note -->
<div class="flex flex-col gap-1.5">
<label class="font-label-sm text-label-sm text-on-surface-variant flex items-center justify-between" for="arbiterNote">
<span>Private note to Kinetic Arbiter (Optional)</span>
<span class="text-outline">Encrypted</span>
</label>
<div class="relative">
<textarea class="w-full bg-surface-container-lowest/90 text-on-surface placeholder:text-on-surface-variant/40 rounded-xl p-3 font-body-sm text-body-sm resize-none focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition-all" id="arbiterNote" placeholder="e.g., Fast aggressive smashes, great line integrity, very courteous..." rows="2"></textarea>
</div>
</div>
<!-- CTA and Action Zone -->
<div class="flex flex-col gap-3 pt-2">
<button class="w-full py-3.5 px-6 rounded-xl bg-primary-container text-on-primary-fixed font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,229,255,0.45)] hover:shadow-[0_0_32px_rgba(0,229,255,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all" id="submitRatingBtn" type="button">
<span class="material-symbols-outlined text-[20px] font-bold">verified</span>
<span>Submit Rating • Claim +25 Fairplay XP</span>
</button>
<div class="flex items-center justify-between px-1">
<button class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" id="skipRatingBtn" type="button">
              Skip for now
            </button>
<div class="flex items-center gap-1.5 font-label-sm text-label-sm text-outline">
<span class="material-symbols-outlined text-[14px]">lock</span>
<span>Double-blind until opponent submits</span>
</div>
</div>
</div>
</div>
<!-- Success Feedback Overlay State (Activated upon submit) -->
<div class="absolute inset-0 bg-surface-container-low/98 backdrop-blur-md rounded-3xl z-20 flex flex-col items-center justify-center p-8 text-center hidden" id="successOverlay">
<div class="w-20 h-20 rounded-full bg-secondary-container/20 text-secondary-container flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(52,255,140,0.5)] animate-bounce">
<span class="material-symbols-outlined text-[42px]">check_circle</span>
</div>
<h3 class="font-headline-lg text-headline-lg text-on-surface mb-1">Feedback Verified</h3>
<p class="font-body-md text-body-md text-on-surface-variant max-w-sm mb-6">
          Thank you for maintaining competitive integrity. Your profile has been credited with Fairplay XP.
        </p>
<div class="px-4 py-2 rounded-xl bg-secondary-container/15 text-secondary-container font-label-lg text-label-lg mb-6">
          +25 Fairplay XP Credited
        </div>
<button class="py-2.5 px-6 rounded-full bg-surface-container-high hover:bg-surface-variant font-label-md text-label-md text-on-surface transition-all" id="dismissSuccessBtn" type="button">
          Return to Dashboard
        </button>
</div>
</div>
</div>
</div>
<script>
  (function() {
    const starBtns = document.querySelectorAll('#starRatingGroup .star-btn');
    const descriptor = document.getElementById('starRatingDescriptor');
    let currentRating = 5;

    const ratingDescriptions = {
      1: "⭐ Unsportsmanlike / Rule disputes (-10 FP)",
      2: "⭐⭐ Below standard court etiquette",
      3: "⭐⭐⭐ Standard fairplay & punctual (+5 FP)",
      4: "⭐⭐⭐⭐ Great competitor & respectful (+10 FP)",
      5: "⭐⭐⭐⭐⭐ Exceptional sportsmanship (+15 FP)"
    };

    function updateStars(rating) {
      starBtns.forEach((btn, index) => {
        const starIcon = btn.querySelector('span');
        const starVal = index + 1;
        if (starVal <= rating) {
          btn.classList.remove('text-surface-variant');
          btn.classList.add('text-[#FFB800]');
          starIcon.style.fontVariationSettings = "'FILL' 1";
          btn.style.filter = "drop-shadow(0 0 10px rgba(255, 184, 0, 0.75))";
        } else {
          btn.classList.add('text-surface-variant');
          btn.classList.remove('text-[#FFB800]');
          starIcon.style.fontVariationSettings = "'FILL' 0";
          btn.style.filter = "none";
        }
      });
      descriptor.textContent = ratingDescriptions[rating] || "Select a rating";
    }

    // Default to 5 stars on load
    updateStars(currentRating);

    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentRating = parseInt(btn.dataset.star, 10);
        updateStars(currentRating);
      });

      btn.addEventListener('mouseenter', () => {
        const hoverVal = parseInt(btn.dataset.star, 10);
        updateStars(hoverVal);
      });
    });

    const starGroup = document.getElementById('starRatingGroup');
    starGroup.addEventListener('mouseleave', () => {
      updateStars(currentRating);
    });

    // Compliment Chips selection
    const complimentChips = document.querySelectorAll('.compliment-chip');
    complimentChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const isSelected = chip.getAttribute('data-selected') === 'true';
        if (isSelected) {
          chip.setAttribute('data-selected', 'false');
          chip.classList.remove('bg-primary-container/20', 'text-primary-container');
          chip.classList.add('bg-surface-container', 'text-on-surface-variant');
        } else {
          chip.setAttribute('data-selected', 'true');
          chip.classList.add('bg-primary-container/20', 'text-primary-container');
          chip.classList.remove('bg-surface-container', 'text-on-surface-variant');
        }
      });
    });

    // Elo Calibration Toggle
    const eloAccurateBtn = document.getElementById('eloAccurateBtn');
    const eloInaccurateBtn = document.getElementById('eloInaccurateBtn');
    const accurateBadge = document.getElementById('eloAccurateBadge');
    const inaccurateBadge = document.getElementById('eloInaccurateBadge');
    const miscalibratedDrawer = document.getElementById('miscalibratedDrawer');

    eloAccurateBtn.addEventListener('click', () => {
      eloAccurateBtn.setAttribute('data-selected', 'true');
      eloAccurateBtn.classList.add('bg-secondary-container/10');
      eloInaccurateBtn.setAttribute('data-selected', 'false');
      eloInaccurateBtn.classList.remove('bg-error/10');
      accurateBadge.classList.remove('hidden');
      inaccurateBadge.classList.add('hidden');
      miscalibratedDrawer.classList.add('hidden');
      miscalibratedDrawer.classList.remove('flex');
    });

    eloInaccurateBtn.addEventListener('click', () => {
      eloInaccurateBtn.setAttribute('data-selected', 'true');
      eloInaccurateBtn.classList.add('bg-error/10');
      eloAccurateBtn.setAttribute('data-selected', 'false');
      eloAccurateBtn.classList.remove('bg-secondary-container/10');
      accurateBadge.classList.add('hidden');
      inaccurateBadge.classList.remove('hidden');
      miscalibratedDrawer.classList.remove('hidden');
      miscalibratedDrawer.classList.add('flex');
    });

    // Miscalibration Sub-Tags
    const miscalibrationTags = document.querySelectorAll('.miscalibration-tag');
    miscalibrationTags.forEach(tag => {
      tag.addEventListener('click', () => {
        miscalibrationTags.forEach(t => {
          t.classList.remove('bg-primary-container/20', 'text-primary-container');
          t.classList.add('bg-surface-container-high', 'text-on-surface');
        });
        tag.classList.add('bg-primary-container/20', 'text-primary-container');
        tag.classList.remove('bg-surface-container-high', 'text-on-surface');
      });
    });

    // Submission & Closing flows
    const submitBtn = document.getElementById('submitRatingBtn');
    const successOverlay = document.getElementById('successOverlay');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const skipRatingBtn = document.getElementById('skipRatingBtn');
    const dismissSuccessBtn = document.getElementById('dismissSuccessBtn');

    submitBtn.addEventListener('click', () => {
      successOverlay.classList.remove('hidden');
    });

    function dismissModal() {
      modalBackdrop.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        modalBackdrop.style.display = 'none';
      }, 300);
    }

    closeModalBtn.addEventListener('click', dismissModal);
    skipRatingBtn.addEventListener('click', dismissModal);
    dismissSuccessBtn.addEventListener('click', dismissModal);
  })();
</script></div></main><footer class="w-full bg-surface-container-lowest py-space-xl"><div class="max-w-7xl mx-auto px-margin flex flex-col md:flex-row items-center justify-between gap-space-md"><div class="flex items-center gap-space-sm"><span class="font-headline-sm text-headline-sm text-on-surface">The Kinetic</span><span class="font-body-sm text-body-sm text-on-surface-variant">• High-Velocity Athletic Protocol</span></div><p class="font-body-sm text-body-sm text-on-surface-variant">© 2024 SportNexus Kinetic. All rights reserved.</p></div></footer></body></html>`

function PostMatchRating() {
  return <iframe title="SportNexus PostMatchRating" srcDoc={postMatchRatingPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default PostMatchRating
