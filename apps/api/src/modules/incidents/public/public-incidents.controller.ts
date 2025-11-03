import { Body, Controller, Get, Headers, Ip, Post, UseGuards } from '@nestjs/common';
import { CreatePublicIncidentDto } from './dto/create-public-incident.dto';
import { PublicIncidentResponseDto } from './dto/public-incident-response.dto';
import { PublicIncidentsService } from './public-incidents.service';
import { PublicRateLimitGuard } from '../../../common/rate-limit/public-rate-limit.guard';

@Controller('public/incidents')
export class PublicIncidentsController {
  constructor(private readonly publicIncidentsService: PublicIncidentsService) {}

  @Post()
  @UseGuards(PublicRateLimitGuard)
  async create(
    @Body() dto: CreatePublicIncidentDto,
    @Ip() ip: string | undefined,
    @Headers('x-device-fingerprint') fingerprint: string | undefined
  ): Promise<PublicIncidentResponseDto> {
    return this.publicIncidentsService.createPublicIncident(dto, fingerprint ?? ip);
  }

  @Get()
  async list() {
    return this.publicIncidentsService.listRecentIncidents();
  }
}
