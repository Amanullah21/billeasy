import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Checkout Page Object Model for SauceDemo
 * SauceDemo has a two-step checkout: Information → Overview → Complete
 */
export class CheckoutPage extends BasePage {
  // Step 1: Information page selectors
  private readonly firstNameInput = '#first-name';
  private readonly lastNameInput = '#last-name';
  private readonly postalCodeInput = '#postal-code';
  private readonly continueButton = '#continue';
  private readonly cancelButton = '#cancel';
  
  // Step 2: Overview page selectors
  private readonly cartItems = '.cart_item';
  private readonly summaryInfo = '.summary_info';
  private readonly finishButton = '#finish';
  private readonly summarySubtotal = '.summary_subtotal_label';
  private readonly summaryTax = '.summary_tax_label';
  private readonly summaryTotal = '.summary_total_label';
  
  // Complete page selectors
  private readonly completeHeader = '.complete-header';
  private readonly completeText = '.complete-text';
  private readonly backToProductsButton = '#back-to-products';
  private readonly thankYouMessage = 'h2:has-text("Thank you")';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to checkout information page
   */
  async navigateToCheckout(): Promise<void> {
    await this.goto('/checkout-step-one.html');
    await this.waitForPageLoad();
  }

  /**
   * Fill checkout information (Step 1)
   */
  async fillCheckoutInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.fill(this.firstNameInput, firstName);
    await this.fill(this.lastNameInput, lastName);
    await this.fill(this.postalCodeInput, postalCode);
  }

  /**
   * Click continue to proceed to overview
   */
  async clickContinue(): Promise<void> {
    await this.click(this.continueButton);
    await this.waitForPageLoad();
  }

  /**
   * Click cancel to go back
   */
  async clickCancel(): Promise<void> {
    await this.click(this.cancelButton);
    await this.waitForPageLoad();
  }

  /**
   * Verify checkout information page is visible
   */
  async verifyInformationPageVisible(): Promise<void> {
    await this.verifyElementVisible(this.firstNameInput);
  }

  /**
   * Verify overview page is visible (Step 2)
   */
  async verifyOverviewPageVisible(): Promise<void> {
    await this.wait(1000);
    await this.verifyElementVisible(this.summaryInfo);
  }

  /**
   * Verify address details are visible (legacy method for compatibility)
   */
  async verifyAddressDetailsVisible(): Promise<void> {
    // In SauceDemo, we verify the overview page instead
    await this.verifyOverviewPageVisible();
  }

  /**
   * Verify review order section is visible (legacy method for compatibility)
   */
  async verifyReviewOrderVisible(): Promise<void> {
    await this.verifyOverviewPageVisible();
  }

  /**
   * Click finish button to complete order
   */
  async clickFinish(): Promise<void> {
    await this.click(this.finishButton);
    await this.waitForPageLoad();
  }

  /**
   * Complete checkout process (two steps)
   */
  async completeCheckout(
    firstName: string,
    lastName: string,
    postalCode: string
  ): Promise<void> {
    // Step 1: Fill information
    await this.fillCheckoutInformation(firstName, lastName, postalCode);
    await this.clickContinue();
    
    // Step 2: Review and finish
    await this.wait(1000);
    await this.clickFinish();
  }

  /**
   * Verify order placed successfully
   */
  async verifyOrderPlaced(): Promise<void> {
    await this.wait(2000);
    
    // Check for thank you message
    const thankYouSelectors = [
      this.thankYouMessage,
      '.complete-header:has-text("Thank you")',
      'h2.complete-header'
    ];
    
    let found = false;
    for (const selector of thankYouSelectors) {
      try {
        if (await this.isVisible(selector)) {
          found = true;
          break;
        }
      } catch {
        // Continue
      }
    }
    
    if (!found) {
      throw new Error('Order completion message not found');
    }
  }

  /**
   * Get success message
   */
  async getSuccessMessage(): Promise<string> {
    try {
      return await this.getText(this.completeText);
    } catch {
      return await this.getText(this.completeHeader);
    }
  }

  /**
   * Click back to products button
   */
  async clickBackToProducts(): Promise<void> {
    await this.click(this.backToProductsButton);
    await this.waitForPageLoad();
  }

  // Legacy methods for compatibility (not used in SauceDemo but kept for API compatibility)
  async enterComment(comment: string): Promise<void> {
    // SauceDemo doesn't have comment field
    throw new Error('SauceDemo does not support comments in checkout');
  }

  async clickPlaceOrder(): Promise<void> {
    // In SauceDemo, this is the continue button
    await this.clickContinue();
  }

  async enterNameOnCard(name: string): Promise<void> {
    throw new Error('SauceDemo does not require payment card information');
  }

  async enterCardNumber(cardNumber: string): Promise<void> {
    throw new Error('SauceDemo does not require payment card information');
  }

  async enterCVC(cvc: string): Promise<void> {
    throw new Error('SauceDemo does not require payment card information');
  }

  async enterExpiryMonth(month: string): Promise<void> {
    throw new Error('SauceDemo does not require payment card information');
  }

  async enterExpiryYear(year: string): Promise<void> {
    throw new Error('SauceDemo does not require payment card information');
  }

  async fillPaymentDetails(
    nameOnCard: string,
    cardNumber: string,
    cvc: string,
    expiryMonth: string,
    expiryYear: string
  ): Promise<void> {
    throw new Error('SauceDemo does not require payment card information');
  }

  async clickPayButton(): Promise<void> {
    // In SauceDemo, this is the finish button
    await this.clickFinish();
  }
}
