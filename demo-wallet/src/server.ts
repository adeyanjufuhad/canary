import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { createPool } from "./db.ts";

const port = Number(process.env.PORT ?? 4000);
const db = createPool(process.env.DATABASE_URL);

serve({ fetch: createApp(db).fetch, port }, (info) => {
  console.log(`demo-wallet listening on http://localhost:${info.port}`);
});
