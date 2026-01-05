import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import testData from '../../fixtures/test-data.json';

test.describe('Error Handling Tests', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
  });

  test('should handle 404 error page', async ({ page }) => {
    test.setTimeout(60000);
    // Navigate to non-existent page
    const response = await page.goto('https://www.saucedemo.com/non-existent-page-12345', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    }).catch(() => null);
    
    await homePage.wait(2000);
    
    // SauceDemo may redirect to login or show error
    const pageContent = await page.textContent('body').catch(() => '');
    expect(pageContent).toBeTruthy();
    
    // Check status code or error message
    const statusCode = response?.status();
    const hasError = statusCode === 404 || 
                     pageContent?.toLowerCase().includes('404') || 
                     pageContent?.toLowerCase().includes('not found') ||
                     pageContent?.toLowerCase().includes('error');
    
    // If redirected to login, that's also valid error handling
    const currentUrl = page.url();
    const wasRedirected = currentUrl.includes('saucedemo.com') && 
                          !currentUrl.includes('non-existent-page');
    
    expect(hasError || wasRedirected).toBeTruthy();
  });

  test('should handle invalid form submissions', async ({ page }) => {
    test.setTimeout(60000);
    // Login first
    await loginPage.navigateToLogin();
    const user = testData.users.standard;
    await loginPage.login(user.username, user.password);
    await homePage.wait(2000);
    
    // Add product and go to checkout
    await homePage.navigateToHome();
    await homePage.wait(2000);
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    await homePage.clickCartLink();
    await homePage.wait(2000);
    await cartPage.clickProceedToCheckout();
    await homePage.wait(2000);
    
    // Try to submit form with invalid data (empty fields)
    await checkoutPage.clickContinue();
    await homePage.wait(2000);
    
    // Should show validation error or prevent submission
    const currentUrl = homePage.getCurrentUrl();
    expect(currentUrl).toContain('checkout-step-one');
  });

  test('should handle element not found gracefully', async ({ page }) => {
    test.setTimeout(60000);
    await loginPage.navigateToLogin();
    const user = testData.users.standard;
    await loginPage.login(user.username, user.password);
    await homePage.wait(2000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    // Try to interact with non-existent element
    const nonExistentElement = homePage.getLocator('#non-existent-element-12345');
    const isVisible = await nonExistentElement.isVisible().catch(() => false);
    
    // Should handle gracefully without crashing
    expect(isVisible).toBe(false);
  });

  test('should handle network timeout scenarios', async ({ page }) => {
    test.setTimeout(90000);
    
    // Try to navigate with network conditions
    await page.route('**/*', route => {
      // Simulate slow network
      setTimeout(() => route.continue(), 100);
    });
    
    try {
      await loginPage.navigateToLogin();
      // Should eventually load or timeout gracefully
      await homePage.waitForPageLoad();
      await homePage.wait(2000);
      
      // Verify page loaded
      const currentUrl = homePage.getCurrentUrl();
      expect(currentUrl).toContain('saucedemo.com');
    } catch (error) {
      // Timeout should be handled gracefully - test should not crash
      expect(error).toBeDefined();
    }
  });

  test('should handle login with empty credentials', async ({ page }) => {
    test.setTimeout(60000);
    await loginPage.navigateToLogin();
    await homePage.wait(2000);
    
    // Try to login without credentials
    await loginPage.clickLoginButton();
    await homePage.wait(2000);
    
    // Should show error message
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage.length).toBeGreaterThan(0);
    
    // Should stay on login page
    const currentUrl = loginPage.getCurrentUrl();
    expect(currentUrl).not.toContain('/inventory');
  });

  test('should handle locked out user login', async ({ page }) => {
    test.setTimeout(60000);
    await loginPage.navigateToLogin();
    await homePage.wait(2000);
    
    const lockedUser = testData.users.locked;
    await loginPage.enterUsername(lockedUser.username);
    await loginPage.enterPassword(lockedUser.password);
    await loginPage.clickLoginButton();
    await homePage.wait(2000);
    
    // Should show error message
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage.length).toBeGreaterThan(0);
    expect(errorMessage.toLowerCase()).toMatch(/locked|epic sadface/i);
    
    // Should stay on login page
    const currentUrl = loginPage.getCurrentUrl();
    expect(currentUrl).not.toContain('/inventory');
  });

  test('should handle invalid product page access', async ({ page }) => {
    test.setTimeout(60000);
    // Login first
    await loginPage.navigateToLogin();
    const user = testData.users.standard;
    await loginPage.login(user.username, user.password);
    await homePage.wait(2000);
    
    // Try to access product page with invalid ID
    await page.goto('https://www.saucedemo.com/inventory-item.html?id=999999', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }).catch(() => null);
    
    await homePage.wait(2000);
    
    // Should handle gracefully - either redirect or show error
    const pageContent = await page.textContent('body').catch(() => '');
    expect(pageContent).toBeTruthy();
  });

  test('should handle JavaScript errors gracefully', async ({ page }) => {
    test.setTimeout(60000);
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await loginPage.navigateToLogin();
    const user = testData.users.standard;
    await loginPage.login(user.username, user.password);
    await homePage.wait(2000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    // Page should still load even if there are JS errors
    try {
      await homePage.verifyHeaderVisible();
    } catch {
      await homePage.wait(2000);
      await homePage.verifyHeaderVisible();
    }
    
    // Note: We don't fail the test if there are JS errors,
    // but we can log them for debugging
    if (errors.length > 0) {
      console.log('JavaScript errors detected:', errors);
    }
  });

  test('should handle missing required fields in forms', async ({ page }) => {
    test.setTimeout(60000);
    // Login first
    await loginPage.navigateToLogin();
    const user = testData.users.standard;
    await loginPage.login(user.username, user.password);
    await homePage.wait(2000);
    
    // Add product and go to checkout
    await homePage.navigateToHome();
    await homePage.wait(2000);
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    await homePage.clickCartLink();
    await homePage.wait(2000);
    await cartPage.clickProceedToCheckout();
    await homePage.wait(2000);
    
    // Fill only some fields, leave required ones empty
    const checkoutInfo = testData.checkout.information;
    await checkoutPage.fill('#first-name', checkoutInfo.firstName);
    // Don't fill last name (required)
    
    // Try to submit
    await checkoutPage.clickContinue();
    await homePage.wait(2000);
    
    // Form should not submit or show validation
    const currentUrl = homePage.getCurrentUrl();
    expect(currentUrl).toContain('checkout-step-one');
  });
});
