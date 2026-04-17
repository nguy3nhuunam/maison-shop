import jwt from "jsonwebtoken";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Sinhnam2000@@";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "maison-shop-local-secret";

export function validateAdminCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function signAdminToken() {
  return jwt.sign({ role: "admin", username: ADMIN_USERNAME }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAdminToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function getBearerToken(request) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice(7);
}

export function isAdminAuthError(error) {
  return (
    error?.message === "UNAUTHORIZED" ||
    ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error?.name)
  );
}
