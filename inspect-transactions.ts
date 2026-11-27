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
      SELECT
        a.id AS account_id,
        a.full_name,
        t.status,
        COUNT(t.id) AS transaction_count
      FROM dbo.accounts a
      LEFT JOIN dbo.transactions t
        ON t.sender_account_id = a.id
      WHERE a.full_name = 'Alice Ledger'
      GROUP BY a.id, a.full_name, t.status
      ORDER BY t.status;
    `);

    console.log(result.recordset);
  } finally {
    await pool.close();
  }
}

main().catch(console.error);
