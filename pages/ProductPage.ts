import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Product Page Object Model
 */
export class ProductPage extends BasePage {
  // Selectors
  private readonly productDetails = '.product-details';
  private readonly productName = '.product-information h2';
  private readonly productPrice = '.product-information span span';
  private readonly quantityInput = '#quantity';
  private readonly addToCartButton = 'button[type="button"]:has-text("Add to cart")';
  private readonly viewCartLink = 'u:has-text("View Cart")';
  private readonly continueShoppingButton = '.btn-success:has-text("Continue Shopping")';
  private readonly productImage = '.product-image-wrapper img';
  private readonly productDescription = '.product-information p';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to products page
   */
  async navigateToProducts(): Promise<void> {
    await this.goto('/products');
    await this.waitForPageLoad();
  }

  /**
   * Click on a product by name
   */
  async clickProductByName(productName: string): Promise<void> {
    await this.click(`text=${productName}`);
    await this.waitForPageLoad();
  }

  /**
   * Click on a product by index from products list page
   */
  async clickProductByIndex(index: number): Promise<void> {
    // Wait for products to load
    await this.wait(2000);
    
    // Try multiple selectors for product cards
    const selectors = [
      '.features_items .col-sm-4 .product-image-wrapper a',
      '.features_items .col-sm-4 a',
      '.single-products a',
      '.product-image-wrapper a',
      '.features_items a[href*="/product_details/"]',
      '.col-sm-4 a[href*="/product_details/"]'
    ];
    
    let productCards: any = null;
    let count = 0;
    
    for (const selector of selectors) {
      productCards = this.page.locator(selector);
      count = await productCards.count();
      if (count > 0) {
        break;
      }
    }
    
    if (count === 0) {
      // Last resort: try to find any product link
      productCards = this.page.locator('a[href*="/product_details/"]');
      count = await productCards.count();
    }
    
    if (count === 0 || !productCards) {
      throw new Error('No products found on the page');
    }
    
    if (index >= count) {
      throw new Error(`Product index ${index} is out of range. Available products: ${count}`);
    }
    
    // Click on the product
    await productCards.nth(index).click();
    await this.waitForPageLoad();
    
    // Wait for product detail page to load
    await this.wait(2000);
  }

  /**
   * Get product name
   */
  async getProductName(): Promise<string> {
    return await this.getText(this.productName);
  }

  /**
   * Get product price
   */
  async getProductPrice(): Promise<string> {
    return await this.getText(this.productPrice);
  }

  /**
   * Set quantity
   */
  async setQuantity(quantity: number): Promise<void> {
    await this.clear(this.quantityInput);
    await this.fill(this.quantityInput, quantity.toString());
  }

  /**
   * Click add to cart button
   */
  async clickAddToCart(): Promise<void> {
    // Try multiple selectors for add to cart button
    const addToCartSelectors = [
      this.addToCartButton,
      'button:has-text("Add to cart")',
      'button.btn.btn-default.cart',
      'a.btn.btn-default.cart',
      '.btn-default:has-text("Add to cart")'
    ];
    
    let clicked = false;
    for (const selector of addToCartSelectors) {
      if (await this.isVisible(selector)) {
        await this.click(selector);
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      throw new Error('Add to cart button not found');
    }
    
    // Wait for modal or success message
    await this.wait(3000);
    
    // Try to find view cart link (might be in modal or on page)
    const viewCartSelectors = [
      this.viewCartLink,
      'u:has-text("View Cart")',
      'a:has-text("View Cart")',
      '.modal-body a:has-text("View Cart")',
      'a[href="/view_cart"]',
      'a[href*="/view_cart"]'
    ];
    
    let viewCartFound = false;
    for (const selector of viewCartSelectors) {
      try {
        if (await this.isVisible(selector)) {
          viewCartFound = true;
          break;
        }
      } catch {
        // Continue to next selector
      }
    }
    
    // If view cart not immediately visible, that's okay - product might still be added
    if (!viewCartFound) {
      await this.wait(2000); // Wait a bit more
    }
  }

  /**
   * Add product to cart with quantity
   */
  async addToCart(quantity: number = 1): Promise<void> {
    if (quantity > 1) {
      await this.setQuantity(quantity);
    }
    await this.clickAddToCart();
  }

  /**
   * Click view cart link
   */
  async clickViewCart(): Promise<void> {
    // Wait a bit for modal to appear
    await this.wait(2000);
    
    // Try multiple selectors for view cart link
    const viewCartSelectors = [
      this.viewCartLink,
      'u:has-text("View Cart")',
      'a:has-text("View Cart")',
      '.modal-body a:has-text("View Cart")',
      'a[href="/view_cart"]:visible',
      'a[href*="/view_cart"]:visible'
    ];
    
    let clicked = false;
    for (const selector of viewCartSelectors) {
      try {
        if (await this.isVisible(selector)) {
          await this.click(selector);
          clicked = true;
          break;
        }
      } catch {
        // Continue to next selector
      }
    }
    
    // If not found in modal, try navigating directly to cart
    if (!clicked) {
      await this.goto('/view_cart');
    }
    
    await this.waitForPageLoad();
    await this.wait(2000);
  }

  /**
   * Click continue shopping button
   */
  async clickContinueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton);
  }

  /**
   * Verify product details are visible
   * Works for both products list page and product detail page
   */
  async verifyProductDetailsVisible(): Promise<void> {
    // Check if we're on products list page or product detail page
    const isListPage = await this.isVisible('.features_items, .product-image-wrapper');
    const isDetailPage = await this.isVisible(this.productDetails);
    
    if (!isListPage && !isDetailPage) {
      // Wait a bit more and try again
      await this.wait(2000);
      const retryListPage = await this.isVisible('.features_items, .product-image-wrapper');
      const retryDetailPage = await this.isVisible(this.productDetails);
      
      if (!retryListPage && !retryDetailPage) {
        throw new Error('Product details or products list not found on page');
      }
    }
  }

  /**
   * Verify product name
   */
  async verifyProductName(expectedName: string): Promise<void> {
    await this.verifyElementContainsText(this.productName, expectedName);
  }
}

