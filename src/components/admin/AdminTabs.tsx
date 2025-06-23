import { useTranslations } from "next-intl";

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabKeys = ["users", "meetups", "reports", "feedbacks"];

export default function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  const t = useTranslations();
  return (
    <div className="flex gap-2 mb-8 border-b border-foreground-accent">
      {tabKeys.map((key) => (
        <button
          key={key}
          className={`px-4 py-2 font-medium focus:outline-none transition-colors rounded-t-md border-b-2 -mb-px ${
            activeTab === key
              ? "border-primary text-primary"
              : "border-transparent text-foreground-accent hover:text-primary"
          }`}
          onClick={() => onTabChange(key)}
          aria-current={activeTab === key ? "page" : undefined}
        >
          {t(key)}
        </button>
      ))}
    </div>
  );
}
