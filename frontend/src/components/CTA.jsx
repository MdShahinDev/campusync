import {
  ArrowRight,
} from "lucide-react";
import Button from "../components/common/Button/Button";
import MotionUp from "../components/animation/Motion";
const CTA = () => {
  return (
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
  )
}

export default CTA
