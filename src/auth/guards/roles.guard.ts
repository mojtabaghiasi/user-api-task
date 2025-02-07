import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserEntity } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../has-roles.decorator';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const hasRequiredRole = requiredRoles.some((role) => user?.role === role);
    if (!hasRequiredRole) {
      throw new ForbiddenException('You are not authorized.');
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserEntity }>();
    const user = request.user;
    const userIdFromParams = Number(request.params.id);

    if (user.role === 'USER') {
      if (
        (request.method === 'GET' || request.method === 'PATCH') &&
        userIdFromParams === user.id
      ) {
        return true;
      }
      throw new ForbiddenException(
        'You are not authorised to perform this action.',
      );
    }
    if (user.role === 'ADMIN') {
      if (request.method === 'DELETE') {
        if (user.id === userIdFromParams) {
          throw new ForbiddenException('You cannot delete yourself.');
        }
        return true;
      }
      return true;
    }
    throw new ForbiddenException(
      'You are not authorised to perform this action.',
    );
  }
}
