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
    <section className="py-16 md:py-24 bg-bg-secondary">
      <MotionUp initialY={40}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              Three Roles, One Platform
            </h2>
            <p className="mt-4 text-base text-text-secondary max-w-2xl">
              CampusSync supports a complete hierarchy — from students sharing gear to admins managing the entire system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {roles.map((role, i) => (
              <MotionUp key={role.title} delay={i * 0.08} initialY={30}>
                <div className="border-t-2 border-text-primary/10 pt-6 dark:border-white/10">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-orange/10">
                    <role.icon className="w-5 h-5 text-accent-orange" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {role.title}
                  </h3>
                  <p className="text-[13px] text-text-secondary leading-relaxed mb-5">
                    {role.description}
                  </p>
                  <ul className="space-y-2">
                    {role.capabilities.map((cap) => (
                      <li
                        key={cap}
                        className="flex items-center gap-2 text-[13px] text-text-secondary"
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
