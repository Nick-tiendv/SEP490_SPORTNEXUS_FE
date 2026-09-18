import { useNavigate } from 'react-router-dom'

function SplitPayment() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-margin py-space-xl gap-space-lg text-on-surface">
      {/* Header */}
      <div className="flex flex-col gap-space-xs text-center items-center">
        <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold">Smart Contract Escrow</span>
        <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">Split Payment Setup</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">
          Securely split your court reservation. Funds are locked in escrow and only released when all players confirm.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg mt-space-md">
        
        {/* Left Col: Match Summary */}
        <div className="md:col-span-5 flex flex-col gap-space-md">
          <div className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold border-b border-outline-variant/20 pb-space-xs">Booking Details</h2>
            
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase">Kinetic Arena Metro</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Court 04 • BWF Grade 1</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span> Wed, Oct 22, 2025
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">schedule</span> 18:00 - 19:00 (1.0 hr)
              </span>
            </div>

            <div className="mt-2 p-space-md rounded-xl bg-surface-container flex flex-col gap-2">
              <div className="flex justify-between font-body-sm text-body-sm">
                <span className="text-on-surface-variant">Court Fee</span>
                <span className="text-on-surface">$18.00</span>
              </div>
              <div className="flex justify-between font-body-sm text-body-sm">
                <span className="text-on-surface-variant">Equipment Rental</span>
                <span className="text-on-surface">$2.00</span>
              </div>
              <div className="flex justify-between font-headline-sm text-headline-sm font-bold pt-2 border-t border-outline-variant/20 mt-1">
                <span>Total</span>
                <span className="text-primary-container">$20.00</span>
              </div>
            </div>
            
            <div className="p-space-md rounded-xl bg-surface-container-highest flex items-center gap-space-sm mt-2">
              <span className="material-symbols-outlined text-secondary-container">lock</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary-container uppercase font-bold">Escrow Ready</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Your funds are protected.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Split Config */}
        <div className="md:col-span-7 flex flex-col gap-space-md">
          <div className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Split Configuration</h2>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Divide costs with other players</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg font-label-md text-label-md">
                <span className="text-on-surface-variant">Total:</span>
                <span className="text-primary-container font-bold">$20.00</span>
              </div>
            </div>

            {/* Split Options */}
            <div className="grid grid-cols-3 gap-space-xs mb-2">
              <button className="py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">2 Ways ($10.00)</button>
              <button className="py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">3 Ways ($6.67)</button>
              <button className="py-2 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-md transition-colors">4 Ways ($5.00)</button>
            </div>

            {/* Player Slots */}
            <div className="flex flex-col gap-space-sm">
              {/* Host */}
              <div className="p-space-sm rounded-xl bg-surface-container flex items-center justify-between border border-primary-container/30 shadow-[0_0_10px_rgba(0,229,255,0.1)]">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">HA</div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-bold">Hoang An (You)</span>
                    <span className="font-label-sm text-label-sm text-primary uppercase">Host • Paid</span>
                  </div>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">$5.00</span>
              </div>

              {/* Player 2 */}
              <div className="p-space-sm rounded-xl bg-surface-container flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <img className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI" alt="Player" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-bold">Alex Rivera</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Invited</span>
                  </div>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface-variant font-bold">$5.00</span>
              </div>

              {/* Player 3 */}
              <div className="p-space-sm rounded-xl bg-surface-container border border-dashed border-outline-variant/40 flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined">person_add</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface-variant">Player 3</span>
                    <span className="font-label-sm text-label-sm text-primary uppercase">Invite Link</span>
                  </div>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface-variant font-bold">$5.00</span>
              </div>

              {/* Player 4 */}
              <div className="p-space-sm rounded-xl bg-surface-container border border-dashed border-outline-variant/40 flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined">person_add</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface-variant">Player 4</span>
                    <span className="font-label-sm text-label-sm text-primary uppercase">Invite Link</span>
                  </div>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface-variant font-bold">$5.00</span>
              </div>
            </div>

            {/* Invite Link */}
            <div className="mt-2 p-3 rounded-lg bg-surface-container-highest flex items-center justify-between">
              <span className="font-mono text-body-sm text-on-surface-variant truncate mr-4">https://nexus.app/split/nx-9982a</span>
              <button className="p-2 rounded-md bg-surface-container hover:bg-surface-bright text-primary transition-colors flex items-center justify-center" title="Copy Link">
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
            </div>

            {/* Action */}
            <div className="mt-space-sm pt-space-md border-t border-outline-variant/20 flex flex-col gap-space-sm">
              <button className="w-full py-3 rounded-xl bg-surface-container-highest text-on-surface font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-surface-bright transition-colors" onClick={() => navigate('/qr-pass')}>
                <span className="material-symbols-outlined text-[20px] text-secondary-fixed">shield</span>
                Host Cover Full Remaining ($15.00)
              </button>
              <button className="w-full py-3 rounded-xl bg-primary-container hover:brightness-110 text-on-primary-container font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all" onClick={() => navigate('/qr-pass')}>
                <span className="material-symbols-outlined text-[20px]">lock</span>
                Confirm & Lock Escrow
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SplitPayment
