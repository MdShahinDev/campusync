import { Building2, CheckCircle, Layers, TrendingUp, Users } from 'lucide-react';
import MotionUp from "../components/animation/Motion";
const HomeState = () => {
    const statsList = [
    {
      id: 'depts',
      label: 'University Departments',
      value: '10+',
      subtext: 'Fully integrated cross-campus mesh',
      icon: Building2,
      trend: '+12 added this term',
      color: 'from-orange-500/20 to-amber-500/10 text-orange-500'
    },
    {
      id: 'students',
      label: 'Active Student Users',
      value: '12000+',
      subtext: 'Verified SSO & NFC student badges',
      icon: Users,
      trend: '+24% YoY Growth',
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-500'
    },
    {
      id: 'resources',
      label: 'Shared Campus Assets',
      value: '35,000+',
      subtext: 'Books, lab rigs, cameras, pods & IoT',
      icon: Layers,
      trend: '$14.2M Asset Pool',
      color: 'from-orange-500/20 to-orange-600/10 text-orange-500'
    },
    {
      id: 'bookings',
      label: 'Successful Bookings',
      value: '2k+',
      subtext: '0.001% conflict rate with AI lock',
      icon: CheckCircle,
      trend: '99.8% On-Time Returns',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-500'
    },
  ];
  const departmentBadges = [
    'School of Medicine',
    'Electrical Engineering',
    'Computer Science Core',
    'Media & Journalism Lab',
    'Applied Physics Institute',
    'Architecture & Urban Design',
    'Biomedical Innovation Hub',
    'Robotics & Automation'
  ];
  return (
    <div>
        <MotionUp>
      <section className="py-20 relative overflow-hidden bg-primary border-y border-slate-200/80 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Label */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-orange-500/30 text-xs font-bold text-accent-orange uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5" /> Institutional Impact
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            Powering Academic Infrastructure at Scale
          </h2>
          <p className="text-base text-muted font-inter">
            Real-time metric telemetry verified across leading research universities.
          </p>
        </div>

        {/* 4 Large Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsList.map((stat) => {
            const IconComp = stat.icon;
            return (
              <div
                key={stat.id}
                className="group p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/10 bg-primary hover:border-orange-500/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color}`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10">
                    {stat.trend}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-4xl sm:text-5xl font-black text-primary tracking-tight group-hover:text-[#FF8A00] transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-secondary">
                    {stat.label}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    {stat.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Connected Department Pill Ticker */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-white/5">
          <div className="text-center text-xs font-semibold text-primary uppercase tracking-widest mb-4">
            Active Participating Departments
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2.5">
            {departmentBadges.map((dept, idx) => (
              <div
                key={idx}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-primary border border-slate-200 dark:border-white/10 text-primary hover:border-orange-500/50 hover:text-[#FF8A00] transition-all cursor-default shadow-xs"
              >
                {dept}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
    </MotionUp>
    </div>
  )
}

export default HomeState
