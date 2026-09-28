import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import { useAuth } from "../../../../context/AuthContext";

export default function ModeratorDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const pendingVerification = !!user && !user.isVerified;

  return (
    <div className="app-shell h-screen bg-bg-primary flex overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            {pendingVerification && (
              <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">
                    Your Moderator account is pending verification
                  </p>
                  <p className="text-xs mt-1 leading-relaxed">
                    You can access your dashboard, but protected Moderator
                    actions — approving or rejecting users, managing categories,
                    uploading resources, sending notifications and managing
                    borrow history — will be available after an administrator
                    verifies your account.
                  </p>
                </div>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
