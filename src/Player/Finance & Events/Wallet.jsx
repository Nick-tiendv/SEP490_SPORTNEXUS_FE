function Wallet() {
  const transactions = [
    { id: '#NX-99302', icon: 'south_east', iconBg: 'bg-error-container/30', iconColor: 'text-error', title: 'Flash Claim Slot - Badminton Arena 3', badge: 'Success', badgeColor: 'text-secondary-container bg-secondary-container/15', time: 'Today, 18:42 • Court #3 Peak Claim • Instant Escrow Debit', amount: '-$5.00', amountColor: 'text-error', sub: 'ID: #NX-99302' },
    { id: '#NX-88291', icon: 'north_west', iconBg: 'bg-secondary-container/20', iconColor: 'text-secondary-container', title: 'Wallet Top-Up - Apple Pay', badge: 'Success', badgeColor: 'text-secondary-container bg-secondary-container/15', time: 'Yesterday, 14:15 • Trans ID #NX-88291 • Direct Gateway', amount: '+$50.00', amountColor: 'text-secondary-container', sub: 'Vault Influx' },
    { id: '#NX-85522', icon: 'call_split', iconBg: 'bg-error-container/30', iconColor: 'text-error', title: 'Split Payment - Kinetic Arena Court 2', badge: 'Success', badgeColor: 'text-secondary-container bg-secondary-container/15', time: 'Oct 24, 2025 • 4-Way Match Split with @alex @sarah • Split Match Settlement', amount: '-$12.50', amountColor: 'text-error', sub: 'Net Share' },
    { id: '#NX-87110', icon: 'credit_card', iconBg: 'bg-secondary-container/20', iconColor: 'text-secondary-container', title: 'Wallet Top-Up - Visa Debit (•••• 4012)', badge: 'Success', badgeColor: 'text-secondary-container bg-secondary-container/15', time: 'Oct 22, 2025 • Trans ID #NX-87110 • Bank Card', amount: '+$100.00', amountColor: 'text-secondary-container', sub: 'Chase Primary' },
    { id: '#NX-81200', icon: 'emoji_events', iconBg: 'bg-error-container/30', iconColor: 'text-error', title: 'Tournament Registration - Fall Open 2025', badge: 'Success', badgeColor: 'text-secondary-container bg-secondary-container/15', time: 'Oct 20, 2025 • Singles Division A • Tournament Escrow', amount: '-$35.00', amountColor: 'text-error', sub: 'Prize Pool Locked' },
    { id: '#NX-79100', icon: 'cyclone', iconBg: 'bg-surface-container-high', iconColor: 'text-surface-tint animate-spin', title: 'Court Rainout Cancellation Refund', badge: 'Processing Node', badgeColor: 'text-surface-tint bg-surface-tint/15 animate-pulse', time: 'Oct 18, 2025 • Automated Weather Clause • Smart Escrow Reversal', amount: '+$18.00', amountColor: 'text-secondary-container', sub: 'Mempool Syncing' },
  ]

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-margin py-space-lg gap-space-xl text-on-surface">

      {/* TOP HEADER */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="space-y-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container">Fintech Subsystem</span>
            <span className="text-on-surface-variant font-label-sm text-label-sm">•</span>
            <span className="font-label-sm text-label-sm text-secondary-container tracking-wider uppercase font-semibold">Ledger Synchronized</span>
          </div>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface font-extrabold tracking-tight">Player Digital Wallet &amp; Escrow</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Instant court settlements, escrow protection, and peer-to-peer split payment ledger backed by smart contracts.
          </p>
        </div>
        <div className="flex items-center gap-space-sm px-space-md py-space-sm bg-surface-container-low rounded-xl shadow-md backdrop-blur-md">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface font-bold tracking-wide flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary-container">verified_user</span>
              256-Bit Escrow Vault Active
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px] leading-none">Protocol v8.4 • 0 Arbitrum Slippage</span>
          </div>
        </div>
      </section>

      {/* HERO CARDS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
        {/* Holographic Card */}
        <div className="lg:col-span-7 flex flex-col justify-between p-space-lg rounded-2xl bg-surface-container-low shadow-xl relative overflow-hidden group">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>
          <div className="relative rounded-2xl p-space-lg bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest text-on-surface shadow-2xl overflow-hidden transition-all duration-300 group-hover:scale-[1.01]">
            <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none mix-blend-overlay" height="100%" width="100%">
              <defs>
                <pattern height="24" id="cardGrid" patternUnits="userSpaceOnUse" width="24">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.8"></path>
                  <circle cx="24" cy="24" fill="currentColor" r="1.2"></circle>
                </pattern>
              </defs>
              <rect fill="url(#cardGrid)" height="100%" width="100%"></rect>
            </svg>
            <div className="relative z-10 flex items-center justify-between pb-space-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-11 h-9 rounded-md bg-gradient-to-tr from-amber-400/90 via-yellow-200 to-amber-500 shadow-inner flex items-center justify-center relative overflow-hidden">
                  <div className="w-full h-[1px] bg-amber-900/40 absolute top-3"></div>
                  <div className="w-full h-[1px] bg-amber-900/40 absolute bottom-3"></div>
                  <div className="h-full w-[1px] bg-amber-900/40 absolute left-3"></div>
                  <div className="h-full w-[1px] bg-amber-900/40 absolute right-3"></div>
                  <div className="w-3 h-2 rounded-[2px] bg-amber-600/30"></div>
                </div>
                <span className="material-symbols-outlined text-primary-fixed-dim text-[24px]">contactless</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="h-2 w-2 rounded-full bg-primary-container"></span>
                <span className="font-headline-sm text-headline-sm tracking-tighter text-on-surface font-extrabold uppercase">SportNexus</span>
                <span className="font-label-sm text-label-sm bg-primary-container/20 text-primary-container px-2 py-0.5 rounded uppercase">Pass</span>
              </div>
            </div>
            <div className="relative z-10 my-space-md space-y-1">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Available Player Liquid Assets</span>
              <div className="flex flex-wrap items-baseline gap-space-md">
                <h2 className="font-display-lg text-display-lg text-on-surface font-black tracking-tight flex items-center">
                  <span className="text-primary-container text-headline-lg font-medium mr-1">$</span>120.00
                </h2>
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary-container bg-secondary-container/10 px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                  +$14.50 pending escrow refund
                </span>
              </div>
            </div>
            <div className="relative z-10 pt-space-lg flex flex-wrap items-end justify-between gap-space-sm">
              <div className="space-y-0.5">
                <p className="font-headline-sm text-headline-sm tracking-widest text-on-surface font-bold font-mono">•••• •••• •••• 8842</p>
                <p className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider font-mono">HOANG AN // ATHLETE ID: NX-9021</p>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase text-[10px]">Exp Date</span>
                <span className="font-label-md text-label-md text-on-surface font-mono font-semibold">12/28</span>
              </div>
            </div>
          </div>
          <div className="mt-space-lg pt-space-md flex flex-wrap items-center justify-between gap-space-sm">
            <button className="flex-1 min-w-[160px] flex items-center justify-center gap-space-xs bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-label-lg text-label-lg px-space-lg py-3.5 rounded-xl transition-all shadow-[0_0_24px_rgba(0,229,255,0.4)] active:scale-[0.98]">
              <span className="material-symbols-outlined text-[20px] font-bold">bolt</span>
              <span>Top-Up Wallet</span>
            </button>
            <div className="flex items-center gap-space-xs flex-wrap">
              <button className="flex items-center gap-1 px-space-md py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-primary">call_split</span>
                <span>Send / Split</span>
              </button>
              <button className="flex items-center gap-1 px-space-md py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-secondary-container">sync</span>
                <span>Auto-Reload (On)</span>
              </button>
              <button className="flex items-center gap-1 px-space-md py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">arrow_outward</span>
                <span>Withdraw</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metrics + Quick Top-Up */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-space-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-space-sm flex-1">
            {[
              { label: 'Monthly Court Spend', value: '$340.00', sub: '14 Match slots secured', icon: 'sports_tennis', valueColor: 'text-on-surface' },
              { label: 'Escrow Locked On-Hold', value: '$24.00', sub: '2 pending tournament matches', icon: 'lock', valueColor: 'text-secondary-container' },
              { label: 'Fairplay Cash Rebates', value: '+$15.20', sub: '5.0 Star Punctuality Index', icon: 'military_tech', valueColor: 'text-primary-fixed-dim' },
            ].map((m) => (
              <div key={m.label} className="p-space-md rounded-2xl bg-surface-container-low flex items-center justify-between shadow-md">
                <div className="space-y-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{m.label}</span>
                  <div className={`font-headline-lg text-headline-lg font-bold ${m.valueColor}`}>{m.value}</div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{m.sub}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">{m.icon}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-space-md rounded-2xl bg-surface-container-low shadow-md space-y-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Instant Express Reload</span>
              <span className="font-label-sm text-label-sm text-primary">Apple Pay Linked</span>
            </div>
            <div className="grid grid-cols-4 gap-space-xs">
              {['+$25', '+$50', '+$100', '+$200'].map((amt) => (
                <button key={amt} className={`py-2.5 rounded-xl font-label-md text-label-md font-semibold transition-all duration-200 text-center shadow-sm ${amt === '+$100' ? 'bg-primary-container/20 text-primary-container hover:bg-primary-container hover:text-on-primary-container' : 'bg-surface-container text-on-surface hover:bg-primary-container hover:text-on-primary-container'}`}>
                  {amt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRANSACTION LEDGER + SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Ledger */}
        <div className="lg:col-span-8 space-y-space-md">
          <div className="p-space-md rounded-2xl bg-surface-container-low shadow-md space-y-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Transaction History Ledger</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Immutable athletic settlement records</p>
              </div>
              <button className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors shadow-sm self-start sm:self-auto">
                <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                <span>Current Billing Cycle (Oct 2025)</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            </div>
            <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
              {['All Transactions', 'Court Bookings', 'Top-Ups', 'Split Reimbursements', 'Refunds'].map((tab, i) => (
                <button key={tab} className={`px-space-md py-1.5 rounded-lg font-label-sm text-label-sm whitespace-nowrap transition-colors ${i === 0 ? 'bg-primary-container text-on-primary-container font-bold shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative flex items-center bg-surface-container-lowest px-space-md py-2 rounded-xl shadow-inner">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-space-xs">search</span>
              <input className="bg-transparent w-full font-body-sm text-body-sm text-on-surface focus:outline-none" type="text" />
            </div>
          </div>

          <div className="space-y-space-xs">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between gap-space-md shadow-sm">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className={`w-10 h-10 rounded-full ${tx.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <span className={`material-symbols-outlined ${tx.iconColor} text-[20px]`}>{tx.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-space-xs flex-wrap">
                      <h4 className="font-label-lg text-label-lg text-on-surface font-bold truncate">{tx.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm ${tx.badgeColor} flex items-center gap-1`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current"></span> {tx.badge}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{tx.time}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`font-headline-sm text-headline-sm font-extrabold tracking-tight ${tx.amountColor}`}>{tx.amount}</div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">{tx.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-space-sm px-space-xs">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Showing 6 of 128 ledger interactions</span>
            <button className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1">
              Load Full Escrow Audit Trail
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-space-md">
          {/* Funding Sources */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low shadow-md space-y-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Funding Sources</h3>
              <button className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">add</span> Add Method
              </button>
            </div>
            <div className="space-y-space-sm">
              {[
                { icon: 'phone_iphone', name: 'Apple Pay', sub: 'Instant 0-gas execution', badge: 'DEFAULT', statusIcon: 'check_circle', statusColor: 'text-secondary-container' },
                { icon: 'token', name: 'Kinetic Smart Pass', sub: 'L2 Gasless Staking Vault', statusIcon: 'more_horiz', statusColor: 'text-on-surface-variant', iconColor: 'text-primary-container' },
                { icon: 'credit_card', name: 'Visa Ending in 4012', sub: 'Expires 09/27', statusIcon: 'more_horiz', statusColor: 'text-on-surface-variant' },
              ].map((m) => (
                <div key={m.name} className="p-space-sm rounded-xl bg-surface-container flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className={`w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center ${m.iconColor || 'text-on-surface'}`}>
                      <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
                    </div>
                    <div>
                      <div className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1.5">
                        {m.name}
                        {m.badge && <span className="font-label-sm text-label-sm bg-primary-container/20 text-primary-container px-1.5 rounded text-[10px]">{m.badge}</span>}
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{m.sub}</span>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined text-[20px] ${m.statusColor}`}>{m.statusIcon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantum Escrow Guard */}
          <div className="p-space-lg rounded-2xl bg-gradient-to-br from-surface-container-low to-surface-container shadow-xl relative overflow-hidden space-y-space-md">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-secondary-container/10 blur-2xl pointer-events-none"></div>
            <div className="flex items-start gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/10 text-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">shield_lock</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Quantum Escrow Guard</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Every court dollar staked is safeguarded in verifiable smart contracts. Rainout cancellations, host no-shows, and split disputes trigger autonomous restitution.
                </p>
              </div>
            </div>
            <div className="p-space-sm rounded-xl bg-surface-container-lowest/80 flex items-center justify-between text-on-surface">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase text-[10px]">Protocol Solvency</span>
                <span className="font-headline-sm text-headline-sm text-secondary-container font-mono font-bold">100% AUDITED</span>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase text-[10px]">Auto-Refund Speed</span>
                <span className="font-headline-sm text-headline-sm text-primary font-mono font-bold">&lt; 120s</span>
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-md text-label-md flex items-center justify-center gap-space-xs transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-primary">download</span>
              <span>Download Oct 2025 Statement (PDF)</span>
            </button>
          </div>

          {/* NFC Widget */}
          <div className="p-space-md rounded-2xl bg-surface-container-low shadow-md flex items-center gap-space-md">
            <img className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-md"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZeQXCVGaWgQQ700143xVVXknG7MgPpCiqhwcfUF-wzQgul-xzHIfS_mbPM1T3CpqmIDfg9QCMgyElPSjsmiJDQiRBuVIE3Ei3kuDCnqTlBKwd1vvRNPqcqlRVgSw4QHB6WQfx-snGCvPd-JC7ZZqYzGZz100CdjmMX6YF0X4jU5i8dtyTMyE7_yWiPDbIz0nGEOZbV5FA801imtHlDqRYXiTiwzAwF__DTQgdeia__mp-_497rZWr"
              alt="NFC turnstile" />
            <div className="space-y-0.5 min-w-0">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">NFC Smart Turnstile</span>
              <p className="font-label-md text-label-md text-on-surface font-bold truncate">Instant Turnstile Unlocking</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Tap phone at 42 affiliated club turnstiles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Wallet
