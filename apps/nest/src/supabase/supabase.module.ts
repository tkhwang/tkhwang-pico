import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ContentsRepository } from './repositories/contents.repository';
import { DebugFailedContentsRepository } from './repositories/debug-failed-contents.repository';
import { UserContentsRepository } from './repositories/user-contents.repository';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [ConfigModule],
  providers: [
    SupabaseService,
    ContentsRepository,
    DebugFailedContentsRepository,
    UserContentsRepository,
  ],
  exports: [
    SupabaseService,
    ContentsRepository,
    DebugFailedContentsRepository,
    UserContentsRepository,
  ],
})
export class SupabaseModule {}
