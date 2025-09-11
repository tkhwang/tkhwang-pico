import { Global, Module } from '@nestjs/common';

import { HtmlCacheService } from './html-cache.service';

@Global()
@Module({
  providers: [HtmlCacheService],
  exports: [HtmlCacheService],
})
export class CacheModule {}
