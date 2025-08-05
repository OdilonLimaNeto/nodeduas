import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = {
      statusCode: status,
      message: exception.message,
      error: exception.constructor.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Structured logging
    this.logger.error(`HTTP Exception: ${exception.constructor.name}`, {
      statusCode: status,
      message: exception.message,
      path: request.url,
      method: request.method,
      userAgent: request.get("User-Agent"),
      ip: request.ip,
      timestamp: errorResponse.timestamp,
    });

    response.status(status).json(errorResponse);
  }
}
