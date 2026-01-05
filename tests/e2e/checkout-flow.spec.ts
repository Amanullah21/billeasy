import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { LoginPage } from '../../pages/LoginPage';
import testData from '../../fixtures/test-data.json';

test.describe('Checkout Flow Tests', () => {
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

  test('should add product to cart', async ({ page }) => {
    test.setTimeout(60000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    // Add first product to cart
    await homePage.addProductToCartByIndex(0);
    
    // Verify cart badge shows 1 item
    const badgeCount = await homePage.getCartBadgeCount();
    expect(badgeCount).toBe(1);
  });

  test('should view cart with added products', async ({ page }) => {
    test.setTimeout(60000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    // Add product to cart
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    
    // Navigate to cart
    await homePage.clickCartLink();
    await homePage.wait(2000);
    
    // Verify cart is visible and has items
    await cartPage.verifyCartVisible();
    const itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('should proceed to checkout from cart', async ({ page }) => {
    test.setTimeout(60000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    // Add product to cart
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    
    // Navigate to cart
    await homePage.clickCartLink();
    await homePage.wait(2000);
    
    // Proceed to checkout
    await cartPage.clickProceedToCheckout();
    await homePage.wait(2000);
    
    // Verify we're on checkout information page
    await checkoutPage.verifyInformationPageVisible();
  });

  test('should complete checkout process', async ({ page }) => {
    test.setTimeout(60000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    // Add product to cart
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    
    // Navigate to cart
    await homePage.clickCartLink();
    await homePage.wait(2000);
    
    // Proceed to checkout
    await cartPage.clickProceedToCheckout();
    await homePage.wait(2000);
    
    // Complete checkout with information
    const checkoutInfo = testData.checkout.information;
    await checkoutPage.completeCheckout(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    // Verify order placed
    await checkoutPage.verifyOrderPlaced();
  });

  test('should add multiple products to cart', async ({ page }) => {
    test.setTimeout(60000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    // Add first product
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    
    // Add second product
    await homePage.addProductToCartByIndex(1);
    await homePage.wait(1000);
    
    // Verify cart badge shows 2 items
    const badgeCount = await homePage.getCartBadgeCount();
    expect(badgeCount).toBe(2);
    
    // Navigate to cart and verify
    await homePage.clickCartLink();
    await homePage.wait(2000);
    
    const itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBeGreaterThanOrEqual(2);
  });

  test('should remove product from cart', async ({ page }) => {
    test.setTimeout(60000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    // Add product to cart
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    
    // Navigate to cart
    await homePage.clickCartLink();
    await homePage.wait(2000);
    
    const initialCount = await cartPage.getCartItemCount();
    expect(initialCount).toBeGreaterThan(0);
    
    // Remove item
    await cartPage.deleteItem(0);
    await homePage.wait(2000);
    
    // Verify item was removed
    const newCount = await cartPage.getCartItemCount();
    expect(newCount).toBeLessThan(initialCount);
  });

  test('should update quantity in cart', async ({ page }) => {
    test.setTimeout(60000);
    // Note: SauceDemo doesn't support direct quantity updates in cart
    // To simulate quantity changes, we verify adding/removing items works correctly
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    // Add first product
    await homePage.addProductToCartByIndex(0);
    await homePage.wait(1000);
    
    // Verify cart badge shows 1 item
    let badgeCount = await homePage.getCartBadgeCount();
    expect(badgeCount).toBe(1);
    
    // Navigate to cart to verify
    await homePage.clickCartLink();
    await homePage.wait(2000);
    
    let itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(1);
    
    // Go back to inventory using continue shopping
    await cartPage.clickContinueShopping();
    await homePage.wait(2000);
    
    // Add a different product (to simulate having multiple items)
    await homePage.addProductToCartByIndex(1);
    await homePage.wait(1000);
    
    // Verify cart badge shows 2 items
    badgeCount = await homePage.getCartBadgeCount();
    expect(badgeCount).toBe(2);
    
    // Navigate to cart again
    await homePage.clickCartLink();
    await homePage.wait(2000);
    
    // Verify we have 2 items in cart
    itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(2);
    
    // Note: In SauceDemo, you cannot directly update quantity in cart
    // Each product addition creates a separate line item
    // To increase quantity, you would need to remove and re-add, or add from inventory
  });
});
