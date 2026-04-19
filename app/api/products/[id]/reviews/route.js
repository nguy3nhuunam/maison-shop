import { NextResponse } from "next/server";
import { isCloudinaryConfigured, uploadDataUri } from "@/lib/cloudinary";
import { createProductReview } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const payload = await request.json();
    const images = Array.isArray(payload.images) ? payload.images : [];
    const uploadedImages = [];

    for (const image of images) {
      const rawImage = String(image || "");

      if (!rawImage) {
        continue;
      }

      if (rawImage.startsWith("data:image/")) {
        try {
          const uploaded = isCloudinaryConfigured()
            ? await uploadDataUri(rawImage, { folder: "maison-shop/reviews" })
            : null;

          uploadedImages.push(uploaded?.url || rawImage);
        } catch {
          uploadedImages.push(rawImage);
        }
      } else {
        uploadedImages.push(rawImage);
      }
    }

    const review = await createProductReview(params.id, {
      name: payload.name,
      phone: payload.phone,
      content: payload.content,
      rating: payload.rating,
      images: uploadedImages,
    });

    if (!review) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to submit review." },
      { status: 400 },
    );
  }
}
