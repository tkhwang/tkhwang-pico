import { Module } from '@nestjs/common';

import { IngestModule } from '../ingest/ingest.module';
import { SupabaseModule } from '../supabase/supabase.module';

import { ContentsController } from './contents.controller';
import { ContentsService } from './contents.service';

@Module({
  imports: [SupabaseModule, IngestModule],
  controllers: [ContentsController],
  providers: [ContentsService],
})
export class ContentsModule {}
