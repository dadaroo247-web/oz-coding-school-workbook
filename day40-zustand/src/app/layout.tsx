import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zustand Counter Daily",
  description: "Zustand 데일리 과제",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
