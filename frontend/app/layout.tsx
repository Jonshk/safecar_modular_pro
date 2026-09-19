import "./globals.css";
import { LangProvider } from "@/context/LangContext";
import { CartProvider } from "@/context/CartContext";
import ClientLayout from "@/components/layout/ClientLayout";

export const metadata = {
  title: "Safe Car — Auto Repair & Diagnostics Chicago",
  description: "Trusted automotive repair, electrical diagnostics and training in Chicago.",
  icons: { icon: "/logo-safecar.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <LangProvider>
          <CartProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </CartProvider>
        </LangProvider>
      </body>
    </html>
  );
}