import { v2 as cloudinary } from "cloudinary";

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER,
} = process.env;

let configured = false;

export function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

function getFolder(folder) {
  return folder || CLOUDINARY_FOLDER || "maison-shop";
}

function getCloudinaryClient() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

export async function uploadDataUri(dataUri, options = {}) {
  const client = getCloudinaryClient();
  const result = await client.uploader.upload(dataUri, {
    folder: getFolder(options.folder),
    public_id: options.publicId,
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function uploadFile(file, options = {}) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "image/png";
  const base64 = buffer.toString("base64");
  return uploadDataUri(`data:${mimeType};base64,${base64}`, options);
}
