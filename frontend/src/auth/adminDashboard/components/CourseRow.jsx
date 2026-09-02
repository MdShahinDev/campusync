import { motion } from "framer-motion";
import { Trash2, AlertTriangle } from "lucide-react";

export default function CourseRow({
  index,
  course,
  onChange,
  onRemove,
  canRemove,
  warning,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-3"
    >
      <div className="flex-1">
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Course Code {index === 0 ? "*" : ""}
        </label>
        <input
          type="text"
          value={course.courseCode}
          onChange={(e) => onChange(index, "courseCode", e.target.value)}
          placeholder="e.g. CSE101"
          className={`w-full px-4 py-2.5 rounded-xl bg-bg-secondary border text-text-primary text-sm focus:outline-none focus:ring-2 transition-colors ${
            warning
              ? "border-yellow-500/50 focus:ring-yellow-500/30"
              : "border-border-color focus:ring-accent-orange/30"
          }`}
        />
        {warning && (
          <p className="flex items-center gap-1 mt-1 text-xs text-yellow-600">
            <AlertTriangle size={12} />
            {warning}
          </p>
        )}
      </div>
      <div className="flex-[2]">
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Course Title {index === 0 ? "*" : ""}
        </label>
        <input
          type="text"
          value={course.courseTitle}
          onChange={(e) => onChange(index, "courseTitle", e.target.value)}
          placeholder="e.g. Introduction to Computer Science"
          className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
        />
      </div>
      {canRemove && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(index)}
          className="p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors mb-0.5"
          title="Remove course"
        >
          <Trash2 size={18} />
        </motion.button>
      )}
      {!canRemove && <div className="w-[42px]" />}
    </motion.div>
  );
}
