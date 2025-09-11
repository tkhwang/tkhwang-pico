import { Module } from '@nestjs/common';

import { SupabaseModule } from '../supabase/supabase.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SupabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
