"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type LocaleContextType = {
  locale: "en" | "ru";
  setLocale: (locale: "en" | "ru") => void;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<"en" | "ru">("en");

  // Hydrate from localStorage
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("locale") : null;
    if (stored === "en" || stored === "ru") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (l: "en" | "ru") => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const ctx = useContext(LocaleContext);
  if (!ctx)
    throw new Error("useLocaleContext must be used within LocaleProvider");
  return ctx;
}
