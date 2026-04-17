import { google } from "googleapis";
import { getGoogleSheetsSettings } from "@/lib/db";

const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const ORDER_SHEET_HEADERS = [
  "Time",
  "Order ID",
  "Name",
  "Phone",
  "Address",
  "Product name",
  "Size",
  "Color",
  "Quantity",
  "Total price",
  "Currency",
  "Has image",
  "Image URL",
  "Status",
];

let cachedSheetTitle = "";
let cachedSpreadsheetId = "";
let headerEnsured = false;

function getGoogleSheetsEnv() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEET_ID?.trim();

  return {
    clientEmail,
    privateKey,
    spreadsheetId,
  };
}

async function getGoogleSheetsConfig() {
  const stored = await getGoogleSheetsSettings({ includePrivateKey: true });

  if (stored.exists) {
    if (!stored.enabled) {
      return null;
    }

    if (!stored.clientEmail || !stored.privateKey || !stored.sheetId) {
      throw new Error("Google Sheets sync is enabled but incomplete.");
    }

    return {
      clientEmail: stored.clientEmail,
      privateKey: stored.privateKey.replace(/\\n/g, "\n"),
      spreadsheetId: stored.sheetId,
    };
  }

  const envConfig = getGoogleSheetsEnv();
  if (!envConfig.clientEmail || !envConfig.privateKey || !envConfig.spreadsheetId) {
    return null;
  }

  return envConfig;
}

function createSheetsClient(config) {
  const { clientEmail, privateKey } = config;
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: [GOOGLE_SHEETS_SCOPE],
  });

  return google.sheets({
    version: "v4",
    auth,
  });
}

async function getSheetTitle(sheets, spreadsheetId) {
  if (cachedSheetTitle && cachedSpreadsheetId === spreadsheetId) {
    return cachedSheetTitle;
  }

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(title))",
  });
  const title = response.data.sheets?.[0]?.properties?.title;

  if (!title) {
    throw new Error("No sheet tab found in spreadsheet.");
  }

  cachedSheetTitle = title;
  cachedSpreadsheetId = spreadsheetId;
  headerEnsured = false;
  return cachedSheetTitle;
}

async function ensureOrderSheetHeader(sheets, spreadsheetId, sheetTitle) {
  if (headerEnsured && cachedSpreadsheetId === spreadsheetId) {
    return;
  }

  const headerRange = `${sheetTitle}!1:1`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: headerRange,
  });
  const existingHeader = response.data.values?.[0] || [];
  const headerMatches =
    existingHeader.length === ORDER_SHEET_HEADERS.length &&
    ORDER_SHEET_HEADERS.every((header, index) => existingHeader[index] === header);

  if (!headerMatches) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTitle}!A1:N1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [ORDER_SHEET_HEADERS],
      },
    });
  }

  headerEnsured = true;
}

function normalizeOrderRows(order) {
  const orderTime = order?.createdAt || order?.time || new Date().toISOString();
  const orderId = String(order?._id || order?.id || "");
  const customerName = String(order?.customer?.name || order?.name || "");
  const customerPhone = String(order?.customer?.phone || order?.phone || "");
  const customerAddress = String(
    order?.customer?.address ||
      order?.customer?.addressText ||
      order?.addressText ||
      order?.address ||
      "",
  );
  const imageUrl = String(order?.imageUrl || order?.addressImage || "");
  const hasImage = imageUrl ? "yes" : "no";
  const totalPrice = Number(order?.rawTotal ?? order?.total ?? 0);
  const currency = String(order?.currency || "");
  const items = Array.isArray(order?.items) && order.items.length > 0 ? order.items : [null];

  return items.map((item) => [
    orderTime,
    orderId,
    customerName,
    customerPhone,
    customerAddress,
    item?.productName || item?.name || "",
    item?.size || "",
    item?.color || "",
    Number(item?.quantity || 0),
    totalPrice,
    currency,
    hasImage,
    imageUrl,
    "NEW",
  ]);
}

export async function appendOrderToSheet(order) {
  const config = await getGoogleSheetsConfig();

  if (!config) {
    return;
  }

  const { spreadsheetId } = config;
  const sheets = createSheetsClient(config);
  const sheetTitle = await getSheetTitle(sheets, spreadsheetId);

  await ensureOrderSheetHeader(sheets, spreadsheetId, sheetTitle);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetTitle}!A:N`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: normalizeOrderRows(order),
    },
  });
}
