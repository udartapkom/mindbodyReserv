import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { normalizePhone } from '../../common/utils/phone.util';
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
  @Matches(/^\+7\d{10}$/, {
    message: 'Phone must be a valid Russian number, e.g. +79001234567',
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
