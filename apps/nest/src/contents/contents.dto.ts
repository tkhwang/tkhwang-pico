import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SaveContentDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
