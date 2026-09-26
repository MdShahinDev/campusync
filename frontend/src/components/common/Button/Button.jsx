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
    "inline-flex items-center justify-center rounded-lg font-inter font-semibold transition-colors duration-200 cursor-pointer";

  const variants = {
    primary:
      "gap-2.5 text-sm text-white bg-accent-orange hover:bg-accent-orange-hover shadow-sm shadow-orange-500/15 hover:shadow-md hover:shadow-orange-500/25",
    outline:
      "bg-transparent border border-border-color text-text-primary hover:bg-bg-secondary hover:border-text-muted/40",
    ghost:
      "bg-transparent text-text-primary hover:bg-bg-secondary",
    secondary:
      "bg-bg-secondary text-text-primary border border-border-color hover:bg-bg-tertiary",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2 text-sm",
    lg: "px-6 py-3 text-[15px]",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  // React Router Link
  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} {...props}>
        {children}
      </Link>
    );
  }

  // External Link
  if (href) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    );
  }

  // Normal Button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${classes} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
