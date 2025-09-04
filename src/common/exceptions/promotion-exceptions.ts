import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base-exception';

export class PromotionNotFoundException extends BaseException {
  constructor() {
    super(
      'The requested promotion was not found',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class PromotionAlreadyExistsException extends BaseException {
  constructor() {
    super(
      'A promotion with the same title already exists for this product',
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidPromotionDataException extends BaseException {
  constructor(details?: string) {
    super(
      details || 'The promotion data provided is invalid',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class PromotionUpdateFailedException extends BaseException {
  constructor() {
    super(
      'Failed to update the promotion',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InvalidPromotionDatesException extends BaseException {
  constructor() {
    super(
      'End date must be after start date',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class PromotionExpiredException extends BaseException {
  constructor() {
    super(
      'This promotion has already expired',
      HttpStatus.BAD_REQUEST,
    );
  }
}
