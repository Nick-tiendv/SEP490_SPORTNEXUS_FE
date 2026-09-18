function Dashboard() {
  return (
    <div className="flex flex-col w-full px-space-lg py-space-lg gap-space-xl relative overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-80 right-0 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* SECTION 1: WELCOME BANNER */}
      <section className="relative rounded-2xl bg-surface-container-low/70 backdrop-blur-xl p-space-lg shadow-xl overflow-hidden flex flex-col gap-space-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-secondary-container to-transparent"></div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-6">
          <span className="material-symbols-outlined text-[160px] text-primary">sports_tennis</span>
        </div>
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center gap-space-xs px-3 py-1 rounded-full bg-secondary-container/15 text-secondary-fixed shadow-[0_0_12px_rgba(52,255,140,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Kinetic Mesh Online • Virginia Prime Hub</span>
          </div>
          <div className="flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-primary-container">military_tech</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">Current Season: S4 Championship</span>
          </div>
          <div className="ml-auto hidden xl:flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary-container">bolt</span>
            <span>LATENCY: 14MS</span>
            <span className="text-outline">•</span>
            <span className="text-on-surface">SYNCHRONIZED NODE #088</span>
          </div>
        </div>
        {/* Welcome Content */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs max-w-2xl">
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-primary-container via-secondary-container to-secondary-fixed bg-clip-text text-transparent">Hoàng Ân!</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              "Relentless velocity beats raw talent. Step onto the court and claim your edge."
            </p>
          </div>
          <div className="flex items-center gap-space-sm">
            <button className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-container-highest transition-all shadow-md">
              <span className="material-symbols-outlined text-[20px] text-primary-container">calendar_month</span>
              <span>My Schedule</span>
            </button>
            <button className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg hover:brightness-110 transition-all shadow-[0_0_24px_rgba(0,229,255,0.45)]">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Book Instant Slot</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: TOP METRIC WIDGETS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Widget 1: Digital Kinetic Vault */}
        <div className="relative rounded-2xl bg-surface-container-low/80 backdrop-blur-xl p-space-lg flex flex-col justify-between gap-space-md shadow-lg overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-44 h-44 bg-primary-container/10 rounded-full blur-2xl group-hover:bg-primary-container/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-primary-container/15 flex items-center justify-center text-primary-container shadow-[0_0_12px_rgba(0,229,255,0.2)]">
                <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface">Digital Kinetic Vault</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Automated Match Escrow</span>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-surface-container-high text-secondary-container font-label-sm text-label-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
              <span>Auto-Recharge Active</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-xs pt-space-xs">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Available Balance</span>
              <div className="flex items-baseline gap-space-xs">
                <span className="font-display-lg text-display-lg text-on-surface tracking-tight leading-none">$120.00</span>
                <span className="font-label-md text-label-md text-secondary-fixed">USDC / FIAT</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-high/90">
              <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Locked Escrow: <strong className="text-on-surface font-semibold">$5.00</strong> • Instant Refund Protected
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Quick Top-up:</span>
              <button className="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest hover:text-primary-container font-label-md text-label-md transition-all">+ $20</button>
              <button className="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest hover:text-primary-container font-label-md text-label-md transition-all">+ $50</button>
              <button className="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest hover:text-primary-container font-label-md text-label-md transition-all">+ $100</button>
            </div>
            <button className="flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg hover:brightness-110 shadow-[0_0_20px_rgba(52,255,140,0.4)] transition-all">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Top Up Vault</span>
            </button>
          </div>
        </div>

        {/* Widget 2: Performance & Calibration */}
        <div className="relative rounded-2xl bg-surface-container-low/80 backdrop-blur-xl p-space-lg flex flex-col justify-between gap-space-md shadow-lg overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-44 h-44 bg-secondary-container/10 rounded-full blur-2xl group-hover:bg-secondary-container/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/15 flex items-center justify-center text-secondary-container shadow-[0_0_12px_rgba(52,255,140,0.2)]">
                <span className="material-symbols-outlined text-[24px]">monitoring</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface">Performance &amp; Calibration</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Real-time Biometrics &amp; Elo</span>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-secondary-container/15 text-secondary-fixed font-label-sm text-label-sm flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span>Honor Elite Tier</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
            {/* Fairplay Meter */}
            <div className="flex items-center gap-space-md p-space-sm rounded-xl bg-surface-container-high/60">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path className="text-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                  <path className="text-secondary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="98, 100" strokeLinecap="round" strokeWidth="3.5"></path>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-label-lg text-label-lg font-bold text-on-surface leading-none">98</span>
                  <span className="font-label-sm text-[8px] text-secondary-container">PTS</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Fairplay Score</span>
                <span className="font-body-sm text-body-sm text-secondary-fixed">98 / 100 Absolute</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">0 Court Penalties Recorded</span>
              </div>
            </div>
            {/* Elo Metric */}
            <div className="flex flex-col justify-between p-space-sm rounded-xl bg-surface-container-high/60">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Badminton Elo</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-headline-lg text-headline-lg text-primary-container leading-none">1,450</span>
                    <span className="font-label-sm text-label-sm text-secondary-container font-bold">+24 pts</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-primary-container/15 text-primary text-label-sm font-semibold">Silver Tier</span>
                  <p className="font-label-sm text-[10px] text-on-surface-variant mt-0.5">Top 12% in Region</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 text-on-surface font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary-container">trending_up</span>
                  <span>76% Win Rate</span>
                  <span className="text-outline">•</span>
                  <span className="text-on-surface-variant">34 Matches</span>
                </div>
                <svg className="w-20 h-5 text-primary-container" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 80 20">
                  <polyline points="0,15 15,14 30,17 45,9 60,11 75,3"></polyline>
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-space-xs font-label-md text-label-md text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
              <span>Telemetry node verified via Hawk-Eye Vision</span>
            </span>
            <a className="text-primary-container hover:underline flex items-center gap-0.5" href="#">
              <span>Full Performance Graph</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 3: UPCOMING MATCH */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary-container text-[24px]">stadium</span>
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">Active Deployment</h2>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Slot ID #KN-88219</span>
        </div>
        <div className="relative rounded-2xl bg-surface-container-low/90 backdrop-blur-2xl p-space-lg shadow-2xl overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-primary-container via-secondary-container to-primary-container"></div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-center">
            <div className="xl:col-span-8 flex flex-col gap-space-md">
              <div className="flex flex-wrap items-center gap-space-sm">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/15 text-secondary-fixed shadow-[0_0_12px_rgba(52,255,140,0.3)]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-90"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-container"></span>
                  </span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">Confirmed Reservation • Starts in 2h 15m</span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
                  Court 3 • Synthetic Hydro-Cushion
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-lg text-display-lg-mobile md:text-headline-lg text-on-surface font-bold">
                  Next Match: Badminton at Kinetic Arena
                </h3>
                <div className="flex items-center gap-space-xs text-on-surface-variant font-body-md text-body-md">
                  <span className="material-symbols-outlined text-[18px] text-primary-container">pin_drop</span>
                  <span>Kinetic Central Stadium • High-Velocity Hall B, Sector 4</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
                <div className="flex flex-col p-space-sm rounded-xl bg-surface-container-high/70">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Match Schedule</span>
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">Tonight, 19:00 - 20:30</span>
                  <span className="font-body-sm text-body-sm text-secondary-container">90 Min Standard Fast-Pace</span>
                </div>
                <div className="flex flex-col p-space-sm rounded-xl bg-surface-container-high/70">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Roster Status</span>
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">4 / 4 Confirmed Full</span>
                  <span className="font-body-sm text-body-sm text-primary-container">Doubles Competitive Ladder</span>
                </div>
                <div className="flex flex-col p-space-sm rounded-xl bg-surface-container-high/70">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Access Gate</span>
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">Turnstile Gate B3</span>
                  <span className="font-body-sm text-body-sm text-secondary-fixed">NFC Tap Enabled</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs">
                <div className="flex items-center gap-space-sm">
                  <div className="flex -space-x-3 overflow-hidden">
                    <div className="inline-block h-10 w-10 rounded-full bg-primary-fixed-dim text-on-primary font-bold text-center leading-10 shadow-md">KT</div>
                    <div className="inline-block h-10 w-10 rounded-full bg-secondary-fixed-dim text-on-secondary font-bold text-center leading-10 shadow-md">MV</div>
                    <div className="inline-block h-10 w-10 rounded-full bg-tertiary-fixed text-on-tertiary font-bold text-center leading-10 shadow-md">SL</div>
                    <div className="inline-block h-10 w-10 rounded-full bg-primary text-on-primary font-bold text-center leading-10 ring-2 ring-primary-container shadow-md">HÂ</div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Confirmed Players</span>
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">Kiro T., Marcus V., Sarah L., Hoàng Ân (You)</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary-container">verified</span>
                  <span>Official Referee AI System Active</span>
                </div>
              </div>
            </div>
            <div className="xl:col-span-4 flex flex-col items-center justify-center p-space-md rounded-xl bg-surface-container-high/50 backdrop-blur-md gap-space-md text-center">
              <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-inner">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKWNpoUp2khbpM-VNOJLoJqoNoM1bShmlJOwAkm4PLZhi2KskMhAHyAoDYQJUEfnk9Rgqk-lCzV_5ncwSDfYyLzmKqeFxjVrnS_bqaUTf4vcV9ge5hHJm9sWou5IQEBGGNBqAxX3BoGMdekbfk6dJgYTH6Oio9T4wKydQHZWx2oASoOB31huQeueZm5hcTKV2XN4ATnKOMQWHwLt_b6GIXAAC8xQWSta2NcjV-DXyKlW_NlARAsjql"
                  alt="High-tech indoor badminton court"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent"></div>
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-left">
                  <span className="font-label-sm text-label-sm text-on-surface px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-sm">Court 3 Vision Feed</span>
                  <span className="font-label-sm text-label-sm text-secondary-container flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                    LIVE
                  </span>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-space-sm px-space-lg py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-fixed font-label-lg text-label-lg font-bold tracking-wide hover:brightness-110 shadow-[0_0_28px_rgba(0,229,255,0.45)] transition-all">
                <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                <span>View QR Pass • Turnstile Unlock</span>
              </button>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Tap device on arena gate reader or show dynamic barcode</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: QUICK MATCHMAKING (LFG) */}
      <section className="flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-xs">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary-container text-[24px]">podium</span>
              <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">Quick Matchmaking (LFG)</h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">Active community beacons ready for instant flash entry • Auto escrow held</p>
          </div>
          <a className="flex items-center gap-1 font-label-lg text-label-lg text-primary-container hover:underline" href="#">
            <span>View All LFG (18 Beacons)</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          {/* LFG Card 1: Badminton Doubles */}
          <div className="relative rounded-2xl bg-surface-container-low/75 backdrop-blur-xl p-space-lg shadow-lg flex flex-col justify-between gap-space-md overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary-container/80 via-primary-container/80 to-transparent"></div>
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center font-headline-sm text-headline-sm text-primary font-bold shadow-md">KT</div>
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 rounded-full bg-secondary-container ring-2 ring-surface"></span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-sm text-headline-sm text-on-surface">Kiro Takahashi</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary-container font-label-sm text-label-sm">99% Reliability</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Host • 1,480 Elo Competitive</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="px-2.5 py-1 rounded-full bg-secondary-container/15 text-secondary-fixed font-label-sm text-label-sm font-bold shadow-sm">98.4% Match Affinity</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant mt-1">Based on Court Pace</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-xs p-space-sm rounded-xl bg-surface-container-high/60">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Discipline</span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">sports_tennis</span>
                  Badminton Doubles
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Schedule</span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Tonight, 20:30</span>
                <span className="font-body-sm text-[11px] text-secondary-fixed">Starts in 3h 15m</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Requirement</span>
                <span className="font-label-lg text-label-lg text-primary-container font-semibold">1,200+ Elo Range</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm p-space-sm rounded-xl bg-surface-container-low">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Court Roster: <strong className="text-secondary-fixed font-semibold">1 / 4 Needed</strong></span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm font-bold">K</div>
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm font-bold">A</div>
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm font-bold">J</div>
                  <div className="w-8 h-8 rounded-lg bg-secondary-container/20 text-secondary-container flex items-center justify-center font-label-sm text-label-sm font-bold animate-pulse shadow-[0_0_12px_rgba(52,255,140,0.5)]">
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                  </div>
                </div>
              </div>
              <button className="flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg font-bold hover:brightness-110 shadow-[0_0_20px_rgba(52,255,140,0.4)] transition-all">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                <span>Flash Claim • $5.00</span>
              </button>
            </div>
          </div>

          {/* LFG Card 2: Tennis Singles */}
          <div className="relative rounded-2xl bg-surface-container-low/75 backdrop-blur-xl p-space-lg shadow-lg flex flex-col justify-between gap-space-md overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-container/80 via-tertiary-container/80 to-transparent"></div>
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center font-headline-sm text-headline-sm text-secondary-container font-bold shadow-md">ER</div>
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 rounded-full bg-secondary-container ring-2 ring-surface"></span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-sm text-headline-sm text-on-surface">Elena Rostova</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary-container font-label-sm text-label-sm">97% Reliability</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Host • 1,410 Elo Competitive</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="px-2.5 py-1 rounded-full bg-primary-container/15 text-primary font-label-sm text-label-sm font-bold shadow-sm">95.0% Match Affinity</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant mt-1">Direct Rank Pairing</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-xs p-space-sm rounded-xl bg-surface-container-high/60">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Discipline</span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary-container">sports_baseball</span>
                  Tennis Fast Rally
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Schedule</span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Tomorrow, 08:30</span>
                <span className="font-body-sm text-[11px] text-primary">Morning Kinetic Heat</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Requirement</span>
                <span className="font-label-lg text-label-lg text-primary-container font-semibold">1,350+ Elo Range</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm p-space-sm rounded-xl bg-surface-container-low">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Court Roster: <strong className="text-secondary-fixed font-semibold">1 / 2 Needed (Singles)</strong></span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm font-bold">E</div>
                  <div className="w-8 h-8 rounded-lg bg-secondary-container/20 text-secondary-container flex items-center justify-center font-label-sm text-label-sm font-bold animate-pulse shadow-[0_0_12px_rgba(52,255,140,0.5)]">
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                  </div>
                </div>
              </div>
              <button className="flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg font-bold hover:brightness-110 shadow-[0_0_20px_rgba(52,255,140,0.4)] transition-all">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                <span>Flash Claim • $8.00</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: LIVE VENUE TELEMETRY BAR */}
      <section className="rounded-xl bg-surface-container-low/60 p-space-md flex flex-wrap items-center justify-between gap-space-md shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-container shadow-[0_0_8px_rgba(52,255,140,0.8)]"></span>
            <span className="font-label-md text-label-md text-on-surface">Kinetic Arena - Court Node Live Status</span>
          </div>
          <div className="hidden md:flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
            <span>Court 1: <strong className="text-on-surface">In Play (18-19)</strong></span>
            <span className="text-outline">•</span>
            <span>Court 2: <strong className="text-on-surface">Warmup</strong></span>
            <span className="text-outline">•</span>
            <span>Court 3: <strong className="text-secondary-fixed">Reserved (Your Slot)</strong></span>
            <span className="text-outline">•</span>
            <span>Court 4: <strong className="text-primary-container">Open for Flash</strong></span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm ml-auto">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Air Conditioning: 21°C • Humidity: 48% Optimal</span>
          <button className="p-1 rounded-lg bg-surface-container-high text-on-surface hover:text-primary-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </section>
    </div>
  )
}

export default Dashboard