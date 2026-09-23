import MotionUp from "../components/animation/Motion";
import {
  BookOpen,
  Package,
  ShieldCheck,
  Search,
  Handshake,
  MessageCircle,
 
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
const Features = () => {
  return (
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
  )
}

export default Features
