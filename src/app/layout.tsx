import { AuthProvider } from "@/components/AuthProvider";
import Navigation from "@/components/Navigation";
import Notification from "@/components/Notification";
import type { Metadata } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
        <title>Kezdesu</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </head>
      <body className={sourceSans.className}>
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen pt-16">{children}</main>
          <Notification />
        </AuthProvider>
      </body>
    </html>
  );
}
