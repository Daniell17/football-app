import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, ip } = request;
    const userAgent = request.get('user-agent');

    const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    return next.handle().pipe(
      tap(() => {
        if (isWriteMethod || url.includes('auth')) {
          this.prisma.auditLog.create({
            data: {
              userId: user?.id,
              action: `${method} ${url}`,
              resource: url.split('/')[1] || 'root',
              ipAddress: ip,
              userAgent,
              metadata: {
                statusCode: context.switchToHttp().getResponse().statusCode,
              },
            },
          }).catch(err => console.error('Audit log failed', err));
        }
      }),
    );
  }
}
