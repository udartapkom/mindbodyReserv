import styles from './Toast.module.scss';

type ToastProps = {
    isVisible: boolean;
    message: string;
    variant?: 'info' | 'error';
};

export function Toast({ isVisible, message, variant = 'info' }: ToastProps) {
    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={[
                styles.toast,
                variant === 'error' ? styles.toast_error : '',
            ].join(' ')}
            role="status"
            aria-live="polite"
        >
            {message}
        </div>
    );
}
