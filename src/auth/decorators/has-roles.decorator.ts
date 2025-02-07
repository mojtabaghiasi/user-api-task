import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '../../users/entities/user.roles';

export const ROLES_KEY = 'roles';
export const HasRoles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
