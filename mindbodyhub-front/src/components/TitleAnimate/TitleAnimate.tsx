'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './TitleAnimate.module.scss';

const TITLE_PHRASES = [
    'Тебе нужны психологи?',
    'Тебе нужны психиатры?',
] as const;

const PRONOUNS = ['тебе', 'ей', 'ему', 'им', 'вам'] as const;

const FINAL_STEP = 2;

const SEO_HEADING =
    'Психологи и психиатры онлайн — MindBodyHub. Тебе нужны мы';

const INITIAL_PAUSE_MS = 4000;
const STEP_PAUSE_MS = 3000;
const FADE_MS = 450;

function TitleAnimate() {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);
    const [pronounIndex, setPronounIndex] = useState(0);
    const [pronounVisible, setPronounVisible] = useState(true);
    const [reducedMotion, setReducedMotion] = useState(false);
    const fadeTimerRef = useRef<number | null>(null);
    const pronounFadeTimerRef = useRef<number | null>(null);

    const isFinal = step >= FINAL_STEP;

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);

        updateReducedMotion();
        mediaQuery.addEventListener('change', updateReducedMotion);

        return () => mediaQuery.removeEventListener('change', updateReducedMotion);
    }, []);

    useEffect(() => {
        if (reducedMotion) {
            setStep(FINAL_STEP);
            setVisible(true);
            return;
        }

        if (isFinal) return;

        const pauseMs = step === 0 ? INITIAL_PAUSE_MS : STEP_PAUSE_MS;

        const pauseTimer = window.setTimeout(() => {
            setVisible(false);

            fadeTimerRef.current = window.setTimeout(() => {
                setStep((current) => current + 1);
                setVisible(true);
            }, FADE_MS);
        }, pauseMs);

        return () => {
            window.clearTimeout(pauseTimer);
            if (fadeTimerRef.current !== null) {
                window.clearTimeout(fadeTimerRef.current);
                fadeTimerRef.current = null;
            }
        };
    }, [step, reducedMotion, isFinal]);

    useEffect(() => {
        if (reducedMotion) return;

        const pauseMs = pronounIndex === 0 ? INITIAL_PAUSE_MS : STEP_PAUSE_MS;

        const pauseTimer = window.setTimeout(() => {
            setPronounVisible(false);

            pronounFadeTimerRef.current = window.setTimeout(() => {
                setPronounIndex((current) => (current + 1) % PRONOUNS.length);
                setPronounVisible(true);
            }, FADE_MS);
        }, pauseMs);

        return () => {
            window.clearTimeout(pauseTimer);
            if (pronounFadeTimerRef.current !== null) {
                window.clearTimeout(pronounFadeTimerRef.current);
                pronounFadeTimerRef.current = null;
            }
        };
    }, [pronounIndex, reducedMotion]);

    const titleVisual = isFinal ? (
        <>
            Тебе нужны <span className={styles.brandWord}>мы</span>.
        </>
    ) : (
        TITLE_PHRASES[step]
    );

    return (
        <section className={styles.titleAnimate} aria-labelledby="hero-heading">
            <div className={styles.content}>
                <h1 id="hero-heading" className={styles.title}>
                    <span className={styles.srOnly}>{SEO_HEADING}</span>
                    <span
                        className={`${styles.titleVisual} ${visible ? '' : styles.titleVisualHidden}`}
                        aria-hidden="true"
                    >
                        {titleVisual}
                    </span>
                </h1>
                <p className={styles.subtitle}>
                    <span className={styles.srOnly}>
                        Мы поможем разобраться с вашими запросами.
                    </span>
                    <span aria-hidden="true">
                        Мы{' '}
                        <span
                            className={`${styles.pronoun} ${pronounVisible ? '' : styles.pronounHidden}`}
                        >
                            {PRONOUNS[pronounIndex]}
                        </span>{' '}
                        поможем
                    </span>
                </p>
            </div>
        </section>
    );
}

export default TitleAnimate;
