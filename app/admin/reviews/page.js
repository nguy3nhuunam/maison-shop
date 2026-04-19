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
      label: "Da duyet",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  if (status === "rejected") {
    return {
      label: "Da an",
      className: "bg-red-100 text-red-600",
    };
  }

  return {
    label: "Cho duyet",
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
        setMessage(error.message || "Khong the tai danh sach review.");
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
      setMessage(error.message || "Khong the cap nhat review.");
    } finally {
      setWorkingId(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Xoa review nay?")) {
      return;
    }

    setWorkingId(id);
    setMessage("");

    try {
      await adminFetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      setReviews((current) => current.filter((review) => review.id !== id));
      setMessage("Da xoa review.");
    } catch (error) {
      setMessage(error.message || "Khong the xoa review.");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <AdminShell
      title="Reviews"
      description="Duyet review moi, kiem tra verified buyer va quan ly hinh anh review cua tung san pham."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <div className="luxury-card rounded-[32px] p-6">
          <p className="text-sm text-stone-500">Tong review</p>
          <p className="mt-3 text-4xl font-bold text-stone-900">{reviews.length}</p>
        </div>
        <div className="luxury-card rounded-[32px] p-6">
          <p className="text-sm text-stone-500">Cho duyet</p>
          <p className="mt-3 text-4xl font-bold text-amber-700">{pendingCount}</p>
        </div>
        <div className="luxury-card rounded-[32px] p-6">
          <p className="text-sm text-stone-500">Verified buyer</p>
          <p className="mt-3 text-4xl font-bold text-stone-900">
            {reviews.filter((review) => review.verifiedBuyer).length}
          </p>
        </div>
      </section>

      <section className="luxury-card rounded-[32px] p-6">
        {loading ? <p className="text-sm text-stone-500">Dang tai review...</p> : null}
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
                            Verified buyer
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
                          "Da duyet review.",
                        )
                      }
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 disabled:opacity-60"
                    >
                      Duyet
                    </button>
                    <button
                      type="button"
                      disabled={workingId === review.id}
                      onClick={() =>
                        handleUpdate(
                          review.id,
                          { status: "rejected" },
                          "Da an review.",
                        )
                      }
                      className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 disabled:opacity-60"
                    >
                      An review
                    </button>
                    <button
                      type="button"
                      disabled={workingId === review.id}
                      onClick={() =>
                        handleUpdate(
                          review.id,
                          { verifiedBuyer: !review.verifiedBuyer },
                          review.verifiedBuyer
                            ? "Da bo danh dau verified buyer."
                            : "Da danh dau verified buyer.",
                        )
                      }
                      className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 disabled:opacity-60"
                    >
                      {review.verifiedBuyer ? "Bo verified" : "Danh dau verified"}
                    </button>
                    <button
                      type="button"
                      disabled={workingId === review.id}
                      onClick={() => handleDelete(review.id)}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-600 disabled:opacity-60"
                    >
                      Xoa
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {!loading && reviews.length === 0 ? (
            <p className="text-sm text-stone-500">Chua co review nao.</p>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
