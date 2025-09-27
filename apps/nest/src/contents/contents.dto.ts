import { IsIn, IsOptional, IsUrl, Matches, MaxLength } from 'class-validator';

import { Constants, type Enums } from '@tkhwang-pico/supabase';

export const CONTENT_PRIORITY_VALUES = Constants.public.Enums.content_priority;
type ContentPriority = Enums<'content_priority'>;

export class SaveContentDto {
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(2048)
  url: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  scheduledFor?: string;

  @IsOptional()
  @IsIn(CONTENT_PRIORITY_VALUES)
  priority?: ContentPriority;
}
