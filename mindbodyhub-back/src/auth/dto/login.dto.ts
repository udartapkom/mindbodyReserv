import { Transform } from 'class-transformer';
import { IsString, Matches, MinLength } from 'class-validator';
import { normalizePhone } from '../../common/utils/phone.util';

export class LoginDto {
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
  @MinLength(1)
  password: string;
}
