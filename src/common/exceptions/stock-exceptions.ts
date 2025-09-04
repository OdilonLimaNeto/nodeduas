import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base-exception';

export class StockNotFoundException extends BaseException {
  constructor() {
    super(
      'The requested product stock information was not found',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class InsufficientStockException extends BaseException {
  constructor(currentStock: number, requestedQuantity: number) {
    super(
      `Not enough stock available. Current: ${currentStock}, Requested: ${requestedQuantity}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidStockOperationException extends BaseException {
  constructor() {
    super(
      'The stock operation is invalid or not supported',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class StockUpdateFailedException extends BaseException {
  constructor() {
    super(
      'Failed to update product stock information',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InvalidStockLevelsException extends BaseException {
  constructor() {
    super(
      'Minimum stock level cannot be greater than maximum stock level',
      HttpStatus.BAD_REQUEST,
    );
  }
}
