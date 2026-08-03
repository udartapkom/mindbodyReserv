import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @IsUrl({}, { message: 'avatarUrl must be a valid URL' })
  @MaxLength(2048)
  avatarUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  notifySupportReplies?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyNewMaterials?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyDailyQuote?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyTariffExpiry?: boolean;
}
