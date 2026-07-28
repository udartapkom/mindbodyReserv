import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateQuoteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(255)
  author?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  publishedAt?: string | null;
}
