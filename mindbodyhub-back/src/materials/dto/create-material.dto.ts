import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z][a-z0-9_-]*$/, {
    message: 'tariffType must be a lowercase slug (a-z, 0-9, _, -)',
  })
  tariffType?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(2000)
  summary?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(2048)
  coverUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  showMetadata?: boolean;

  @IsOptional()
  @IsArray()
  blocks?: unknown[];
}
