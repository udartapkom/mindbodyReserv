import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class UpsertReadingProgressDto {
  @IsUUID()
  materialId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  scrollRatio: number;
}
