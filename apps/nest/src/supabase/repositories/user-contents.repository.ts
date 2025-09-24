import { Injectable } from '@nestjs/common';

import { UserContentsRepository as BaseUserContentsRepository } from '@tkhwang-pico/supabase';

import { SupabaseService } from '../supabase.service';

import { createRepositoryLogger } from './repository-logger.util';

@Injectable()
export class UserContentsRepository extends BaseUserContentsRepository {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService.serviceClient, createRepositoryLogger(BaseUserContentsRepository.name));
  }
}
