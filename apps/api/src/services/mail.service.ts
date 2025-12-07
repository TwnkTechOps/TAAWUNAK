import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transport: any | null = null;
  private from: string;
  private enabled: boolean;

  constructor(private cfg: ConfigService) {
    const host = cfg.get<string>('SMTP_HOST');
    const port = Number(cfg.get<string>('SMTP_PORT') || 587);
    const user = cfg.get<string>('SMTP_USER');
    const pass = cfg.get<string>('SMTP_PASS');
    this.from = cfg.get<string>('SMTP_FROM', 'noreply@tawawunak.local');
    this.enabled = !!host && !!user && !!pass;
    if (this.enabled) {
      // Lazy require to avoid runtime error if nodemailer not installed in some contexts
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nodemailer = require('nodemailer');
      this.transport = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    }
  }

  async send(to: string, subject: string, html: string, text?: string) {
    if (!this.enabled || !this.transport) {
      // Fallback to console for dev if SMTP not configured
      // eslint-disable-next-line no-console
      console.log('[MAIL Fallback]', { to, subject, html });
      return { ok: true, fallback: true };
    }
    await this.transport.sendMail({
      from: this.from,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html
    });
    return { ok: true };
  }
}


