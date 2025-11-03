import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { IncidentGateway, IncidentCreatedPayload } from '../../websockets/incident.gateway';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly incidentGateway: IncidentGateway
  ) {}

  async createAssignment(
    incidentId: string,
    payload: CreateAssignmentDto,
    dispatcherId: string | null
  ): Promise<AssignmentResponseDto> {
    if (incidentId !== incidentId.trim()) {
      throw new BadRequestException('Incident identifier cannot contain leading or trailing whitespace');
    }

    const { assignment, updatedIncident } = await this.prisma.$transaction(async (tx) => {
      const incident = await tx.incident.findUnique({ where: { id: incidentId } });

      if (!incident) {
        throw new NotFoundException(`Incident ${incidentId} not found`);
      }

      const assignment = await tx.assignment.create({
        data: {
          incidentId,
          responderId: payload.responderId,
          assignedBy: dispatcherId,
          assignedAt: new Date(),
          message: payload.message ?? null,
          priority: payload.priority ?? 'normal',
          status: 'pending'
        } as Prisma.AssignmentUncheckedCreateInput
      });

      const updatedIncident = await tx.incident.update({
        where: { id: incidentId },
        data: { status: 'assigned' }
      });

      return { assignment, updatedIncident };
    });

    const record = assignment as unknown as {
      id: string;
      incidentId: string;
      responderId: string;
      assignedBy: string | null;
      assignedAt: Date;
      acceptedAt: Date | null;
      completedAt: Date | null;
      message: string | null;
      priority: 'normal' | 'urgent';
      status: 'pending' | 'acknowledged' | 'declined' | 'completed';
    };

    const response: AssignmentResponseDto = {
      id: record.id,
      incidentId: record.incidentId,
      responderId: record.responderId,
      assignedBy: record.assignedBy,
      status: record.status,
      assignedAt: record.assignedAt.toISOString(),
      acknowledgedAt: record.acceptedAt?.toISOString() ?? null,
      completedAt: record.completedAt?.toISOString() ?? null,
      message: record.message ?? null,
      priority: record.priority
    };

    await this.sendAssignmentNotification({
      responderId: record.responderId,
      incidentId: record.incidentId,
      message: payload.message,
      priority: payload.priority ?? 'normal'
    });

    this.broadcastIncidentUpdate(updatedIncident);

    return response;
  }

  private async sendAssignmentNotification(params: { responderId: string; incidentId: string; message?: string | null; priority: 'normal' | 'urgent' }): Promise<void> {
    try {
      await this.notificationsService.sendAssignmentNotification({
        userId: params.responderId,
        incidentId: params.incidentId,
        priority: params.priority,
        message: params.message ?? null
      });
    } catch (error) {
      this.logger.warn(`Failed to queue assignment notification: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  private broadcastIncidentUpdate(incident: { id: string; type: string; description: string | null; latitude: unknown; longitude: unknown; address: string | null; status: string; severity: string; createdAt: Date }): void {
    const payload: IncidentCreatedPayload = {
      id: incident.id,
      type: incident.type,
      description: incident.description,
      latitude: this.coerceNumber(incident.latitude),
      longitude: this.coerceNumber(incident.longitude),
      address: incident.address,
      status: incident.status,
      severity: incident.severity,
      createdAt: incident.createdAt
    };

    this.incidentGateway.broadcastIncidentCreated(payload);
  }

  private coerceNumber(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
      return (value as { toNumber: () => number }).toNumber();
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
