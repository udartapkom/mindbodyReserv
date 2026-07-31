import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { UserReadingProgress } from './entities/user-reading-progress.entity';
import { MaterialStatus } from './material.types';

export type ReadingProgressDto = {
  materialId: string;
  scrollRatio: number;
  updatedAt: string;
  material: {
    id: string;
    title: string;
    slug: string;
    tariffType: string;
    coverUrl: string | null;
    summary: string | null;
  } | null;
};

@Injectable()
export class ReadingProgressService {
  constructor(
    @InjectRepository(UserReadingProgress)
    private readonly progressRepo: Repository<UserReadingProgress>,
    @InjectRepository(Material)
    private readonly materialsRepo: Repository<Material>,
  ) {}

  async getOne(
    userId: string,
    materialId: string,
  ): Promise<ReadingProgressDto | null> {
    const row = await this.progressRepo.findOne({
      where: { userId, materialId },
      relations: ['material'],
    });
    if (!row) return null;
    return this.toDto(row);
  }

  async listRecent(
    userId: string,
    limit = 8,
  ): Promise<ReadingProgressDto[]> {
    const rows = await this.progressRepo.find({
      where: { userId },
      relations: ['material'],
      order: { updatedAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 20),
    });

    return rows
      .filter((row) => {
        const material = row.material;
        if (!material || material.status !== MaterialStatus.PUBLISHED) {
          return false;
        }
        return row.scrollRatio >= 0.05 && row.scrollRatio < 0.95;
      })
      .map((row) => this.toDto(row));
  }

  async upsert(
    userId: string,
    materialId: string,
    scrollRatio: number,
  ): Promise<ReadingProgressDto> {
    const material = await this.materialsRepo.findOne({
      where: { id: materialId },
    });
    if (!material || material.status !== MaterialStatus.PUBLISHED) {
      throw new NotFoundException('Материал не найден');
    }

    const clamped = Math.min(1, Math.max(0, scrollRatio));

    let row = await this.progressRepo.findOne({
      where: { userId, materialId },
    });

    if (!row) {
      row = this.progressRepo.create({
        userId,
        materialId,
        scrollRatio: clamped,
      });
    } else {
      row.scrollRatio = clamped;
    }

    const saved = await this.progressRepo.save(row);
    saved.material = material;
    return this.toDto(saved);
  }

  private toDto(row: UserReadingProgress): ReadingProgressDto {
    const material = row.material;
    return {
      materialId: row.materialId,
      scrollRatio: row.scrollRatio,
      updatedAt: row.updatedAt.toISOString(),
      material: material
        ? {
            id: material.id,
            title: material.title,
            slug: material.slug,
            tariffType: material.tariffType,
            coverUrl: material.coverUrl,
            summary: material.summary,
          }
        : null,
    };
  }
}
