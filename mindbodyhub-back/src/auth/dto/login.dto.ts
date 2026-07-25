import { Transform } from 'class-transformer';
import { IsString, Matches, MinLength } from 'class-validator';
import {
  normalizePhone,
  PHONE_E164_MESSAGE,
  PHONE_E164_REGEX,
} from '../../common/utils/phone.util';

export class LoginDto {
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

  @IsString()
  @MinLength(1)
  password: string;
}
