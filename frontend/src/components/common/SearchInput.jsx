import { Search, X } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange/40 hover:border-border-color transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
