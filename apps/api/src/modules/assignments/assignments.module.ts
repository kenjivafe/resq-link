import { Module } from '@nestjs/common';

import { DispatcherAuthGuard } from '../../common/guards/dispatcher-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { IncidentGateway } from '../../websockets/incident.gateway';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, PrismaService, DispatcherAuthGuard, IncidentGateway]
})
export class AssignmentsModule {}
