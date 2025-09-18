import { Page, request } from '@playwright/test';

export async function login(page: Page, email = 'testuser@test.com') {
  const requestContext = await request.newContext();
  const response = await requestContext.post('http://localhost:3000/api/auth/e2e-login', {
    data: { email },
  });

  const sessionCookie = response.headers()['set-cookie'];
  if (!sessionCookie) {
    throw new Error('Failed to get session cookie from mock login API');
  }

  const cookies = sessionCookie.split(';').map(c => {
    const [name, value] = c.trim().split('=');
    return { name, value, domain: 'localhost', path: '/' };
  });

  await page.context().addCookies(cookies);
}
