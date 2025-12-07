import {Body, Controller, Delete, Get, HttpException, HttpStatus, Patch, Post, Param, Query, Request, UseGuards} from '@nestjs/common';
import {UsersService} from './users.service';
import {JwtAuthGuard} from '../auth/jwt.guard';
import {Roles} from '../auth/roles.decorator';
import {RolesGuard} from '../auth/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private svc: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    return this.svc.getById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Request() req: any, @Body() body: {fullName?: string; locale?: string; timeZone?: string}) {
    return this.svc.updateMe(req.user.id, body);
  }

  // Admin: list users (search by email/name)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  async list(@Query('q') q?: string) {
    return this.svc.adminList(q);
  }

  // Admin: update role
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async adminUpdate(@Param('id') id: string, @Body() body: {role?: string}) {
    return this.svc.adminUpdate(id, body);
  }

  // Admin: reset MFA for a user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/reset-mfa')
  async resetMfa(@Param('id') id: string) {
    return this.svc.resetMfa(id);
  }

  // Admin: suspend/restore
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/suspend')
  async suspend(@Param('id') id: string, @Body() body: {suspended: boolean}) {
    return this.svc.setSuspended(id, !!body?.suspended);
  }

  // Admin: revoke all sessions (bump token version)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/revoke-sessions')
  async revoke(@Param('id') id: string) {
    return this.svc.revokeSessions(id);
  }

  // Admin: delete user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.svc.delete(id);
    } catch (error: any) {
      const message = error?.message || 'Failed to delete user';
      throw new HttpException(
        {statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message},
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

