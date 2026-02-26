import type { Metadata } from "next";
import "@codearena/ui/theme";
import "./globals.css";
import { Nav } from "@codearena/ui/Nav";

export const metadata: Metadata = {
    title: "CodeArena Arena Studio",
    description: "Challenge Designer for CodeArena",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-[var(--cyber-black,#0d0d0d)]">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <Nav current="arena" />
                    {children}
                </div>
            </body>
        </html>
    );
}
