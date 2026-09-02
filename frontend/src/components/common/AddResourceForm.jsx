import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  FileText,
  File,
  Image,
  Loader2,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/axios";
import SearchableSelect from "./SearchableSelect";

export default function AddResourceForm({ backLink, navigateTo }) {
  const navigate = useNavigate();

  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [resourceType, setResourceType] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
      fetchCourses(selectedUniversity._id);
      setSelectedCourse(null);
    } else {
      setCourses([]);
      setSelectedCourse(null);
    }
  }, [selectedUniversity]);

  const fetchUniversities = async () => {
    try {
      const res = await api.get("/universities");
      setUniversities(res.data.data.universities);
    } catch {
      // silent
    } finally {
      setLoadingUniversities(false);
    }
  };

  const fetchCourses = async (universityId) => {
    setLoadingCourses(true);
    try {
      const res = await api.get(
        `/universities/${universityId}/courses`
      );
      setCourses(res.data.data.courses);
    } catch {
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const getFileExtension = (filename) => {
    return filename.split(".").pop().toLowerCase();
  };

  const validateFile = (selectedFile, type) => {
    if (!selectedFile) return "Please select a file";

    const ext = getFileExtension(selectedFile.name);
    const validExtensions = {
      PDF: ["pdf"],
      PPTX: ["pptx"],
      Image: ["jpg", "jpeg", "png", "gif", "webp"],
    };

    if (!validExtensions[type]?.includes(ext)) {
      return `Invalid file type. For ${type}, allowed files: ${validExtensions[type]?.join(", ")}`;
    }

    return null;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedUniversity) {
      setError("Please select a university");
      return;
    }

    if (!selectedCourse) {
      setError("Please select a course");
      return;
    }

    if (!resourceType) {
      setError("Please select a resource type");
      return;
    }

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    const fileError = validateFile(file, resourceType);
    if (fileError) {
      setError(fileError);
      return;
    }

    setUploading(true);

    try {
      const submitData = new FormData();
      submitData.append("university_id", selectedUniversity._id);
      submitData.append("university_name", selectedUniversity.name);
      submitData.append("course_code", selectedCourse.courseCode);
      submitData.append("course_title", selectedCourse.courseTitle);
      submitData.append("resource_type", resourceType);
      submitData.append("file", file);

      await api.post("/resources", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(navigateTo);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload resource");
    } finally {
      setUploading(false);
    }
  };

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case "PDF":
        return <FileText size={20} className="text-red-500" />;
      case "PPTX":
        return <File size={20} className="text-orange-500" />;
      case "Image":
        return <Image size={20} className="text-blue-500" />;
      default:
        return <Upload size={20} className="text-text-muted" />;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          to={backLink}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-orange transition-colors mb-3"
        >
          <ArrowLeft size={16} />
          Back to Resources
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Add Resource
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Upload a new resource file.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-6 space-y-5"
      >
        {/* University */}
        <SearchableSelect
          label="University *"
          options={universities}
          value={selectedUniversity}
          onChange={setSelectedUniversity}
          placeholder="Select university..."
          loading={loadingUniversities}
          getOptionLabel={(opt) => opt.name}
          renderOption={(opt) => (
            <div className="flex items-center gap-2">
              <GraduationCap size={14} className="text-text-muted shrink-0" />
              <span>{opt.name}</span>
            </div>
          )}
        />

        {/* Course */}
        <SearchableSelect
          label="Course *"
          options={courses}
          value={selectedCourse}
          onChange={setSelectedCourse}
          placeholder={
            selectedUniversity
              ? "Select course..."
              : "Select a university first"
          }
          loading={loadingCourses}
          disabled={!selectedUniversity}
          getOptionLabel={(opt) => `${opt.courseCode} - ${opt.courseTitle}`}
          renderOption={(opt) => (
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen size={14} className="text-text-muted shrink-0" />
              <span className="font-medium shrink-0">{opt.courseCode}</span>
              <span className="text-text-muted mx-1 shrink-0">&mdash;</span>
              <span className="truncate">{opt.courseTitle}</span>
            </div>
          )}
        />

        {/* Selected course display */}
        {selectedCourse && (
          <div className="px-3 py-2 rounded-lg bg-accent-orange/5 border border-accent-orange/20 text-sm flex items-center gap-2">
            <BookOpen size={14} className="text-accent-orange shrink-0" />
            <span className="font-medium text-accent-orange">
              {selectedCourse.courseCode}
            </span>
            <span className="text-text-muted mx-1">&mdash;</span>
            <span className="text-text-secondary truncate">
              {selectedCourse.courseTitle}
            </span>
          </div>
        )}

        {/* Resource Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Resource Type *
          </label>
          <select
            value={resourceType}
            onChange={(e) => {
              setResourceType(e.target.value);
              setError("");
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
            required
          >
            <option value="">Select type</option>
            <option value="PDF">PDF</option>
            <option value="PPTX">PPTX</option>
            <option value="Image">Image</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Upload File *
          </label>
          {resourceType && (
            <p className="text-xs text-text-muted mb-2">
              Allowed: {resourceType === "PDF" && ".pdf files"}
              {resourceType === "PPTX" && ".pptx files"}
              {resourceType === "Image" &&
                ".jpg, .jpeg, .png, .gif, .webp files"}
            </p>
          )}
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border-color rounded-xl hover:border-accent-orange/50 transition-colors cursor-pointer relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept={
                resourceType === "PDF"
                  ? ".pdf"
                  : resourceType === "PPTX"
                  ? ".pptx"
                  : resourceType === "Image"
                  ? ".jpg,.jpeg,.png,.gif,.webp"
                  : ".pdf,.pptx,.jpg,.jpeg,.png,.gif,.webp"
              }
            />
            <div className="text-center">
              {file ? (
                <div className="flex items-center gap-2">
                  {getResourceTypeIcon(resourceType)}
                  <span className="text-sm text-text-primary">{file.name}</span>
                </div>
              ) : (
                <>
                  <Upload size={24} className="mx-auto text-text-muted mb-1" />
                  <p className="text-xs text-text-muted">
                    Click to upload or drag and drop
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Uploading...
            </span>
          ) : (
            "Upload Resource"
          )}
        </button>
      </motion.form>
    </div>
  );
}
