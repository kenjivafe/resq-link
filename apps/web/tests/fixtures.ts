import { test as base } from '@playwright/test';

interface IncidentHelpers {
  waitForIncidentCard: (options: { incidentId: string; timeout?: number }) => Promise<void>;
}

export const test = base.extend<IncidentHelpers>({
  waitForIncidentCard: async ({ page }, use) => {
    await use(async ({ incidentId, timeout = 10_000 }) => {
      await page.waitForSelector(`[data-testid="incident-card-${incidentId}"]`, { timeout });
    });
  }
});

export const expect = test.expect;
