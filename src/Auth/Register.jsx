const registerPage = String.raw`<!DOCTYPE html>

<html class="dark h-full" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>SportNexus | Athlete &amp; Arena Registration</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Outfit:wght@400;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS v3 -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            obsidian: {
              DEFAULT: '#0a0e16',
              surface: '#0f1420',
              card: 'rgba(15, 20, 32, 0.72)',
              border: 'rgba(255, 255, 255, 0.08)',
            },
            cyan: {
              DEFAULT: '#00e5ff',
              glow: '#00e5ff33',
              hover: '#33ebff',
            },
            neon: {
              lime: '#10b981',
              green: '#22c55e',
            }
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            outfit: ['Outfit', 'sans-serif'],
          },
          boxShadow: {
            'glow-cyan': '0 0 25px -4px rgba(0, 229, 255, 0.35)',
            'glow-cyan-sm': '0 0 12px -2px rgba(0, 229, 255, 0.3)',
            'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }
        }
      }
    }
  </script>
<!-- BEGIN: Custom Glass and Layout Styling -->
<style data-purpose="custom-fx">
    /* Custom subtle glassmorphism and scanlines */
    .glass-panel {
      background: rgba(13, 19, 31, 0.78);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.09);
    }
    .court-grid-lines {
      background-image: 
        linear-gradient(to right, rgba(0, 229, 255, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 229, 255, 0.04) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    /* Hide native scrollbars while preserving scrolling */
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  </style>
<!-- END: Custom Glass and Layout Styling -->
</head>
<body class="bg-obsidian text-slate-200 font-sans min-h-screen antialiased selection:bg-cyan selection:text-black overflow-x-hidden">
<!-- BEGIN: MainContainer -->
<main class="w-full min-h-screen flex flex-col lg:flex-row relative">
<!-- BEGIN: LeftHeroSide (45%-50% desktop split) -->
<section aria-label="Visual Showcase" class="relative hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between overflow-hidden bg-obsidian border-r border-obsidian-border select-none">
<!-- Background Badminton Action Imagery -->
<div class="absolute inset-0 z-0">
<img alt="Intense athletic badminton player executing a powerful high-flying jump smash in a modern dark-mode arena, electric cyan and neon blue rim lighting, moody atmospheric stadium fog, high-contrast dynamic action shot, tournament quality, dramatic angles" class="w-full h-full object-cover object-center scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnaZ3R7jloKq_--dDononhiUgmLnFkvkOXBrb4uShJOS3oDxnnTfc5txWfrOR8OlplB9tPAua_XFznFHyxnnRjprmSdaFLXEjcc2ub5LSfRhh9BQUDW9ASnGrXbWvWs8fC6KI6WhZb9DSFafJERwMJKwKrVEZSGHRjszK787EDhN5nIPXBYzV9Kj9L3jR_tjg_RqPkB77TQsv1TDo9ak9vFMbu-N-QEpCAUvfqlYfpco9ejomPKwov"/>
<!-- Multi-layer Gradient Overlays for High-Tech Mood -->
<div class="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-obsidian/30"></div>
<div class="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-transparent to-obsidian"></div>
<div class="absolute inset-0 court-grid-lines opacity-75"></div>
</div>
<!-- Top Overlay: Brand Header -->
<div class="relative z-10 p-8 xl:p-12 flex items-center justify-between">
<!-- Logo -->
<div class="flex items-center space-x-3">
<div class="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/40 flex items-center justify-center shadow-glow-cyan-sm">
<svg class="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</div>
<div>
<div class="flex items-center space-x-2">
<span class="font-outfit font-extrabold tracking-wider text-white text-lg leading-none">SPORTNEXUS</span>
<span class="text-[10px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded bg-cyan/20 text-cyan border border-cyan/30">KINETIC</span>
</div>
<p class="text-[11px] text-slate-400 font-mono tracking-wider mt-0.5">NEXT-GEN ATHLETIC PROTOCOL</p>
</div>
</div>
<!-- Live Court Telemetry Dot -->
<div class="flex items-center space-x-2 bg-obsidian-surface/80 border border-obsidian-border rounded-full px-3 py-1.5 backdrop-blur-md">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-cyan"></span>
</span>
<span class="text-xs font-mono text-cyan/90 tracking-wide font-medium">LIVE TELEMETRY</span>
</div>
</div>
<!-- Center Float: Metrics & Floating Badges -->
<div class="relative z-10 px-8 xl:px-12 space-y-4 my-auto">
<!-- Primary Stat Card -->
<div class="glass-panel p-5 rounded-2xl max-w-sm border border-cyan/20 shadow-glow-cyan-sm transform translate-y-4">
<div class="flex items-center justify-between mb-3">
<span class="text-xs font-mono uppercase tracking-widest text-slate-400">Match Node Status</span>
<span class="px-2 py-0.5 text-[10px] font-semibold text-neon-green bg-neon-green/10 rounded-full border border-neon-green/30 flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-neon-green inline-block"></span> 99.98% Synced
            </span>
</div>
<div class="flex items-baseline gap-2">
<span class="text-3xl font-outfit font-bold text-white tracking-tight">48,290+</span>
<span class="text-xs text-cyan font-medium">Verified Matches</span>
</div>
<p class="text-xs text-slate-400 mt-1">Smart court sensors &amp; automated escrow settled across 340+ certified hubs.</p>
</div>
<!-- Floating Secondary Micro-Pill -->
<div class="inline-flex items-center gap-2 bg-obsidian-surface/80 border border-obsidian-border rounded-xl px-4 py-2 backdrop-blur-md text-xs font-mono text-slate-300">
<svg class="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span>BWF Standard Telemetry &amp; Escrow Integrated</span>
</div>
</div>
<!-- Bottom Overlay: Motivational Statement -->
<div class="relative z-10 p-8 xl:p-12 bg-gradient-to-t from-obsidian via-obsidian/90 to-transparent">
<blockquote class="text-lg xl:text-xl font-outfit font-semibold text-white/95 leading-relaxed tracking-normal">
          “Elevate your game. Connect with elite players, unlock smart court access, and climb the verified leaderboards.”
        </blockquote>
<div class="flex items-center gap-3 mt-4 text-xs font-mono text-slate-400">
<div class="flex -space-x-2 overflow-hidden">
<div class="inline-block h-6 w-6 rounded-full bg-cyan/20 ring-2 ring-obsidian border border-cyan/40 text-[10px] text-cyan flex items-center justify-center font-bold">AN</div>
<div class="inline-block h-6 w-6 rounded-full bg-indigo-500/30 ring-2 ring-obsidian border border-indigo-400/40 text-[10px] text-indigo-300 flex items-center justify-center font-bold">MK</div>
<div class="inline-block h-6 w-6 rounded-full bg-neon-green/20 ring-2 ring-obsidian border border-neon-green/40 text-[10px] text-neon-green flex items-center justify-center font-bold">RL</div>
</div>
<span>Joined by 12,000+ registered athletes this month</span>
</div>
</div>
</section>
<!-- END: LeftHeroSide -->
<!-- BEGIN: RightFormSide (55%-50% split) -->
<section aria-label="Registration Portal" class="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-14 py-10 lg:py-12 overflow-y-auto no-scrollbar relative">
<!-- Ambient Glow Behind Form -->
<div class="absolute top-1/4 right-1/4 w-80 h-80 bg-cyan/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
<div class="w-full max-w-xl mx-auto">
<!-- Navigation Header -->
<header class="mb-8">
<a class="inline-flex items-center text-xs font-mono text-slate-400 hover:text-cyan transition-colors duration-200 group mb-4" href="#">
<svg class="w-4 h-4 mr-1.5 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M10 19l-7-7m0 0l7-7m-7 7h18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
            BACK TO HOME
          </a>
<div class="flex items-baseline gap-3">
<h1 class="text-3xl sm:text-4xl font-outfit font-extrabold text-white tracking-tight">
              Join <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-blue-400">The SportNexus</span>
</h1>
</div>
<p class="text-sm text-slate-400 mt-2 font-normal">
            Create your athlete passport or register your facility to unlock verified tournaments and smart matches.
          </p>
</header>
<!-- Registration Glass Card -->
<div class="glass-panel p-6 sm:p-8 rounded-2xl shadow-glass border border-white/10" data-purpose="registration-card">
<!-- Role Selector (Segmented Cards) -->
<div class="mb-6" data-purpose="role-selector">
<label class="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
              Select Profile Role
            </label>
<div class="grid grid-cols-2 gap-3" id="role-container">
<!-- Option 1: Player (Selected by default) -->
<button class="group relative flex flex-col p-3.5 rounded-xl border border-cyan bg-cyan/10 text-left transition-all duration-200 focus:outline-none shadow-glow-cyan-sm" data-purpose="role-player" id="role-player-btn" onclick="selectRole('player')" type="button">
<div class="flex items-center justify-between mb-1.5">
<div class="w-7 h-7 rounded-lg bg-cyan/20 border border-cyan/40 flex items-center justify-center text-cyan">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</div>
<span class="text-[10px] font-mono tracking-wider font-semibold text-cyan bg-cyan/20 px-2 py-0.5 rounded-full border border-cyan/40">
                    COMPETE &amp; LFG
                  </span>
</div>
<div class="font-outfit font-bold text-white text-sm">I am a Player</div>
<div class="text-[11px] text-slate-300 font-sans leading-tight mt-0.5">Find games, rank up &amp; join ladders</div>
</button>
<!-- Option 2: Court Owner -->
<button class="group relative flex flex-col p-3.5 rounded-xl border border-obsidian-border bg-obsidian-surface/60 hover:border-slate-600 text-left transition-all duration-200 focus:outline-none" data-purpose="role-owner" id="role-owner-btn" onclick="selectRole('owner')" type="button">
<div class="flex items-center justify-between mb-1.5">
<div class="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-slate-200">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</div>
<span class="text-[10px] font-mono tracking-wider font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700">
                    MONETIZE
                  </span>
</div>
<div class="font-outfit font-bold text-slate-300 text-sm">I am a Court Owner</div>
<div class="text-[11px] text-slate-400 font-sans leading-tight mt-0.5">Smart court gates &amp; booking fees</div>
</button>
</div>
</div>
<!-- BEGIN: FormFields -->
<form class="space-y-4" id="registration-form" onsubmit="event.preventDefault(); window.top.location.href='/onboarding';">
<!-- Full Name Field -->
<div data-purpose="field-fullname">
<label class="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5" for="full-name">
                Full Name
              </label>
<div class="relative">
<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</div>
<input class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian-surface border border-obsidian-border text-white placeholder-slate-500 text-sm focus:border-cyan focus:ring-1 focus:ring-cyan transition-all duration-150 outline-none" id="full-name" name="full-name" placeholder="e.g., Hoang An" required="" type="text"/>
</div>
</div>
<!-- Email Field -->
<div data-purpose="field-email">
<label class="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5" for="email">
                Email Address
              </label>
<div class="relative">
<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</div>
<input class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian-surface border border-obsidian-border text-white placeholder-slate-500 text-sm focus:border-cyan focus:ring-1 focus:ring-cyan transition-all duration-150 outline-none" id="email" name="email" placeholder="athlete@kinetic.io" required="" type="email"/>
</div>
</div>
<!-- Password Field -->
<div data-purpose="field-password">
<div class="flex items-center justify-between mb-1.5">
<label class="block text-xs font-mono uppercase tracking-wider text-slate-300" for="password">
                  Password
                </label>
<span class="text-[11px] font-mono text-cyan" id="strength-label">Strong</span>
</div>
<div class="relative">
<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</div>
<input class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-obsidian-surface border border-obsidian-border text-white placeholder-slate-500 text-sm focus:border-cyan focus:ring-1 focus:ring-cyan transition-all duration-150 outline-none" id="password" name="password" placeholder="Enter secure password" required="" type="password" value="••••••••••••"/>
<!-- Show / Hide Password Toggle -->
<button aria-label="Toggle password visibility" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan transition-colors" onclick="togglePasswordVisibility('password')" type="button">
<svg class="w-4 h-4" fill="none" id="password-eye" stroke="currentColor" viewbox="0 0 24 24">
<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
<path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</button>
</div>
<!-- Password Strength Indicator Bars -->
<div aria-hidden="true" class="mt-2 grid grid-cols-3 gap-1.5">
<div class="h-1 rounded-full bg-cyan transition-colors"></div>
<div class="h-1 rounded-full bg-cyan transition-colors"></div>
<div class="h-1 rounded-full bg-cyan transition-colors"></div>
</div>
</div>
<!-- Confirm Password Field -->
<div data-purpose="field-confirm-password">
<label class="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5" for="confirm-password">
                Confirm Password
              </label>
<div class="relative">
<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</div>
<input class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-obsidian-surface border border-obsidian-border text-white placeholder-slate-500 text-sm focus:border-cyan focus:ring-1 focus:ring-cyan transition-all duration-150 outline-none" id="confirm-password" name="confirm-password" placeholder="Repeat secure password" required="" type="password" value="••••••••••••"/>
<!-- Checkmark confirmation badge -->
<div class="absolute inset-y-0 right-0 pr-3 flex items-center text-neon-green pointer-events-none">
<svg class="w-4 h-4" fill="currentColor" viewbox="0 0 20 20">
<path clip-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill-rule="evenodd"></path>
</svg>
</div>
</div>
</div>
<!-- Agreement Checkbox -->
<div class="pt-1 flex items-start" data-purpose="terms-checkbox">
<div class="flex items-center h-5">
<input checked="" class="w-4 h-4 rounded bg-obsidian-surface border-obsidian-border text-cyan focus:ring-cyan focus:ring-offset-obsidian cursor-pointer" id="terms" name="terms" type="checkbox"/>
</div>
<label class="ml-2.5 text-xs text-slate-400 leading-snug" for="terms">
                I agree to the SportNexus 
                <a class="text-cyan hover:underline" href="#">Terms of Service</a>, 
                <a class="text-cyan hover:underline" href="#">Fairplay Protocol</a>, and 
                <a class="text-cyan hover:underline" href="#">Privacy Policy</a>.
              </label>
</div>
<!-- Primary Create Account Button -->
<div class="pt-2">
<button class="w-full py-3.5 px-6 rounded-xl font-outfit font-bold text-sm tracking-wide text-black bg-cyan hover:bg-cyan-hover shadow-glow-cyan transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group" data-purpose="submit-btn" type="submit">
<svg class="w-4 h-4 text-black group-hover:scale-110 transition-transform" fill="currentColor" viewbox="0 0 20 20">
<path clip-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" fill-rule="evenodd"></path>
</svg>
<span>CREATE ACCOUNT</span>
</button>
</div>
</form>
<!-- END: FormFields -->
<!-- Social Divider -->
<div class="my-6 relative flex py-1 items-center">
<div class="flex-grow border-t border-obsidian-border"></div>
<span class="flex-shrink mx-4 text-[11px] font-mono uppercase tracking-widest text-slate-500">Or register with</span>
<div class="flex-grow border-t border-obsidian-border"></div>
</div>
<!-- Social Auth Buttons -->
<div class="grid grid-cols-2 gap-3" data-purpose="social-buttons">
<!-- Google Button -->
<button class="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-obsidian-surface border border-obsidian-border hover:border-slate-600 transition-colors text-xs font-medium text-slate-200" type="button">
<svg class="w-4 h-4" viewbox="0 0 24 24">
<path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" fill="#EA4335"></path>
<path d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" fill="#4285F4"></path>
<path d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" fill="#FBBC05"></path>
<path d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z" fill="#34A853"></path>
</svg>
<span>Google</span>
</button>
<!-- Apple Button -->
<button class="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-obsidian-surface border border-obsidian-border hover:border-slate-600 transition-colors text-xs font-medium text-slate-200" type="button">
<svg class="w-4 h-4 fill-current" viewbox="0 0 24 24">
<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.95 1.07.08 2.16-.54 2.79-1.29z"></path>
</svg>
<span>Apple</span>
</button>
</div>
</div>
<!-- END: Registration Glass Card -->
<!-- Bottom Sign In & Security Badges -->
<footer class="mt-6 text-center space-y-3">
<p class="text-xs text-slate-400">
            Already have an athlete passport? 
            <a class="text-cyan font-medium hover:underline ml-1" href="#">Sign In</a>
</p>
<div class="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-500">
<span class="flex items-center gap-1">
<svg class="w-3 h-3 text-neon-green" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
              256-Bit SSL Encrypted
            </span>
<span>•</span>
<span class="flex items-center gap-1">
<svg class="w-3 h-3 text-cyan" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
              Smart Escrow Ready
            </span>
</div>
</footer>
</div>
</section>
<!-- END: RightFormSide -->
</main>
<!-- END: MainContainer -->
<!-- BEGIN: Interactive Role Switcher & Password Script -->
<script data-purpose="interactive-controls">
    // Interactive segmented role switcher
    function selectRole(role) {
      const playerBtn = document.getElementById('role-player-btn');
      const ownerBtn = document.getElementById('role-owner-btn');

      const activeClasses = ['border-cyan', 'bg-cyan/10', 'shadow-glow-cyan-sm'];
      const inactiveClasses = ['border-obsidian-border', 'bg-obsidian-surface/60'];

      if (role === 'player') {
        playerBtn.classList.remove(...inactiveClasses);
        playerBtn.classList.add(...activeClasses);
        
        ownerBtn.classList.remove(...activeClasses);
        ownerBtn.classList.add(...inactiveClasses);
      } else {
        ownerBtn.classList.remove(...inactiveClasses);
        ownerBtn.classList.add(...activeClasses);
        
        playerBtn.classList.remove(...activeClasses);
        playerBtn.classList.add(...inactiveClasses);
      }
    }

    // Toggle password visibility helper
    function togglePasswordVisibility(fieldId) {
      const input = document.getElementById(fieldId);
      if (input.type === "password") {
        input.type = "text";
      } else {
        input.type = "password";
      }
    }
  </script>
<!-- END: Interactive Role Switcher & Password Script -->
</body></html>`

function Register() {
  return <iframe title="SportNexus Registration" srcDoc={registerPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default Register