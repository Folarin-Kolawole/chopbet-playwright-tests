// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;

    // LOCATORS
    this.phonenumberField = page.locator('.phone-input');
    this.passwordField = page.locator('input[type="password"]:visible');
    this.loginButton = page.getByRole('button', { name: 'Connexion' });
    this.invalidErrorText = page.getByText("Nom d'utilisateur ou mot de"); // for invalid login
  }

  // Navigate to login page
  async navigate() {
    await this.page.goto('https://dev.chopbet.ci/login?next=/casino');
  }

  // Fill phone number
  async fillPhone(phoneNumber) {
    await this.phonenumberField.fill(phoneNumber);
  }

  // Fill password
  async fillPassword(password) {
    await this.passwordField.fill(password);
  }

  /**
   * Click login
   * @param {boolean} expectNavigation - true if login should succeed and navigate
   */
  async clickLogin({ expectNavigation = true } = {}) {
    if (expectNavigation) {
      // For valid login: wait for navigation
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'load', timeout: 10000 }),
        this.loginButton.click(),
      ]);
    } else {
      // For invalid login: just click and wait for error message
      await this.loginButton.click();
      await this.invalidErrorText.waitFor({ timeout: 10000 });
    }
  }

  // --------------------------
  // Helper for valid login
  // --------------------------
  async valid_login(phone, password) {
    await this.navigate();
    await this.fillPhone(phone);
    await this.fillPassword(password);
    await this.clickLogin({ expectNavigation: true });
  }

  // --------------------------
  // Helper for invalid login
  // --------------------------
  async invalid_login(phone, password) {
    await this.navigate();
    await this.fillPhone(phone);
    await this.fillPassword(password);
    await this.clickLogin({ expectNavigation: false });
  }

  // Optional: check invalid login error text
  async assertInvalidLoginErrorVisible() {
    await this.invalidErrorText.waitFor({ timeout: 5000 });
  }
}

module.exports = LoginPage;
