"use client";
import AdminReportsTable from "@/components/admin/AdminReportsTable";
import AdminTabs from "@/components/admin/AdminTabs";
import AdminUserDetailModal from "@/components/admin/AdminUserDetailModal";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import { useAuth } from "@/components/providers/AuthProvider";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ErrorDialog from "@/components/shared/ErrorDialog";
import { UserModel } from "@/models/UserModel";
import { getReports, ReportModel } from "@/services/reportService";
import {
  createOrUpdateUser,
  getUsers,
  updateUserRole,
} from "@/services/userService";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ADMIN_EMAILS = [
  "almaz.t97@gmail.com", // Replace with your admin email(s)
];

export default function AdminDashboard() {
  const t = useTranslations();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<UserModel[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    null | (() => Promise<void>)
  >(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reports, setReports] = useState<ReportModel[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");

  useEffect(() => {
    if (!loading && (!user || !ADMIN_EMAILS.includes(user.email))) {
      router.replace("/"); // Redirect non-admins to home
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (activeTab === "users") {
      getUsers()
        .then(setUsers)
        .catch(() => setUsers([]));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "reports") {
      setReportsLoading(true);
      getReports()
        .then(setReports)
        .catch((e) => setReportsError(e.message || "Failed to load reports."))
        .finally(() => setReportsLoading(false));
    }
  }, [activeTab]);

  const handleViewUser = (user: UserModel) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleBanUser = (user: UserModel) => {
    setConfirmTitle(t("ban_user_title"));
    setConfirmDescription(t("ban_user_confirm", { name: user.name }));
    setConfirmAction(() => async () => {
      setUpdating(true);
      try {
        await createOrUpdateUser({ ...user, status: "busy" });
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: "busy" } : u))
        );
      } catch (e: any) {
        setErrorMessage(e.message || "Failed to ban user.");
        setErrorOpen(true);
      } finally {
        setUpdating(false);
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  const handleUnbanUser = (user: UserModel) => {
    setConfirmTitle(t("unban_user_title"));
    setConfirmDescription(t("unban_user_confirm", { name: user.name }));
    setConfirmAction(() => async () => {
      setUpdating(true);
      try {
        await createOrUpdateUser({ ...user, status: "available" });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, status: "available" } : u
          )
        );
      } catch (e: any) {
        setErrorMessage(e.message || "Failed to unban user.");
        setErrorOpen(true);
      } finally {
        setUpdating(false);
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  const handleResolveReport = (report: ReportModel) => {
    setConfirmTitle(t("resolve_report_title"));
    setConfirmDescription(t("resolve_report_confirm"));
    setConfirmAction(() => async () => {
      try {
        setUpdating(true);
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id ? { ...r, status: "resolved" } : r
          )
        );
        const { updateReportStatus } = await import("@/services/reportService");
        await updateReportStatus(report.id!, "resolved");
      } catch (e: any) {
        setErrorMessage(e.message || "Failed to resolve report.");
        setErrorOpen(true);
      } finally {
        setUpdating(false);
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  const handleDismissReport = (report: ReportModel) => {
    setConfirmTitle(t("dismiss_report_title"));
    setConfirmDescription(t("dismiss_report_confirm"));
    setConfirmAction(() => async () => {
      try {
        setUpdating(true);
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id ? { ...r, status: "dismissed" } : r
          )
        );
        const { updateReportStatus } = await import("@/services/reportService");
        await updateReportStatus(report.id!, "dismissed");
      } catch (e: any) {
        setErrorMessage(e.message || "Failed to dismiss report.");
        setErrorOpen(true);
      } finally {
        setUpdating(false);
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  const handleEscalateReport = (report: ReportModel) => {
    setConfirmTitle(t("escalate_report_title"));
    setConfirmDescription(t("escalate_report_confirm"));
    setConfirmAction(() => async () => {
      try {
        setUpdating(true);
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id ? { ...r, status: "escalated" } : r
          )
        );
        const { updateReportStatus } = await import("@/services/reportService");
        await updateReportStatus(report.id!, "escalated");
      } catch (e: any) {
        setErrorMessage(e.message || "Failed to escalate report.");
        setErrorOpen(true);
      } finally {
        setUpdating(false);
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  const handleRoleChange = async (user: UserModel, newRole: string) => {
    setUpdating(true);
    try {
      await updateUserRole(user.id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } catch (e: any) {
      setErrorMessage(e.message || t("admin.users.roleChangeError"));
      setErrorOpen(true);
    } finally {
      setUpdating(false);
    }
  };

  // Only show loading overlay for user actions, not for report mod actions
  const showUserUpdating = updating && activeTab === "users";

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t("admin_dashboard")}</h1>
      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-4">
        {activeTab === "users" && (
          <div className="bg-background border rounded-lg p-4 shadow relative">
            <h2 className="font-semibold mb-2">{t("users")}</h2>
            <AdminUsersTable
              users={users}
              onView={handleViewUser}
              onBan={handleBanUser}
              onUnban={handleUnbanUser}
              onRoleChange={handleRoleChange}
            />
            <AdminUserDetailModal
              user={selectedUser}
              open={modalOpen}
              onClose={() => setModalOpen(false)}
            />
            <ConfirmDialog
              open={confirmOpen}
              title={confirmTitle}
              description={confirmDescription}
              onConfirm={async () => confirmAction && (await confirmAction())}
              onCancel={() => setConfirmOpen(false)}
              loading={updating}
            />
            <ErrorDialog
              open={errorOpen}
              message={errorMessage}
              onClose={() => setErrorOpen(false)}
            />
            {showUserUpdating && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            )}
          </div>
        )}
        {activeTab === "meetups" && (
          <div className="bg-background border rounded-lg p-4 shadow">
            <h2 className="font-semibold mb-2">{t("meetups")}</h2>
            <p className="text-sm text-foreground-accent">
              {t("manage_meetups_coming_soon")}
            </p>
          </div>
        )}
        {activeTab === "reports" && (
          <div className="bg-background border rounded-lg p-4 shadow relative">
            <h2 className="font-semibold mb-2">{t("reports")}</h2>
            {reportsLoading ? (
              <div>Loading...</div>
            ) : reportsError ? (
              <div className="text-red-600">{reportsError}</div>
            ) : (
              <>
                <AdminReportsTable
                  reports={reports}
                  onResolve={handleResolveReport}
                  onDismiss={handleDismissReport}
                  onEscalate={handleEscalateReport}
                />
                <ConfirmDialog
                  open={confirmOpen}
                  title={confirmTitle}
                  description={confirmDescription}
                  onConfirm={async () =>
                    confirmAction && (await confirmAction())
                  }
                  onCancel={() => setConfirmOpen(false)}
                  loading={updating}
                />
                <ErrorDialog
                  open={errorOpen}
                  message={errorMessage}
                  onClose={() => setErrorOpen(false)}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
