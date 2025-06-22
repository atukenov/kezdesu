import { useTranslations } from "next-intl";

interface ProfileStatusToggleProps {
  status: string;
  loading: boolean;
  saving: boolean;
  onToggle: () => void;
}

export default function ProfileStatusToggle({
  status,
  loading,
  saving,
  onToggle,
}: ProfileStatusToggleProps) {
  const t = useTranslations();
  return (
    <div className="w-full mb-6 flex items-center justify-between">
      <span className="text-foreground-accent font-medium text-base">
        {t("status")}:
      </span>
      <button
        type="button"
        aria-pressed={status === "available"}
        onClick={onToggle}
        disabled={loading || saving}
        className={`relative inline-flex items-center h-10 w-24 rounded-full transition-colors focus:outline-none border-2 border-success shadow-sm
          ${status === "available" ? "bg-success" : "bg-danger"}
          ${
            loading || saving
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer"
          }
        `}
      >
        <span
          className={`absolute left-2 text-xs font-semibold transition-colors duration-200
            ${status === "available" ? "text-white" : "text-foreground-accent"}
          `}
        ></span>
        <span
          className={`absolute right-2 text-xs font-semibold transition-colors duration-200
            ${status === "busy" ? "text-white" : "text-foreground-accent"}
          `}
        ></span>
        <span
          className={`inline-block h-7 w-7 rounded-full bg-background shadow transform transition-transform duration-300
            ${status === "available" ? "translate-x-0" : "translate-x-14"}
          `}
        />
      </button>
    </div>
  );
}
