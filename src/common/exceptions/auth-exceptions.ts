import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./base-exception";

export class InvalidCredentialsException extends BaseException {
  constructor() {
    super("Invalid credentials provided", HttpStatus.UNAUTHORIZED);
  }
}

export class TokenExpiredException extends BaseException {
  constructor() {
    super("Authentication token has expired", HttpStatus.UNAUTHORIZED);
  }
}

export class UnauthorizedAccessException extends BaseException {
  constructor() {
    super("Unauthorized access to resource", HttpStatus.FORBIDDEN);
  }
}

export class AccountBlockedException extends BaseException {
  constructor() {
    super("Account has been blocked", HttpStatus.FORBIDDEN);
  }
}
