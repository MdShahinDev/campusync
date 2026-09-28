import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  FolderOpen,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import api from "../../services/axios";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 disabled:cursor-not-allowed";

export default function ForumCategoryManagement() {
  const { user } = useAuth();
  const readOnly = user?.role === "moderator" && !user?.isVerified;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const refresh = () => setRefreshTick((tick) => tick + 1);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/forum/categories")
      .then((res) => {
        if (cancelled) return;
        setCategories(res.data.data.categories || []);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || "Could not load categories.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  const handleAdd = async (event) => {
    event.preventDefault();
    const name = newName.trim();
    if (name.length < 2) {
      showToast("Category name must be at least 2 characters.", "error");
      return;
    }

    setAdding(true);
    try {
      await api.post("/forum/categories", {
        name,
        description: newDescription.trim(),
      });
      setNewName("");
      setNewDescription("");
      showToast("Category created.", "success");
      refresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not create the category.", "error");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setEditName(category.name);
    setEditDescription(category.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const name = editName.trim();
    if (name.length < 2) {
      showToast("Category name must be at least 2 characters.", "error");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/forum/categories/${editingId}`, {
        name,
        description: editDescription.trim(),
      });
      cancelEdit();
      showToast("Category updated.", "success");
      refresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update the category.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/forum/categories/${deleteTarget._id}`);
      setDeleteTarget(null);
      showToast(res.data?.message || "Category deleted.", "success");
      refresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not delete the category.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
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
            {toast.type === "error" ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        to="/forum"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-orange transition-colors"
      >
        <ArrowLeft size={16} /> Back to Forum
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Forum{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A00] to-[#FF6B00]">
            Categories
          </span>
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Organise community discussions. Deleting a category keeps its issues and moves them
          to UnCategorised.
        </p>
      </div>

      {readOnly && (
        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-sm">
          Your account is not verified yet. You have read-only access to category management
          until an administrator verifies your account.
        </div>
      )}

      <div className="rounded-xl border border-border-color bg-bg-card p-4">
        <h2 className="text-sm font-bold text-text-primary mb-3">Add new category</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              maxLength={60}
              placeholder="Category name"
              disabled={readOnly || adding}
              className={`${inputClass} flex-1`}
            />
            <input
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              maxLength={200}
              placeholder="Description (optional)"
              disabled={readOnly || adding}
              className={`${inputClass} flex-1`}
            />
            <button
              type="submit"
              disabled={readOnly || adding}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white text-sm font-bold shadow-sm shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-border-color bg-bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border-color flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">
            {categories.length} Categor{categories.length === 1 ? "y" : "ies"}
          </h2>
          <Link to="/forum" className="text-xs text-accent-orange hover:underline font-medium">
            View discussions
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-accent-orange" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                refresh();
              }}
              className="text-sm text-accent-orange hover:underline font-medium"
            >
              Try again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen size={32} className="text-text-muted/30 mx-auto mb-3" />
            <p className="text-sm text-text-muted">No categories yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-color">
            {categories.map((category) => (
              <div key={category._id} className="px-4 py-3 hover:bg-bg-secondary/50 transition-colors">
                {editingId === category._id ? (
                  <form onSubmit={handleSave} className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        maxLength={60}
                        disabled={category.isSystem || saving}
                        className={`${inputClass} flex-1`}
                      />
                      <input
                        value={editDescription}
                        onChange={(event) => setEditDescription(event.target.value)}
                        maxLength={200}
                        placeholder="Description (optional)"
                        disabled={saving}
                        className={`${inputClass} flex-1`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-orange text-white text-xs font-bold hover:bg-accent-orange-hover disabled:opacity-60"
                      >
                        {saving && <Loader2 size={12} className="animate-spin" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-lg border border-border-color text-xs font-medium text-text-secondary hover:bg-bg-secondary"
                      >
                        Cancel
                      </button>
                      {category.isSystem && (
                        <span className="text-[11px] text-text-muted">
                          Name of UnCategorised is fixed.
                        </span>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {category.name}
                        </p>
                        {category.isSystem && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-bg-secondary text-text-muted border border-border-color">
                            <Lock size={10} /> System
                          </span>
                        )}
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-orange/10 text-accent-orange">
                          {category.issueCount || 0} issue{(category.issueCount || 0) === 1 ? "" : "s"}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-xs text-text-muted mt-1 break-words">
                          {category.description}
                        </p>
                      )}
                    </div>

                    {!readOnly && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(category)}
                          aria-label={`Edit ${category.name}`}
                          className="p-2 rounded-lg text-text-muted hover:text-accent-orange hover:bg-accent-orange/10 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        {!category.isSystem && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(category)}
                            aria-label={`Delete ${category.name}`}
                            className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Delete category"
                className="w-full max-w-sm rounded-2xl bg-bg-card border border-border-color shadow-2xl p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-text-primary text-center mb-2">
                  Delete "{deleteTarget.name}"?
                </h3>
                <p className="text-sm text-text-muted text-center leading-relaxed">
                  {deleteTarget.issueCount > 0
                    ? `${deleteTarget.issueCount} issue${deleteTarget.issueCount === 1 ? "" : "s"} will be moved to UnCategorised. No issue is deleted.`
                    : "This category will be removed."}
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border-color text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 transition-colors"
                  >
                    {deleting && <Loader2 size={14} className="animate-spin" />}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
