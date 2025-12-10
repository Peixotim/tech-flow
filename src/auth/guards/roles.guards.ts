import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRoles } from '../../users/enum/roles.enum';

interface AuthenticatedRequest extends Request {
  user?: { role: UserRoles };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!requiredRoles) {
      return true;
    }

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Acesso Negado: Você não tem permissão de Master.',
      );
    }

    return true;
  }
}
