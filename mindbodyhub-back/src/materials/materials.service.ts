import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TariffsService } from '../tariffs/tariffs.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material } from './entities/material.entity';
import {
  FREE_ACCESS_TYPE,
  MaterialStatus,
  REGISTERED_ACCESS_TYPE,
} from './material.types';
import {
  getAccessibleTariffTypes,
  isMaterialAccessible,
} from '../common/tariff/access.types';
import { normalizeBlocks, slugify } from './material.utils';

export type MaterialAccessOptions = {
  /** Explicit override (e.g. admin/debug query). Prefer userTariff for normal users. */
  forTariff?: string;
  userTariff?: string | null;
  isAuthenticated?: boolean;
};

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialsRepository: Repository<Material>,
    private readonly tariffsService: TariffsService,
  ) {}

  findAll(): Promise<Material[]> {
    return this.materialsRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  findPublished(): Promise<Material[]> {
    return this.materialsRepository.find({
      where: { status: MaterialStatus.PUBLISHED },
      order: { publishedAt: 'DESC', updatedAt: 'DESC' },
    });
  }

  /**
   * Published materials available for the current visitor:
   * - free — always
   * - registered — when authenticated
   * - paid — exact user.tariff only (no overlap between trial/popular/vip)
   */
  findPublishedForAccess(options: MaterialAccessOptions = {}): Promise<Material[]> {
    const types = getAccessibleTariffTypes({
      isAuthenticated: options.isAuthenticated,
      userTariff: options.forTariff?.trim() || options.userTariff,
    });

    return this.materialsRepository.find({
      where: {
        status: MaterialStatus.PUBLISHED,
        tariffType: In(types),
      },
      order: { publishedAt: 'DESC', updatedAt: 'DESC' },
    });
  }

  /** Strict shelf: only materials with this exact tariffType. */
  findPublishedExact(tariffType: string): Promise<Material[]> {
    return this.materialsRepository.find({
      where: {
        status: MaterialStatus.PUBLISHED,
        tariffType,
      },
      order: { publishedAt: 'DESC', updatedAt: 'DESC' },
    });
  }

  isAccessible(
    material: Material,
    options: MaterialAccessOptions = {},
  ): boolean {
    return isMaterialAccessible(material.tariffType, {
      isAuthenticated: options.isAuthenticated,
      userTariff: options.forTariff?.trim() || options.userTariff,
    });
  }

  findById(id: string): Promise<Material | null> {
    return this.materialsRepository.findOne({ where: { id } });
  }

  findBySlug(slug: string): Promise<Material | null> {
    return this.materialsRepository.findOne({ where: { slug } });
  }

  private async ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = slugify(base);
    let attempt = 0;

    while (true) {
      const candidate = attempt === 0 ? slug : `${slug}-${attempt + 1}`;
      const existing = await this.findBySlug(candidate);

      if (!existing || existing.id === excludeId) {
        return candidate;
      }

      attempt += 1;
    }
  }

  private async resolveTariffType(raw?: string | null): Promise<string> {
    const value = (raw ?? FREE_ACCESS_TYPE).trim() || FREE_ACCESS_TYPE;

    if (value === FREE_ACCESS_TYPE) {
      return FREE_ACCESS_TYPE;
    }

    if (value === REGISTERED_ACCESS_TYPE) {
      return REGISTERED_ACCESS_TYPE;
    }

    const tariff = await this.tariffsService.findByType(value);
    if (!tariff) {
      throw new BadRequestException(
        `Тариф с type="${value}" не найден. Выберите существующий тариф, free или registered.`,
      );
    }

    return tariff.type;
  }

  async create(data: CreateMaterialDto): Promise<Material> {
    const title = data.title.trim();
    const slug = await this.ensureUniqueSlug(data.slug?.trim() || title);
    const blocks = data.blocks !== undefined ? normalizeBlocks(data.blocks) : [];
    const tariffType = await this.resolveTariffType(data.tariffType);

    const material = this.materialsRepository.create({
      title,
      slug,
      tariffType,
      summary: data.summary?.trim() || null,
      coverUrl: data.coverUrl?.trim() || null,
      showMetadata: data.showMetadata !== false,
      blocks,
      status: MaterialStatus.DRAFT,
      publishedAt: null,
    });

    return this.materialsRepository.save(material);
  }

  async update(id: string, data: UpdateMaterialDto): Promise<Material> {
    const material = await this.findById(id);
    if (!material) {
      throw new NotFoundException('Материал не найден');
    }

    if (data.title !== undefined) {
      material.title = data.title.trim();
    }

    if (data.slug !== undefined) {
      const nextSlug = await this.ensureUniqueSlug(data.slug.trim(), id);
      const conflict = await this.findBySlug(nextSlug);
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Slug "${nextSlug}" уже занят`);
      }
      material.slug = nextSlug;
    }

    if (data.tariffType !== undefined) {
      material.tariffType = await this.resolveTariffType(data.tariffType);
    }

    if (data.summary !== undefined) {
      material.summary = data.summary?.trim() || null;
    }

    if (data.coverUrl !== undefined) {
      material.coverUrl = data.coverUrl?.trim() || null;
    }

    if (data.showMetadata !== undefined) {
      material.showMetadata = data.showMetadata;
    }

    if (data.blocks !== undefined) {
      material.blocks = normalizeBlocks(data.blocks);
    }

    return this.materialsRepository.save(material);
  }

  async publish(id: string): Promise<Material> {
    const material = await this.findById(id);
    if (!material) {
      throw new NotFoundException('Материал не найден');
    }

    material.status = MaterialStatus.PUBLISHED;
    material.publishedAt = material.publishedAt ?? new Date();
    return this.materialsRepository.save(material);
  }

  async unpublish(id: string): Promise<Material> {
    const material = await this.findById(id);
    if (!material) {
      throw new NotFoundException('Материал не найден');
    }

    material.status = MaterialStatus.DRAFT;
    return this.materialsRepository.save(material);
  }

  async remove(id: string): Promise<void> {
    const material = await this.findById(id);
    if (!material) {
      throw new NotFoundException('Материал не найден');
    }

    await this.materialsRepository.remove(material);
  }
}
