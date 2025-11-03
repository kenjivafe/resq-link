import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreatePublicIncidentDto,
  PublicIncidentSeverity
} from './dto/create-public-incident.dto';
import { PublicIncidentResponseDto } from './dto/public-incident-response.dto';
import { IncidentGateway } from '../../../websockets/incident.gateway';
import type { IncidentCreatedPayload } from '../../../websockets/incident.gateway';

@Injectable()
export class PublicIncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly incidentGateway: IncidentGateway
  ) {}

  async createPublicIncident(
    dto: CreatePublicIncidentDto,
    deviceFingerprint?: string | null
  ): Promise<PublicIncidentResponseDto> {
    const severity: PublicIncidentSeverity = dto.severity ?? 'medium';

    const incident = await this.prisma.incident.create({
      data: {
        type: dto.type,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        severity,
        deviceFingerprint: deviceFingerprint ?? null,
        reporterId: null
      }
    });

    const response: PublicIncidentResponseDto = {
      incidentId: incident.id,
      status: incident.status as PublicIncidentResponseDto['status'],
      severity: incident.severity as PublicIncidentResponseDto['severity'],
      submittedAt: incident.createdAt
    };

    const payload: IncidentCreatedPayload = {
      id: incident.id,
      type: incident.type,
      description: incident.description,
      latitude: incident.latitude?.toNumber?.() ?? (incident.latitude as number | null) ?? null,
      longitude: incident.longitude?.toNumber?.() ?? (incident.longitude as number | null) ?? null,
      address: incident.address ?? null,
      status: incident.status,
      severity: incident.severity,
      createdAt: incident.createdAt
    };

    this.incidentGateway.broadcastIncidentCreated(payload);

    return response;
  }

  async listRecentIncidents(): Promise<IncidentCreatedPayload[]> {
    const incidents = await this.prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return incidents.map((incident) => ({
      id: incident.id,
      type: incident.type,
      description: incident.description ?? null,
      latitude: incident.latitude?.toNumber?.() ?? (incident.latitude as number | null) ?? null,
      longitude: incident.longitude?.toNumber?.() ?? (incident.longitude as number | null) ?? null,
      address: incident.address ?? null,
      status: incident.status,
      severity: incident.severity,
      createdAt: incident.createdAt
    }));
  }
}
