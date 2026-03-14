import type {Metadata} from "next";
import {Geist, Geist_Mono, JetBrains_Mono} from "next/font/google";
import "./globals.css";
import {cn} from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets: ['latin'], variable: '--font-mono'});

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
    description: "Gerencie suas finanças e organize sua casa com facilidade em um só lugar.",
    keywords: ["finanças", "organização", "casa", "gestão financeira", "planejamento"],
    authors: [{name: "MinhaCasa Team"}],
    viewport: "width=device-width, initial-scale=1",
    robots: "index, follow",
    openGraph: {
        title: "MinhaCasa | Organização e Finanças",
        description: "Gerencie suas finanças e organize sua casa com facilidade em um só lugar.",
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
        description: "Gerencie suas finanças e organize sua casa com facilidade em um só lugar.",
        images: ["/assets/images/logo.png"],
    },
    icons: {
        icon: "/icon.png",
        apple: "/icon.png",
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className={cn("font-mono", jetbrainsMono.variable)}>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
        >
        {children}
        </body>
        </html>
    );
}
