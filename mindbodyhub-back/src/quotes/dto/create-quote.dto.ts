import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(255)
  author?: string | null;

  /** Quote calendar day (ISO date or datetime). Defaults to now on publish. */
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  publishedAt?: string | null;

  /** If true, create already published. */
  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}
