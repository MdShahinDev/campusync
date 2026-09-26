import MotionUp from "../components/animation/Motion";

const Mission = () => {
  return (
    <section className="py-16 md:py-24">
      <MotionUp initialY={40}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="space-y-5">
              <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary leading-tight tracking-tight">
                From Siloed Departments
                <br />
                to Unified Sharing
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Universities waste thousands of dollars every year on equipment that sits idle in one department while students in another need it. Paper sign-out logs get lost. Study rooms get double-booked. Valuable gear goes untracked.
              </p>
              <p className="text-text-secondary leading-relaxed">
                CampusSync replaces all of that with a single, intelligent platform. Students list their own components for peer-to-peer borrowing. Academic resources are organized by university and course. Moderators oversee their campus. Admins control the entire system.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-red-200/70 bg-red-50/60 p-6 dark:border-red-500/20 dark:bg-red-950/20">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-red-600 dark:text-red-400 mb-4">
                  The Problem
                </h3>
                <ul className="divide-y divide-red-200/60 dark:divide-red-500/10 text-sm">
                  <li className="flex items-start gap-2.5 py-2.5 first:pt-0">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    <span className="text-text-secondary">Siloed departmental equipment hoarding</span>
                  </li>
                  <li className="flex items-start gap-2.5 py-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    <span className="text-text-secondary">Paper sign-out logs and lost gear</span>
                  </li>
                  <li className="flex items-start gap-2.5 py-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    <span className="text-text-secondary">Study room squatting and double-bookings</span>
                  </li>
                  <li className="flex items-start gap-2.5 py-2.5 last:pb-0">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    <span className="text-text-secondary">Unreported equipment damage</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-6 dark:border-emerald-500/20 dark:bg-emerald-950/20">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400 mb-4">
                  The CampusSync Solution
                </h3>
                <ul className="divide-y divide-emerald-200/60 dark:divide-emerald-500/10 text-sm">
                  <li className="flex items-start gap-2.5 py-2.5 first:pt-0">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-text-secondary">Campus-wide peer-to-peer component sharing</span>
                  </li>
                  <li className="flex items-start gap-2.5 py-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-text-secondary">Digital tracking with full borrow lifecycle</span>
                  </li>
                  <li className="flex items-start gap-2.5 py-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-text-secondary">Verified community with moderator oversight</span>
                  </li>
                  <li className="flex items-start gap-2.5 py-2.5 last:pb-0">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-text-secondary">Organized academic resource library by course</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </MotionUp>
    </section>
  )
}

export default Mission
