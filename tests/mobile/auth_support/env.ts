import { config } from 'dotenv';
import { resolve } from 'node:path';

config({
  path: resolve(process.cwd(), 'mobile_testing.env')
});
