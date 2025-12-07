import {Controller, Get, Query, Res} from '@nestjs/common';
import {Response} from 'express';
import {AuthService} from './auth.service';

@Controller('auth/saml')
export class SamlController {
  constructor(private auth: AuthService) {}

  @Get('edugain/login')
  login(@Query('email') email: string, @Res() res: Response) {
    // Mock login: accept ?email=... or default
    const e = email || `edugain.user${Date.now()}@example.edu`;
    const fullName = 'eduGAIN User';
    const token = (this.auth as any)['sign'](e, e, fullName, 'RESEARCHER');
    const web = process.env.WEB_ORIGIN || 'http://localhost:4320';
    const url = new URL('/auth/session', web);
    url.searchParams.set('token', token);
    url.searchParams.set('to', '/settings/security');
    return res.redirect(url.toString());
  }

  @Get('edugain/callback')
  callback(@Res() res: Response) {
    // Not used in mock; real flow would parse SAMLResponse
    return res.redirect((process.env.WEB_ORIGIN || 'http://localhost:4320') + '/');
  }
}


