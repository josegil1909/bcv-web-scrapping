import result from "./index.js";

const server = Bun.serve({
  port: 3000 || process.env.PORT,

  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") {
      return new Response(`${JSON.stringify(result)}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  },
});

console.log(`Listening on localhost:${server.port}`);
