import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ApplicationsProvider } from "@/context/ApplicationsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Application Tracker",
  description: "Track your job applications",
  icons: {
    icon: [
      {
        url: "/icons/app-icon-dark.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icons/app-icon-light.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <ApplicationsProvider>
              <Navbar />
              <main className="pt-16 min-h-screen">{children}</main>
            </ApplicationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
