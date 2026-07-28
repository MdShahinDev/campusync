import { motion } from "framer-motion";
import { BookOpen, Filter, Search } from "lucide-react";

const resources = [
  { id: 1, name: "Conference Room A", type: "Room", status: "Available", capacity: "20" },
  { id: 2, name: "Lab B", type: "Laboratory", status: "Booked", capacity: "30" },
  { id: 3, name: "Meeting Room C", type: "Room", status: "Available", capacity: "10" },
  { id: 4, name: "Auditorium", type: "Hall", status: "Maintenance", capacity: "200" },
  { id: 5, name: "Computer Lab D", type: "Laboratory", status: "Available", capacity: "40" },
  { id: 6, name: "Seminar Hall", type: "Hall", status: "Booked", capacity: "100" },
];

export default function Resources() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Resources
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          View and manage assigned resources.
        </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-accent-orange/10">
                <BookOpen size={18} className="text-accent-orange" />
              </div>
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
            <h3 className="font-bold text-text-primary">{resource.name}</h3>
            <p className="text-xs text-text-muted mt-1">
              {resource.type} &middot; Capacity: {resource.capacity}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
