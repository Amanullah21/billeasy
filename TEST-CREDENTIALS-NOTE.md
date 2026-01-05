# Test Credentials Note

## Automatic Account Creation

The framework now **automatically creates user accounts** if they don't exist! Tests use the `loginOrSignup()` method which:

1. **Tries to login first** with the provided credentials
2. **If login fails** (user doesn't exist), automatically creates a new account
3. **Then logs in** with the newly created account

### How It Works:

- Tests generate **unique email addresses** for each test run to avoid conflicts
- The signup process automatically fills in all required information
- No manual account creation needed!

### Test Data:

The test data file (`fixtures/test-data.json`) contains default values that are used for account creation:

```json
{
  "users": {
    "valid": {
      "email": "testuser@example.com",  // Will be replaced with unique email
      "password": "Test123!",
      "name": "Test User",
      "firstName": "Test",
      "lastName": "User",
      "company": "Test Company",
      "address": "123 Test Street",
      "address2": "Apt 4B",
      "state": "NY",
      "city": "New York",
      "zipcode": "10001",
      "country": "United States",
      "mobile": "1234567890"
    }
  }
}
```

### Tests That Use Auto-Signup:

- `login.spec.ts` - "should login with valid credentials" ✅
- `login.spec.ts` - "should logout successfully" ✅
- `checkout-flow.spec.ts` - "should proceed to checkout from cart" ✅
- `checkout-flow.spec.ts` - "should complete checkout process" ✅

### Benefits:

- ✅ **No manual setup required** - tests create accounts automatically
- ✅ **Unique emails** - each test run uses different emails to avoid conflicts
- ✅ **Fully automated** - tests can run in CI/CD without pre-existing accounts
- ✅ **Robust** - handles both existing users and new account creation

### Note:

The framework uses the [Automation Exercise signup form](https://automationexercise.com/login) to create accounts. Each test generates a unique email address using a timestamp and random number to ensure no conflicts between test runs.

