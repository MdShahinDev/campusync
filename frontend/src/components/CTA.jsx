import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button/Button";
import MotionUp from "../components/animation/Motion";

const CTA = () => {
  return (
    <section className="relative overflow-hidden bg-[#0B1220] py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark" />
      <MotionUp initialY={30}>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Ready to Transform Your Campus?
          </h2>
          <p className="mt-4 text-base text-white/60 max-w-xl mx-auto leading-relaxed">
            Join thousands of students already sharing resources, managing equipment, and collaborating more effectively.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button to="/signup" variant="primary" size="lg">
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </MotionUp>
    </section>
  )
}

export default CTA
