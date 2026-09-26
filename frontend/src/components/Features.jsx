import MotionUp from "../components/animation/Motion";
import {
  BookOpen,
  Package,
  ShieldCheck,
  Search,
  Handshake,
} from "lucide-react";

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
    icon: ShieldCheck,
    title: "Verified Community",
    description:
      "Three-tier access control with moderator approval ensures every member of your campus is trusted and verified.",
  },
];

const Features = () => {
  return (
    <section className="py-16 md:py-24 bg-bg-secondary">
      <MotionUp initialY={40}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              Built for Campus Collaboration
            </h2>
            <p className="mt-4 text-base text-text-secondary max-w-2xl">
              Everything you need to discover, share, and manage university resources in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <MotionUp key={feature.title} delay={i * 0.06} initialY={30} className="h-full">
                <div className="h-full rounded-xl border border-border-color bg-bg-card p-6 transition-colors duration-200 hover:border-accent-orange/40">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-orange/10">
                    <feature.icon className="w-5 h-5 text-accent-orange" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </MotionUp>
            ))}
          </div>
        </div>
      </MotionUp>
    </section>
  )
}

export default Features
