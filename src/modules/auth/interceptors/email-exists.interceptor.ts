import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, from, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

interface RegisterResponse {
  access_token: string;
}

@Injectable()
export class EmailExistsInterceptor
  implements NestInterceptor<unknown, RegisterResponse>
{
  constructor(private usersService: UsersService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<RegisterResponse> {
    const request = context.switchToHttp().getRequest<Request>();
    const { email } = request.body as { email: string };

    return from(this.usersService.findByEmail(email)).pipe(
      switchMap(async (existingUser) => {
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
        return firstValueFrom(next.handle()) as Promise<RegisterResponse>;
      }),
    );
  }
}
