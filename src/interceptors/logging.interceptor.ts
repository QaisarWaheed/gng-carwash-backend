/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const user = request.user;

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

      
          this.logger.log(
            `${method} ${url} ${statusCode} - ${duration}ms - ${ip} - User: ${user?.email || 'Anonymous'} - ${userAgent}`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          
        
          this.logger.error(
            `${method} ${url} ${error.status || 500} - ${duration}ms - ${ip} - User: ${user?.email || 'Anonymous'} - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
