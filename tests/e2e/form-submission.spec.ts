import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { LoginPage } from '../../pages/LoginPage';
import testData from '../../fixtures/test-data.json';

test.describe('Form Submission Tests', () => {
  let homePage: HomePage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    loginPage = new LoginPage(page);
    
    // Login first (required for SauceDemo)
    await loginPage.navigateToLogin();
    const user = testData.users.standard;
    await loginPage.login(user.username, user.password);
    await homePage.wait(2000);
  });

  test('should complete checkout with valid information', async ({ page }) => {
    test.setTimeout(60000);
    // Add product to cart first
    await homePage.navigateToHome();
    await homePage.wait(2000);
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    
    // Navigate to cart and checkout
    await homePage.clickCartLink();
    await homePage.wait(2000);
    await cartPage.clickProceedToCheckout();
    await homePage.wait(2000);
    
    // Fill checkout form with valid data
    const checkoutInfo = testData.checkout.information;
    await checkoutPage.fillCheckoutInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    // Submit form
    await checkoutPage.clickContinue();
    await homePage.wait(2000);
    
    // Verify we're on overview page
    await checkoutPage.verifyOverviewPageVisible();
  });

  test('should validate required fields in checkout form', async ({ page }) => {
    test.setTimeout(60000);
    // Add product to cart first
    await homePage.navigateToHome();
    await homePage.wait(2000);
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    
    // Navigate to cart and checkout
    await homePage.clickCartLink();
    await homePage.wait(2000);
    await cartPage.clickProceedToCheckout();
    await homePage.wait(2000);
    
    // Try to submit form without filling required fields
    await checkoutPage.clickContinue();
    await homePage.wait(2000);
    
    // SauceDemo shows error for missing fields
    // Verify we're still on checkout information page
    const currentUrl = homePage.getCurrentUrl();
    expect(currentUrl).toContain('checkout-step-one');
  });

  test('should show error for missing first name', async ({ page }) => {
    test.setTimeout(60000);
    // Add product to cart first
    await homePage.navigateToHome();
    await homePage.wait(2000);
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    
    // Navigate to cart and checkout
    await homePage.clickCartLink();
    await homePage.wait(2000);
    await cartPage.clickProceedToCheckout();
    await homePage.wait(2000);
    
    // Fill only last name and postal code
    const checkoutInfo = testData.checkout.information;
    await checkoutPage.fill('#last-name', checkoutInfo.lastName);
    await checkoutPage.fill('#postal-code', checkoutInfo.postalCode);
    
    // Try to continue
    await checkoutPage.clickContinue();
    await homePage.wait(2000);
    
    // Should show error or stay on page
    const currentUrl = homePage.getCurrentUrl();
    expect(currentUrl).toContain('checkout-step-one');
  });

  test('should show error for missing last name', async ({ page }) => {
    test.setTimeout(60000);
    // Add product to cart first
    await homePage.navigateToHome();
    await homePage.wait(2000);
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    
    // Navigate to cart and checkout
    await homePage.clickCartLink();
    await homePage.wait(2000);
    await cartPage.clickProceedToCheckout();
    await homePage.wait(2000);
    
    // Fill only first name and postal code
    const checkoutInfo = testData.checkout.information;
    await checkoutPage.fill('#first-name', checkoutInfo.firstName);
    await checkoutPage.fill('#postal-code', checkoutInfo.postalCode);
    
    // Try to continue
    await checkoutPage.clickContinue();
    await homePage.wait(2000);
    
    // Should show error or stay on page
    const currentUrl = homePage.getCurrentUrl();
    expect(currentUrl).toContain('checkout-step-one');
  });

  test('should show error for missing postal code', async ({ page }) => {
    test.setTimeout(60000);
    // Add product to cart first
    await homePage.navigateToHome();
    await homePage.wait(2000);
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    
    // Navigate to cart and checkout
    await homePage.clickCartLink();
    await homePage.wait(2000);
    await cartPage.clickProceedToCheckout();
    await homePage.wait(2000);
    
    // Fill only first name and last name
    const checkoutInfo = testData.checkout.information;
    await checkoutPage.fill('#first-name', checkoutInfo.firstName);
    await checkoutPage.fill('#last-name', checkoutInfo.lastName);
    
    // Try to continue
    await checkoutPage.clickContinue();
    await homePage.wait(2000);
    
    // Should show error or stay on page
    const currentUrl = homePage.getCurrentUrl();
    expect(currentUrl).toContain('checkout-step-one');
  });
});
