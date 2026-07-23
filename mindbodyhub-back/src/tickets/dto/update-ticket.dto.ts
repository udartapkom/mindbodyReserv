import { IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { TicketStatus } from '../ticket.types';

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(5000)
  adminNote?: string | null;
}
