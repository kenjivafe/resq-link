import { Module } from '@nestjs/common';

import { DispatcherAuthGuard } from '../../common/guards/dispatcher-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';

@Module({
  controllers: [IncidentsController],
  providers: [IncidentsService, PrismaService, DispatcherAuthGuard]
})
export class IncidentsModule {}
