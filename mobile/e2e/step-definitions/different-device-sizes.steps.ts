import { When, Then } from '@wdio/cucumber-framework';

const dashboard =
    '//android.widget.TextView[@text="TOTAL NET WORTH"]';

const quickActionButton =
    '//*[@clickable="true" and @content-desc="+"]';

const carousel =
    '//android.widget.HorizontalScrollView';

let screenWidth: number;
let screenHeight: number;

When('the device screen dimensions are recorded', async () => {
    const screen = await driver.getWindowSize();

    screenWidth = screen.width;
    screenHeight = screen.height;

    console.log(`Device size: ${screenWidth}x${screenHeight}`);
});

Then('the Dashboard should be visible', async () => {
    await $(dashboard).waitForDisplayed({
        timeout: 15000
    });
});

Then('the quick action button should be visible', async () => {
    await $(quickActionButton).waitForDisplayed({
        timeout: 15000
    });
});

Then('the carousel should be visible', async () => {
    await $(carousel).waitForDisplayed({
        timeout: 15000
    });
});

Then('the key elements should remain within the screen boundaries', async () => {

    const elements = [
        { name: 'Dashboard', selector: dashboard },
        { name: 'Quick Action Button', selector: quickActionButton },
        { name: 'Carousel', selector: carousel }
    ];

    for (const item of elements) {
        const element = await $(item.selector);

        await expect(element).toBeDisplayed();

        const location = await element.getLocation();
        const size = await element.getSize();

        console.log(item.name, {
            x: location.x,
            y: location.y,
            width: size.width,
            height: size.height
        });

        expect(location.x).toBeGreaterThanOrEqual(0);
        expect(location.y).toBeGreaterThanOrEqual(0);

        expect(location.x + size.width)
            .toBeLessThanOrEqual(screenWidth + 1);

        expect(location.y + size.height)
            .toBeLessThanOrEqual(screenHeight + 1);

        console.log(`${item.name}: Within screen boundaries`);
    }
});