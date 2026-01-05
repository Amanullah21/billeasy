import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import testData from '../../fixtures/test-data.json';

test.describe('Login Functionality', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    await loginPage.navigateToLogin();
  });

  test('should login with valid credentials', async ({ page }) => {
    test.setTimeout(60000);
    const validUser = testData.users.standard;
    
    await homePage.wait(1000);
    
    await loginPage.login(validUser.username, validUser.password);
    
    // Verify login was successful
    await homePage.wait(2000);
    await loginPage.verifyLoggedIn();
    
    // Verify user is redirected to inventory page
    const currentUrl = loginPage.getCurrentUrl();
    expect(currentUrl).toContain('/inventory');
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    test.setTimeout(60000);
    const invalidUser = testData.users.invalid;
    
    await homePage.wait(1000);
    
    await loginPage.enterUsername(invalidUser.username);
    await loginPage.enterPassword(invalidUser.password);
    await loginPage.clickLoginButton();
    
    // Wait for error message to appear
    await homePage.wait(2000);
    
    // Check for error message
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage.length).toBeGreaterThan(0);
    expect(errorMessage.toLowerCase()).toMatch(/username and password do not match|epic sadface/i);
    
    // Verify we're still on login page
    const currentUrl = loginPage.getCurrentUrl();
    expect(currentUrl).not.toContain('/inventory');
  });

  test('should show error message with locked out user', async ({ page }) => {
    test.setTimeout(60000);
    const lockedUser = testData.users.locked;
    
    await homePage.wait(1000);
    
    await loginPage.enterUsername(lockedUser.username);
    await loginPage.enterPassword(lockedUser.password);
    await loginPage.clickLoginButton();
    
    // Wait for error message
    await homePage.wait(2000);
    
    // Check for error message about locked account
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage.length).toBeGreaterThan(0);
    expect(errorMessage.toLowerCase()).toMatch(/locked|epic sadface/i);
    
    // Verify we're still on login page
    const currentUrl = loginPage.getCurrentUrl();
    expect(currentUrl).not.toContain('/inventory');
  });

  test('should show error message with non-existent user', async ({ page }) => {
    test.setTimeout(60000);
    const nonExistentUser = testData.users.nonExistent;
    
    await homePage.wait(1000);
    
    await loginPage.enterUsername(nonExistentUser.username);
    await loginPage.enterPassword(nonExistentUser.password);
    await loginPage.clickLoginButton();
    
    // Wait for error message
    await homePage.wait(2000);
    
    // Check for error message
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage.length).toBeGreaterThan(0);
    
    // Verify we're still on login page
    const currentUrl = loginPage.getCurrentUrl();
    expect(currentUrl).not.toContain('/inventory');
  });

  test('should logout successfully', async ({ page }) => {
    test.setTimeout(60000);
    const validUser = testData.users.standard;
    
    await homePage.wait(1000);
    
    // Login first
    await loginPage.login(validUser.username, validUser.password);
    await homePage.wait(2000);
    await loginPage.verifyLoggedIn();
    
    // Then logout via menu
    await loginPage.logout();
    await homePage.wait(2000);
    await loginPage.verifyLoggedOut();
    
    // Verify we're back on login page
    const currentUrl = loginPage.getCurrentUrl();
    expect(currentUrl).not.toContain('/inventory');
  });

  test('should validate required fields', async ({ page }) => {
    test.setTimeout(60000);
    await homePage.wait(1000);
    
    // Try to login without entering credentials
    await loginPage.clickLoginButton();
    
    // Wait a bit for any validation
    await homePage.wait(2000);
    
    // SauceDemo shows error for empty fields
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage.length).toBeGreaterThan(0);
    
    // Verify we're still on login page
    const currentUrl = loginPage.getCurrentUrl();
    expect(currentUrl).not.toContain('/inventory');
  });
});
