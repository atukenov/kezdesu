"use client";
import { useEffect, useRef, useState } from "react";
import { FaGlobe } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { useLocaleContext } from "./LocaleProvider";

const locales = [
  { code: "en", label: "EN", icon: "🇬🇧" },
  { code: "ru", label: "RU", icon: "🇷🇺" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const current = locales.find((l) => l.code === locale) || locales[0];

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        type="button"
      >
        <FaGlobe className="w-4 h-4" />
        <span className="text-base">{current.icon}</span>
        <span className="font-semibold">{current.label}</span>
        <FiChevronDown className="w-4 h-4 ml-1" />
      </button>
      {open && (
        <ul
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1"
          role="listbox"
        >
          {locales.map((l) => (
            <li
              key={l.code}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-sm ${
                l.code === locale
                  ? "font-bold text-blue-600 dark:text-blue-300"
                  : ""
              }`}
              role="option"
              aria-selected={l.code === locale}
              tabIndex={0}
              onClick={() => {
                setLocale(l.code as "en" | "ru");
                setOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setLocale(l.code as "en" | "ru");
                  setOpen(false);
                }
              }}
            >
              <span className="text-base">{l.icon}</span>
              <span>{l.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
