import { PublicIncidentSeverity } from './create-public-incident.dto';

type PublicIncidentStatus = 'pending' | 'assigned' | 'responding' | 'resolved' | 'escalated';

export class PublicIncidentResponseDto {
  incidentId!: string;
  status!: PublicIncidentStatus;
  severity!: PublicIncidentSeverity;
  submittedAt!: Date;
}
