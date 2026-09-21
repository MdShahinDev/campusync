import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  Loader2,
  Filter,
  MapPin,
  User,
} from "lucide-react";
import api from "../services/axios";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const CATEGORIES = [
  "All",
  "Sensor",
  "Electronics",
  "Circuite",
  "Ardunio",
  "Cameras",
  "IoT Kits",
  "Projectors",
  "Audio",
];

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

export default function AllComponents({ basePath = "/components" }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/components");
      setComponents(res.data.data.components);
    } catch (err) {
      setError("Failed to load components");
    } finally {
      setLoading(false);
    }
  };

  const filtered = components.filter((c) => {
    const matchesSearch =
      !searchTerm ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || c.category === categoryFilter;

    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && c.available_quantity > 0) ||
      (availabilityFilter === "unavailable" && c.available_quantity <= 0);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary">
            All{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A00] to-[#FF6B00]">
              Components
            </span>
          </h1>
          <p className="text-text-muted mt-3 max-w-xl mx-auto">
            Browse available components from the community and request to borrow
            what you need.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Search by name, category, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 transition-shadow"
            />
          </div>
          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-8 py-3 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 appearance-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 appearance-none cursor-pointer"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-accent-orange" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-text-primary font-medium mb-2">{error}</p>
            <button
              onClick={fetchComponents}
              className="text-sm text-accent-orange hover:underline"
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
            <h3 className="text-lg font-bold text-text-primary mb-2">
              {searchTerm || categoryFilter !== "All" || availabilityFilter !== "all"
                ? "No components found"
                : "No components yet"}
            </h3>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              {searchTerm || categoryFilter !== "All" || availabilityFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Components will appear here once users list them for borrowing."}
            </p>
          </motion.div>
        )}

        {/* Components Grid */}
        {!loading && !error && filtered.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((comp) => (
              <motion.div
                key={comp._id}
                variants={item}
                className="glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                {/* Image */}
                <Link to={`${basePath}/${comp._id}`} className="block">
                  <div className="aspect-[407/305] bg-bg-secondary flex items-center justify-center overflow-hidden">
                    {comp.image_url ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}/components/${comp._id}/image`}
                        alt={comp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package size={48} className="text-text-muted" />
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link
                      to={`${basePath}/${comp._id}`}
                      className="min-w-0"
                    >
                      <h3 className="text-sm font-bold text-text-primary truncate hover:text-accent-orange transition-colors">
                        {comp.name}
                      </h3>
                    </Link>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${getConditionColor(
                        comp.condition
                      )}`}
                    >
                      {comp.condition}
                    </span>
                  </div>

                  <p className="text-xs text-text-muted mb-3 line-clamp-2">
                    {comp.description || "No description"}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
                    <span className="bg-bg-secondary px-2 py-0.5 rounded-full">
                      {comp.category}
                    </span>
                    <span
                      className={
                        comp.available_quantity > 0
                          ? "text-green-500 font-medium"
                          : "text-red-500 font-medium"
                      }
                    >
                      {comp.available_quantity}/{comp.quantity} available
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-text-muted mb-3">
                    <User size={12} className="shrink-0" />
                    <Link
                      to={`/user/${comp.owner_username || ""}`}
                      className="font-medium text-accent-orange hover:underline truncate"
                    >
                      {comp.owner_name}
                    </Link>
                  </div>

                  {comp.location && (
                    <div className="flex items-center gap-1 text-xs text-text-muted mb-3">
                      <MapPin size={12} />
                      <span className="truncate">{comp.location}</span>
                    </div>
                  )}

                  {/* Action */}
                  <div className="pt-3 border-t border-border-color">
                    <Link
                      to={`${basePath}/${comp._id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                      <Package size={14} />
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
