import { expect } from '@playwright/test';
import { test } from './fixtures';
import { createIncident } from './playwright.setup';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
const WEB_BASE_URL = process.env.NEXT_PUBLIC_WEB_BASE_URL ?? 'http://localhost:3000';

test.describe('T020 - Live incident dashboard', () => {
  test.beforeEach(async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/public/incidents`);
    expect(response.ok()).toBeTruthy();
  });

  test('shows newly submitted incidents in the feed', async ({ page, waitForIncidentCard }) => {
    await page.goto(`${WEB_BASE_URL}/incidents`);

    await expect(page.getByText('Live Incident Feed')).toBeVisible();

    const submission = await createIncident(API_BASE_URL, {
      type: 'Playwright Report',
      description: 'Smoke observed near test environment',
      severity: 'high',
      address: '123 Automation Ave'
    });

    await waitForIncidentCard({ incidentId: submission.incidentId, timeout: 15_000 });

    const card = page.locator(`[data-testid="incident-card-${submission.incidentId}"]`);

    await expect(card.locator('h2')).toHaveText('Playwright Report');
    await expect(card).toContainText('Severity: HIGH');
    await expect(card).toContainText('123 Automation Ave');
  });
});
