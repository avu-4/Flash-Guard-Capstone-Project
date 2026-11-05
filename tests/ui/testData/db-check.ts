import { resetDatabase } from "./db";

resetDatabase()
  .then(() => console.log("Reset OK"))
  .catch((e) => { console.error("Reset failed:", e); process.exit(1); });