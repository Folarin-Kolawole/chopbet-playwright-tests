const { test } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const WithdrawalPage = require('../pages/WithdrawalPage');

const USER_PHONE = '07042275924';
const USER_PASSWORD = 'tboy1@';

test.describe.serial('Withdrawal Flow', () => {
  let withdrawal;

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    withdrawal = new WithdrawalPage(page);

    // ✅ Correct method name
    await login.valid_login(USER_PHONE, USER_PASSWORD);
    await withdrawal.openWithdrawal();
  });

  test('User cannot withdraw above available balance', async () => {
    await withdrawal.withdraw({
      method: 'MTN',
      phone: USER_PHONE,
      amount: '55000',
    });

    await withdrawal.assertInsufficientBalanceError();
  });

  test('User can withdraw successfully', async () => {
    await withdrawal.withdraw({
      method: 'MTN',
      phone: USER_PHONE,
      amount: '10000',
    });

    await withdrawal.assertSuccessfulWithdrawal();
  });

  test('User cannot withdraw when withdrawal is pending', async () => {
    await withdrawal.withdraw({
      method: 'MTN',
      phone: USER_PHONE,
      amount: '10000',
    });

    await withdrawal.assertPendingWithdrawalError();
  });

  test('User cannot withdraw with invalid phone number', async () => {
    await withdrawal.withdraw({
      method: 'MTN',
      phone: '07042275', // invalid
      amount: '10000',
    });

    await withdrawal.assertInvalidPhoneError();
  });
});
