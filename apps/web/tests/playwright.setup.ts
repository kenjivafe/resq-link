import { request, type APIRequestContext } from '@playwright/test';

interface CreateIncidentPayload {
  type: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  severity?: string;
  deviceFingerprint?: string;
}

interface CreateIncidentResponse {
  incidentId: string;
  status: string;
  severity: string;
  submittedAt: string;
}

export async function createIncident(baseURL: string, payload: CreateIncidentPayload): Promise<CreateIncidentResponse> {
  const context: APIRequestContext = await request.newContext();

  try {
    const response = await context.post(`${baseURL}/public/incidents`, {
      headers: {
        'content-type': 'application/json',
        'x-device-fingerprint': payload.deviceFingerprint ?? 'playwright-suite'
      },
      data: {
        type: payload.type,
        description: payload.description ?? 'Filed via Playwright harness',
        latitude: payload.latitude ?? 14.5995,
        longitude: payload.longitude ?? 120.9842,
        address: payload.address ?? 'Playwright Plaza',
        severity: payload.severity ?? 'medium'
      }
    });

    if (!response.ok()) {
      throw new Error(`Failed to create incident: ${response.status()} ${response.statusText()}`);
    }

    return (await response.json()) as CreateIncidentResponse;
  } finally {
    await context.dispose();
  }
}
