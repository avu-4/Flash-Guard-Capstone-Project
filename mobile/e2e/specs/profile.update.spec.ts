/*async function login() {

    const signIn = await $('~Sign In, ›');

    await signIn.waitForDisplayed({ timeout: 15000 });

    await signIn.click();

    await driver.pause(3000);

}


describe('Mobile app suite', () => {

    beforeEach(async () => {
        await driver.setOrientation('PORTRAIT');
    });

    it('TC-MOB-001 – Update Profile', async () => {

        // Step 1: Login to the application
        await login();

        // Step 2: Open the Profile tab
        await openTab(SEL.profileTab);

        // Step 3: Update profile details
        await $(SEL.firstName).waitForDisplayed();
        await $(SEL.firstName).setValue('Updated');
        await $(SEL.lastName).setValue('Tester');
        await $(SEL.phone).setValue('0821234567');

        // Step 4: Hide keyboard
        await driver.hideKeyboard().catch(() => undefined);

        // Step 5: Save profile
        await $(SEL.saveProfile).click();

        // Step 6: Verify success message
        await expectToast(/updated|saved|success/i);

        // Step 7: Logout
        await logout();

        // Step 8: Login again to check persistence
        await login();

        // Step 9: Open Profile again
        await openTab(SEL.profileTab);

        // Step 10: Verify saved profile information
        await $(SEL.firstName).waitForDisplayed();

        expect(await $(SEL.firstName).getValue()).toBe('Updated');
        expect(await $(SEL.lastName).getValue()).toBe('Tester');
        expect(await $(SEL.phone).getValue()).toBe('0821234567');

    });

});*/

describe('Mobile app suite', () => {

    it('TC-MOB-001 - Update Profile', async () => {

        // Step 1: Launch application
        await driver.activateApp(
            'com.anonymous.flashguadmobileapp'
        );

        // Step 2: Login
        const signIn = await $(
            '//android.view.ViewGroup[starts-with(@content-desc,"Sign In,")]'
        );

        await signIn.waitForDisplayed({ timeout: 20000 });
        await signIn.click();

        const okButton = await $(
            '//android.widget.Button[@text="OK"]'
        );

        await okButton.waitForDisplayed({ timeout: 15000 });
        await okButton.click();

        // Step 3: Open Account tab
        const accountTab = await $('~PF, Account');

        await accountTab.waitForDisplayed({ timeout: 20000 });
        await accountTab.click();

        // Step 4: Open profile settings
        const settings = await $(
            '//android.widget.TextView[@text="\u2699"]'
        );

        await settings.waitForDisplayed({ timeout: 10000 });
        await settings.click();

        // Step 5: Verify profile editing screen opens
        // Known defect: Settings does not open the profile screen.
        const editField = await $('//android.widget.EditText');

        await editField.waitForDisplayed({
            timeout: 15000,
            timeoutMsg: 'DEFECT: Profile settings screen failed to open'
        });

        // Remaining profile update steps are blocked
        // until the application defect is resolved.

    });

});