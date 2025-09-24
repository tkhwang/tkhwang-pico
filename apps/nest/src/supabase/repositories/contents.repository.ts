import { Injectable } from '@nestjs/common';

import { ContentsRepository as BaseContentsRepository } from '@tkhwang-pico/supabase';

import { SupabaseService } from '../supabase.service';

import { createRepositoryLogger } from './repository-logger.util';

@Injectable()
export class ContentsRepository extends BaseContentsRepository {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService.serviceClient, createRepositoryLogger(BaseContentsRepository.name));
  }
}
