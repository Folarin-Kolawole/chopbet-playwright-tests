const { test, expect } = require('@playwright/test');
const { DepositPage } = require('../pages/DepositPage');
const Loginpage = require('../pages/LoginPage');

test.describe.serial('Deposit Payment Methods', () => {
  test.setTimeout(90_000);
  let deposit;
  let login;

  test.beforeEach(async ({ page }) => {
    login = new Loginpage(page);
    deposit = new DepositPage(page);

    // Login before deposit flow
    await login.navigate();
    await login.fillPhone('0714111133');
    await login.fillPassword('test123');
    await login.clickLogin();

    // Go to deposit page
    const personalSpace = page.getByRole('link', { name: 'Mon espace perso' });
    await expect(personalSpace).toBeVisible({ timeout: 10000 });
    await personalSpace.click();

    const depositBtn = page.getByRole('button', { name: 'Dépôt' });
    await expect(depositBtn).toBeVisible({ timeout: 10000 });
    await depositBtn.click();

    await expect(page.getByText(/dépôt/i)).toBeVisible();
  });

  /* ---------------- POSITIVE ---------------- */
  test('User can deposit with Wave', async () => {
    await deposit.depositWithWave('0707200200', '500');
    await expect(deposit.page).toHaveURL(/deposit|payment/i);
  });

  test('User can deposit with MTN', async () => {
    await deposit.depositWithMTN('0707200200', '500');
  });

  test('User can deposit with Moov', async () => {
    await deposit.depositWithMoov('0707200200', '500');
  });

  /* ---------------- NEGATIVE ---------------- */
  test('User cannot deposit below minimum amount (all methods)', async () => {
    await deposit.page.getByRole('link', { name: 'payment method MTN (PMT)' }).click();
    await deposit.page.getByRole('textbox', { name: /Entre le montant/i }).fill('25');
    await deposit.page.getByRole('button', { name: 'Continue' }).click();
    await deposit.assertPaymentFailedToast();
  });

  test('User cannot deposit above maximum amount (all methods)', async () => {
    await deposit.page.getByRole('link', { name: 'payment method MTN (PMT)' }).click();
    await deposit.page.getByRole('textbox', { name: /Entre le montant/i }).fill('25000000');
    await deposit.page.getByRole('button', { name: 'Continue' }).click();
    await deposit.assertAboveMaximumAmount();
  });

  test('User cannot deposit with invalid MTN number', async () => {
    await deposit.page.getByRole('link', { name: 'payment method MTN (PMT)' }).click();
    await deposit.page.getByRole('textbox', { name: /Entre le montant/i }).fill('100');
    await deposit.page.getByRole('button', { name: 'Continue' }).click();
    await deposit.page.getByRole('button', { name: 'Payer' }).click();
    await deposit.assertFailedDepositPage();
  });

  test('User cannot deposit with invalid Moov number', async () => {
    await deposit.page.getByRole('link', { name: 'payment method Moov (PMT)' }).click();
    await deposit.page.getByRole('textbox', { name: /Entre le montant/i }).fill('100');
    await deposit.page.getByRole('button', { name: 'Continue' }).click();
    await deposit.page.getByRole('button', { name: 'Payer' }).click();
    await deposit.assertFailedDepositPage();
  });

  test('User cannot deposit with invalid Wave number', async () => {
    await deposit.page.getByRole('link', { name: 'payment method Wave (PMT)' }).click();
    await deposit.page.getByRole('textbox', { name: /Entre le montant/i }).fill('100');
    await deposit.page.getByRole('button', { name: 'Continue' }).click();
    await deposit.assertPaymentFailedToast();
  });
});
