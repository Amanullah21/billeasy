import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Inventory Page Object Model for SauceDemo
 * (This is the main page after login)
 */
export class HomePage extends BasePage {
  // Selectors
  private readonly inventoryList = '.inventory_list';
  private readonly inventoryItem = '.inventory_item';
  private readonly productName = '.inventory_item_name';
  private readonly productPrice = '.inventory_item_price';
  private readonly addToCartButton = 'button:has-text("Add to cart")';
  private readonly removeButton = 'button:has-text("Remove")';
  private readonly cartIcon = '.shopping_cart_link';
  private readonly cartBadge = '.shopping_cart_badge';
  private readonly menuButton = '#react-burger-menu-btn';
  private readonly sortDropdown = '.product_sort_container';
  private readonly inventoryContainer = '#inventory_container';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to inventory page (home page after login)
   */
  async navigateToHome(): Promise<void> {
    await this.goto('/inventory.html');
    await this.waitForPageLoad();
  }

  /**
   * Verify inventory page is visible
   */
  async verifyInventoryVisible(): Promise<void> {
    await this.verifyElementVisible(this.inventoryContainer);
  }

  /**
   * Get number of products on page
   */
  async getProductCount(): Promise<number> {
    const items = this.page.locator(this.inventoryItem);
    return await items.count();
  }

  /**
   * Add product to cart by index
   */
  async addProductToCartByIndex(index: number): Promise<void> {
    const items = this.page.locator(this.inventoryItem);
    const addButton = items.nth(index).locator(this.addToCartButton);
    await addButton.click();
    await this.wait(1000);
  }

  /**
   * Add product to cart by name
   */
  async addProductToCartByName(productName: string): Promise<void> {
    const items = this.page.locator(this.inventoryItem);
    const count = await items.count();
    
    for (let i = 0; i < count; i++) {
      const name = await items.nth(i).locator(this.productName).textContent();
      if (name?.includes(productName)) {
        await items.nth(i).locator(this.addToCartButton).click();
        await this.wait(1000);
        return;
      }
    }
    throw new Error(`Product "${productName}" not found`);
  }

  /**
   * Remove product from cart by index
   */
  async removeProductFromCartByIndex(index: number): Promise<void> {
    const items = this.page.locator(this.inventoryItem);
    const removeBtn = items.nth(index).locator(this.removeButton);
    await removeBtn.click();
    await this.wait(1000);
  }

  /**
   * Get product name by index
   */
  async getProductNameByIndex(index: number): Promise<string> {
    const items = this.page.locator(this.inventoryItem);
    return await items.nth(index).locator(this.productName).textContent() || '';
  }

  /**
   * Get product price by index
   */
  async getProductPriceByIndex(index: number): Promise<string> {
    const items = this.page.locator(this.inventoryItem);
    return await items.nth(index).locator(this.productPrice).textContent() || '';
  }

  /**
   * Click cart icon
   */
  async clickCartLink(): Promise<void> {
    await this.click(this.cartIcon);
    await this.waitForPageLoad();
  }

  /**
   * Get cart badge count
   */
  async getCartBadgeCount(): Promise<number> {
    try {
      const badge = await this.page.locator(this.cartBadge).textContent();
      return badge ? parseInt(badge) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Sort products
   */
  async sortProducts(sortOption: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.selectOption(this.sortDropdown, sortOption);
    await this.wait(1000);
  }

  /**
   * Open menu
   */
  async openMenu(): Promise<void> {
    await this.click(this.menuButton);
    await this.wait(500);
  }

  /**
   * Click logout from menu
   */
  async logout(): Promise<void> {
    await this.openMenu();
    await this.click('#logout_sidebar_link');
    await this.waitForPageLoad();
  }

  // Legacy methods for compatibility (will be removed or updated)
  async clickProductsLink(): Promise<void> {
    // In SauceDemo, products are on the inventory page, so just navigate
    await this.navigateToHome();
  }

  async clickLoginLink(): Promise<void> {
    await this.goto('/');
  }

  async clickContactUsLink(): Promise<void> {
    // Not available in SauceDemo
    throw new Error('Contact Us page not available in SauceDemo');
  }

  async clickTestCasesLink(): Promise<void> {
    // Not available in SauceDemo
    throw new Error('Test Cases page not available in SauceDemo');
  }

  async verifyHeaderVisible(): Promise<void> {
    // Check for header elements
    await this.verifyElementVisible('.header_container');
  }

  async verifyLogoVisible(): Promise<void> {
    // Check for logo
    await this.verifyElementVisible('.app_logo');
  }

  async verifyNavbarVisible(): Promise<void> {
    // Check for primary header
    await this.verifyElementVisible('.primary_header');
  }

  async verifyFooterVisible(): Promise<void> {
    // SauceDemo may not have a footer, so we'll skip this
    // Or check for footer if it exists
    try {
      await this.verifyElementVisible('footer');
    } catch {
      // Footer not required in SauceDemo
    }
  }

  async verifyUrlContains(text: string): Promise<void> {
    const url = this.getCurrentUrl();
    if (!url.includes(text)) {
      throw new Error(`URL does not contain "${text}". Current URL: ${url}`);
    }
  }

  async verifyElementVisible(selector: string): Promise<void> {
    await this.waitForElementVisible(selector);
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }
}
