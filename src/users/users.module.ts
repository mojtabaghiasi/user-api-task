import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';
import { PasswordHelper } from '../common/helpers/password.helper';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, PasswordHelper],
  exports: [UsersService],
})
export class UsersModule {}
