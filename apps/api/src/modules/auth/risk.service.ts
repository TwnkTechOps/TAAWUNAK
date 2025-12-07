import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../services/prisma.service';

export interface RiskScore {
  score: number; // 0-100, higher = more risky
  factors: string[];
  requiresMfa: boolean;
}

@Injectable()
export class RiskService {
  constructor(private readonly prisma: PrismaService) {
    if (!this.prisma) {
      throw new Error('PrismaService is required');
    }
  }

  async calculateRisk(
    userId: string,
    ip?: string,
    ua?: string,
    deviceId?: string,
    isNewDevice?: boolean
  ): Promise<RiskScore> {
    const factors: string[] = [];
    let score = 0;

    // DEMO MODE: Skip adaptive MFA for easier demo
    const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';
    if (isDemoMode && process.env.DISABLE_ADAPTIVE_MFA === 'true') {
      return {score: 0, factors: [], requiresMfa: false};
    }

    // Safety check
    if (!this.prisma) {
      // Fallback: basic risk assessment without database
      if (isNewDevice) {
        return {score: 30, factors: ['new_device'], requiresMfa: true};
      }
      return {score: 0, factors: [], requiresMfa: false};
    }

    try {
      // Check if device is known
      if (isNewDevice) {
        score += 30;
        factors.push('new_device');
      } else if (deviceId && this.prisma?.device) {
        try {
          const device = await this.prisma.device.findUnique({
            where: {userId_deviceId: {userId, deviceId}}
          });
          if (device?.revoked) {
            score += 50;
            factors.push('revoked_device');
          }
        } catch (e) {
          // Device table might not exist
        }
      }

      // Check login velocity (recent logins) - defensive
      if (this.prisma?.auditEvent) {
        try {
          const recentLogins = await this.prisma.auditEvent.count({
            where: {
              actorUserId: userId,
              action: 'LOGIN',
              createdAt: {gte: new Date(Date.now() - 60 * 60 * 1000)} // Last hour
            }
          });
          if (recentLogins > 5) {
            score += 25;
            factors.push('high_velocity');
          }
        } catch (e) {
          // Audit table might not exist
        }
      }

      // Check IP changes (if we have previous IPs)
      if (ip && this.prisma?.device) {
        try {
          const recentDevices = await this.prisma.device.findMany({
            where: {userId, revoked: false},
            orderBy: {lastSeen: 'desc'},
            take: 5
          });
          const knownIPs = new Set(recentDevices.map(d => d.ip).filter(Boolean));
          if (knownIPs.size > 0 && !knownIPs.has(ip)) {
            score += 20;
            factors.push('ip_change');
          }
        } catch (e) {
          // Device table might not exist
        }
      }

      // Time-of-day analysis (unusual hours)
      const hour = new Date().getHours();
      if (hour < 6 || hour > 23) {
        score += 10;
        factors.push('unusual_time');
      }

      // Check for suspicious patterns - defensive
      if (this.prisma?.auditEvent) {
        try {
          const suspiciousActions = await this.prisma.auditEvent.count({
            where: {
              actorUserId: userId,
              action: {in: ['LOGIN_FAILED', 'MFA_FAILED']},
              createdAt: {gte: new Date(Date.now() - 24 * 60 * 60 * 1000)} // Last 24h
            }
          });
          if (suspiciousActions > 3) {
            score += 30;
            factors.push('suspicious_pattern');
          }
        } catch (e) {
          // Audit table might not exist
        }
      }

      // User account status
      if (this.prisma?.user) {
        try {
          const user = await this.prisma.user.findUnique({where: {id: userId}});
          if (user && (user as any).suspended) {
            score = 100;
            factors.push('account_suspended');
          }
        } catch (e) {
          // User query failed
        }
      }
    } catch (error) {
      // If database queries fail, use basic risk assessment
      console.error('Risk calculation error:', error);
      if (isNewDevice) {
        score = 30;
        factors.push('new_device');
      }
    }

    const requiresMfa = score >= 30 || isNewDevice || factors.includes('revoked_device');

    return {score: Math.min(score, 100), factors, requiresMfa};
  }

  async getDeviceFingerprint(ua?: string, ip?: string): Promise<string> {
    // Simple fingerprint based on UA and IP
    const parts = [
      ua || 'unknown',
      ip || 'unknown'
    ];
    return Buffer.from(parts.join('|')).toString('base64').substring(0, 32);
  }
}

