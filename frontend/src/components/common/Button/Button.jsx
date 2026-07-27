import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  href,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg transition-all duration-300 cursor-pointer";

  const variants = {
    primary:
      // "relative inline-flex items-center justify-center gap-2 text-xs text-white rounded-lg bg-gradient-to-r from-accent-orange to-accent-orange hover:from-accent-orange-hover hover:to-accent-orange-hover shadow-md shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-200",
      // "bg-accent-orange border border-border-color text-white transition-all duration-300 shadow-md shadow-orange-500/20 hover:shadow-orange-500/40",
      "group relative inline-flex items-center justify-center gap-3 text-sm font-extrabold text-white rounded-2xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] hover:from-[#FF9A15] hover:to-[#FF7B10] shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200",
    outline:
      "bg-transparent border border-border-color text-text-primary hover:bg-bg-secondary",

    ghost:
      "bg-transparent text-text-primary hover:bg-bg-secondary",

    secondary:
      "bg-bg-secondary text-text-primary border border-border-color hover:bg-bg-tertiary",
  };

  const sizes = {
    sm: "px-6 py-2 text-sm",
    md: "px-5 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const animation = {
    whileHover: disabled ? {} : { scale: 1.03 },
    whileTap: disabled ? {} : { scale: 0.97 },
  };

  // React Router Link
  if (to) {
    return (
      <motion.div {...animation}>
        <Link to={to} className={classes} onClick={onClick} {...props}>
          {children}
        </Link>
      </motion.div>
    );
  }

  // External Link
  if (href) {
    return (
      <motion.div {...animation}>
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      </motion.div>
    );
  }

  // Normal Button
  return (
    <motion.button
      {...animation}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${classes} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      {...props}
    >
      {children}
    </motion.button>
  );
}