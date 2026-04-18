"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import { LangProvider } from "@/context/LangContext";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <html lang="en">
      <head>
        <title>Safe Car — Auto Repair & Diagnostics Chicago</title>
        <meta name="description" content="Trusted automotive repair, electrical diagnostics and training in Chicago." />
        <link rel="icon" href="/logo-safecar.png" type="image/png" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {isAdmin ? (
          // Admin — sin header ni footer
          <>{children}</>
        ) : (
          // Site público — con header y footer
          <LangProvider>
            <CartProvider>
              <Header />
              {children}
              <Footer />
            </CartProvider>
          </LangProvider>
        )}
      </body>
    </html>
  );
}