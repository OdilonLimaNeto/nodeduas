import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./base-exception";

export class UserNotFoundException extends BaseException {
  constructor() {
    super("User not found", HttpStatus.NOT_FOUND);
  }
}

export class UserAlreadyExistsException extends BaseException {
  constructor() {
    super("User already exists", HttpStatus.CONFLICT);
  }
}

export class InvalidUserDataException extends BaseException {
  constructor(message: string = "Invalid user data provided") {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class UserUpdateFailedException extends BaseException {
  constructor() {
    super("Failed to update user", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
