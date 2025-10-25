// src/guards/AuthGuardWithRoles.ts
import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/types/enum.class';
import { ROLES_KEY } from 'src/decorators/Roles.decorator';

@Injectable()
export class AuthGuardWithRoles extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw err || new ForbiddenException('Unauthorized');
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return user;

    const hasRole = requiredRoles
      .map((r) => r.toLowerCase())
      .includes(user.role.toLowerCase());

    if (!hasRole) {
      throw new ForbiddenException('You do not have permission for this route');
    }

    return user;
  }
}
