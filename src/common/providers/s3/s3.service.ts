import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

@Injectable()
export class AwsS3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private maxFileSizeBytes: number;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get("AWS_REGION"),
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      },
    });
    this.bucketName = this.configService.get("AWS_S3_BUCKET_NAME");
    this.maxFileSizeBytes =
      this.configService.get<number>("MAX_FILE_SIZE_MB", 5) * 1024 * 1024;
  }

  async generateUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ContentLength: this.maxFileSizeBytes,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 300 }); // 5 minutos
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.configService.get("AWS_REGION")}.amazonaws.com/${key}`;
  }

  extractKeyFromUrl(url: string): string {
    return url.split(".amazonaws.com/")[1];
  }

  validateFileType(fileName: string): boolean {
    const allowedTypes = this.configService
      .get("ALLOWED_FILE_TYPES")
      ?.split(",") || ["jpg", "jpeg", "png", "webp"];
    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    return allowedTypes.includes(fileExtension || "");
  }

  private getMaxFileSizeBytes(): number {
    return this.maxFileSizeBytes;
  }

  private getAllowedFileTypes(): string[] {
    return (
      this.configService.get("ALLOWED_FILE_TYPES")?.split(",") || [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ]
    );
  }

  generateUploadKey(
    modulePath: string,
    entityId: string,
    fileName: string
  ): string {
    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    const uniqueId = randomUUID();
    return `${modulePath}/${entityId}/${uniqueId}.${fileExtension}`;
  }

  getUploadConfiguration() {
    return {
      maxFileSize: this.getMaxFileSizeBytes(),
      allowedFileTypes: this.getAllowedFileTypes(),
      modulePath: this.getProductsModulePath(),
    };
  }

  getProductsModulePath(): string {
    return this.configService.get<string>("S3_PRODUCTS_PATH", "products");
  }

  getUsersModulePath(): string {
    return this.configService.get<string>("S3_USERS_PATH", "users");
  }

  getMaterialsModulePath(): string {
    return this.configService.get<string>("S3_MATERIALS_PATH", "materials");
  }
}
