import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  FileText,
  File,
  Image,
  Loader2,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import SearchInput from "./SearchInput";
import api from "../../services/axios";
import { useAuth } from "../../context/AuthContext";

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

export default function ResourceListPage({ title, subtitle, addLink }) {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await api.get("/resources");
        setResources(response.data.data.resources);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch resources:", err);
        setError(err.response?.data?.message || "Failed to load resources. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadResources();
  }, [refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRefreshKey((key) => key + 1);
  };

  const canDelete = (resource) =>
    user?.role === "admin" ||
    String(resource.uploader_id) === String(user?._id);

  const handleDelete = async (resource) => {
    if (deletingId) return;
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    setDeletingId(resource.resource_id);
    try {
      await api.delete(`/resources/${resource.resource_id}`);
      setResources((prev) => prev.filter((r) => r.resource_id !== resource.resource_id));
      showToast("Resource deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete resource:", err);
      showToast(
        err.response?.data?.message || "Failed to delete resource",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (resource) => {
    if (downloadingId) return;
    setDownloadingId(resource.resource_id);

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

      if (!response.ok) {
        let message = "Download failed";
        try {
          const data = await response.json();
          if (data?.message) message = data.message;
        } catch {
          // non-JSON error body
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      showToast(err.message || "Download failed", "error");
    } finally {
      setDownloadingId(null);
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
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg ${
              toast.type === "error"
                ? "bg-red-500/10 border-red-500/30 text-red-500"
                : "bg-green-500/10 border-green-500/30 text-green-500"
            }`}
          >
            {toast.type === "error" ? (
              <AlertTriangle size={16} />
            ) : (
              <CheckCircle size={16} />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            {title}
          </h1>
          <p className="text-text-muted mt-1 text-sm">{subtitle}</p>
        </div>
        <Link
          to={addLink}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 self-start"
        >
          <Plus size={16} />
          Add Resource
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by course code or title..."
          className="flex-1"
        />
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

      {/* Error State */}
      {error ? (
        <div className="text-center py-12">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-text-muted">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 rounded-xl bg-accent-orange/10 text-accent-orange text-sm font-medium hover:bg-accent-orange/20 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">No resources found</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
                Uploaded by:{" "}
                {resource.uploader_username ? (
                  <Link
                    to={`/user/${resource.uploader_username}`}
                    className="text-accent-orange hover:underline font-medium"
                  >
                    {resource.uploader_name}
                  </Link>
                ) : (
                  resource.uploader_name
                )}
                {resource.uploader_role && (
                  <span className="text-text-muted"> ({resource.uploader_role})</span>
                )}
              </p>
              <p className="text-xs text-text-muted">
                {new Date(resource.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-color">
                <button
                  onClick={() => handleDownload(resource)}
                  disabled={downloadingId === resource.resource_id}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-accent-orange/10 text-accent-orange text-xs font-medium hover:bg-accent-orange/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {downloadingId === resource.resource_id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      Download
                    </>
                  )}
                </button>
                {canDelete(resource) && (
                  <button
                    onClick={() => handleDelete(resource)}
                    disabled={deletingId === resource.resource_id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {deletingId === resource.resource_id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        Delete
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
