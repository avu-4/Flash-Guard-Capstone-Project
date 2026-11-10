
import sql from "mssql";
import { readFileSync } from "node:fs";
import path from "node:path";
import "dotenv/config";

const dbConfig: sql.config = {
  server: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 1433),
  database: process.env.DB_NAME ?? "FlashGuard",
  user: process.env.DB_USER ?? "fg",
  password: process.env.DB_PASSWORD ?? "YourStrong!Passw0rd",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const seedFile = path.resolve(
  __dirname,
  "../testData/99-reset-and-seed.sql"
);

export const SEEDED_TRANSACTIONS = 4;

async function withPool<T>(
  fn: (pool: sql.ConnectionPool) => Promise<T>
): Promise<T> {
  if (dbConfig.database !== "FlashGuard") {
    throw new Error(
      `Database access blocked: expected FlashGuard, got ${dbConfig.database}`
    );
  }

  const pool = await new sql.ConnectionPool(dbConfig).connect();

  try {
    return await fn(pool);
  } finally {
    await pool.close();
  }
}

export async function resetDatabase(): Promise<void> {
  if (dbConfig.database !== "FlashGuard") {
    throw new Error(
      `Database reset blocked: expected FlashGuard, got ${dbConfig.database}`
    );
  }

  const batches = readFileSync(seedFile, "utf8")
    .split(/^\s*GO\s*$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);

  await withPool(async (pool) => {
    for (const batch of batches) {
      await pool.request().batch(batch);
    }
  });
}

export async function setBalance(
  fullName: string,
  balance: string
): Promise<void> {
  await withPool(async (pool) => {
    const result = await pool
      .request()
      .input("name", sql.NVarChar, fullName)
      .input("balance", sql.Decimal(18, 2), Number(balance))
      .query(`
        UPDATE dbo.accounts
        SET balance = @balance
        WHERE full_name = @name
      `);

    if (result.rowsAffected[0] === 0) {
      throw new Error(`Account not found: ${fullName}`);
    }
  });
}

export async function setAccountActive(
  fullName: string,
  active: boolean
): Promise<void> {
  await withPool(async (pool) => {
    const result = await pool
      .request()
      .input("name", sql.NVarChar, fullName)
      .input("active", sql.Bit, active ? 1 : 0)
      .query(`
        UPDATE dbo.accounts
        SET is_active = @active
        WHERE full_name = @name
      `);

    if (result.rowsAffected[0] === 0) {
      throw new Error(`Account not found: ${fullName}`);
    }
  });
}

export async function setBlacklistStatus(
  recipientName: string,
  status: string
): Promise<void> {
  await withPool(async (pool) => {
    const check = await pool
      .request()
      .input("name", sql.NVarChar, recipientName)
      .query(`
        SELECT
          a.id AS account_id,
          a.full_name,
          r.id AS recipient_id,
          r.blacklist_status
        FROM dbo.accounts a
        LEFT JOIN dbo.recipients r
          ON a.id = r.recipient_account_id
        WHERE a.full_name = @name
      `);

    if (
      check.recordset.length === 0 ||
      check.recordset.every((row) => row.recipient_id === null)
    ) {
      throw new Error(
        `No saved-recipient record found for ${recipientName}`
      );
    }

    const result = await pool
      .request()
      .input("name", sql.NVarChar, recipientName)
      .input("status", sql.NVarChar, status)
      .query(`
        UPDATE r
        SET r.blacklist_status = @status
        FROM dbo.recipients r
        JOIN dbo.accounts a
          ON a.id = r.recipient_account_id
        WHERE a.full_name = @name
      `);

    if (result.rowsAffected[0] === 0) {
      throw new Error(
        `Blacklist status was not updated for ${recipientName}`
      );
    }

    const verify = await pool
      .request()
      .input("name", sql.NVarChar, recipientName)
      .query(`
        SELECT
          a.full_name,
          r.blacklist_status
        FROM dbo.recipients r
        JOIN dbo.accounts a
          ON a.id = r.recipient_account_id
        WHERE a.full_name = @name
      `);

    const updated = verify.recordset.every(
      (row) => row.blacklist_status === status
    );

    if (!updated) {
      throw new Error(
        `Blacklist verification failed for ${recipientName}`
      );
    }
  });
}

export async function countTransactions(): Promise<number> {
  return withPool(async (pool) => {
    const result = await pool
      .request()
      .query("SELECT COUNT(*) AS c FROM dbo.transactions");

    return result.recordset[0].c as number;
  });
}

// ---------- read helpers added for the TR-007 (OTP) steps ----------

export async function getBalance(fullName: string): Promise<string> {
  return withPool(async (pool) => {
    const result = await pool
      .request()
      .input("name", sql.NVarChar, fullName)
      .query(`
        SELECT balance
        FROM dbo.accounts
        WHERE full_name = @name
      `);

    if (result.recordset.length === 0) {
      throw new Error(`Account not found: ${fullName}`);
    }

    return Number(result.recordset[0].balance).toFixed(2);
  });
}

export async function getLatestTransactionStatus(): Promise<string> {
  return withPool(async (pool) => {
    const result = await pool
      .request()
      .query(`
        SELECT TOP 1 status
        FROM dbo.transactions
        ORDER BY id DESC
      `);

    if (result.recordset.length === 0) {
      throw new Error("No transactions found");
    }

    return String(result.recordset[0].status).toLowerCase();
  });
}