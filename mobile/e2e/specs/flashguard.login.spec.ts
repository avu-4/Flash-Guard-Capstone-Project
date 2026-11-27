describe('FlashGuard Android App', () => {

    it('should open the FlashGuard app', async () => {

        const currentPackage = await driver.getCurrentPackage();

        console.log('Current app package:', currentPackage);

        expect(currentPackage).toBe('com.anonymous.flashguadmobileapp');

    });

});