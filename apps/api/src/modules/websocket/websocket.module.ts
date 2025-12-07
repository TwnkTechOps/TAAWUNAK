import {Module} from '@nestjs/common';
import {CommunicationGateway} from './websocket.gateway';
import {PrismaService} from '../../services/prisma.service';
import {JwtModule} from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [CommunicationGateway, PrismaService],
  exports: [CommunicationGateway],
})
export class WebSocketModule {}

