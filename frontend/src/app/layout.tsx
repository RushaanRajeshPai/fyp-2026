import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "Ascend AI — Find Your Dream Job with AI",
  description:
    "Upload your resume and let AI find the best job matches for you across LinkedIn and other top platforms. Powered by OpenAI.",
  icons: {
    icon: "/proj-logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
