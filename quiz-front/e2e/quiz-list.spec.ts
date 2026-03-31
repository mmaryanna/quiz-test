import { test, expect } from '@playwright/test';

test('Quiz list: сторінка відкривається і є кнопка Create', async ({ page }) => {
  // Перехоплюємо всі мережеві запити типу fetch/xhr і підставляємо відповідь для GET
  await page.route('**/*', async (route) => {
    const req = route.request();

    // Не чіпаємо завантаження html/css/js картинок — тільки API (fetch/xhr)
    if (!['fetch', 'xhr'].includes(req.resourceType())) {
      return route.continue();
    }

    if (req.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            title: 'Demo Quiz',
            description: 'Demo',
            questionCount: 3,
            createdAt: new Date().toISOString(),
          },
        ]),
      });
    }

    return route.continue();
  });

  await page.goto('/quizzes');

  // Заголовок і кнопка створення
  await expect(page.locator('h1')).toHaveText('All Quizzes');
  await expect(page.getByRole('button', { name: 'Create New Quiz' })).toBeVisible();

  // Елемент списку
  await expect(page.getByText('Demo Quiz')).toBeVisible();
});