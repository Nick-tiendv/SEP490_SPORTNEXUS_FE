import { useNavigate } from 'react-router-dom'

function TournamentList() {
  const navigate = useNavigate()

  const tournaments = [
    {
      id: 'TRN-001',
      name: 'Fall Open Championship 2025',
      sport: 'Badminton',
      type: 'Singles & Doubles',
      status: 'Registration Open',
      statusColor: 'text-secondary-container bg-secondary-container/15 shadow-[0_0_12px_rgba(52,255,140,0.25)]',
      date: 'Nov 15-17, 2025',
      venue: 'Kinetic Central Stadium',
      players: '128',
      prizePool: '$5,000',
      entryFee: '$35',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKWNpoUp2khbpM-VNOJLoJqoNoM1bShmlJOwAkm4PLZhi2KskMhAHyAoDYQJUEfnk9Rgqk-lCzV_5ncwSDfYyLzmKqeFxjVrnS_bqaUTf4vcV9ge5hHJm9sWou5IQEBGGNBqAxX3BoGMdekbfk6dJgYTH6Oio9T4wKydQHZWx2oASoOB31huQeueZm5hcTKV2XN4ATnKOMQWHwLt_b6GIXAAC8xQWSta2NcjV-DXyKlW_NlARAsjql',
      registered: true,
    },
    {
      id: 'TRN-002',
      name: 'S4 Regional Qualifier',
      sport: 'Badminton',
      type: 'Singles Ranked',
      status: 'In Progress',
      statusColor: 'text-primary-container bg-primary-container/15 shadow-[0_0_12px_rgba(0,229,255,0.25)]',
      date: 'Oct 28-29, 2025',
      venue: 'Metro Badminton Hub',
      players: '64',
      prizePool: '$2,500',
      entryFee: '$25',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKWNpoUp2khbpM-VNOJLoJqoNoM1bShmlJOwAkm4PLZhi2KskMhAHyAoDYQJUEfnk9Rgqk-lCzV_5ncwSDfYyLzmKqeFxjVrnS_bqaUTf4vcV9ge5hHJm9sWou5IQEBGGNBqAxX3BoGMdekbfk6dJgYTH6Oio9T4wKydQHZWx2oASoOB31huQeueZm5hcTKV2XN4ATnKOMQWHwLt_b6GIXAAC8xQWSta2NcjV-DXyKlW_NlARAsjql',
      registered: false,
    },
    {
      id: 'TRN-003',
      name: 'Kinetic Tennis Masters',
      sport: 'Tennis',
      type: 'Singles & Doubles',
      status: 'Registration Open',
      statusColor: 'text-secondary-container bg-secondary-container/15 shadow-[0_0_12px_rgba(52,255,140,0.25)]',
      date: 'Dec 5-7, 2025',
      venue: 'CyberTurf Arena',
      players: '256',
      prizePool: '$10,000',
      entryFee: '$50',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKWNpoUp2khbpM-VNOJLoJqoNoM1bShmlJOwAkm4PLZhi2KskMhAHyAoDYQJUEfnk9Rgqk-lCzV_5ncwSDfYyLzmKqeFxjVrnS_bqaUTf4vcV9ge5hHJm9sWou5IQEBGGNBqAxX3BoGMdekbfk6dJgYTH6Oio9T4wKydQHZWx2oASoOB31huQeueZm5hcTKV2XN4ATnKOMQWHwLt_b6GIXAAC8xQWSta2NcjV-DXyKlW_NlARAsjql',
      registered: false,
    },
    {
      id: 'TRN-004',
      name: 'Winter Invitational Pro League',
      sport: 'Badminton',
      type: 'Doubles Invitational',
      status: 'Completed',
      statusColor: 'text-on-surface-variant bg-surface-container-high',
      date: 'Oct 10-12, 2025',
      venue: 'Nexus Prime Court',
      players: '32',
      prizePool: '$3,000',
      entryFee: '$40',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKWNpoUp2khbpM-VNOJLoJqoNoM1bShmlJOwAkm4PLZhi2KskMhAHyAoDYQJUEfnk9Rgqk-lCzV_5ncwSDfYyLzmKqeFxjVrnS_bqaUTf4vcV9ge5hHJm9sWou5IQEBGGNBqAxX3BoGMdekbfk6dJgYTH6Oio9T4wKydQHZWx2oASoOB31huQeueZm5hcTKV2XN4ATnKOMQWHwLt_b6GIXAAC8xQWSta2NcjV-DXyKlW_NlARAsjql',
      registered: true,
    },
  ]

  return (
    <div className="flex flex-col w-full px-space-lg py-space-lg gap-space-xl relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-80 right-0 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <section className="relative rounded-2xl bg-surface-container-low/70 backdrop-blur-xl p-space-lg shadow-xl overflow-hidden flex flex-col gap-space-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-secondary-container to-transparent"></div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-6">
          <span className="material-symbols-outlined text-[160px] text-primary">emoji_events</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
              </span>
              <span className="font-label-sm text-label-sm text-secondary-container uppercase tracking-wider">Live Tournament Network</span>
            </div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
              Tournament <span className="bg-gradient-to-r from-primary-container via-secondary-container to-secondary-fixed bg-clip-text text-transparent">Arena</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Compete in ranked tournaments, track brackets live, and win prize pools backed by smart escrow.
            </p>
          </div>
          <div className="flex items-center gap-space-sm">
            <button className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-container-highest transition-all shadow-md">
              <span className="material-symbols-outlined text-[20px] text-primary-container">filter_list</span>
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg hover:brightness-110 transition-all shadow-[0_0_24px_rgba(0,229,255,0.45)]">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Create Tournament</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-space-sm">
          {[
            { icon: 'emoji_events', label: '24 Active Tournaments', color: 'text-primary-container' },
            { icon: 'groups', label: '1,248 Competitors Enrolled', color: 'text-secondary-container' },
            { icon: 'payments', label: '$48,500 Total Prize Pools', color: 'text-secondary-fixed' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
              <span className={`material-symbols-outlined text-[14px] ${s.color}`}>{s.icon}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center gap-space-xs overflow-x-auto">
        {['All Tournaments', 'Open Registration', 'In Progress', 'My Tournaments', 'Completed'].map((tab, i) => (
          <button key={tab} className={`px-space-md py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${i === 0 ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)]' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tournament Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {tournaments.map((t) => (
          <div key={t.id} className="relative rounded-2xl bg-surface-container-low/80 backdrop-blur-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
            {/* Cover Image */}
            <div className="relative h-36 overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={t.img} alt={t.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent"></div>
              <div className="absolute top-space-sm right-space-sm">
                <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1 ${t.statusColor}`}>
                  {t.status === 'In Progress' && <span className="animate-ping w-1.5 h-1.5 rounded-full bg-current"></span>}
                  {t.status}
                </span>
              </div>
              {t.registered && (
                <div className="absolute top-space-sm left-space-sm">
                  <span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-secondary-container text-on-secondary-container font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Registered
                  </span>
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="p-space-lg flex flex-col gap-space-md">
              <div>
                <div className="flex items-center gap-space-xs mb-1">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">{t.sport}</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">{t.type}</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">{t.name}</h2>
                <div className="flex items-center gap-space-xs mt-1 text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[14px] text-primary-container">pin_drop</span>
                  <span>{t.venue} • {t.date}</span>
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-space-sm">
                {[
                  { label: 'Players', value: t.players, icon: 'groups' },
                  { label: 'Prize Pool', value: t.prizePool, icon: 'payments' },
                  { label: 'Entry Fee', value: t.entryFee, icon: 'account_balance_wallet' },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col p-space-sm rounded-xl bg-surface-container-high/70">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-primary-container">{s.icon}</span>
                      {s.label}
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="flex items-center gap-space-sm">
                {t.registered ? (
                  <button className="flex-1 flex items-center justify-center gap-space-xs py-space-sm rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-container-highest transition-all" onClick={() => navigate('/qr-pass')}>
                    <span className="material-symbols-outlined text-[20px] text-primary-container">qr_code_2</span>
                    <span>View My Pass</span>
                  </button>
                ) : (
                  <button className="flex-1 flex items-center justify-center gap-space-xs py-space-sm rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                    <span className="material-symbols-outlined text-[20px]">emoji_events</span>
                    <span>Register Now</span>
                  </button>
                )}
                <button className="p-space-sm rounded-xl bg-surface-container-high text-on-surface-variant hover:text-primary-container hover:bg-surface-container-highest transition-all">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TournamentList
