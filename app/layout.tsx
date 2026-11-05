import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AccountProvider from "./components/account/AccountProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sayvoya.onrender.com"),
  title: "Sayvoya - AI Travel Planner",
  description:
    "Plan your next trip with Sayvoya AI: personalised itineraries, flight deals and trip ideas in seconds.",
  // No title or description here: each page's own title and description fill them in.
  openGraph: {
    siteName: "Sayvoya",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
  },
  authors: [{ name: "Arman Hossain", url: "https://github.com/priyoarman" }],
  // LinkedIn reads the publish date from this tag. The date Sayvoya went live under its new name.
  other: {
    publish_date: "2026-11-04T00:00:00+01:00",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AccountProvider>{children}</AccountProvider>
      </body>
    </html>
  );
}
