import * as bcrypt from 'bcryptjs';

export class PasswordHelper {
  private static readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, PasswordHelper.saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword?: string,
  ): Promise<boolean> {
    if (!hashedPassword) {
      return false;
    }
    return await bcrypt.compare(password, hashedPassword);
  }
}
