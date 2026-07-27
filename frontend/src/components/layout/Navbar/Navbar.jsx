import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Layers, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../common/Button/Button";
import ThemeToggle from "../../ui/ThemeToggle";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Courses", href: "/courses" },
  { name: "Instructors", href: "/instructors" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  return (
   <motion.nav
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  transition={{ type: "spring", stiffness: 100, damping: 20 }}
  className={`sticky top-0 z-50 w-full transition-all duration-300
    bg-bg-primary
    border-b border-border-color
    ${scrolled ? "shadow-lg backdrop-blur-xl" : "backdrop-blur-md"}
  `}
>
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 10)}
      >
        <div className="flex items-center justify-between h-16 md:h-18">
          <div className="shrink-0">
            <Link to="/"
            href="#"
            className="flex items-center gap-3 group focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A00] to-[#FF6B00] text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
              <Layers className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-accent-orange">
                  Resora
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">
                Resource Infrastructure
              </span>
            </div>
          </Link>
          </div>

          <div className="hidden md:flex items-center justify-center flex-1 mx-8">
            <ul className="flex items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={link.href}
                    className="relative text-sm font-bold transition-colors duration-200 group text-text-primary hover:text-accent-orange"
                  >
                    {link.name}
                    <span
                      className="absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full w-0"
                      style={{ backgroundColor: "var(--accent-orange)" }}
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
              
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button to={"/login"} variant="outline" size="sm" className="font-bold">
              Login
            </Button>
            <Button to={"/signup"} variant="primary" size="sm" className="flex items-center gap-2 font-bold">
              Sign up<ArrowRight size={17}/>
            </Button>
          </div>


          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl"
              style={{ color: "var(--text-primary)" }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-bold transition-colors duration-200 text-text-primary hover:text-accent-orange"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-4 flex flex-col gap-3 font-semibold">
                <div onClick={() => setIsOpen(!isOpen)}>
                <Button to={"/login"} variant="outline" size="lg" className="font-bold w-full">
                Login  
                </Button>
                </div>
                <div onClick={() => setIsOpen(!isOpen)}>
                <Button to={"/signup"} variant="primary" size="lg" className="font-bold w-full">
                Sign up<ArrowRight size={17}/>
                </Button>
                </div>
                
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
