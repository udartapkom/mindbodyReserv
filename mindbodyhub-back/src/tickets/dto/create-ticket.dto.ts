import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  normalizePhone,
  PHONE_E164_MESSAGE,
  PHONE_E164_REGEX,
} from '../../common/utils/phone.util';
import { TicketSource } from '../ticket.types';

export class CreateTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

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
  @MaxLength(5000)
  message: string;

  @IsOptional()
  @IsEnum(TicketSource)
  source?: TicketSource;
}
