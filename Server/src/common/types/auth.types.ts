import { OrgRole } from '@prisma/client';

export type { OrgRole };

export interface JwtPayload {
  sub: string;
  email: string;
  orgId: string;
  role: OrgRole;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  orgId: string;
  role: OrgRole;
}
