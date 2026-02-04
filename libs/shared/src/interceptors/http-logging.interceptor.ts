import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, query, headers, ip } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const user = request.user;

    const startTime = Date.now();
    const hasToken = !!headers.authorization;

    // Log incoming request
    this.logger.log(
      `🔵 ${method} ${url} | IP: ${ip} | User: ${user?.email || 'Guest'} | Token: ${hasToken ? '✅' : '❌'}`
    );

    // Log request details if not GET
    if (method !== 'GET' && Object.keys(body || {}).length > 0) {
      this.logger.debug(`   Body: ${JSON.stringify(body)}`);
    }

    if (Object.keys(query || {}).length > 0) {
      this.logger.debug(`   Query: ${JSON.stringify(query)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;
          
          this.logger.log(
            `✅ ${method} ${url} | Status: ${statusCode} | Time: ${responseTime}ms`
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error.status || 500;
          
          this.logger.error(
            `❌ ${method} ${url} | Status: ${statusCode} | Time: ${responseTime}ms | Error: ${error.message}`
          );
        },
      })
    );
  }
}
