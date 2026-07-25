import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../common/utils/password.util';
import {
  normalizePhone,
  PHONE_E164_MESSAGE,
  PHONE_E164_REGEX,
} from '../../common/utils/phone.util';
import { PhoneCountry } from '../../users/phone-country.enum';

export class RegisterDto {
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
  phone: string;

  @IsOptional()
  @IsEnum(PhoneCountry)
  phoneCountry?: PhoneCountry;

  @IsString()
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}
