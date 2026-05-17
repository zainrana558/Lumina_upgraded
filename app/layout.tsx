import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lumina — Premium Streaming",
    template: "%s | Lumina",
  },
  description: "A premium Netflix-style streaming platform with the latest movies and TV shows",
  keywords: ["streaming", "movies", "TV shows", "entertainment", "watch online"],
  authors: [{ name: "Lumina" }],
  creator: "Lumina",
  publisher: "Lumina",
  
  // PWA support
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lumina",
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Lumina",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
