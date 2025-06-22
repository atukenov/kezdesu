import { UserModel } from "@/models/UserModel";
import { useTranslations } from "next-intl";

interface AdminUserDetailModalProps {
  user: UserModel | null;
  open: boolean;
  onClose: () => void;
}

export default function AdminUserDetailModal({
  user,
  open,
  onClose,
}: AdminUserDetailModalProps) {
  const t = useTranslations();
  if (!open || !user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-foreground-accent hover:text-primary"
          onClick={onClose}
          aria-label={t("close")}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">{t("user_details")}</h2>
        <div className="mb-2">
          <span className="font-semibold">{t("name")}:</span> {user.name}
        </div>
        <div className="mb-2">
          <span className="font-semibold">{t("email")}:</span> {user.email}
        </div>
        <div className="mb-2">
          <span className="font-semibold">{t("status")}:</span> {t(user.status)}
        </div>
        {user.bio && (
          <div className="mb-2">
            <span className="font-semibold">{t("bio")}:</span> {user.bio}
          </div>
        )}
        {user.social && (
          <div className="mb-2">
            <span className="font-semibold">{t("social")}:</span>
            <ul className="ml-2 list-disc">
              {Object.entries(user.social).map(([key, value]) =>
                value ? (
                  <li key={key}>
                    {t(key)}: {value}
                  </li>
                ) : null
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
