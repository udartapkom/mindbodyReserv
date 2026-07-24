import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class TariffComparisonRowInputDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @MaxLength(255)
  feature: string;

  @IsObject()
  included: Record<string, boolean>;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateTariffComparisonDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => TariffComparisonRowInputDto)
  rows: TariffComparisonRowInputDto[];
}

export function normalizeComparisonIncluded(
  included: Record<string, unknown>,
): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(included ?? {})) {
    const type = key.trim();
    if (!type) continue;
    result[type] = value === true || value === 'true' || value === 1;
  }
  return result;
}
