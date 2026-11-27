describe('FlashGuard Profile Access', () => {

    it('should allow the user to access profile settings', async () => {

        // Step 1: Launch FlashGuard
        await driver.activateApp('com.anonymous.flashguadmobileapp');

        // Step 2: Sign in
        const signIn = await $('//android.view.ViewGroup[starts-with(@content-desc,"Sign In,")]');
        await signIn.waitForDisplayed({ timeout: 20000 });
        await signIn.click();

        // Dismiss Welcome back pop-up
const okButton = await $('//android.widget.Button[@text="OK"]');
await okButton.waitForDisplayed({ timeout: 15000 });
await okButton.click();

        // Step 3: Open Account
        const accountTab = await $('~PF, Account');
        await accountTab.waitForDisplayed({ timeout: 20000 });
        await accountTab.click();

        // Step 4: Locate Settings
        const settings = await $('//android.widget.TextView[@text="⚙"]');
        await settings.waitForDisplayed({ timeout: 10000 });

        // Step 5: Verify Settings is clickable
        const clickable = await settings.getAttribute('clickable');

        console.log('Settings clickable:', clickable);

        expect(clickable).toBe('true');

    });

});