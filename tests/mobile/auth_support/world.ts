import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { remote } from 'webdriverio';
 
export type MobileDriver = Awaited<ReturnType<typeof remote>>;
 
export class MobileWorld extends World {
  driver?: MobileDriver;
}
 
setWorldConstructor(MobileWorld);