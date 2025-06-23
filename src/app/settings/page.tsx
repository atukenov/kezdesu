"use client";
import LanguageSwitcher from "@/components/navigation/LanguageSwitcher";
import { useTheme } from "@/components/providers/ThemeProvider";
import ThemeCustomizer from "@/components/shared/ThemeCustomizer";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("settings");

  return (
    <main className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        {t("title", { default: "Settings" })}
      </h1>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          {t("appearance", { default: "Appearance" })}
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <span>{t("theme", { default: "Theme" })}:</span>
          <button
            className={`px-3 py-1 rounded ${
              theme === "light"
                ? "bg-primary text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            onClick={() => setTheme("light")}
            aria-pressed={theme === "light"}
          >
            {t("light", { default: "Light" })}
          </button>
          <button
            className={`px-3 py-1 rounded ${
              theme === "dark"
                ? "bg-primary text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            onClick={() => setTheme("dark")}
            aria-pressed={theme === "dark"}
          >
            {t("dark", { default: "Dark" })}
          </button>
          <button
            className={`px-3 py-1 rounded ${
              theme === "system"
                ? "bg-primary text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            onClick={() => setTheme("system")}
            aria-pressed={theme === "system"}
          >
            {t("system", { default: "System" })}
          </button>
        </div>
        <div>
          <span className="block mb-2">
            {t("accentColor", { default: "Accent Color" })}:
          </span>
          <ThemeCustomizer />
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          {t("privacy", { default: "Privacy & Data" })}
        </h2>
        <div className="flex flex-col gap-4">
          <button
            className="px-4 py-2 rounded bg-secondary text-foreground border border-foreground-accent hover:bg-primary hover:text-white transition-colors w-fit"
            onClick={() => alert("Download My Data: Coming soon!")}
          >
            {t("downloadData", { default: "Download My Data" })}
          </button>
          <button
            className="px-4 py-2 rounded bg-danger text-white border border-danger hover:bg-white hover:text-danger transition-colors w-fit"
            onClick={() => alert("Delete My Account: Coming soon!")}
          >
            {t("deleteAccount", { default: "Delete My Account" })}
          </button>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          {t("language", { default: "Language" })}
        </h2>
        <div className="flex items-center gap-4">
          <span>{t("language", { default: "Language" })}:</span>
          <LanguageSwitcher />
        </div>
      </section>
    </main>
  );
}
