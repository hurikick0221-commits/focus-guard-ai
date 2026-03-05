import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FocusGuard AI - 거북목 방지 시스템",
  description: "수석 엔지니어가 설계한 고정밀 거북목 방지 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${spaceGrotesk.variable} antialiased bg-slate-950 flex justify-center min-h-screen`}>
        <div className="w-full max-w-[390px] relative bg-[#101622] shadow-2xl shadow-black/50">
          {children}
        </div>
      </body>
    </html>
  );
}
