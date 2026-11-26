import 'dotenv/config';
const env = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
}).process?.env ?? {};

function requiredEnv(name: string, ...aliases: string[]): string {
  const candidates = [name, ...aliases];
  const value = candidates.map((candidate) => env[candidate]).find((candidate) => Boolean(candidate));

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}${aliases.length ? ` (tried: ${candidates.join(', ')})` : ''}`);
  }

  return value;
}

export const config = {
  baseURL: env.BASE_URL ?? 'http://localhost:3000',

  credentials: {
    primary: {
      email: requiredEnv('TEST_USER_A_EMAIL'),
      password: requiredEnv('TEST_USER_A_PASSWORD'),
    },

    secondary: {
      email: requiredEnv('TEST_USER_B_EMAIL', 'TEST_SECONDARY_B_EMAIL'),
      password: requiredEnv('TEST_USER_B_PASSWORD', 'TEST_SECONDARY_B_PASSWORD'),
    },
  },
};
