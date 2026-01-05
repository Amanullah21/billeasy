import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Cart Page Object Model for SauceDemo
 */
export class CartPage extends BasePage {
  // Selectors
  private readonly cartList = '.cart_list';
  private readonly cartItem = '.cart_item';
  private readonly productNameInCart = '.inventory_item_name';
  private readonly productPriceInCart = '.inventory_item_price';
  private readonly removeButton = 'button:has-text("Remove")';
  private readonly checkoutButton = '#checkout';
  private readonly continueShoppingButton = '#continue-shopping';
  private readonly cartQuantity = '.cart_quantity';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to cart page
   */
  async navigateToCart(): Promise<void> {
    await this.goto('/cart.html');
    await this.waitForPageLoad();
  }

  /**
   * Verify cart is visible
   */
  async verifyCartVisible(): Promise<void> {
    await this.wait(2000);
    
    // Check for cart list or cart items
    const cartSelectors = [
      this.cartList,
      '.cart_list',
      this.cartItem
    ];
    
    let cartFound = false;
    for (const selector of cartSelectors) {
      try {
        if (await this.isVisible(selector)) {
          cartFound = true;
          break;
        }
      } catch {
        // Continue to next selector
      }
    }
    
    if (!cartFound) {
      // Wait a bit more and try again
      await this.wait(2000);
      for (const selector of cartSelectors) {
        try {
          if (await this.isVisible(selector)) {
            return; // Found it on retry
          }
        } catch {
          // Continue
        }
      }
      throw new Error('Cart not found on page');
    }
  }

  /**
   * Get number of items in cart
   */
  async getCartItemCount(): Promise<number> {
    await this.wait(1000);
    const items = this.page.locator(this.cartItem);
    return await items.count();
  }

  /**
   * Get product name in cart by index
   */
  async getProductNameInCart(index: number): Promise<string> {
    const items = this.page.locator(this.cartItem);
    return await items.nth(index).locator(this.productNameInCart).textContent() || '';
  }

  /**
   * Get product price in cart by index
   */
  async getProductPriceInCart(index: number): Promise<string> {
    const items = this.page.locator(this.cartItem);
    return await items.nth(index).locator(this.productPriceInCart).textContent() || '';
  }

  /**
   * Update quantity for item at index (SauceDemo doesn't support quantity changes in cart)
   * This method is kept for compatibility but will throw an error
   */
  async updateQuantity(index: number, quantity: number): Promise<void> {
    // SauceDemo doesn't allow quantity changes in cart
    // You need to add multiple items from inventory page
    throw new Error('SauceDemo does not support quantity updates in cart. Add items from inventory page instead.');
  }

  /**
   * Delete item from cart by index
   */
  async deleteItem(index: number): Promise<void> {
    const items = this.page.locator(this.cartItem);
    await items.nth(index).locator(this.removeButton).click();
    await this.wait(1000);
  }

  /**
   * Click proceed to checkout
   */
  async clickProceedToCheckout(): Promise<void> {
    await this.click(this.checkoutButton);
    await this.waitForPageLoad();
  }

  /**
   * Click continue shopping
   */
  async clickContinueShopping(): Promise<void> {
    // Wait for button to be visible
    await this.wait(1000);
    
    // Try multiple selectors for continue shopping button
    const continueSelectors = [
      this.continueShoppingButton,
      '#continue-shopping',
      'button:has-text("Continue Shopping")',
      'a:has-text("Continue Shopping")'
    ];
    
    let clicked = false;
    for (const selector of continueSelectors) {
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
    
    if (!clicked) {
      // If button not found, navigate directly to inventory
      await this.goto('/inventory.html');
    }
    
    await this.waitForPageLoad();
    await this.wait(1000);
  }

  /**
   * Verify cart is empty
   */
  async verifyCartEmpty(): Promise<void> {
    const count = await this.getCartItemCount();
    if (count > 0) {
      throw new Error('Cart is not empty');
    }
  }

  /**
   * Verify product is in cart
   */
  async verifyProductInCart(productName: string): Promise<void> {
    const count = await this.getCartItemCount();
    for (let i = 0; i < count; i++) {
      const name = await this.getProductNameInCart(i);
      if (name.includes(productName)) {
        return;
      }
    }
    throw new Error(`Product ${productName} not found in cart`);
  }
}
