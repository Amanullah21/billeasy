import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login Page Object Model for SauceDemo
 */
export class LoginPage extends BasePage {
  // Selectors
  private readonly usernameInput = '#user-name';
  private readonly passwordInput = '#password';
  private readonly loginButton = '#login-button';
  private readonly errorMessage = '[data-test="error"]';
  private readonly menuButton = '#react-burger-menu-btn';
  private readonly logoutLink = '#logout_sidebar_link';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page (default page for SauceDemo)
   */
  async navigateToLogin(): Promise<void> {
    await this.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Enter username
   */
  async enterUsername(username: string): Promise<void> {
    await this.fill(this.usernameInput, username);
  }

  /**
   * Enter password
   */
  async enterPassword(password: string): Promise<void> {
    await this.fill(this.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    await this.click(this.loginButton);
  }

  /**
   * Login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
    await this.waitForPageLoad();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    try {
      return await this.getText(this.errorMessage);
    } catch {
      return '';
    }
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await this.verifyElementContainsText(this.errorMessage, expectedMessage);
  }

  /**
   * Verify user is logged in (check for inventory page URL or cart icon)
   */
  async verifyLoggedIn(): Promise<void> {
    // Wait a bit for page to update after login
    await this.wait(2000);
    
    // Check if we're on inventory page (successful login)
    const currentUrl = this.getCurrentUrl();
    if (currentUrl.includes('/inventory.html') || currentUrl.includes('/inventory')) {
      return; // Successfully logged in
    }
    
    // Also check for cart icon or products page elements
    const inventorySelectors = [
      '.inventory_list',
      '.inventory_item',
      '.shopping_cart_link',
      '#inventory_container'
    ];
    
    for (const selector of inventorySelectors) {
      try {
        if (await this.isVisible(selector)) {
          return; // Found inventory page elements
        }
      } catch {
        // Continue
      }
    }
    
    // If still on login page, login failed
    if (currentUrl.includes('/') && !currentUrl.includes('/inventory')) {
      // Check for error message
      const hasError = await this.isVisible(this.errorMessage).catch(() => false);
      if (hasError) {
        const errorText = await this.getErrorMessage();
        throw new Error(`Login failed: ${errorText}`);
      }
      throw new Error('Login failed - still on login page');
    }
  }

  /**
   * Click logout via menu
   */
  async logout(): Promise<void> {
    // Open menu
    await this.click(this.menuButton);
    await this.wait(1000);
    
    // Click logout
    await this.click(this.logoutLink);
    await this.waitForPageLoad();
  }

  /**
   * Verify logout was successful (should be back on login page)
   */
  async verifyLoggedOut(): Promise<void> {
    await this.wait(2000);
    const currentUrl = this.getCurrentUrl();
    // Should be on login page (root URL)
    if (!currentUrl.includes('/inventory') && (currentUrl.endsWith('/') || currentUrl.includes('/index.html'))) {
      return; // Successfully logged out
    }
    throw new Error('Logout failed - not on login page');
  }
}
