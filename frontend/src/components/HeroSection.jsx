import { ArrowRight } from "lucide-react";
import Button from "./common/Button/Button";
import MotionUp from "./animation/Motion";
import usePublicStats from "../hooks/usePublicStats";
import banner from "../assets/banner.webp";

const HeroSection = () => {
  const { loading, formatStat } = usePublicStats();

  return (
    <section className="relative pt-14 pb-16 md:pt-28 md:pb-24">
      <MotionUp initialY={24}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-orange">
                Next-Gen University Resource Managment
              </p>

              {/* Main Headline */}
              <h1 className="text-[1.75rem] leading-[1.15] sm:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary">
                Share Campus Resources.{" "}
                <span className="text-accent-orange">Book Anything.</span>{" "}
                Collaborate Better.
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
                Discover, reserve, and manage university resources from one intelligent platform. Connect laboratories, media gear, textbooks, study pods, and IoT hardware across all departments in real-time.
              </p>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Button to={"/signup"} variant="primary" size="lg">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Metrics */}
              <div className="pt-7 grid grid-cols-3 gap-6 border-t border-border-color">
                <div>
                  <div
                    className={`text-2xl font-semibold text-text-primary tracking-tight tabular-nums ${
                      loading ? "animate-pulse" : ""
                    }`}
                  >
                    {formatStat("universities")}
                  </div>
                  <div className="mt-1 text-[13px] text-text-muted">
                    Universities Connected
                  </div>
                </div>
                <div>
                  <div
                    className={`text-2xl font-semibold text-text-primary tracking-tight tabular-nums ${
                      loading ? "animate-pulse" : ""
                    }`}
                  >
                    {formatStat("courses")}
                  </div>
                  <div className="mt-1 text-[13px] text-text-muted">Courses</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">
                    99.4%
                  </div>
                  <div className="mt-1 text-[13px] text-text-muted">
                    On-Time Return Rate
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Product visual */}
            <div className="lg:col-span-5">
              <img
                src={banner}
                alt="Hero Banner"
                className="w-full rounded-xl border border-border-color bg-bg-secondary"
              />
            </div>
          </div>
        </div>
      </MotionUp>
    </section>
  );
};

export default HeroSection;
