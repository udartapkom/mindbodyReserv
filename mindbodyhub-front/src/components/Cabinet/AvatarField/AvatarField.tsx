'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getDisplayName } from '@/utils/user';
import styles from './AvatarField.module.scss';

type AvatarFieldProps = {
  onError?: (message: string) => void;
};

function AvatarField({ onError }: AvatarFieldProps) {
  const { user, uploadAvatar } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const displaySrc = preview ?? user?.avatarUrl ?? user?.avatar ?? null;
  const displayName = getDisplayName(user);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return objectUrl;
    });

    setIsUploading(true);

    try {
      await uploadAvatar(file);
      setPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Не удалось загрузить аватар';

      onError?.(message);
      setPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className={styles.avatarField}>
      <span className={styles.avatarField__label}>Аватар</span>
      <div className={styles.avatarField__content}>
        <div className={styles.avatarField__preview}>
          {displaySrc ? (
            <img
              src={displaySrc}
              alt={displayName}
              className={styles.avatarField__image}
            />
          ) : (
            <div className={styles.avatarField__placeholder} />
          )}
        </div>
        <div className={styles.avatarField__actions}>
          <input
            ref={inputRef}
            type="file"
            id="avatar"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            className={styles.avatarField__input}
            onChange={(event) => void handleChange(event)}
            disabled={isUploading}
          />
          <button
            type="button"
            className={styles.avatarField__button}
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Загрузка…' : 'Выбрать фото'}
          </button>
          <p className={styles.avatarField__hint}>JPG, PNG или WebP до 4 МБ</p>
        </div>
      </div>
    </div>
  );
}

export default AvatarField;
