function Profile() {
  return (
    <div className="w-full px-margin md:px-margin-lg py-space-lg flex flex-col gap-space-xl max-w-[1600px] mx-auto">

      {/* Top Identity / Profile Kinetic Hub */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">

        {/* Athlete Profile Hero Card */}
        <div className="xl:col-span-4 flex flex-col justify-between bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-lg shadow-xl relative overflow-hidden group">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>
          <div className="flex flex-col gap-space-md relative z-10">
            <div className="flex items-start justify-between">
              <div className="relative">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary-container via-surface-bright to-secondary-container shadow-[0_0_24px_rgba(0,229,255,0.4)]">
                  <img className="w-full h-full rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaL9m0aF6p6ZCDAVXgtv5GGbcHB6YqWM64qr2CH2Xj7oiT-krG10srAIkhmT1e3yWXTMzHpp-1AkCZz0LU8M_wQphD11H-5DC3z-5vev8pDQ37OuKK9oGLbnhqdrKF1JxnZopn9-AYatwpWArVfIZtPSHr2H0wtcfYgbog1vW465emENxgE8T8aUuXQ0xKV5be_JvJig9pqgNQ1Bs1MfYhU-kZDR8IqlNtYe7rcx4EK8FiKRYEK7sI"
                    alt="Hoang An athlete portrait"
                  />
                </div>
                <span className="absolute bottom-0 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-lowest text-secondary-container shadow-[0_0_12px_#34ff8c]">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-space-sm py-0.5 rounded-full bg-primary-container/10 text-primary-container font-label-sm text-label-sm tracking-wider uppercase shadow-[0_0_12px_rgba(0,229,255,0.2)]">Division Gold II</span>
                <span className="text-on-surface-variant font-label-sm text-label-sm tracking-widest uppercase">Regional Seed #14</span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">Hoang An</h1>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">VN // APAC</span>
              </div>
              <p className="font-body-md text-body-md text-primary-container">@hoangan_smash</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-secondary-container">history_toggle_off</span>
                Active Athlete since Jan 2024 • Verified Kinetic ID: 884-KX
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-space-md mt-space-md bg-surface-container-lowest/60 rounded-lg p-space-sm relative z-10">
            <div className="flex flex-col items-center justify-center text-center">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">142</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Matches</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="font-headline-sm text-headline-sm text-secondary-container font-bold">68.4%</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Win Rate</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="font-headline-sm text-headline-sm text-primary-container font-bold">5</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Cups</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center text-secondary-container">
                <span className="font-headline-sm text-headline-sm font-bold">4W</span>
                <span className="material-symbols-outlined text-xs ml-0.5">local_fire_department</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Streak</span>
            </div>
          </div>
        </div>

        {/* Circular Radial Performance Gauges */}
        <div className="xl:col-span-4 flex flex-col md:flex-row xl:flex-col gap-space-md">
          {/* Elo Rating Gauge */}
          <div className="flex-1 bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-md flex items-center justify-between shadow-lg relative overflow-hidden">
            <div className="flex flex-col gap-1 z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#00e5ff]"></span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Global Rating Matrix</span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-bold">Badminton Elo</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-primary-container/10 text-primary-container font-label-md text-label-md">Top 8% Global</span>
                <span className="font-body-sm text-body-sm text-secondary-container flex items-center font-semibold">
                  <span className="material-symbols-outlined text-sm">trending_up</span>+65 this week
                </span>
              </div>
            </div>
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-surface-container" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-primary-container transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="69.0" strokeLinecap="round" strokeWidth="8"></circle>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">1450</span>
                <span className="font-label-sm text-label-sm text-primary-container uppercase">ELO</span>
              </div>
            </div>
          </div>
          {/* Fairplay Score Gauge */}
          <div className="flex-1 bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-md flex items-center justify-between shadow-lg relative overflow-hidden">
            <div className="flex flex-col gap-1 z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_8px_#34ff8c]"></span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Kinetic Sportsmanship</span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-bold">Fairplay Score</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-secondary-container/10 text-secondary-container font-label-md text-label-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">shield</span>Prime Conduct
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Zero Violations</span>
              </div>
            </div>
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-surface-container" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-secondary-container transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="12.5" strokeLinecap="round" strokeWidth="8"></circle>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">95</span>
                <span className="font-label-sm text-label-sm text-secondary-container uppercase">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Athletic Radar Chart */}
        <div className="xl:col-span-4 bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-md shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-lg">radar</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Athletic Radar</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">6-Axis Telemetry</span>
          </div>
          <div className="relative w-full aspect-square max-h-[220px] flex items-center justify-center">
            <svg className="w-full h-full drop-shadow-[0_0_12px_rgba(0,229,255,0.25)]" viewBox="0 0 320 300">
              <defs>
                <linearGradient id="radarGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.55"></stop>
                  <stop offset="100%" stopColor="#34ff8c" stopOpacity="0.35"></stop>
                </linearGradient>
              </defs>
              <polygon className="text-outline-variant/40" fill="none" points="160,50 245,100 245,200 160,250 75,200 75,100" stroke="currentColor" strokeWidth="1"></polygon>
              <polygon className="text-outline-variant/30" fill="none" points="160,70 227,110 227,190 160,230 93,190 93,110" stroke="currentColor" strokeWidth="1"></polygon>
              <polygon className="text-outline-variant/20" fill="none" points="160,90 210,120 210,180 160,210 110,180 110,120" stroke="currentColor" strokeWidth="1"></polygon>
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" x1="160" x2="160" y1="150" y2="50"></line>
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" x1="160" x2="245" y1="150" y2="100"></line>
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" x1="160" x2="245" y1="150" y2="200"></line>
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" x1="160" x2="160" y1="150" y2="250"></line>
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" x1="160" x2="75" y1="150" y2="200"></line>
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" x1="160" x2="75" y1="150" y2="100"></line>
              <polygon className="transition-all duration-700" fill="url(#radarGrad)" points="160,62 240,103 230,191 160,240 87,193 82,104" stroke="#00e5ff" strokeWidth="2.5"></polygon>
              <circle className="fill-primary-container" cx="160" cy="62" r="3.5"></circle>
              <circle className="fill-secondary-container" cx="240" cy="103" r="3.5"></circle>
              <circle className="fill-primary-container" cx="230" cy="191" r="3.5"></circle>
              <circle className="fill-secondary-container" cx="160" cy="240" r="3.5"></circle>
              <circle className="fill-primary-container" cx="87" cy="193" r="3.5"></circle>
              <circle className="fill-secondary-container" cx="82" cy="104" r="3.5"></circle>
              <text className="fill-on-surface font-bold" fontSize="11" textAnchor="middle" x="160" y="38">SMASH 88</text>
              <text className="fill-secondary-container font-semibold" fontSize="10" textAnchor="start" x="252" y="98">AGILITY 94</text>
              <text className="fill-on-surface-variant" fontSize="10" textAnchor="start" x="252" y="208">NET 82</text>
              <text className="fill-on-surface font-semibold" fontSize="11" textAnchor="middle" x="160" y="272">STAMINA 90</text>
              <text className="fill-on-surface-variant" fontSize="10" textAnchor="end" x="68" y="208">TACTICS 86</text>
              <text className="fill-primary-container font-semibold" fontSize="10" textAnchor="end" x="68" y="98">REACTION 92</text>
            </svg>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-2">
            <span className="font-body-sm text-body-sm">Calibrated via Arena OptoTrackers</span>
            <span className="font-label-sm text-label-sm text-primary-container uppercase font-semibold">Top Decile</span>
          </div>
        </div>
      </div>

      {/* Match History & Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Primary Match Feed (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-low/80 backdrop-blur-xl p-space-sm rounded-xl">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button className="px-space-md py-1.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)]">All Matches</button>
              <button className="px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md whitespace-nowrap">Badminton Singles</button>
              <button className="px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md whitespace-nowrap">Badminton Doubles</button>
              <button className="px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md whitespace-nowrap">Tournament Ranked</button>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-sm">search</span>
                <input className="bg-surface-container-highest/60 text-on-surface placeholder:text-on-surface-variant/60 text-body-sm font-body-sm pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-container w-44 sm:w-52" placeholder="Search opponent or court..." type="text" />
              </div>
              <button className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-base">tune</span>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between px-1">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Recent Matches &amp; Verified Telemetry</h2>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Showing 5 of 142 Recorded</span>
          </div>

          {/* Match Cards */}
          <div className="flex flex-col gap-space-sm">
            {/* Match 1 - WIN */}
            {[
              { name: 'Marcus Vance', rank: '#18', elo: 1420, date: 'Today, 18:30 • Kinetic Arena Court 3', type: 'Singles Ranked', result: 'WIN', score: '21-18, 19-21, 21-16', elo_change: '+12', color: 'secondary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPHIoH-pnmdZU-mmWT6F0A6xdwbVLDGNblSMzMAYkemdfGkv7Q8Gayt-O3eMVK9mbYcf4CF8uCHNackSX9Pv2xcKeQRuj1YHvOdDIGJ38NJBfCwC-bZcZCGkAzAsWYmY04brpcKcRuhhI0e4Cn-4XykX_CEShnLk0bRQTzr_Es3zHcqAOKzIHeuf0kVglYvxofBc6I5A9aNlVNjVB_va4V84vSVCwdEf7LJshZsvS6GCVb3Iz6u-Z3', btnLabel: 'Replay & Telemetry' },
              { name: 'Elena Rostova', rank: '#11', elo: 1485, date: 'Yesterday, 20:15 • Metro Badminton Hub', type: 'Singles Ranked', result: 'WIN', score: '21-19, 21-14', elo_change: '+18', color: 'secondary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp4igp4V13LoP_jedcQfAjWW7dOVQxwy9Z0FvUgHbYxg32lcnHDqvHj0q_kK5PpWSUoWfC1qOzDpfg6Pqsgp5jt8yvLX1dBPSrWhg60AHG7jGh5cAyyygYHXcHan1iz19iHCjIrWxbAI8GddVFK3DGRzn5CnmudxjS9Zk36L2Ven8IAG8iZjEjfrB7cl2Rpv_FKodNzO4KL6HhDGIHOGtjvnLNs_EMevZSA0qK08r07g-GRZIsooOs', btnLabel: 'View Stats' },
            ].map((m) => (
              <div key={m.name} className="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-md shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high/60 transition-all">
                <div className="flex items-center gap-space-md">
                  <div className="relative">
                    <img className="w-12 h-12 rounded-full object-cover" src={m.img} alt={m.name} />
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface-container-lowest text-primary-container text-[10px]">{m.rank}</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold leading-tight">{m.name}</span>
                      <span className="text-on-surface-variant font-label-sm text-label-sm">Elo {m.elo}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{m.date}</span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary-container font-label-sm text-label-sm">{m.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-space-lg">
                  <div className="flex flex-col items-start md:items-end">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/15 text-secondary-container font-label-md text-label-md font-bold uppercase shadow-[0_0_10px_rgba(52,255,140,0.2)]">WIN</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">{m.score}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-label-md text-label-md text-secondary-container font-bold flex items-center">
                        <span className="material-symbols-outlined text-sm">arrow_upward</span>{m.elo_change} ELO
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-secondary-container">verified_user</span>Settled
                      </span>
                    </div>
                  </div>
                  <button className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label-md text-label-md font-semibold transition-all whitespace-nowrap">{m.btnLabel}</button>
                </div>
              </div>
            ))}

            {/* Match 3 - LOSS */}
            <div className="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-space-md shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-high/60 transition-all">
              <div className="flex items-center gap-space-md">
                <div className="relative">
                  <img className="w-12 h-12 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9e-QLDVmA2AG-cEBZVe1aL2NvvCVxEUtBdE7lTGU-wdR7NiWHu9Z-6etbcwMCQ_5xswURuDK-RWXb9pPEoMLdKrmfZIrJUtL89QZs4xfgUdAsUU0be5CTrUrTWRrLohb9FMVApGpZCnOK9yipjTX7NXQ94kbdVZbWrsa6waMxki-coaZ5mLbWxwNgsOgM6jBgRuciFwJKKz0Hlw0at4XjYYjE44VIcO2c7lUaFTiM9hPVRLQrD-IX"
                    alt="Daisuke Tanaka" />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface-container-lowest text-primary-container text-[10px]">#07</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold leading-tight">Daisuke Tanaka</span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm">Elo 1510</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Oct 12, 17:00 • Nexus Prime Court 1</span>
                    <span className="px-1.5 py-0.5 rounded bg-tertiary-container/20 text-tertiary-fixed-dim font-label-sm text-label-sm">Tournament Semis</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-space-lg">
                <div className="flex flex-col items-start md:items-end">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-error-container/40 text-error font-label-md text-label-md font-bold uppercase">LOSS</span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">18-21, 21-17, 19-21</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-label-md text-label-md text-error font-bold flex items-center">
                      <span className="material-symbols-outlined text-sm">arrow_downward</span>-8 ELO
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-primary-container">gavel</span>BWF Standard
                    </span>
                  </div>
                </div>
                <button className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface font-label-md text-label-md font-semibold transition-all whitespace-nowrap">Match Analysis</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Analytics Sidebar (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Elo Trajectory Chart */}
          <div className="bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-lg shadow-xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">show_chart</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Elo Trajectory</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container text-secondary-container font-label-sm text-label-sm font-semibold">+65 Net</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">7-day competitive rating momentum based on verified matches.</p>
            <div className="h-32 w-full flex items-end justify-between gap-2 pt-4 px-1">
              {[
                { day: 'Mon', h: '48%', color: 'bg-surface-container' },
                { day: 'Tue', h: '60%', color: 'bg-surface-container' },
                { day: 'Wed', h: '52%', color: 'bg-surface-container' },
                { day: 'Thu', h: '75%', color: 'bg-surface-container' },
                { day: 'Fri', h: '68%', color: 'bg-surface-container' },
                { day: 'Sat', h: '86%', color: 'bg-secondary-container/80 shadow-[0_0_10px_#34ff8c]' },
                { day: 'Today', h: '94%', color: 'bg-primary-container shadow-[0_0_12px_#00e5ff]' },
              ].map(({ day, h, color }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className={`w-full rounded-t transition-all ${color}`} style={{ height: h }}></div>
                  <span className={`font-label-sm text-label-sm ${day === 'Today' ? 'text-primary-container font-bold' : day === 'Sat' ? 'text-secondary-container font-bold' : 'text-on-surface-variant'}`}>{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Venue Dominance */}
          <div className="bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-md shadow-xl flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-2xl">stadium</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Dominant Ground</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Kinetic Arena</span>
                <span className="font-body-sm text-body-sm text-secondary-container">64% of total matches played</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-surface-container-high text-primary-container font-label-md text-label-md font-semibold">Home Court</span>
          </div>

          {/* Rival Encounter */}
          <div className="bg-surface-container-low/90 backdrop-blur-2xl rounded-xl p-space-md shadow-xl flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary-container">
                <span className="material-symbols-outlined text-2xl">swords</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Most Frequent Rival</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Marcus Vance</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">5 Encounters • 4W - 1L Head-to-Head</span>
              </div>
            </div>
            <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>

          {/* Challenge CTA */}
          <div className="bg-gradient-to-br from-surface-container to-surface-container-lowest rounded-xl p-space-md shadow-xl flex flex-col gap-space-sm relative overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
              <span className="font-label-sm text-label-sm text-primary-container uppercase font-bold tracking-wider">Instant Queue Ready</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Issue Open Arena Challenge</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Dispatch an algorithmic open match invitation to players within +/-50 Elo range at Kinetic Arena.</p>
            <button className="mt-2 w-full py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">bolt</span>
              Deploy Match Beacon
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
