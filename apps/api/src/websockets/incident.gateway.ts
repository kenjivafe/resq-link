import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server } from 'socket.io';

export interface IncidentCreatedPayload {
  id: string;
  type: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  status: string;
  severity: string;
  createdAt: Date;
}

@Injectable()
@WebSocketGateway({ namespace: 'incidents', cors: { origin: '*' } })
export class IncidentGateway {
  @WebSocketServer()
  private readonly server!: Server;

  broadcastIncidentCreated(payload: IncidentCreatedPayload): void {
    this.server.emit('incident.created', payload);
  }
}
