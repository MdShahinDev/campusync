import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Package,
  Loader2,
  Search,
  Trash2,
  Edit,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import api from "../../../services/axios";
import { useAuth } from "../../../context/AuthContext";

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

export default function MyComponents() {
  const { user } = useAuth();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/components/my");
      setComponents(res.data.data.components);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this component?")) return;
    try {
      setDeleting(id);
      await api.delete(`/components/${id}`);
      setComponents((prev) => prev.filter((c) => c._id !== id));
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  };

  const filtered = components.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.category?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            My Components
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            Manage components you&apos;ve listed for borrowing.
          </p>
        </div>
        {user && user.isVerified !== false ? (
          <Link
            to="/student/add-component"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 self-start"
          >
            <Plus size={16} />
            Add Component
          </Link>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 font-bold text-sm self-start cursor-not-allowed">
            <AlertTriangle size={16} />
            Verification Required
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          placeholder="Search your components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={32} className="animate-spin text-accent-orange" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center mx-auto mb-4">
            <Package size={36} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {searchTerm ? "No components found" : "No components yet"}
          </h3>
          <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
            {searchTerm
              ? "Try a different search term."
              : "List your first component so others can borrow it."}
          </p>
          {!searchTerm && (
            <Link
              to="/student/add-component"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Plus size={16} />
              Add Component
            </Link>
          )}
        </motion.div>
      )}

      {/* Components Grid */}
      {!loading && filtered.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((comp) => (
            <motion.div
              key={comp._id}
              variants={item}
              className="glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image */}
              <div className="aspect-[407/305] bg-bg-secondary flex items-center justify-center overflow-hidden">
                {comp.image_url ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/components/${comp._id}/image`}
                    alt={comp.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={40} className="text-text-muted" />
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-text-primary truncate">
                    {comp.name}
                  </h3>
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
                  <span>
                    {comp.available_quantity}/{comp.quantity} available
                  </span>
                </div>

                {comp.location && (
                  <div className="flex items-center gap-1 text-xs text-text-muted mb-3">
                    <MapPin size={12} />
                    <span className="truncate">{comp.location}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border-color">
                  <Link
                    to={`/student/edit-component/${comp._id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-accent-orange hover:bg-accent-orange/10 transition-colors"
                  >
                    <Edit size={12} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(comp._id)}
                    disabled={deleting === comp._id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                  >
                    {deleting === comp._id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
