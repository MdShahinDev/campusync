import { Building2, CheckCircle, Layers, TrendingUp, Users } from 'lucide-react';
import MotionUp from "../components/animation/Motion";
import usePublicStats from "../hooks/usePublicStats";

const HomeState = () => {
  const { loading, formatStat } = usePublicStats();

  const statsList = [
    {
      id: 'departments',
      label: 'Department',
      statKey: 'departments',
      subtext: 'Total departments',
      icon: Building2,
      color: 'text-orange-500 bg-orange-500/10'
    },
    {
      id: 'users',
      label: 'Total User',
      statKey: 'users',
      subtext: 'Registered users',
      icon: Users,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      id: 'resources',
      label: 'Total Resource',
      statKey: 'resources',
      subtext: 'Uploaded shared resources',
      icon: Layers,
      color: 'text-orange-500 bg-orange-500/10'
    },
    {
      id: 'components',
      label: 'Total Shared Component',
      statKey: 'components',
      subtext: 'Active shared components',
      icon: CheckCircle,
      color: 'text-emerald-500 bg-emerald-500/10'
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
      <MotionUp initialY={40}>
        <section className="py-16 md:py-20 bg-bg-secondary border-y border-border-color">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="max-w-3xl mb-10 md:mb-12">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-orange">
                <TrendingUp className="w-3.5 h-3.5" /> Institutional Impact
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
                Powering Academic Infrastructure at Scale
              </h2>
              <p className="mt-3 text-base text-text-secondary">
                Real-time metric telemetry verified across leading research universities.
              </p>
            </div>

            {/* 4 stat cells — hairline grid instead of floating cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-xl border border-border-color bg-border-color">
              {statsList.map((stat) => {
                const IconComp = stat.icon;
                return (
                  <div
                    key={stat.id}
                    className="bg-bg-primary p-5 md:p-6"
                  >
                    <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                      <IconComp className="w-[18px] h-[18px]" />
                    </div>

                    <div
                      className={`text-3xl md:text-4xl font-semibold text-text-primary tracking-tight tabular-nums ${
                        loading ? "animate-pulse" : ""
                      }`}
                    >
                      {formatStat(stat.statKey)}
                    </div>
                    <div className="mt-1.5 text-sm font-medium text-text-primary">
                      {stat.label}
                    </div>
                    <p className="mt-0.5 text-[13px] text-text-muted">
                      {stat.subtext}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      </MotionUp>
    </div>
  )
}

export default HomeState
