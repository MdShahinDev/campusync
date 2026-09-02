import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, X, Loader2 } from "lucide-react";

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Search...",
  loading = false,
  renderOption,
  getOptionLabel,
  disabled = false,
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  const selectedLabel = value ? getOptionLabel(value) : "";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((opt) => {
    const label = getOptionLabel(opt);
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (opt) => {
    onChange(opt);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setSearch("");
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative" ref={ref}>
        <div
          onClick={() => {
            if (!disabled) {
              setOpen(!open);
              inputRef.current?.focus();
            }
          }}
          className={`w-full px-4 py-2.5 rounded-xl bg-bg-secondary border text-text-primary text-sm flex items-center gap-2 transition-colors ${
            disabled
              ? "opacity-50 cursor-not-allowed border-border-color"
              : "cursor-pointer border-border-color hover:border-accent-orange/30"
          } ${open ? "ring-2 ring-accent-orange/30 border-accent-orange/30" : ""}`}
        >
          {selectedLabel ? (
            <span className="flex-1 truncate">{selectedLabel}</span>
          ) : (
            <span className="flex-1 text-text-muted truncate">{placeholder}</span>
          )}
          {selectedLabel && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-text-muted hover:text-text-primary transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-text-muted shrink-0 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute z-30 w-full mt-1 bg-bg-primary border border-border-color rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col"
            >
              <div className="p-2 border-b border-border-color">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent-orange/30"
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={16} className="animate-spin text-text-muted" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="px-4 py-4 text-center text-xs text-text-muted">
                    No results found
                  </div>
                ) : (
                  filtered.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors ${
                        value && getOptionLabel(value) === getOptionLabel(opt)
                          ? "bg-accent-orange/5 text-accent-orange"
                          : "text-text-primary"
                      }`}
                    >
                      {renderOption ? renderOption(opt) : getOptionLabel(opt)}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
