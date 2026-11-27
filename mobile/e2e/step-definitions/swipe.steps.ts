import { Given, When, Then } from '@wdio/cucumber-framework';

const carouselSelector = '//android.widget.HorizontalScrollView';

let originalItem: string;

// Identify the leading visible carousel card
async function getActiveItem(): Promise<string> {
    const carousel = await $(carouselSelector);

    const cards = await carousel.$$(
        './/*[@clickable="true" and @content-desc!=""]'
    );

    for (const card of cards) {
        if (await card.isDisplayed()) {
            return await card.getAttribute('content-desc');
        }
    }

    throw new Error('No visible carousel item found');
}

// Perform swipe gesture
async function swipeCarousel(direction: 'left' | 'right') {
    const carousel = await $(carouselSelector);

    await carousel.waitForDisplayed({ timeout: 15000 });

    await driver.execute('mobile: swipeGesture', {
        elementId: carousel.elementId,
        direction: direction,
        percent: 0.8
    });
}

// Verify carousel is displayed
Given('the carousel is displayed', async () => {
    const carousel = await $(carouselSelector);

    await carousel.waitForDisplayed({
        timeout: 15000
    });
});

// Record original carousel item
Given('the current carousel item is recorded', async () => {
    originalItem = await getActiveItem();

    console.log('Original carousel item:', originalItem);
});

// Swipe left
When('the user swipes left on the carousel', async () => {
    await swipeCarousel('left');
});

// Verify carousel item changed
Then('a different carousel item should be displayed', async () => {
    await driver.waitUntil(async () => {
        return await getActiveItem() !== originalItem;
    }, {
        timeout: 10000,
        timeoutMsg: 'Carousel item did not change after swiping left'
    });

    console.log('New carousel item:', await getActiveItem());
});

// Swipe right
When('the user swipes right on the carousel', async () => {
    await swipeCarousel('right');
});

// Verify original carousel item
Then('the original carousel item should be displayed', async () => {
    await driver.waitUntil(async () => {
        return await getActiveItem() === originalItem;
    }, {
        timeout: 10000,
        timeoutMsg: 'Original carousel item was not restored'
    });

    console.log('Original carousel item restored');
});