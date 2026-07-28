import { Sparkles, X, Zap } from 'lucide-react';
import MotionUp from './animation/Motion';

export const ComparisonSection = () => {
  const metrics = [
    {
      feature: 'Asset Booking Time',
      traditional: '15 to 45 Minutes (Physical binders & forms)',
      campusShare: '10 Seconds (Contactless mobile app)',
      winner: 'campusShare'
    },
    {
      feature: 'Cross-Department Access',
      traditional: 'Zero (Siloed inside single faculties)',
      campusShare: '100% Campus-Wide Mesh Access',
      winner: 'campusShare'
    },
    {
      feature: 'Untracked Missing Equipment',
      traditional: '25% - 40% Lost Every Semester',
      campusShare: '< 0.01% (Verified RFID Drop Box)',
      winner: 'campusShare'
    },
    {
      feature: 'Study Pod Double-Bookings',
      traditional: 'Daily Student Arguments & Squatting',
      campusShare: '0% Conflicts (AI auto-release lock)',
      winner: 'campusShare'
    },
    {
      feature: 'Damage & Maintenance Audits',
      traditional: 'Unreported broken gear discovered in class',
      campusShare: 'AI Photo Condition Vault on return',
      winner: 'campusShare'
    },
    {
      feature: 'University SSO & Badge Integration',
      traditional: 'Custom paper IDs & manual spreadsheets',
      campusShare: 'SAML 2.0, Okta, Canvas & NFC Badges',
      winner: 'campusShare'
    },
  ];

  return (
    <MotionUp>
    <section className="py-24 relative overflow-hidden bg-primary dark:bg-[#090B12] border-t border-slate-200/80 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-orange-500/30 text-xs font-bold text-accent-orange uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" /> High-Impact Comparison
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            Traditional Management vs. Campus Sync
          </h2>
          <p className="text-base sm:text-lg text-secondary font-inter">
            See why leading Silicon Valley research universities are replacing legacy binders with CampusShare.
          </p>
        </div>

        {/* Comparison Table Card */}
        <div className="rounded-3xl glass-card border border-slate-200/90 bg-primary shadow-2xl overflow-hidden">
          
          <div className="grid grid-cols-12 p-6 border-b border-slate-200  text-xs font-black uppercase tracking-wider">
            <div className="col-span-4 text-primary">Core Metric</div>
            <div className="col-span-4 text-rose-500 flex items-center gap-1.5">
              <X className="w-4 h-4" /> Traditional System
            </div>
            <div className="col-span-4 text-accent-orange flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Campus Sync
            </div>
          </div>

          <div className="divide-y divide-slate-200/60 dark:divide-white/5">
            {metrics.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 p-6 text-sm items-center hover:bg-slate-100/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="col-span-4 font-bold text-primary">
                  {row.feature}
                </div>

                <div className="col-span-4 text-xs text-seocndary pr-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  {row.traditional}
                </div>

                <div className="col-span-4 text-xs font-bold  pl-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-[#FF8A00] font-extrabold">{row.campusShare}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
    </MotionUp>
  );
};
