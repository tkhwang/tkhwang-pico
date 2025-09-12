import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const body = request.body as unknown;
    const params = request.params as Record<string, unknown>;
    const query = request.query as Record<string, unknown>;
    const startTime = Date.now();

    // Log detailed request information
    this.logger.verbose(
      `Request Details - ${method} ${url} - Params: ${JSON.stringify(
        params,
      )} - Query: ${JSON.stringify(query)}`,
    );

    // Log request body for mutations
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      this.logger.verbose(`Request Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const response = context.switchToHttp().getResponse<Response>();
          const responseTime = Date.now() - startTime;

          this.logger.log(
            `Response - ${method} ${url} - ${response.statusCode} - ${responseTime}ms`,
          );

          // Log response data in debug mode
          if (process.env.LOG_LEVEL === 'debug') {
            this.logger.debug(`Response Data: ${JSON.stringify(data)}`);
          }
        },
        error: (error: unknown) => {
          const responseTime = Date.now() - startTime;
          let status = 500;
          let stack = '';

          if (error instanceof HttpException) {
            status = error.getStatus();
            stack = error.stack || '';
          } else if (error instanceof Error) {
            stack = error.stack || '';
          }

          this.logger.error(
            `Error Response - ${method} ${url} - ${status} - ${responseTime}ms`,
            stack,
          );
        },
      }),
    );
  }
}
