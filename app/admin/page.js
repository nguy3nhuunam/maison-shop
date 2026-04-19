"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-client";

function formatMoney(value, currency = "TWD") {
  return `${currency} ${Number(value || 0).toLocaleString("en-US")}`;
}

function formatCompactDate(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function getDayKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function getSevenDaySeries(orders) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      key: getDayKey(date),
      label: formatCompactDate(date),
      total: 0,
      orders: 0,
    };
  });

  const mapped = new Map(days.map((day) => [day.key, day]));
  for (const order of orders) {
    const day = mapped.get(getDayKey(order.createdAt || order.time));
    if (!day) {
      continue;
    }

    day.total += Number(order.baseRawTotal || order.rawTotal || 0);
    day.orders += 1;
  }

  return days;
}

function aggregateTopProducts(orders, products) {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const stats = new Map();

  for (const order of orders) {
    for (const item of order.items || []) {
      const key = Number(item.productId);
      const current = stats.get(key) || {
        productId: key,
        name: item.name,
        quantity: 0,
        revenue: 0,
        image: productMap.get(key)?.image || item.image || "",
      };

      current.quantity += Number(item.quantity || 0);
      current.revenue += Number(productMap.get(key)?.basePrice || item.price || 0) * Number(item.quantity || 0);
      stats.set(key, current);
    }
  }

  return [...stats.values()]
    .sort((left, right) => right.quantity - left.quantity || right.revenue - left.revenue)
    .slice(0, 5);
}

function aggregateVoucherPerformance(orders) {
  const stats = new Map();

  for (const order of orders) {
    const code = String(order.voucherCode || "").trim().toUpperCase();
    if (!code) {
      continue;
    }

    const current = stats.get(code) || {
      code,
      orders: 0,
      totalDiscount: 0,
      revenue: 0,
    };

    current.orders += 1;
    current.totalDiscount += Number(order.baseVoucherDiscount || order.voucherDiscount || 0);
    current.revenue += Number(order.baseRawTotal || order.rawTotal || 0);
    stats.set(code, current);
  }

  return [...stats.values()]
    .sort((left, right) => right.orders - left.orders || right.totalDiscount - left.totalDiscount)
    .slice(0, 5);
}

function aggregateSourceBreakdown(orders) {
  const languageMap = new Map();
  const currencyMap = new Map();

  for (const order of orders) {
    const language = order.language === "zh" ? "ZH" : order.language === "vi" ? "VI" : "Unknown";
    const currency = order.currency || "TWD";

    languageMap.set(language, (languageMap.get(language) || 0) + 1);
    currencyMap.set(currency, (currencyMap.get(currency) || 0) + 1);
  }

  return {
    languages: [...languageMap.entries()].map(([label, count]) => ({ label, count })),
    currencies: [...currencyMap.entries()].map(([label, count]) => ({ label, count })),
  };
}

function getLowStockProducts(products) {
  return products
    .flatMap((product) =>
      (product.variants || []).map((variant) => ({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        size: variant.size,
        color: variant.color,
        stock: Number(variant.stock || 0),
      })),
    )
    .filter((item) => item.stock <= 3)
    .sort((left, right) => left.stock - right.stock)
    .slice(0, 8);
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [productsData, ordersData, settingsData, vouchersData, reviewsData] = await Promise.all([
          adminFetch("/api/products?includeHidden=true"),
          adminFetch("/api/orders"),
          adminFetch("/api/config"),
          adminFetch("/api/vouchers"),
          adminFetch("/api/admin/reviews"),
        ]);

        setProducts(productsData.products || []);
        setOrders(ordersData.orders || []);
        setSettings(settingsData.settings || null);
        setVouchers(vouchersData.vouchers || []);
        setReviews(reviewsData.reviews || []);
      } catch (loadError) {
        setError(loadError.message || "Khong the tai dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const sevenDaySeries = useMemo(() => getSevenDaySeries(orders), [orders]);
  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.baseRawTotal || order.rawTotal || 0), 0),
    [orders],
  );
  const weekRevenue = useMemo(
    () => sevenDaySeries.reduce((sum, day) => sum + day.total, 0),
    [sevenDaySeries],
  );
  const todayRevenue = useMemo(
    () => sevenDaySeries[sevenDaySeries.length - 1]?.total || 0,
    [sevenDaySeries],
  );
  const topProducts = useMemo(
    () => aggregateTopProducts(orders, products),
    [orders, products],
  );
  const voucherPerformance = useMemo(
    () => aggregateVoucherPerformance(orders),
    [orders],
  );
  const sourceBreakdown = useMemo(
    () => aggregateSourceBreakdown(orders),
    [orders],
  );
  const lowStockProducts = useMemo(
    () => getLowStockProducts(products),
    [products],
  );
  const pendingReviews = useMemo(
    () => reviews.filter((review) => review.status === "pending").length,
    [reviews],
  );

  return (
    <AdminShell
      title="Dashboard"
      description="Tong hop nhanh doanh thu, san pham ban chay, voucher hieu qua, nguon don hang va canh bao van hanh."
    >
      {loading ? (
        <div className="luxury-card rounded-[32px] p-6 text-sm text-stone-500">Dang tai dashboard...</div>
      ) : null}

      {error ? (
        <div className="luxury-card rounded-[32px] p-6 text-sm text-red-500">{error}</div>
      ) : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="luxury-card rounded-[32px] p-6">
              <p className="text-sm text-stone-500">Tong doanh thu</p>
              <p className="mt-3 text-3xl font-bold text-stone-900">{formatMoney(totalRevenue)}</p>
            </div>
            <div className="luxury-card rounded-[32px] p-6">
              <p className="text-sm text-stone-500">Doanh thu 7 ngay</p>
              <p className="mt-3 text-3xl font-bold text-stone-900">{formatMoney(weekRevenue)}</p>
            </div>
            <div className="luxury-card rounded-[32px] p-6">
              <p className="text-sm text-stone-500">Doanh thu hom nay</p>
              <p className="mt-3 text-3xl font-bold text-stone-900">{formatMoney(todayRevenue)}</p>
            </div>
            <div className="luxury-card rounded-[32px] p-6">
              <p className="text-sm text-stone-500">Tong don hang</p>
              <p className="mt-3 text-3xl font-bold text-stone-900">{orders.length}</p>
            </div>
            <div className="luxury-card rounded-[32px] p-6">
              <p className="text-sm text-stone-500">Review cho duyet</p>
              <p className="mt-3 text-3xl font-bold text-amber-700">{pendingReviews}</p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="luxury-card rounded-[32px] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-stone-900">Doanh thu theo ngay</h2>
                <p className="text-sm text-stone-400">7 ngay gan nhat</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-7">
                {sevenDaySeries.map((day) => {
                  const maxTotal = Math.max(...sevenDaySeries.map((item) => item.total), 1);
                  const height = Math.max(14, Math.round((day.total / maxTotal) * 120));

                  return (
                    <div key={day.key} className="rounded-[24px] bg-white p-4 text-center">
                      <div className="flex h-32 items-end justify-center">
                        <div
                          className="w-full rounded-full bg-stone-900/90"
                          style={{ height }}
                        />
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-stone-400">{day.label}</p>
                      <p className="mt-2 text-sm font-semibold text-stone-900">{day.orders} don</p>
                      <p className="mt-1 text-xs text-stone-500">{formatMoney(day.total)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="luxury-card rounded-[32px] p-6">
                <h2 className="text-xl font-bold text-stone-900">Nguon don hang</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] bg-white p-4">
                    <p className="text-sm font-semibold text-stone-900">Theo ngon ngu</p>
                    <div className="mt-3 space-y-3">
                      {sourceBreakdown.languages.map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                          <span className="text-stone-500">{item.label}</span>
                          <span className="font-semibold text-stone-900">{item.count}</span>
                        </div>
                      ))}
                      {sourceBreakdown.languages.length === 0 ? (
                        <p className="text-sm text-stone-400">Chua co du lieu.</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-[24px] bg-white p-4">
                    <p className="text-sm font-semibold text-stone-900">Theo tien te</p>
                    <div className="mt-3 space-y-3">
                      {sourceBreakdown.currencies.map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                          <span className="text-stone-500">{item.label}</span>
                          <span className="font-semibold text-stone-900">{item.count}</span>
                        </div>
                      ))}
                      {sourceBreakdown.currencies.length === 0 ? (
                        <p className="text-sm text-stone-400">Chua co du lieu.</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="luxury-card rounded-[32px] p-6">
                <h2 className="text-xl font-bold text-stone-900">He thong</h2>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="rounded-[24px] bg-white p-4">
                    <p className="font-semibold text-stone-900">MongoDB</p>
                    <p className="mt-1 text-stone-500">
                      {settings?.mongodbConfigured ? "Da cau hinh" : "Chua cau hinh"}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-white p-4">
                    <p className="font-semibold text-stone-900">Cloudinary</p>
                    <p className="mt-1 text-stone-500">
                      {settings?.cloudinaryConfigured ? "Da cau hinh" : "Chua cau hinh"}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-white p-4">
                    <p className="font-semibold text-stone-900">Tong voucher</p>
                    <p className="mt-1 text-stone-500">{vouchers.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="luxury-card rounded-[32px] p-6">
              <h2 className="text-xl font-bold text-stone-900">San pham ban chay</h2>
              <div className="mt-5 space-y-3">
                {topProducts.map((product) => (
                  <div key={product.productId} className="flex items-center gap-4 rounded-[24px] bg-white p-4">
                    <img src={product.image} alt={product.name} className="h-20 w-16 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-stone-900">{product.name}</p>
                      <p className="mt-1 text-sm text-stone-500">Da ban: {product.quantity}</p>
                      <p className="mt-1 text-sm text-stone-500">Doanh thu: {formatMoney(product.revenue)}</p>
                    </div>
                  </div>
                ))}
                {topProducts.length === 0 ? (
                  <p className="text-sm text-stone-500">Chua co du lieu ban hang.</p>
                ) : null}
              </div>
            </div>

            <div className="luxury-card rounded-[32px] p-6">
              <h2 className="text-xl font-bold text-stone-900">Voucher hieu qua</h2>
              <div className="mt-5 space-y-3">
                {voucherPerformance.map((voucher) => (
                  <div key={voucher.code} className="rounded-[24px] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-stone-900">{voucher.code}</p>
                      <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-white">
                        {voucher.orders} don
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-stone-500 sm:grid-cols-2">
                      <p>Giam da dung: {formatMoney(voucher.totalDiscount)}</p>
                      <p>Doanh thu tac dong: {formatMoney(voucher.revenue)}</p>
                    </div>
                  </div>
                ))}
                {voucherPerformance.length === 0 ? (
                  <p className="text-sm text-stone-500">Chua co voucher nao duoc su dung.</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="luxury-card rounded-[32px] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">Canh bao ton kho thap</h2>
              <p className="text-sm text-stone-400">Nguong canh bao: 3 san pham</p>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {lowStockProducts.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center gap-4 rounded-[24px] bg-white p-4">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="h-20 w-16 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-stone-900">{item.productName}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      {item.size} / {item.color}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Stock</p>
                    <p className={`mt-1 text-2xl font-bold ${item.stock === 0 ? "text-red-600" : "text-amber-700"}`}>
                      {item.stock}
                    </p>
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-stone-500">Khong co bien the nao canh bao ton kho.</p>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </AdminShell>
  );
}
