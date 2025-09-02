import { Module } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { IngestSummaryService } from 'src/ingest/ingest-summary.service';
import { IngestExtractService } from 'src/ingest/ingest-extract.service';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [IngestService, IngestSummaryService, IngestExtractService],
})
export class IngestModule {}
