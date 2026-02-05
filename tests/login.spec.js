const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

test('Ensure user can log in with valid details', async ({ page }) => {
  const login = new LoginPage(page);

  await login.navigate();
  await login.fillPhone('07042275924');
  await login.fillPassword('tboy1@');
  await login.clickLogin();

  // Adjust this assertion if needed
  await expect(page).toHaveURL(/casino/);
});

test('Ensure user cannot log in with invalid details', async ({ page }) => {
  const login = new LoginPage(page);

  await login.navigate();
  await login.fillPhone('07042275924');
  await login.fillPassword('wrongpassword');
  await login.clickLogin({ expectNavigation: false });

  await login.assertInvalidLoginErrorVisible();
});

 
test('Ensure login button is disabled when phone number is missing', async ({ page }) => {
  const login = new LoginPage(page);

  await login.navigate();
  await login.fillPassword('tboy91@');

  await expect(login.loginButton).toBeDisabled();
});
test('Ensure login button is disabled when password is missing', async ({ page }) => {
  const login = new LoginPage(page);

  await login.navigate();
  await login.fillPhone('07042275924');

  await expect(login.loginButton).toBeDisabled();
});

module.exports = LoginPage;