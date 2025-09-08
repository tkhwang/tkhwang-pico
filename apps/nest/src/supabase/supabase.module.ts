import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { ContentsRepository } from './contents.repository';
import { UserContentsRepository } from './user-contents.repository';
import { DebugRepository } from './debug.repository';

@Module({
  imports: [ConfigModule],
  providers: [
    SupabaseService,
    ContentsRepository,
    UserContentsRepository,
    DebugRepository,
  ],
  exports: [
    SupabaseService,
    ContentsRepository,
    UserContentsRepository,
    DebugRepository,
  ],
})
export class SupabaseModule {}
