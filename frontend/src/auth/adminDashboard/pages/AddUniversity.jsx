import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronDown,
  X,
  BookOpen,
} from "lucide-react";
import api from "../../../services/axios";
import CourseRow from "../components/CourseRow";
import BulkImport from "../components/BulkImport";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function AddUniversity() {
  const [universities, setUniversities] = useState([]);
  const [universitySearch, setUniversitySearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [isNewUniversity, setIsNewUniversity] = useState(false);
  const [newUniversityName, setNewUniversityName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  const [existingCourses, setExistingCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [courses, setCourses] = useState([{ courseCode: "", courseTitle: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await api.get("/admin/universities");
      setUniversities(res.data.data.universities);
    } catch {
      // silent
    } finally {
      setLoadingUniversities(false);
    }
  };

  const fetchExistingCourses = async (universityId) => {
    setLoadingCourses(true);
    try {
      const res = await api.get(
        `/admin/universities/${universityId}/courses`
      );
      setExistingCourses(res.data.data.courses);
    } catch {
      setExistingCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const filteredUniversities = universities.filter((uni) =>
    uni.name.toLowerCase().includes(universitySearch.toLowerCase())
  );

  const exactMatch = universities.some(
    (uni) => uni.normalizedName === universitySearch.trim().toLowerCase()
  );

  const handleSelectUniversity = (uni) => {
    setSelectedUniversity(uni);
    setUniversitySearch(uni.name);
    setIsNewUniversity(false);
    setNewUniversityName("");
    setDropdownOpen(false);
    setExistingCourses([]);
    setError("");
    setSuccess(null);
    fetchExistingCourses(uni._id);
  };

  const handleCreateNew = () => {
    const name = universitySearch.trim();
    if (!name) {
      setError("Type a university name first");
      return;
    }
    const normalizedName = name.toLowerCase();
    const exists = universities.some(
      (uni) => uni.normalizedName === normalizedName
    );
    if (exists) {
      setError("This university already exists. Select it from the dropdown.");
      return;
    }
    setSelectedUniversity(null);
    setIsNewUniversity(true);
    setNewUniversityName(name);
    setExistingCourses([]);
    setError("");
  };

  const handleClearUniversity = () => {
    setSelectedUniversity(null);
    setIsNewUniversity(false);
    setNewUniversityName("");
    setUniversitySearch("");
    setExistingCourses([]);
    setError("");
    setSuccess(null);
  };

  const getDuplicateWarnings = () => {
    const warnings = {};
    const existingCodes = new Map();
    existingCourses.forEach((c) => {
      existingCodes.set(c.normalizedCourseCode, c.courseCode);
    });

    const formCodes = new Map();

    courses.forEach((course, index) => {
      const normalized = course.courseCode.trim().toLowerCase();
      if (!normalized) return;

      const reasons = [];

      if (existingCodes.has(normalized)) {
        reasons.push(
          `Already exists as "${existingCodes.get(normalized)}"`
        );
      }

      if (formCodes.has(normalized)) {
        reasons.push(
          `Duplicate in form at row ${formCodes.get(normalized) + 1}`
        );
      } else {
        formCodes.set(normalized, index);
      }

      if (reasons.length > 0) {
        warnings[index] = reasons.join(". ");
      }
    });

    return warnings;
  };

  const handleCourseChange = (index, field, value) => {
    const updated = [...courses];
    updated[index] = { ...updated[index], [field]: value };
    setCourses(updated);
  };

  const addCourse = () => {
    setCourses([...courses, { courseCode: "", courseTitle: "" }]);
  };

  const removeCourse = (index) => {
    if (courses.length > 1) {
      setCourses(courses.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    const universityName = isNewUniversity
      ? newUniversityName.trim()
      : selectedUniversity?.name;

    if (!universityName) {
      setError("Please select or enter a university name");
      return;
    }

    const hasEmpty = courses.some(
      (c) => !c.courseCode.trim() || !c.courseTitle.trim()
    );
    if (hasEmpty) {
      setError("All courses must have both course code and title");
      return;
    }

    setSaving(true);

    try {
      const res = await api.post("/admin/universities", {
        university: universityName,
        courses: courses.map((c) => ({
          courseCode: c.courseCode.trim(),
          courseTitle: c.courseTitle.trim(),
        })),
      });

      const data = res.data.data;
      setSuccess(data);

      if (selectedUniversity) {
        fetchExistingCourses(selectedUniversity._id);
      }

      setCourses([{ courseCode: "", courseTitle: "" }]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const warnings = getDuplicateWarnings();
  const hasWarnings = Object.keys(warnings).length > 0;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Add University
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Add courses to an existing university or create a new one.
        </p>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm"
          >
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">
                {success.universityCreated
                  ? "University created and courses saved"
                  : "Courses saved successfully"}
              </p>
              <p className="mt-1 text-green-600/80 text-xs">
                {success.coursesCreated} course(s) created
                {success.duplicatesSkipped > 0 &&
                  `, ${success.duplicatesSkipped} duplicate(s) skipped`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
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
      </AnimatePresence>

      {/* Manual Add Section */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="glass-card rounded-2xl p-6 space-y-5"
      >
        <motion.div variants={item}>
          <h2 className="text-lg font-semibold text-text-primary">
            Add Courses to University
          </h2>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* University Selector */}
          <motion.div variants={item}>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              University *
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={universitySearch}
                  onChange={(e) => {
                    setUniversitySearch(e.target.value);
                    setSelectedUniversity(null);
                    setIsNewUniversity(false);
                    setNewUniversityName("");
                    setExistingCourses([]);
                    setDropdownOpen(true);
                    setError("");
                    setSuccess(null);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search or type a new university name..."
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
                />
                {(selectedUniversity || isNewUniversity) && (
                  <button
                    type="button"
                    onClick={handleClearUniversity}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                {!selectedUniversity && !isNewUniversity && (
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                  />
                )}
              </div>

              {/* Dropdown */}
              <AnimatePresence>
                {dropdownOpen &&
                  !selectedUniversity &&
                  !isNewUniversity && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-20 w-full mt-1 bg-bg-primary border border-border-color rounded-xl shadow-xl max-h-60 overflow-y-auto"
                    >
                      {loadingUniversities ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2
                            size={18}
                            className="animate-spin text-text-muted"
                          />
                        </div>
                      ) : (
                        <>
                          {filteredUniversities.length > 0 && (
                            <div>
                              {filteredUniversities.map((uni) => (
                                <button
                                  key={uni._id}
                                  type="button"
                                  onClick={() =>
                                    handleSelectUniversity(uni)
                                  }
                                  className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-bg-secondary transition-colors flex items-center gap-2"
                                >
                                  <BookOpen
                                    size={14}
                                    className="text-text-muted shrink-0"
                                  />
                                  <span className="truncate">
                                    {uni.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {universitySearch.trim() && !exactMatch && (
                            <div className="border-t border-border-color">
                              <button
                                type="button"
                                onClick={handleCreateNew}
                                className="w-full text-left px-4 py-2.5 text-sm text-accent-orange hover:bg-accent-orange/5 transition-colors flex items-center gap-2"
                              >
                                <Plus
                                  size={14}
                                  className="shrink-0"
                                />
                                Create "
                                {universitySearch.trim()}"
                              </button>
                            </div>
                          )}

                          {filteredUniversities.length === 0 &&
                            !universitySearch.trim() && (
                              <div className="px-4 py-4 text-center text-xs text-text-muted">
                                No universities yet. Type a name to
                                create one.
                              </div>
                            )}

                          {filteredUniversities.length === 0 &&
                            universitySearch.trim() &&
                            exactMatch && (
                              <div className="px-4 py-4 text-center text-xs text-text-muted">
                                Exact match found. Press Enter or click
                                to select.
                              </div>
                            )}
                        </>
                      )}
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* Selected state */}
              {selectedUniversity && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-accent-orange/5 border border-accent-orange/20 text-sm text-accent-orange flex items-center gap-2">
                  <BookOpen size={14} />
                  <span className="font-medium">
                    {selectedUniversity.name}
                  </span>
                </div>
              )}

              {/* New university state */}
              {isNewUniversity && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/20 text-sm text-blue-500 flex items-center gap-2">
                  <Plus size={14} />
                  <span className="font-medium">
                    Creating new: {newUniversityName}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Existing Courses (read-only) */}
          {selectedUniversity && (
            <motion.div variants={item}>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Existing Courses
              </label>
              {loadingCourses ? (
                <div className="flex items-center gap-2 py-3 text-sm text-text-muted">
                  <Loader2 size={14} className="animate-spin" />
                  Loading courses...
                </div>
              ) : existingCourses.length > 0 ? (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-border-color bg-bg-secondary/50 divide-y divide-border-color">
                  {existingCourses.map((course) => (
                    <div
                      key={course._id}
                      className="flex items-center gap-2 px-4 py-2.5"
                    >
                      <BookOpen
                        size={14}
                        className="text-text-muted shrink-0"
                      />
                      <span className="text-sm font-medium text-text-primary">
                        {course.courseCode}
                      </span>
                      <span className="text-sm text-text-muted mx-1">
                        &mdash;
                      </span>
                      <span className="text-sm text-text-secondary truncate">
                        {course.courseTitle}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted py-2">
                  No courses yet for this university.
                </p>
              )}
            </motion.div>
          )}

          {/* New Courses */}
          <motion.div variants={item} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-text-primary">
                {selectedUniversity
                  ? "Add New Courses"
                  : "Courses"}
              </label>
              {hasWarnings && (
                <span className="text-xs text-yellow-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Duplicate(s) detected
                </span>
              )}
            </div>
            <AnimatePresence mode="popLayout">
              {courses.map((course, index) => (
                <CourseRow
                  key={index}
                  index={index}
                  course={course}
                  onChange={handleCourseChange}
                  onRemove={removeCourse}
                  canRemove={courses.length > 1}
                  warning={warnings[index] || null}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Add More Course */}
          <motion.div variants={item}>
            <button
              type="button"
              onClick={addCourse}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-border-color text-text-secondary hover:text-accent-orange hover:border-accent-orange/50 text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add More Course
            </button>
          </motion.div>

          {/* Submit */}
          <motion.div variants={item}>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save University & Courses"
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>

      {/* Bulk Import Section */}
      <BulkImport />
    </div>
  );
}
