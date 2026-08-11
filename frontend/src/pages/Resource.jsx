import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  FileText,
  File,
  Image,
  Loader2,
  Download,
  Filter,
  LogIn,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";

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

export default function PublicResource() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [downloadAlert, setDownloadAlert] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await api.get("/resources/public");
      setResources(response.data.data.resources);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource) => {
    if (!user) {
      setDownloadAlert(true);
      setTimeout(() => setDownloadAlert(false), 3000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/resources/${resource.resource_id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
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
    const matchesFilter =
      filterType === "all" || resource.resource_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-accent-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Login Required Alert */}
      {downloadAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-bg-primary border border-accent-orange/30 rounded-2xl px-6 py-4 shadow-xl shadow-orange-500/10 flex items-center gap-3"
        >
          <div className="p-2 rounded-xl bg-accent-orange/10">
            <LogIn size={20} className="text-accent-orange" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">
              Login Required
            </p>
            <p className="text-xs text-text-muted">
              Please login to download resources.
            </p>
          </div>
          <Link
            to="/login"
            className="ml-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FF6B00] text-white text-xs font-bold hover:shadow-lg transition-shadow"
          >
            Login
          </Link>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary">
            Campus{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A00] to-[#FF6B00]">
              Resources
            </span>
          </h1>
          <p className="text-text-muted mt-3 max-w-xl mx-auto">
            Browse and download course materials, presentations, and study
            resources shared by students and instructors.
          </p>
        </motion.div>

        {/* Search & Filter */}
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
              placeholder="Search by course code or title..."
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-9 pr-8 py-3 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="PDF">PDF</option>
              <option value="PPTX">PPTX</option>
              <option value="Image">Image</option>
            </select>
          </div>
        </motion.div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={48} className="mx-auto text-text-muted mb-4" />
            <p className="text-text-muted text-lg">No resources found</p>
            <p className="text-text-muted text-sm mt-1">
              Try adjusting your search or filter.
            </p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filteredResources.map((resource) => (
              <motion.div
                key={resource._id}
                variants={item}
                className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-accent-orange/10 group-hover:scale-110 transition-transform">
                    {getResourceIcon(resource.resource_type)}
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-bg-secondary text-text-secondary">
                    {resource.resource_type}
                  </span>
                </div>

                <h3 className="font-bold text-text-primary text-lg">
                  {resource.course_code}
                </h3>
                <p className="text-sm text-accent-orange mt-1 line-clamp-2">
                  {resource.course_title}
                </p>

                <div className="mt-3 space-y-1">
                  <p className="text-xs text-text-muted">
                    Uploaded by{" "}
                    <span className="font-medium text-text-primary">
                      {resource.uploader_name}
                    </span>
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(resource.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border-color">
                  <button
                    onClick={() => handleDownload(resource)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
