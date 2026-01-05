import { Page, Locator, expect } from '@playwright/test';
import { TIMEOUTS } from '../utils/constants';

/**
 * Base Page class with common methods for all page objects
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait a bit for dynamic content
    await this.wait(1000);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElementVisible(selector: string, timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
    } catch (error) {
      // Try with different wait strategies
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForSelector(selector, { state: 'visible', timeout: timeout / 2 });
    }
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(selector: string, timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  /**
   * Click on an element
   */
  async click(selector: string): Promise<void> {
    try {
      await this.page.click(selector, { timeout: 30000 });
    } catch (error) {
      // Try waiting for element first
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
      await this.page.click(selector, { timeout: 30000 });
    }
  }

  /**
   * Fill input field
   */
  async fill(selector: string, text: string): Promise<void> {
    try {
      await this.page.fill(selector, text, { timeout: 30000 });
    } catch (error) {
      // Try waiting for element first
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
      await this.page.fill(selector, text, { timeout: 30000 });
    }
  }

  /**
   * Get text content of an element
   */
  async getText(selector: string): Promise<string> {
    return await this.page.locator(selector).textContent() || '';
  }

  /**
   * Get element by locator
   */
  getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isEnabled();
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForURL('**/*', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(fileName: string): Promise<void> {
    await this.page.screenshot({ path: `reports/screenshots/${fileName}` });
  }

  /**
   * Wait for specific timeout
   */
  async wait(timeout: number): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.wait(1000);
  }

  /**
   * Go back
   */
  async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
    await this.wait(1000);
  }

  /**
   * Verify page URL contains text
   */
  async verifyUrlContains(text: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(text));
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Verify element is visible
   */
  async verifyElementVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * Verify element contains text
   */
  async verifyElementContainsText(selector: string, text: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.selectOption(selector, value);
  }

  /**
   * Check checkbox
   */
  async checkCheckbox(selector: string): Promise<void> {
    await this.page.check(selector);
  }

  /**
   * Uncheck checkbox
   */
  async uncheckCheckbox(selector: string): Promise<void> {
    await this.page.uncheck(selector);
  }

  /**
   * Hover over element
   */
  async hover(selector: string): Promise<void> {
    await this.page.hover(selector);
  }

  /**
   * Double click on element
   */
  async doubleClick(selector: string): Promise<void> {
    await this.page.dblclick(selector);
  }

  /**
   * Right click on element
   */
  async rightClick(selector: string): Promise<void> {
    await this.page.click(selector, { button: 'right' });
  }

  /**
   * Press key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Type text
   */
  async type(selector: string, text: string): Promise<void> {
    await this.page.type(selector, text);
  }

  /**
   * Clear input field
   */
  async clear(selector: string): Promise<void> {
    await this.page.fill(selector, '');
  }
}

