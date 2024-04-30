import { Module } from '@nestjs/common';
import { UserAdminModule } from './users/users.module';

@Module({
  imports: [UserAdminModule],
})
export class AdminModule {}
