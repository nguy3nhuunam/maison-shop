import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://maisonshop.store"),
  title: "MAISON SHOP",
  description: "Minimal fashion e-commerce storefront and admin panel for MAISON SHOP.",
  icons: {
    icon: "/brand/maison-logo.png",
    shortcut: "/brand/maison-logo.png",
    apple: "/brand/maison-logo.png",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
