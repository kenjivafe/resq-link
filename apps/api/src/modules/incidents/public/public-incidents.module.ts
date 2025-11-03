import { Module } from '@nestjs/common';
import { PublicIncidentsController } from './public-incidents.controller';
import { PublicIncidentsService } from './public-incidents.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { RateLimitService } from '../../../common/rate-limit/rate-limit.service';
import { PublicRateLimitGuard } from '../../../common/rate-limit/public-rate-limit.guard';
import { IncidentGateway } from '../../../websockets/incident.gateway';

@Module({
  controllers: [PublicIncidentsController],
  providers: [
    PublicIncidentsService,
    PrismaService,
    RateLimitService,
    PublicRateLimitGuard,
    IncidentGateway
  ]
})
export class PublicIncidentsModule {}
