import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RateLimitService {
  private readonly windowMs = 60_000;
  private readonly maxRequests = 5;

  constructor(private readonly prisma: PrismaService) {}

  async ensureWithinLimit(ip: string | undefined, fingerprint: string | null): Promise<void> {
    const now = new Date();
    const ipHash = ip ? this.hash(ip) : null;

    let record = null;

    if (fingerprint) {
      record = await this.prisma.rateLimitRecord.findUnique({ where: { deviceFingerprint: fingerprint } });
    }

    if (!record && ipHash) {
      record = await this.prisma.rateLimitRecord.findFirst({ where: { ipHash } });
    }

    if (!record) {
      await this.prisma.rateLimitRecord.create({
        data: {
          deviceFingerprint: fingerprint,
          ipHash: ipHash ?? this.hash('anonymous'),
          windowStart: now,
          requestCount: 1,
          captchaRequired: false,
          lastAttemptAt: now
        }
      });
      return;
    }

    const windowStartExpired = now.getTime() - record.windowStart.getTime() > this.windowMs;
    const nextWindowStart = windowStartExpired ? now : record.windowStart;
    const nextCount = windowStartExpired ? 1 : record.requestCount + 1;
    const captchaRequired = nextCount > this.maxRequests;

    await this.prisma.rateLimitRecord.update({
      where: { id: record.id },
      data: {
        deviceFingerprint: fingerprint ?? record.deviceFingerprint,
        ipHash: ipHash ?? record.ipHash,
        windowStart: nextWindowStart,
        requestCount: nextCount,
        captchaRequired,
        lastAttemptAt: now
      }
    });

    if (captchaRequired) {
      throw new HttpException('Too many submissions. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
