import {
  Users,
  ShieldCheck,

  CheckCircle2,

  BarChart3,
 
} from "lucide-react";
import MotionUp from "../components/animation/Motion";
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
const UserRoles = () => {
  return (
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
  )
}

export default UserRoles
