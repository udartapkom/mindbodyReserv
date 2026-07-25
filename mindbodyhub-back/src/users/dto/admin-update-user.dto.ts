import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  normalizePhone,
  PHONE_E164_MESSAGE,
  PHONE_E164_REGEX,
} from '../../common/utils/phone.util';
import { PhoneCountry } from '../phone-country.enum';
import { UserRole } from '../user-role.enum';
import { UserTariff } from '../user-tariff.enum';

export class AdminUpdateUserDto {
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(100)
  firstName?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(100)
  lastName?: string | null;

  @IsOptional()
  @Transform(({ value }) => {
    try {
      return normalizePhone(String(value));
    } catch {
      return value;
    }
  })
  @Matches(PHONE_E164_REGEX, {
    message: PHONE_E164_MESSAGE,
  })
  phone?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsEnum(PhoneCountry)
  phoneCountry?: PhoneCountry | null;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserTariff)
  tariff?: UserTariff;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  tariffExpiresAt?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @IsUrl({}, { message: 'avatarUrl must be a valid URL' })
  @MaxLength(2048)
  avatarUrl?: string | null;
}
