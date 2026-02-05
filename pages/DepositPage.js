const { expect } = require('@playwright/test');

class DepositPage {
  constructor(page) {
    this.page = page;
  }

  // ---------- Fill deposit form ----------
  async fillDepositForm(phone, amount) {
    const phoneInput = this.page.getByRole('textbox', { name: 'Numéro de téléphone' });
    const amountInput = this.page.getByRole('textbox', { name: /Entre le montant/i });
    const continueBtn = this.page.getByRole('button', { name: /continue/i });

    await phoneInput.fill(phone);
    await amountInput.fill(amount);
    await continueBtn.click();
  }

  // ---------- Assert final success or pending ----------
  async assertFinalState(allowPending = true) {
    try {
      await this.page.waitForURL(/success|confirmation|receipt/i, { timeout: 50000 });
      await expect(this.page.getByText(/paiement réussi|succès|confirmé/i)).toBeVisible();
    } catch {
      if (allowPending) {
        await expect(
          this.page.getByText(/Votre dépôt a été effectué avec succès/i)
        ).toBeVisible();
      } else {
        throw new Error('Payment did not complete as expected');
      }
    }
  }

  // ---------- Payment methods ----------
  async depositWithWave(phone, amount) {
    await this.page.getByRole('link', { name: /payment method Wave/i }).click();
    await this.fillDepositForm(phone, amount);
    await this.page.waitForURL(/deposit|payment/i, { timeout: 15000 });
  }

  async depositWithMTN(phone, amount) {
    await this.page.getByRole('link', { name: /payment method MTN/i }).click();
    await this.fillDepositForm(phone, amount);
    await this.page.getByRole('button', { name: /payer/i }).click();
    await this.assertFinalState();
  }

  async depositWithMoov(phone, amount) {
    await this.page.getByRole('link', { name: /payment method Moov/i }).click();
    await this.fillDepositForm(phone, amount);
    await this.page.getByRole('button', { name: /payer/i }).click();
    await this.assertFinalState();
  }

  // ---------- Negative assertions ----------
  async assertPaymentFailedToast() {
    await expect(this.page.getByText(/Paiement échoué/i)).toBeVisible({ timeout: 10000 });
  }

  async assertAboveMaximumAmount() {
    await expect(this.page.getByText(/Le montant .* est supérieur/i)).toBeVisible({ timeout: 10000 });
  }

  async assertFailedDepositPage() {
    await this.page.waitForURL(/\/failed$/, { timeout: 15000 });
    await expect(this.page.getByText(/La demande de dépôt a échoué/i)).toBeVisible({ timeout: 10000 });
  }
}

module.exports = { DepositPage };
