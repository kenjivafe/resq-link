import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

export interface AssignmentNotificationInput {
  userId: string;
  incidentId: string;
  priority: 'normal' | 'urgent';
  message?: string | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendAssignmentNotification(input: AssignmentNotificationInput): Promise<void> {
    const payload: Prisma.JsonObject = {
      title: input.priority === 'urgent' ? 'Urgent incident assignment' : 'Incident assignment',
      body: input.message ?? 'You have been assigned to respond to an incident.',
      priority: input.priority
    } satisfies Prisma.JsonObject;

    await this.prisma.notificationLog.create({
      data: {
        userId: input.userId,
        incidentId: input.incidentId,
        channel: 'push',
        status: 'pending',
        payload
      }
    });

    this.logger.log(`Queued assignment notification for user ${input.userId}`);
  }
}
