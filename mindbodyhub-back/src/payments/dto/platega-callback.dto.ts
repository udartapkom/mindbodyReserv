import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import type { PlategaPaymentStatus } from '../payment.types';

/**
 * Callback body from Platega.
 * Official schema: id, amount, currency, status, paymentMethod.
 * `payload` may be present when we sent it on create (our payment.id).
 */
export class PlategaCallbackDto {
  @IsUUID()
  id: string;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsIn(['CONFIRMED', 'CANCELED', 'CHARGEBACKED', 'PENDING'])
  status: PlategaPaymentStatus;

  @IsOptional()
  paymentMethod?: number | string;

  @IsOptional()
  @IsString()
  payload?: string;
}
