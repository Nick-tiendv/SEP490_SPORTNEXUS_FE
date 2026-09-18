import { useNavigate } from 'react-router-dom'

function CourtDetails() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col w-full relative">
      {/* Hero Header */}
      <section className="relative w-full overflow-hidden bg-surface-container-lowest">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary-container/10 blur-[130px] pointer-events-none rounded-full"></div>
        <div className="relative w-full rounded-2xl overflow-hidden min-h-[380px] lg:min-h-[440px] flex flex-col justify-end">
          <div className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/AEtjO1WdQ1-KKfnvwaSO4limEZmMa4EYvWiwHJh-ee9W3R9MusGMY2e0qlgwXbsjqxoztcUlkiHxzOLU8Rj7fuDxe23FEJagcAhTZzSXyAJNqkf5YUHNbGPgjZPKwuCCO3EoHymYunbwsdWb_O_Z2P3Oj4yT_rItFinuMCXFEQB0i1oR2ufaSKbZ8FxN1mCuYZFgWIDhw1Yxoh1z054PmkESyxdccl2X-cYwTGBP4Oxk-GIVOkLs9bC3tbWYLg')" }}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent"></div>
          
          <div className="relative z-10 p-space-lg lg:p-space-xl flex flex-col justify-between gap-space-lg mt-32">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
              <div className="flex flex-col gap-space-xs max-w-2xl">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">Premier Pro Facility</span>
                  <span className="text-on-surface-variant text-label-sm">•</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Metropolitan Sports Hub</span>
                </div>
                <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-none">
                  Kinetic Arena
                </h1>
                <p className="font-headline-sm text-headline-sm text-on-surface-variant font-medium flex items-center gap-space-xs">
                  Court 04 <span className="text-primary">•</span> BWF Certified Pro-Mat Synthetic Floor
                </p>
                
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                  <div className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/95 backdrop-blur-md shadow-md">
                    <span className="material-symbols-outlined text-primary-container text-[18px]">star</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface leading-none">4.8</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">(342 verified reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/70 backdrop-blur-md text-on-surface">
                    <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">wb_twilight</span>
                    <span className="font-label-md text-label-md">Olympic Grade 1200 Lux</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/70 backdrop-blur-md text-on-surface">
                    <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">ac_unit</span>
                    <span className="font-label-md text-label-md">Climate Controlled 21°C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="w-full px-margin-lg py-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start relative z-10 -mt-16">
        
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-space-xl">
          {/* Calendar Select */}
          <div className="flex flex-col gap-space-sm p-space-md rounded-2xl bg-surface-container-low shadow-lg">
            <div className="flex items-center justify-between px-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">October 2025</span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-space-xs pt-space-xs">
              {[20, 21, 22, 23, 24, 25].map(day => (
                <button key={day} className={`flex flex-col items-center py-space-md px-space-xs rounded-xl transition-all ${day === 22 ? 'bg-surface-container-highest shadow-[0_0_20px_rgba(0,229,255,0.35)]' : 'bg-surface-container hover:bg-surface-container-high'}`}>
                  <span className={`font-label-sm text-label-sm uppercase ${day === 22 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>Wed</span>
                  <span className={`font-headline-md text-headline-md font-bold mt-1 ${day === 22 ? 'text-primary' : 'text-on-surface'}`}>{day}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="flex flex-col gap-space-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span>
              Prime Evening Hours (High Demand)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
              <button className="relative p-space-md rounded-2xl bg-surface-container-high shadow-[0_0_28px_rgba(52,255,140,0.3)] flex flex-col justify-between text-left transition-transform scale-[1.02] overflow-hidden border border-secondary-fixed/50">
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">18:00 - 19:00</span>
                  <span className="font-label-sm text-label-sm text-secondary-container font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Selected Slot (1.0 hr)
                  </span>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between bg-surface-container-lowest/80 px-space-sm py-2 rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Regular Rate</span>
                    <span className="font-headline-sm text-headline-sm font-extrabold text-secondary-container">$18.00</span>
                  </div>
                </div>
              </button>
              
              <button className="relative p-space-md rounded-2xl bg-surface-container-low shadow-md flex flex-col justify-between text-left hover:bg-surface-container transition-all">
                <div className="absolute top-0 right-0 px-3 py-0.5 rounded-bl-xl bg-error-container text-on-error font-label-sm text-label-sm font-bold flex items-center gap-1 uppercase">
                  <span className="material-symbols-outlined text-[14px]">local_fire_department</span> Peak (+20%)
                </div>
                <div className="flex flex-col mt-4">
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">19:00 - 20:00</span>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between bg-surface-container-lowest/60 px-space-sm py-2 rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">$21.60</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column Checkout Panel */}
        <div className="lg:col-span-4 sticky top-24 flex flex-col gap-space-md">
          <div className="p-space-lg rounded-2xl bg-surface-container-low backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col gap-space-lg border border-outline-variant/10">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Booking Summary</h3>
            
            <div className="p-space-md rounded-xl bg-surface-container flex items-center gap-space-md">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-primary font-bold uppercase">Court 04 • Kinetic Pro</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold leading-snug">Kinetic Arena Metro</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Wednesday, Oct 22, 2025</span>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-highest flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary-container text-[20px]">timer</span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Reserved Slot</span>
                  <span className="font-label-lg text-label-lg font-bold text-on-surface">18:00 - 19:00 (60 Mins)</span>
                </div>
              </div>
            </div>

            <div className="pt-space-md flex items-baseline justify-between border-t border-outline-variant/20">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-bold">Total Amount</span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">USD</span>
                <span className="font-display-lg text-display-lg font-extrabold text-on-surface leading-none tracking-tight">$18.00</span>
              </div>
            </div>

            <button className="w-full py-space-md rounded-xl bg-primary-container hover:bg-primary-fixed text-on-primary font-headline-sm text-headline-sm font-extrabold flex items-center justify-center gap-space-sm transition-all shadow-[0_0_28px_rgba(0,229,255,0.45)]" onClick={() => navigate('/split-payment')}>
              Proceed to Checkout
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CourtDetails
