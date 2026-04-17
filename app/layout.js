import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://maisonshop.store"),
  title: "MAISON SHOP",
  description: "Minimal fashion e-commerce storefront and admin panel for MAISON SHOP.",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
