import { IsUrl, MaxLength } from 'class-validator';

export class UpdateSupportLinksDto {
  @IsUrl({ require_protocol: true }, { message: 'Telegram: укажите полный URL' })
  @MaxLength(2048)
  telegram: string;

  @IsUrl({ require_protocol: true }, { message: 'VK: укажите полный URL' })
  @MaxLength(2048)
  vk: string;

  @IsUrl({ require_protocol: true }, { message: 'MAX: укажите полный URL' })
  @MaxLength(2048)
  max: string;
}
