const aIChatBookingPage = String.raw`<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The SportNexus - AI Conversational Booking</title>
  <!-- Google Fonts Outfit & Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            outfit: ['Outfit', 'sans-serif'],
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          colors: {
            cyber: {
              cyan: '#00e5ff',
              green: '#00ff87',
              blue: '#0066ff',
              purple: '#9d00ff',
              dark: '#080c14',
              surface: '#0d131f',
              card: '#131b2b',
              border: '#1f2b42',
            }
          }
        }
      }
    }
  </script>
  <style>
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      height: 6px;
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(13, 19, 31, 0.6);
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(0, 229, 255, 0.25);
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 229, 255, 0.5);
    }
    .glass-panel {
      background: rgba(15, 22, 36, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-card {
      background: rgba(19, 27, 43, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 229, 255, 0.15);
    }
    .pulse-green {
      box-shadow: 0 0 12px #00ff87;
    }
    .neon-border-cyan {
      box-shadow: 0 0 20px -5px rgba(0, 229, 255, 0.3);
    }
    .glow-cyan-btn {
      box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
    }
    .glow-cyan-btn:hover {
      box-shadow: 0 0 28px rgba(0, 229, 255, 0.7);
    }
  </style>
</head>
<body class="bg-[#070a10] text-slate-100 font-sans antialiased h-screen flex flex-col justify-between overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200">

  <!-- Ambient Glow Gradients -->
  <div class="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
  <div class="fixed bottom-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>
  <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none"></div>

  <!-- Top App Navigation / System Header -->
  <header class="w-full bg-[#0a0f1a]/85 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3.5 z-50 flex items-center justify-between shrink-0 shadow-lg shadow-black/40">
    <div class="flex items-center space-x-3">
      <!-- SportNexus Logo Brand -->
      <a href="#" class="flex items-center gap-2.5 group">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/20">
          <div class="w-full h-full bg-[#0d131f] rounded-[11px] flex items-center justify-center">
            <svg class="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="font-outfit font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
            SPORT<span class="text-cyan-400">NEXUS</span>
          </span>
          <span class="text-[10px] font-mono text-cyan-400/80 -mt-1 tracking-widest uppercase">Kinetic Core v2.4</span>
        </div>
      </a>

      <div class="hidden md:flex items-center space-x-1 pl-6 border-l border-white/10 ml-2">
        <span class="text-xs text-slate-400">Service:</span>
        <span class="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20">AI Match & Booking Concierge</span>
      </div>
    </div>

    <!-- Active AI Assistant Meta & Controls -->
    <div class="flex items-center space-x-3 sm:space-x-4">
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
        <span class="w-2 h-2 rounded-full bg-[#00ff87] animate-ping"></span>
        <span class="relative w-2 h-2 -ml-3 rounded-full bg-[#00ff87]"></span>
        <span>LATENCY 14ms // ED25519 ESCROW</span>
      </div>

      <button class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition border border-white/5" title="Restart Dialogue">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M3 21v-5h5"/>
        </svg>
      </button>

      <a href="#" class="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition font-medium">
        <span>Exit to Hub</span>
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>
    </div>
  </header>

  <!-- Main Chat Container Frame -->
  <main class="flex-1 w-full max-w-5xl mx-auto flex flex-col min-h-0 relative px-3 sm:px-6 py-4">
    
    <!-- AI Assistant Dedicated Header Bar (Kinetic Bot Avatar & Online Status) -->
    <div class="w-full glass-panel rounded-2xl px-4 sm:px-6 py-3.5 mb-3 flex items-center justify-between border border-cyan-500/20 shadow-xl shadow-cyan-950/20">
      <div class="flex items-center space-x-3.5">
        <!-- Kinetic Bot Avatar -->
        <div class="relative">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/30">
            <div class="w-full h-full bg-[#0a1120] rounded-[14.5px] flex items-center justify-center overflow-hidden relative">
              <!-- Animated background pulse -->
              <div class="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
              <!-- AI Core Icon -->
              <svg class="w-6 h-6 text-cyan-400 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
                <circle cx="9" cy="10" r="1.5" fill="#00e5ff"/>
                <circle cx="15" cy="10" r="1.5" fill="#00ff87"/>
              </svg>
            </div>
          </div>
          <!-- Glowing Online Badge -->
          <span class="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff87] opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00ff87] border-2 border-[#0a1120]"></span>
          </span>
        </div>

        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-outfit font-bold text-base sm:text-lg text-white tracking-tight">Kinetic Bot</h1>
            <span class="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase font-semibold rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">Verified AI</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span class="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-[#00ff87]"></span>
              Online
            </span>
            <span class="text-slate-600">•</span>
            <span class="truncate">Autonomous Badminton Booking Agent • GPS Active</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Filters / Preferences Pill -->
      <div class="hidden sm:flex items-center gap-2">
        <span class="text-xs text-slate-400 font-mono">Preferences:</span>
        <button class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition flex items-center gap-1">
          <span>🏸 Badminton</span>
        </button>
        <button class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition flex items-center gap-1">
          <span>📍 5km Radius</span>
        </button>
      </div>
    </div>

    <!-- Scrollable Chat Stream Area -->
    <div class="flex-1 overflow-y-auto pr-1 space-y-5 pb-4 custom-scroll">
      
      <!-- Timestamp Divider -->
      <div class="flex items-center justify-center my-3">
        <div class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-400 tracking-wider">
          TODAY • 18:42 PM
        </div>
      </div>

      <!-- AI Bot Intro Welcome Note (Subtle) -->
      <div class="flex items-start gap-3 max-w-2xl">
        <div class="w-7 h-7 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
          <svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <div class="glass-panel p-3.5 rounded-2xl rounded-tl-sm text-xs text-slate-300 border-white/10 leading-relaxed">
          ⚡ <strong class="text-cyan-300">Kinetic Bot ready.</strong> I can instantly scan live court telemetry, coordinate split-tab escrows with friends, or hold prime peak-hour slots across verified arenas.
        </div>
      </div>

      <!-- User Message (Aligned Right) -->
      <div class="flex items-end justify-end space-x-2 pl-12">
        <div class="flex flex-col items-end max-w-md">
          <div class="bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 text-white font-medium px-4 py-3 rounded-2xl rounded-br-none shadow-lg shadow-cyan-600/20 text-sm leading-relaxed border border-cyan-400/20">
            Find me a badminton court for tonight.
          </div>
          <div class="flex items-center space-x-1.5 mt-1 text-[11px] text-slate-400 font-mono">
            <span>18:44 PM</span>
            <svg class="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        <!-- User Avatar -->
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
          HA
        </div>
      </div>

      <!-- AI Response Bubble (Aligned Left) -->
      <div class="flex items-start space-x-2.5 max-w-3xl pr-4">
        <!-- Kinetic Bot Avatar Small -->
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shrink-0 mt-1 shadow-md shadow-cyan-500/20">
          <div class="w-full h-full bg-[#0d131f] rounded-[11px] flex items-center justify-center">
            <svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
            </svg>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <!-- Text Bubble -->
          <div class="glass-panel text-slate-200 px-4 py-3 rounded-2xl rounded-tl-none border-white/10 text-sm leading-relaxed inline-block mb-3">
            <p>
              Here are the available courts for tonight:
            </p>
            <div class="mt-1 flex items-center gap-2 text-[11px] text-cyan-400 font-mono">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              2 Verified Indoor Arenas • Distance &lt; 4.2 km • Real-time Instant Escrow Hold
            </div>
          </div>

          <!-- Horizontal Scrolling Carousel of 2 Court Cards inside the chat -->
          <div class="relative w-full">
            <div class="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar">
              
              <!-- Court Card 1: Kinetic Arena - Court 3 -->
              <div class="snap-start shrink-0 w-[300px] sm:w-[325px] rounded-2xl glass-card p-4 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 group shadow-xl shadow-cyan-950/40 relative flex flex-col justify-between">
                <!-- Top Badge row -->
                <div class="flex items-center justify-between mb-3">
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#00ff87] text-[11px] font-mono font-medium flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#00ff87]"></span>
                    BWF Approved Synthetic
                  </span>
                  <div class="flex items-center text-amber-400 text-xs font-semibold">
                    <svg class="w-3.5 h-3.5 fill-current mr-1" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    4.9 (124)
                  </div>
                </div>

                <!-- Court Visual Header -->
                <div class="relative h-28 rounded-xl overflow-hidden mb-3.5 border border-white/10 bg-[#090e18]">
                  <!-- Stylized Court Graphic Background -->
                  <div class="absolute inset-0 bg-gradient-to-t from-[#0c1424] via-cyan-950/30 to-transparent z-10"></div>
                  <div class="absolute inset-0 opacity-40 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:12px_12px]"></div>
                  <!-- Court line graphics -->
                  <div class="absolute inset-3 border border-cyan-400/40 rounded flex items-center justify-center">
                    <div class="w-full h-[1px] bg-cyan-400/30"></div>
                    <div class="absolute inset-y-0 w-[1px] bg-emerald-400/40"></div>
                  </div>
                  
                  <div class="absolute bottom-2.5 left-3 z-20">
                    <h3 class="font-outfit font-bold text-base text-white tracking-wide flex items-center gap-1.5">
                      Kinetic Arena • Court 3
                      <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    </h3>
                    <p class="text-[11px] text-slate-300 font-sans flex items-center gap-1">
                      <svg class="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      Sector 4, Downtown • 1.8 km
                    </p>
                  </div>
                </div>

                <!-- Match Slot & Dynamic Pricing Specs -->
                <div class="space-y-2 mb-4 bg-white/5 rounded-xl p-3 border border-white/5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-400 flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      Time Slot
                    </span>
                    <span class="font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      19:00 - 20:00
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                    <span class="text-slate-400">Total Court Fee</span>
                    <div class="flex items-baseline gap-1">
                      <span class="font-outfit font-extrabold text-xl text-[#00ff87]">$15</span>
                      <span class="text-[10px] text-slate-400 font-mono">/ 60 min</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span class="flex items-center gap-1 text-slate-400">
                      <svg class="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Split with 4 players:
                    </span>
                    <span class="text-white font-mono font-medium">$3.75 each</span>
                  </div>
                </div>

                <!-- CTA Button -->
                <button class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-outfit font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition shadow-lg shadow-cyan-500/25 glow-cyan-btn">
                  <span>Book Now</span>
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              <!-- Court Card 2: Metro Smash Hub - Court 1 -->
              <div class="snap-start shrink-0 w-[300px] sm:w-[325px] rounded-2xl glass-card p-4 border border-blue-500/30 hover:border-cyan-400 transition-all duration-300 group shadow-xl shadow-blue-950/30 relative flex flex-col justify-between">
                <!-- Top Badge row -->
                <div class="flex items-center justify-between mb-3">
                  <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-medium flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    Air Conditioned + Mats
                  </span>
                  <div class="flex items-center text-amber-400 text-xs font-semibold">
                    <svg class="w-3.5 h-3.5 fill-current mr-1" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    4.8 (89)
                  </div>
                </div>

                <!-- Court Visual Header -->
                <div class="relative h-28 rounded-xl overflow-hidden mb-3.5 border border-white/10 bg-[#090e18]">
                  <div class="absolute inset-0 bg-gradient-to-t from-[#0c1424] via-blue-950/30 to-transparent z-10"></div>
                  <div class="absolute inset-0 opacity-30 bg-[radial-gradient(#0066ff_1px,transparent_1px)] [background-size:12px_12px]"></div>
                  <!-- Court lines -->
                  <div class="absolute inset-3 border border-blue-400/40 rounded flex items-center justify-center">
                    <div class="w-full h-[1px] bg-blue-400/30"></div>
                    <div class="absolute inset-y-0 w-[1px] bg-cyan-400/40"></div>
                  </div>

                  <div class="absolute bottom-2.5 left-3 z-20">
                    <h3 class="font-outfit font-bold text-base text-white tracking-wide flex items-center gap-1.5">
                      Metro Smash Hub • Court 1
                      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </h3>
                    <p class="text-[11px] text-slate-300 font-sans flex items-center gap-1">
                      <svg class="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      Olympic Sports Park • 3.4 km
                    </p>
                  </div>
                </div>

                <!-- Match Slot & Dynamic Pricing Specs -->
                <div class="space-y-2 mb-4 bg-white/5 rounded-xl p-3 border border-white/5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-400 flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      Time Slot
                    </span>
                    <span class="font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      19:00 - 20:00
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                    <span class="text-slate-400">Total Court Fee</span>
                    <div class="flex items-baseline gap-1">
                      <span class="font-outfit font-extrabold text-xl text-[#00ff87]">$15</span>
                      <span class="text-[10px] text-slate-400 font-mono">/ 60 min</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span class="flex items-center gap-1 text-slate-400">
                      <svg class="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Split with 4 players:
                    </span>
                    <span class="text-white font-mono font-medium">$3.75 each</span>
                  </div>
                </div>

                <!-- CTA Button -->
                <button class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-outfit font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition shadow-lg shadow-cyan-500/25 glow-cyan-btn">
                  <span>Book Now</span>
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

            </div>
          </div>

          <!-- Bottom Follow-up Pill Suggestions -->
          <div class="flex flex-wrap gap-2 mt-3 pt-1">
            <span class="text-[11px] text-slate-400 font-mono flex items-center mr-1">Suggested:</span>
            <button class="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition">
              "Hold Kinetic Arena & invite Alex"
            </button>
            <button class="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition">
              "Check 20:00 - 21:00 slot"
            </button>
            <button class="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition">
              "Add 2 rental rackets"
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Bottom Interactive Chat Input Bar -->
    <div class="w-full pt-2 shrink-0">
      <div class="glass-panel rounded-2xl p-2 sm:p-2.5 border border-cyan-500/25 shadow-2xl shadow-cyan-950/50 flex items-center space-x-2 relative focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 transition-all">
        
        <!-- Plus / Attachment Options -->
        <button class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition shrink-0" title="Attach match parameters">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

        <!-- Main Prompt Input -->
        <div class="flex-1 relative flex items-center">
          <input 
            type="text" 
            placeholder="Ask Kinetic Bot to book, invite players, or negotiate slots..." 
            class="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none px-2 font-sans py-1"
            value="Book Kinetic Arena for 19:00 with Alex Chen"
          />
          <span class="hidden md:inline-block text-[10px] font-mono text-cyan-400/60 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 mr-2 shrink-0">
            Escrow Ready
          </span>
        </div>

        <!-- Voice / Microphone Icon Button -->
        <button 
          class="w-10 h-10 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition shrink-0 group relative" 
          title="Voice Command"
        >
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>

        <!-- Send Icon Button (Glowing Electric Blue / Cyan) -->
        <button 
          class="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 flex items-center justify-center transition font-bold shadow-lg shadow-cyan-500/30 glow-cyan-btn shrink-0 active:scale-95" 
          title="Send Command"
        >
          <svg class="w-5 h-5 ml-0.5 rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>

      </div>

      <!-- Trust Assurance & Keyboard Shortcuts Footer -->
      <div class="flex items-center justify-between px-2 pt-2 text-[10px] font-mono text-slate-500">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1 text-emerald-400">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            256-Bit Escrow Vault Protected
          </span>
          <span class="hidden sm:inline">• Automatic 15-min Slot Reservation Guarantee</span>
        </div>
        <div class="hidden sm:flex items-center gap-2">
          <span>Press <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">Return ↵</kbd> to send</span>
        </div>
      </div>
    </div>

  </main>

</body>
</html>`

function AIChatBooking() {
  return <iframe title="SportNexus AIChatBooking" srcDoc={aIChatBookingPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default AIChatBooking
