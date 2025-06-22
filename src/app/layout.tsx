import { AuthProvider } from "@/components/AuthProvider";
import IntlProvider from "@/components/IntlProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import Navigation from "@/components/Navigation";
import Notification from "@/components/Notification";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kezdesu - Spontaneous Meetups",
  description: "Connect with people around Atyrau for casual meetups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <title>Kezdesu</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </head>
      <body className={sourceSans.className}>
        <ThemeProvider>
          <AuthProvider>
            <LocaleProvider>
              <IntlProvider>
                <Navigation />
                <main className="min-h-screen pt-16">{children}</main>
                <Notification />
              </IntlProvider>
            </LocaleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
