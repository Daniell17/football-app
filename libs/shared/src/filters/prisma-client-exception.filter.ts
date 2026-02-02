import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[]) || [];
        message = `Unique constraint failed on the fields: (${target.join(', ')})`;
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message = (exception.meta?.cause as string) || 'Record not found';
        break;
      }
      default:
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name,
    });
  }
}
