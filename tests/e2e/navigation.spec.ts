import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { CartPage } from '../../pages/CartPage';
import testData from '../../fixtures/test-data.json';

test.describe('Navigation Tests', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);
    
    // Login first (required for SauceDemo)
    await loginPage.navigateToLogin();
    const user = testData.users.standard;
    await loginPage.login(user.username, user.password);
    await homePage.wait(2000);
  });

  test('should navigate to inventory page', async ({ page }) => {
    test.setTimeout(60000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    // Verify inventory page elements
    await homePage.verifyHeaderVisible();
    await homePage.verifyLogoVisible();
    await homePage.verifyInventoryVisible();
    
    const currentUrl = homePage.getCurrentUrl();
    expect(currentUrl).toContain('/inventory');
  });

  test('should navigate to cart page', async ({ page }) => {
    test.setTimeout(60000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    await homePage.clickCartLink();
    await homePage.wait(2000);
    
    await cartPage.verifyCartVisible();
    
    const currentUrl = homePage.getCurrentUrl();
    expect(currentUrl).toContain('/cart');
  });

  test('should navigate to login page', async ({ page }) => {
    test.setTimeout(60000);
    // Logout first to get to login page
    await loginPage.logout();
    await homePage.wait(2000);
    
    // Verify we're on login page
    const currentUrl = homePage.getCurrentUrl();
    expect(currentUrl).not.toContain('/inventory');
    
    // Verify login form is visible
    const loginFormVisible = await loginPage.isVisible('#user-name');
    expect(loginFormVisible).toBeTruthy();
  });

  test('should verify page title on inventory page', async ({ page }) => {
    test.setTimeout(60000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    const title = await homePage.getPageTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should navigate using browser back button', async ({ page }) => {
    test.setTimeout(60000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    // Navigate to cart
    await homePage.clickCartLink();
    await homePage.wait(2000);
    
    const cartUrl = homePage.getCurrentUrl();
    expect(cartUrl).toContain('/cart');
    
    // Go back
    await homePage.goBack();
    await homePage.wait(2000);
    
    const currentUrl = homePage.getCurrentUrl();
    expect(currentUrl).not.toContain('/cart');
  });

  test('should open and use menu', async ({ page }) => {
    test.setTimeout(60000);
    await homePage.navigateToHome();
    await homePage.wait(2000);
    
    // Open menu
    await homePage.openMenu();
    await homePage.wait(1000);
    
    // Verify menu is open (check for logout link)
    const logoutVisible = await homePage.isVisible('#logout_sidebar_link');
    expect(logoutVisible).toBeTruthy();
  });
});
