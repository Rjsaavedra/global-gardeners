import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppSWRProvider } from "@/components/swr-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Global Gardeners",
  description: "Welcome to the Global Gardeners onboarding experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <section className="client-shell hidden min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-8 md:flex">
          <div className="w-full max-w-xl rounded-2xl border border-[#e7e0d2] bg-[#f8f6f1] p-10 text-center shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
            <p className="text-[32px] font-semibold leading-9 tracking-[-0.02em] text-[#31674c]">Global Gardeners</p>
            <p className="mt-4 text-[18px] leading-7 text-[#333333cc]">
              Desktop experience is coming soon. Please use mobile viewport for now.
            </p>
          </div>
        </section>

        <div className="w-full md:hidden [&>main]:!px-0 [&>main>section]:max-w-none [&>main>section]:w-full">
          <AppSWRProvider>{children}</AppSWRProvider>
        </div>
      </body>
    </html>
  );
}
