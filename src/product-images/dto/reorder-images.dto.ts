import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class ImageOrderDto {
  @IsString()
  id: string;

  @IsNumber()
  @Min(1)
  sortOrder: number;
}

export class ReorderImagesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageOrderDto)
  imageOrders: ImageOrderDto[];
}
