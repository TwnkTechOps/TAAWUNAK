import {Module} from '@nestjs/common';
import {UsersController} from './users.controller';
import {UsersService} from './users.service';
import {PrismaService} from '../../services/prisma.service';
import {RolesGuard} from '../auth/roles.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, RolesGuard],
  exports: [UsersService]
})
export class UsersModule {}

