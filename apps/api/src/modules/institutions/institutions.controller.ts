import {Body, Controller, Get, Param, Patch, Post, UseGuards, Request} from '@nestjs/common';
import {InstitutionsService} from './institutions.service';
import {JwtAuthGuard} from '../auth/jwt.guard';
import {InstitutionAdminGuard} from '../auth/roles.guard';
import {Policy} from '../auth/policy.decorator';
import {PolicyGuard} from '../auth/policy.guard';

@Controller('institutions')
export class InstitutionsController {
  constructor(private svc: InstitutionsService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() body: {name: string; type: string; domain?: string}) {
    return this.svc.create({...body, createdById: req.user.id});
  }

  @UseGuards(JwtAuthGuard, InstitutionAdminGuard, PolicyGuard)
  @Policy('institutions:verify')
  @Patch(':id/verify')
  verify(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: {verified: boolean; evidenceUrl?: string; note?: string}
  ) {
    return this.svc.verify(id, body, req.user.id);
  }

  // Org units
  @UseGuards(JwtAuthGuard, InstitutionAdminGuard)
  @Get(':id/units')
  listUnits(@Param('id') id: string) {
    return this.svc.listUnits(id);
  }

  @UseGuards(JwtAuthGuard, InstitutionAdminGuard)
  @Post(':id/units')
  createUnit(@Param('id') id: string, @Body() body: {name: string; parentId?: string}) {
    return this.svc.createUnit(id, body.name, body.parentId);
  }

  @UseGuards(JwtAuthGuard, InstitutionAdminGuard)
  @Patch(':id/units/:unitId')
  updateUnit(@Param('unitId') unitId: string, @Body() body: {name?: string; parentId?: string | null}) {
    return this.svc.updateUnit(unitId, body);
  }

  @UseGuards(JwtAuthGuard, InstitutionAdminGuard)
  @Post(':id/units/:unitId/owner')
  setOwner(@Param('unitId') unitId: string, @Body() body: {email: string}) {
    return this.svc.setUnitOwner(unitId, body.email);
  }

  @UseGuards(JwtAuthGuard, InstitutionAdminGuard)
  @Post(':id/owner')
  setInstitutionOwner(@Request() req: any, @Param('id') id: string, @Body() body: {email: string}) {
    return this.svc.setInstitutionOwner(id, body.email, req.user.id);
  }
}
