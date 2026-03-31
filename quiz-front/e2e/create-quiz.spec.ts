import { test, expect } from '@playwright/test';

test('Create quiz: створення нового квізу і поява в списку', async ({ page }) => {
  let quizCreated = false;

  await page.route('**/*', async (route) => {
    const req = route.request();

    if (!['fetch', 'xhr'].includes(req.resourceType())) {
      return route.continue();
    }

    // GET: список квізів (спочатку пустий, після POST — з новим)
    if (req.method() === 'GET') {
      const list = quizCreated
        ? [
            {
              id: '100',
              title: 'My New Quiz',
              description: 'Test description',
              questionCount: 1,
              createdAt: new Date().toISOString(),
            },
          ]
        : [];

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(list),
      });
    }

    // POST: створення квізу (імітуємо успіх)
    if (req.method() === 'POST') {
      quizCreated = true;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: '100', title: 'My New Quiz' }),
      });
    }

    return route.continue();
  });

  await page.goto('/create');

  await page.getByPlaceholder('Enter quiz title').fill('My New Quiz');
  await page.getByPlaceholder('Enter quiz description').fill('Test description');

  await page.getByRole('button', { name: '+ True/False' }).click();
  await page.getByPlaceholder('Enter your question').fill('Is sky blue?');

  await page.getByRole('button', { name: 'Create Quiz' }).click();

  // Після успішного POST CreateQuiz робить navigate('/quizzes')
  await expect(page).toHaveURL(/\/quizzes/);
  await expect(page.getByText('My New Quiz')).toBeVisible();
});