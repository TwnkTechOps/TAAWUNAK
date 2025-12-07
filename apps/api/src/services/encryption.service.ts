import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;
  private readonly tagPosition = this.saltLength + this.ivLength;
  private readonly encryptedPosition = this.tagPosition + this.tagLength;

  private getKey(): Buffer {
    const secret = process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-production';
    return crypto.scryptSync(secret, 'salt', this.keyLength);
  }

  async encrypt(text: string): Promise<string> {
    const key = this.getKey();
    const iv = crypto.randomBytes(this.ivLength);
    const salt = crypto.randomBytes(this.saltLength);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted data
    const result = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);

    return result.toString('base64');
  }

  async decrypt(encryptedData: string): Promise<string> {
    const key = this.getKey();
    const data = Buffer.from(encryptedData, 'base64');

    // Extract components
    const salt = data.subarray(0, this.saltLength);
    const iv = data.subarray(this.saltLength, this.tagPosition);
    const tag = data.subarray(this.tagPosition, this.encryptedPosition);
    const encrypted = data.subarray(this.encryptedPosition);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

