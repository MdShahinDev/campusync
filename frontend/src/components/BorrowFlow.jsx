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
  )
}

export default BorrowFlow
