import { Module } from '@nestjs/common';

import { DispatcherAuthGuard } from '../../common/guards/dispatcher-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService, DispatcherAuthGuard],
  exports: [NotificationsService]
})
export class NotificationsModule {}
