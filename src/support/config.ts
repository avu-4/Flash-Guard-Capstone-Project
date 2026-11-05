const env = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
}).process?.env ?? {};

function requiredEnv(name: string): string {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
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
      email: requiredEnv('TEST_SECONDARY_B_EMAIL'),
      password: requiredEnv('TEST_SECONDARY_B_PASSWORD'),
    },
  },
};
