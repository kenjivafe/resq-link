import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class PublicRateLimitGuard implements CanActivate {
  constructor(private readonly rateLimitService: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined>; ip?: string; socket: { remoteAddress?: string | null } }>();
    const fingerprint = (request.headers['x-device-fingerprint'] as string | undefined) ?? null;
    const clientIp = request.ip ?? request.socket.remoteAddress ?? undefined;

    try {
      await this.rateLimitService.ensureWithinLimit(clientIp, fingerprint);
      return true;
    } catch {
      throw new HttpException('Too many submissions. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
