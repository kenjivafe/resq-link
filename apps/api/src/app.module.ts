import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { HealthController } from './health/health.controller';
import { PublicIncidentsModule } from './modules/incidents/public/public-incidents.module';
import { IncidentGateway } from './websockets/incident.gateway';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PublicIncidentsModule,
    IncidentsModule,
    AssignmentsModule
  ],
  controllers: [HealthController],
  providers: [PrismaService, IncidentGateway]
})
export class AppModule {}
