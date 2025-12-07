import {Controller, Get, Inject, Param, Query, Res} from '@nestjs/common';
import {Response} from 'express';
import {AuthService} from './auth.service';

@Controller('auth/oidc')
export class OidcController {
  constructor(@Inject(AuthService) private auth: AuthService) {}

  // Simple in-memory state/nonce store (dev)
  private static store = new Map<string, {nonce: string; exp: number}>();
  private keep(state: string, nonce: string) {
    OidcController.store.set(state, {nonce, exp: Date.now() + 5 * 60_000});
  }
  private take(state?: string): string | null {
    if (!state) return null;
    const rec = OidcController.store.get(state);
    if (!rec) return null;
    OidcController.store.delete(state);
    if (rec.exp < Date.now()) return null;
    return rec.nonce;
  }

  @Get(':provider/login')
  login(@Param('provider') provider: string, @Res() res: Response) {
    if (provider !== 'keycloak') return res.status(400).send({message: 'Unsupported provider'});
    const issuer = process.env.KEYCLOAK_ISSUER;
    const clientId = process.env.KEYCLOAK_CLIENT_ID;
    const redirectUri = process.env.KEYCLOAK_REDIRECT_URI;
    if (!issuer || !clientId || !redirectUri) {
      return res.status(501).send({message: 'Keycloak env not configured'});
    }
    const authUrl = new URL(`${issuer}/protocol/openid-connect/auth`);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    this.keep(state, nonce);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);
    return res.redirect(authUrl.toString());
  }

  @Get(':provider/callback')
  callback(@Param('provider') provider: string, @Query() query: Record<string, string>, @Res() res: Response) {
    if (provider !== 'keycloak') return res.status(400).send({message: 'Unsupported provider'});
    const issuer = process.env.KEYCLOAK_ISSUER;
    const clientId = process.env.KEYCLOAK_CLIENT_ID;
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
    const redirectUri = process.env.KEYCLOAK_REDIRECT_URI;
    if (!issuer || !clientId || !clientSecret || !redirectUri) {
      return res.status(501).send({message: 'Keycloak env not configured'});
    }
    const code = query.code;
    const state = query.state;
    if (!code) return res.status(400).send({message: 'Missing code'});
    const expectedNonce = this.take(state);
    if (!expectedNonce) return res.status(400).send({message: 'Invalid state'});
    // Exchange code for tokens
    const tokenUrl = `${issuer}/protocol/openid-connect/token`;
    fetch(tokenUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      })
    })
      .then(r => r.json())
      .then(async (tok: any) => {
        const idToken = tok?.id_token;
        if (!idToken) return res.status(500).send({message: 'No id_token from provider', tok});
        // Decode ID token (no verification for brevity)
        const payload = JSON.parse(Buffer.from(idToken.split('.')[1] || '', 'base64').toString('utf8'));
        const email = payload?.email;
        const name = payload?.name || email || 'User';
        const nonce = payload?.nonce;
        if (nonce !== expectedNonce) return res.status(400).send({message: 'Nonce mismatch'});
        if (!email) return res.status(500).send({message: 'No email claim in id_token'});
        // Upsert user and issue app JWT
        const user = await (this as any).auth['prisma'].user.upsert({
          where: {email},
          update: {fullName: name},
          create: {email, fullName: name, passwordHash: await import('bcryptjs').then(b => (b as any).hash(email, 4))}
        });
        const {token} = await this.auth['sign'](user.id, user.email, user.fullName, user.role);
        const tokenCookie = `tawawunak_token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 12}`;
        const deviceCookie = `tawawunak_device=${encodeURIComponent((global as any).crypto?.randomUUID?.() || Date.now().toString())}; Path=/; SameSite=Lax; Max-Age=${60 *
          60 *
          24 *
          365}`;
        (res as any).header('Set-Cookie', [tokenCookie, deviceCookie]);
        const web = process.env.WEB_ORIGIN || 'http://localhost:4320';
        const url = new URL('/auth/session', web);
        url.searchParams.set('token', token);
        url.searchParams.set('to', '/settings/security');
        return res.redirect(url.toString());
      })
      .catch(err => res.status(500).send({message: 'Token exchange failed', error: String(err)}));
  }
}
