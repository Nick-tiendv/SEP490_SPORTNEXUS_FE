const unauthorizedPage = String.raw`<!DOCTYPE html>

<html class="dark" lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Outfit:wght@600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/><style>@layer base { html, body { margin: 0; padding: 0; } body { overscroll-behavior: none; } main > :first-child { margin-top: 0 !important; } main > :last-child { margin-bottom: 0 !important; } } ::-webkit-scrollbar { display: none; }</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config = { darkMode: "class", theme: { extend: { "colors": { "on-primary-fixed-variant": "#004f58", "outline-variant": "#3b494c", "secondary-container": "#34ff8c", "on-secondary-fixed-variant": "#005227", "surface-container-high": "#262a33", "tertiary": "#e9ecff", "on-primary-fixed": "#001f24", "primary": "#c3f5ff", "on-tertiary": "#002a78", "surface-dim": "#0f131c", "on-tertiary-fixed-variant": "#003ea8", "surface-container-highest": "#31353e", "primary-fixed": "#9cf0ff", "on-tertiary-container": "#004ecf", "on-primary": "#00363d", "on-surface-variant": "#bac9cc", "surface-container-low": "#181c24", "on-tertiary-fixed": "#00174b", "surface-container": "#1c2028", "on-background": "#dfe2ee", "background": "#0f131c", "surface": "#0f131c", "tertiary-container": "#c2cfff", "on-secondary-container": "#007239", "secondary": "#f5fff3", "on-secondary": "#003919", "error": "#ffb4ab", "inverse-primary": "#006875", "tertiary-fixed-dim": "#b4c5ff", "secondary-fixed": "#60ff98", "on-secondary-fixed": "#00210c", "on-error-container": "#ffdad6", "on-primary-container": "#00626e", "outline": "#849396", "surface-variant": "#31353e", "surface-bright": "#353942", "secondary-fixed-dim": "#00e478", "on-surface": "#dfe2ee", "primary-container": "#00e5ff", "on-error": "#690005", "primary-fixed-dim": "#00daf3", "tertiary-fixed": "#dbe1ff", "surface-container-lowest": "#0a0e16", "inverse-on-surface": "#2c3039", "inverse-surface": "#dfe2ee", "surface-tint": "#00daf3", "error-container": "#93000a" }, "borderRadius": { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" }, "spacing": { "space-xs": "0.25rem", "margin-sm": "1rem", "gutter": "1rem", "gutter-sm": "0.75rem", "margin": "1.25rem", "margin-lg": "2rem", "space-xl": "2rem", "space-sm": "0.5rem", "space-lg": "1.5rem", "space-md": "1rem" }, "fontFamily": { "headline-sm": ["Outfit"], "headline-md": ["Outfit"], "display-lg-mobile": ["Outfit"], "display-lg": ["Outfit"], "label-lg": ["Outfit"], "body-sm": ["Inter"], "body-md": ["Inter"], "label-md": ["Outfit"], "headline-lg": ["Outfit"], "label-sm": ["Outfit"], "body-lg": ["Inter"] }, "fontSize": { "headline-sm": ["18px", { "lineHeight": "24px", "fontWeight": "600" }], "headline-md": ["22px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }], "display-lg-mobile": ["32px", { "lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "800" }], "display-lg": ["44px", { "lineHeight": "48px", "letterSpacing": "-0.03em", "fontWeight": "800" }], "label-lg": ["14px", { "lineHeight": "18px", "letterSpacing": "0.04em", "fontWeight": "600" }], "body-sm": ["12px", { "lineHeight": "16px", "fontWeight": "400" }], "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }], "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.06em", "fontWeight": "600" }], "headline-lg": ["28px", { "lineHeight": "34px", "letterSpacing": "-0.02em", "fontWeight": "700" }], "label-sm": ["10px", { "lineHeight": "12px", "letterSpacing": "0.08em", "fontWeight": "700" }], "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }] } } } };</script></head><body class="bg-background font-body-md text-on-surface min-h-screen relative flex flex-col justify-between selection:bg-primary-container selection:text-on-primary"><header class="w-full bg-surface-dim/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]"><div class="h-16 w-full px-margin md:px-margin-lg flex items-center justify-between"><div class="flex items-center gap-space-sm"><div class="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.2)]"><span class="material-symbols-outlined text-primary-container text-[20px]">bolt</span></div><div class="flex flex-col"><span class="font-headline-sm text-headline-sm text-on-surface tracking-tight uppercase">SportNexus</span><span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Secure Gateway</span></div></div><div class="flex items-center gap-space-md"><div class="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-full"><span class="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span><span class="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider">Node: Isolated</span></div><div class="flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-xs rounded-full"><span class="material-symbols-outlined text-primary-container text-[16px]">shield_lock</span><span class="font-label-sm text-label-sm text-on-surface uppercase">Encrypted Session</span></div></div></div></header><main class="w-full flex-1 flex items-center justify-center bg-background relative px-margin py-margin-lg"><div class="flex flex-col w-full relative items-center justify-center py-space-xl overflow-hidden">
<div aria-hidden="true" class="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none">
<div class="absolute w-[680px] h-[680px] rounded-full bg-error/5 blur-[120px] -translate-y-12"></div>
<div class="absolute w-[500px] h-[500px] rounded-full bg-primary-container/5 blur-[100px] translate-y-24 translate-x-24"></div>
<span class="font-display-lg text-[160px] md:text-[280px] lg:text-[340px] leading-none text-surface-container-highest/20 tracking-tighter mix-blend-screen select-none translate-y-4">
      403
    </span>
</div>
<div class="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center">
<div class="relative mb-space-lg">
<div class="absolute -inset-3 rounded-full bg-error/20 blur-xl animate-pulse"></div>
<div class="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-xl">
<div class="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-error-container/40 flex items-center justify-center">
<span class="material-symbols-outlined text-error text-[36px] md:text-[44px]" style="font-variation-settings: 'FILL' 1;">gpp_bad</span>
</div>
</div>
<div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center shadow-md">
<span class="material-symbols-outlined text-primary-container text-[16px]">lock</span>
</div>
</div>
<div class="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high shadow-md mb-space-md">
<span class="w-2 h-2 rounded-full bg-error animate-ping"></span>
<span class="font-label-sm text-label-sm text-primary-container tracking-wider font-mono uppercase">
        ERR_HTTP_403 // FORBIDDEN_RESOURCE_ACCESS
      </span>
</div>
<h1 class="font-headline-lg text-headline-lg md:text-[36px] md:leading-[42px] text-on-surface uppercase tracking-tight mb-space-sm">
      Access Denied
    </h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto mb-space-xl">
      Oops! You don't have permission to view this page. This area is restricted to Court Owners and System Admins.
    </p>
<div class="w-full bg-surface-container-low rounded-xl p-space-lg shadow-xl mb-space-xl text-left">
<div class="flex items-center justify-between pb-space-sm mb-space-md bg-surface-container-high px-space-md py-space-xs rounded-lg">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary-container text-[18px]">terminal</span>
<span class="font-label-sm text-label-sm text-on-surface tracking-wider uppercase">Security Diagnostic Telemetry</span>
</div>
<div class="flex items-center gap-space-xs">
<span class="w-2 h-2 rounded-full bg-error"></span>
<span class="font-label-sm text-label-sm text-error uppercase">Gate Enforced</span>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div class="bg-surface-container-high/60 p-space-md rounded-lg">
<span class="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider mb-space-xs">Identified Role</span>
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[18px]">sports_tennis</span>
<span class="font-headline-sm text-headline-sm text-on-surface">Athlete / Player (Tier 1)</span>
</div>
</div>
<div class="bg-surface-container-high/60 p-space-md rounded-lg">
<span class="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider mb-space-xs">Required Clearance</span>
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-error text-[18px]">verified_user</span>
<span class="font-headline-sm text-headline-sm text-error">Court Owner / SysAdmin (Level 4+)</span>
</div>
</div>
<div class="bg-surface-container-high/60 p-space-md rounded-lg">
<span class="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider mb-space-xs">Session Node Token</span>
<span class="font-label-md text-label-md font-mono text-primary-container block truncate">#NX-SEC-9921-ESCROW</span>
</div>
<div class="bg-surface-container-high/60 p-space-md rounded-lg">
<span class="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider mb-space-xs">Timestamp / Relay</span>
<span class="font-label-md text-label-md font-mono text-on-surface block" id="telemetry-timestamp">2025-02-23T14:48:02.812Z</span>
</div>
</div>
</div>
<div class="flex flex-col sm:flex-row items-center gap-space-md w-full sm:w-auto">
<a class="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg uppercase tracking-wider shadow-lg hover:shadow-[0_0_24px_rgba(96,255,152,0.4)] transition-all" href="#dashboard">
<span class="material-symbols-outlined text-[20px]">arrow_back</span>
        Return to Dashboard
      </a>
<a class="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-space-md rounded-full bg-surface-container-high text-on-surface font-label-lg text-label-lg uppercase tracking-wider shadow-md hover:bg-surface-bright transition-all" href="#switch-account">
<span class="material-symbols-outlined text-[20px]">switch_account</span>
        Switch Account
      </a>
<button class="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-space-md rounded-full bg-surface-container-low text-primary-container font-label-lg text-label-lg uppercase tracking-wider shadow-sm hover:bg-surface-container transition-all" id="dispatch-secops" type="button">
<span class="material-symbols-outlined text-[20px]">support_agent</span>
        Contact Protocol
      </button>
</div>
<div class="hidden mt-space-md px-space-md py-space-xs rounded-full bg-surface-container text-primary text-body-sm font-body-sm items-center gap-space-xs" id="dispatch-notice">
<span class="material-symbols-outlined text-[16px] text-primary-container">check_circle</span>
      SecOps ticket initiated. Escalation code: <span class="font-mono text-on-surface">#TK-403-AUTO</span>
</div>
</div>
</div>
<script>
  (function() {
    var tsElement = document.getElementById('telemetry-timestamp');
    if (tsElement) {
      tsElement.textContent = new Date().toISOString();
    }
    var dispatchBtn = document.getElementById('dispatch-secops');
    var dispatchNotice = document.getElementById('dispatch-notice');
    if (dispatchBtn && dispatchNotice) {
      dispatchBtn.addEventListener('click', function() {
        dispatchNotice.classList.remove('hidden');
        dispatchNotice.classList.add('inline-flex');
        dispatchBtn.setAttribute('disabled', 'true');
        dispatchBtn.classList.add('opacity-50', 'pointer-events-none');
      });
    }
  })();
</script></main><footer class="w-full bg-surface-container-lowest/90 backdrop-blur-md"><div class="w-full px-margin md:px-margin-lg py-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm"><span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">End-to-End Quantum Grid Vault</span><span class="font-body-sm text-body-sm text-on-surface-variant">SecOps Dispatch: active-duty 24/7/365</span></div></footer></body></html>


`
function Unauthorized() {
  return <iframe title="SportNexus Unauthorized" srcDoc={unauthorizedPage} style={{ border: 0, display: 'block', height: '100vh', width: '100%' }} />
}

export default Unauthorized