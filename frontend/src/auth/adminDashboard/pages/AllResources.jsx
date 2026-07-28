import { motion } from "framer-motion";
import { BookOpen, Filter, Search, Edit, Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const resources = [
  { id: 1, name: "Conference Room A", type: "Room", status: "Available", capacity: "20", addedBy: "Admin" },
  { id: 2, name: "Lab B", type: "Laboratory", status: "Booked", capacity: "30", addedBy: "Jane Smith" },
  { id: 3, name: "Meeting Room C", type: "Room", status: "Available", capacity: "10", addedBy: "Admin" },
  { id: 4, name: "Auditorium", type: "Hall", status: "Maintenance", capacity: "200", addedBy: "Admin" },
  { id: 5, name: "Computer Lab D", type: "Laboratory", status: "Available", capacity: "40", addedBy: "John Doe" },
  { id: 6, name: "Seminar Hall", type: "Hall", status: "Booked", capacity: "100", addedBy: "Admin" },
];

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

export default function AllResources() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            All Resources
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            Manage and view all resources in the system.
          </p>
        </div>
        <Link
          to="/admin/new-user"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 self-start"
        >
          <Plus size={16} />
          Add Resource
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-sm hover:bg-bg-tertiary transition-colors">
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* Resources Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {resources.map((resource) => (
          <motion.div
            key={resource.id}
            variants={item}
            className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-accent-orange/10">
                <BookOpen size={18} className="text-accent-orange" />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    resource.status === "Available"
                      ? "bg-green-500/10 text-green-500"
                      : resource.status === "Booked"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}
                >
                  {resource.status}
                </span>
              </div>
            </div>
            <h3 className="font-bold text-text-primary">{resource.name}</h3>
            <p className="text-xs text-text-muted mt-1">
              {resource.type} &middot; Capacity: {resource.capacity}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Added by: {resource.addedBy}
            </p>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-color">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-bg-secondary text-text-secondary text-xs font-medium hover:bg-bg-tertiary transition-colors">
                <Edit size={14} />
                Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors">
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
