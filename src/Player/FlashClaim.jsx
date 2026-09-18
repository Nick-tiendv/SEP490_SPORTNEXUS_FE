const flashClaimPage = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Kinetic - Flash Claim Confirmation</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Outfit', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          colors: {
            brand: {
              cyan: '#00e5ff',
              lime: '#00ff87',
              neonYellow: '#faff00',
              accent: '#38ef7d',
              surface: '#0f131c',
              dark: '#080a0f',
              panel: '#131824',
              border: '#1e2638',
            }
          },
          boxShadow: {
            'glow-lime': '0 0 35px -5px rgba(0, 255, 135, 0.45)',
            'glow-cyan': '0 0 30px -5px rgba(0, 229, 255, 0.4)',
            'glow-amber': '0 0 25px -4px rgba(250, 204, 21, 0.35)',
            'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
          }
        }
      }
    }
  </script>
  <style>
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
    }
    @keyframes lightning-flash {
      0%, 100% { filter: drop-shadow(0 0 12px rgba(0, 255, 135, 0.8)); }
      50% { filter: drop-shadow(0 0 24px rgba(0, 229, 255, 1)); }
    }
    .animate-flash-icon {
      animation: lightning-flash 2.5s ease-in-out infinite;
    }
    .kinetic-scanline {
      background: linear-gradient(180deg, rgba(255,255,255,0) 50%, rgba(0,229,255,0.03) 51%, rgba(255,255,255,0) 52%);
      background-size: 100% 4px;
    }
  </style>
</head>
<body class="bg-[#07090e] text-slate-100 font-sans min-h-screen relative overflow-x-hidden flex flex-col justify-between selection:bg-brand-cyan/30 selection:text-brand-cyan">

  <!-- Background Layer: Simulated active community match dashboard with moody blur -->
  <div class="fixed inset-0 z-0 pointer-events-none">
    <!-- Stadium Backdrop / Ambient image -->
    <div class="absolute inset-0 bg-gradient-to-b from-[#080c14]/80 via-[#0b101c]/90 to-[#06080d] z-0"></div>
    <div class="absolute inset-0 opacity-25 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:24px_24px]"></div>
    
    <!-- Background Content Mockup (blurred to represent underlying screen) -->
    <div class="w-full max-w-7xl mx-auto px-6 pt-6 opacity-35 filter blur-[6px] select-none pointer-events-none">
      <!-- Simulated Top Bar -->
      <div class="flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-bold text-cyan-400 text-lg">K</div>
          <span class="font-bold tracking-wider text-white text-lg">THE KINETIC <span class="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">LIVE LFG HUB</span></span>
        </div>
        <div class="flex gap-4 items-center">
          <div class="h-8 w-44 rounded-lg bg-slate-800/80 border border-slate-700/50"></div>
          <div class="h-9 w-9 rounded-full bg-slate-800"></div>
        </div>
      </div>

      <!-- Feed Grid Behind -->
      <div class="grid grid-cols-12 gap-6 mt-8">
        <div class="col-span-8 space-y-5">
          <div class="h-44 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between">
            <div class="flex gap-4 items-center">
              <div class="w-12 h-12 rounded-full bg-cyan-600/30"></div>
              <div class="space-y-2">
                <div class="h-4 w-36 bg-slate-700 rounded"></div>
                <div class="h-3 w-24 bg-slate-800 rounded"></div>
              </div>
            </div>
            <div class="h-10 w-48 bg-emerald-500/20 rounded-xl border border-emerald-500/30 self-end"></div>
          </div>
          <div class="h-56 rounded-2xl bg-slate-900/90 border border-slate-800 p-6"></div>
        </div>
        <div class="col-span-4 space-y-5">
          <div class="h-64 rounded-2xl bg-slate-900/90 border border-slate-800 p-6"></div>
          <div class="h-48 rounded-2xl bg-slate-900/90 border border-slate-800 p-6"></div>
        </div>
      </div>
    </div>

    <!-- Soft ambient dynamic glow spots behind modal -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-gradient-to-tr from-brand-lime/15 via-brand-cyan/20 to-transparent rounded-full filter blur-[110px]"></div>
  </div>

  <!-- Modal Overlay Backdrop with heavy glass blur & subtle vignette -->
  <div class="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 backdrop-blur-md bg-black/60 kinetic-scanline">

    <!-- Modal Outer Wrapper with subtle neon gradient border ring -->
    <div class="relative w-full max-w-lg transition-all duration-300">
      
      <!-- Ambient Backlight for Modal -->
      <div class="absolute -inset-0.5 bg-gradient-to-b from-brand-cyan/40 via-brand-lime/25 to-slate-800/40 rounded-[28px] blur-sm opacity-80"></div>
      
      <!-- Main Glassmorphism Modal Card -->
      <div class="relative bg-[#0d121c]/95 border border-white/10 rounded-[26px] shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl p-6 sm:p-8 flex flex-col">
        
        <!-- Header Utility Strip: Status Indicator & Close Button -->
        <div class="flex items-center justify-between pb-3 -mt-1">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Instant Escrow Lock
            </span>
            <span class="text-xs text-slate-400 font-mono">ID: #FL-8821</span>
          </div>

          <button type="button" aria-label="Dismiss Modal" class="text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-slate-700/60 group">
            <svg class="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Glowing Thunderbolt Hero Section -->
        <div class="flex flex-col items-center text-center mt-1 mb-6">
          <div class="relative mb-4 group">
            <!-- Radiant Aura -->
            <div class="absolute -inset-2 bg-gradient-to-r from-brand-cyan via-brand-lime to-emerald-400 rounded-full blur-lg opacity-60 group-hover:opacity-90 transition-opacity"></div>
            
            <!-- Icon Badge Container -->
            <div class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#121929] to-[#0a0e17] border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-950/60">
              <!-- Thunderbolt SVG with Dual Neon Flare -->
              <svg class="w-9 h-9 sm:w-11 sm:h-11 text-brand-lime animate-flash-icon" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clip-rule="evenodd" />
              </svg>
              <!-- Sparkle details -->
              <div class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-cyan rounded-full shadow-[0_0_8px_#00e5ff]"></div>
            </div>
          </div>

          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Secure Your Slot!
          </h2>
          <p class="text-slate-400 text-sm mt-1 max-w-sm">
            You are claiming the remaining spot in an active <span class="text-slate-200 font-medium">Kinetic Verified Roster</span>.
          </p>
        </div>

        <!-- Info Box: Match Details Card with Glass Gradient -->
        <div class="bg-[#121826]/90 border border-slate-700/60 rounded-2xl p-4 sm:p-5 mb-5 relative overflow-hidden group">
          <!-- Subtle corner highlight -->
          <div class="absolute -right-8 -top-8 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>

          <div class="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <!-- Badminton Shuttlecock SVG -->
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v4M8 6h8M6 10h12M12 10v10M9 20h6" />
                  <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white tracking-wide text-base">Badminton Doubles</span>
                  <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">1200+ Elo</span>
                </div>
                <div class="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Kinetic Central Arena • Court 3</span>
                </div>
              </div>
            </div>

            <!-- Price Badge Tag -->
            <div class="text-right">
              <span class="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">Entry Stake</span>
              <span class="text-lg sm:text-xl font-mono font-bold text-brand-lime">$5.00</span>
            </div>
          </div>

          <!-- Metadata Quick Grid -->
          <div class="grid grid-cols-2 gap-3 pt-0.5 text-xs">
            <div class="flex items-center gap-2 bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-800">
              <svg class="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span class="text-slate-400 text-[10px] block font-mono uppercase">Schedule</span>
                <span class="font-semibold text-slate-100">Tonight, 20:00 - 21:30</span>
              </div>
            </div>

            <div class="flex items-center gap-2 bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-800">
              <!-- Avatar or Host Emblem -->
              <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 p-0.5 shrink-0 flex items-center justify-center font-bold text-[10px] text-black">
                K
              </div>
              <div class="truncate">
                <span class="text-slate-400 text-[10px] block font-mono uppercase">Match Host</span>
                <span class="font-semibold text-slate-100 truncate">Kiro <span class="text-[10px] text-emerald-400 font-mono">(★ 4.9)</span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Validation Checklist (both checked in green) -->
        <div class="space-y-2.5 mb-5">
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
            <span>Eligibility & Escrow Status</span>
            <span class="text-emerald-400 font-semibold flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Ready for Instant Pass
            </span>
          </div>

          <!-- Check 1: Wallet Balance Sufficient ($50.00) -->
          <div class="flex items-center justify-between bg-emerald-500/[0.07] border border-emerald-500/30 rounded-xl px-4 py-3 transition-colors hover:bg-emerald-500/[0.1]">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_10px_rgba(0,255,135,0.25)]">
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-semibold text-white">Wallet Balance Sufficient ($50.00)</div>
                <div class="text-xs text-slate-400">Post-claim balance will be <span class="font-mono text-slate-300 font-medium">$45.00</span></div>
              </div>
            </div>
            <span class="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">PASS</span>
          </div>

          <!-- Check 2: Fairplay Score Eligible (95/100) -->
          <div class="flex items-center justify-between bg-emerald-500/[0.07] border border-emerald-500/30 rounded-xl px-4 py-3 transition-colors hover:bg-emerald-500/[0.1]">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_10px_rgba(0,255,135,0.25)]">
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-semibold text-white">Fairplay Score Eligible (95/100)</div>
                <div class="text-xs text-slate-400">Tier: <span class="text-emerald-400 font-medium">Honor Elite</span> (Min required: 70/100)</div>
              </div>
            </div>
            <span class="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">VERIFIED</span>
          </div>
        </div>

        <!-- Warning Callout Box -->
        <div class="flex items-start gap-3 bg-amber-500/[0.08] border border-amber-500/30 rounded-xl p-3.5 mb-6 text-xs text-amber-200/90 leading-relaxed">
          <div class="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <span class="font-bold text-amber-300">Important Escrow Policy:</span> 
            Clicking confirm will instantly deduct <span class="font-mono font-semibold text-white">$5.00</span> from your wallet to secure this spot. No refunds for no-shows.
          </div>
        </div>

        <!-- Action Buttons Footer -->
        <div class="space-y-3 pt-1">
          <!-- Prominent Glowing Green CTA Button -->
          <button type="button" class="w-full relative group overflow-hidden rounded-xl p-0.5 font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-glow-lime transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]">
            <!-- Animated Gradient Border Frame -->
            <div class="absolute inset-0 bg-gradient-to-r from-brand-lime via-emerald-400 to-brand-cyan rounded-xl transition-all duration-300"></div>
            
            <!-- Button Core -->
            <div class="relative flex items-center justify-center gap-2 bg-[#00ff87] hover:bg-[#1aff94] text-[#05140b] py-3.5 px-6 rounded-[10px] font-extrabold text-base transition-colors">
              <svg class="w-5 h-5 text-[#05140b]" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
              </svg>
              <span>Confirm & Pay $5</span>
              <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-black/15 ml-1 border border-black/10">Instant Lock →</span>
            </div>
          </button>

          <!-- Subtle Cancel Button -->
          <button type="button" class="w-full py-3 px-4 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all text-center">
            Cancel & Keep Browsing
          </button>
        </div>

        <!-- Footer Trust & Security Badges -->
        <div class="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-mono">
          <span class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clip-rule="evenodd" />
            </svg>
            Kinetic Smart Vault
          </span>
          <span class="text-slate-700">•</span>
          <span>Dynamic QR Issued On Confirmation</span>
        </div>

      </div>
    </div>
  </div>

</body>
</html>`

function FlashClaim() {
  return <iframe title="SportNexus FlashClaim" srcDoc={flashClaimPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default FlashClaim
