import { useTranslations } from "next-intl";

interface ProfileAvatarProps {
  image?: string;
}

export default function ProfileAvatar({ image }: ProfileAvatarProps) {
  const t = useTranslations();
  return (
    <img
      src={image || "/default-avatar.png"}
      alt={t("profile") + " avatar"}
      className="w-24 h-24 rounded-full border-4 border-primary-accent mb-4 object-cover bg-secondary"
    />
  );
}
