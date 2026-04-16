# bcv-web-scrapping

Servicio HTTP en Bun que extrae y normaliza las tasas del BCV.

Retorna tanto el resumen completo (BCV + bancos + promedios), como rutas especificas para consultar solo monedas.

## Descargo de responsabilidad

Este proyecto se publica exclusivamente con fines educativos y de investigacion tecnica.

La informacion expuesta por esta API no constituye, ni debe interpretarse como, asesoria financiera, legal, cambiaria o de inversion.

Los datos se obtienen de fuentes publicas externas y pueden presentar retrasos, inexactitudes, cambios o interrupciones sin previo aviso.

Los mantenedores no garantizan la exactitud, disponibilidad o vigencia de la informacion, y no asumen responsabilidad por decisiones, perdidas o danos derivados de su uso.

Este proyecto es independiente y no esta afiliado, avalado ni representa oficialmente al Banco Central de Venezuela (BCV).

## Requisitos

- Bun

## Instalacion

```bash
bun install
```

## Ejecucion

```bash
bun start
```

Servidor por defecto: `http://localhost:3000`.

## Endpoints

- `GET /`: resumen completo (BCV, bancos, promedios y diferencia)
- `GET /monedas`: solo monedas BCV (sin bancos ni promedios)
- `GET /monedas/euro`: solo valor de EUR
- `GET /monedas/dolar`: solo valor de USD
- `GET /health`: chequeo de salud

### Ejemplos rapidos

Resumen completo:

```bash
curl http://localhost:3000/
```

Solo monedas:

```bash
curl http://localhost:3000/monedas
```

Solo euro:

```bash
curl http://localhost:3000/monedas/euro
```

Solo dolar:

```bash
curl http://localhost:3000/monedas/dolar
```

### Formato de respuestas

`GET /monedas`:

```json
[
  { "moneda": "EUR", "valor": 565.98 },
  { "moneda": "USD", "valor": 479.77 }
]
```

`GET /monedas/euro`:

```json
{ "moneda": "EUR", "valor": 565.98 }
```

`GET /monedas/dolar`:

```json
{ "moneda": "USD", "valor": 479.77 }
```

## Variables de entorno

- `PORT`: puerto HTTP (default: `3000`)
- `BCV_URL`: URL fuente de datos (default: `https://www.bcv.org.ve/`)
- `BCV_CACHE_TTL_MS`: cache en memoria para evitar múltiples requests seguidos (default: `120000`)

## Nota TLS

El scraper intenta conexión TLS normal primero. Si falla por cadena de certificados del origen (`UNABLE_TO_VERIFY_LEAF_SIGNATURE` u otros similares), aplica un reintento con `rejectUnauthorized: false` para mantener la disponibilidad del servicio.

## Codigos HTTP

- `200`: respuesta exitosa
- `404`: ruta no existe o moneda no encontrada
- `502`: BCV no disponible o error extrayendo datos
