import { IsIn, IsString } from 'class-validator';
import { PAID_TARIFF_LADDER } from '../../common/tariff/access.types';

export class CreatePaymentDto {
  @IsString()
  @IsIn([...PAID_TARIFF_LADDER], {
    message: `tariffType must be one of: ${PAID_TARIFF_LADDER.join(', ')}`,
  })
  tariffType: (typeof PAID_TARIFF_LADDER)[number];
}
