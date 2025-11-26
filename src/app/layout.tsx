import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/core/auth/AuthContext";
import { Toaster } from "@/components/ui/sonner";

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
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
