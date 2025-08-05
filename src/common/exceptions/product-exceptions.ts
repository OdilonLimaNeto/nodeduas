import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base-exception';

export class ProductNotFoundException extends BaseException {
  constructor() {
    super('Product not found', HttpStatus.NOT_FOUND);
  }
}

export class ProductAlreadyExistsException extends BaseException {
  constructor() {
    super('Product already exists', HttpStatus.CONFLICT);
  }
}

export class InvalidProductDataException extends BaseException {
  constructor(message: string = 'Invalid product data provided') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ProductUpdateFailedException extends BaseException {
  constructor() {
    super('Failed to update product', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
