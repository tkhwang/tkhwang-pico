import { Module } from '@nestjs/common';

import { SupabaseModule } from '../supabase/supabase.module';

import { IngestService } from './ingest.service';
import { IngestEmbeddingService } from './ingest-embedding.service';
import { IngestExtractService } from './ingest-extract.service';
import { IngestSummaryService } from './ingest-summary.service';
import { UserEmbeddingService } from './user-embedding.service';

@Module({
  imports: [SupabaseModule],
  providers: [
    IngestService,
    IngestSummaryService,
    IngestExtractService,
    IngestEmbeddingService,
    UserEmbeddingService,
  ],
  exports: [
    IngestService,
    IngestSummaryService,
    IngestExtractService,
    IngestEmbeddingService,
    UserEmbeddingService,
  ],
})
export class IngestModule {}
