import { Module } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { IngestSummaryService } from './ingest-summary.service';
import { IngestExtractService } from './ingest-extract.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { IngestEmbeddingService } from './ingest-embedding.service';

@Module({
  imports: [SupabaseModule],
  providers: [
    IngestService,
    IngestSummaryService,
    IngestExtractService,
    IngestEmbeddingService,
  ],
  exports: [
    IngestService,
    IngestSummaryService,
    IngestExtractService,
    IngestEmbeddingService,
  ],
})
export class IngestModule {}
