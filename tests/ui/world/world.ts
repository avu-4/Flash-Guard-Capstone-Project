import { World, setWorldConstructor } from "@cucumber/cucumber";
import { BrowserContext, Page } from "@playwright/test";

export class FlashGuardWorld extends World {
    context! : BrowserContext;
    page! : Page;  
}
setWorldConstructor(FlashGuardWorld);