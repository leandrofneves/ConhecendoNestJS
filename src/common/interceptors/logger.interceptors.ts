import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    console.log('Interceptando a requisição');
    const request = context.switchToHttp().getRequest();
    const now = Date.now();
    const method = request.method;
    const url = request.url;
    return next.handle().pipe(
      tap(() => {
        console.log(`Método: ${method}`);
        console.log(`URL: ${url}`);
        console.log(`Tempo de resposta: ${Date.now() - now}ms`);
      }),
    );
  }
}
