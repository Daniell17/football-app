import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  sid?: string;
  version?: number;
  iat?: number;
  exp?: number;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<UserWithoutPassword, 'isActive' | 'mfaEnabled' | 'createdAt' | 'updatedAt'>;
