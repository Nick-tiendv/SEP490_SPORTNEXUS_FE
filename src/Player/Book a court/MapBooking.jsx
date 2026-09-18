import { useNavigate } from 'react-router-dom'

function MapBooking() {
  const navigate = useNavigate()

  const courts = [
    {
      id: 1,
      name: 'Kinetic Arena',
      rating: 4.8,
      reviews: 342,
      location: 'Courts 3 & 4 • Sector 4, Metro Downtown',
      distance: '2.5 km away',
      price: 15,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC8UZexi28kOzki75_NsHQQKSceyQwyJlX7nIZrZ-xjvJ-NUl_eA4NKqqhGYviTDACEhk4TSNRRRQOtc5qDglqUcUdpjQ4wic81EBy7JhtBySugbJP0u124e6rnbPFic_vw4bOFefd5_J0B5wBzoMGXg6_H2qYF28LnjWSdxvH1f6nKCXfxchSuphBgbEKwXqQEV8zC3sQHeDVUtf_15VZjnPNwlcG7F9rmoWewp1gd2Ykc81LnGeh',
      tag: 'BWF Gr.1',
      amenities: [
        { icon: 'ac_unit', text: 'Climate Control A/C' },
        { icon: 'lock', text: 'Locker #L-42' },
        { icon: 'sensors', text: 'Smart Line Sensor' },
      ],
      nextSlot: '19:00 - 20:00',
      active: true,
      surge: false,
    },
    {
      id: 2,
      name: 'Metro Smash Hub',
      rating: 4.9,
      reviews: 189,
      location: 'Olympic Hall • Olympic Sports Park',
      distance: '3.4 km away',
      price: 18,
      oldPrice: 15,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeIuCDQG6J-x2xKF2n05NBQY00pbcVkPlihkySe38d44Qe0qWkNeyNvZoWnoo0fsfS97PN0csyYI0YMp7vB2l038WkqLZyrZdW23ionGMN3Qy2C2bTGzm02yxI53Mn6Y6fJJRB-rwV42LkK225O1S5KyiJ2IBbhvBZ8rBac7pwM_KzMgOWe2V_MsL8jorFEruO2MRv0kid-pMknm1xS6H7BoIqLZrLrAVVDMQEESvQYAMlckQK1JJp',
      tag: '+20% Peak',
      surge: true,
      nextSlot: '2 courts left for 20:00',
    },
    {
      id: 3,
      name: 'Apex Racquet Club',
      rating: 4.7,
      reviews: 95,
      location: 'Hall B • Central District',
      distance: '1.8 km away',
      price: 14,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV7FkfhLzwVdJF3JGN79vB6iD7rTZePkyWWqdhMHhTWnTUyBbFLNYNX2jIxg7mzADm-Qspltny2wWT3nX-IgIBzoNCgsiPwvhsWfmNhYzNKt6DMCw0BhNKidDYt0wJmfc0uCAxUo-DFgLSdGxhrJ5gQoH_siXU6MODpgYR76rXW8-hrz40coq74EVtiUhUyudXHK8ragHqq4tTKgs8FpqEejruolWRIQSjHSzRpoyp8VetU6qbtAf1',
      tag: '1 Slot Left',
      urgency: true,
      nextSlot: 'Slot: 18:30 - 19:30',
    },
  ]

  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-4rem)] overflow-hidden bg-surface relative">
      {/* LEFT PANEL: Court Directory */}
      <aside className="w-full lg:w-[44%] xl:w-[42%] h-full flex flex-col bg-surface-container-lowest border-r border-outline-variant/20 shadow-2xl relative z-10 shrink-0">
        <div className="p-margin-sm md:p-margin pb-space-sm bg-surface-container-low/95 backdrop-blur-xl border-b border-outline-variant/15 flex flex-col gap-space-sm shrink-0">
          <div className="relative flex items-center group">
            <span className="material-symbols-outlined absolute left-space-md text-on-surface-variant group-focus-within:text-primary-container transition-colors text-[20px]">search</span>
            <input className="w-full pl-11 pr-20 py-space-sm bg-surface-container-highest/60 rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-high transition-all shadow-inner" placeholder="Search courts, arenas (e.g. Kinetic Arena)..." type="text" defaultValue="Kinetic Arena, Downtown" />
            <div className="absolute right-space-sm flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm border border-outline-variant/30">
              <span>⌘</span><span>K</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1 text-on-surface">
            <button className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-all shrink-0">
              <span className="material-symbols-outlined text-primary-container text-[16px]">calendar_today</span>
              <span>Today, Oct 22</span>
            </button>
            <button className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-secondary-container/15 text-secondary-fixed font-label-md text-label-md shadow-[0_0_12px_rgba(52,255,140,0.25)] shrink-0">
              <span className="material-symbols-outlined text-[16px]">sports_tennis</span>
              <span>Badminton</span>
            </button>
            <button className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface shrink-0 font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px]">near_me</span>
              <span>Within 5 km</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-margin-sm md:px-margin py-space-md space-y-space-md">
          {courts.map((court) => (
            <article key={court.id} className={`group relative rounded-xl transition-all duration-300 overflow-hidden shadow-lg cursor-pointer ${court.active ? 'bg-surface-container-high/90 hover:bg-surface-container-highest shadow-[0_8px_30px_rgba(0,0,0,0.5)]' : 'bg-surface-container-low hover:bg-surface-container-high'}`} onClick={() => navigate('/court')}>
              {court.active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-container via-secondary-fixed to-primary-container shadow-[0_0_12px_#00e5ff]"></div>}
              <div className={`p-space-md flex flex-col gap-space-sm ${court.active ? 'pl-space-lg' : ''}`}>
                <div className="flex gap-space-md items-start">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container-lowest">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={court.image} alt={court.name} />
                    {court.surge ? (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-error-container/90 backdrop-blur-md font-label-sm text-label-sm text-on-error flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">bolt</span> {court.tag}
                      </div>
                    ) : (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md font-label-sm text-label-sm text-secondary-fixed">
                        {court.tag}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-primary-container transition-colors">{court.name}</h2>
                      <div className="flex items-center gap-1 text-secondary-fixed font-label-md text-label-md bg-secondary-container/10 px-1.5 py-0.5 rounded shrink-0">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span>{court.rating}</span>
                      </div>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">{court.location}</p>
                    <div className="flex items-center gap-2 mt-1.5 font-label-sm text-label-sm text-outline-variant">
                      <span className="flex items-center gap-1 text-on-surface">
                        <span className="material-symbols-outlined text-[14px] text-primary-container">location_on</span>
                        {court.distance}
                      </span>
                      {court.urgency && <span className="px-1.5 py-0.2 rounded bg-error-container/20 text-error font-label-sm text-label-sm">⚡ 1 Slot Left</span>}
                    </div>
                  </div>
                </div>
                {court.surge && (
                  <div className="flex items-center justify-between px-space-sm py-1 rounded-lg bg-surface-variant/40 text-on-surface-variant">
                    <div className="flex items-center gap-1.5 text-on-error font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                      <span>Peak Hour Surge (18:00 - 21:00)</span>
                    </div>
                  </div>
                )}
                {court.amenities && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {court.amenities.map(a => (
                      <span key={a.text} className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-primary-container">{a.icon}</span> {a.text}
                      </span>
                    ))}
                  </div>
                )}
                <div className="pt-space-xs flex items-center justify-between border-t border-outline-variant/15 mt-1">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-headline-md text-headline-md text-primary-container">${court.price}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">/ hour</span>
                      {court.oldPrice && <span className="font-label-sm text-label-sm text-outline-variant line-through">${court.oldPrice}</span>}
                    </div>
                    <div className="font-label-sm text-label-sm text-secondary-fixed flex items-center gap-1">
                      {court.active && <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>} {court.nextSlot}
                    </div>
                  </div>
                  <button className="px-space-md py-space-sm rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-lg text-label-lg shadow-[0_0_18px_rgba(0,229,255,0.4)] transition-all flex items-center gap-1" onClick={(e) => { e.stopPropagation(); navigate('/court') }}>
                    <span>Book Now</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </aside>

      {/* RIGHT PANEL: Urban Map */}
      <main className="w-full lg:w-[58%] h-full relative overflow-hidden bg-surface-container-lowest flex flex-col justify-between select-none">
        <div className="absolute inset-0 bg-surface-container-lowest">
          <svg className="w-full h-full object-cover opacity-85" fill="none" viewBox="0 0 1000 800" xmlns="http://www.w3.org/2000/svg">
            <g fill="#141822" opacity="0.6">
              <rect height="90" rx="4" width="120" x="50" y="40"></rect>
              <rect height="110" rx="6" width="160" x="200" y="30"></rect>
              <rect height="150" rx="8" width="140" x="40" y="160"></rect>
              <rect height="130" rx="6" width="150" x="210" y="170"></rect>
              <rect height="180" rx="6" width="120" x="60" y="340"></rect>
              <rect height="190" rx="8" width="180" x="210" y="330"></rect>
            </g>
            <path d="M 0,220 C 120,240 280,180 340,110 C 370,70 410,20 460,0" stroke="#00e5ff" strokeDasharray="4 4" strokeOpacity="0.15" strokeWidth="2"></path>
            <path d="M 20,720 L 250,530 L 480,420 L 720,240 L 980,120" fill="none" stroke="#c3f5ff" strokeWidth="1.2"></path>
            <circle cx="480" cy="420" fill="none" r="280" stroke="#00e5ff" strokeDasharray="6 8" strokeOpacity="0.15" strokeWidth="1.5"></circle>
          </svg>
        </div>

        {/* User GPS */}
        <div className="absolute left-[48%] top-[52.5%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-10 h-10 rounded-full bg-primary-container/30 animate-ping"></div>
            <div className="w-4 h-4 rounded-full bg-primary-container border-2 border-surface shadow-[0_0_12px_#00e5ff] relative z-10"></div>
          </div>
          <div className="mt-1 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-label-sm border border-primary-container/30 flex items-center gap-1 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
            <span>You Are Here</span>
          </div>
        </div>

        {/* PIN 1: Kinetic Arena */}
        <div className="absolute left-[36%] top-[34%] -translate-x-1/2 -translate-y-full z-30 flex flex-col items-center cursor-pointer group" onClick={() => navigate('/court')}>
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-2 rounded-full bg-secondary-fixed/30 animate-ping"></div>
            <div className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary font-label-lg text-label-lg shadow-[0_0_24px_#34ff8c] flex items-center gap-1 border-2 border-surface">
              <span className="material-symbols-outlined text-[14px]">sports_tennis</span>
              <span>$15/hr</span>
            </div>
          </div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-secondary-fixed -mt-[1px]"></div>
        </div>

        {/* PIN 2: Metro Smash Hub */}
        <div className="absolute left-[68%] top-[27%] -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center cursor-pointer">
          <div className="relative flex items-center justify-center">
            <div className="px-2.5 py-1 rounded-full bg-surface-container-high/90 hover:bg-surface-bright backdrop-blur-md text-on-surface font-label-md text-label-md border border-error/50 shadow-[0_0_16px_rgba(255,180,171,0.25)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              <span className="text-primary-container font-label-md text-label-md">$18/hr</span>
            </div>
          </div>
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-surface-container-high -mt-[1px]"></div>
          <span className="mt-1 px-1.5 py-0.5 rounded bg-surface-container-lowest/80 text-[10px] text-on-surface-variant font-label-sm">Metro Smash</span>
        </div>

        {/* HUD Map Controls */}
        <div className="relative z-30 p-margin-sm md:p-margin flex items-center justify-between pointer-events-none mt-auto">
          <div className="pointer-events-auto px-space-md py-space-sm rounded-xl bg-surface-container-lowest/85 backdrop-blur-xl border border-outline-variant/30 shadow-xl flex items-center gap-space-md font-label-sm text-label-sm">
            <div className="flex items-center gap-1.5 text-on-surface">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed"></span> Available Now
            </div>
            <div className="flex items-center gap-1.5 text-on-surface">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span> Your GPS
            </div>
          </div>
          <div className="pointer-events-auto flex flex-col gap-1.5">
            <button className="p-2.5 rounded-xl bg-surface-container-lowest/85 hover:bg-primary-container hover:text-on-primary-container backdrop-blur-xl border border-outline-variant/30 text-on-surface-variant shadow-xl transition-all">
              <span className="material-symbols-outlined text-[18px]">my_location</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default MapBooking
