import type { Metadata } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
import Provider from "./providers";

import "./globals.css";

const manrope = Manrope({ subsets: ["latin"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ticket",
  description: "Invitation ticket for the event",
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
        <title>Love Airlines Ticket</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="bg-gradient-to-br from-blue-100 to-white font-sans">
        <Provider>
          <main>{children}</main>
        </Provider>
      </body>
    </html>
  );
}
