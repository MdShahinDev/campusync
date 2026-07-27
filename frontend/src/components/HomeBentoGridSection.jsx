import { AlertTriangle, Bell, Calendar, Camera, Check, QrCode, Search, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import MotionUp from "./animation/Motion";

const HomeBentoGridSection = () => {
  const [activeSlot, setActiveSlot] = useState('2:00 PM - 4:00 PM');
  const [scanned, setScanned] = useState(false);
  return (
    <div>
        <MotionUp>
      <section id="features" className="py-24 relative overflow-hidden bg-primary border-t border-slate-200/80 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-orange-500/30 text-xs font-bold text-[#FF8A00] uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Silicon Valley Architecture
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            Engineered for High-Velocity Campus Collaboration
          </h2>
          <p className="text-base sm:text-lg text-secondary font-inter">
            Eight intelligent core modules designed to maximize equipment utilization, eliminate missing inventory, and power student research.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Bento Card 1: Smart Search (Span 2 cols on lg) */}
          <div className="lg:col-span-2 p-8 rounded-3xl glass-card border border-slate-200/80  bg-primary hover:border-orange-500/40 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-orange-500/10 text-[#FF8A00] border border-orange-500/20">
                  <Search className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF8A00] bg-orange-500/10 px-3 py-1 rounded-full">
                  Instant Multiple Query
                </span>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-primary">Smart Search & Semantic Filters</h3>
                <p className="text-sm text-secondary mt-1">
                  Search across 10+ departments by hardware specs, course code, or pickup proximity.
                </p>
              </div>

              {/* Interactive Search Bar Widget */}
              <div className="p-4 rounded-2xl bg-primary border border-slate-200  space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white  border border-slate-200 ">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search cameras, lab gear, textbooks..."
                    className="w-full text-xs bg-transparent text-slate-900 dark:text-white focus:outline-none font-medium"
                  />
                </div>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-accent-orange font-bold border border-orange-500/20">
                    ✓ Available Now
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-medium">
                    Media Lab 2B
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-medium">
                    Course: JOURN-301
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-medium">
                    Rating: 4.8+
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Instant Booking */}
          <div className="p-8 rounded-3xl glass-card border border-slate-200/80  bg-primary hover:border-orange-500/40 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-blue-500/40 text-blue-500 border border-blue-500/20">
                <Calendar className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary">Instant 1-Click Booking</h3>
                <p className="text-xs text-secondary font-inter mt-1">
                  Conflict-free slot locking with automated calendar sync.
                </p>
              </div>

              {/* Time Slots Widget */}
              <div className="space-y-2">
                {['10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM', '4:30 PM - 6:30 PM'].map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlot(slot)}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                      activeSlot === slot
                        ? 'bg-gradient-to-r from-[#FF8A00] to-[#FF6B00] text-white shadow-md'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{slot}</span>
                    {activeSlot === slot && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bento Card 3: QR Return Station */}
          <div className="p-8 rounded-3xl glass-card border border-slate-200/80  bg-primary hover:border-orange-500/40 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-emerald-500/40 text-emerald-500 border border-emerald-500/20">
                <QrCode className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary">Contactless QR Return</h3>
                <p className="text-xs text-secondary font-inter mt-1">
                  Automated smart cabinet drop box with RFID verification.
                </p>
              </div>

              {/* Interactive QR Box Simulator */}
              <div className="p-4 rounded-2xl bg-primary border border-slate-200  text-center space-y-2">
                <button
                  onClick={() => setScanned(!scanned)}
                  className="w-full py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  {scanned ? '✓ Drop Box Unlocked' : 'Simulate QR Scan Drop'}
                </button>
                <span className="text-[10px] text-secondary">
                  {scanned ? 'RFID confirmed: Sony A7 + 24-70mm lens intact' : 'Point student badge at drop locker camera'}
                </span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Notifications (Span 2 cols on lg) */}
          <div className="lg:col-span-2 p-8 rounded-3xl glass-card border border-slate-200/80  bg-primary hover:border-orange-500/40 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-purple-500/40 text-purple-500 border border-purple-500/20">
                  <Bell className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full">
                  Omni-Channel Alerts
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-primary">Automated Reminders & Slack Dispatch</h3>
                <p className="text-sm text-secondary font-inter mt-1">
                  Never miss a return deadline with automated Slack, WhatsApp, SMS, and Canvas push notifications.
                </p>
              </div>

              {/* Alert Notification Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-primary border border-slate-200  flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    Slack
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-primary">Return Warning</div>
                    <p className="text-[10px] text-secondary">Sony A7 due in 30 mins at Media Lab</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-primary border border-slate-200  flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    SMS
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-primary">Locker Passcode</div>
                    <p className="text-[10px] text-secondary font-inter">Cabinet #4 PIN: 8902</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card 5: Peer Reputation System */}
          <div className="p-8 rounded-3xl glass-card border border-slate-200/80  bg-primary hover:border-orange-500/40 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-amber-500/40 text-amber-500 border border-amber-500/20">
                <Star className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary">Peer Reputation System</h3>
                <p className="text-xs text-secondary font-inter mt-1">
                  Earn trust points for on-time returns and clean care.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center space-y-1">
                <div className="text-3xl font-bold text-accent-orange">4.98 / 5.0</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Verified Campus Trust Badge</div>
                <div className="text-[10px] text-secondary">Unlocks $50k+ Lab Equipment Priority</div>
              </div>
            </div>
          </div>

          {/* Bento Card 6: Damage Reports & Optical Vault */}
          <div className="p-8 rounded-3xl glass-card border border-slate-200/80  bg-primary hover:border-orange-500/40 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-rose-500/40 text-rose-500 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary">Damage Reports & Repair</h3>
                <p className="text-xs text-secondary font-inter mt-1">
                  Photo evidence vault & instant technician dispatch.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-primary border border-slate-200  flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/40 text-rose-500 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-primary">Optical Scan Logged</div>
                  <div className="text-[10px] text-emerald-500 font-semibold">Zero damage detected</div>
                </div>
              </div>
            </div>
          </div></div>

      </div>
    </section>
    </MotionUp>
    </div>
  )
}

export default HomeBentoGridSection
