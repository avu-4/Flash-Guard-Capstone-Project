import sql from "mssql";
import "dotenv/config";

async function main() {
  const pool = await new sql.ConnectionPool({
    server: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 1433),
    database: process.env.DB_NAME ?? "FlashGuard",
    user: process.env.DB_USER ?? "fg",
    password: process.env.DB_PASSWORD ?? "YourStrong!Passw0rd",
    options: { encrypt: true, trustServerCertificate: true },
  }).connect();

  try {
    const result = await pool.request().query(`
      SELECT t.id, t.status, a.full_name
      FROM dbo.transactions t
      INNER JOIN dbo.accounts a
        ON t.sender_account_id = a.id
      WHERE a.full_name = 'Alice Ledger'
        AND t.status = 'pending'
      ORDER BY t.id DESC;
    `);

    console.table(result.recordset);
  } finally {
    await pool.close();
  }
}

main().catch(console.error);
