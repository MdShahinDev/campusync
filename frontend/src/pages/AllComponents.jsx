import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Loader2,
  MapPin,
  User,
  Trash2,
  SlidersHorizontal,
  X,
  Check,
  GraduationCap,
} from "lucide-react";
import SearchInput from "../components/common/SearchInput";
import api from "../services/axios";

const CONDITIONS = ["New", "Excellent", "Good", "Fair", "Poor"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function getConditionColor(condition) {
  switch (condition) {
    case "New":
      return "bg-green-500/10 text-green-500";
    case "Excellent":
      return "bg-blue-500/10 text-blue-500";
    case "Good":
      return "bg-accent-orange/10 text-accent-orange";
    case "Fair":
      return "bg-yellow-500/10 text-yellow-500";
    case "Poor":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
}

function CheckboxFilter({ label, checked, onChange }) {
  return (
    <label
      onClick={(e) => { e.preventDefault(); onChange(); }}
      className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-bg-secondary transition-colors group"
    >
      <div
        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all duration-150 ${
          checked
            ? "bg-accent-orange border-accent-orange"
            : "border-border-color group-hover:border-text-muted"
        }`}
      >
        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </div>
      <span className="text-xs font-medium text-text-secondary">{label}</span>
    </label>
  );
}

export default function AllComponents({ basePath = "/components", showDelete = false }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedUniversities, setSelectedUniversities] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const availableCategories = useMemo(() => {
    const cats = [...new Set(components.map((c) => c.category).filter(Boolean))];
    return cats.sort();
  }, [components]);

  const availableUniversities = useMemo(() => {
    const unis = components
      .map((c) => c.university)
      .filter((u) => u && u._id && u.name);
    const unique = [...new Map(unis.map((u) => [u._id, u])).values()];
    return unique.sort((a, b) => a.name.localeCompare(b.name));
  }, [components]);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/components");
      setComponents(res.data.data.components);
    } catch {
      setError("Failed to load components");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete component "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/components/${id}`);
      setComponents((prev) => prev.filter((c) => c._id !== id));
    } catch {
      alert("Failed to delete component");
    }
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleCondition = (cond) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const toggleUniversity = (uniId) => {
    setSelectedUniversities((prev) =>
      prev.includes(uniId) ? prev.filter((u) => u !== uniId) : [...prev, uniId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedConditions([]);
    setSelectedUniversities([]);
    setSearchTerm("");
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedConditions.length > 0 ||
    selectedUniversities.length > 0 ||
    searchTerm.length > 0;

  const filtered = useMemo(() => {
    return components.filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(c.category);

      const matchesCondition =
        selectedConditions.length === 0 || selectedConditions.includes(c.condition);

      const matchesUniversity =
        selectedUniversities.length === 0 ||
        (c.university && selectedUniversities.includes(c.university._id));

      return matchesSearch && matchesCategory && matchesCondition && matchesUniversity;
    });
  }, [components, searchTerm, selectedCategories, selectedConditions, selectedUniversities]);

  const activeFilterCount = selectedCategories.length + selectedConditions.length + selectedUniversities.length;

  const filterContent = (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 px-2">
          Category
        </h3>
        <div className="space-y-0.5">
          {availableCategories.map((cat) => (
            <CheckboxFilter
              key={cat}
              label={cat}
              checked={selectedCategories.includes(cat)}
              onChange={() => toggleCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 px-2">
          Condition
        </h3>
        <div className="space-y-0.5">
          {CONDITIONS.map((cond) => (
            <CheckboxFilter
              key={cond}
              label={cond}
              checked={selectedConditions.includes(cond)}
              onChange={() => toggleCondition(cond)}
            />
          ))}
        </div>
      </div>

      {/* University */}
      {availableUniversities.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 px-2">
            University
          </h3>
          <div className="space-y-0.5">
            {availableUniversities.map((uni) => (
              <CheckboxFilter
                key={uni._id}
                label={uni.name}
                checked={selectedUniversities.includes(uni._id)}
                onChange={() => toggleUniversity(uni._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full px-3 py-2 rounded-lg text-xs font-medium text-accent-orange hover:bg-accent-orange/10 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          All{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A00] to-[#FF6B00]">
            Components
          </span>
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          {showDelete
            ? "Manage all components across the platform."
            : "Browse available components from the community and request to borrow what you need."}
        </p>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-3">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, category, or owner..."
          className="flex-1"
        />
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-xs font-medium hover:bg-bg-tertiary transition-colors shrink-0"
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-accent-orange text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-bg-primary border-r border-border-color z-50 lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-border-color">
                <h2 className="text-sm font-bold text-text-primary">Filters</h2>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4">{filterContent}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-20 rounded-xl border border-border-color bg-bg-card p-4">
            <h2 className="text-xs font-bold text-text-primary mb-3">Filters</h2>
            {filterContent}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Result Count */}
          {!loading && !error && (
            <p className="text-xs text-text-muted mb-4">
              {filtered.length} {filtered.length === 1 ? "component" : "components"} found
            </p>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={28} className="animate-spin text-accent-orange" />
                <p className="text-xs text-text-muted">Loading components...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Package size={24} className="text-red-500" />
              </div>
              <p className="text-sm font-semibold text-text-primary mb-1">{error}</p>
              <button
                onClick={fetchComponents}
                className="text-xs text-accent-orange hover:underline font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center mx-auto mb-4">
                <Package size={36} className="text-text-muted" />
              </div>
              <h3 className="text-base font-bold text-text-primary mb-1.5">
                {hasActiveFilters ? "No components found" : "No components yet"}
              </h3>
              <p className="text-xs text-text-muted mb-5 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "Try adjusting your search or filters."
                  : "Components will appear here once users list them for borrowing."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-accent-orange hover:underline font-medium"
                >
                  Clear all filters
                </button>
              )}
            </motion.div>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
            >
              {filtered.map((comp) => (
                <motion.div
                  key={comp._id}
                  variants={item}
                  className="rounded-xl border border-border-color bg-bg-card overflow-hidden hover:shadow-md transition-all duration-200 group"
                >
                  {/* Image */}
                  <Link to={`${basePath}/${comp._id}`} className="block">
                    <div className="aspect-[16/9] bg-bg-secondary flex items-center justify-center overflow-hidden">
                      {comp.image_url ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/components/${comp._id}/image`}
                          alt={comp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package size={32} className="text-text-muted/30" />
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link to={`${basePath}/${comp._id}`} className="min-w-0">
                        <h3 className="text-[13px] font-bold text-text-primary truncate hover:text-accent-orange transition-colors">
                          {comp.name}
                        </h3>
                      </Link>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${getConditionColor(
                          comp.condition
                        )}`}
                      >
                        {comp.condition}
                      </span>
                    </div>

                    <p className="text-[11px] text-text-muted mb-2 line-clamp-2 leading-relaxed">
                      {comp.description || "No description"}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-text-muted mb-2">
                      <span className="bg-bg-secondary px-2 py-0.5 rounded-md font-medium">
                        {comp.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-text-muted mb-1">
                      <User size={11} className="shrink-0" />
                      <Link
                        to={`/user/${comp.owner_username || ""}`}
                        className="font-medium text-accent-orange hover:underline truncate"
                      >
                        {comp.owner_name}
                      </Link>
                    </div>

                    {comp.university?.name && (
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted mb-1">
                        <GraduationCap size={11} className="shrink-0" />
                        <span className="truncate">{comp.university.name}</span>
                      </div>
                    )}

                    {comp.location && (
                      <div className="flex items-center gap-1 text-[11px] text-text-muted mb-2">
                        <MapPin size={11} />
                        <span className="truncate">{comp.location}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 border-t border-border-color flex gap-2">
                      <Link
                        to={`${basePath}/${comp._id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white text-xs font-bold shadow-sm shadow-orange-500/20 hover:shadow-md hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                      >
                        <Package size={12} />
                        View Details
                      </Link>
                      {showDelete && (
                        <button
                          onClick={() => handleDelete(comp._id, comp.name)}
                          className="px-2.5 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          title="Delete component"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
