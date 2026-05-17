import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lumina — Premium Streaming Platform",
    template: "%s | Lumina",
  },
  description: "Premium streaming platform for movies and TV shows with VidSrc and NexStream",
  keywords: ["streaming", "movies", "TV shows", "entertainment", "watch online", "vidsrc", "nexstream"],
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
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
