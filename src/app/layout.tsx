import Navigation from "@/components/navigation/Navigation";
import Notification from "@/components/notification/Notification";
import { AuthProvider } from "@/components/providers/AuthProvider";
import IntlProvider from "@/components/providers/IntlProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import FeedbackWidget from "@/components/shared/FeedbackWidget";
import InstallPwaButton from "@/components/shared/InstallPwaButton";
import OfflineBanner from "@/components/shared/OfflineBanner";
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
                <OfflineBanner />
                <Navigation />
                <FeedbackWidget />
                <InstallPwaButton />
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
