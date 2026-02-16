import { test, expect } from '@playwright/test';

    // test des champs du formulaire
test('Test des champs du formulaire', async ({ page }) => {
    await page.goto('/auth/register');

await expect(
    page.getByRole('heading', { name: /créer un compte/i })
).toBeVisible();

await expect(page.getByLabel('Nom')).toBeVisible();
await expect(page.getByLabel('E-mail')).toBeVisible();
await expect(page.locator('#password')).toBeVisible();
await expect(page.locator('#confirmPassword')).toBeVisible();

});


    // test de message d'erreur
test('Test des erreurs de validation/formulaire vide', async ({ page }) => {
  await page.goto('/auth/register');

  await page.locator('button[type="submit"]').click();

  await expect(page.locator('#name-error')).toHaveText(/le nom est requis/i);
  await expect(page.locator('#email-error')).toHaveText(/l'email est requis/i);
  await expect(page.locator('#password-error')).toHaveText(/le mot de passe est requis/i);
  await expect(page.locator('#confirmPassword-error')).toHaveText(/la confirmation est requise/i);
});



    // test du mot de passe different
test('Test des erreurs lorsque les mots de passe ne correspondent pas', async ({ page }) => {
  await page.goto('/auth/register');

  await page.locator('input[name="name"]').fill('Victor');
  await page.locator('input[name="email"]').fill(`victor@test.com`);
  await page.locator('#password').fill('password123');
  await page.locator('#confirmPassword').fill('password124');

  await page.locator('button[type="submit"]').click();

  await expect(page.locator('#confirmPassword-error')).toHaveText(/ne correspondent pas/i);
});



    // test d'une inscription réussie'
test("Test d'une inscription réussie", async ({ page }) => {
  await page.goto('/auth/register');

  await page.locator('input[name="name"]').fill('Victor');
  await page.locator('input[name="email"]').fill(`victor+${Date.now()}@test.com`);
  await page.locator('#password').fill('password123');
  await page.locator('#confirmPassword').fill('password123');

  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL('/chat', { timeout: 15000 });
});
