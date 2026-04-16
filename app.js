import { getBcvData } from "./index.js";

const port = Number(process.env.PORT ?? 3000);
const DATA_ROUTES = new Set([
  "/",
  "/monedas",
  "/monedas/euro",
  "/monedas/dolar",
]);

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function findCurrency(rates, code) {
  return rates.find((rate) => rate.moneda === code) ?? null;
}

const server = Bun.serve({
  port,

  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return jsonResponse({ ok: true });
    }

    if (!DATA_ROUTES.has(url.pathname)) {
      return jsonResponse({ error: "Not Found" }, 404);
    }

    try {
      const result = await getBcvData();

      if (url.pathname === "/") {
        return jsonResponse(result);
      }

      if (url.pathname === "/monedas") {
        return jsonResponse(result.BCV);
      }

      if (url.pathname === "/monedas/euro") {
        const euro = findCurrency(result.BCV, "EUR");
        if (!euro) {
          return jsonResponse({ error: "Moneda EUR no encontrada" }, 404);
        }

        return jsonResponse(euro);
      }

      const dolar = findCurrency(result.BCV, "USD");
      if (!dolar) {
        return jsonResponse({ error: "Moneda USD no encontrada" }, 404);
      }

      return jsonResponse(dolar);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";

      return jsonResponse(
        {
          error: "No se pudo obtener la data del BCV",
          detail: message,
        },
        502
      );
    }
  },
});

console.log(`Listening on localhost:${server.port}`);
