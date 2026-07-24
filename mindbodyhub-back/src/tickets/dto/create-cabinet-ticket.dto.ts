import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCabinetTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;
}
