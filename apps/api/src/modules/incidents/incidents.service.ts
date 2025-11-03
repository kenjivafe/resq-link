import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { ListIncidentsQueryDto } from './dto/list-incidents.query.dto';

interface IncidentSummary {
  id: string;
  type: string;
  status: string;
  severity: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  reportedAt: string;
  updatedAt: string;
}

interface ListIncidentsResponse {
  incidents: IncidentSummary[];
}

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listIncidents(query: ListIncidentsQueryDto): Promise<ListIncidentsResponse> {
    const filters: Prisma.IncidentWhereInput[] = [];

    if (query.status) {
      filters.push({ status: query.status });
    }

    if (query.since) {
      const sinceDate = new Date(query.since);
      if (Number.isNaN(sinceDate.getTime())) {
        throw new BadRequestException('Invalid since parameter. Expected ISO-8601 string.');
      }
      filters.push({ updatedAt: { gte: sinceDate } });
    }

    if (query.bbox) {
      const coordinates = query.bbox.split(',').map((value) => Number(value.trim()));

      if (coordinates.length !== 4 || coordinates.some((value) => Number.isNaN(value))) {
        throw new BadRequestException('Invalid bbox parameter. Use minLon,minLat,maxLon,maxLat.');
      }

      const [minLon, minLat, maxLon, maxLat] = coordinates;

      if (minLon > maxLon || minLat > maxLat) {
        throw new BadRequestException('Invalid bbox parameter. Ensure min values are less than max values.');
      }

      filters.push({
        latitude: {
          gte: minLat,
          lte: maxLat
        }
      });

      filters.push({
        longitude: {
          gte: minLon,
          lte: maxLon
        }
      });
    }

    const where: Prisma.IncidentWhereInput | undefined = filters.length ? { AND: filters } : undefined;

    const incidents = await this.prisma.incident.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 200
    });

    const asNumber = (value: Prisma.Decimal | number | null): number | null => {
      if (value === null || value === undefined) {
        return null;
      }

      return typeof value === 'number' ? value : Number(value);
    };

    const summaries: IncidentSummary[] = incidents.map((incident) => ({
      id: incident.id,
      type: incident.type,
      status: incident.status,
      severity: incident.severity,
      description: incident.description ?? null,
      address: incident.address ?? null,
      latitude: asNumber(incident.latitude),
      longitude: asNumber(incident.longitude),
      reportedAt: incident.createdAt.toISOString(),
      updatedAt: incident.updatedAt.toISOString()
    }));

    return { incidents: summaries };
  }
}
