import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TariffsService } from '../tariffs/tariffs.service';

const DEFAULT_TARIFFS = [
  {
    type: 'trial',
    image: '/images/brain.png',
    imageAlt: 'Философия и самопознание',
    title: 'Пробный',
    price: '99₽',
    period: '/ неделя',
    titleColor: '#B1AEAF',
    subTitle: 'Философия',
    description: [
      'Доступ к мыслям и заметкам',
      'Еженедельные инсайты',
      'Цитаты',
    ],
    sortOrder: 0,
  },
  {
    type: 'popular',
    image: '/images/love.png',
    imageAlt: 'Отношения и сексуальная психология',
    title: 'Популярный',
    titleColor: '#3b82f6',
    price: '999₽',
    period: '/ месяц',
    subTitle: 'Отношения & секс',
    description: [
      'Решение проблем в отношениях',
      'Сексуальная психология',
      'Преодоление стеснения',
      'Личные границы',
    ],
    sortOrder: 1,
  },
  {
    type: 'vip',
    image: '/images/business.png',
    imageAlt: 'Ментальное здоровье и психология бизнеса',
    title: 'VIP',
    price: '3000₽',
    period: '/ месяц',
    subTitle: 'Ментальные проблемы & бизнес',
    titleColor: '#FF6700',
    description: [
      'Ментальное здоровье',
      'Психология бизнеса',
      'Управление стрессом',
      'Продуктивность и фокус',
      'Личные консультации',
    ],
    sortOrder: 2,
  },
];

@Injectable()
export class TariffsSeedService implements OnModuleInit {
  private readonly logger = new Logger(TariffsSeedService.name);

  constructor(private readonly tariffsService: TariffsService) {}

  async onModuleInit(): Promise<void> {
    const created = await this.tariffsService.seedIfEmpty(DEFAULT_TARIFFS);
    if (created > 0) {
      this.logger.log(`Tariffs seed: created ${created} tariffs`);
    } else {
      this.logger.log('Tariffs seed skipped: tariffs already exist');
    }
  }
}
