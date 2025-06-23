"use client";
import { useEffect, useState } from "react";

const PRESET_COLORS = [
  "#2563eb", // blue
  "#16a34a", // green
  "#f59e42", // orange
  "#e11d48", // pink/red
  "#a21caf", // purple
  "#fbbf24", // yellow
  "#0ea5e9", // sky
];

const COLOR_ROLES = [
  {
    key: "primary",
    label: "Primary",
    variable: "--color-primary",
    default: "#2563eb",
    storage: "accentColor",
  },
  {
    key: "accent",
    label: "Accent",
    variable: "--color-accent",
    default: "#ff6b4a",
    storage: "accentAccentColor",
  },
  {
    key: "success",
    label: "Success",
    variable: "--color-success",
    default: "#22c55e",
    storage: "accentSuccessColor",
  },
  {
    key: "danger",
    label: "Danger",
    variable: "--color-danger",
    default: "#ef4444",
    storage: "accentDangerColor",
  },
];

export default function ThemeCustomizer() {
  // Always start with defaults for SSR, then hydrate from localStorage on client
  const [colors, setColors] = useState(() => {
    const obj: Record<string, string> = {};
    for (const role of COLOR_ROLES) {
      obj[role.key] = role.default;
    }
    return obj;
  });
  // Hydrate from localStorage after mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const obj: Record<string, string> = {};
    for (const role of COLOR_ROLES) {
      obj[role.key] = localStorage.getItem(role.storage) || role.default;
    }
    setColors(obj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    for (const role of COLOR_ROLES) {
      document.documentElement.style.setProperty(
        role.variable,
        colors[role.key]
      );
      localStorage.setItem(role.storage, colors[role.key]);
    }
  }, [colors]);

  return (
    <div className="flex flex-col gap-4">
      {COLOR_ROLES.map((role) => (
        <div key={role.key} className="flex items-center gap-2">
          <span className="w-20 text-sm font-medium">{role.label}:</span>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              className={`w-7 h-7 rounded-full border-2 border-white shadow transition-all ${
                colors[role.key] === c ? "ring-2 ring-primary" : ""
              }`}
              style={{ background: c }}
              aria-label={`Set ${role.label} color to ${c}`}
              onClick={() => setColors((prev) => ({ ...prev, [role.key]: c }))}
            />
          ))}
          <input
            type="color"
            value={colors[role.key]}
            onChange={(e) =>
              setColors((prev) => ({ ...prev, [role.key]: e.target.value }))
            }
            className="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer"
            aria-label={`Custom ${role.label} color`}
          />
        </div>
      ))}
    </div>
  );
}
