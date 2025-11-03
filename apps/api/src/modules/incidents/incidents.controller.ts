import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { DispatcherAuthGuard } from '../../common/guards/dispatcher-auth.guard';
import { IncidentsService } from './incidents.service';
import { ListIncidentsQueryDto } from './dto/list-incidents.query.dto';

@Controller('api/incidents')
@UseGuards(DispatcherAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  async list(@Query() query: ListIncidentsQueryDto) {
    return this.incidentsService.listIncidents(query);
  }
}
