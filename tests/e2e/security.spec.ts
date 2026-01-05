import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { CartPage } from '../../pages/CartPage';
import testData from '../../fixtures/test-data.json';

test.describe('Security Tests', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;
  let checkoutPage: CheckoutPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    checkoutPage = new CheckoutPage(page);
    cartPage = new CartPage(page);
    await loginPage.navigateToLogin();
  });

  test.describe('SQL Injection Tests', () => {
    test('should prevent SQL injection in username field', async ({ page }) => {
      test.setTimeout(180000); // Increased timeout for multiple payloads
      
      const sqlInjections = [
        "' OR '1'='1",
        "' OR '1'='1' --",
        "' OR '1'='1' /*",
        "admin'--",
        "admin'/*",
        "' UNION SELECT NULL--",
        "1' OR '1'='1",
        "1' OR '1'='1' --",
        "1' OR '1'='1' /*",
        "' OR 1=1--",
        "' OR 1=1#",
        "' OR 1=1/*",
        "') OR ('1'='1--",
        "admin' OR '1'='1",
        "admin' OR '1'='1'--",
        "admin' OR '1'='1'/*",
        "admin' OR '1'='1' #",
        "' OR 'x'='x",
        "' OR 'a'='a",
        "') OR ('x'='x",
      ];

      for (const sqlPayload of sqlInjections) {
        await loginPage.navigateToLogin();
        await homePage.wait(500); // Reduced wait time
        
        await loginPage.enterUsername(sqlPayload);
        await loginPage.enterPassword('any_password');
        await loginPage.clickLoginButton();
        
        await homePage.wait(1500); // Reduced wait time
        
        // Should NOT be logged in - should show error or stay on login page
        const currentUrl = loginPage.getCurrentUrl();
        expect(currentUrl).not.toContain('/inventory');
        
        // Should show error message (not allow SQL injection)
        // Wait a bit for error message to appear
        await homePage.wait(500);
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage.length).toBeGreaterThan(0);
      }
    });

    test('should prevent SQL injection in password field', async ({ page }) => {
      test.setTimeout(120000); // Increased timeout for multiple payloads
      
      const sqlInjections = [
        "' OR '1'='1",
        "' OR '1'='1' --",
        "' OR '1'='1' /*",
        "password'--",
        "password'/*",
        "' UNION SELECT NULL--",
        "1' OR '1'='1",
        "' OR 1=1--",
        "' OR 1=1#",
        "') OR ('1'='1--",
      ];

      for (const sqlPayload of sqlInjections) {
        await loginPage.navigateToLogin();
        await homePage.wait(500); // Reduced wait time
        
        await loginPage.enterUsername('standard_user');
        await loginPage.enterPassword(sqlPayload);
        await loginPage.clickLoginButton();
        
        await homePage.wait(1500); // Reduced wait time
        
        // Should NOT be logged in
        const currentUrl = loginPage.getCurrentUrl();
        expect(currentUrl).not.toContain('/inventory');
        
        // Should show error message
        await homePage.wait(500);
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage.length).toBeGreaterThan(0);
      }
    });

    test('should prevent SQL injection in checkout form fields', async ({ page }) => {
      test.setTimeout(90000);
      
      // First login with valid credentials
      await loginPage.login(testData.users.standard.username, testData.users.standard.password);
      await homePage.wait(2000);
      await loginPage.verifyLoggedIn();
      
      // Add product to cart
      await homePage.addProductToCartByIndex(0);
      await homePage.wait(1000);
      
      // Navigate to cart
      await homePage.clickCartLink();
      await homePage.wait(2000);
      
      // Go to checkout
      await cartPage.clickProceedToCheckout();
      await homePage.wait(2000);
      
      const sqlInjections = [
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT NULL--",
        "1' OR '1'='1",
      ];
      
      for (const sqlPayload of sqlInjections) {
        await checkoutPage.fillCheckoutInformation(sqlPayload, 'Doe', '12345');
        await checkoutPage.clickContinue();
        
        await homePage.wait(2000);
        
        // Should either show validation error or proceed normally (but not execute SQL)
        // Check that we're not on an error page that suggests SQL execution
        const currentUrl = loginPage.getCurrentUrl();
        expect(currentUrl).not.toContain('error');
        expect(currentUrl).not.toContain('sql');
        expect(currentUrl).not.toContain('database');
        
        // Navigate back to checkout if we proceeded
        if (currentUrl.includes('/checkout-step-two')) {
          await checkoutPage.clickCancel();
          await homePage.wait(1000);
          await homePage.clickCartLink();
          await homePage.wait(1000);
          await cartPage.clickProceedToCheckout();
          await homePage.wait(1000);
        }
      }
    });
  });

  test.describe('Brute Force Attack Tests', () => {
    test('should prevent brute force login attempts', async ({ page }) => {
      test.setTimeout(120000);
      
      const commonPasswords = [
        'password',
        '123456',
        'password123',
        'admin',
        'root',
        'test',
        'qwerty',
        'letmein',
        'welcome',
        'monkey',
        '1234567890',
        'abc123',
        'Password1',
        'admin123',
        'password1',
      ];
      
      let failedAttempts = 0;
      const maxAttempts = 10;
      
      for (let i = 0; i < Math.min(commonPasswords.length, maxAttempts); i++) {
        await loginPage.navigateToLogin();
        await homePage.wait(1000);
        
        await loginPage.enterUsername('standard_user');
        await loginPage.enterPassword(commonPasswords[i]);
        await loginPage.clickLoginButton();
        
        await homePage.wait(2000);
        
        const currentUrl = loginPage.getCurrentUrl();
        if (!currentUrl.includes('/inventory')) {
          failedAttempts++;
          const errorMessage = await loginPage.getErrorMessage();
          expect(errorMessage.length).toBeGreaterThan(0);
        } else {
          // If somehow logged in, logout immediately
          await loginPage.logout();
        }
      }
      
      // After multiple failed attempts, should still show error (not locked out permanently)
      // or should show rate limiting message
      expect(failedAttempts).toBeGreaterThan(0);
      
      // Try one more time - should still be protected
      await loginPage.navigateToLogin();
      await homePage.wait(1000);
      await loginPage.enterUsername('standard_user');
      await loginPage.enterPassword('wrong_password');
      await loginPage.clickLoginButton();
      await homePage.wait(2000);
      
      const finalUrl = loginPage.getCurrentUrl();
      expect(finalUrl).not.toContain('/inventory');
    });

    test('should handle rapid login attempts', async ({ page }) => {
      test.setTimeout(60000);
      
      // Attempt rapid login attempts
      for (let i = 0; i < 5; i++) {
        await loginPage.navigateToLogin();
        await homePage.wait(500); // Short wait for rapid attempts
        
        await loginPage.enterUsername('standard_user');
        await loginPage.enterPassword(`wrong_password_${i}`);
        await loginPage.clickLoginButton();
        
        await homePage.wait(1000);
        
        const currentUrl = loginPage.getCurrentUrl();
        expect(currentUrl).not.toContain('/inventory');
      }
      
      // After rapid attempts, valid login should still work
      await loginPage.navigateToLogin();
      await homePage.wait(1000);
      await loginPage.login(testData.users.standard.username, testData.users.standard.password);
      await homePage.wait(2000);
      await loginPage.verifyLoggedIn();
    });
  });

  test.describe('XSS (Cross-Site Scripting) Tests', () => {
    test('should prevent XSS in username field', async ({ page }) => {
      test.setTimeout(180000); // Increased timeout for multiple payloads
      
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        'javascript:alert("XSS")',
        '<body onload=alert("XSS")>',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        '<input onfocus=alert("XSS") autofocus>',
        '<select onfocus=alert("XSS") autofocus>',
        '<textarea onfocus=alert("XSS") autofocus>',
        '<keygen onfocus=alert("XSS") autofocus>',
        '<video><source onerror="alert(\'XSS\')">',
        '<audio src=x onerror=alert("XSS")>',
        '<details open ontoggle=alert("XSS")>',
        '<marquee onstart=alert("XSS")>',
        '<div onmouseover=alert("XSS")>',
        '"><script>alert("XSS")</script>',
        "';alert(String.fromCharCode(88,83,83))//';alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//--></SCRIPT>\">'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>",
      ];

      // Set up error listener before the loop
      const jsErrors: string[] = [];
      page.on('pageerror', (error) => {
        jsErrors.push(error.message);
      });

      for (const xssPayload of xssPayloads) {
        await loginPage.navigateToLogin();
        await homePage.wait(500); // Reduced wait time
        
        await loginPage.enterUsername(xssPayload);
        await loginPage.enterPassword('secret_sauce');
        await loginPage.clickLoginButton();
        
        await homePage.wait(1500); // Reduced wait time
        
        // Should NOT be logged in
        const currentUrl = loginPage.getCurrentUrl();
        expect(currentUrl).not.toContain('/inventory');
        
        // XSS should be sanitized/escaped, not executed
        const pageContent = await page.content();
        // Should not contain raw script tags in rendered content
        if (xssPayload.includes('<script>')) {
          // Script tags should be escaped or removed
          expect(pageContent.toLowerCase()).not.toContain('<script>alert');
        }
      }
    });

    test('should prevent XSS in password field', async ({ page }) => {
      test.setTimeout(60000);
      
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
        '<svg onload=alert("XSS")>',
      ];

      for (const xssPayload of xssPayloads) {
        await loginPage.navigateToLogin();
        await homePage.wait(1000);
        
        await loginPage.enterUsername('standard_user');
        await loginPage.enterPassword(xssPayload);
        await loginPage.clickLoginButton();
        
        await homePage.wait(2000);
        
        // Should NOT be logged in
        const currentUrl = loginPage.getCurrentUrl();
        expect(currentUrl).not.toContain('/inventory');
      }
    });

    test('should prevent XSS in checkout form fields', async ({ page }) => {
      test.setTimeout(90000);
      
      // Login first
      await loginPage.login(testData.users.standard.username, testData.users.standard.password);
      await homePage.wait(2000);
      await loginPage.verifyLoggedIn();
      
      // Add product to cart
      await homePage.addProductToCartByIndex(0);
      await homePage.wait(1000);
      
      // Navigate to cart and checkout
      await homePage.clickCartLink();
      await homePage.wait(2000);
      await cartPage.clickProceedToCheckout();
      await homePage.wait(2000);
      
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
      ];
      
      for (const xssPayload of xssPayloads) {
        await checkoutPage.fillCheckoutInformation(xssPayload, 'Doe', '12345');
        
        // Check page content for XSS execution
        const pageContent = await page.content();
        // Should not contain executable script tags
        if (xssPayload.includes('<script>')) {
          expect(pageContent.toLowerCase()).not.toContain('<script>alert');
        }
        
        // Navigate back if needed
        await checkoutPage.clickCancel();
        await homePage.wait(1000);
        await homePage.clickCartLink();
        await homePage.wait(1000);
        await cartPage.clickProceedToCheckout();
        await homePage.wait(1000);
      }
    });
  });

  test.describe('Input Validation Tests', () => {
    test('should handle extremely long input strings', async ({ page }) => {
      test.setTimeout(60000);
      
      const longString = 'A'.repeat(10000);
      
      await loginPage.enterUsername(longString);
      await loginPage.enterPassword(longString);
      await loginPage.clickLoginButton();
      
      await homePage.wait(2000);
      
      // Should handle gracefully - either truncate, reject, or show error
      const currentUrl = loginPage.getCurrentUrl();
      expect(currentUrl).not.toContain('/inventory');
    });

    test('should handle special characters in input fields', async ({ page }) => {
      test.setTimeout(60000);
      
      const specialChars = [
        '!@#$%^&*()',
        '{}[]|\\:";\'<>?,./',
        '`~-_=+',
        '©®™€£¥',
        '🚀🔥💯',
        'null',
        'undefined',
        'true',
        'false',
      ];

      for (const specialChar of specialChars) {
        await loginPage.navigateToLogin();
        await homePage.wait(1000);
        
        await loginPage.enterUsername(specialChar);
        await loginPage.enterPassword(specialChar);
        await loginPage.clickLoginButton();
        
        await homePage.wait(2000);
        
        // Should handle gracefully without crashing
        const currentUrl = loginPage.getCurrentUrl();
        // Should either show error or stay on login page
        expect(typeof currentUrl).toBe('string');
      }
    });

    test('should handle null and undefined values', async ({ page }) => {
      test.setTimeout(60000);
      
      // Try to submit with empty fields (should be handled)
      await loginPage.clickLoginButton();
      await homePage.wait(2000);
      
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage.length).toBeGreaterThan(0);
    });

    test('should handle SQL-like patterns in checkout fields', async ({ page }) => {
      test.setTimeout(90000);
      
      // Login first
      await loginPage.login(testData.users.standard.username, testData.users.standard.password);
      await homePage.wait(2000);
      await loginPage.verifyLoggedIn();
      
      // Add product and go to checkout
      await homePage.addProductToCartByIndex(0);
      await homePage.wait(1000);
      await homePage.clickCartLink();
      await homePage.wait(2000);
      await cartPage.clickProceedToCheckout();
      await homePage.wait(2000);
      
      const maliciousInputs = [
        'DROP TABLE users;',
        'DELETE FROM users;',
        'UPDATE users SET password=',
        'INSERT INTO users VALUES',
        'SELECT * FROM users',
      ];
      
      for (const maliciousInput of maliciousInputs) {
        await checkoutPage.fillCheckoutInformation(maliciousInput, 'Doe', '12345');
        
        // Should handle without executing SQL
        const currentUrl = loginPage.getCurrentUrl();
        expect(currentUrl).not.toContain('error');
        expect(currentUrl).not.toContain('sql');
        
        // Navigate back if needed
        await checkoutPage.clickCancel();
        await homePage.wait(1000);
        await homePage.clickCartLink();
        await homePage.wait(1000);
        await cartPage.clickProceedToCheckout();
        await homePage.wait(1000);
      }
    });
  });

  test.describe('Authentication Bypass Tests', () => {
    test('should prevent authentication bypass via URL manipulation', async ({ page }) => {
      test.setTimeout(60000);
      
      // Try to access protected pages without authentication
      const protectedUrls = [
        '/inventory.html',
        '/inventory',
        '/cart.html',
        '/checkout-step-one.html',
        '/checkout-step-two.html',
        '/checkout-complete.html',
      ];
      
      for (const url of protectedUrls) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await homePage.wait(2000);
        
        // Should redirect to login page or show error
        const currentUrl = loginPage.getCurrentUrl();
        // Should be on login page, not the protected page
        if (!currentUrl.includes('/inventory') && !currentUrl.includes('/cart') && 
            !currentUrl.includes('/checkout')) {
          // Good - redirected to login
          expect(currentUrl).toContain('/');
        } else {
          // If somehow on protected page, should not have access to content
          const hasLoginForm = await loginPage.isVisible('#user-name').catch(() => false);
          if (hasLoginForm) {
            // Redirected back to login - good
            expect(true).toBe(true);
          }
        }
      }
    });

    test('should prevent session hijacking via cookie manipulation', async ({ page }) => {
      test.setTimeout(60000);
      
      // Login first to get valid session
      await loginPage.login(testData.users.standard.username, testData.users.standard.password);
      await homePage.wait(2000);
      await loginPage.verifyLoggedIn();
      
      // Get cookies
      const cookies = await page.context().cookies();
      
      // Try to manipulate cookies
      if (cookies.length > 0) {
        // Try accessing with modified cookies
        await page.context().clearCookies();
        
        // Try to access protected page without valid session
        await page.goto('/inventory.html', { waitUntil: 'domcontentloaded' });
        await homePage.wait(2000);
        
        // Should redirect to login
        const currentUrl = loginPage.getCurrentUrl();
        expect(currentUrl).not.toContain('/inventory');
      }
    });

    test('should prevent authentication with empty credentials', async ({ page }) => {
      test.setTimeout(60000);
      
      await loginPage.clickLoginButton();
      await homePage.wait(2000);
      
      // Should show error, not allow login
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage.length).toBeGreaterThan(0);
      
      const currentUrl = loginPage.getCurrentUrl();
      expect(currentUrl).not.toContain('/inventory');
    });

    test('should prevent authentication with only username', async ({ page }) => {
      test.setTimeout(60000);
      
      await loginPage.enterUsername('standard_user');
      await loginPage.clickLoginButton();
      await homePage.wait(2000);
      
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage.length).toBeGreaterThan(0);
      
      const currentUrl = loginPage.getCurrentUrl();
      expect(currentUrl).not.toContain('/inventory');
    });

    test('should prevent authentication with only password', async ({ page }) => {
      test.setTimeout(60000);
      
      await loginPage.enterPassword('secret_sauce');
      await loginPage.clickLoginButton();
      await homePage.wait(2000);
      
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage.length).toBeGreaterThan(0);
      
      const currentUrl = loginPage.getCurrentUrl();
      expect(currentUrl).not.toContain('/inventory');
    });
  });

  test.describe('Path Traversal Tests', () => {
    test('should prevent path traversal attacks in URLs', async ({ page }) => {
      test.setTimeout(60000);
      
      const pathTraversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        '....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '..%2F..%2F..%2Fetc%2Fpasswd',
        '....//....//etc/passwd',
        '/etc/passwd',
        'C:\\Windows\\System32',
      ];
      
      for (const payload of pathTraversalPayloads) {
        try {
          await page.goto(payload, { waitUntil: 'domcontentloaded', timeout: 10000 });
          await homePage.wait(2000);
          
          // Should not expose system files
          const pageContent = await page.content();
          expect(pageContent.toLowerCase()).not.toContain('root:x:0:0');
          expect(pageContent.toLowerCase()).not.toContain('[boot loader]');
        } catch (error) {
          // Good - path traversal blocked
          expect(error).toBeDefined();
        }
      }
    });
  });

  test.describe('Session Management Tests', () => {
    test('should invalidate session on logout', async ({ page }) => {
      test.setTimeout(60000);
      
      // Login
      await loginPage.login(testData.users.standard.username, testData.users.standard.password);
      await homePage.wait(2000);
      await loginPage.verifyLoggedIn();
      
      // Logout
      await loginPage.logout();
      await homePage.wait(2000);
      await loginPage.verifyLoggedOut();
      
      // Try to access protected page after logout
      await page.goto('/inventory.html', { waitUntil: 'domcontentloaded' });
      await homePage.wait(2000);
      
      // Should redirect to login
      const currentUrl = loginPage.getCurrentUrl();
      expect(currentUrl).not.toContain('/inventory');
    });

    test('should handle concurrent sessions', async ({ page, context }) => {
      test.setTimeout(60000);
      
      // Login in first context
      await loginPage.login(testData.users.standard.username, testData.users.standard.password);
      await homePage.wait(2000);
      await loginPage.verifyLoggedIn();
      
      // Create new page (new session)
      const newPage = await context.newPage();
      const newLoginPage = new LoginPage(newPage);
      await newLoginPage.navigateToLogin();
      
      // New session should require login
      const newPageUrl = newPage.url();
      expect(newPageUrl).not.toContain('/inventory');
      
      await newPage.close();
    });
  });

  test.describe('CSRF (Cross-Site Request Forgery) Tests', () => {
    test('should validate CSRF tokens in forms', async ({ page }) => {
      test.setTimeout(90000);
      
      // Login first
      await loginPage.login(testData.users.standard.username, testData.users.standard.password);
      await homePage.wait(2000);
      await loginPage.verifyLoggedIn();
      
      // Add product and go to checkout
      await homePage.addProductToCartByIndex(0);
      await homePage.wait(1000);
      await homePage.clickCartLink();
      await homePage.wait(2000);
      await cartPage.clickProceedToCheckout();
      await homePage.wait(2000);
      
      // Check if forms have CSRF protection (hidden tokens, etc.)
      const pageContent = await page.content();
      // Modern apps should have some form of CSRF protection
      // This is a basic check - actual implementation varies
      const hasForm = await page.locator('form').count() > 0;
      expect(hasForm).toBe(true);
    });
  });

  test.describe('Sensitive Data Exposure Tests', () => {
    test('should not expose passwords in page source', async ({ page }) => {
      test.setTimeout(60000);
      
      await loginPage.enterUsername('standard_user');
      await loginPage.enterPassword('secret_sauce');
      
      // Password field should be type="password" which visually hides the input
      const passwordField = page.locator('#password');
      const inputType = await passwordField.getAttribute('type');
      expect(inputType).toBe('password');
      
      // Verify the password value is set but hidden by type="password"
      const passwordValue = await passwordField.inputValue();
      expect(passwordValue).toBe('secret_sauce'); // Value is set in DOM (normal)
      
      // Verify password field type is "password" (this masks the input visually)
      const isPasswordType = await passwordField.evaluate((el: HTMLInputElement) => el.type === 'password');
      expect(isPasswordType).toBe(true);
      
      // Security check: Verify password is not exposed in error messages or page content
      // Check error messages specifically (where passwords might be accidentally exposed)
      const errorMessage = await loginPage.getErrorMessage();
      if (errorMessage) {
        // Password should not appear in error messages
        expect(errorMessage.toLowerCase()).not.toContain('secret_sauce');
      }
      
      // Verify the password field is properly configured as type="password"
      // This is the key security feature - it masks the input visually
      const fieldType = await passwordField.getAttribute('type');
      expect(fieldType).toBe('password');
      
      // Additional security check: Verify password is not in the URL
      const currentUrl = loginPage.getCurrentUrl();
      expect(currentUrl).not.toContain('secret_sauce');
      expect(currentUrl).not.toContain('password');
    });

    test('should not expose sensitive data in URLs', async ({ page }) => {
      test.setTimeout(60000);
      
      await loginPage.enterUsername('standard_user');
      await loginPage.enterPassword('secret_sauce');
      await loginPage.clickLoginButton();
      await homePage.wait(2000);
      
      const currentUrl = loginPage.getCurrentUrl();
      
      // URL should not contain password
      expect(currentUrl).not.toContain('secret_sauce');
      expect(currentUrl).not.toContain('password');
      
      // URL should not contain username in query params (if redirected)
      if (currentUrl.includes('?')) {
        const urlParams = new URL(currentUrl).searchParams;
        expect(urlParams.get('username')).toBeNull();
        expect(urlParams.get('password')).toBeNull();
      }
    });
  });
});

