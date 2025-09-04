import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../common/exceptions/base-exception';

export class FinancialRecordNotFoundException extends BaseException {
  constructor() {
    super(
      'The requested financial record was not found',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class InvalidFinancialDataException extends BaseException {
  constructor(message?: string) {
    super(
      message || 'Invalid financial record data provided',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class FinancialRecordUpdateFailedException extends BaseException {
  constructor() {
    super(
      'Failed to update financial record',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InvalidDateRangeException extends BaseException {
  constructor() {
    super(
      'Invalid date range provided. Start date must be before end date',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidAmountException extends BaseException {
  constructor() {
    super(
      'Invalid amount provided. Amount must be greater than zero',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class RelatedEntityNotFoundException extends BaseException {
  constructor(entityType: string) {
    super(
      `The related ${entityType} was not found`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
