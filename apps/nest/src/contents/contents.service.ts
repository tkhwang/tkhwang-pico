import { SupabaseService } from './../supabase/supabase.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async saveUrl({
    url,
    userId,
    isPublic = false,
  }: {
    url: string;
    userId: string;
    isPublic: boolean;
  }) {
    const upsertRes = await this.supabaseService.client
      .from('contents')
      .upsert({ url, is_public: isPublic }, { onConflict: 'url' })
      .select('*')
      .single();

    type UpsertResponse =
      import('@supabase/supabase-js').PostgrestSingleResponse<
        import('../supabase/types').ContentsRow
      >;
    const { data: contents, error: errorOfUpsert } =
      upsertRes as UpsertResponse;

    if (errorOfUpsert || !contents) {
      throw new Error(
        errorOfUpsert?.message ?? 'No content returned from upsert',
      );
    }

    const { error: errorOfUpsertUserContents } =
      await this.supabaseService.client.from('user_contents').upsert(
        {
          user_id: userId,
          content_id: contents.id,
        },
        { onConflict: 'user_id,content_id' },
      );

    if (errorOfUpsertUserContents)
      throw new Error(errorOfUpsertUserContents.message);

    return {
      contentId: contents.id,
      status: contents.status,
    };
  }
}
