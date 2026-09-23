import { Layers,} from "lucide-react";
import MotionUp from "../components/animation/Motion";
import Mission from "../components/Mission";
import Features from "../components/Features";
import BorrowFlow from "../components/BorrowFlow";
import UserRoles from "../components/UserRoles";
import UniversitiesCourses from "../components/UniversitiesCourses";
import CTA from "../components/CTA";

const stats = [
  { label: "Departments Connected", value: "10+" },
  { label: "Active Students", value: "12,000+" },
  { label: "Shared Assets", value: "35,000+" },
  { label: "Successful Bookings", value: "2,000+" },
];







const About = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/15 to-amber-500/10 blur-[140px] rounded-full pointer-events-none dark:opacity-80 opacity-40"></div>
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-blue-500/15 to-indigo-500/10 blur-[140px] rounded-full pointer-events-none dark:opacity-60 opacity-30"></div>

        <MotionUp>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card border border-orange-500/30 bg-orange-500/5 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm backdrop-blur-md mb-6">
              <Layers className="w-4 h-4 text-accent-orange" />
              <span className="text-accent-orange font-bold">About Campus Sync</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary leading-[1.1] mb-6">
              The Platform Powering
              <br />
              <span className="text-accent-orange">Campus Resource Sharing</span>
            </h1>

            <p className="text-secondary max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              CampusSync connects students, moderators, and administrators on a single platform to share equipment, manage academic resources, and collaborate across departments in real-time.
            </p>
          </div>
        </MotionUp>
      </section>

      {/* Stats */}
      <section className="py-16 bg-bg-secondary/50">
        <MotionUp>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-6 rounded-2xl glass-card border border-border-color"
                >
                  <div className="text-3xl md:text-4xl font-extrabold text-accent-orange mb-1">
                    {stat.value}
                  </div>
                  <div className="text-secondary text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </MotionUp>
      </section>

      {/* Mission */}
      <Mission/>

      {/* Features */}
      <Features/>

      {/* How It Works - Borrow Flow */}
      <BorrowFlow/>

      {/* User Roles */}
      <UserRoles/>

      {/* Universities & Courses */}
      <UniversitiesCourses/>

      {/* CTA */}
      <CTA/>
    </div>
  );
};

export default About;
