import { Inter, Roboto_Mono } from "next/font/google";
import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MockOrthomosaicResolver } from "@/features/domain/resolvers/mock-orthomosaic-resolver";
import { setOrthomosaicResolver } from "@/features/domain/resolvers/orthomosaic-resolver";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuildTwin — Construction Intelligence Platform",
  description: "See Your Construction Site Evolve",
  icons: {
    icon: [
      { url: "/brand/icon.png", type: "image/png" },
    ],
    apple: "/brand/icon.png",
  },
};

const orthomosaicResolver = new MockOrthomosaicResolver();
setOrthomosaicResolver(orthomosaicResolver);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="h-full">
      <body
        className={`${inter.variable} ${robotoMono.variable} min-h-full font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export { AppShell } from "@/components/layout/AppShell";
