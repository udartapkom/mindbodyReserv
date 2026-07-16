import { Material } from './entities/material.entity';
import { MaterialBlock, MaterialStatus } from './material.types';

export type MaterialDto = {
  id: string;
  title: string;
  slug: string;
  status: MaterialStatus;
  tariffType: string;
  blocks: MaterialBlock[];
  coverUrl: string | null;
  summary: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toMaterialDto(material: Material): MaterialDto {
  return {
    id: material.id,
    title: material.title,
    slug: material.slug,
    status: material.status,
    tariffType: material.tariffType,
    blocks: material.blocks ?? [],
    coverUrl: material.coverUrl,
    summary: material.summary,
    publishedAt: material.publishedAt,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
  };
}
