const { expect } = require('@playwright/test');

class Signuppage {
  constructor(page) {
    this.page = page;

    // Signup locators
    this.phonenumberField = page.getByRole('textbox', {
      name: 'Entre ton numéro de téléphone',
    });
    this.passwordField = page.locator('input[name="password"]');
    this.confirmpasswordField = page.locator(
      'input[name="confirmPassword"]'
    );
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.smsButton = page.getByRole('button', { name: /SMS/i });

    // OTP
    this.otpDigit1 = page.getByRole('textbox', { name: 'OTP digit 1' });
    this.otpDigit2 = page.getByRole('textbox', { name: 'OTP digit 2' });
    this.otpDigit3 = page.getByRole('textbox', { name: 'OTP digit 3' });
    this.otpDigit4 = page.getByRole('textbox', { name: 'OTP digit 4' });
    this.confirmButton = page.getByRole('button', { name: /confirmer/i });

    // Errors
    this.invalidPhoneText = page.getByText('Numéro de téléphone invalide', {
      exact: true,
    });
    this.invalidOtpText = page.getByText('Code invalide ressaie!', {
      exact: true,
    });
    this.alertMessage = page.getByRole('alert');
    this.invalidPasswordText = page.getByText(
      'Ton mot de passe doit avoir au moins 6 caractères.',
      { exact: true }
    );
  }

  async navigate() {
    await this.page.goto('https://dev.chopbet.ci/join');
  }

  // ---- ACTION HELPERS ----
  async fillSignupFields(phone, password, confirmPassword) {
    await this.phonenumberField.fill(phone);
    await this.passwordField.fill(password);
    await this.confirmpasswordField.fill(confirmPassword);
  }

  async submitSignup() {
    await expect(this.continueButton).toBeEnabled();
    await this.continueButton.click();
  }

  async fillOTP(otp) {
    const digits = otp.split('');
    await this.otpDigit1.fill(digits[0]);
    await this.otpDigit2.fill(digits[1]);
    await this.otpDigit3.fill(digits[2]);
    await this.otpDigit4.fill(digits[3]);
    await this.confirmButton.click();
  }

  // ---- FLOWS ----
  async signupValid(phone, password, confirmPassword, otp = '1111') {
    await this.fillSignupFields(phone, password, confirmPassword);
    await this.submitSignup();

    await expect(this.smsButton).toBeVisible();
    await this.smsButton.click();

    await this.fillOTP(otp);
  }

  async signupInvalidOtp(phone, password, confirmPassword, otp = '1121') {
    await this.fillSignupFields(phone, password, confirmPassword);
    await this.submitSignup();

    await this.smsButton.click();
    await this.fillOTP(otp);

    await expect(this.invalidOtpText).toBeVisible();
  }

  // ---- ASSERTIONS ONLY (NO SUBMIT) ----
  async assertPhoneAlreadyExists(phone, password, confirmPassword) {
    await this.fillSignupFields(phone, password, confirmPassword);
    await this.submitSignup();
    await expect(this.alertMessage).toBeVisible();
  }

  async assertInvalidPhone(phone, password, confirmPassword) {
    await this.fillSignupFields(phone, password, confirmPassword);
    await expect(this.invalidPhoneText).toBeVisible();
    await expect(this.continueButton).toBeDisabled();
  }

  async assertInvalidPassword(phone, password) {
    await this.phonenumberField.fill(phone);
    await this.passwordField.fill(password);
    await expect(this.invalidPasswordText).toBeVisible();
    await expect(this.continueButton).toBeDisabled();
  }
}

module.exports = Signuppage;
