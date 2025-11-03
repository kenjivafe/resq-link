import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export const AssignmentPriorityOptions = ['normal', 'urgent'] as const;
export type AssignmentPriority = (typeof AssignmentPriorityOptions)[number];

export class CreateAssignmentDto {
  @IsUUID()
  responderId!: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  message?: string;

  @IsOptional()
  @IsString()
  @IsEnum(AssignmentPriorityOptions)
  priority?: AssignmentPriority;
}
