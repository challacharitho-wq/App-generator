import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dynamic Admin",
  description: "A state-of-the-art config-driven admin dashboard.",
  manifest: "/manifest.json",
};


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen selection:bg-primary/30`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}