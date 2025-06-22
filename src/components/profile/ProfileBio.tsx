import { useTranslations } from "next-intl";

export default function ProfileBio({ bio }: { bio?: string }) {
  const t = useTranslations();
  return (
    <span className="text-foreground whitespace-pre-line">
      {bio || <span className="text-foreground-accent">{t("noBio")}</span>}
    </span>
  );
}
