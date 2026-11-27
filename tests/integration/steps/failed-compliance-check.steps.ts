import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { FlashWorld } from '../../../src/support/world';
import { withPool } from '../../ui/testData/db';
import sql from 'mssql';

import {
    selectRecipient,
    confirmTransfer
} from '../../ui/transferMoney/transferMoney';

// COMPLIANCE TEST DATA

const senderId = 1;
const blockedRecipientId = 3;
const recipientRecordId = 2;
const transferAmount = 100;

let senderOpeningBalance: number;
let recipientOpeningBalance: number;

let transactionBaseline: number;
let ledgerBaseline: number;
let lastTransactionId: number;
let lastAuditId: number;

let transferResponseStatus: number;
let transferResponseBody: any;
let complianceResponseBody: any;
let webErrorMessage: string;

// DATABASE HELPER

async function getComplianceAccount(accountId: number) {
    return withPool(async pool => {
        const result = await pool.request()
            .input('id', sql.Int, accountId)
            .query(`
                SELECT id, full_name, balance, is_active
                FROM dbo.accounts
                WHERE id = @id
            `);

        expect(result.recordset.length).toBe(1);

        return result.recordset[0];
    });
}

// DATABASE BASELINE HELPER

async function getDatabaseSnapshot() {
    return withPool(async pool => {
        const result = await pool.request().query(`
            SELECT
                (SELECT COUNT(*) FROM dbo.transactions)
                    AS transaction_count,
                (SELECT COUNT(*) FROM dbo.ledger_entries)
                    AS ledger_count,
                (SELECT MAX(id) FROM dbo.transactions)
                    AS last_transaction_id,
                (SELECT MAX(id) FROM dbo.audit_log)
                    AS last_audit_id
        `);

        return result.recordset[0];
    });
}
// COMPLIANCE PRECONDITIONS

Given('a sanctioned test recipient exists',
    async function () {
        await withPool(async pool => {
            const result = await pool.request()
                .input('id', sql.Int, recipientRecordId)
                .query(`
                    SELECT sender_account_id,
                           recipient_account_id,
                           blacklist_status
                    FROM dbo.recipients
                    WHERE id = @id
                `);

            expect(result.recordset.length).toBe(1);

            const recipient = result.recordset[0];

            expect(recipient.sender_account_id)
                .toBe(senderId);

            expect(recipient.recipient_account_id)
                .toBe(blockedRecipientId);

            expect(recipient.blacklist_status)
                .toBe('blocked');
        });

        const response = await fetch(
            `http://localhost:4000/recipients/${recipientRecordId}/status`
        );

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body.id).toBe(recipientRecordId);
        expect(body.blacklist_status).toBe('blocked');

        console.log('Blocked recipient verified in API and database');
    }
);

Given('the compliance test opening balances are recorded',
    async function () {
        const sender = await getComplianceAccount(senderId);

        const recipient = await getComplianceAccount(
            blockedRecipientId
        );

        expect(sender.is_active).toBe(true);
        expect(recipient.full_name).toBe('Charlie Frozen');

        senderOpeningBalance = Number(sender.balance);
        recipientOpeningBalance = Number(recipient.balance);

        expect(senderOpeningBalance)
            .toBeGreaterThanOrEqual(transferAmount);

        console.log('Sender opening balance:', senderOpeningBalance);
        console.log('Recipient opening balance:', recipientOpeningBalance);
        console.log('Recipient active status:', recipient.is_active);
    }
);

Given('the transaction and ledger baselines are recorded',
    async function () {
        const snapshot = await getDatabaseSnapshot();

        transactionBaseline = snapshot.transaction_count;
        ledgerBaseline = snapshot.ledger_count;
        lastTransactionId = snapshot.last_transaction_id ?? 0;

        console.log('Transaction baseline:', transactionBaseline);
        console.log('Ledger baseline:', ledgerBaseline);
        console.log('Last transaction ID:', lastTransactionId);
    }
);

Given('the compliance audit baseline is recorded',
    async function () {
        const snapshot = await getDatabaseSnapshot();

        lastAuditId = snapshot.last_audit_id ?? 0;

        console.log('Last audit ID:', lastAuditId);
    }
);
// SANCTIONED RECIPIENT SELECTION

When('the user selects the sanctioned recipient',
    async function (this: FlashWorld) {
        await selectRecipient(this.page, 'Charlie Frozen');

        console.log('Blocked recipient selected: Charlie Frozen');
    }
);

// SANCTIONED TRANSFER ATTEMPT

When('the user attempts the sanctioned transfer',
    async function (this: FlashWorld) {

        // Verify compliance API response

        const complianceResponse = await fetch(
            'http://localhost:4000/compliance-checks/validate',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    senderAccountId: senderId,
                    recipientAccountId: blockedRecipientId,
                    recipientId: recipientRecordId,
                    amount: transferAmount
                })
            }
        );

        complianceResponseBody =
            await complianceResponse.json();

        console.log(
            'Compliance API HTTP status:',
            complianceResponse.status
        );

        console.log(
            'Compliance API response:',
            complianceResponseBody
        );

        // Capture the actual Web UI transfer request

        const responsePromise = this.page.waitForResponse(
            response =>
                new URL(response.url()).pathname ===
                    '/transactions/transfer' &&
                response.request().method() === 'POST'
        );

        await confirmTransfer(this.page);

        const response = await responsePromise;

        transferResponseStatus = response.status();
        transferResponseBody = await response.json();

        console.log(
            'Transfer API status:',
            transferResponseStatus
        );

        console.log(
            'Transfer API response:',
            transferResponseBody
        );

        // Capture the displayed error message

        const message = transferResponseBody.message;

        if (typeof message === 'string' && message.length > 0) {
            const errorLocator = this.page.getByText(
                message,
                { exact: true }
            ).first();

            await errorLocator.waitFor({
                state: 'visible',
                timeout: 5000
            }).catch(() => undefined);

            webErrorMessage = await errorLocator.isVisible()
                ? await errorLocator.innerText()
                : '';
        } else {
            webErrorMessage = '';
        }

        console.log('Web UI error:', webErrorMessage);
    }
);
// API COMPLIANCE ASSERTION

Then('the API compliance check should reject the transfer',
    function () {
        expect(transferResponseStatus).toBe(400);

        expect(complianceResponseBody.flagged,
            'Blocked recipient must fail compliance validation'
        ).toBe(true);

        console.log('Compliance rejection verified');
    }
);

// WEB UI ERROR ASSERTION

Then('the Web UI should display a user-friendly compliance error',
    function () {
        expect(webErrorMessage).not.toBe('');

        expect(webErrorMessage).toMatch(
            /blocked|sanctioned|restricted|compliance/i
        );

        console.log('User-friendly compliance error verified');
    }
);

// TRANSACTION INTEGRITY ASSERTION

Then('no transaction should be created in the database',
    async function () {
        const snapshot = await getDatabaseSnapshot();

        expect(snapshot.transaction_count)
            .toBe(transactionBaseline);

        expect(snapshot.last_transaction_id ?? 0)
            .toBe(lastTransactionId);

        console.log('No new transaction created');
    }
);

// LEDGER INTEGRITY ASSERTION

Then('no orphaned ledger entries should exist',
    async function () {
        const snapshot = await getDatabaseSnapshot();

        expect(snapshot.ledger_count).toBe(ledgerBaseline);

        await withPool(async pool => {
            const result = await pool.request().query(`
                SELECT COUNT(*) AS orphaned_entries
                FROM dbo.ledger_entries l
                LEFT JOIN dbo.transactions t
                    ON l.transaction_id = t.id
                WHERE t.id IS NULL
            `);

            expect(result.recordset[0].orphaned_entries)
                .toBe(0);
        });

        console.log('Ledger integrity verified');
    }
);

// BALANCE INTEGRITY ASSERTION

Then('the compliance test account balances should remain unchanged',
    async function () {
        const sender = await getComplianceAccount(senderId);

        const recipient = await getComplianceAccount(
            blockedRecipientId
        );

        expect(Number(sender.balance))
            .toBeCloseTo(senderOpeningBalance, 2);

        expect(Number(recipient.balance))
            .toBeCloseTo(recipientOpeningBalance, 2);

        console.log('Sender closing balance:', sender.balance);
        console.log('Recipient closing balance:', recipient.balance);
        console.log('Account balances unchanged');
    }
);

// AUDIT LOG HELPER

async function getFailedTransferAuditRecords() {
    return withPool(async pool => {
        const result = await pool.request()
            .input('last_id', sql.Int, lastAuditId)
            .input('sender_id', sql.Int, senderId)
            .query(`
                SELECT id, account_id, action,
                       metadata, created_at
                FROM dbo.audit_log
                WHERE id > @last_id
                  AND account_id = @sender_id
                ORDER BY id
            `);

        console.log('New audit records:', result.recordset);

        return result.recordset.filter(record =>
            /transfer|compliance/i.test(record.action) &&
            /fail|reject|block|denied/i.test(
                record.action + ' ' + record.metadata
            )
        );
    });
}

// FAILED TRANSFER AUDIT ASSERTION

Then('the audit log should record the failed transfer attempt',
    async function () {
        const records = await getFailedTransferAuditRecords();

        expect(records.length,
            'Failed transfer audit record must exist'
        ).toBeGreaterThan(0);

        console.log('Failed transfer audit record verified');
    }
);

// COMPLIANCE FAILURE REASON ASSERTION

Then('the audit log should contain the compliance failure reason',
    async function () {
        const records = await getFailedTransferAuditRecords();

        const reasonRecorded = records.some(record =>
            /blocked|blacklist|sanction|restricted/i.test(
                String(record.metadata)
            )
        );

        expect(reasonRecorded,
            'Audit log must contain the compliance failure reason'
        ).toBe(true);

        console.log('Compliance failure reason verified');
    }
);