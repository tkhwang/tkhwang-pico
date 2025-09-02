import { Module } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { IngestSummaryService } from './ingest-summary.service';
import { IngestExtractService } from './ingest-extract.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [IngestService, IngestSummaryService, IngestExtractService],
  exports: [IngestService, IngestSummaryService, IngestExtractService],
})
export class IngestModule {}
