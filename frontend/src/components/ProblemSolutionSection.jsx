
import { CheckCircle2, XCircle } from 'lucide-react';
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
    <section className="py-16 md:py-24 border-t border-border-color">
      <MotionUp initialY={40}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="max-w-3xl mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              From Chaos to Intelligent Campus Infrastructure
            </h2>
            <p className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed">
              Traditional university resource management is broken. <span className='font-semibold text-accent-orange'>CampusSync</span>  transforms isolated departmental silos into a seamless digital ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* PROBLEM */}
            <div className="rounded-xl border border-rose-200/70 bg-rose-50/50 p-6 md:p-8 dark:border-rose-500/20 dark:bg-rose-950/20">
              <div className="flex items-center gap-3 pb-5 mb-5 border-b border-rose-200/60 dark:border-rose-500/15">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                  <XCircle className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Traditional University Reality
                  </h3>
                  <p className="text-[11px] text-rose-500 font-medium uppercase tracking-[0.12em]">
                    Fragmented • Wasteful • Slow
                  </p>
                </div>
              </div>

              <ul className="divide-y divide-rose-200/60 dark:divide-rose-500/10">
                {challenges.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="mt-0.5 shrink-0 text-rose-500">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">{item.title}</h4>
                      <p className="text-[13px] text-text-secondary mt-1 leading-relaxed">{item.problem}</p>
                      <span className="block mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                        Impact: {item.impact}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* SOLUTION */}
            <div className="rounded-xl border border-border-color bg-bg-card p-6 md:p-8">
              <div className="flex items-center gap-3 pb-5 mb-5 border-b border-border-color">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-orange/10 text-accent-orange">
                  <CheckCircle2 className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    The CampusSync Platform
                  </h3>
                  <p className="text-[11px] text-accent-orange font-medium uppercase tracking-[0.12em]">
                    Intelligent • Contactless • Transparent
                  </p>
                </div>
              </div>

              <ul className="divide-y divide-border-color">
                {solutions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="mt-0.5 shrink-0 text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">{item.title}</h4>
                      <p className="text-[13px] text-text-secondary mt-1 leading-relaxed">{item.solution}</p>
                      <span className="block mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Result: {item.gain}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </MotionUp>
    </section>
  );
};
