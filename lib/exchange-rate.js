import Setting from "@/models/Setting";
import { DISPLAY_EXCHANGE_RATE } from "@/lib/currency";
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb";

const EXCHANGE_RATE_CACHE_KEY = "exchangeRate:TWD_VND";
const EXCHANGE_RATE_API_URL = "https://api.exchangerate-api.com/v4/latest/TWD";

const globalCache = globalThis;

if (!globalCache.__maisonExchangeRateCache) {
  globalCache.__maisonExchangeRateCache = {
    rate: DISPLAY_EXCHANGE_RATE,
    lastUpdatedDate: "",
  };
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeRate(value) {
  const rate = Number(value);
  return Number.isFinite(rate) && rate > 0 ? rate : DISPLAY_EXCHANGE_RATE;
}

function normalizeCache(cache) {
  return {
    rate: normalizeRate(cache?.rate),
    lastUpdatedDate: String(cache?.lastUpdatedDate || ""),
  };
}

async function readStoredRate() {
  if (!isMongoConfigured()) {
    return normalizeCache(globalCache.__maisonExchangeRateCache);
  }

  await connectToDatabase();
  const row = await Setting.findOne({ key: EXCHANGE_RATE_CACHE_KEY }).lean();

  if (!row?.value) {
    return null;
  }

  try {
    return normalizeCache(JSON.parse(row.value));
  } catch {
    return null;
  }
}

async function writeStoredRate(rateCache) {
  const normalizedCache = normalizeCache(rateCache);
  globalCache.__maisonExchangeRateCache = normalizedCache;

  if (!isMongoConfigured()) {
    return normalizedCache;
  }

  await connectToDatabase();
  await Setting.updateOne(
    { key: EXCHANGE_RATE_CACHE_KEY },
    {
      $set: {
        key: EXCHANGE_RATE_CACHE_KEY,
        type: "exchangeRate",
        value: JSON.stringify(normalizedCache),
      },
    },
    { upsert: true },
  );

  return normalizedCache;
}

async function fetchLatestRate() {
  const response = await fetch(EXCHANGE_RATE_API_URL, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch exchange rate.");
  }

  const data = await response.json();
  const rate = Number(data?.rates?.VND);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Invalid exchange rate response.");
  }

  return {
    rate,
    lastUpdatedDate: getTodayKey(),
  };
}

export async function getDailyExchangeRate() {
  const today = getTodayKey();
  const cachedRate = await readStoredRate();

  if (cachedRate?.rate && cachedRate.lastUpdatedDate === today) {
    return {
      ...cachedRate,
      source: "cache",
    };
  }

  try {
    const freshRate = await fetchLatestRate();
    const storedRate = await writeStoredRate(freshRate);

    return {
      ...storedRate,
      source: "api",
    };
  } catch {
    if (cachedRate?.rate) {
      return {
        ...cachedRate,
        source: "stale-cache",
      };
    }

    return {
      rate: DISPLAY_EXCHANGE_RATE,
      lastUpdatedDate: today,
      source: "fallback",
    };
  }
}
