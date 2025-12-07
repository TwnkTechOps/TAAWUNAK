import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {OidcController} from './oidc.controller';
import {NafathController} from './nafath.controller';
import {SamlController} from './saml.controller';
import {PolicyController} from './policy.controller';
import {PrismaService} from '../../services/prisma.service';
import {JwtStrategy} from './jwt.strategy';
import { MailService } from '../../services/mail.service';
import { RiskService } from './risk.service';
import { MfaModule } from '../mfa/mfa.module';

@Module({
  imports: [
    ConfigModule,
    MfaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret'),
        signOptions: {expiresIn: '7d'}
      })
    })
  ],
  controllers: [AuthController, OidcController, NafathController, SamlController, PolicyController],
  providers: [AuthService, PrismaService, JwtStrategy, MailService, RiskService],
  exports: [AuthService, RiskService]
})
export class AuthModule {}

