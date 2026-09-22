import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, XCircle, Mail } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import AddResourceForm from "../../../components/common/AddResourceForm";

export default function AddResource() {
  const { user } = useAuth();

  if (user && user.isVerified === false) {
    const isRejected = user.rejectionReason;
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
        {isRejected ? (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <XCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                Account Verification Rejected
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                Resource uploads are not available because your account verification was rejected.
              </p>
              <p className="text-xs text-text-muted mt-2">
                If you need assistance, please contact Support.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
              >
                <Mail size={14} />
                Contact Support
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                Your account must be verified before you can upload resources.
              </p>
              <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1">
                Please wait for your account to be approved by a moderator.
              </p>
            </div>
          </div>
        )}
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
