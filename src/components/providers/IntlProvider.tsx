"use client";
import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";
import { useLocaleContext } from "./LocaleProvider";

const messagesMap = { en, ru };

export default function IntlProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocaleContext();
  const messages = messagesMap[locale] || messagesMap["en"];
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}
