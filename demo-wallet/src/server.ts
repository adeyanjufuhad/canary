import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { createPool } from "./db.ts";

const port = Number(process.env.PORT ?? 4000);
// unset = all interfaces (needed inside Docker); the Canary sandbox sets 127.0.0.1
const hostname = process.env.HOST;
const db = createPool(process.env.DATABASE_URL);

serve({ fetch: createApp(db).fetch, port, hostname }, (info) => {
  console.log(`demo-wallet listening on http://localhost:${info.port}`);
});
