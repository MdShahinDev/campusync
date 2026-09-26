import MotionUp from "../components/animation/Motion";
import {
  Search,
  Handshake,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

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

const BorrowFlow = () => {
  return (
    <section className="py-16 md:py-24">
      <MotionUp initialY={40}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              How Borrowing Works
            </h2>
            <p className="mt-4 text-base text-text-secondary max-w-2xl">
              A simple, transparent flow from request to return.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {borrowSteps.map((step, i) => (
              <MotionUp key={step.step} delay={i * 0.06} initialY={30} className="h-full">
                <div className="h-full rounded-xl border border-border-color bg-bg-card p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-orange/30 bg-accent-orange/10 text-xs font-semibold text-accent-orange tabular-nums">
                      {step.step}
                    </span>
                    <step.icon className="w-4 h-4 text-text-muted" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-text-secondary leading-relaxed">
                    {step.description}
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

export default BorrowFlow
