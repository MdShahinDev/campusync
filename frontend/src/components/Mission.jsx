import MotionUp from "../components/animation/Motion";
const Mission = () => {
  return (
          <section className="py-20">
            <MotionUp>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary leading-tight">
                      From Siloed Departments
                      <br />
                      <span className="text-accent-orange">to Unified Sharing</span>
                    </h2>
                    <p className="text-secondary leading-relaxed">
                      Universities waste thousands of dollars every year on equipment that sits idle in one department while students in another need it. Paper sign-out logs get lost. Study rooms get double-booked. Valuable gear goes untracked.
                    </p>
                    <p className="text-secondary leading-relaxed">
                      CampusSync replaces all of that with a single, intelligent platform. Students list their own components for peer-to-peer borrowing. Academic resources are organized by university and course. Moderators oversee their campus. Admins control the entire system.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl glass-card border border-red-500/20 bg-red-500/5">
                      <h3 className="text-sm font-bold text-red-500 mb-2">The Problem</h3>
                      <ul className="space-y-2 text-secondary text-sm">
                        <li className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                          <span>Siloed departmental equipment hoarding</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                          <span>Paper sign-out logs and lost gear</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                          <span>Study room squatting and double-bookings</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                          <span>Unreported equipment damage</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-5 rounded-2xl glass-card border border-green-500/20 bg-green-500/5">
                      <h3 className="text-sm font-bold text-green-500 mb-2">The CampusSync Solution</h3>
                      <ul className="space-y-2 text-secondary text-sm">
                        <li className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                          <span>Campus-wide peer-to-peer component sharing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                          <span>Digital tracking with full borrow lifecycle</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                          <span>Verified community with moderator oversight</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                          <span>Organized academic resource library by course</span>
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
