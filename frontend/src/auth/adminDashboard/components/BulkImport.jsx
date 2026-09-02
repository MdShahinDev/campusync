import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import api from "../../../services/axios";

export default function BulkImport({ onComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith(".csv")) {
        setError("Only CSV files are allowed");
        return;
      }
      setFile(selected);
      setError("");
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/admin/universities/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onComplete) onComplete();
    } catch (err) {
      setError(err.response?.data?.message || "Import failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Bulk Import</h2>
        <p className="text-text-muted mt-1 text-sm">
          Upload your CSV file containing university and course information.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* File upload area */}
      <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border-color rounded-xl hover:border-accent-orange/50 transition-colors cursor-pointer relative">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".csv"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <div className="text-center">
          {file ? (
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-accent-orange" />
              <span className="text-sm text-text-primary">{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="p-1 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={24} className="mx-auto text-text-muted mb-1" />
              <p className="text-xs text-text-muted">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-text-muted mt-1">Supported format: .csv</p>
            </>
          )}
        </div>
      </div>

      {/* Import button */}
      <button
        type="button"
        onClick={handleImport}
        disabled={uploading || !file}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Importing...
          </span>
        ) : (
          "Import in Bulk"
        )}
      </button>

      {/* Result summary */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-xl bg-green-500/5 border border-green-500/20 space-y-3"
          >
            <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
              <CheckCircle2 size={18} />
              Import Completed
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Total Rows:</span>
                <span className="font-medium text-text-primary">{result.totalRows}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Valid Rows:</span>
                <span className="font-medium text-text-primary">{result.validRows}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Universities Created:</span>
                <span className="font-medium text-green-600">{result.universitiesCreated}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Courses Created:</span>
                <span className="font-medium text-green-600">{result.coursesCreated}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Duplicates Skipped:</span>
                <span className="font-medium text-yellow-600">{result.duplicatesSkipped}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Failed Rows:</span>
                <span className={`font-medium ${result.failedRows > 0 ? "text-red-500" : "text-text-primary"}`}>
                  {result.failedRows}
                </span>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-red-500">Failed Rows:</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.errors.map((err, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-text-secondary p-2 rounded-lg bg-bg-secondary"
                    >
                      <span className="font-mono font-medium text-text-primary">
                        Row {err.row}:
                      </span>
                      <span>{err.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
