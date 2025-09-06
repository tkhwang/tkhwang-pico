import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { ContentsRepository } from './contents.repository';
import { UserContentsRepository } from './user-contents.repository';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseService, ContentsRepository, UserContentsRepository],
  exports: [SupabaseService, ContentsRepository, UserContentsRepository],
})
export class SupabaseModule {}
