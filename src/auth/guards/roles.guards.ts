import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRoles } from '../../users/enum/roles.enum';

interface AuthenticatedRequest extends Request {
  user?: { role: UserRoles };
}

@Injectable()
export class RolesGuard implements CanActivate {
  logger = new Logger(RolesGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!user) {
      this.logger.warn(
        'Usuário não encontrado no request (JwtAuthGuard falhou ou não foi usado?)',
      );
      throw new ForbiddenException('Acesso negado: Usuário não identificado.');
    }
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Acesso Negado: Você não tem permissão de Master.',
      );
    }

    return true;
  }
}
