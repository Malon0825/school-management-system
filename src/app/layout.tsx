import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/core/auth/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GVCFI-SSC",
  description: "Green Valley College Foundation Inc. – Supreme Student Council Systems",
  icons: {
    icon: "/gvcfi.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
