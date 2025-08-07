import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./base-exception";

export class ProductImageNotFoundException extends BaseException {
  constructor() {
    super("Product image not found", HttpStatus.NOT_FOUND);
  }
}

export class MaxImagesExceededException extends BaseException {
  constructor(current: number, limit: number) {
    super(
      `Maximum ${limit} images per product allowed. Current: ${current}`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidFileTypeException extends BaseException {
  constructor(allowedTypes?: string[]) {
    const typesMessage = allowedTypes
      ? ` Allowed: ${allowedTypes.join(", ").toUpperCase()}`
      : "";
    super(`Invalid file type.${typesMessage}`, HttpStatus.BAD_REQUEST);
  }
}

export class ProductImageUploadFailedException extends BaseException {
  constructor() {
    super("Failed to upload product image", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
