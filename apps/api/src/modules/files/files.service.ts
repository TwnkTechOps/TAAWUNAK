import {Injectable} from '@nestjs/common';

@Injectable()
export class FilesService {
  // Use 'any' to avoid hard dependency at import time
  private s3: any | null = null;
  private bucket: string;
  private endpoint: string;

  constructor() {
    this.endpoint = process.env.S3_ENDPOINT || 'http://localhost:49000';
    this.bucket = process.env.S3_BUCKET || 'edutech-bucket';
    // Lazy-require AWS SDK so the API can start without it (login and other flows)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const {S3Client} = require('@aws-sdk/client-s3');
      this.s3 = new S3Client({
        region: 'us-east-1',
        endpoint: this.endpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY || 'edutech',
          secretAccessKey: process.env.S3_SECRET_KEY || 'edutech12345'
        }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        "[FilesService] '@aws-sdk/client-s3' not installed. File presign will be disabled."
      );
      this.s3 = null;
    }
  }

  async presignPut(key: string, contentType: string) {
    if (!this.s3) {
      throw new Error(
        "File uploads are disabled in this environment. Missing '@aws-sdk/client-s3'."
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {PutObjectCommand} = require('@aws-sdk/client-s3');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {getSignedUrl} = require('@aws-sdk/s3-request-presigner');
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType
    });
    const url = await getSignedUrl(this.s3, cmd, {expiresIn: 60 * 5});
    const publicUrl = `${this.endpoint}/${this.bucket}/${encodeURIComponent(key)}`;
    return {url, publicUrl, key};
  }
}

