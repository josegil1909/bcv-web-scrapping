import { extractFromHtml } from "@extractus/article-extractor";
import { load } from "cheerio";

const BCV_URL = process.env.BCV_URL ?? "https://www.bcv.org.ve/";
const CACHE_TTL_MS = Number(process.env.BCV_CACHE_TTL_MS ?? 120000);

let cache = {
  data: null,
  fetchedAt: 0,
};

const TLS_CERT_ERRORS = new Set([
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_GET_ISSUER_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
]);

function parseDecimal(value) {
  if (!value || typeof value !== "string") {
    return Number.NaN;
  }

  const normalized = value
    .trim()
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  return Number.parseFloat(normalized);
}

function isTlsCertificateError(error) {
  return Boolean(error?.code && TLS_CERT_ERRORS.has(error.code));
}

async function fetchHtmlFromBcv() {
  try {
    const strictResponse = await fetch(BCV_URL);
    return await strictResponse.text();
  } catch (error) {
    if (!isTlsCertificateError(error)) {
      throw error;
    }

    console.warn(
      "BCV TLS certificate validation failed. Retrying with rejectUnauthorized=false"
    );

    const fallbackResponse = await fetch(BCV_URL, {
      tls: {
        rejectUnauthorized: false,
      },
    });

    return await fallbackResponse.text();
  }
}

function parseBankRates(content) {
  const $ = load(content);
  const bancos = [];

  $("tbody tr").each((_, row) => {
    const cells = $(row)
      .find("td")
      .map((__, cell) => $(cell).text().trim())
      .get()
      .filter(Boolean);

    if (cells.length < 3) {
      return;
    }

    const compra = parseDecimal(cells[1]);
    const venta = parseDecimal(cells[2]);

    if (Number.isNaN(compra) || Number.isNaN(venta)) {
      return;
    }

    bancos.push({
      banco: cells[0],
      compra,
      venta,
    });
  });

  return bancos;
}

function parseBcvRates(content) {
  const $ = load(content);
  const rates = [];
  const seenCurrencies = new Set();

  $("p > span").each((_, span) => {
    const moneda = $(span).text().trim();
    const container = $(span).closest("div");
    const rawValor = container.find("p strong").first().text().trim();

    if (!/^[A-Z]{3}$/.test(moneda) || !rawValor) {
      return;
    }

    if (seenCurrencies.has(moneda)) {
      return;
    }

    const valor = parseDecimal(rawValor);

    if (Number.isNaN(valor)) {
      return;
    }

    rates.push({
      moneda,
      valor,
    });

    seenCurrencies.add(moneda);
  });

  return rates;
}

function buildResult(content) {
  const bancos = parseBankRates(content);
  const bcv = parseBcvRates(content);

  const promedioCompra =
    bancos.length > 0
      ? bancos.reduce((acc, curr) => acc + curr.compra, 0) / bancos.length
      : null;
  const promedioVenta =
    bancos.length > 0
      ? bancos.reduce((acc, curr) => acc + curr.venta, 0) / bancos.length
      : null;
  const diferencia =
    promedioCompra !== null && promedioVenta !== null
      ? promedioVenta - promedioCompra
      : null;

  return {
    BCV: bcv,
    Bancos: bancos,
    promedioCompra,
    promedioVenta,
    Diferencia: diferencia,
  };
}

export async function getBcvData({ forceRefresh = false } = {}) {
  const now = Date.now();
  const hasFreshCache =
    !forceRefresh &&
    cache.data !== null &&
    Number.isFinite(CACHE_TTL_MS) &&
    now - cache.fetchedAt <= CACHE_TTL_MS;

  if (hasFreshCache) {
    return cache.data;
  }

  const html = await fetchHtmlFromBcv();
  const article = await extractFromHtml(html, BCV_URL);

  if (!article?.content) {
    throw new Error("No se pudo extraer contenido útil desde BCV");
  }

  const data = buildResult(article.content);

  cache = {
    data,
    fetchedAt: now,
  };

  return data;
}

export default getBcvData;
