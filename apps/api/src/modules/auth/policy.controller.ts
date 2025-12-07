import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from './jwt.guard';
import {RolesGuard} from './roles.guard';
import {Roles} from './roles.decorator';
import {getPolicyMatrix, setPolicyMatrix, PolicyMatrix} from './policy.config';

@Controller('policy')
export class PolicyController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  get() {
    return getPolicyMatrix();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  set(@Body() body: {matrix?: PolicyMatrix}) {
    setPolicyMatrix(body?.matrix || {});
    return getPolicyMatrix();
  }
}


