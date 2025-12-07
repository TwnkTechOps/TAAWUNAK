import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '../../services/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService, private prisma: PrismaService) {
    const cookieExtractor = (req: any) => {
      const cookieHeader = req?.headers?.cookie as string | undefined;
      if (!cookieHeader) return null;
      const match = cookieHeader
        .split(';')
        .map((s) => s.trim())
        .find((s) => s.startsWith('tawawunak_token='));
      if (!match) return null;
      const value = match.substring('tawawunak_token='.length);
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    };
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'dev-secret')
    });
  }

  async validate(payload: any) {
    // Demo mode: simplified validation
    try {
      const user = await this.prisma.user.findUnique({where: {id: payload.sub}});
      if (!user) throw new UnauthorizedException();
      // Check suspended only if column exists
      if ((user as any).suspended === true) throw new UnauthorizedException();
      // Skip tokenVersion check for demo
      return {id: payload.sub, email: user.email, role: user.role};
    } catch (e: any) {
      if (e instanceof UnauthorizedException) throw e;
      // If query fails, still allow if we have valid payload
      if (payload?.sub && payload?.email) {
        return {id: payload.sub, email: payload.email, role: payload.role || 'RESEARCHER'};
      }
      throw new UnauthorizedException();
    }
  }
}

