'use client';

import styles from './Popup.module.scss';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface IPopupProps {
    title: string;
    description?: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: () => void;
    children: React.ReactNode;
}

const TRANSITION_MS = 300;

function Popup({
    title,
    isOpen,
    onClose,
    children,
}: IPopupProps) {
    const [mounted, setMounted] = useState(false);
    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setMounted(true);
        setPortalElement(document.body);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setIsVisible(false);

            const timer = window.setTimeout(() => {
                setShouldRender(false);
            }, TRANSITION_MS);

            return () => window.clearTimeout(timer);
        }

        setShouldRender(true);
        setIsVisible(false);
    }, [isOpen]);

    useEffect(() => {
        if (!shouldRender || !isOpen) {
            return;
        }

        let frame1 = 0;
        let frame2 = 0;

        frame1 = window.requestAnimationFrame(() => {
            frame2 = window.requestAnimationFrame(() => {
                setIsVisible(true);
            });
        });

        return () => {
            window.cancelAnimationFrame(frame1);
            window.cancelAnimationFrame(frame2);
        };
    }, [shouldRender, isOpen]);

    if (!mounted || !portalElement || !shouldRender) {
        return null;
    }

    return createPortal(
        <section
            className={`${styles.popup} ${isVisible ? styles.popup_opened : ''}`}
            aria-modal="true"
            role="dialog"
            aria-label={title}
            onClick={onClose}
        >
            <div
                className={styles.popup__content}
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className={styles.popup__close}
                    onClick={onClose}
                    aria-label="Закрыть"
                    title="Закрыть"
                />
                {children}
            </div>
        </section>,
        portalElement,
    );
}

export default Popup;
