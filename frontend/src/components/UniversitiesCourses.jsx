
import {
  BookOpen,

  Upload,

  Zap,
} from "lucide-react";
import MotionUp from "../components/animation/Motion";

const UniversitiesCourses = () => {
  return (
    <div>
      <section className="py-20">
        <MotionUp>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="p-8 rounded-2xl glass-card border border-border-color">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-bg-secondary border border-border-color text-center">
                      <BookOpen className="w-6 h-6 text-accent-orange mx-auto mb-2" />
                      <div className="text-xs font-bold text-primary">CS-101</div>
                      <div className="text-[11px] text-secondary">Intro to CS</div>
                    </div>
                    <div className="p-4 rounded-xl bg-bg-secondary border border-border-color text-center">
                      <BookOpen className="w-6 h-6 text-accent-orange mx-auto mb-2" />
                      <div className="text-xs font-bold text-primary">ENG-204</div>
                      <div className="text-[11px] text-secondary">Circuit Design</div>
                    </div>
                    <div className="p-4 rounded-xl bg-bg-secondary border border-border-color text-center">
                      <BookOpen className="w-6 h-6 text-accent-orange mx-auto mb-2" />
                      <div className="text-xs font-bold text-primary">PHY-301</div>
                      <div className="text-[11px] text-secondary">Quantum Physics</div>
                    </div>
                    <div className="p-4 rounded-xl bg-bg-secondary border border-border-color text-center">
                      <BookOpen className="w-6 h-6 text-accent-orange mx-auto mb-2" />
                      <div className="text-xs font-bold text-primary">MED-410</div>
                      <div className="text-[11px] text-secondary">Biomedical Eng</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 order-1 lg:order-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary leading-tight">
                  Organized by
                  <br />
                  <span className="text-accent-orange">University & Course</span>
                </h2>
                <p className="text-secondary leading-relaxed">
                  Every resource on CampusSync is tied to a specific university and course. Admins create universities and add courses — either manually or via bulk import. Students register under their university and get access to a shared pool of components and resources relevant to their studies.
                </p>
                <div className="flex items-center gap-4 text-sm text-secondary">
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
