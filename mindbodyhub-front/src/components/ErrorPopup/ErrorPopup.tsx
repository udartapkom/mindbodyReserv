import { IconName, IconVariant } from '@/shared/ui/Icon/types';
import styles from './ErrorPopup.module.scss';
import { Icon } from '@/shared/ui/Icon/Icon';

type ErrorPopupTone = 'error' | 'success' | 'info';

interface IErrorPopupProps {
    title: string;
    description: string;
    icon: IconName;
    variant?: IconVariant;
    tone?: ErrorPopupTone;
    submit?: () => void;
}

function ErrorPopup({
    title,
    description,
    icon,
    variant,
    tone = 'error',
    submit,
}: IErrorPopupProps) {
    const handleSubmit = () => {
        if (submit) {
            submit();
        }
    };

    const iconClassName = [
        styles.errorPopup__icon,
        tone === 'success' ? styles.errorPopup__icon_success : '',
        tone === 'info' ? styles.errorPopup__icon_info : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={styles.errorPopup}>
            <Icon name={icon} variant={variant} className={iconClassName} />
            {/* <h2 className={styles.errorPopup__title}>{title}</h2> */}
            {description && <p className={styles.errorPopup__description}>{description}</p>}
            {submit && (
                <button type="button" className={styles.errorPopup__button} onClick={handleSubmit}>
                    OK
                </button>
            )}
        </div>
    );
}

export default ErrorPopup;
