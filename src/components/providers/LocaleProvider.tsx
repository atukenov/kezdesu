"use client";
import React, { createContext, useContext, useState } from "react";

type LocaleContextType = {
  locale: "en" | "ru";
  setLocale: (locale: "en" | "ru") => void;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<"en" | "ru">("en");
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
