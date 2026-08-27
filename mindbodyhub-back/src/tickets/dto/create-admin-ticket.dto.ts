import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateAdminTicketDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message: string;
}
