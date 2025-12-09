import { UserRoles } from 'src/users/enum/roles.enum';

export interface JwtPayload {
  sub: string; //UUID
  iss?: string; // Issuer
  aud?: string | string[]; // Servico que vai servir o jwt
  jti?: string; // Unique Token ID (Para revogação)
  iat?: number; //Issued At
  exp?: number; //Expiration

  email: string;

  role: UserRoles;
  enterprise: string | null;
}
