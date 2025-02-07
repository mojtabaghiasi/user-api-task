import { UserRoles } from './user.roles';

export class UserEntity {
  id: number;
  name: string;
  email: string;
  role: UserRoles;
  password?: string;
}
