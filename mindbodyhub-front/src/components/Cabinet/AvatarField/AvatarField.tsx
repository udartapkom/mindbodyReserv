'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './AvatarField.module.scss';

function AvatarField() {
    const { user } = useAuth();
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const displaySrc = preview ?? user?.avatar ?? null;
    const displayName = user?.name?.trim() || user?.phone || 'Аватар';

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return objectUrl;
        });
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
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        className={styles.avatarField__button}
                        onClick={() => inputRef.current?.click()}
                    >
                        Выбрать фото
                    </button>
                    <p className={styles.avatarField__hint}>JPG, PNG или WebP</p>
                </div>
            </div>
        </div>
    );
}

export default AvatarField;
