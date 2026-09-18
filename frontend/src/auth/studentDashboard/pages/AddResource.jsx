import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import AddResourceForm from "../../../components/common/AddResourceForm";

export default function AddResource() {
  const { user } = useAuth();

  if (user && user.isVerified === false) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <Link
            to="/student/resource"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-orange transition-colors mb-3"
          >
            <ArrowLeft size={16} />
            Back to Resources
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Add Resource
          </h1>
        </div>
        <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
          <AlertTriangle size={20} className="text-yellow-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              Your account is not verified. Please wait for verify through Administrator before uploading resources.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AddResourceForm
      backLink="/student/resource"
      navigateTo="/student/resource"
    />
  );
}
