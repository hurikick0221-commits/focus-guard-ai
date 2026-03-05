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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }

              window.addEventListener('beforeinstallprompt', (e) => {
                // 저장해두었다가 원할 때 실행하기 위해 기본 팝업 차단
                e.preventDefault();
                // 전역 상태에 저장 (window 객체 이용해 전달)
                window.deferredPrompt = e;
                // 앱에 알림 (커스텀 이벤트)
                window.dispatchEvent(new CustomEvent('pwa-install-ready'));
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
