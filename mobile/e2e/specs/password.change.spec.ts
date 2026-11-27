describe('FlashGuard Change Password', () => {

    it('TC-MOB-002 - Change Password', async () => {

        // Step 1: Launch FlashGuard
        await driver.activateApp(
            'com.anonymous.flashguadmobileapp'
        );

        // Step 2: Sign in
        const signIn = await $(
            '//android.view.ViewGroup[starts-with(@content-desc,"Sign In,")]'
        );

        await signIn.waitForDisplayed({ timeout: 20000 });
        await signIn.click();

        // Step 3: Dismiss welcome pop-up
        const okButton = await $(
            '//android.widget.Button[@text="OK"]'
        );

        await okButton.waitForDisplayed({ timeout: 15000 });
        await okButton.click();

        // Step 4: Open Account
        const accountTab = await $('~PF, Account');

        await accountTab.waitForDisplayed({ timeout: 20000 });
        await accountTab.click();

        // Step 5: Verify Account screen opened
        const profile = await $(
            '//android.widget.TextView[@text="Private banking profile and settings"]'
        );

        await profile.waitForDisplayed({ timeout: 15000 });

        // Step 6: Open Settings
        const settings = await $(
            '//android.widget.TextView[@text="⚙"]'
        );

        await settings.waitForDisplayed({ timeout: 10000 });
        await settings.click();

        // Step 7: Verify Change Password is available
        const changePassword = await $(
            '//android.widget.TextView[@text="Change Password"]'
        );

        await changePassword.waitForDisplayed({
            timeout: 15000
        });

        await changePassword.click();

    });

});