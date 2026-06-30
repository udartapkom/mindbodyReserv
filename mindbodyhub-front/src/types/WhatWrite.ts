import type { IconName } from '@/shared/ui/Icon';

export type WhatWrite = {
    id: number;
    title: string;
    description: string;
    icon: IconName;
    color?: string;
};