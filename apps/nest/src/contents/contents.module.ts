import { Module } from '@nestjs/common';
import { ContentsController } from './contents.controller';
import { ContentsService } from './contents.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { IngestModule } from '../ingest/ingest.module';

@Module({
  imports: [SupabaseModule, IngestModule],
  controllers: [ContentsController],
  providers: [ContentsService],
})
export class ContentsModule {}
