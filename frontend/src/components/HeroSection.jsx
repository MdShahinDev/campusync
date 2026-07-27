import {  motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Button from "./common/Button/Button";
import MotionUp from "./animation/Motion";

const HeroSection = () => {
  return (
   
    <section className="relative pt-14 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-grid-pattern">
      {/* Background ambient lighting glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/15 to-amber-500/10 blur-[140px] rounded-full pointer-events-none dark:opacity-80 opacity-40"></div>
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-blue-500/15 to-indigo-500/10 blur-[140px] rounded-full pointer-events-none dark:opacity-60 opacity-30"></div>

        <MotionUp>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & Actions */}
          {/* <MotionUp> */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Top Silicon Valley Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card border border-orange-500/30 bg-orange-500/5 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-accent-orange font-bold">Next-Gen University Resource Managment</span>
              
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-5xl md:text-4xl xl:text-5xl font-extrabold tracking-tight text-primary leading-[1.08]">
              Share Campus Resources. <br />
              <span className="text-accent-orange">Book Anything.</span> <br />
              <span className="text-primary">Collaborate Better.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-lg text-secondary max-w-2xl leading-relaxed font-normal font-inter">
              Discover, reserve, and manage university resources from one intelligent platform. Connect laboratories, media gear, textbooks, study pods, and IoT hardware across all departments in real-time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button to={"/signup"} variant="primary" size="lg">
                <span>Get Started</span>
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Social Proof & Metrics */}
            <div className="pt-6 grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-black text-primary tracking-tight">10+</div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Departments Connected</div>
              </div>
              <div>
                <div className="text-2xl font-black text-primary tracking-tight">35,000+</div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Verified Shared Assets</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-500 dark:text-emerald-400 tracking-tight">99.4%</div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">On-Time Return Rate</div>
              </div>
            </div>
          </div>
          {/* </MotionUp> */}

          {/* Right Column: Floating Glass Cards & Interactive Ecosystem Visual */}
          <div className="lg:col-span-5 relative">
            
            {/* Center Connected Digital Ecosystem Diagram Background */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none p-6 rounded-3xl glass-card border border-slate-200/90 dark:border-white/10 shadow-2xl bg-white/70 dark:bg-[#0D1117]/80 backdrop-blur-2xl overflow-hidden">
              
              {/* Decorative Connected Pulse Lines SVG */}
              <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30">
                <svg className="w-full h-full" viewBox="0 0 400 500" fill="none">
                  <path d="M 50 100 Q 200 250 350 120" stroke="#FF8A00" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M 50 300 Q 200 200 350 380" stroke="#5DA8FF" strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx="200" cy="220" r="120" stroke="#FF8A00" strokeWidth="1" strokeOpacity="0.3" />
                  <circle cx="200" cy="220" r="180" stroke="#5DA8FF" strokeWidth="1" strokeOpacity="0.2" />
                </svg>
              </div>

              {/* Header inside right glass visual */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Live Campus Mesh Feed
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10">
                  Real-Time Updates
                </span>
              </div>

              {/* Stacked Live Floating Resource Cards */}
              

              {/* Bottom Telemetry Status Pill */}
              <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-orange-500/10 border border-orange-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    QR Code Scanning Automatic Return System
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  Latency: 12ms
                </span>
              </div>

            </div>

            {/* Floating Glow Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none"></div>
          </div>

        </div>
      </div>
      </MotionUp>
    </section>
  )
}

export default HeroSection
