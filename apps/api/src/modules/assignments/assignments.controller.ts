import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';

import { DispatcherAuthGuard } from '../../common/guards/dispatcher-auth.guard';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AssignmentResponseDto } from './dto/assignment-response.dto';

interface DispatcherRequest {
  headers: Record<string, string | undefined>;
}

@Controller('api/incidents/:incidentId/assign')
@UseGuards(DispatcherAuthGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  async create(
    @Param('incidentId') incidentId: string,
    @Body() body: CreateAssignmentDto,
    @Req() request: DispatcherRequest
  ): Promise<AssignmentResponseDto> {
    const dispatcherId = request.headers['x-dispatcher-id'] ?? null;

    return this.assignmentsService.createAssignment(incidentId, body, dispatcherId);
  }
}
