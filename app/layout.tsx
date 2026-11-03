import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AccountProvider from "./components/account/AccountProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sayvoya - AI Travel Planner",
  description:
    "Plan your next trip with Sayvoya AI: personalised itineraries, flight deals and trip ideas in seconds.",
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
