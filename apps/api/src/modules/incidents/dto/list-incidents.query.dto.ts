import { IncidentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListIncidentsQueryDto {
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  /**
   * Bounding box in the format minLon,minLat,maxLon,maxLat
   */
  @IsOptional()
  @IsString()
  bbox?: string;

  /**
   * ISO-8601 timestamp limiting results to incidents updated since this moment
   */
  @IsOptional()
  @IsString()
  since?: string;
}
