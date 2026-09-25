import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Loader2,
  Pencil,
  Trash2,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import api from "../services/axios";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/categories");
      setCategories(res.data.data.categories);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await api.post("/categories", { name: newName.trim() });
      setCategories((prev) => [res.data.data.category, ...prev]);
      setNewName("");
      showToast("Category created successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create category", "error");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleEdit = async (id) => {
    if (!editName.trim()) return;
    setEditing(true);
    try {
      const res = await api.put(`/categories/${id}`, { name: editName.trim() });
      setCategories((prev) =>
        prev.map((c) => (c._id === id ? res.data.data.category : c))
      );
      setEditingId(null);
      setEditName("");
      showToast("Category updated successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update category", "error");
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteTarget._id}`);
      setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setDeleteTarget(null);
      showToast("Category deleted. Affected components moved to Uncategory.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete category", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => !deleting && setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-sm rounded-2xl bg-bg-card border border-border-color shadow-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <h3 className="text-base font-bold text-text-primary text-center mb-2">
                  Delete Category
                </h3>
                <p className="text-sm text-text-muted text-center mb-1">
                  Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>?
                </p>
                <p className="text-xs text-text-muted text-center mb-6">
                  Components using this category will be moved to <strong>Uncategory</strong>.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border-color text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Deleting...
                      </span>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Component{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A00] to-[#FF6B00]">
            Categories
          </span>
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Manage component categories used across the platform.
        </p>
      </div>

      {/* Add Category Form */}
      <div className="rounded-xl border border-border-color bg-bg-card p-4">
        <h2 className="text-base font-bold text-text-primary mb-3">Add New Category</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name..."
            className="flex-1 px-3 py-2 rounded-lg bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white text-sm font-bold shadow-sm shadow-orange-500/20 hover:shadow-md hover:shadow-orange-500/30 transition-all duration-200 disabled:opacity-50 shrink-0"
          >
            {adding ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Add Category
          </button>
        </form>
      </div>

      {/* Category List */}
      <div className="rounded-xl border border-border-color bg-bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border-color">
          <h2 className="text-base font-bold text-text-primary">
            {categories.length} {categories.length === 1 ? "Category" : "Categories"}
          </h2>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-accent-orange" />
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button
              onClick={fetchCategories}
              className="text-sm text-accent-orange hover:underline font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen size={32} className="text-text-muted/30 mx-auto mb-3" />
            <p className="text-sm text-text-muted">No categories yet.</p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="divide-y divide-border-color">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-bg-secondary/50 transition-colors"
              >
                {editingId === cat._id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEdit(cat._id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      autoFocus
                      className="flex-1 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
                    />
                    <button
                      onClick={() => handleEdit(cat._id)}
                      disabled={editing || !editName.trim()}
                      className="px-3 py-1.5 rounded-lg bg-accent-orange text-white text-sm font-bold hover:bg-accent-orange-hover transition-colors disabled:opacity-50"
                    >
                      {editing ? <Loader2 size={12} className="animate-spin" /> : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={editing}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0">
                      <FolderOpen size={14} className="text-accent-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {cat.name}
                      </p>
                      {cat.isSystem && (
                        <p className="text-[10px] text-text-muted">System Category</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-accent-orange hover:bg-accent-orange/10 transition-colors"
                        title="Edit category"
                      >
                        <Pencil size={14} />
                      </button>
                      {!cat.isSystem && (
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete category"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
