import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateInsightDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsArray()
  blocks?: unknown[];

  /** Go-live calendar day (ISO). Defaults to now on publish. */
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  publishedAt?: string | null;

  /** If true, create already published. */
  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}
