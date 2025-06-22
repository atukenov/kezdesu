import { UserModel } from "@/models/UserModel";
import { useTranslations } from "next-intl";

interface AdminUsersTableProps {
  users: UserModel[];
  onView?: (user: UserModel) => void;
  onBan?: (user: UserModel) => void;
  onUnban?: (user: UserModel) => void;
}

export default function AdminUsersTable({
  users,
  onView,
  onBan,
  onUnban,
}: AdminUsersTableProps) {
  const t = useTranslations();
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border rounded-lg">
        <thead>
          <tr className="bg-muted text-foreground">
            <th className="px-3 py-2 text-left">{t("admin.users.name")}</th>
            <th className="px-3 py-2 text-left">{t("admin.users.email")}</th>
            <th className="px-3 py-2 text-left">{t("admin.users.status")}</th>
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
