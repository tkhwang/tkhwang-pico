import { IsUrl, MaxLength } from 'class-validator';

export class SaveContentDto {
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  url: string;
}
