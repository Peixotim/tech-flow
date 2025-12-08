export interface JwtPayload {
  sub: string; //UUID
  iss?: string; // Issuer
  aud?: string | string[]; // Servico que vai servir o jwt
  jti?: string; // Unique Token ID (Para revogação)

  email: string;

  iat?: number; //Issued At
  exp?: number; //Expiration
}
