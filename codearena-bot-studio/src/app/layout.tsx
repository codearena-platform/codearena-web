import type { Metadata } from "next";
import "@codearena/ui/theme";
import "./globals.css";
import { Nav } from "@codearena/ui/Nav";

export const metadata: Metadata = {
    title: "CodeArena Bot Studio",
    description: "Crie robôs incríveis visualmente",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-br">
            <body className="antialiased font-sans min-h-screen bg-[var(--cyber-black,#0d0d0d)]">
                <div className="mx-auto px-4 py-6 max-w-[1600px]">
                    <Nav current="bot" />
                    {children}
                </div>
            </body>
        </html>
    );
}
