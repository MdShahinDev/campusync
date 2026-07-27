import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { FAQS } from '../data/mockData';
import MotionUp from './animation/Motion';

export const FAQSection = () => {
  const [openId, setOpenId] = useState('faq-1');

  return (
    <MotionUp>
    <section id="faq" className="py-24 relative overflow-hidden bg-grid-pattern">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-orange-500/30 text-xs font-bold text-accent-orange uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            Everything You Need to Know
          </h2>
          <p className="text-base sm:text-lg text-text-secondary">
            Answers regarding SAML/SSO, security compliance, RFID lockers, and pilot deployment.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className="rounded-2xl glass-card border border-slate-200/80  bg-primary overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenId(isOpen ? '' : faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-base font-bold text-primary cursor-pointer">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 transition-transform duration-200 cursor-pointer ${isOpen ? 'rotate-180 text-[#FF8A00]' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-4 text-sm text-primary border-t border-slate-100 dark:border-white/5 leading-relaxed font-normal">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
    </MotionUp>
  );
};
