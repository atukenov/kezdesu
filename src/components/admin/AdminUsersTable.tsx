import { UserModel } from "@/models/UserModel";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface AdminUsersTableProps {
  users: UserModel[];
  onView?: (user: UserModel) => void;
  onBan?: (user: UserModel) => void;
  onUnban?: (user: UserModel) => void;
  onRoleChange?: (user: UserModel, newRole: string) => void;
}

export default function AdminUsersTable({
  users,
  onView,
  onBan,
  onUnban,
  onRoleChange,
}: AdminUsersTableProps) {
  const t = useTranslations();
  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const roles = [
    { value: "user", label: t("admin.users.role_user") },
    { value: "admin", label: t("admin.users.role_admin") },
    { value: "moderator", label: t("admin.users.role_moderator") },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border rounded-lg">
        <thead>
          <tr className="bg-muted text-foreground">
            <th className="px-3 py-2 text-left">{t("admin.users.name")}</th>
            <th className="px-3 py-2 text-left">{t("admin.users.email")}</th>
            <th className="px-3 py-2 text-left">{t("admin.users.status")}</th>
            <th className="px-3 py-2 text-left">{t("admin.users.role")}</th>
            <th className="px-3 py-2 text-left">{t("admin.users.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-b-0">
              <td className="px-3 py-2">{user.name}</td>
              <td className="px-3 py-2">{user.email}</td>
              <td className="px-3 py-2 capitalize">
                {t(`admin.users.status_${user.status}`)}
              </td>
              <td className="px-3 py-2">
                <select
                  className="border rounded px-2 py-1 text-xs"
                  value={user.role || "user"}
                  disabled={roleLoading === user.id}
                  onChange={(e) => {
                    setRoleLoading(user.id);
                    onRoleChange && onRoleChange(user, e.target.value);
                  }}
                  aria-label={t("admin.users.changeRole")}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2 flex gap-2">
                <button
                  className="text-primary hover:underline text-xs"
                  onClick={() => onView && onView(user)}
                >
                  {t("admin.users.view")}
                </button>
                {user.status !== "busy" ? (
                  <button
                    className="text-red-600 hover:underline text-xs"
                    onClick={() => onBan && onBan(user)}
                  >
                    {t("admin.users.ban")}
                  </button>
                ) : (
                  <button
                    className="text-green-600 hover:underline text-xs"
                    onClick={() => onUnban && onUnban(user)}
                  >
                    {t("admin.users.unban")}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
