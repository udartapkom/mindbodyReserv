import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTariffDto } from './dto/create-tariff.dto';
import {
  normalizeComparisonIncluded,
  UpdateTariffComparisonDto,
} from './dto/update-tariff-comparison.dto';
import { UpdateTariffDto } from './dto/update-tariff.dto';
import { TariffComparisonRow } from './entities/tariff-comparison-row.entity';
import { Tariff } from './entities/tariff.entity';

export type SeedTariffData = {
  type: string;
  title: string;
  titleColor?: string | null;
  price: string;
  priceAmount?: number;
  period: string;
  durationDays?: number;
  subTitle: string;
  description: string[];
  image: string;
  imageAlt: string;
  sortOrder: number;
};

export type SeedComparisonRowData = {
  feature: string;
  included: Record<string, boolean>;
  sortOrder: number;
};

@Injectable()
export class TariffsService {
  constructor(
    @InjectRepository(Tariff)
    private readonly tariffsRepository: Repository<Tariff>,
    @InjectRepository(TariffComparisonRow)
    private readonly comparisonRepository: Repository<TariffComparisonRow>,
  ) {}

  findAll(): Promise<Tariff[]> {
    return this.tariffsRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  findActive(): Promise<Tariff[]> {
    return this.tariffsRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  findById(id: string): Promise<Tariff | null> {
    return this.tariffsRepository.findOne({ where: { id } });
  }

  findByType(type: string): Promise<Tariff | null> {
    return this.tariffsRepository.findOne({ where: { type } });
  }

  count(): Promise<number> {
    return this.tariffsRepository.count();
  }

  findComparisonRows(): Promise<TariffComparisonRow[]> {
    return this.comparisonRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async replaceComparisonRows(
    data: UpdateTariffComparisonDto,
  ): Promise<TariffComparisonRow[]> {
    await this.comparisonRepository
      .createQueryBuilder()
      .delete()
      .from(TariffComparisonRow)
      .execute();

    const entities = data.rows.map((row, index) =>
      this.comparisonRepository.create({
        feature: row.feature.trim(),
        included: normalizeComparisonIncluded(row.included),
        sortOrder: row.sortOrder ?? index,
      }),
    );

    if (entities.length === 0) {
      return [];
    }

    return this.comparisonRepository.save(entities);
  }

  async create(data: CreateTariffDto): Promise<Tariff> {
    const existing = await this.findByType(data.type);
    if (existing) {
      throw new ConflictException(`Тариф с type="${data.type}" уже существует`);
    }

    const tariff = this.tariffsRepository.create({
      type: data.type,
      title: data.title,
      titleColor: data.titleColor ?? null,
      price: data.price,
      priceAmount: data.priceAmount ?? null,
      period: data.period,
      durationDays: data.durationDays ?? 30,
      subTitle: data.subTitle,
      description: data.description,
      image: data.image,
      imageAlt: data.imageAlt,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    });

    return this.tariffsRepository.save(tariff);
  }

  async update(id: string, data: UpdateTariffDto): Promise<Tariff> {
    const tariff = await this.findById(id);
    if (!tariff) {
      throw new NotFoundException('Тариф не найден');
    }

    if (data.type !== undefined && data.type !== tariff.type) {
      const existing = await this.findByType(data.type);
      if (existing) {
        throw new ConflictException(`Тариф с type="${data.type}" уже существует`);
      }
      tariff.type = data.type;
    }

    if (data.title !== undefined) tariff.title = data.title;
    if (data.titleColor !== undefined) tariff.titleColor = data.titleColor;
    if (data.price !== undefined) tariff.price = data.price;
    if (data.priceAmount !== undefined) tariff.priceAmount = data.priceAmount;
    if (data.period !== undefined) tariff.period = data.period;
    if (data.durationDays !== undefined) tariff.durationDays = data.durationDays;
    if (data.subTitle !== undefined) tariff.subTitle = data.subTitle;
    if (data.description !== undefined) tariff.description = data.description;
    if (data.image !== undefined) tariff.image = data.image;
    if (data.imageAlt !== undefined) tariff.imageAlt = data.imageAlt;
    if (data.sortOrder !== undefined) tariff.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) tariff.isActive = data.isActive;

    return this.tariffsRepository.save(tariff);
  }

  async setActive(id: string, isActive: boolean): Promise<Tariff> {
    const tariff = await this.findById(id);
    if (!tariff) {
      throw new NotFoundException('Тариф не найден');
    }

    tariff.isActive = isActive;
    return this.tariffsRepository.save(tariff);
  }

  async remove(id: string): Promise<void> {
    const tariff = await this.findById(id);
    if (!tariff) {
      throw new NotFoundException('Тариф не найден');
    }

    await this.tariffsRepository.remove(tariff);
  }

  async seedIfEmpty(items: SeedTariffData[]): Promise<number> {
    const existingCount = await this.count();
    if (existingCount > 0) {
      return 0;
    }

    const entities = items.map((item) =>
      this.tariffsRepository.create({
        type: item.type,
        title: item.title,
        titleColor: item.titleColor ?? null,
        price: item.price,
        priceAmount: item.priceAmount ?? null,
        period: item.period,
        durationDays: item.durationDays ?? 30,
        subTitle: item.subTitle,
        description: item.description,
        image: item.image,
        imageAlt: item.imageAlt,
        sortOrder: item.sortOrder,
        isActive: true,
      }),
    );

    await this.tariffsRepository.save(entities);
    return entities.length;
  }

  async seedComparisonIfEmpty(items: SeedComparisonRowData[]): Promise<number> {
    const existingCount = await this.comparisonRepository.count();
    if (existingCount > 0) {
      return 0;
    }

    const entities = items.map((item) =>
      this.comparisonRepository.create({
        feature: item.feature,
        included: item.included,
        sortOrder: item.sortOrder,
      }),
    );

    await this.comparisonRepository.save(entities);
    return entities.length;
  }
}
