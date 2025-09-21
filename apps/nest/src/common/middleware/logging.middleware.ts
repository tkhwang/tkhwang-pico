import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Log request
    this.logger.log(
      `${this.getMethodColor(method)} ${method} ${originalUrl} - ${ip} - ${userAgent}`,
    );

    // Log request body for POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
      this.logger.debug(`Request Body: ${JSON.stringify(req.body)}`);
    }

    // Log response
    const originalSend = res.send;

    res.send = (data: any) => {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log with appropriate level based on status code
      const logMessage = `${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`;

      if (statusCode >= 500) {
        this.logger.error(logMessage, '', 'HTTP');
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage, 'HTTP');
      } else {
        this.logger.log(`${this.getStatusColor(statusCode)} ${logMessage}`, 'HTTP');
      }

      return originalSend.call(res, data);
    };

    next();
  }

  private getMethodColor(method: string): string {
    const colors: Record<string, string> = {
      GET: '\x1b[32m', // Green
      POST: '\x1b[33m', // Yellow
      PUT: '\x1b[34m', // Blue
      DELETE: '\x1b[31m', // Red
      PATCH: '\x1b[35m', // Magenta
      OPTIONS: '\x1b[36m', // Cyan
      HEAD: '\x1b[37m', // White
    };
    return colors[method] || '\x1b[37m';
  }

  private getStatusColor(statusCode: number): string {
    if (statusCode >= 500) {
      return '\x1b[31m'; // Red for server errors
    } else if (statusCode >= 400) {
      return '\x1b[33m'; // Yellow for client errors
    } else if (statusCode >= 300) {
      return '\x1b[36m'; // Cyan for redirects
    } else if (statusCode >= 200) {
      return '\x1b[32m'; // Green for success
    }
    return '\x1b[37m'; // White for others
  }
}
