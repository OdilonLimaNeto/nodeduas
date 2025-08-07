import { IsString, IsOptional, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class UploadConfirmationDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  altText?: string;
}

export class ConfirmUploadDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadConfirmationDto)
  uploads: UploadConfirmationDto[];
}
