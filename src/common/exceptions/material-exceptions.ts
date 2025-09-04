import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base-exception';

export class MaterialNotFoundException extends BaseException {
  constructor() {
    super(
      'The requested material was not found',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class MaterialAlreadyExistsException extends BaseException {
  constructor() {
    super(
      'A material with this name already exists',
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidMaterialDataException extends BaseException {
  constructor(message?: string) {
    super(
      message || 'Invalid material data provided',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class MaterialUpdateFailedException extends BaseException {
  constructor() {
    super(
      'Failed to update material information',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InvalidMaterialQuantityException extends BaseException {
  constructor() {
    super(
      'Invalid quantity operation for material',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InsufficientMaterialException extends BaseException {
  constructor(currentQuantity: number, requestedQuantity: number) {
    super(
      `Not enough material available. Current: ${currentQuantity}, Requested: ${requestedQuantity}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
