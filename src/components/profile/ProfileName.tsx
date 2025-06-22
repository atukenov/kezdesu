import { useTranslations } from "next-intl";

interface ProfileNameProps {
  name: string;
  editing: boolean;
  onChange?: (value: string) => void;
}

export default function ProfileName({
  name,
  editing,
  onChange,
}: ProfileNameProps) {
  const t = useTranslations();
  return (
    <div className="w-full mb-4">
      <label className="block text-foreground-accent font-medium mb-1">
        {t("name")}:
      </label>
      {editing ? (
        <input
          value={name}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="w-full border border-foreground-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-accent bg-background text-foreground"
        />
      ) : (
        <span className="text-foreground"> {name}</span>
      )}
    </div>
  );
}
