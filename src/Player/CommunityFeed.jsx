function CommunityFeed() {
  const posts = [
    {
      id: 1,
      user: 'Kiro Takahashi',
      handle: '@kiro_smash',
      elo: '1480 Elo',
      time: '2 hours ago',
      content: 'Just dominated 3 matches back to back at Kinetic Arena! The new court lighting system is absolutely insane 🔥 Who wants to join for a doubles session tomorrow evening?',
      img: null,
      likes: 48,
      comments: 12,
      reliability: '99%',
    },
    {
      id: 2,
      user: 'Elena Rostova',
      handle: '@elena_rally',
      elo: '1485 Elo',
      time: '5 hours ago',
      content: 'PSA: Metro Badminton Hub just upgraded their court surface to Synthetic Hydro-Cushion Pro. Tested it yesterday — zero knee impact, phenomenal shuttle response. Highly recommended for serious players.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp4igp4V13LoP_jedcQfAjWW7dOVQxwy9Z0FvUgHbYxg32lcnHDqvHj0q_kK5PpWSUoWfC1qOzDpfg6Pqsgp5jt8yvLX1dBPSrWhg60AHG7jGh5cAyyygYHXcHan1iz19iHCjIrWxbAI8GddVFK3DGRzn5CnmudxjS9Zk36L2Ven8IAG8iZjEjfrB7cl2Rpv_FKodNzO4KL6HhDGIHOGtjvnLNs_EMevZSA0qK08r07g-GRZIsooOs',
      likes: 127,
      comments: 34,
      reliability: '97%',
    },
    {
      id: 3,
      user: 'Daisuke Tanaka',
      handle: '@daisuke_pro',
      elo: '1510 Elo',
      time: '1 day ago',
      content: 'Fall Open Tournament bracket just dropped. First round pairings are brutal — I\'m facing the regional #3 seed. This is going to be an epic battle. See you on the court 🏸',
      img: null,
      likes: 89,
      comments: 28,
      reliability: '98%',
    },
  ]

  const lfgSlots = [
    { sport: 'Badminton Doubles', host: 'Kiro T.', time: 'Tonight 20:30', filled: 3, total: 4, price: '$5.00' },
    { sport: 'Tennis Singles', host: 'Elena R.', time: 'Tomorrow 08:30', filled: 1, total: 2, price: '$8.00' },
    { sport: 'Pickleball 4v4', host: 'Chen W.', time: 'Sunday 10:00', filled: 2, total: 8, price: '$4.00' },
  ]

  return (
    <div className="flex flex-col w-full px-space-lg py-space-lg gap-space-xl relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-80 right-0 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <section className="relative rounded-2xl bg-surface-container-low/70 backdrop-blur-xl p-space-lg shadow-xl overflow-hidden flex flex-col gap-space-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary-container via-primary-container to-transparent"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs mb-1">
              <span className="w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_8px_#34ff8c] animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-secondary-container uppercase tracking-wider">Live Community Feed</span>
            </div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
              Kinetic <span className="bg-gradient-to-r from-primary-container via-secondary-container to-secondary-fixed bg-clip-text text-transparent">Network</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Connect with players, share results, and find your next match partner.</p>
          </div>
          <button className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg hover:brightness-110 transition-all shadow-[0_0_24px_rgba(0,229,255,0.45)]">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Post Update</span>
          </button>
        </div>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-space-sm mt-2">
          {[
            { icon: 'groups', label: '2,847 Players Online', color: 'text-secondary-container' },
            { icon: 'sports_tennis', label: '142 Active Courts', color: 'text-primary-container' },
            { icon: 'bolt', label: '38 LFG Beacons', color: 'text-secondary-fixed' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
              <span className={`material-symbols-outlined text-[14px] ${s.color}`}>{s.icon}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Posts Feed */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          {/* Filter */}
          <div className="flex items-center gap-space-xs overflow-x-auto">
            {['All', 'My Network', 'Trending', 'Tournaments', 'LFG'].map((tab, i) => (
              <button key={tab} className={`px-space-md py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${i === 0 ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)]' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Post Cards */}
          {posts.map((post) => (
            <div key={post.id} className="relative rounded-2xl bg-surface-container-low/80 backdrop-blur-xl p-space-lg shadow-lg overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-container/50 via-secondary-container/50 to-transparent"></div>
              <div className="flex items-start gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center font-headline-sm text-headline-sm text-primary font-bold shadow-md shrink-0">
                  {post.user.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-space-sm">
                    <div>
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{post.user}</span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary-container font-label-sm text-label-sm">{post.reliability} Reliability</span>
                      </div>
                      <div className="flex items-center gap-space-xs mt-0.5">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{post.handle}</span>
                        <span className="text-outline">•</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{post.elo}</span>
                        <span className="text-outline">•</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{post.time}</span>
                      </div>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface mt-space-sm">{post.content}</p>
                  {post.img && (
                    <div className="mt-space-sm rounded-xl overflow-hidden">
                      <img className="w-full h-48 object-cover" src={post.img} alt="post" />
                    </div>
                  )}
                  <div className="flex items-center gap-space-md mt-space-md pt-space-sm border-t border-outline-variant/30">
                    <button className="flex items-center gap-1 text-on-surface-variant hover:text-secondary-container transition-colors font-label-md text-label-md">
                      <span className="material-symbols-outlined text-[18px]">favorite_border</span>
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary-container transition-colors font-label-md text-label-md">
                      <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary-container transition-colors font-label-md text-label-md">
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      <span>Share</span>
                    </button>
                    <button className="ml-auto flex items-center gap-space-xs px-space-md py-1.5 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-label-md hover:brightness-110 shadow-[0_0_12px_rgba(52,255,140,0.3)] transition-all">
                      <span className="material-symbols-outlined text-[16px]">bolt</span>
                      <span>Challenge</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* LFG Beacons */}
          <div className="rounded-2xl bg-surface-container-low/80 backdrop-blur-xl p-space-lg shadow-lg">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary-container text-[20px]">podium</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">LFG Beacons</h2>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">38 Active</span>
            </div>
            <div className="flex flex-col gap-space-sm">
              {lfgSlots.map((slot) => (
                <div key={slot.sport} className="p-space-sm rounded-xl bg-surface-container-high/60 flex items-center justify-between gap-space-sm">
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold">{slot.sport}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{slot.host} • {slot.time}</span>
                    <span className="font-label-sm text-label-sm text-secondary-container mt-0.5">{slot.filled}/{slot.total} filled</span>
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary-container text-on-secondary-container font-label-md text-label-md hover:brightness-110 shadow-[0_0_10px_rgba(52,255,140,0.4)] transition-all shrink-0">
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    <span>{slot.price}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Top Players */}
          <div className="rounded-2xl bg-surface-container-low/80 backdrop-blur-xl p-space-lg shadow-lg">
            <div className="flex items-center gap-space-xs mb-space-md">
              <span className="material-symbols-outlined text-primary-container text-[20px]">leaderboard</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Top Players This Week</h2>
            </div>
            <div className="flex flex-col gap-space-sm">
              {[
                { rank: 1, name: 'Daisuke Tanaka', elo: 1510, wins: 8, color: 'text-primary-container' },
                { rank: 2, name: 'Elena Rostova', elo: 1485, wins: 7, color: 'text-secondary-container' },
                { rank: 3, name: 'Kiro Takahashi', elo: 1480, wins: 6, color: 'text-tertiary-fixed-dim' },
                { rank: 4, name: 'Hoang An', elo: 1450, wins: 5, color: 'text-on-surface' },
              ].map((p) => (
                <div key={p.rank} className="flex items-center gap-space-sm p-space-xs rounded-lg hover:bg-surface-container-high/60 transition-colors">
                  <span className={`font-label-lg text-label-lg font-bold w-6 text-center ${p.color}`}>#{p.rank}</span>
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-label-md text-label-md text-on-surface font-bold">
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <span className="font-label-lg text-label-lg text-on-surface">{p.name}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant block">{p.elo} Elo • {p.wins}W this week</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityFeed
