const { expect } = require('@playwright/test');

class WithdrawalPage {
  constructor(page) {
    this.page = page;

    // Entry point
    this.withdrawalLink = page.getByRole('link', { name: '000 FCFA Retrait' });

    // Payment methods
    this.methods = {
      MTN: page.getByRole('link', { name: 'payment method MTN (PMT)' }),
      ORANGE: page.getByRole('link', { name: 'payment method Orange (PMT)' }),
    };

    // Form fields
    this.phoneInput = page.getByRole('textbox', { name: 'Enter Phone Number' });
    this.amountInput = page.getByRole('textbox', { name: 'Sélectionne un montant' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });

    // Success / navigation
    this.backToGameButton = page.getByRole('button', { name: 'Retour au jeu' });

    // Error states
    this.pendingWithdrawalText = page.getByText('Veuillez patienter quelques', { exact: false });
    this.insufficientBalanceText = page.getByText('Solde insuffisant', { exact: false });
    this.invalidPhoneText = page.getByText('Invalid phone number', { exact: false });
  }

  /** Retry helper */
  async _retryAction(action, retries = 2, reloadPage = false) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await action();
        return;
      } catch (err) {
        console.warn(`Attempt ${attempt} failed: ${err.message}`);
        if (attempt < retries && reloadPage) {
          console.log('Reloading page and retrying...');
          await this.page.reload();
        } else if (attempt >= retries) {
          throw err;
        }
      }
    }
  }

  /** Open withdrawal page safely */
  async openWithdrawal(retries = 2) {
    await this._retryAction(async () => {
      await this.withdrawalLink.click();
      await this.page.waitForURL(/withdraw/, { timeout: 10000 });
    }, retries, true);
  }

  /** Perform a withdrawal */
  async withdraw({ method, phone, amount }, retries = 2, waitForFinal = true) {
    await this._retryAction(async () => {
      const methodLink = this.methods[method];
      if (!methodLink) throw new Error(`Unknown withdrawal method: ${method}`);

      await methodLink.click();
      await this.phoneInput.fill(phone);
      await this.amountInput.fill(amount);
      await this.continueButton.click();
    }, retries, true);

    if (waitForFinal) {
      await this.waitForFinalState();
    }
  }

  /** Wait for final state */
  async waitForFinalState(timeout = 10000) {
    try {
      await Promise.race([
        this.backToGameButton.waitFor({ timeout }).then(() => 'success'),
        this.pendingWithdrawalText.waitFor({ timeout }).then(() => 'pending'),
        this.insufficientBalanceText.waitFor({ timeout }).then(() => 'insufficient'),
        this.invalidPhoneText.waitFor({ timeout }).then(() => 'invalid'),
      ]);
    } catch {
      throw new Error('Withdrawal did not reach a final state within timeout');
    }
  }

  // Assertions
  async assertSuccessfulWithdrawal() {
    await expect(this.backToGameButton).toBeVisible();
    await this.backToGameButton.click();
  }

  async assertPendingWithdrawalError() {
    await expect(this.pendingWithdrawalText).toBeVisible();
  }

  async assertInsufficientBalanceError() {
    await expect(this.insufficientBalanceText).toBeVisible();
  }

  async assertInvalidPhoneError() {
    await expect(this.invalidPhoneText).toBeVisible();
  }
}

module.exports = WithdrawalPage;
