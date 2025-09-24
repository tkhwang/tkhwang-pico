import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ContentsRepository } from './repositories/contents.repository';
import { UserContentsRepository } from './repositories/user-contents.repository';
import { DebugRepository } from './debug.repository';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseService, ContentsRepository, DebugRepository, UserContentsRepository],
  exports: [SupabaseService, ContentsRepository, DebugRepository, UserContentsRepository],
})
export class SupabaseModule {}
