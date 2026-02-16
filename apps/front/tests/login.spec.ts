import { test, expect } from '@playwright/test';

  // test des champs du formulaire
test('Test des champs du formulaire', async ({ page }) => {
  await page.goto('/auth/login');

  await expect(
    page.getByRole('heading', { name: /connexion/i })
  ).toBeVisible();

  await expect(page.getByLabel('E-mail')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(
    page.getByRole('button', { name: /se connecter/i })
  ).toBeVisible();
});


  // test de message d'erreur (formulaire vide)
test('Test des erreurs de validation/formulaire vide', async ({ page }) => {
  await page.goto('/auth/login');

  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#email-error')).toHaveText(/l'email est requis/i);
  await expect(page.locator('#password-error')).toHaveText(/le mot de passe est requis/i);
});


  // test d'une connexion réussie
test("Test d'une connexion réussie", async ({ page }) => {
  await page.goto('/auth/login');

  await page.locator('input[name="email"]').fill('admin@jobster.com');
  await page.locator('#password').fill('password123');

  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL('/chat', { timeout: 15000 });
});
