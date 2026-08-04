import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, Plus, FileText, File, Image, Loader2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../services/axios";

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

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await api.get("/resources");
      setResources(response.data.data.resources);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      await api.delete(`/resources/${resourceId}`);
      setResources(resources.filter((r) => r.resource_id !== resourceId));
    } catch (error) {
      console.error("Failed to delete resource:", error);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "PDF":
        return <FileText size={18} className="text-red-500" />;
      case "PPTX":
        return <File size={18} className="text-orange-500" />;
      case "Image":
        return <Image size={18} className="text-blue-500" />;
      default:
        return <BookOpen size={18} className="text-accent-orange" />;
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.course_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || resource.resource_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-accent-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Resources
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            View and manage assigned resources.
          </p>
        </div>
        <Link
          to="/moderator/add-resource"
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
            placeholder="Search by course code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
        >
          <option value="all">All Types</option>
          <option value="PDF">PDF</option>
          <option value="PPTX">PPTX</option>
          <option value="Image">Image</option>
        </select>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">No resources found</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filteredResources.map((resource) => (
            <motion.div
              key={resource._id}
              variants={item}
              className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-accent-orange/10">
                  {getResourceIcon(resource.resource_type)}
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-bg-secondary text-text-secondary">
                  {resource.resource_type}
                </span>
              </div>
              <h3 className="font-bold text-text-primary">{resource.course_code}</h3>
              <p className="text-xs text-text-muted mt-1">{resource.course_title}</p>
              <p className="text-xs text-text-muted mt-2">
                Uploaded by: {resource.uploader_name}
              </p>
              <p className="text-xs text-text-muted">
                {new Date(resource.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-color">
                <button
                  onClick={() => handleDelete(resource.resource_id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
