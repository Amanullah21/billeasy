# Migration Plan: automationexercise.com → saucedemo.com

## Overview
Migrate the entire test framework from automationexercise.com to saucedemo.com, updating all page objects, test cases, and test data to match SauceDemo's structure and functionality.

## Key Differences

### SauceDemo Structure
- **Login Page**: Username/password (no email, no signup)
- **Inventory Page**: Product list with add to cart buttons (main page after login)
- **Cart Page**: Shopping cart with remove buttons
- **Checkout**: Two-step process (Information → Overview → Complete)
- **No Signup**: Uses predefined test users
- **No Contact Form**: Not available
- **No Newsletter**: Not available

### Standard Test Users
- `standard_user` / `secret_sauce` - Normal user
- `locked_out_user` / `secret_sauce` - Locked account (should show error)
- `problem_user` / `secret_sauce` - Problematic user
- `performance_glitch_user` / `secret_sauce` - Slow response user

## Implementation Plan

### Phase 1: Configuration & Data
1. Update `playwright.config.ts` - Change baseURL to `https://www.saucedemo.com`
2. Update `utils/constants.ts` - Update BASE_URL constant
3. Update `fixtures/test-data.json` - Replace with SauceDemo credentials and products

### Phase 2: Page Objects
1. **LoginPage.ts** - Update selectors and remove signup methods
2. **HomePage.ts** → **InventoryPage.ts** - Complete rewrite for inventory page
3. **ProductPage.ts** - Update or simplify for SauceDemo structure
4. **CartPage.ts** - Update selectors for SauceDemo cart
5. **CheckoutPage.ts** - Rewrite for two-step checkout process

### Phase 3: Test Cases
1. **login.spec.ts** - Update all login tests, add locked out user test
2. **checkout-flow.spec.ts** - Update for SauceDemo checkout flow
3. **navigation.spec.ts** - Simplify for SauceDemo navigation
4. **form-submission.spec.ts** - Replace with checkout form validation
5. **error-handling.spec.ts** - Update for SauceDemo error scenarios

### Phase 4: New Features
1. Add product sorting tests
2. Add menu functionality tests
3. Add cart badge count verification

### Phase 5: Documentation
1. Update README.md with new URLs and features
2. Update test descriptions

## Detailed Changes

### 1. playwright.config.ts
```typescript
baseURL: 'https://www.saucedemo.com'
```

### 2. fixtures/test-data.json
```json
{
  "users": {
    "standard": {
      "username": "standard_user",
      "password": "secret_sauce"
    },
    "locked": {
      "username": "locked_out_user",
      "password": "secret_sauce"
    },
    "problem": {
      "username": "problem_user",
      "password": "secret_sauce"
    },
    "invalid": {
      "username": "invalid_user",
      "password": "wrong_password"
    }
  },
  "checkout": {
    "information": {
      "firstName": "John",
      "lastName": "Doe",
      "postalCode": "12345"
    }
  }
}
```

### 3. Page Object Selectors

#### LoginPage
- Username: `#user-name`
- Password: `#password`
- Login Button: `#login-button`
- Error Message: `[data-test="error"]`

#### InventoryPage
- Products: `.inventory_item`
- Add to Cart: `button:has-text("Add to cart")`
- Cart Icon: `.shopping_cart_link`
- Menu Button: `#react-burger-menu-btn`
- Sort Dropdown: `.product_sort_container`

#### CartPage
- Cart Items: `.cart_item`
- Remove Button: `button:has-text("Remove")`
- Checkout Button: `#checkout`
- Continue Shopping: `#continue-shopping`

#### CheckoutPage
- First Name: `#first-name`
- Last Name: `#last-name`
- Postal Code: `#postal-code`
- Continue: `#continue`
- Finish: `#finish`
- Complete Message: `h2:has-text("Thank you")`

### 4. Test Cases Structure

#### Login Tests
- ✅ Login with valid credentials (standard_user)
- ✅ Login with invalid credentials
- ✅ Login with locked out user (should show error)
- ✅ Logout successfully
- ✅ Validate required fields

#### Checkout Flow Tests
- ✅ Add product to cart
- ✅ View cart with added products
- ✅ Add multiple products to cart
- ✅ Remove product from cart
- ✅ Complete checkout process
- ✅ Verify order completion

#### Product Tests
- ✅ Sort products by name A-Z
- ✅ Sort products by name Z-A
- ✅ Sort products by price low to high
- ✅ Sort products by price high to low

#### Navigation Tests
- ✅ Navigate to inventory page
- ✅ Navigate to cart page
- ✅ Open menu
- ✅ Logout from menu

#### Form Validation Tests
- ✅ Validate checkout form required fields
- ✅ Complete checkout with valid information
- ✅ Show error for missing fields

## Execution Checklist

- [ ] Update playwright.config.ts
- [ ] Update constants.ts
- [ ] Update test-data.json
- [ ] Rewrite LoginPage.ts
- [ ] Rewrite HomePage.ts → InventoryPage.ts
- [ ] Update ProductPage.ts
- [ ] Update CartPage.ts
- [ ] Rewrite CheckoutPage.ts
- [ ] Update login.spec.ts
- [ ] Update checkout-flow.spec.ts
- [ ] Update navigation.spec.ts
- [ ] Rewrite form-submission.spec.ts
- [ ] Update error-handling.spec.ts
- [ ] Add product-sorting tests (optional)
- [ ] Update README.md
- [ ] Run all tests to verify

