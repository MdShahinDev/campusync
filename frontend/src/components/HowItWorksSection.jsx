
import { ArrowRight, CalendarCheck, CheckCircle, Cpu, QrCode, ScanLine, Search, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { useState } from 'react';
import { WORKFLOW_STEPS } from '../data/mockData';
import MotionUp from './animation/Motion';

export const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(1);

  const getStepIcon = (iconName) => {
    switch (iconName) {
      case 'Search': return Search;
      case 'CalendarCheck': return CalendarCheck;
      case 'ShieldCheck': return ShieldCheck;
      case 'ScanLine': return ScanLine;
      case 'Cpu': return Cpu;
      case 'QrCode': return QrCode;
      case 'Star': return Star;
      default: return CheckCircle;
    }
  };

  const currentStepData = WORKFLOW_STEPS.find((s) => s.step === activeStep) || WORKFLOW_STEPS[0];
  const StepIcon = getStepIcon(currentStepData.icon);

  return (
    <div className="py-24 relative overflow-hidden bg-grid-pattern">
    <MotionUp>
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-primary ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-orange-500/30 text-xs font-bold text-accent-orange uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> End-To-End Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            Seven Steps to Seamless Resource Sharing
          </h2>
          <p className="text-base sm:text-lg text-secondary font-inter">
            From cross-campus search to automated QR return, experience a frictionless borrowing ecosystem.
          </p>
        </div>

        {/* Animated Horizontal Timeline Bar */}
        <div className="relative mb-12">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-white/10 -translate-y-1/2 z-0"></div>
          <div
            className="hidden lg:block absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#FF8A00] to-[#FF6B00] -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((activeStep - 1) / 6) * 100}%` }}
          ></div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 relative z-10">
            {WORKFLOW_STEPS.map((stepItem) => {
              const IconComponent = getStepIcon(stepItem.icon);
              const isActive = stepItem.step === activeStep;
              const isPassed = stepItem.step < activeStep;

              return (
                <button
                  key={stepItem.step}
                  onClick={() => setActiveStep(stepItem.step)}
                  className={`p-3.5 rounded-2xl transition-all duration-300 text-left flex flex-col items-center sm:items-start group ${
                    isActive
                      ? 'bg-gradient-to-b from-[#FF8A00] to-[#FF6B00] text-white shadow-xl shadow-orange-500/25 scale-105'
                      : isPassed
                      ? 'glass-card border border-orange-500/30 bg-orange-500/10 text-primary'
                      : 'glass-card border border-slate-200/80  bg-white text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={`p-2 rounded-xl text-xs font-bold ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-accent-orange'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                      0{stepItem.step}
                    </span>
                  </div>

                  <span className={`text-xs font-extrabold ${isActive ? 'text-primary' : 'text-primary'}`}>
                    {stepItem.title}
                  </span>
                  <span className={`text-[10px] truncate max-w-full ${isActive ? 'text-primary' : 'text-primary'}`}>
                    {stepItem.subtitle}22
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Detail Spotlight Card */}
        <div className="p-8 sm:p-10 rounded-3xl glass-card border border-slate-200  bg-primary shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-[#FF8A00] border border-orange-500/20">
                  Step {currentStepData.step} of 7 • {currentStepData.badge}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-primary">
                {currentStepData.title}: {currentStepData.subtitle}
              </h3>

              <p className="text-base text-secondary font-inter leading-relaxed font-normal">
                {currentStepData.detail}
              </p>

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => setActiveStep(activeStep < 7 ? activeStep + 1 : 1)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF8A00] to-[#FF6B00] shadow-md shadow-orange-500/20 hover:shadow-orange-500/40 flex items-center gap-2 cursor-pointer"
                >
                  <span>{activeStep === 7 ? 'Restart Tour' : 'Next Step'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Icon Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="p-5 rounded-xl bg-gradient-to-br from-orange-500/15 via-blue-500/10 to-orange-500/5 border border-orange-500/20  flex flex-col items-center justify-center text-center space-y-3 w-full max-w-xs shadow-inner">
                <div className="p-5 rounded-2xl bg-primary border border-orange-500/30 text-accent-orange shadow-xl">
                  <StepIcon className="w-10 h-10" />
                </div>
                <div className=" text-xs font-bold text-accent-orange uppercase tracking-widest pt-2">
                  {currentStepData.badge}
                </div>
                <p className="text-[11px] text-secondary">
                  Verified RFID & Cloud Sync Active
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
    </MotionUp>
    </div>
  );
};
