import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export const PublicIncidentSeverityEnum = ['low', 'medium', 'high', 'critical'] as const;
export type PublicIncidentSeverity = (typeof PublicIncidentSeverityEnum)[number];

export class CreatePublicIncidentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @Transform(({ value }: { value?: string | number }) =>
    value === undefined || value === null || value === '' ? undefined : Number(value)
  )
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @Transform(({ value }: { value?: string | number }) =>
    value === undefined || value === null || value === '' ? undefined : Number(value)
  )
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  address?: string;

  @IsOptional()
  @IsEnum(PublicIncidentSeverityEnum)
  severity?: PublicIncidentSeverity;
}
