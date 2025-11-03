export type AssignmentStatus = 'pending' | 'acknowledged' | 'declined' | 'completed';
export type AssignmentPriority = 'normal' | 'urgent';

export class AssignmentResponseDto {
  id!: string;
  incidentId!: string;
  responderId!: string;
  assignedBy!: string | null;
  status!: AssignmentStatus;
  assignedAt!: string;
  acknowledgedAt!: string | null;
  completedAt!: string | null;
  message!: string | null;
  priority!: AssignmentPriority;
}
