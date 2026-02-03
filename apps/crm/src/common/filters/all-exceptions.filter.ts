import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      message:
        httpStatus === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Internal server error'
          : (exception as any)?.message,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    // log full detail internally (structured)
    this.logger.error({
      message: (exception as any)?.message,
      stack: (exception as any)?.stack,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      exception,
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
