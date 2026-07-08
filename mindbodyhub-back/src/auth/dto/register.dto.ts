import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../common/utils/password.util';
import { normalizePhone } from '../../common/utils/phone.util';

export class RegisterDto {
  @Transform(({ value }) => {
    try {
      return normalizePhone(String(value));
    } catch {
      return value;
    }
  })
  @Matches(/^\+7\d{10}$/, {
    message: 'Phone must be a valid Russian number, e.g. +79001234567',
  })
  phone: string;

  @IsString()
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  password: string;
}
