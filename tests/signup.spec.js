const { test } = require('@playwright/test');
const Signuppage = require('../pages/Signuppage');

// CI Phone generator (07xxxxxxxx)
function generateCIPhone07() {
  const prefix = '07';
  const remaining = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${remaining}`;
}

test.describe.serial('Signup Flow', () => {
  test('Run signup scenarios sequentially', async ({ page }) => {
    const signup = new Signuppage(page);

    // 1️⃣ Valid signup
    await test.step('Valid signup', async () => {
      await signup.navigate();
      await signup.signupValid(
        generateCIPhone07(),
        'Miracle99@',
        'Miracle99@',
        '1111'
      );
    });

    // 2️⃣ Phone already exists
    await test.step('Phone number exists', async () => {
      await signup.navigate();
      await signup.assertPhoneAlreadyExists(
        '0707283948',
        'Miracle99@',
        'Miracle99@'
      );
    });

    // 3️⃣ Invalid phone number
    await test.step('Invalid phone number', async () => {
      await signup.navigate();
      await signup.assertInvalidPhone(
        '07078',
        'Miracle99@',
        'Miracle99@'
      );
    });

    // 4️⃣ Invalid password
    await test.step('Invalid password', async () => {
      await signup.navigate();
      await signup.assertInvalidPassword('0707877389', 'Mie');
    });
  });
});
