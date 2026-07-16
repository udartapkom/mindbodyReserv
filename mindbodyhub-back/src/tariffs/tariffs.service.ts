import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { UpdateTariffDto } from './dto/update-tariff.dto';
import { Tariff } from './entities/tariff.entity';

export type SeedTariffData = {
  type: string;
  title: string;
  titleColor?: string | null;
  price: string;
  period: string;
  subTitle: string;
  description: string[];
  image: string;
  imageAlt: string;
  sortOrder: number;
};

@Injectable()
export class TariffsService {
  constructor(
    @InjectRepository(Tariff)
    private readonly tariffsRepository: Repository<Tariff>,
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
      period: data.period,
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
    if (data.period !== undefined) tariff.period = data.period;
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
        period: item.period,
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
}
