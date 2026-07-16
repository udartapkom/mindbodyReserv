import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type UploadFileOptions = {
  bucket: string;
  key: string;
  body: Buffer;
  contentType: string;
  isPublic?: boolean;
};

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client!: S3Client;
  private publicBaseUrl!: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const endpoint = this.config.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.config.get<string>('MINIO_PORT', '9000');
    const useSsl = this.config.get<string>('MINIO_USE_SSL', 'false') === 'true';
    const protocol = useSsl ? 'https' : 'http';
    const accessKeyId = this.config.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretAccessKey = this.config.get<string>(
      'MINIO_SECRET_KEY',
      'minioadmin',
    );

    this.publicBaseUrl = this.config
      .get<string>('MINIO_PUBLIC_URL', `${protocol}://${endpoint}:${port}`)
      .replace(/\/$/, '');

    this.client = new S3Client({
      region: this.config.get<string>('MINIO_REGION', 'us-east-1'),
      endpoint: `${protocol}://${endpoint}:${port}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(`Storage endpoint: ${protocol}://${endpoint}:${port}`);
  }

  getBucketName(configKey: string, fallback: string): string {
    return this.config.get<string>(configKey, fallback);
  }

  getAvatarsBucket(): string {
    return this.getBucketName('MINIO_BUCKET_AVATARS', 'avatars');
  }

  getMaterialsBucket(): string {
    return this.getBucketName('MINIO_BUCKET_MATERIALS', 'materials');
  }

  async uploadFile(options: UploadFileOptions): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: options.bucket,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
      }),
    );

    return this.getObjectUrl(options.bucket, options.key, options.isPublic);
  }

  getObjectUrl(bucket: string, key: string, isPublic = false): string {
    if (isPublic) {
      return `${this.publicBaseUrl}/${bucket}/${key}`;
    }

    return `${this.publicBaseUrl}/${bucket}/${key}`;
  }

  async getPresignedUrl(
    bucket: string,
    key: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }

  async checkBuckets(...buckets: string[]): Promise<boolean> {
    for (const bucket of buckets) {
      await this.client.send(new HeadBucketCommand({ Bucket: bucket }));
    }

    return true;
  }
}
