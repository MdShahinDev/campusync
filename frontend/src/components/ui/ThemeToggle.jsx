import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
  onClick={toggleTheme}
  className={`relative p-2 rounded-xl transition-colors duration-300 cursor-pointer ${
    theme === "dark" ? "text-white" : "text-gray-700"
  }`}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  aria-label="Toggle theme"
>
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 180 : 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {theme === "dark" ? (
          <Sun size={18} strokeWidth={1.8} />
        ) : (
          <Moon size={18} strokeWidth={1.8} />
        )}
      </motion.div>
    </motion.button>
  );
}
