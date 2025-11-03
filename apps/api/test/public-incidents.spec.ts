import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'node:crypto';

import { PublicIncidentsModule } from '../src/modules/incidents/public/public-incidents.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { RateLimitService } from '../src/common/rate-limit/rate-limit.service';
import { PublicRateLimitGuard } from '../src/common/rate-limit/public-rate-limit.guard';
import { IncidentGateway, type IncidentCreatedPayload } from '../src/websockets/incident.gateway';

interface IncidentRecord {
  id: string;
  type: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  status: string;
  severity: string;
  reporterId: string | null;
  deviceFingerprint: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PublicIncidentResponseBody {
  incidentId: string;
  status: string;
  severity: string;
  submittedAt: string;
}

interface IncidentListItem {
  id: string;
  type: string;
  description: string | null;
  address: string | null;
  severity: string;
  status: string;
}

interface ErrorResponseBody {
  message?: unknown;
  error?: string;
}

function assertIsObject(value: unknown): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    throw new Error('Expected response to be an object');
  }
}

function assertIsPublicIncidentResponseBody(value: unknown): asserts value is PublicIncidentResponseBody {
  assertIsObject(value);
  const { incidentId, status, severity, submittedAt } = value;
  if (typeof incidentId !== 'string' || typeof status !== 'string' || typeof severity !== 'string' || typeof submittedAt !== 'string') {
    throw new Error('Unexpected incident response shape');
  }
}

function assertIsIncidentList(value: unknown): asserts value is IncidentListItem[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected list response to be an array');
  }

  for (const item of value) {
    assertIsObject(item);
    const { id, type, description, address, severity, status } = item;
    if (
      typeof id !== 'string' ||
      typeof type !== 'string' ||
      (description !== null && typeof description !== 'string') ||
      (address !== null && typeof address !== 'string') ||
      typeof severity !== 'string' ||
      typeof status !== 'string'
    ) {
      throw new Error('Unexpected incident list item');
    }
  }
}

function assertIsErrorResponseBody(value: unknown): asserts value is ErrorResponseBody {
  assertIsObject(value);
  const { error } = value;
  if (error !== undefined && typeof error !== 'string') {
    throw new Error('Unexpected error response shape');
  }
}

function parsePublicIncidentResponseBody(value: unknown): PublicIncidentResponseBody {
  assertIsPublicIncidentResponseBody(value);
  return value;
}

function parseIncidentList(value: unknown): IncidentListItem[] {
  assertIsIncidentList(value);
  return value;
}

function parseErrorResponseBody(value: unknown): ErrorResponseBody {
  assertIsErrorResponseBody(value);
  return value;
}

class InMemoryPrismaService {
  private incidents: IncidentRecord[] = [];

  incident = {
    create: ({ data }: { data: Partial<IncidentRecord> }): Promise<IncidentRecord> => {
      const now = new Date();
      const record: IncidentRecord = {
        id: randomUUID(),
        type: data.type ?? 'Unknown',
        description: data.description ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        address: data.address ?? null,
        status: data.status ?? 'pending',
        severity: data.severity ?? 'medium',
        reporterId: data.reporterId ?? null,
        deviceFingerprint: data.deviceFingerprint ?? null,
        createdAt: now,
        updatedAt: now
      };

      this.incidents.push(record);
      return Promise.resolve(record);
    },
    findMany: ({ orderBy, take }: { orderBy?: { createdAt: 'desc' | 'asc' }; take?: number }): Promise<IncidentRecord[]> => {
      let records = [...this.incidents];

      if (orderBy?.createdAt === 'desc') {
        records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else if (orderBy?.createdAt === 'asc') {
        records.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }

      if (typeof take === 'number') {
        records = records.slice(0, take);
      }

      return Promise.resolve(records);
    }
  };
}

class NoopRateLimitService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async ensureWithinLimit(): Promise<void> {}
}

describe('Public Incidents API (integration)', () => {
  let app: INestApplication;
  let prisma: InMemoryPrismaService;
  let broadcastSpy: jest.Mock;

  beforeEach(async () => {
    prisma = new InMemoryPrismaService();
    broadcastSpy = jest.fn();

    const moduleRef = await Test.createTestingModule({
      imports: [PublicIncidentsModule]
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(RateLimitService)
      .useClass(NoopRateLimitService)
      .overrideProvider(PublicRateLimitGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(IncidentGateway)
      .useValue({ broadcastIncidentCreated: broadcastSpy })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates an incident, emits broadcast, and surfaces in list', async () => {
    const payload = {
      type: 'Residential Fire',
      description: 'Smoke visible from second floor',
      latitude: 14.5995,
      longitude: 120.9842,
      address: '123 Sample Street',
      severity: 'high'
    };

    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const createResponse = await request(server)
      .post('/public/incidents')
      .set('x-device-fingerprint', 'device-123')
      .send(payload)
      .expect(201);

    const createBody = parsePublicIncidentResponseBody(createResponse.body);

    expect(typeof createBody.incidentId).toBe('string');
    expect(createBody.status).toBe('pending');
    expect(createBody.severity).toBe('high');
    expect(typeof createBody.submittedAt).toBe('string');

    expect(broadcastSpy).toHaveBeenCalledTimes(1);
    const [eventPayload] = broadcastSpy.mock.calls[0] as [IncidentCreatedPayload];
    expect(eventPayload).toMatchObject({
      id: createBody.incidentId,
      type: payload.type,
      description: payload.description,
      address: payload.address,
      severity: payload.severity,
      status: 'pending'
    });
    expect(new Date(eventPayload.createdAt).toString()).not.toBe('Invalid Date');

    const listResponse = await request(server).get('/public/incidents').expect(200);

    const listBody = parseIncidentList(listResponse.body);

    expect(listBody).toHaveLength(1);
    expect(listBody[0]).toMatchObject({
      id: createBody.incidentId,
      type: payload.type,
      description: payload.description,
      address: payload.address,
      severity: payload.severity,
      status: 'pending'
    });
  });

  it('rejects invalid submissions', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server).post('/public/incidents').send({}).expect(400);

    const responseBody = parseErrorResponseBody(response.body);

    expect(responseBody.message).toBeDefined();
    expect(responseBody.error).toBe('Bad Request');
  });
});
