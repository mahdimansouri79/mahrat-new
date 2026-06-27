import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "185.126.10.222",
  database: "maharatakqz_db",
  password: "bQuY5KieKenPz5jUjC4v",
  port: 31197,
  ssl: {
    rejectUnauthorized: false
  }
});
