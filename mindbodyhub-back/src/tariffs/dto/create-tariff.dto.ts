import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateTariffDto {
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z][a-z0-9_-]*$/, {
    message: 'type must be a lowercase slug (a-z, 0-9, _, -)',
  })
  type: string;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(32)
  titleColor?: string | null;

  @IsString()
  @MaxLength(50)
  price: string;

  @IsString()
  @MaxLength(50)
  period: string;

  @IsString()
  @MaxLength(200)
  subTitle: string;

  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  description: string[];

  @IsString()
  @MaxLength(512)
  image: string;

  @IsString()
  @MaxLength(255)
  imageAlt: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
