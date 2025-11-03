import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { DispatcherAuthGuard } from '../../common/guards/dispatcher-auth.guard';
import { NotificationsService } from './notifications.service';

interface TestNotificationRequest {
  userId: string;
  incidentId: string;
  priority?: 'normal' | 'urgent';
  message?: string;
}

@Controller('api/notifications')
@UseGuards(DispatcherAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('test')
  async sendTestNotification(@Body() body: TestNotificationRequest): Promise<void> {
    await this.notificationsService.sendAssignmentNotification({
      userId: body.userId,
      incidentId: body.incidentId,
      priority: body.priority ?? 'normal',
      message: body.message ?? null
    });
  }
}
