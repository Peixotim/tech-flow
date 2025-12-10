import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'src/users/enum/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
