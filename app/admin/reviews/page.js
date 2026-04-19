"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-client";

function formatReviewTime(value) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getStatusBadge(status) {
  if (status === "approved") {
    return {
      label: "Đã duyệt",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  if (status === "rejected") {
    return {
      label: "Đã ẩn",
      className: "bg-red-100 text-red-600",
    };
  }

  return {
    label: "Chờ duyệt",
    className: "bg-amber-100 text-amber-700",
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [workingId, setWorkingId] = useState(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await adminFetch("/api/admin/reviews");
        setReviews(data.reviews || []);
      } catch (error) {
        setMessage(error.message || "Không thể tải danh sách đánh giá.");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  const pendingCount = useMemo(
    () => reviews.filter((review) => review.status === "pending").length,
    [reviews],
  );

  async function handleUpdate(id, payload, successMessage) {
    setWorkingId(id);
    setMessage("");

    try {
      const data = await adminFetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setReviews((current) =>
        current.map((review) => (review.id === id ? data.review : review)),
      );
      setMessage(successMessage);
    } catch (error) {
      setMessage(error.message || "Không thể cập nhật đánh giá.");
    } finally {
      setWorkingId(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Xóa đánh giá này?")) {
      return;
    }

    setWorkingId(id);
    setMessage("");

    try {
      await adminFetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      setReviews((current) => current.filter((review) => review.id !== id));
      setMessage("Đã xóa đánh giá.");
    } catch (error) {
      setMessage(error.message || "Không thể xóa đánh giá.");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <AdminShell
      title="Đánh giá"
      description="Duyệt đánh giá mới, kiểm tra người mua đã xác thực và quản lý hình ảnh đánh giá của từng sản phẩm."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <div className="luxury-card rounded-[32px] p-6">
          <p className="text-sm text-stone-500">Tổng đánh giá</p>
          <p className="mt-3 text-4xl font-bold text-stone-900">{reviews.length}</p>
        </div>
        <div className="luxury-card rounded-[32px] p-6">
          <p className="text-sm text-stone-500">Chờ duyệt</p>
          <p className="mt-3 text-4xl font-bold text-amber-700">{pendingCount}</p>
        </div>
        <div className="luxury-card rounded-[32px] p-6">
          <p className="text-sm text-stone-500">Người mua đã xác thực</p>
          <p className="mt-3 text-4xl font-bold text-stone-900">
            {reviews.filter((review) => review.verifiedBuyer).length}
          </p>
        </div>
      </section>

      <section className="luxury-card rounded-[32px] p-6">
        {loading ? <p className="text-sm text-stone-500">Đang tải đánh giá...</p> : null}
        {message ? <p className="mb-4 text-sm text-stone-600">{message}</p> : null}

        <div className="space-y-4">
          {reviews.map((review) => {
            const badge = getStatusBadge(review.status);

            return (
              <article key={review.id} className="rounded-[28px] border border-stone-200 bg-white p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex gap-4">
                    <img
                      src={review.productImage}
                      alt={review.productName}
                      className="h-24 w-20 rounded-2xl object-cover"
                    />

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-stone-900">{review.productName}</p>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                        {review.verifiedBuyer ? (
                          <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold text-white">
                            Đã xác thực
                          </span>
                        ) : null}
                      </div>

                      <p className="text-sm text-stone-500">
                        {review.name} | {review.phone}
                      </p>
                      <p className="text-sm text-stone-400">{formatReviewTime(review.createdAt)}</p>
                      <p className="text-sm text-[#b38a45]">{"★".repeat(review.rating || 5)}</p>
                      <p className="max-w-3xl text-sm leading-7 text-stone-600">{review.content}</p>

                      {review.images?.length ? (
                        <div className="flex flex-wrap gap-3 pt-2">
                          {review.images.map((image) => (
                            <a key={image} href={image} target="_blank" rel="noreferrer">
                              <img
                                src={image}
                                alt={review.name}
                                className="h-20 w-20 rounded-2xl object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:max-w-[320px] xl:justify-end">
                    <button
                      type="button"
                      disabled={workingId === review.id}
                      onClick={() =>
                        handleUpdate(
                          review.id,
                          { status: "approved" },
                          "Đã duyệt đánh giá.",
                        )
                      }
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 disabled:opacity-60"
                    >
                      Duyệt
                    </button>
                    <button
                      type="button"
                      disabled={workingId === review.id}
                      onClick={() =>
                        handleUpdate(
                          review.id,
                          { status: "rejected" },
                          "Đã ẩn đánh giá.",
                        )
                      }
                      className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 disabled:opacity-60"
                    >
                      Ẩn đánh giá
                    </button>
                    <button
                      type="button"
                      disabled={workingId === review.id}
                      onClick={() =>
                        handleUpdate(
                          review.id,
                          { verifiedBuyer: !review.verifiedBuyer },
                          review.verifiedBuyer
                            ? "Đã bỏ đánh dấu người mua đã xác thực."
                            : "Đã đánh dấu người mua đã xác thực.",
                        )
                      }
                      className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 disabled:opacity-60"
                    >
                      {review.verifiedBuyer ? "Bỏ xác thực" : "Đánh dấu xác thực"}
                    </button>
                    <button
                      type="button"
                      disabled={workingId === review.id}
                      onClick={() => handleDelete(review.id)}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-600 disabled:opacity-60"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {!loading && reviews.length === 0 ? (
            <p className="text-sm text-stone-500">Chưa có đánh giá nào.</p>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
