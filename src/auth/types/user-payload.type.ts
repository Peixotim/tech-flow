import { UserRoles } from 'src/users/enum/roles.enum';

export interface UserPayload {
  uuid: string;
  name: string;
  email: string;
  role: UserRoles;
  isActive: boolean;
  enterprise: {
    uuid: string;
    name: string;
    cnpj: string;
    slug: string;
  };
}
