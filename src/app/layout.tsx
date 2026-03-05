import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FocusGuard AI",
  description: "AI-powered posture monitoring and focus tracking",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FocusGuard AI",
  },
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
