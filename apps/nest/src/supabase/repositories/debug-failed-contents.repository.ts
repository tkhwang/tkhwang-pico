import { Injectable } from '@nestjs/common';

import { DebugFailedContentsRepository as BaseDebugFailedContentsRepository } from '@tkhwang-pico/supabase';

import { SupabaseService } from '../supabase.service';

import { createRepositoryLogger } from './repository-logger.util';

@Injectable()
export class DebugFailedContentsRepository extends BaseDebugFailedContentsRepository {
  constructor(supabaseService: SupabaseService) {
    super(
      supabaseService.serviceClient,
      createRepositoryLogger(BaseDebugFailedContentsRepository.name),
    );
  }
}
