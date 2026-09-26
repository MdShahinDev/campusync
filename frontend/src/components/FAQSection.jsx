import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { FAQS } from '../data/mockData';
import MotionUp from './animation/Motion';

export const FAQSection = () => {
  const [openId, setOpenId] = useState('faq-1');

  return (
    <MotionUp initialY={40}>
      <section id="faq" className="py-16 md:py-24 bg-bg-secondary border-y border-border-color">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="mb-10 md:mb-12">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-orange">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              Everything You Need to Know
            </h2>
            <p className="mt-4 text-base text-text-secondary">
              Answers regarding SAML/SSO, security compliance, RFID lockers, and pilot deployment.
            </p>
          </div>

          {/* Accordion */}
          <div className="divide-y divide-border-color overflow-hidden rounded-xl border border-border-color bg-bg-primary">
            {FAQS.map((faq) => {
              const isOpen = openId === faq.id;

              return (
                <div key={faq.id}>
                  <button
                    onClick={() => setOpenId(isOpen ? '' : faq.id)}
                    aria-expanded={isOpen}
                    className="w-full px-5 py-4 sm:px-6 text-left flex items-center justify-between gap-4 transition-colors hover:bg-bg-secondary focus:outline-none"
                  >
                    <span className="text-[15px] font-medium text-text-primary">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-text-muted transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-accent-orange' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 text-sm text-text-secondary leading-relaxed">
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
