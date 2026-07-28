
import { Layers,   Mail} from 'lucide-react';
export const Footer = () => {
  return (
    <footer className="bg-slate-900 dark:bg-[#06080D] text-slate-400 text-xs border-t border-slate-800 dark:border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800 dark:border-white/10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8A00] to-[#FF6B00] text-white">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                <span className="text-accent-orange">Campus Sync</span>
              </span>
            </div>

            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              Next-generation Silicon Valley SaaS infrastructure for university resource sharing, contactless RFID lockers, and intelligent academic asset management.
            </p>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Smart Search</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Instant Booking</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">QR Drop Cabinets</a></li>
              <li><a href="#dashboard" className="hover:text-white transition-colors">Control Tower</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Col 3: Resources & Docs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li><p  className="hover:text-white transition-colors">API Reference</p></li>
              <li><p  className="hover:text-white transition-colors">SAML / SSO Setup</p></li>
              <li><p  className="hover:text-white transition-colors">RFID IoT Hardware Guide</p></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Security & SOC2 Compliance</a></li>
              <li><p  className="hover:text-white transition-colors">Interactive Demo Sandbox</p></li>
            </ul>
          </div>

          {/* Col 4: Network & Connect */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Connect</h4>
            <div className="flex items-center gap-3 pt-1">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                {/* <Github className="w-4 h-4" /> */}
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                {/* <Twitter className="w-4 h-4" /> */}
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                {/* <Linkedin className="w-4 h-4" /> */}
              </a>
              <a href="mailto:support@campusshare.edu" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Legal bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Resora Inc. All rights reserved. Design & Developed By Code Commandos
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Security Center</a>
            <a href="#" className="hover:text-slate-300">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
