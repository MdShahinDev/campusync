import {
  ArrowRight,
  BookOpen,
  Package,
  Users,
  ShieldCheck,
  Search,
  Handshake,
  CheckCircle2,
  Upload,
  MessageCircle,
  Clock,
  BarChart3,
  Layers,
  Zap,
} from "lucide-react";
import Button from "../components/common/Button/Button";
import MotionUp from "../components/animation/Motion";

const stats = [
  { label: "Departments Connected", value: "10+" },
  { label: "Active Students", value: "12,000+" },
  { label: "Shared Assets", value: "35,000+" },
  { label: "Successful Bookings", value: "2,000+" },
];

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Find exactly what you need across departments — search by hardware specs, course code, or pickup proximity.",
  },
  {
    icon: Package,
    title: "Component Sharing",
    description:
      "List your lab gear, cameras, IoT kits, or projectors so fellow students can discover and borrow them.",
  },
  {
    icon: BookOpen,
    title: "Resource Library",
    description:
      "Upload and access academic resources — PDFs, lecture slides, and images organized by university and course.",
  },
  {
    icon: Handshake,
    title: "Borrow Requests",
    description:
      "A complete lifecycle from request to return — approve, hand over, track, and confirm returns all in one place.",
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    description:
      "Coordinate with owners, moderators, and fellow students through built-in real-time messaging.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Community",
    description:
      "Three-tier access control with moderator approval ensures every member of your campus is trusted and verified.",
  },
];

const roles = [
  {
    icon: Users,
    title: "Students",
    description:
      "List your own components for others to borrow. Browse and request equipment from peers. Upload and download course resources.",
    capabilities: [
      "List & manage components",
      "Borrow from other students",
      "Upload academic resources",
      "Track borrowing history",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Moderators",
    description:
      "Oversee your university's community. Approve or reject student registrations. Monitor resources and activity across campus.",
    capabilities: [
      "Approve / reject students",
      "View university-wide stats",
      "Manage resources & users",
      "Monitor recent activity",
    ],
  },
  {
    icon: BarChart3,
    title: "Admins",
    description:
      "Full platform control. Create universities and courses. Manage all users, resources, and components across the system.",
    capabilities: [
      "Manage all users & roles",
      "Create universities & courses",
      "Platform-wide analytics",
      "Full system control",
    ],
  },
];

const borrowSteps = [
  {
    step: "1",
    title: "Browse",
    description: "Search available components and resources across your university.",
    icon: Search,
  },
  {
    step: "2",
    title: "Request",
    description: "Submit a borrow request with your purpose, quantity, and expected return date.",
    icon: Clock,
  },
  {
    step: "3",
    title: "Approve",
    description: "The component owner reviews and approves your request.",
    icon: CheckCircle2,
  },
  {
    step: "4",
    title: "Borrow",
    description: "Pick up the item — the owner marks it as handed over.",
    icon: Handshake,
  },
  {
    step: "5",
    title: "Return",
    description: "When done, request a return and the owner confirms receipt.",
    icon: Layers,
  },
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

      {/* Features */}
      <section className="py-20 bg-bg-secondary/50">
        <MotionUp>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-3">
                Built for Campus <span className="text-accent-orange">Collaboration</span>
              </h2>
              <p className="text-secondary max-w-2xl mx-auto">
                Everything you need to discover, share, and manage university resources in one platform.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <MotionUp key={feature.title} delay={i * 0.1}>
                  <div className="p-6 rounded-2xl glass-card border border-border-color hover:border-accent-orange/30 transition-colors group h-full">
                    <div className="w-11 h-11 rounded-xl bg-accent-orange/10 flex items-center justify-center mb-4 group-hover:bg-accent-orange/20 transition-colors">
                      <feature.icon className="w-5 h-5 text-accent-orange" />
                    </div>
                    <h3 className="text-base font-bold text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </MotionUp>
              ))}
            </div>
          </div>
        </MotionUp>
      </section>

      {/* How It Works - Borrow Flow */}
      <section className="py-20">
        <MotionUp>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-3">
                How <span className="text-accent-orange">Borrowing</span> Works
              </h2>
              <p className="text-secondary max-w-2xl mx-auto">
                A simple, transparent flow from request to return.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {borrowSteps.map((step, i) => (
                <MotionUp key={step.step} delay={i * 0.1}>
                  <div className="relative p-5 rounded-2xl glass-card border border-border-color text-center h-full">
                    <div className="w-10 h-10 rounded-full bg-accent-orange text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                      {step.step}
                    </div>
                    <step.icon className="w-5 h-5 text-accent-orange mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-primary mb-1">
                      {step.title}
                    </h3>
                    <p className="text-secondary text-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </MotionUp>
              ))}
            </div>
          </div>
        </MotionUp>
      </section>

      {/* User Roles */}
      <section className="py-20 bg-bg-secondary/50">
        <MotionUp>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-3">
                Three Roles, <span className="text-accent-orange">One Platform</span>
              </h2>
              <p className="text-secondary max-w-2xl mx-auto">
                CampusSync supports a complete hierarchy — from students sharing gear to admins managing the entire system.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((role, i) => (
                <MotionUp key={role.title} delay={i * 0.15}>
                  <div className="p-6 rounded-2xl glass-card border border-border-color hover:border-accent-orange/30 transition-colors h-full flex flex-col">
                    <div className="w-11 h-11 rounded-xl bg-accent-orange/10 flex items-center justify-center mb-4">
                      <role.icon className="w-5 h-5 text-accent-orange" />
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-2">
                      {role.title}
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed mb-4">
                      {role.description}
                    </p>
                    <ul className="space-y-1.5 mt-auto">
                      {role.capabilities.map((cap) => (
                        <li
                          key={cap}
                          className="flex items-center gap-2 text-secondary text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </MotionUp>
              ))}
            </div>
          </div>
        </MotionUp>
      </section>

      {/* Universities & Courses */}
      <section className="py-20">
        <MotionUp>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="p-8 rounded-2xl glass-card border border-border-color">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-bg-secondary border border-border-color text-center">
                      <BookOpen className="w-6 h-6 text-accent-orange mx-auto mb-2" />
                      <div className="text-xs font-bold text-primary">CS-101</div>
                      <div className="text-[11px] text-secondary">Intro to CS</div>
                    </div>
                    <div className="p-4 rounded-xl bg-bg-secondary border border-border-color text-center">
                      <BookOpen className="w-6 h-6 text-accent-orange mx-auto mb-2" />
                      <div className="text-xs font-bold text-primary">ENG-204</div>
                      <div className="text-[11px] text-secondary">Circuit Design</div>
                    </div>
                    <div className="p-4 rounded-xl bg-bg-secondary border border-border-color text-center">
                      <BookOpen className="w-6 h-6 text-accent-orange mx-auto mb-2" />
                      <div className="text-xs font-bold text-primary">PHY-301</div>
                      <div className="text-[11px] text-secondary">Quantum Physics</div>
                    </div>
                    <div className="p-4 rounded-xl bg-bg-secondary border border-border-color text-center">
                      <BookOpen className="w-6 h-6 text-accent-orange mx-auto mb-2" />
                      <div className="text-xs font-bold text-primary">MED-410</div>
                      <div className="text-[11px] text-secondary">Biomedical Eng</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 order-1 lg:order-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary leading-tight">
                  Organized by
                  <br />
                  <span className="text-accent-orange">University & Course</span>
                </h2>
                <p className="text-secondary leading-relaxed">
                  Every resource on CampusSync is tied to a specific university and course. Admins create universities and add courses — either manually or via bulk import. Students register under their university and get access to a shared pool of components and resources relevant to their studies.
                </p>
                <div className="flex items-center gap-4 text-sm text-secondary">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent-orange" />
                    <span>University-scoped data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-accent-orange" />
                    <span>Bulk course import</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionUp>
      </section>

      {/* CTA */}
      <section className="py-20 bg-bg-secondary/50">
        <MotionUp>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-4">
              Ready to Transform Your Campus?
            </h2>
            <p className="text-secondary max-w-xl mx-auto mb-8">
              Join thousands of students already sharing resources, managing equipment, and collaborating more effectively.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button to="/signup" variant="primary" size="lg">
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button to="/login" variant="outline" size="lg">
                Sign In
              </Button>
            </div>
          </div>
        </MotionUp>
      </section>
    </div>
  );
};

export default About;
