import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { FlashWorld } from '../../../src/support/world';
import { config } from '../../../src/support/config';
import sql from 'mssql';
import { withPool } from '../../ui/testData/db';

import {
    selectSender,
    selectRecipient,
    enterAmount,
    confirmTransfer
} from '../../ui/transferMoney/transferMoney';

// WEB APPLICATION AVAILABILITY
let senderOpeningBalance: number;
let recipientOpeningBalance: number;
let authenticationVerified = false;
let transactionId: number;
const senderId = 1;
const recipientId = 2;

async function getAccount(accountId: number) {
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

Given('the FlashGuard web application is available',
    async function (this: FlashWorld) {
        await this.loginPage.goto();

        await expect(
            this.page.getByRole('textbox', {
                name: 'Email address'
            })
        ).toBeVisible();
    }
);

// BACKEND AND DATABASE PRECONDITIONS

Given('the backend API is available',
    async function () {
        const response = await fetch(
            'http://localhost:4000/health'
        );

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body.status).toBe('ok');

        console.log('Backend API connection verified');
    }
);



Given('the database connection is available',
    async function () {
        await withPool(async pool => {
            const result = await pool.request()
                .query('SELECT 1 AS connected');

            expect(result.recordset[0].connected).toBe(1);
        });

        console.log('Database connection verified');
    }
);


Given('the sender and recipient test accounts exist',
    async function () {
        const sender = await getAccount(senderId);
        const recipient = await getAccount(recipientId);

        expect(sender.full_name).toBe('Alice Ledger');
        expect(recipient.full_name).toBe('Bob Wallet');

        expect(sender.is_active).toBe(true);
        expect(recipient.is_active).toBe(true);

        expect(Number(sender.balance))
            .toBeGreaterThanOrEqual(100);

        console.log('Sender and recipient accounts verified');
    }
);

// WEB LOGIN

When('the user logs in via the Web UI',
    async function (this: FlashWorld) {
        const responsePromise = this.page.waitForResponse(
            response =>
                new URL(response.url()).pathname === '/auth/login' &&
                response.request().method() === 'POST'
        );

        await this.loginPage.login(
            config.credentials.primary.email,
            config.credentials.primary.password
        );

        const response = await responsePromise;

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body.token).toBeTruthy();
        expect(body.user.id).toBe(senderId);
        authenticationVerified = true;
        console.log('Authentication API verified');
    }
);


Then('the Web Dashboard should be displayed',
    async function (this: FlashWorld) {
        await expect(this.page).toHaveURL('/dashboard');

        await expect(
            this.page.getByRole('heading', {
                name: 'Portfolio Overview'
            })
        ).toBeVisible();
    }
);

Then('the authentication API request should succeed',
    function () {
        expect(authenticationVerified).toBe(true);

        console.log('Authentication API assertion passed');
    }
);

Then('a valid session should exist in the database', function () {
    return 'pending';
});

// OPENING BALANCES

Given('the sender opening balance is recorded',
    async function () {
        const sender = await getAccount(senderId);

        senderOpeningBalance = Number(sender.balance);

        console.log(
            'Sender opening balance:',
            senderOpeningBalance
        );
    }
);

Given('the recipient opening balance is recorded',
    async function () {
        const recipient = await getAccount(recipientId);

        recipientOpeningBalance = Number(recipient.balance);

        console.log(
            'Recipient opening balance:',
            recipientOpeningBalance
        );
    }
);

// TRANSFER INITIATION

When('the user selects the transfer option',
    async function (this: FlashWorld) {
        await this.page.goto('/transfers');

        await selectSender(this.page, 'Alice Ledger');
    }
);

When('the user enters a valid recipient',
    async function (this: FlashWorld) {
        await selectRecipient(this.page, 'Bob Wallet');
    }
);

When('the user enters a transfer amount of {string}',
    async function (this: FlashWorld, amount: string) {
        await enterAmount(this.page, amount);
    }
);

Then('the transfer pre-validation API should succeed',
    async function () {
        const response = await fetch(
            'http://localhost:4000/compliance-checks/validate',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: 100
                })
            }
        );

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body.flagged).toBe(false);
        expect(body.rule).toBeNull();
        expect(body.message).toBe('Compliant');

        console.log('Transfer compliance API verified');
    }
);

// TRANSFER CONFIRMATION

When('the user confirms the transfer',
    async function (this: FlashWorld) {
        const responsePromise = this.page.waitForResponse(
            response =>
                new URL(response.url()).pathname ===
                    '/transactions/transfer' &&
                response.request().method() === 'POST'
        );

        await confirmTransfer(this.page);

        const response = await responsePromise;

        expect(response.status()).toBe(201);

        const body = await response.json();

        expect(body.id).toBeGreaterThan(0);
        expect(body.sender_account_id).toBe(senderId);
        expect(body.recipient_account_id).toBe(recipientId);
        expect(Number(body.amount)).toBe(100);
        expect(body.status).toBe('pending');

        transactionId = body.id;

        console.log('Transaction ID:', transactionId);
        console.log('Transaction creation API verified');
    }
);

When('the user enters a valid OTP', function () {
    return 'pending';
});

Then('the transaction should be created successfully',
    async function (this: FlashWorld) {
        await expect(
            this.page.getByText(
                /^Transfer #\d+ created successfully!$/
            )
        ).toBeVisible();
    }
);

Then('the transaction ID should be recorded',
    function () {
        expect(transactionId).toBeDefined();
        expect(Number.isInteger(transactionId)).toBe(true);
        expect(transactionId).toBeGreaterThan(0);

        console.log(
            'Transaction ID successfully recorded:',
            transactionId
        );
    }
);

Then('the database transaction status should be {string}',
    async function (status: string) {
        await withPool(async pool => {
            const result = await pool.request()
                .input('id', sql.Int, transactionId)
                .query(`
                    SELECT id, sender_account_id,
                           recipient_account_id,
                           amount, status
                    FROM dbo.transactions
                    WHERE id = @id
                `);

            expect(result.recordset.length).toBe(1);

            const transaction = result.recordset[0];

            expect(transaction.id).toBe(transactionId);
            expect(transaction.sender_account_id).toBe(senderId);
            expect(transaction.recipient_account_id).toBe(recipientId);
            expect(Number(transaction.amount)).toBe(100);
            expect(transaction.status).toBe(status);

            console.log(
                'Database transaction status verified:',
                transaction.status
            );
        });
    }
);

// NOTIFICATION VALIDATION

Then('the user should receive a transfer notification', function () {
    return 'pending';
});

Then('the notification record should exist in the database', function () {
    return 'pending';
});

Then('the notification should match the transaction ID', function () {
    return 'pending';
});

// MOBILE APPLICATION VALIDATION

When('the user opens the FlashGuard mobile application', function () {
    return 'pending';
});

When('the user navigates to transaction history', function () {
    return 'pending';
});

Then('the transfer should be displayed in mobile history', function () {
    return 'pending';
});

Then('the mobile transaction details should match the API', function () {
    return 'pending';
});

Then('the mobile transaction details should match the database', function () {
    return 'pending';
});

// TRANSACTION COMPLETION

When('the transfer reaches a successful terminal status',
    async function () {
        await expect.poll(async () => {
            return withPool(async pool => {
                const result = await pool.request()
                    .input('id', sql.Int, transactionId)
                    .query(`
                        SELECT status
                        FROM dbo.transactions
                        WHERE id = @id
                    `);

                return result.recordset[0]?.status;
            });
        }, {
            timeout: 15000
        }).toBe('completed');

        await withPool(async pool => {
            const result = await pool.request()
                .input('id', sql.Int, transactionId)
                .query(`
                    SELECT authorized_at, settled_at
                    FROM dbo.transactions
                    WHERE id = @id
                `);

            expect(result.recordset.length).toBe(1);

            const transaction = result.recordset[0];

            expect(transaction.authorized_at).toBeTruthy();
            expect(transaction.settled_at).toBeTruthy();

            console.log('Transaction completed successfully');
            console.log('Authorization timestamp verified');
            console.log('Settlement timestamp verified');
        });
    }
);

Then('the sender balance should be reduced correctly',
    async function () {
        const sender = await getAccount(senderId);

        expect(Number(sender.balance))
            .toBeCloseTo(senderOpeningBalance - 100, 2);

        console.log(
            'Sender closing balance:',
            sender.balance
        );
    }
);

Then('the recipient balance should be increased correctly',
    async function () {
        const recipient = await getAccount(recipientId);

        expect(Number(recipient.balance))
            .toBeCloseTo(recipientOpeningBalance + 100, 2);

        console.log(
            'Recipient closing balance:',
            recipient.balance
        );
    }
);

Then('the database integrity checks should pass',
    async function () {
        await withPool(async pool => {
            const result = await pool.request()
                .input('id', sql.Int, transactionId)
                .query(`
                    SELECT account_id, entry_type, amount
                    FROM dbo.ledger_entries
                    WHERE transaction_id = @id
                `);

            const entries = result.recordset;

            expect(entries.length).toBe(2);

            const debit = entries.find(
                entry => entry.entry_type === 'debit'
            );

            const credit = entries.find(
                entry => entry.entry_type === 'credit'
            );

            expect(debit).toBeDefined();
            expect(credit).toBeDefined();

            expect(debit.account_id).toBe(senderId);
            expect(credit.account_id).toBe(recipientId);

            expect(Number(debit.amount)).toBe(100);
            expect(Number(credit.amount)).toBe(100);

            expect(Number(debit.amount))
                .toBe(Number(credit.amount));

            console.log('Debit ledger entry verified');
            console.log('Credit ledger entry verified');
            console.log('Database integrity checks passed');
        });
    }
);

Then('the mobile balance should match the API balance', function () {
    return 'pending';
});

Then('the API balance should match the database balance',
    async function () {
        for (const accountId of [senderId, recipientId]) {

            const response = await fetch(
                `http://localhost:4000/accounts/${accountId}/balance`
            );

            expect(response.status).toBe(200);

            const body = await response.json();

            const account = await getAccount(accountId);

            expect(body.id).toBe(accountId);

            expect(Number(body.balance))
                .toBeCloseTo(Number(account.balance), 2);

            console.log(
                'API and database balance matched:',
                account.full_name,
                body.balance
            );
        }
    }
);