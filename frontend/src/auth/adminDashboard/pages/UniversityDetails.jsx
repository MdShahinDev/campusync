import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import api from "../../../services/axios";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function UniversityDetails() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      const res = await api.get("/admin/universities/with-courses");
      setUniversities(res.data.data.universities);
    } catch (err) {
      setError("Failed to load universities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const filtered = universities.filter((uni) =>
    uni.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (uniId) => {
    setExpanded((prev) => ({ ...prev, [uniId]: !prev[uniId] }));
  };

  const toggleSelect = (courseId) => {
    setSelected((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const toggleSelectAll = (uniId, courseIds) => {
    const allSelected = courseIds.every((id) => selected[id]);
    const updated = { ...selected };
    courseIds.forEach((id) => {
      updated[id] = !allSelected;
    });
    setSelected(updated);
  };

  const getSelectedCount = (courseIds) => {
    return courseIds.filter((id) => selected[id]).length;
  };

  const getGlobalSelectedCount = () => {
    return Object.values(selected).filter(Boolean).length;
  };

  const handleDeleteCourse = async (courseId, courseCode) => {
    if (!window.confirm(`Delete course "${courseCode}"?`)) return;

    setDeleting(courseId);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/admin/universities/courses/${courseId}`);
      setSuccess(`Course "${courseCode}" deleted`);
      setUniversities((prev) =>
        prev.map((uni) => ({
          ...uni,
          courses: uni.courses.filter((c) => c._id !== courseId),
        }))
      );
      setSelected((prev) => {
        const updated = { ...prev };
        delete updated[courseId];
        return updated;
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteUniversity = async (uniId, uniName) => {
    const uni = universities.find((u) => u._id === uniId);
    const courseCount = uni?.courses?.length || 0;

    if (
      !window.confirm(
        `Delete university "${uniName}" and all ${courseCount} course(s)?`
      )
    ) {
      return;
    }

    setDeleting(uniId);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/admin/universities/${uniId}`);
      setSuccess(`University "${uniName}" and ${courseCount} course(s) deleted`);
      setUniversities((prev) => prev.filter((u) => u._id !== uniId));
      if (uni) {
        const updated = { ...selected };
        uni.courses.forEach((c) => delete updated[c._id]);
        setSelected(updated);
      }
      setExpanded((prev) => {
        const updated = { ...prev };
        delete updated[uniId];
        return updated;
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete university");
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) {
      setError("No courses selected");
      return;
    }

    if (!window.confirm(`Delete ${ids.length} selected course(s)?`)) return;

    setBulkDeleting(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/admin/universities/courses/bulk-delete", {
        courseIds: ids,
      });
      const count = res.data.data.deletedCount;
      setSuccess(`${count} course(s) deleted successfully`);
      setUniversities((prev) =>
        prev.map((uni) => ({
          ...uni,
          courses: uni.courses.filter((c) => !selected[c._id]),
        }))
      );
      setSelected({});
    } catch (err) {
      setError(err.response?.data?.message || "Bulk delete failed");
    } finally {
      setBulkDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-accent-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            University Details
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            View, manage, and delete universities and courses.
          </p>
        </div>
        {getGlobalSelectedCount() > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {bulkDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Delete {getGlobalSelectedCount()} Selected
          </motion.button>
        )}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm"
          >
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="glass-card rounded-2xl p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search universities..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
        </div>
      </div>

      {/* University List */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <GraduationCap size={48} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted text-sm">
            {universities.length === 0
              ? "No universities found. Add one from the Add University page."
              : "No universities match your search."}
          </p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {filtered.map((uni) => {
            const isExpanded = expanded[uni._id];
            const courseIds = uni.courses.map((c) => c._id);
            const selectedCount = getSelectedCount(courseIds);
            const allSelected =
              courseIds.length > 0 && selectedCount === courseIds.length;

            return (
              <motion.div
                key={uni._id}
                variants={item}
                className="glass-card rounded-2xl overflow-hidden"
              >
                {/* University Header */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => toggleExpand(uni._id)}
                    className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </button>

                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => toggleExpand(uni._id)}
                  >
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {uni.name}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {uni.courses.length} course
                      {uni.courses.length !== 1 ? "s" : ""}
                      {selectedCount > 0 && (
                        <span className="ml-2 text-accent-orange">
                          ({selectedCount} selected)
                        </span>
                      )}
                    </p>
                  </div>

                  {uni.courses.length > 0 && (
                    <button
                      onClick={() => toggleSelectAll(uni._id, courseIds)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        allSelected
                          ? "bg-accent-orange/10 text-accent-orange"
                          : "bg-bg-secondary text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteUniversity(uni._id, uni.name)}
                    disabled={deleting === uni._id}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    title="Delete university and all courses"
                  >
                    {deleting === uni._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                {/* Courses List */}
                <AnimatePresence>
                  {isExpanded && uni.courses.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border-color">
                        {uni.courses.map((course) => (
                          <div
                            key={course._id}
                            className={`flex items-center gap-3 px-4 py-3 border-b border-border-color last:border-b-0 ${
                              selected[course._id]
                                ? "bg-accent-orange/5"
                                : "hover:bg-bg-secondary/50"
                            } transition-colors`}
                          >
                            <input
                              type="checkbox"
                              checked={!!selected[course._id]}
                              onChange={() => toggleSelect(course._id)}
                              className="w-4 h-4 rounded border-border-color text-accent-orange focus:ring-accent-orange/30 accent-[#FF8A00]"
                            />
                            <BookOpen
                              size={14}
                              className="text-text-muted shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-text-primary">
                                {course.courseCode}
                              </span>
                              <span className="text-sm text-text-muted mx-2">
                                &mdash;
                              </span>
                              <span className="text-sm text-text-secondary truncate">
                                {course.courseTitle}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteCourse(
                                  course._id,
                                  course.courseCode
                                )
                              }
                              disabled={deleting === course._id}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              title={`Delete ${course.courseCode}`}
                            >
                              {deleting === course._id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded but no courses */}
                <AnimatePresence>
                  {isExpanded && uni.courses.length === 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border-color px-4 py-6 text-center">
                        <p className="text-xs text-text-muted">
                          No courses yet. Add courses from the Add University
                          page.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Summary */}
      {universities.length > 0 && (
        <div className="text-center text-xs text-text-muted">
          {universities.length} universit{universities.length !== 1 ? "ies" : "y"}{" "}
          &middot;{" "}
          {universities.reduce((acc, u) => acc + u.courses.length, 0)} total
          courses
        </div>
      )}
    </div>
  );
}
