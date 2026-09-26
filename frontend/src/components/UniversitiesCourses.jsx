
import {
  BookOpen,
  Upload,
  Zap,
} from "lucide-react";
import MotionUp from "../components/animation/Motion";

const UniversitiesCourses = () => {
  return (
    <div>
      <section className="py-16 md:py-24">
        <MotionUp initialY={40}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                {/* Hairline course grid */}
                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border-color bg-border-color">
                  <div className="bg-bg-primary p-5 text-center">
                    <BookOpen className="w-5 h-5 text-accent-orange mx-auto mb-2.5" />
                    <div className="text-[13px] font-semibold text-text-primary">CS-101</div>
                    <div className="text-xs text-text-muted mt-0.5">Intro to CS</div>
                  </div>
                  <div className="bg-bg-primary p-5 text-center">
                    <BookOpen className="w-5 h-5 text-accent-orange mx-auto mb-2.5" />
                    <div className="text-[13px] font-semibold text-text-primary">ENG-204</div>
                    <div className="text-xs text-text-muted mt-0.5">Circuit Design</div>
                  </div>
                  <div className="bg-bg-primary p-5 text-center">
                    <BookOpen className="w-5 h-5 text-accent-orange mx-auto mb-2.5" />
                    <div className="text-[13px] font-semibold text-text-primary">PHY-301</div>
                    <div className="text-xs text-text-muted mt-0.5">Quantum Physics</div>
                  </div>
                  <div className="bg-bg-primary p-5 text-center">
                    <BookOpen className="w-5 h-5 text-accent-orange mx-auto mb-2.5" />
                    <div className="text-[13px] font-semibold text-text-primary">MED-410</div>
                    <div className="text-xs text-text-muted mt-0.5">Biomedical Eng</div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 order-1 lg:order-2">
                <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary leading-tight tracking-tight">
                  Organized by
                  <br />
                  University &amp; Course
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  Every resource on CampusSync is tied to a specific university and course. Admins create universities and add courses — either manually or via bulk import. Students register under their university and get access to a shared pool of components and resources relevant to their studies.
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-secondary">
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
    </div>
  )
}

export default UniversitiesCourses
