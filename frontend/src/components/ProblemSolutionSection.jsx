
import { CheckCircle2, XCircle, Zap } from 'lucide-react';
import MotionUp from './animation/Motion';

export const ProblemSolutionSection = () => {

  const challenges = [
    {
      title: 'Siloed Departmental Hoarding',
      problem: 'Each department buys its own $30,000 cameras or oscilloscopes. Gear sits idle 85% of the time while adjacent faculties lack budget.',
      impact: 'Massive budget waste & duplicated purchases'
    },
    {
      title: 'Paper Sign-Out Logs & Lost Gear',
      problem: 'Manual binders and unmonitored clipboard checkouts result in 30%+ missing equipment every academic semester with no accountability.',
      impact: 'Untracked missing inventory'
    },
    {
      title: 'Study Room Squatting & Double-Bookings',
      problem: 'Students lock study rooms with backpacks or fight over duplicate Google Calendar entries with zero check-in verification.',
      impact: 'Frequent student friction & wasted space'
    },
    {
      title: 'Unreported Equipment Damage',
      problem: 'Students return broken DSLR lenses or blown circuit boards without reporting, leaving the next borrower stranded during class.',
      impact: 'Classroom delays & broken trust'
    }
  ];

  const solutions = [
    {
      title: 'Campus-Wide Mesh Sharing',
      solution: 'One unified catalog exposing available assets across all 48+ departments with permission-based access rules.',
      gain: '300%+ increase in asset utilization'
    },
    {
      title: '8-Second RFID / QR Drop Cabinets',
      solution: 'Automated locker stations with instant optical check-in. RFID tags verify kit completeness automatically upon return.',
      gain: '0% untracked missing inventory'
    },
    {
      title: 'AI Smart Lock & Check-In Verification',
      solution: 'Conflict-free slot booking engine with 15-minute auto-release if students fail to check in at the room pod.',
      gain: '100% room availability accuracy'
    },
    {
      title: 'AI Optical Damage Vault',
      solution: 'Mandatory 3-second photo check during QR return. AI flags physical damage and dispatches repair tickets instantly.',
      gain: 'Transparent peer accountability'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-grid-pattern">
      <MotionUp>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-orange-500/30 text-xs font-bold text-accent-orange uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" /> Paradigm Shift
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            From Chaos to Intelligent Campus Infrastructure
          </h2>
          <p className="text-base sm:text-lg text-secondary">
            Traditional university resource management is broken. CampusShare transforms isolated departmental silos into a seamless digital ecosystem.
          </p>
        </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* PROBLEM CARD */}
            <div className="p-8 rounded-3xl glass-card border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">
                    Traditional University Reality
                  </h3>
                  <p className="text-xs text-rose-500 font-semibold uppercase tracking-wider">
                    Fragmented • Wasteful • Slow
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {challenges.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-primary border border-rose-500/15 flex items-start gap-3">
                    <div className="p-1 rounded bg-rose-500/20 text-rose-500 mt-0.5">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary">{item.title}</h4>
                      <p className="text-xs text-secondary mt-1">{item.problem}</p>
                      <span className="inline-block mt-2 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                        Impact: {item.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SOLUTION CARD */}
              <div className="p-8 rounded-3xl glass-card border border-orange-500/30 bg-orange-500/5 dark:bg-orange-950/10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-[#FF8A00] to-[#FF6B00] text-white shadow-lg shadow-orange-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">
                      The CampusShare Mesh Platform
                    </h3>
                    <p className="text-xs text-[#FF8A00] font-semibold uppercase tracking-wider">
                      Intelligent • Contactless • Transparent
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {solutions.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-primary border border-orange-500/20 flex items-start gap-3 shadow-xs">
                      <div className="p-1 rounded bg-emerald-500/20 text-emerald-500 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-primary">{item.title}</h4>
                        <p className="text-xs text-secondary mt-1">{item.solution}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Result: {item.gain}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
      </div>
      </MotionUp>
    </section>
  );
};
