import { IsString, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class FileUploadDto {
  @IsString()
  fileName: string;

  @IsString()
  contentType: string;
}

export class GenerateUploadUrlsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileUploadDto)
  files: FileUploadDto[];
}
