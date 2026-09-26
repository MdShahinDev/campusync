import { Link } from 'react-router-dom';
import { Layers, BookOpen, Cpu, RotateCcw, Users, GraduationCap, Shield, ChevronRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="font-inter bg-slate-900 dark:bg-[#06080D] text-slate-400 text-xs border-t border-slate-800 dark:border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800 dark:border-white/10">

          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF8A00] to-[#FF6B00] text-white">
                <Layers className="w-[18px] h-[18px]" />
              </div>
              <span className="font-semibold text-lg text-white tracking-tight">
                <span className="text-accent-orange">Campus Sync</span>
              </span>
            </div>

            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              University resource-sharing platform connecting students, moderators, and administrators to share equipment, academic resources, and collaborate across departments in real-time.
            </p>

            {/* <div className="flex items-center gap-3 pt-1">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <Link to="/contact" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </Link>
            </div> */}
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/components" className="hover:text-white transition-colors">Browse Components</Link></li>
              <li><Link to="/resources" className="hover:text-white transition-colors">Resource Library</Link></li>
            </ul>
          </div>

          {/* Col 3: Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Features</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Cpu className="w-3 h-3 text-accent-orange" />
                <span>Component Sharing</span>
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="w-3 h-3 text-accent-orange" />
                <span>Academic Resources</span>
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="w-3 h-3 text-accent-orange" />
                <span>Borrow & Return System</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-accent-orange" />
                <span>Role-based Access</span>
              </li>
            </ul>
          </div>

          {/* Col 4: For Users */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">For Users</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <GraduationCap className="w-3 h-3 text-accent-blue" />
                <Link to="/signup" className="hover:text-white transition-colors">Student Sign Up</Link>
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-3 h-3 text-accent-blue" />
                <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-accent-blue" />
                <Link to="/admin/signup" className="hover:text-white transition-colors">Admin Sign Up</Link>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center gap-1 text-accent-orange hover:text-accent-orange-hover font-semibold transition-colors"
              >
                Get Started <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Legal bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Resora Inc. All rights reserved. Design & Developed By Code Commandos
          </div>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-slate-300">Terms of Service</Link>
            <Link to="/about" className="hover:text-slate-300">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
