import { Role } from '../../model/user.entity';

export class UserEntity {
  id: number;
  name: string;
  email: string;
  role: Role;
  password: string;
}
