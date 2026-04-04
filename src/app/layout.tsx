import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/app/infra/lib/utils";
import {
  SidebarProvider,
  SidebarInset,
} from "@/app/(view)/components/ui/sidebar";
import { AppSidebar } from "@/app/(view)/components/header/sidebar/sidebar.view";
import { TopBar } from "@/app/(view)/components/header/top-bar/top-bar.view";
import { TooltipProvider } from "@/app/(view)/components/ui/tooltip";
import { auth } from "@/auth";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MinhaCasa | Organização e Finanças",
  description:
    "Gerencie suas finanças e organize sua casa com facilidade em um só lugar.",
  keywords: [
    "finanças",
    "organização",
    "casa",
    "gestão financeira",
    "planejamento",
  ],
  authors: [{ name: "MinhaCasa Team" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  robots: "index, follow",
  openGraph: {
    title: "MinhaCasa | Organização e Finanças",
    description:
      "Gerencie suas finanças e organize sua casa com facilidade em um só lugar.",
    url: "https://minhacasa.com.br",
    siteName: "MinhaCasa",
    images: [
      {
        url: "/assets/images/logo.png",
        width: 800,
        height: 600,
        alt: "MinhaCasa Logo",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MinhaCasa | Organização e Finanças",
    description:
      "Gerencie suas finanças e organize sua casa com facilidade em um só lugar.",
    images: ["/assets/images/logo.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="pt-BR"
      className={cn("font-mono h-full", jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black h-full`}
      >
        <TooltipProvider delayDuration={0}>
          {session ? (
            <SidebarProvider defaultOpen={true}>
              <AppSidebar session={session} />
              <SidebarInset className="flex flex-col bg-black">
                <TopBar />
                <main className="flex-1 overflow-y-auto">{children}</main>
              </SidebarInset>
            </SidebarProvider>
          ) : (
            <main className="h-full">{children}</main>
          )}
        </TooltipProvider>
      </body>
    </html>
  );
}
