import { Pool } from "pg";
import { env } from "./env";

// Single shared pool for the whole app. Repositories are the only layer
// permitted to import this — see docs/architecture.md.
export const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on("error", (err) => {
  // A background/idle client failed — this is unexpected outside of a
  // query, so log loudly rather than silently swallowing it.
  console.error("Unexpected error on idle Postgres client", err);
});
