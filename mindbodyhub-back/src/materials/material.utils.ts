import { BadRequestException } from '@nestjs/common';
import {
  MaterialBlock,
  MaterialBlockType,
} from './material.types';

const BLOCK_TYPES: MaterialBlockType[] = [
  'heading',
  'subheading',
  'paragraph',
  'image',
  'list',
  'quote',
  'link',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeListItems(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === 'string' ? item : ''))
    .filter((item) => item.trim().length > 0);
}

export function normalizeBlocks(raw: unknown): MaterialBlock[] {
  if (!Array.isArray(raw)) {
    throw new BadRequestException('blocks must be an array');
  }

  return raw.map((item, index) => {
    if (!isRecord(item)) {
      throw new BadRequestException(`blocks[${index}] must be an object`);
    }

    const id = typeof item.id === 'string' ? item.id.trim() : '';
    const type = item.type;

    if (!id) {
      throw new BadRequestException(`blocks[${index}].id is required`);
    }

    if (typeof type !== 'string' || !BLOCK_TYPES.includes(type as MaterialBlockType)) {
      throw new BadRequestException(
        `blocks[${index}].type must be one of: ${BLOCK_TYPES.join(', ')}`,
      );
    }

    if (type === 'image') {
      const key = typeof item.key === 'string' ? item.key.trim() : '';
      const url = typeof item.url === 'string' ? item.url.trim() : '';
      const alt = typeof item.alt === 'string' ? item.alt.trim() : '';
      const showAlt = item.showAlt !== false;

      if (!key || !url) {
        throw new BadRequestException(
          `blocks[${index}] image requires key and url`,
        );
      }

      return { id, type: 'image', key, url, alt, showAlt };
    }

    if (type === 'link') {
      const text = typeof item.text === 'string' ? item.text.trim() : '';
      const url = typeof item.url === 'string' ? item.url.trim() : '';

      if (!url) {
        throw new BadRequestException(`blocks[${index}] link requires url`);
      }

      return { id, type: 'link', text: text || url, url };
    }

    if (type === 'list') {
      const style = item.style === 'ol' ? 'ol' : 'ul';
      if (!Array.isArray(item.items)) {
        throw new BadRequestException(
          `blocks[${index}] list requires items array`,
        );
      }
      const items = normalizeListItems(item.items);
      return { id, type: 'list', style, items };
    }

    if (type === 'quote') {
      const text = typeof item.text === 'string' ? item.text : '';
      const variant = item.variant === 'callout' ? 'callout' : 'quote';
      return { id, type: 'quote', text, variant };
    }

    const text = typeof item.text === 'string' ? item.text : '';

    if (type === 'heading') {
      return { id, type: 'heading', text };
    }

    if (type === 'subheading') {
      const level = item.level === 2 ? 2 : 3;
      return { id, type: 'subheading', text, level };
    }

    return { id, type: 'paragraph', text };
  });
}

export function slugify(value: string): string {
  const map: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  };

  const lower = value.trim().toLowerCase();
  let result = '';

  for (const char of lower) {
    if (map[char] !== undefined) {
      result += map[char];
      continue;
    }

    if (/[a-z0-9]/.test(char)) {
      result += char;
      continue;
    }

    if (/\s|-|_/.test(char)) {
      result += '-';
    }
  }

  return result.replace(/-+/g, '-').replace(/^-|-$/g, '') || 'material';
}
